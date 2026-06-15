from collections import Counter
import re
import pandas as pd

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

VADER = SentimentIntensityAnalyzer()

CUSTOM_LEXICON = {
    "holy grail": 3.0,
    "repurchase": 2.5,
    "glowing": 2.4,
    "radiant": 2.1,
    "hydrated": 1.8,
    "smooth": 1.5,
    "soft": 1.5,
    "breakout": -2.7,
    "irritated": -2.5,
    "burning": -2.5,
    "stinging": -2.3,
    "greasy": -1.8,
    "sticky": -1.6,
    "overpriced": -2.0,
    "disappointed": -2.5,
}
VADER.lexicon.update(CUSTOM_LEXICON)

ASPECT_KEYWORDS = {
    "texture": ["texture", "sticky", "smooth", "soft", "lightweight", "greasy", "thick", "thin"],
    "results": ["glow", "hydrated", "hydrating", "bright", "wrinkle", "effective", "works", "worked", "improved", "clear"],
    "price": ["price", "expensive", "cheap", "worth", "value", "cost", "overpriced"],
    "packaging": ["packaging", "jar", "pump", "bottle", "tube", "cap"],
    "scent": ["scent", "smell", "fragrance", "perfume", "odor"],
    "skin_reaction": ["breakout", "rash", "irritated", "redness", "allergic", "burning", "stinging", "sensitive"],
}

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but",
    "this", "that", "these", "those",
    "i", "me", "my", "mine",
    "it", "its", "is", "was", "are",
    "of", "for", "with", "to", "in",
    "on", "at", "from", "as", "have",
    "has", "had", "very", "really",
}
GENERIC_WORDS = {
    "skin", "product", "using", "use", "used",
    "like", "difference", "really", "also",
    "one", "make", "good", "great", "love",
}

# ── categories that trigger conditional breakdowns ──────────────────────────
_EYE_KEYWORDS  = ["eye", "mascara", "eyeliner", "eyeshadow", "lash", "brow"]
_HAIR_KEYWORDS = ["hair", "shampoo", "conditioner", "scalp", "curl", "strand"]


def _is_eye_product(product: dict) -> bool:
    cats = " ".join([
        str(product.get("primary_category", "")),
        str(product.get("secondary_category", "")),
        str(product.get("tertiary_category", "")),
        str(product.get("category", "")),
    ]).lower()
    return any(k in cats for k in _EYE_KEYWORDS)


def _is_hair_product(product: dict) -> bool:
    cats = " ".join([
        str(product.get("primary_category", "")),
        str(product.get("secondary_category", "")),
        str(product.get("tertiary_category", "")),
        str(product.get("category", "")),
    ]).lower()
    return any(k in cats for k in _HAIR_KEYWORDS)


def clean_text(text: str) -> str:
    text = str(text)
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"<.*?>", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def vader_compound(text: str) -> float:
    return float(VADER.polarity_scores(clean_text(text))["compound"])


def vader_label(text: str) -> str:
    c = vader_compound(text)
    if c >= 0.05:  return "positive"
    if c <= -0.05: return "negative"
    return "neutral"


# ==========================================================
# ASPECT SENTIMENT
# ==========================================================

def extract_aspect_sentiment(reviews):
    results = {}
    for aspect, keywords in ASPECT_KEYWORDS.items():
        scores = []
        for review in reviews:
            r = str(review).lower()
            if any(k in r for k in keywords):
                scores.append(VADER.polarity_scores(r)["compound"])

        if not scores:
            results[aspect] = {"mentions": 0, "positive": 0, "neutral": 0, "negative": 0}
            continue

        pos = sum(s >= 0.05 for s in scores)
        neg = sum(s <= -0.05 for s in scores)
        neu = len(scores) - pos - neg
        results[aspect] = {
            "mentions":  len(scores),
            "positive":  round(pos / len(scores) * 100, 2),
            "neutral":   round(neu / len(scores) * 100, 2),
            "negative":  round(neg / len(scores) * 100, 2),
        }
    return results


# ==========================================================
# TOP REVIEWS  (rating + helpfulness + vader)
# ==========================================================

def _review_display_text(row: dict) -> str:
    title = clean_text(row.get("review_title", "") or "")
    text  = clean_text(row.get("review_text",  "") or "")
    if title and text:
        return f"{title} — {text}"
    return text or title


