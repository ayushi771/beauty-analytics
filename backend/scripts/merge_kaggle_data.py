import json
from pathlib import Path

import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ==========================================================
# CONFIG
# ==========================================================

KAGGLE_DIR = Path(
    r"C:\Users\Ayushi\Downloads\archive (4)\sephora"
)

PROJECT_ROOT = Path(
    r"C:\Users\Ayushi\sephora-sentiment"
)

PROCESSED = PROJECT_ROOT / "backend" / "data" / "processed"

REVIEWS_OUT = PROCESSED / "reviews_processed.csv"

vader = SentimentIntensityAnalyzer()


# ==========================================================
# SENTIMENT
# ==========================================================

def vader_label(text):
    score = vader.polarity_scores(str(text))["compound"]

    if score >= 0.05:
        return "positive"

    if score <= -0.05:
        return "negative"

    return "neutral"


# ==========================================================
# CONTEXT VALUE HELPER
# ==========================================================

def get_context_value(ctx, *keys):

    if not isinstance(ctx, dict):
        return ""

    for key in keys:

        if key in ctx:

            value = ctx[key]

            if isinstance(value, dict):
                return str(
                    value.get("Value", "")
                ).strip()

            return str(value).strip()

    return ""


# ==========================================================
# PARSE REVIEW
# ==========================================================

def parse_review(review):

    ctx = review.get(
        "ContextDataValues",
        {}
    )

    review_text = str(
        review.get("ReviewText", "")
    ).strip()

    title = str(
        review.get("Title", "")
    ).strip()

    pos_fb = (
        review.get(
            "TotalPositiveFeedbackCount",
            0,
        )
        or 0
    )

    total_fb = (
        review.get(
            "TotalFeedbackCount",
            0,
        )
        or 0
    )

    helpfulness = (
        round(pos_fb / total_fb, 4)
        if total_fb > 0
        else 0
    )

    return {
        "author_id": review.get("AuthorId"),

        "rating": review.get("Rating"),

        "helpfulness": helpfulness,

        "submission_time": review.get(
            "SubmissionTime"
        ),

        "review_text": review_text,

        "review_title": title,

        "skin_tone": get_context_value(
            ctx,
            "skinTone",
            "SkinTone",
        ),

        "eye_color": get_context_value(
            ctx,
            "eyeColor",
            "EyeColor",
        ),

        "skin_type": get_context_value(
            ctx,
            "skinType",
            "SkinType",
        ),

        "hair_color": get_context_value(
            ctx,
            "hairColor",
            "HairColor",
        ),

        "product_id": review.get(
            "ProductId"
        ),

        "sentiment": vader_label(
            review_text
        ),
    }


# ==========================================================
# LOAD JSON FILES
# ==========================================================

print("Scanning JSON files...")

json_files = list(
    KAGGLE_DIR.glob("P*.json")
)

print(
    f"Found {len(json_files):,} files"
)

rows = []

for idx, file in enumerate(json_files):

    try:

        with open(
            file,
            encoding="utf-8"
        ) as f:

            data = json.load(f)

    except Exception as e:

        print(
            f"Skipping {file.name}: {e}"
        )

        continue

    if not isinstance(data, list):
        continue

    for review in data:

        parsed = parse_review(
            review
        )

        if parsed["review_text"]:

            rows.append(parsed)

    if (idx + 1) % 500 == 0:

        print(
            f"{idx+1:,}/{len(json_files):,} files processed"
        )

print(
    f"\nCollected {len(rows):,} reviews"
)

if not rows:

    raise ValueError(
        "No reviews extracted."
    )

# ==========================================================
# BUILD DATAFRAME
# ==========================================================

reviews_df = pd.DataFrame(rows)

print(
    "\nSentiment distribution:"
)

print(
    reviews_df["sentiment"]
    .value_counts()
)

# ==========================================================
# ALIGN TO EXISTING SCHEMA
# ==========================================================

existing = pd.read_csv(
    REVIEWS_OUT,
    nrows=1,
    low_memory=False
)

for col in existing.columns:

    if col not in reviews_df.columns:

        reviews_df[col] = ""

reviews_df = reviews_df[
    existing.columns
]

# ==========================================================
# REMOVE DUPLICATES
# ==========================================================

existing_ids = set()

try:

    old = pd.read_csv(
        REVIEWS_OUT,
        usecols=["author_id", "product_id"],
        low_memory=False
    )

    existing_ids = set(
        zip(
            old["author_id"].astype(str),
            old["product_id"].astype(str)
        )
    )

except:
    pass

before = len(reviews_df)

reviews_df = reviews_df[
    ~reviews_df.apply(
        lambda x: (
            str(x["author_id"]),
            str(x["product_id"])
        )
        in existing_ids,
        axis=1
    )
]

after = len(reviews_df)

print(
    f"\nRemoved {before-after:,} duplicates"
)

# ==========================================================
# APPEND
# ==========================================================

reviews_df.to_csv(
    REVIEWS_OUT,
    mode="a",
    header=False,
    index=False
)

print(
    f"\n✅ Added {len(reviews_df):,} new reviews"
)

print(
    "\n🎉 Done. Restart FastAPI."
)