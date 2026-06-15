import React from "react";

export default function ProductHero({ product, analysis }) {
  if (!product || !analysis) {
    console.warn("⚠️ ProductHero: Missing product or analysis", { product, analysis });
    return null;
  }

  console.log("✅ ProductHero rendering with:", { product: product.product_name, analysis });

  const rating = Number(product.rating || analysis.avg_rating || 0).toFixed(2);
  const score = Number(analysis.recommendation_score || 0).toFixed(1);
  
  const category =
    product.secondary_category ||
    product.primary_category ||
    "Beauty Product";

  const stars =
    "★".repeat(Math.round(Number(rating))) +
    "☆".repeat(5 - Math.round(Number(rating)));

  const sentimentMap = {
    positive: "Overall Positive",
    neutral: "Mixed Reviews",
    negative: "Overall Negative",
  };

  const sentiment =
    sentimentMap[analysis.overall_sentiment] ||
    "Mixed Reviews";

  return (
    <div style={styles.card}>
      {/* LEFT SECTION */}
      <div style={styles.left}>
        <h1 style={styles.title}>
        {product.brand_name}
        </h1>

        <h2 style={styles.productName}>
          {product.product_name}
        </h2>

        <div style={styles.meta}>
          <span style={styles.stars}>
            {stars}
          </span>

          <span style={styles.rating}>
            {rating}/5
          </span>

          <span style={styles.dot}>·</span>

          <span style={styles.category}>
            {category}
          </span>
          {product.price_usd && (
    <>
      <span style={styles.dot}>·</span>

      <span style={styles.price}>
        ${product.price_usd}
      </span>
    </>
  )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div style={styles.right}>
        <div style={styles.scoreBox}>
          <div style={styles.score}>
            {score}
            <span style={styles.outOf}>/100</span>
          </div>
          <div style={styles.sentiment}>
            {sentiment}
          </div>
        </div>
      </div>
    </div>
  );
}
const styles = {
  card: {
    background: "#fff",
    border: "1px solid #F4C0D1",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",

    boxShadow: "0 4px 18px rgba(212,83,126,0.08)",
    marginBottom: "24px",
    marginTop: "0px",

    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  left: {
    flex: "1 1 500px",
    minWidth: 0,
  },

  title: {
    margin: 0,
    fontSize: "clamp(14px, 2vw, 18px)",
    fontWeight: 700,
    color: "#D4537E",
    letterSpacing: "1px",
    textTransform: "uppercase",
    wordBreak: "break-word",
  },

  productName: {
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },

  meta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
    flexWrap: "wrap",
  },

  stars: {
    color: "#D4537E",
    fontSize: "18px",
    letterSpacing: "2px",
  },

  rating: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#444",
  },

  dot: {
    color: "#999",
    fontSize: "18px",
  },

  category: {
    color: "#666",
    fontSize: "15px",
  },

  right: {
    flex: "0 0 auto",
    marginLeft: "24px",
    marginTop: "12px",
  },

  scoreBox: {
    textAlign: "right",
    minWidth: "180px",
  },

  score: {
    fontSize: "clamp(36px, 6vw, 52px)",
    fontWeight: 700,
    color: "#D4537E",
    lineHeight: 1,
    margin: 0,
  },

  outOf: {
    fontSize: "clamp(14px, 2vw, 20px)",
    color: "#888",
    fontWeight: 500,
    marginLeft: "4px",
  },

  sentiment: {
    marginTop: "10px",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: 600,
    color: "#993556",
  },

  price: {
    color: "#D4537E",
    fontSize: "15px",
    fontWeight: 700,
  },
};