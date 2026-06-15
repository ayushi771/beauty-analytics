from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import math
import re
from sentence_transformers import SentenceTransformer
from huggingface_hub import hf_hub_download
# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "processed"
REVIEWS_FILE = hf_hub_download(
    repo_id="ayuayuaayu/sephora-data",
    filename="reviews_processed.csv",
    repo_type="dataset"
)

PRODUCTS_FILE = hf_hub_download(
    repo_id="ayuayuaayu/sephora-data",
    filename="products_processed.csv",
    repo_type="dataset"
)

# ==================================================
# GLOBAL CACHE
# ==================================================

_reviews_df = None
_products_df = None
_product_lookup = {}
_reviews_by_product = {}
_unique_products = None

# ==================================================
# SEMANTIC SEARCH CACHE
# ==================================================

PRODUCTS = []
_product_name_vecs = None
_brand_name_vecs = None       # NEW: precomputed brand embeddings
_model = None

# =========================================================
# TAXONOMY
# =========================================================

CATEGORY_HIERARCHY = {
    "fragrance": [
        "fragrance", "perfume", "cologne", "perfume gift sets",
        "rollerballs & travel size", "candles", "diffusers",
        "candles & home scents"
    ],
    "skincare": [
        "skincare", "moisturizers", "cleansers", "treatments",
        "eye care", "sunscreen", "masks", "face"
    ],
    "bodycare": [
        "body care", "body moisturizers", "bath & body",
        "body lotions & body oils"
    ],
    "hair": [
        "hair", "hair styling & treatments",
        "shampoo & conditioner", "hair masks", "hair tools"
    ],
    "makeup": [
        "makeup", "lip", "eye", "cheek", "makeup palettes",
        "brushes & applicators"
    ],
    "men": ["men", "shaving", "deodorant & antiperspirant"],
    "women": ["women"],
}

# Flat set of all category keywords for fast lookup
_ALL_CATEGORY_KEYWORDS = {
    kw for keywords in CATEGORY_HIERARCHY.values() for kw in keywords
}


def _get_model() -> Optional[SentenceTransformer]:
    global _model
    if _model is None:
        try:
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"⚠️  Warning: Failed to load SentenceTransformer model: {e}")
            print("   Semantic search will be unavailable. Basic search will still work.")
            _model = None
    return _model


