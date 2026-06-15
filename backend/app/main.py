from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .ingredient_analyzer import analyze_ingredients
from .data_manager import (
    load_data,
    search_products,
    search_brands,
    search_all,
    get_all_brands,
    get_brand_products,
    get_product_info,
    get_product_reviews,
    get_reviews_df_by_product,
    get_reviews_df,
)
from .sentiment_engine import analyze_reviews_batch
from .insights import ai_style_insights_from_catalog, catalog_summary_text
from .groq_insights import generate_single_summary
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="Sephora Sentiment API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_executor = ThreadPoolExecutor(max_workers=4)


@app.on_event("startup")
def startup():
    print("\nLoading datasets...")
    load_data()
    print("Backend Ready\n")


# ==========================================================
# ROOT / HEALTH
# ==========================================================

@app.get("/")
def root():
    return {"message": "Sephora Sentiment Analysis API Running"}


@app.get("/health")
def health():
    df = get_reviews_df()
    return {"status": "ok", "reviews_loaded": len(df)}


# ==========================================================
# SEARCH  — products + brands unified
# ==========================================================

@app.get("/search")
def search_api(
    query: str = Query(..., min_length=2),
    limit: int = 10,
    mode:  str = Query("all", description="all | products | brands"),
):
    q = query.strip()
    if mode == "products":
        return {"query": q, "results": search_products(q, top_n=limit), "brands": []}
    if mode == "brands":
        return {"query": q, "results": [], "brands": search_brands(q, top_n=limit)}
    combined = search_all(q, top_n=limit)
    return {
        "query":   q,
        "results": combined["products"],
        "brands":  combined["brands"],
    }


@app.get("/suggest")
def suggest(
    query: str = Query(..., min_length=2),
    limit: int = 10,
):
    q = query.strip()
    combined = search_all(q, top_n=limit * 10)

    filtered_products = [
        p for p in combined["products"]
        if p.get("catalog_reviews_count", 0) > 0 or p.get("review_count", 0) > 0
    ]
    if not filtered_products:
        filtered_products = combined["products"]

    return {
        "query":    q,
        "products": filtered_products[:limit],
        "brands":   combined["brands"][:limit],
    }


@app.get("/brands")
def list_brands(q: Optional[str] = Query(None, min_length=1)):
    if q:
        return {"brands": search_brands(q, top_n=20)}
    all_b = get_all_brands()
    return {"brands": [{"brand_name": b, "result_type": "brand"} for b in all_b]}


@app.get("/brand/{brand_name}/products")
def brand_products(brand_name: str, limit: int = 5):
    products = get_brand_products(brand_name, limit=limit)
    if not products:
        raise HTTPException(404, f"Brand '{brand_name}' not found.")
    return {
        "brand_name":    brand_name,
        "product_count": len(products),
        "products":      products,
    }


@app.get("/product/{product_id}")
def get_product(product_id: str):
    product = get_product_info(product_id)
    if product is None:
        raise HTTPException(404, "Product not found")
    product_df = get_reviews_df_by_product(product_id)
    product["has_reviews"] = product_df is not None and len(product_df) > 0
    return product


@app.get("/product/{product_id}/reviews")
def get_reviews(product_id: str, limit: int = 100):
    product     = get_product_info(product_id)
    product_df  = get_reviews_df_by_product(product_id)
    has_reviews = product_df is not None and len(product_df) > 0
    reviews     = get_product_reviews(product_id=product_id, limit=limit)
    return {
        "product_id":                     product_id,
        "has_reviews_in_reviews_dataset": has_reviews,
        "catalog_reviews_count":          None if product is None else product.get("reviews"),
        "review_count":                   len(reviews),
        "reviews":                        reviews,
    }


# ==========================================================
# ANALYZE BY PRODUCT ID
# ==========================================================