def extract_top_reviews_from_df(reviews_df: pd.DataFrame, top_n: int = 5, min_len: int = 40):
    if reviews_df is None or len(reviews_df) == 0:
        return {"top_positive_reviews": [], "top_negative_reviews": []}

    df = reviews_df.copy()
    if "review_text"  not in df.columns: return {"top_positive_reviews": [], "top_negative_reviews": []}
    if "review_title" not in df.columns: df["review_title"] = ""
    if "rating"       not in df.columns: df["rating"] = None
    if "helpfulness"  not in df.columns: df["helpfulness"] = 0

    df["display_text"] = df.apply(lambda r: _review_display_text(r.to_dict()), axis=1)
    df["display_len"]  = df["display_text"].astype(str).str.len()
    df = df[df["display_len"] >= min_len].copy()
    if len(df) == 0:
        return {"top_positive_reviews": [], "top_negative_reviews": []}

    df["helpfulness_num"] = pd.to_numeric(df["helpfulness"], errors="coerce").fillna(0)
    df["vader_compound"]  = df["display_text"].astype(str).apply(vader_compound)

    pos_pool = df[df["rating"].isin([4, 5])].copy()
    neg_pool = df[df["rating"].isin([1, 2])].copy()
    if len(pos_pool) < top_n: pos_pool = df[df["vader_compound"] >= 0.05].copy()
    if len(neg_pool) < top_n: neg_pool = df[df["vader_compound"] <= -0.05].copy()

    if "rating" in pos_pool.columns:
        pos_pool["rating_num"] = pd.to_numeric(pos_pool["rating"], errors="coerce").fillna(0)
        pos_pool = pos_pool.sort_values(["rating_num", "helpfulness_num", "vader_compound"], ascending=[False, False, False])
    if "rating" in neg_pool.columns:
        neg_pool["rating_num"] = pd.to_numeric(neg_pool["rating"], errors="coerce").fillna(0)
        neg_pool = neg_pool.sort_values(["rating_num", "helpfulness_num", "vader_compound"], ascending=[True, False, True])

    def dedupe(texts):
        out, seen = [], set()
        for t in texts:
            k = str(t).strip().lower()
            if k and k not in seen:
                seen.add(k); out.append(t)
        return out

    return {
        "top_positive_reviews": dedupe(pos_pool["display_text"].head(top_n).tolist()),
        "top_negative_reviews": dedupe(neg_pool["display_text"].head(top_n).tolist()),
    }


# ==========================================================
# DEMOGRAPHIC BREAKDOWNS
# ==========================================================

def _positive_rate_by_col(df: pd.DataFrame, col: str) -> dict:
    """Generic helper: group by col, compute % positive sentiment."""
    if df is None or col not in df.columns or "sentiment" not in df.columns:
        return {}
    out = {}
    for val, grp in df.groupby(col):
        if len(grp) == 0:
            continue
        rate = round((grp["sentiment"] == "positive").mean() * 100, 1)
        out[str(val)] = {"positive_pct": rate, "count": int(len(grp))}
    return out


def analyze_skin_types(df: pd.DataFrame) -> dict:
    """Positive rate per skin_type (dry, oily, combination, normal, sensitive)."""
    return _positive_rate_by_col(df, "skin_type")


def analyze_skin_tones(df: pd.DataFrame) -> dict:
    """
    NEW — Positive rate per skin_tone.
    Especially valuable for foundation / complexion products.
    Returns e.g. {"fair": {"positive_pct": 91.0, "count": 23}, ...}
    """
    return _positive_rate_by_col(df, "skin_tone")


def analyze_eye_colors(df: pd.DataFrame) -> dict:
    """
    NEW — Positive rate per eye_color.
    Only called when product is in an Eye category.
    Returns e.g. {"brown": {"positive_pct": 88.0, "count": 12}, ...}
    """
    return _positive_rate_by_col(df, "eye_color")


def analyze_hair_colors(df: pd.DataFrame) -> dict:
    """
    NEW — Positive rate per hair_color.
    Only called when product is in a Hair category.
    Returns e.g. {"brunette": {"positive_pct": 76.0, "count": 9}, ...}
    """
    return _positive_rate_by_col(df, "hair_color")


# ==========================================================
# RATING + RECOMMENDATION
# ==========================================================

def rating_distribution(df: pd.DataFrame) -> dict:
    if df is None or "rating" not in df.columns:
        return {}
    counts = df["rating"].value_counts(normalize=True).sort_index() * 100
    return {str(int(k)): round(v, 1) for k, v in counts.items()}


def recommendation_rate(df: pd.DataFrame):
    """
    NEW — % of reviewers who explicitly recommended the product
    (is_recommended column). More reliable than star rating alone.
    """
    if df is None or "is_recommended" not in df.columns:
        return None
    rate = pd.to_numeric(df["is_recommended"], errors="coerce").dropna().mean()
    return round(rate * 100, 1)


def recommendation_score(df: pd.DataFrame):
    if df is None or len(df) == 0:
        return None
    if "sentiment" not in df.columns or "rating" not in df.columns:
        return None
    positive_rate = (df["sentiment"] == "positive").mean()
    avg_rating    = pd.to_numeric(df["rating"], errors="coerce").dropna().mean() / 5.0
    return round((positive_rate * 0.6 + avg_rating * 0.4) * 100, 1)


# ==========================================================
# SUMMARY TEXT
# ==========================================================

