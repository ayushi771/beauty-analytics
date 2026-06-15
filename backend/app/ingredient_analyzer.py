import ast
import re
from difflib import get_close_matches

from .ingredient_database import (
    INGREDIENT_DB,
    HIGH_CONCERN_INGREDIENTS,
    FRAGRANCE_COMPONENTS,
    get_category_specific_concerns,
    classify_unknown_ingredient,
    get_type_rule_pack,
)

# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_ingredients(raw_ingredients: str) -> list:
    """Robustly parse Kaggle-style stringified ingredient lists."""
    if not raw_ingredients or str(raw_ingredients).lower() == "nan":
        return []

    raw = str(raw_ingredients).strip()

    try:
        fragments = ast.literal_eval(raw)
        joined = "".join(str(f) for f in fragments) if isinstance(fragments, list) else str(fragments)
    except (ValueError, SyntaxError):
        joined = raw.strip("[]")

    parts = joined.split(",")

    cleaned = []
    for p in parts:
        p = p.strip().strip("'").strip('"').rstrip(".")
        p = re.sub(r"\s+", " ", p)
        if len(p) > 1:
            cleaned.append(p)
    return cleaned


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

# Stripped: percentages, CI numbers, "(and)", asterisks, plus/minus markers
_NOISE_PATTERNS = [
    r"\(.*?\)",          # parenthetical content
    r"\[.*?\]",          # bracketed content
    r"\d+\s?%",          # 1%, 2 %
    r"\bci\s?\d{4,5}\b", # CI 19140
    r"\*+",              # ***
    r"\+/-",
    r"\(and\)",
    r"\bnan\b",
]

_REPLACEMENTS = {
    "aqua": "water",
    "eau": "water",
    "purified water": "water",
    "water/aqua/eau": "water",
    "aqua/water/eau": "water",
    "and/or": " ",
    "&": " and ",
}