@app.get("/analyze/{product_id}")
async def analyze_product(product_id: str, limit: int = 300):
    load_data()
    product = get_product_info(product_id)
    if product is None:
        raise HTTPException(404, "Product not found")

    product_df  = get_reviews_df_by_product(product_id)
    has_reviews = product_df is not None and len(product_df) > 0

    if not has_reviews:
        return {
            "product": product,
            "analysis_available": False,
            "summary": catalog_summary_text(product),
            "catalog_summary": {
                "avg_rating":            product.get("rating"),
                "catalog_reviews_count": product.get("reviews"),
                "loves_count":           product.get("loves_count"),
                "price_usd":             product.get("price_usd"),
                "sale_price_usd":        product.get("sale_price_usd"),
                "value_price_usd":       product.get("value_price_usd"),
                "limited_edition":       product.get("limited_edition"),
                "new":                   product.get("new"),
                "online_only":           product.get("online_only"),
                "out_of_stock":          product.get("out_of_stock"),
                "sephora_exclusive":     product.get("sephora_exclusive"),
                "highlights":            product.get("highlights"),
                "primary_category":      product.get("primary_category"),
                "secondary_category":    product.get("secondary_category"),
                "tertiary_category":     product.get("tertiary_category"),
                "variation_type":        product.get("variation_type"),
                "variation_value":       product.get("variation_value"),
                "size":                  product.get("size"),
            },
            "ai_style_insights": ai_style_insights_from_catalog(product),
            "note": "Full text-based analysis requires review_text rows in reviews_processed.csv for this product_id.",
        }

    reviews = get_product_reviews(product_id=product_id, limit=limit)
    if not reviews:
        return {
            "product": product,
            "analysis_available": False,
            "summary": catalog_summary_text(product),
            "ai_style_insights": ai_style_insights_from_catalog(product),
            "note": "Review dataframe exists but review_text extraction returned empty.",
        }

    loop = asyncio.get_event_loop()
    analysis = await loop.run_in_executor(
        _executor,
        lambda: analyze_reviews_batch(
            reviews=reviews,
            reviews_df=product_df,
            top_n_reviews=5,
            product=product,
        )
    )

    return {
        "product": product,
        "analysis_available": True,
        **analysis,
    }


# ==========================================================
# ANALYZE BY NAME
# ==========================================================

@app.get("/analyze")
async def analyze_by_name(product_name: str = Query(...)):
    load_data()
    q = " ".join(product_name.split()).strip()
    matches = search_products(query=q, top_n=1)
    if not matches:
        matches = search_products(query=" ".join(q.split()[:6]), top_n=1)
    if not matches and "+" in q:
        matches = search_products(query=q.split("+")[0].strip(), top_n=1)
    if not matches:
        raise HTTPException(404, "No matching product found")
    return await analyze_product(product_id=str(matches[0]["product_id"]), limit=300)


# ==========================================================
# TOP PRODUCTS
# ==========================================================

@app.get("/top-products")
def top_products(
    min_reviews:  int           = 100,
    brand:        Optional[str] = Query(None),
    category:     Optional[str] = Query(None),
):
    df = get_reviews_df()
    if df is None or df.empty:
        return []
    df = df.copy()
    if brand    and "brand_name" in df.columns:
        df = df[df["brand_name"].str.lower().str.contains(brand.lower(), na=False)]
    if category and "category"   in df.columns:
        df = df[df["category"].str.lower().str.contains(category.lower(), na=False)]

    grouped = (
        df.groupby(["product_id", "product_name", "brand_name"])
        .agg(avg_rating=("rating", "mean"), review_count=("rating", "count"))
        .reset_index()
    )
    grouped = grouped[grouped["review_count"] >= min_reviews]
    grouped = grouped.sort_values("avg_rating", ascending=False)
    return grouped.head(20).to_dict(orient="records")


# ==========================================================
# STATS
# ==========================================================

@app.get("/stats")
def stats():
    df = get_reviews_df()
    return {
        "total_reviews":          int(len(df)),
        "unique_products":        int(df["product_id"].nunique()),
        "unique_brands":          int(df["brand_name"].nunique()),
        "average_rating":         round(df["rating"].mean(), 2),
        "sentiment_distribution": df["sentiment"].value_counts().to_dict(),
    }


# ==========================================================
# AI SUMMARY — single product (low token usage)
# ==========================================================