def generate_summary(analysis: dict) -> str:
    dist        = analysis.get("distribution", {})
    avg_rating  = analysis.get("avg_rating")
    review_count= analysis.get("review_count")
    parts = [
        f"Overall sentiment: {analysis.get('overall_sentiment', 'neutral')}.",
        f"Distribution: {dist.get('positive',0)}% positive, "
        f"{dist.get('neutral',0)}% neutral, {dist.get('negative',0)}% negative.",
    ]
    if avg_rating is not None and review_count is not None:
        parts.insert(0, f"Average rating: {avg_rating}/5 from {review_count} reviews.")
    if analysis.get("recommendation_score") is not None:
        parts.append(f"Recommendation score: {analysis['recommendation_score']}/100.")
    if analysis.get("recommendation_rate") is not None:
        parts.append(f"{analysis['recommendation_rate']}% of reviewers explicitly recommend this product.")
    return " ".join(parts)


# ==========================================================
# MAIN BATCH FUNCTION
# ==========================================================

def analyze_reviews_batch(
    reviews:     list,
    reviews_df:  pd.DataFrame = None,
    top_n_reviews: int = 5,
    product:     dict = None,          # NEW — pass product dict for conditional breakdowns
):
    if not reviews:
        return {}

    sample = reviews[:600]
    labels = [vader_label(r) for r in sample]
    total  = len(labels)
    pos    = labels.count("positive")
    neu    = labels.count("neutral")
    neg    = labels.count("negative")

    result = {
        "total_reviews_analyzed": len(sample),
        "overall_sentiment": max(Counter(labels), key=Counter(labels).get),
        "distribution": {
            "positive": round(pos / total * 100, 2),
            "neutral":  round(neu / total * 100, 2),
            "negative": round(neg / total * 100, 2),
        },
        "aspect_sentiment": extract_aspect_sentiment(sample),
    }

    if reviews_df is not None and len(reviews_df) > 0:
        result["review_count"] = int(len(reviews_df))

        if "rating" in reviews_df.columns:
            result["avg_rating"] = round(
                float(pd.to_numeric(reviews_df["rating"], errors="coerce").mean()), 2
            )

        result.update(extract_top_reviews_from_df(reviews_df, top_n=top_n_reviews))

        # ── always-on breakdowns ─────────────────────────────────────────────
        result["skin_type_breakdown"]  = analyze_skin_types(reviews_df)
        result["skin_tone_breakdown"]  = analyze_skin_tones(reviews_df)   # NEW
        result["rating_distribution"]  = rating_distribution(reviews_df)
        result["recommendation_score"] = recommendation_score(reviews_df)
        result["recommendation_rate"]  = recommendation_rate(reviews_df) 
        result["sentiment_over_time"] = sentiment_over_time(reviews_df)

        # ── conditional: eye products ────────────────────────────────────────
        if product and _is_eye_product(product):
            result["eye_color_breakdown"] = analyze_eye_colors(reviews_df)  # NEW
        else:
            result["eye_color_breakdown"] = {}

        # ── conditional: hair products ───────────────────────────────────────
        if product and _is_hair_product(product):
            result["hair_color_breakdown"] = analyze_hair_colors(reviews_df)  # NEW
        else:
            result["hair_color_breakdown"] = {}

    else:
        result["top_positive_reviews"] = []
        result["top_negative_reviews"] = []
        result["eye_color_breakdown"]  = {}
        result["hair_color_breakdown"] = {}

    result["summary"] = generate_summary(result)
    return result

def sentiment_over_time(df: pd.DataFrame) -> list:
    """
    Returns monthly sentiment percentages sorted by date.
    Handles both '2023-02-01' and '2023-03-21T07:18:52.000+00:00' formats.
    """
    if df is None or "sentiment" not in df.columns:
        return []

    # Find the date column — could be submission_time, SubmissionTime, date etc.
    date_col = next(
        (c for c in df.columns if "time" in c.lower() or "date" in c.lower() or "submission" in c.lower()),
        None
    )
    if date_col is None:
        return []

    df = df.copy()

    # Parse both formats safely
    df["_date"] = pd.to_datetime(df[date_col], errors="coerce", utc=True)
    df = df.dropna(subset=["_date"])

    if len(df) == 0:
        return []

    # Group by year-month
    df["_month"] = df["_date"].dt.to_period("M")

    grouped = df.groupby("_month")["sentiment"].value_counts(normalize=True).unstack(fill_value=0) * 100

    # Ensure all three columns exist
    for col in ["positive", "neutral", "negative"]:
        if col not in grouped.columns:
            grouped[col] = 0.0

    grouped = grouped.reset_index()
    grouped["_month_str"] = grouped["_month"].astype(str)   # "2023-02"

    # Only keep months with at least 5 reviews for reliability
    counts = df.groupby("_month").size()
    grouped["_count"] = grouped["_month"].map(counts).fillna(0)
    grouped = grouped[grouped["_count"] >= 5]

    return [
        {
            "month":    row["_month_str"],
            "positive": round(row["positive"], 1),
            "neutral":  round(row["neutral"],  1),
            "negative": round(row["negative"], 1),
            "count":    int(row["_count"]),
        }
        for _, row in grouped.sort_values("_month").iterrows()
    ]