def normalize(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def detect_category(query: str):
    q = normalize(query)
    for main_cat, keywords in CATEGORY_HIERARCHY.items():
        for k in keywords:
            if k in q:
                return main_cat
    return None


def _is_category_query(query: str) -> bool:
    """Returns True if the query is primarily a category/type search."""
    q = normalize(query)
    return any(k in q for k in _ALL_CATEGORY_KEYWORDS)


def _is_brand_query(query: str) -> bool:
    """Returns True if the query closely matches a known brand name."""
    load_data()
    q = normalize(query)
    if "brand_name" not in _products_df.columns:
        return False
    brands = _products_df["brand_name"].astype(str).str.lower().unique()
    for b in brands:
        b_norm = normalize(b)
        if q == b_norm or q in b_norm or b_norm in q:
            return True
    return False


def ensure_loaded():
    load_data()


def get_reviews_df_by_product(product_id: str):
    load_data()
    return _reviews_by_product.get(str(product_id).strip())


def _catalog_reviews_count(p: dict) -> int:
    val = p.get("reviews", 0)
    try:
        return int(float(val)) if val not in (None, "", "nan") else 0
    except (ValueError, TypeError):
        return 0


def _popularity_multiplier(catalog_rc: int, review_count: int) -> float:
    """
    Log-scaled popularity bonus in range [1.0, 1.5].
    Uses whichever count is higher. This way popular products rank
    higher among equally-relevant results but can NEVER outrank a
    much more relevant product.
    """
    best = max(catalog_rc, review_count)
    if best <= 0:
        return 1.0
    # log10(1)=0, log10(100)=2, log10(10000)=4, log10(100000)=5
    return 1.0 + min(0.5, math.log10(best + 1) / 10.0)


# ==================================================
# LOAD DATA
# ==================================================

def load_data():
    global _reviews_df, _products_df, _product_lookup
    global _reviews_by_product, _unique_products
    global PRODUCTS, _product_name_vecs, _brand_name_vecs

    if _reviews_df is not None:
        return

    print("Loading processed datasets...")

    _reviews_df = pd.read_csv(REVIEWS_FILE, low_memory=False)
    _products_df = pd.read_csv(PRODUCTS_FILE, low_memory=False)

    if "product_id" in _reviews_df.columns:
        _reviews_df["product_id"] = _reviews_df["product_id"].astype(str).str.strip()
    if "product_id" in _products_df.columns:
        _products_df["product_id"] = _products_df["product_id"].astype(str).str.strip()

    print(f"Reviews Loaded: {_reviews_df.shape}")
    print(f"Products Loaded: {_products_df.shape}")

    # Product Lookup Dictionary
    _product_lookup = {}
    for _, row in _products_df.iterrows():
        product_id = str(row.get("product_id", "")).strip()
        item = {k: (None if pd.isna(v) else v) for k, v in row.to_dict().items()}
        _product_lookup[product_id] = item

    # Reviews Grouped By Product
    grouped = _reviews_df.groupby("product_id")
    _reviews_by_product = {
        str(pid).strip(): grp for pid, grp in grouped
    }

    # Unique Product Search Table
    if "product_name_lower" not in _reviews_df.columns and "product_name" in _reviews_df.columns:
        _reviews_df["product_name_lower"] = (
            _reviews_df["product_name"].astype(str).str.lower().str.strip()
        )

    _unique_products = (
        _reviews_df[["product_id", "product_name", "brand_name", "product_name_lower"]]
        .drop_duplicates()
        .reset_index(drop=True)
    )

    print(f"Searchable Products: {len(_unique_products):,}")

    # Build PRODUCTS list — include 'reviews' (catalog count) and 'category'
    cols = [
        c for c in ["product_id", "product_name", "brand_name", "category", "reviews"]
        if c in _products_df.columns
    ]
    temp = _products_df[cols].copy() if cols else pd.DataFrame()
    for col in ["product_id", "product_name", "brand_name", "category"]:
        if col not in temp.columns:
            temp[col] = ""
    if "reviews" not in temp.columns:
        temp["reviews"] = 0

    PRODUCTS = temp.fillna("").to_dict(orient="records")

    model = _get_model()
    names = [p.get("product_name", "") for p in PRODUCTS]
    brands = [p.get("brand_name", "") for p in PRODUCTS]

    if model is None or len(names) == 0:
        _product_name_vecs = np.zeros((0, 384), dtype=np.float32) if len(names) == 0 else np.zeros((len(names), 384), dtype=np.float32)
        _brand_name_vecs = np.zeros((0, 384), dtype=np.float32) if len(names) == 0 else np.zeros((len(brands), 384), dtype=np.float32)
        if model is None:
            print("Skipping semantic search encoding due to model unavailability.")
    else:
        print("Encoding product names...")
        _product_name_vecs = model.encode(
            names, convert_to_numpy=True, normalize_embeddings=True
        )
        print("Encoding brand names...")
        _brand_name_vecs = model.encode(
            brands, convert_to_numpy=True, normalize_embeddings=True
        )

    print("Data loading complete.")


# ==================================================
# DATAFRAMES
# ==================================================

def get_reviews_df():
    load_data()
    return _reviews_df


def get_products_df():
    load_data()
    return _products_df


def get_all_brands():
    load_data()
    if "brand_name" not in _products_df.columns:
        return []
    return sorted(
        _products_df["brand_name"]
        .astype(str).str.strip()
        .replace("nan", "").replace("None", "")
        .dropna()
        .loc[lambda s: s.str.len() > 0]
        .unique().tolist()
    )


def search_brands(query: str, top_n: int = 10):
    load_data()
    q = normalize(query)
    if len(q) < 2 or "brand_name" not in _products_df.columns:
        return []

    matches = (
        _products_df[
            _products_df["brand_name"].astype(str).str.lower()
            .str.contains(q, regex=False, na=False)
        ]
        .groupby("brand_name").size()
        .reset_index(name="product_count")
        .sort_values("product_count", ascending=False)
        .head(top_n)
    )

    return [
        {"brand_name": row["brand_name"], "product_count": int(row["product_count"]), "result_type": "brand"}
        for _, row in matches.iterrows()
    ]


def search_all(query: str, top_n: int = 10):
    return {
        "products": search_products(query=query, top_n=top_n),
        "brands": search_brands(query=query, top_n=10),
    }


def get_brand_products(brand_name: str, limit: int = 5):
    load_data()

    if _products_df is None:
        return []

    if "brand_name" not in _products_df.columns:
        return []

    brand_query = str(brand_name).strip().lower()

    if not brand_query:
        return []

    filtered = _products_df[
        _products_df["brand_name"]
        .astype(str)
        .str.lower()
        .str.contains(
            brand_query,
            regex=False,
            na=False
        )
    ].copy()

    if filtered.empty:
        return []

    # Products having review text
    review_product_ids = set(
        _reviews_df["product_id"]
        .astype(str)
        .unique()
    )

    filtered["has_reviews"] = (
        filtered["product_id"]
        .astype(str)
        .isin(review_product_ids)
    )

    filtered["catalog_reviews_count"] = (
        pd.to_numeric(
            filtered["reviews"],
            errors="coerce"
        )
        .fillna(0)
        .astype(int)
    )

    filtered = filtered.sort_values(
        by=[
            "has_reviews",
            "catalog_reviews_count"
        ],
        ascending=[
            False,
            False
        ]
    )

    cols = [
        "product_id",
        "product_name",
        "brand_name",
        "catalog_reviews_count",
        "has_reviews"
    ]

    return (
        filtered[cols]
        .head(limit)
        .fillna("")
        .to_dict(orient="records")
    )


# ==================================================
# CORE SEARCH — relevance-first, popularity as tie-breaker
# ==================================================

def search_products(query: str, top_n: int = 10):
    load_data()

    q = query.strip()
    if len(q) < 2:
        return []

    q_norm = normalize(q)
    detected_category = detect_category(q)
    is_cat_query = _is_category_query(q)

    model = _get_model()
    # If model is unavailable, use zero vector for similarity (will rely on text matching)
    if model is not None:
        q_vec = model.encode([q], convert_to_numpy=True, normalize_embeddings=True)[0]
        name_sims = _product_name_vecs @ q_vec if _product_name_vecs is not None and len(_product_name_vecs) > 0 else np.zeros(len(PRODUCTS))
        brand_sims = _brand_name_vecs @ q_vec if _brand_name_vecs is not None and len(_brand_name_vecs) > 0 else np.zeros(len(PRODUCTS))
    else:
        name_sims = np.zeros(len(PRODUCTS))
        brand_sims = np.zeros(len(PRODUCTS))

    # Vectorised similarity against all product names and brand names
    scored = []

    for i, p in enumerate(PRODUCTS):
        product_name_norm = normalize(p.get("product_name", ""))
        brand_norm = normalize(p.get("brand_name", ""))
        category_norm = normalize(p.get("category", ""))

        # ── 1. BASE RELEVANCE SCORE ──────────────────────────────────────
        # We pick the best signal: name similarity or brand similarity
        name_sim = float(name_sims[i]) if i < len(name_sims) else 0.0
        brand_sim = float(brand_sims[i]) if i < len(brand_sims) else 0.0

        # ── 2. EXACT / SUBSTRING BOOSTS ──────────────────────────────────

        # Brand exact match: highest priority boost
        brand_exact = (q_norm == brand_norm)
        brand_substring = (not brand_exact) and (q_norm in brand_norm or brand_norm in q_norm)
        brand_word_overlap = False
        if not brand_exact and not brand_substring:
            q_words = set(q_norm.split())
            b_words = set(brand_norm.split())
            brand_word_overlap = bool(q_words & b_words)

        # Product name substring match
        name_exact = (q_norm == product_name_norm)
        name_substring = (not name_exact) and (q_norm in product_name_norm)
        name_word_overlap = False
        if not name_exact and not name_substring:
            q_words = set(q_norm.split())
            n_words = set(product_name_norm.split())
            overlap = q_words & n_words
            name_word_overlap = len(overlap) / max(len(q_words), 1) if overlap else 0.0
        else:
            name_word_overlap = 0.0

        # Category match
        cat_match = False
        if detected_category:
            allowed = CATEGORY_HIERARCHY.get(detected_category, [])
            cat_match = any(k in category_norm for k in allowed)

        # ── 3. COMPUTE FINAL RELEVANCE SCORE ─────────────────────────────
        if brand_exact:
            # Query IS a brand name → brand products, ranked by name sim
            relevance = 0.60 + name_sim * 0.40

        elif brand_substring or brand_word_overlap:
            # Partial brand match
            brand_boost = 0.35 if brand_substring else 0.20
            relevance = brand_sim * 0.50 + name_sim * 0.20 + brand_boost

        elif name_exact:
            relevance = 1.0

        elif name_substring:
            # How much of the product name is covered?
            coverage = len(q_norm) / max(len(product_name_norm), 1)
            relevance = 0.70 + coverage * 0.20 + name_sim * 0.10

        elif isinstance(name_word_overlap, float) and name_word_overlap > 0:
            relevance = 0.40 + name_word_overlap * 0.30 + name_sim * 0.10

        elif is_cat_query and cat_match:
            # Pure category query (e.g. "hair mask", "skincare")
            relevance = 0.50 + name_sim * 0.30

        else:
            # Pure semantic fallback
            relevance = name_sim * 0.60 + brand_sim * 0.20

        # Category boost on top (applies to all paths)
        if cat_match:
            relevance += 0.15

        # ── 4. POPULARITY MULTIPLIER (tie-breaker, NOT rank-flipper) ─────
        pid = str(p.get("product_id", "")).strip()
        review_count = len(_reviews_by_product[pid]) if pid in _reviews_by_product else 0
        catalog_rc = _catalog_reviews_count(p)
        has_reviews = review_count > 0

        final_score = relevance * _popularity_multiplier(catalog_rc, review_count)

        scored.append((final_score, relevance, p, has_reviews, review_count, catalog_rc))

    # Sort purely by final_score (relevance × popularity). No tuple hacks.
    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            "product_id":            str(p.get("product_id", "")),
            "product_name":          p.get("product_name", ""),
            "brand_name":            p.get("brand_name", ""),
            "match_score":           round(float(final_score), 4),
            "relevance_score":       round(float(relevance), 4),
            "has_reviews":           has_reviews,
            "review_count":          int(review_count),
            "catalog_reviews_count": catalog_rc,
            "result_type":           "product",
        }
        for final_score, relevance, p, has_reviews, review_count, catalog_rc
        in scored[:top_n]
    ]


