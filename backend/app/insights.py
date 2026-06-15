def _to_bool(x):
    if isinstance(x, bool):
        return x
    if x is None:
        return False
    s = str(x).strip().lower()
    return s in {"1", "true", "yes", "y", "t"}


def _safe_num(x):
    try:
        if x is None:
            return None
        s = str(x).strip()
        if s == "" or s.lower() == "nan":
            return None
        return float(s)
    except Exception:
        return None


def _clean_str(x):
    if x is None:
        return None
    s = str(x).strip()
    if s == "" or s.lower() == "nan":
        return None
    return s


def _compact_dict(d: dict) -> dict:
    """Remove None/empty values recursively (keeps False/0)."""
    out = {}
    for k, v in (d or {}).items():
        if isinstance(v, dict):
            vv = _compact_dict(v)
            if vv:  # skip empty dict
                out[k] = vv
            continue

        if v is None:
            continue
        if isinstance(v, str) and not v.strip():
            continue
        if isinstance(v, list) and len(v) == 0:
            continue

        out[k] = v
    return out


def _parse_highlights(highlights):
    """
    Kaggle often stores highlights as a string like:
      "['Vegan', 'Without Parabens']"
    We'll return a list[str] with light parsing.
    """
    if highlights is None:
        return []
    if isinstance(highlights, list):
        return [str(h).strip() for h in highlights if str(h).strip()]

    s = str(highlights).strip()
    if not s or s.lower() == "nan":
        return []

    s = s.strip("[]")
    parts = [p.strip().strip("'").strip('"') for p in s.split(",")]
    return [p for p in parts if p]


def catalog_summary_text(product: dict) -> str:
    """
    Summary shown when we DO NOT have review_text rows in reviews_processed.csv.
    """
    if not product:
        return "Catalog-only summary (product missing)."

    brand = _clean_str(product.get("brand_name")) or "Unknown brand"
    name = _clean_str(product.get("product_name")) or "Unknown product"
    rating = product.get("rating")
    reviews = product.get("reviews")

    return (
        f"Catalog-only summary for {brand} {name}. "
        f"Review text is not available in this dataset, so insights are based on product catalog fields only. "
        f"Avg rating: {rating}, catalog review count: {reviews}."
    )


def ai_style_insights_from_catalog(product: dict) -> dict:
    """
    AI-style insights derived ONLY from product catalog fields.
    - Adds an explicit disclaimer.
    - Omits None/empty values.
    - Produces a cleaner, more user-friendly structure.
    """
    if not product:
        return {
            "disclaimer": "Catalog-only insights (no review text available).",
            "strengths": [],
            "watchouts": [],
            "best_for": [],
        }

    rating = _safe_num(product.get("rating"))
    reviews_count = _safe_num(product.get("reviews"))
    loves = _safe_num(product.get("loves_count"))

    price = _safe_num(product.get("price_usd"))
    value_price = _safe_num(product.get("value_price_usd"))
    sale_price = _safe_num(product.get("sale_price_usd"))

    is_new = _to_bool(product.get("new"))
    limited = _to_bool(product.get("limited_edition"))
    online_only = _to_bool(product.get("online_only"))
    out_of_stock = _to_bool(product.get("out_of_stock"))
    exclusive = _to_bool(product.get("sephora_exclusive"))

    primary = _clean_str(product.get("primary_category"))
    secondary = _clean_str(product.get("secondary_category"))
    tertiary = _clean_str(product.get("tertiary_category"))

    size = _clean_str(product.get("size"))
    variation_type = _clean_str(product.get("variation_type"))
    variation_value = _clean_str(product.get("variation_value"))

    highlights = _parse_highlights(product.get("highlights"))

    strengths = []
    watchouts = []
    best_for = []

    # --- Rating ---
    if rating is not None:
        if rating >= 4.5:
            strengths.append("Excellent average rating (4.5+).")
        elif rating >= 4.0:
            strengths.append("Strong average rating (4.0+).")
        elif rating >= 3.5:
            watchouts.append("Mixed rating (3.5–4.0). Results may vary.")
        else:
            watchouts.append("Lower average rating (<3.5). Consider alternatives if available.")

    # --- Review volume confidence ---
    if reviews_count is not None:
        if reviews_count >= 2000:
            strengths.append("High review volume (2000+). Rating is more reliable.")
        elif reviews_count >= 500:
            strengths.append("Good review volume (500+).")
        elif reviews_count >= 50:
            watchouts.append("Limited review volume (<500).")
        else:
            watchouts.append("Very few reviews. Confidence is low.")

    # --- Popularity (loves_count) ---
    if loves is not None:
        if loves >= 100000:
            strengths.append("Very popular item (high loves count).")
        elif loves >= 20000:
            strengths.append("Popular item (strong loves count).")

    # --- Availability flags ---
    if out_of_stock:
        watchouts.append("Currently marked out of stock.")
    if limited:
        watchouts.append("Limited edition item—may be harder to restock.")
    if online_only:
        watchouts.append("Online-only item (not always available in-store).")
    if exclusive:
        strengths.append("Sephora exclusive.")
    if is_new:
        strengths.append("Marked as new.")

    # --- Pricing ---
    on_sale = (sale_price is not None and price is not None and sale_price < price)
    if on_sale:
        strengths.append("Currently discounted (sale price available).")
    if price is not None:
        if price >= 60:
            watchouts.append("Premium price point—value depends on budget.")
        elif price <= 15:
            strengths.append("Budget-friendly price point.")

    # --- Category-based best_for ---
    if tertiary:
        best_for.append(f"Best for: {tertiary}.")
    elif secondary:
        best_for.append(f"Best for: {secondary}.")
    elif primary:
        best_for.append(f"Best for: {primary}.")

    # --- Build clean output sections (omit None/empties) ---
    availability = {
        "new": is_new,
        "limited_edition": limited,
        "online_only": online_only,
        "out_of_stock": out_of_stock,
        "sephora_exclusive": exclusive,
    }

    pricing = {
        "price_usd": price,
        "sale_price_usd": sale_price,
        "value_price_usd": value_price,
        "on_sale": on_sale,
    }

    extra = {
        "size": size,
        "variation": (
            f"{variation_type} = {variation_value}"
            if variation_type and variation_value
            else None
        ),
        "categories": {
            "primary_category": primary,
            "secondary_category": secondary,
            "tertiary_category": tertiary,
        },
        "highlights": highlights[:10] if highlights else [],
    }

    result = {
        "disclaimer": (
            "Catalog-only insights: full review text is not available in this dataset for this product, "
            "so insights are based on product metadata (rating, review count, flags, pricing, highlights)."
        ),
        "strengths": strengths,
        "watchouts": watchouts,
        "best_for": best_for,
        "availability": availability,
        "pricing": pricing,
        "extra_info": extra,
    }

    return _compact_dict(result)