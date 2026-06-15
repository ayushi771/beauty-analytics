import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
try:
    from groq import Groq
except Exception:
    Groq = None  # type: ignore

# Only instantiate the Groq client when an API key is present. If not,
# keep `client` as None so importing this module doesn't raise.
_GROQ_KEY = os.environ.get("GROQ_API_KEY")
client: Optional[object]
if _GROQ_KEY and Groq is not None:
    client = Groq(api_key=_GROQ_KEY)
else:
    client = None
    if Groq is None:
        print("Warning: 'groq' package not available; groq insights disabled.")
    else:
        print("Warning: GROQ_API_KEY not set; groq insights disabled.")


def _safe(val, fallback="N/A"):
    if val is None or str(val).strip().lower() in ("nan", "", "none"):
        return fallback
    return val


def _top_aspect(aspects: dict, mode: str = "best") -> str:
    """Return best or worst performing aspect label."""
    scored = [
        (k, v["positive"])
        for k, v in (aspects or {}).items()
        if v.get("mentions", 0) >= 3
    ]
    if not scored:
        return "N/A"
    scored.sort(key=lambda x: x[1], reverse=(mode == "best"))
    return scored[0][0].replace("_", " ")


def _best_skin_type(skin_breakdown: dict) -> str:
    """Best skin type, weighted toward types with meaningful sample size."""
    if not skin_breakdown:
        return "all skin types"
    # prefer types with at least 5 reviews if possible
    candidates = [
        (k, v) for k, v in skin_breakdown.items()
        if v.get("count", 0) >= 5
    ] or list(skin_breakdown.items())

    best = max(candidates, key=lambda x: x[1].get("positive_pct", 0))
    return f"{best[0]} skin ({best[1]['positive_pct']}% positive, {best[1]['count']} reviews)"


def _worst_skin_type(skin_breakdown: dict) -> Optional[str]:
    """Skin type with notably lower satisfaction, if any (for caveat)."""
    if not skin_breakdown:
        return None
    candidates = [
        (k, v) for k, v in skin_breakdown.items()
        if v.get("count", 0) >= 5
    ]
    if len(candidates) < 2:
        return None
    worst = min(candidates, key=lambda x: x[1].get("positive_pct", 0))
    best  = max(candidates, key=lambda x: x[1].get("positive_pct", 0))
    # only flag if there's a meaningful gap
    if best[1]["positive_pct"] - worst[1]["positive_pct"] >= 15:
        return f"{worst[0]} skin ({worst[1]['positive_pct']}% positive, {worst[1]['count']} reviews)"
    return None


def _best_skin_tone(tone_breakdown: dict) -> Optional[str]:
    """Best-performing skin tone, if data exists with meaningful sample."""
    if not tone_breakdown:
        return None
    candidates = [
        (k, v) for k, v in tone_breakdown.items()
        if v.get("count", 0) >= 5
    ] or list(tone_breakdown.items())
    if not candidates:
        return None
    best = max(candidates, key=lambda x: x[1].get("positive_pct", 0))
    return f"{best[0]} ({best[1]['positive_pct']}% positive, {best[1]['count']} reviews)"


def _confidence_note(review_count) -> str:
    """A short note on how reliable this analysis is based on sample size."""
    try:
        n = int(review_count)
    except (TypeError, ValueError):
        return "Sample size unknown."

    if n >= 500:
        return f"Very high confidence — based on a large sample of {n} reviews."
    if n >= 150:
        return f"High confidence — based on {n} reviews."
    if n >= 50:
        return f"Moderate confidence — based on {n} reviews. Patterns are meaningful but may shift with more data."
    return f"Low confidence — based on only {n} reviews. Treat conclusions as early signals, not certainties."


