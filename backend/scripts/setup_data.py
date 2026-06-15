from pathlib import Path
import pandas as pd
import json

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data/raw"
PROCESSED_DIR = BASE_DIR / "data/processed"
PROCESSED_DIR.mkdir( parents=True, exist_ok=True)

REVIEWS_OUTPUT = PROCESSED_DIR / "reviews_processed.csv"
PRODUCTS_OUTPUT = PROCESSED_DIR / "products_processed.csv"
STATS_OUTPUT = PROCESSED_DIR / "dataset_stats.json"

def load_reviews():
    review_files = sorted(RAW_DIR.glob("reviews_*.csv"))
    if not review_files:
        raise FileNotFoundError(f"No review files found in {RAW_DIR}")
    print(f"Found {len(review_files)} review files.")
    dfs = []
    for file in review_files:
        print(f"Loading: {file.name}")
        df = pd.read_csv(
          file,
          low_memory=False
        )
        dfs.append(df)
    reviews = pd.concat(dfs, ignore_index=True)
    return reviews
def process_reviews(df):
    print("\nCleaning reviews...")
    df.columns = [col.lower().strip() for col in df.columns]
    keep_cols = [
        "author_id",
        "rating",
        "helpfulness",
        "submission_time",
        "review_text",
        "review_title",
        "skin_tone",
        "eye_color",
        "skin_type",
        "hair_color",
        "product_id",
        "product_name",
        "brand_name",
        "price_usd"
    ]
    df = df[keep_cols].copy()
    before = len(df)
    df.drop_duplicates(inplace=True)
    after = len(df)
    print(f"Removed {before - after} duplicates")
    df.dropna(subset=["review_text" , "rating" , "product_id"], inplace=True)
    df["review_text"] = (
        df["review_text"]
        .astype(str)
        .str.strip()
    )
    df = df[
        df["review_text"].str.len() > 10
    ]
    df["rating"] = pd.to_numeric(
        df["rating"],
        errors="coerce"
    )

    df.dropna(
        subset=["rating"],
        inplace=True
    )

    def rating_to_sentiment(rating):
        if rating <= 2:
            return "negative"
        elif rating == 3:
            return "neutral"
        else:
            return "positive"
        
    df["sentiment"] = (
        df["rating"]
        .apply(rating_to_sentiment)
    )

    # search helper
    df["product_name_lower"] = (
        df["product_name"]
        .astype(str)
        .str.lower()
        .str.strip()
    )

    # useful analytics
    df["review_length"] = (
        df["review_text"]
        .astype(str)
        .str.len()
    )

    print(
        f"Final reviews: {len(df):,}"
    )

    return df



def process_products():

    product_file = RAW_DIR / "product_info.csv"

    if not product_file.exists():
        raise FileNotFoundError(
            "product_info.csv not found"
        )

    df = pd.read_csv(
        product_file,
        low_memory=False
    )

    df.columns = [
        col.lower().strip()
        for col in df.columns
    ]

    keep_cols = [
        "product_id",
        "product_name",
        "brand_name",
        "rating",
        "reviews",
        "price_usd",
        "ingredients",
        "highlights",
        "primary_category",
        "secondary_category",
        "tertiary_category"
    ]

    df = df[keep_cols].copy()

    return df



def create_stats(reviews):

    stats = {

        "total_reviews":
            int(len(reviews)),

        "total_products":
            int(
                reviews["product_id"]
                .nunique()
            ),

        "positive_reviews":
            int(
                (reviews["sentiment"] == "positive")
                .sum()
            ),

        "neutral_reviews":
            int(
                (reviews["sentiment"] == "neutral")
                .sum()
            ),

        "negative_reviews":
            int(
                (reviews["sentiment"] == "negative")
                .sum()
            )
    }

    with open(
        STATS_OUTPUT,
        "w"
    ) as f:

        json.dump(
            stats,
            f,
            indent=4
        )

# ==================================================
# MAIN
# ==================================================

def main():

    print("\n==========")
    print("SEPHORA DATA SETUP")
    print("==========")

    reviews = load_reviews()

    reviews = process_reviews(
        reviews
    )

    products = process_products()

    reviews.to_csv(
        REVIEWS_OUTPUT,
        index=False
    )

    products.to_csv(
        PRODUCTS_OUTPUT,
        index=False
    )

    create_stats(
        reviews
    )

    print("\nSaved:")

    print(
        REVIEWS_OUTPUT
    )

    print(
        PRODUCTS_OUTPUT
    )

    print(
        STATS_OUTPUT
    )

    print("\nSetup Complete")

if __name__ == "__main__":
    main()    