def get_product_info(product_id: str):
    load_data()
    return _product_lookup.get(str(product_id).strip())


# ==================================================
# PRODUCT REVIEWS
# ==================================================

def get_product_reviews(product_id: str, limit: int = 500):
    load_data()
    pid = str(product_id).strip()
    df = _reviews_by_product.get(pid)
    if df is None:
        return []
    return df["review_text"].dropna().astype(str).tolist()[:limit]


# ==================================================
# SENTIMENT SUMMARY
# ==================================================

def get_sentiment_summary(product_id: str):
    load_data()
    pid = str(product_id).strip()
    df = _reviews_by_product.get(pid)
    if df is None:
        return {"positive": 0, "neutral": 0, "negative": 0}
    counts = df["sentiment"].value_counts().to_dict()
    total = len(df)
    return {
        "total_reviews": total,
        "positive": counts.get("positive", 0),
        "neutral": counts.get("neutral", 0),
        "negative": counts.get("negative", 0),
    }


if __name__ == "__main__":
    print("Testing Data Manager...")
    results = search_products("niacinamide")
    print(results[:3])
    if results:
        pid = results[0]["product_id"]
        print(get_product_info(pid))
        print(get_sentiment_summary(pid))
        print(len(get_product_reviews(pid)))

def get_products_df():
    """Return the full products DataFrame."""
    return _products_df       