def build_product_context(product: dict, analysis: dict) -> str:
    """Build a rich text context string for one product."""
    dist        = analysis.get("distribution", {})
    aspects     = analysis.get("aspect_sentiment", {})
    skin_type   = analysis.get("skin_type_breakdown", {})
    skin_tone   = analysis.get("skin_tone_breakdown", {})
    rating      = _safe(analysis.get("avg_rating"))
    reviews     = analysis.get("review_count")
    rec         = _safe(analysis.get("recommendation_rate"))
    rec_score   = _safe(analysis.get("recommendation_score"))

    aspect_lines = []
    for k, v in (aspects or {}).items():
        if v.get("mentions", 0) >= 3:
            aspect_lines.append(
                f"  - {k.replace('_',' ').title()}: "
                f"{v['positive']}% positive, {v['negative']}% negative "
                f"({v['mentions']} mentions)"
            )

    skin_type_lines = []
    for k, v in (skin_type or {}).items():
        skin_type_lines.append(f"  - {k}: {v['positive_pct']}% positive ({v['count']} reviews)")

    skin_tone_lines = []
    for k, v in (skin_tone or {}).items():
        skin_tone_lines.append(f"  - {k}: {v['positive_pct']}% positive ({v['count']} reviews)")

    best_skin_type  = _best_skin_type(skin_type)
    worst_skin_type = _worst_skin_type(skin_type)
    best_skin_tone  = _best_skin_tone(skin_tone)
    confidence      = _confidence_note(reviews)

    return f"""
Product: {_safe(product.get('product_name'))}
Brand: {_safe(product.get('brand_name'))}
Category: {_safe(product.get('primary_category'))} > {_safe(product.get('secondary_category'))}
Price: ${_safe(product.get('price_usd'))}
Avg Rating: {rating}/5 from {_safe(reviews)} reviews
Recommendation Rate: {rec}%
Recommendation Score: {rec_score}/100
Overall Sentiment: {dist.get('positive', 0)}% positive / {dist.get('neutral', 0)}% neutral / {dist.get('negative', 0)}% negative
Best Aspect: {_top_aspect(aspects, 'best')}
Weakest Aspect: {_top_aspect(aspects, 'worst')}
Confidence: {confidence}

Best Skin Type: {best_skin_type}
{f"Notably Lower Satisfaction For: {worst_skin_type}" if worst_skin_type else ""}
{f"Best Skin Tone Match: {best_skin_tone}" if best_skin_tone else ""}

Aspect Breakdown:
{chr(10).join(aspect_lines) if aspect_lines else '  N/A'}

By Skin Type:
{chr(10).join(skin_type_lines) if skin_type_lines else '  N/A'}

By Skin Tone:
{chr(10).join(skin_tone_lines) if skin_tone_lines else '  N/A'}

Sample Positive Review: {(analysis.get('top_positive_reviews') or [''])[0][:250]}
Sample Negative Review: {(analysis.get('top_negative_reviews') or [''])[0][:250]}
""".strip()


def generate_single_summary(product: dict, analysis: dict) -> str:
    """Generate a rich, consumer-friendly AI summary for one product."""
    context = build_product_context(product, analysis)

    prompt = f"""You are a senior beauty editor at Allure Magazine writing a definitive product verdict.

Here is the data for this product:
{context}

Write a detailed, consumer-friendly product summary in exactly this structure:

**VERDICT** (2 sentences: overall score in plain English, who should buy it. If confidence is low, briefly note that early reviews are promising/concerning but the sample is still small)

**WHAT IT DOES WELL**
- 3 specific bullet points based on the data, each 1-2 sentences

**WATCH OUT FOR**
- 2 specific bullet points on weaknesses or caveats. If a specific skin type shows notably lower satisfaction, mention it here.

**BEST FOR**
1-2 sentences: which skin type AND skin tone (if data available), concern, or use case this is ideal for. Be specific using the actual best-performing groups from the data.

**THE BOTTOM LINE**
1 punchy sentence a friend would text you about this product

Be specific, use the actual numbers from the data naturally (don't just list stats), and write like a knowledgeable human editor — not a bot. Keep total length under 270 words."""

    if client is None:
        return (
            "Groq integration is not configured (GROQ_API_KEY missing or client unavailable). "
            "AI-style summary generation is disabled."
        )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=550,
    )
    return response.choices[0].message.content.strip()