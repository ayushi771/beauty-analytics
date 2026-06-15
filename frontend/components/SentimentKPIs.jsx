
export default function SentimentKPIs({distribution}){
  const positive = distribution?.positive || 0;
  const negative = distribution?.negative || 0;
  const neutral = distribution?.neutral || 0;

  return(
      <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>😊</div>
        <div style={styles.value}>{positive}%</div>
        <div style={styles.label}>Positive Reviews</div>
        <div style={styles.desc}>
          Customers who left positive feedback.
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.icon}>⚠️</div>
        <div style={styles.value}>{negative}%</div>
        <div style={styles.label}>Negative Reviews</div>
        <div style={styles.desc}>
          Reviews mentioning dissatisfaction.
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.icon}>💬</div>
        <div style={styles.value}>{neutral}%</div>
        <div style={styles.label}>Mixed Opinions</div>
        <div style={styles.desc}>
          Customers with neither strong praise nor criticism.
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: {
    display: "grid",

    // Responsive grid
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",

    gap: "20px",
    marginBottom: "24px",
    width: "100%",
  },

  card: {
    background: "#fff",
    border: "1px solid #F4C0D1",
    borderRadius: "18px",
    padding: "24px",

    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",

    width: "100%",
    boxSizing: "border-box",

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",

    minHeight: "180px",
  },

  icon: {
    fontSize: "clamp(24px, 4vw, 28px)",
    marginBottom: "10px",
  },

  value: {
    fontSize: "clamp(26px, 5vw, 34px)",
    fontWeight: 700,
    color: "#D4537E",
    lineHeight: 1.1,
  },

  label: {
    fontSize: "clamp(14px, 2vw, 15px)",
    fontWeight: 600,
    marginTop: "6px",
    color: "#111827",
  },

  desc: {
    fontSize: "clamp(12px, 2vw, 13px)",
    color: "#6B7280",
    marginTop: "8px",
    lineHeight: 1.5,
  },
};