@app.get("/ai-summary/{product_id}")
def ai_summary(product_id: str):
    product = get_product_info(product_id)
    if product is None:
        raise HTTPException(404, "Product not found")

    product_df  = get_reviews_df_by_product(product_id)
    has_reviews = product_df is not None and len(product_df) > 0
    if not has_reviews:
        raise HTTPException(400, "No review data available for AI summary")

    # Smaller sample — enough for accurate sentiment, far fewer tokens sent to Groq
    reviews  = get_product_reviews(product_id=product_id, limit=150)
    analysis = analyze_reviews_batch(
        reviews=reviews,
        reviews_df=product_df,
        top_n_reviews=2,          # fewer sample reviews passed to the prompt
        product=product,
    )

    try:
        summary = generate_single_summary(product, analysis)
        return {"product_id": product_id, "summary": summary}
    except Exception as e:
        raise HTTPException(500, f"AI summary failed: {str(e)}")


def detect_product_type(product: dict) -> str:
    category_fields = [
        str(product.get("primary_category", "")),
        str(product.get("secondary_category", "")),
        str(product.get("tertiary_category", "")),
    ]
    category_text = " ".join(category_fields).lower()

    if "hair" in category_text or "shampoo" in category_text or "conditioner" in category_text:
        return "haircare"
    elif "fragrance" in category_text or "perfume" in category_text or "cologne" in category_text:
        return "perfume"
    elif "body" in category_text or "lotion" in category_text or "cream" in category_text:
        return "bodycare"
    else:
        return "skincare"


@app.get("/ingredients/{product_id}")
def get_ingredient_analysis(
    product_id: str,
    target_type: Optional[str] = Query(None),
    summary_only: bool = Query(False, description="Return only summary, not full ingredient list"),
):
    """
    Analyze ingredients for a product with product-type + user-type awareness.

    Examples:
        /ingredients/P123?target_type=acne-prone
        /ingredients/P123?target_type=sensitive&summary_only=true
        /ingredients/P123?target_type=curly
    """
    product = get_product_info(product_id)
    if product is None:
        raise HTTPException(404, "Product not found")

    raw_ingredients = product.get("ingredients", "")
    if not raw_ingredients or str(raw_ingredients).lower() == "nan":
        return {
            "product_id": product_id,
            "product_name": product.get("product_name"),
            "has_ingredients": False,
            "message": "No ingredient data available for this product.",
        }

    product_type = detect_product_type(product)

    analysis = analyze_ingredients(
        raw_ingredients,
        target_type=target_type,
        analysis_mode="hair" if product_type == "haircare" else "skin",
        product_type=product_type,
    )

    response = {
        "product_id": product_id,
        "product_name": product.get("product_name"),
        "product_type": product_type,
        "analysis_mode": analysis.get("analysis_mode"),
        "has_ingredients": True,
        "target_type": target_type,
        "score": analysis.get("score"),
        "summary": analysis.get("summary"),
        "personalized_summary": analysis.get("personalized_summary"),
        "total_ingredients": analysis.get("total_ingredients"),
        "matched_count": analysis.get("matched_count"),
        "recognized_count": analysis.get("recognized_count"),
        "unrecognized_count": analysis.get("unrecognized_count"),
        "full_list": analysis.get("full_list"),
    }

    if not summary_only:
        response.update({
            "categorized_ingredients": analysis.get("categorized_ingredients"),

            # Personalized buckets (preferred by the new frontend)
            "avoid_for_user":   analysis.get("avoid_for_user"),
            "caution_for_user": analysis.get("caution_for_user"),
            "great_for_user":   analysis.get("great_for_user"),
            "neutral_for_user": analysis.get("neutral_for_user"),

            # Legacy keys (kept for backward compatibility)
            "good_matches":     analysis.get("good_matches"),
            "caution_matches":  analysis.get("caution_matches"),
            "high_concern":     analysis.get("high_concern"),
            "safe_ingredients": analysis.get("safe_ingredients"),
        })

    return response




FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # Don't serve index.html for API routes — let them 404 instead
        # API prefixes should be handled by their actual endpoints
        api_prefixes = (
            "ingredients", "search", "analyze", "product", "health", "stats",
            "brands", "top-products", "ai-summary", "suggest", "brand",
            "docs", "openapi.json"
        )
        if any(full_path.startswith(prefix) for prefix in api_prefixes):
            raise HTTPException(status_code=404, detail="Not found")

        file_path = os.path.join(FRONTEND_DIST, full_path)

        # Serve actual files from dist
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # Only serve index.html for SPA navigation (no file extension or .html requests)
        if "." not in full_path.split("/")[-1]:
            return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

        raise HTTPException(status_code=404, detail="File not found")