def _normalize(name: str) -> str:
    if not name:
        return ""
    n = name.lower().strip()
    for pat in _NOISE_PATTERNS:
        n = re.sub(pat, " ", n)
    for k, v in _REPLACEMENTS.items():
        n = n.replace(k, v)
    n = re.sub(r"[^a-z0-9\-/ ]+", " ", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


# Pre-compute a flat index { search_term -> db_key } for fast matching
def _build_search_index():
    index = {}
    for key, data in INGREDIENT_DB.items():
        for term in [key] + data.get("synonyms", []):
            t = _normalize(term)
            if t and t not in index:
                index[t] = key
    return index

_SEARCH_INDEX = _build_search_index()
_ALL_TERMS = list(_SEARCH_INDEX.keys())


# ---------------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------------

def match_known_ingredients(ingredient_list: list) -> list:
    """
    Three-stage match:
      1. exact normalized equality / substring against DB synonyms
      2. fuzzy match against DB terms (stdlib difflib)
      3. family-rule fallback (silicones, parabens, oils, etc.)
    Unknowns are also returned (matched_by='unknown') so the frontend can
    show them as neutral.
    """
    matched = []
    seen_keys = set()

    for ing in ingredient_list:
        norm = _normalize(ing)
        if not norm:
            continue

        db_key = None
        match_method = None

        # 1) exact / substring
        if norm in _SEARCH_INDEX:
            db_key = _SEARCH_INDEX[norm]
            match_method = "exact"
        else:
            for term, key in _SEARCH_INDEX.items():
                if term in norm or norm in term:
                    db_key = key
                    match_method = "substring"
                    break

        # 2) fuzzy fallback (cheap stdlib version)
        if db_key is None:
            close = get_close_matches(norm, _ALL_TERMS, n=1, cutoff=0.88)
            if close:
                db_key = _SEARCH_INDEX[close[0]]
                match_method = "fuzzy"

        if db_key is not None:
            if db_key in seen_keys:
                continue
            seen_keys.add(db_key)
            data = INGREDIENT_DB[db_key]
            matched.append({
                "name": ing,
                "matched_key": db_key,
                "matched_by": match_method,
                **data,
            })
            continue

        # 3) family-rule fallback
        family = classify_unknown_ingredient(norm)
        if family is not None:
            matched.append({
                "name": ing,
                "matched_key": None,
                **family,
            })
            continue

        # 4) truly unknown — keep as neutral so user can see it
        matched.append({
            "name": ing,
            "matched_key": None,
            "matched_by": "unknown",
            "category": "other",
            "good_for": [],
            "caution_for": [],
            "benefits": "",
            "concerns": "",
        })

    return matched


# ---------------------------------------------------------------------------
# Personalization
# ---------------------------------------------------------------------------

def _verdict_for(ing: dict, target_type: str, rule_pack: dict) -> dict:
    """
    Return { verdict, personalized_note } for a single matched ingredient
    given the user's selected skin/hair type.
        verdict ∈ {"avoid", "caution", "great", "neutral"}
    """
    if not target_type:
        return {"verdict": "neutral", "personalized_note": ""}

    t = target_type.lower()
    name_l = (ing.get("name") or "").lower()
    key = ing.get("matched_key") or ""
    good = [x.lower() for x in ing.get("good_for", [])]
    caution = [x.lower() for x in ing.get("caution_for", [])]
    type_notes = ing.get("type_notes") or {}

    # 1) per-ingredient explicit data wins
    is_high = key in HIGH_CONCERN_INGREDIENTS
    if t in caution and is_high:
        return {
            "verdict": "avoid",
            "personalized_note": type_notes.get(t)
                or f"Flagged as a high-concern ingredient for {target_type} skin/hair.",
        }
    if t in caution:
        return {
            "verdict": "caution",
            "personalized_note": type_notes.get(t)
                or f"May not suit {target_type} — use with care.",
        }
    if t in good or "all" in good:
        return {
            "verdict": "great",
            "personalized_note": type_notes.get(t)
                or f"Beneficial for {target_type}.",
        }

    # 2) comedogenic auto-flag for acne-prone / oily
    comed = ing.get("comedogenic")
    if comed is not None:
        if t == "acne-prone" and comed >= 3:
            return {
                "verdict": "avoid",
                "personalized_note": f"Comedogenic rating {comed}/5 — likely to clog acne-prone pores.",
            }
        if t == "oily" and comed >= 4:
            return {
                "verdict": "caution",
                "personalized_note": f"Heavy / comedogenic ({comed}/5) — may feel greasy on oily skin.",
            }

    # 3) type-rule-pack patterns (catches unknown ingredients too)
    if rule_pack:
        for pat in rule_pack.get("avoid_patterns", []):
            if pat in name_l or pat in key:
                return {
                    "verdict": "avoid",
                    "personalized_note": f"Avoid for {target_type}: {pat} is a known trigger.",
                }
        for pat in rule_pack.get("caution_patterns", []):
            if pat in name_l or pat in key:
                return {
                    "verdict": "caution",
                    "personalized_note": f"Use with care for {target_type} — contains {pat}.",
                }
        for pat in rule_pack.get("great_patterns", []):
            if pat in name_l or pat in key:
                return {
                    "verdict": "great",
                    "personalized_note": f"Recommended for {target_type}.",
                }

    return {"verdict": "neutral", "personalized_note": ""}


# ---------------------------------------------------------------------------
# Categorization (unchanged shape; uses verdict to split high_concern)
# ---------------------------------------------------------------------------

def categorize_ingredients(matched_ingredients: list, product_type: str = "skincare") -> dict:
    categories = {
        "actives": [], "hydrators": [], "emollients": [], "preservatives": [],
        "ph_adjusters": [], "fragrance_related": [], "silicones": [],
        "natural_extracts": [], "surfactants": [], "emulsifiers": [],
        "uv_filters": [], "proteins": [], "antioxidants": [], "other": [],
    }
    concerns = {"high_concern": [], "caution": [], "safe": []}

    for ingredient in matched_ingredients:
        category = ingredient.get("category", "other")
        key = ingredient.get("matched_key")

        if category in categories:
            categories[category].append(ingredient)
        else:
            categories["other"].append(ingredient)

        if key in HIGH_CONCERN_INGREDIENTS:
            concerns["high_concern"].append(ingredient)
        elif ingredient.get("caution_for"):
            concerns["caution"].append(ingredient)
        else:
            concerns["safe"].append(ingredient)

    return {"by_type": categories, "by_concern": concerns}


def filter_ingredients_for_product_type(matched_ingredients: list, product_type: str = "skincare") -> dict:
    """Consolidate duplicate fragrance allergens for non-perfume products."""
    filtered = matched_ingredients.copy()
    if product_type.lower() != "perfume":
        fragrance_count = sum(
            1 for ing in filtered if ing.get("matched_key") in FRAGRANCE_COMPONENTS
        )
        if fragrance_count > 1:
            main_fragrance_found = False
            new_filtered = []
            for ing in filtered:
                if ing.get("matched_key") in FRAGRANCE_COMPONENTS:
                    if not main_fragrance_found:
                        main_fragrance_found = True
                        new_filtered.append(ing)
                else:
                    new_filtered.append(ing)
            filtered = new_filtered
    return {"filtered": filtered, "original_count": len(matched_ingredients)}


# ---------------------------------------------------------------------------
# Main entry
# ---------------------------------------------------------------------------

def analyze_ingredients(
    raw_ingredients: str,
    target_type: str = None,
    analysis_mode: str = "skin",
    product_type: str = "skincare",
) -> dict:
    full_list = parse_ingredients(raw_ingredients)
    matched_all = match_known_ingredients(full_list)

    # "recognized" excludes the truly-unknown ones
    recognized = [m for m in matched_all if m.get("matched_by") != "unknown"]

    categorized = categorize_ingredients(recognized, product_type=product_type)

    filtered = filter_ingredients_for_product_type(recognized, product_type=product_type)["filtered"]

    # ── Personalize ───────────────────────────────────────────────────
    rule_pack = get_type_rule_pack(target_type)

    avoid_for_user, caution_for_user, great_for_user, neutral_for_user = [], [], [], []
    for m in filtered:
        v = _verdict_for(m, target_type, rule_pack)
        enriched = {**m, **v}
        if v["verdict"] == "avoid":
            avoid_for_user.append(enriched)
        elif v["verdict"] == "caution":
            caution_for_user.append(enriched)
        elif v["verdict"] == "great":
            great_for_user.append(enriched)
        else:
            neutral_for_user.append(enriched)

    high_concern = categorized["by_concern"]["high_concern"]

    # ── Score ─────────────────────────────────────────────────────────
    score = 100
    mult = get_category_specific_concerns(product_type).get("concern_multiplier", 1.0)
    score -= len(avoid_for_user) * (10 * mult)
    score -= len(caution_for_user) * (5 * mult)
    score -= max(0, len(high_concern) - len(avoid_for_user)) * (4 * mult)
    score = max(0, min(100, int(score)))

    headline = rule_pack.get("headline") if rule_pack else None
    personalized_summary = {
        "target_type": target_type,
        "headline": headline,
        "avoid_count": len(avoid_for_user),
        "caution_count": len(caution_for_user),
        "great_count": len(great_for_user),
        "neutral_count": len(neutral_for_user),
    }

    return {
        "analysis_mode": analysis_mode,
        "product_type": product_type,
        "target_type": target_type,

        "total_ingredients": len(full_list),
        "matched_count": len(recognized),
        "recognized_count": len(recognized),
        "unrecognized_count": len(full_list) - len(recognized),

        "full_list": full_list,
        "matched_ingredients": filtered,
        "categorized_ingredients": categorized["by_type"],

        # Legacy (kept for backward compat)
        "good_matches": great_for_user,
        "caution_matches": caution_for_user,
        "high_concern": high_concern,
        "safe_ingredients": neutral_for_user,

        # New personalized buckets
        "avoid_for_user": avoid_for_user,
        "caution_for_user": caution_for_user,
        "great_for_user": great_for_user,
        "neutral_for_user": neutral_for_user,
        "personalized_summary": personalized_summary,

        "score": score,
        "summary": generate_analysis_summary(
            filtered, high_concern, caution_for_user, product_type, personalized_summary
        ),
    }


def generate_analysis_summary(
    matched_ingredients: list,
    high_concern: list,
    caution_matches: list,
    product_type: str,
    personalized_summary: dict = None,
) -> dict:
    summary = {
        "total_matched": len(matched_ingredients),
        "high_concern_count": len(high_concern),
        "caution_count": len(caution_matches),
        "safe_count": len(matched_ingredients) - len(high_concern) - len(caution_matches),
    }

    if personalized_summary and personalized_summary.get("headline"):
        summary["insight"] = personalized_summary["headline"]
    elif product_type.lower() == "perfume":
        summary["insight"] = "Fragrance products naturally contain allergens. Check tolerance."
    elif product_type.lower() == "haircare":
        summary["insight"] = "For hair, silicones and oils smooth strands — balance with cleansing."
    elif product_type.lower() == "skincare":
        summary["insight"] = "For skincare, prioritize actives and hydrators; limit fragrance."
    elif product_type.lower() == "bodycare":
        summary["insight"] = "Body care often contains fragrance — assess if sensitive."

    return summary
