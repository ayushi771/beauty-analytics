import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const emojiMap = {
  texture: "😊",
  results: "✨",
  price: "💸",
  packaging: "📦",
  scent: "🌸",
  skin_reaction: "🧴",
};
const COLORS = {
  positive: "#87ae73", // rose pink
  neutral: "#FFD9A8",  // peach
  negative: "#c71e1e", // mauve
};
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  const total = (row.positive || 0) + (row.neutral || 0) + (row.negative || 0);
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);
  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipTitle}>
        {emojiMap[label]} {label.replace("_", " ")}
      </div>
      <div style={styles.tooltipRow}>
        <span style={{ ...styles.dot, background: COLORS.positive }} />
        Positive <strong style={styles.tooltipVal}>{pct(row.positive)}%</strong>
      </div>
      <div style={styles.tooltipRow}>
        <span style={{ ...styles.dot, background: COLORS.neutral }} />
        Neutral <strong style={styles.tooltipVal}>{pct(row.neutral)}%</strong>
      </div>
      <div style={styles.tooltipRow}>
        <span style={{ ...styles.dot, background: COLORS.negative }} />
        Negative <strong style={styles.tooltipVal}>{pct(row.negative)}%</strong>
      </div>
      {row.mentions != null && (
        <div style={styles.tooltipMentions}>{row.mentions} mentions</div>
      )}
    </div>
  );
}
export default function AspectSentimentChart({ aspects }) {
  const data = Object.entries(aspects).map(([name, value]) => ({
    aspect: name,
    positive: value.positive,
    neutral: value.neutral,
    negative: value.negative,
    mentions: value.mentions,
  }));
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* decorative background blobs */}
        <div style={{ ...styles.blob, ...styles.blobOne }} />
        <div style={{ ...styles.blob, ...styles.blobTwo }} />
        <div style={styles.sparkle1}>✦</div>
        <div style={styles.sparkle2}>✧</div>
        <div style={styles.sparkle3}>✦</div>
        <div style={styles.header}>
          <div>
            
            <h3 style={styles.title}>Product Aspect Sentiment</h3>
          </div>
          <span style={styles.badge}>
            <span style={styles.badgeDot} />
            {data.length} aspects
          </span>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: COLORS.positive }} />
            Positive
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: COLORS.neutral }} />
            Neutral
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: COLORS.negative }} />
            Negative
          </span>
        </div>
        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={Math.max(260, data.length * 54)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 20, left: 10, bottom: 8 }}
              barCategoryGap={14}
            >
              <defs>
                <linearGradient id="gradPositive" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F8BBD0" />
                  <stop offset="100%" stopColor="#EC6FA0" />
                </linearGradient>
                <linearGradient id="gradNeutral" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFE0B8" />
                  <stop offset="100%" stopColor="#FFB877" />
                </linearGradient>
                <linearGradient id="gradNegative" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C89BC0" />
                  <stop offset="100%" stopColor="#8E5A88" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                dataKey="aspect"
                type="category"
                width={120}
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => (
                  <text
                    x={x - 6}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="13"
                    fontWeight="600"
                    fill="#5b3a4a"
                    style={{ textTransform: "capitalize" }}
                  >
                    {emojiMap[payload.value] || "•"} {payload.value.replace("_", " ")}
                  </text>
                )}
              />
              <Tooltip
                cursor={{ fill: "rgba(244,192,209,0.18)" }}
                content={<CustomTooltip />}
              />
              <Bar
  dataKey="positive"
  stackId="a"
  fill="#87ae73"
  radius={[10, 0, 0, 10]}
/>

<Bar
  dataKey="neutral"
  stackId="a"
  fill="url(#gradNeutral)"
  radius={[0, 0, 0, 0]}
/>

<Bar
  dataKey="negative"
  stackId="a"
  fill="#c71e1e"
  radius={[0, 10, 10, 0]}
/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.footer}>
          Tap a bar to see sentiment breakdown
        </div>
      </div>
    </div>
  );
}
const styles = {
  // replace only the wrapper style at the bottom
wrapper: {
  width: "100%",   // fill whatever the grid cell gives it
  minWidth: 0,     // don't blow out the cell
},
  card: {
    position: "relative",
    background:
      "linear-gradient(155deg, #FFF5F8 0%, #FFFFFF 45%, #FDF0F5 100%)",
    borderRadius: 28,
    padding: 24,
    border: "1px solid rgba(244,192,209,0.6)",
    boxShadow:
      "0 20px 50px -20px rgba(212,83,126,0.25), 0 4px 12px rgba(212,83,126,0.06)",
    overflow: "hidden",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(40px)",
    opacity: 0.55,
    pointerEvents: "none",
  },
  blobOne: {
    width: 180,
    height: 180,
    background: "radial-gradient(circle, #F8BBD0, transparent 70%)",
    top: -60,
    right: -50,
  },
  blobTwo: {
    width: 160,
    height: 160,
    background: "radial-gradient(circle, #FFD9A8, transparent 70%)",
    bottom: -60,
    left: -40,
  },
  sparkle1: {
    position: "absolute",
    top: 14,
    left: 18,
    color: "#EC6FA0",
    fontSize: 14,
    opacity: 0.5,
  },
  sparkle2: {
    position: "absolute",
    top: 80,
    right: 28,
    color: "#D4537E",
    fontSize: 10,
    opacity: 0.6,
  },
  sparkle3: {
    position: "absolute",
    bottom: 22,
    right: 50,
    color: "#B57BA6",
    fontSize: 12,
    opacity: 0.5,
  },
  header: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1.5px",
    color: "#D4537E",
    marginBottom: 4,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#3d1f2d",
    letterSpacing: "-0.01em",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(6px)",
    color: "#D4537E",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 700,
    border: "1px solid rgba(244,192,209,0.7)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#EC6FA0",
    boxShadow: "0 0 0 3px rgba(236,111,160,0.2)",
  },
  legend: {
    position: "relative",
    display: "flex",
    gap: 14,
    marginBottom: 10,
    paddingLeft: 4,
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: "#6b4a58",
    fontWeight: 600,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  chartWrap: {
    position: "relative",
  },
  footer: {
    position: "relative",
    marginTop: 10,
    textAlign: "center",
    fontSize: 11,
    color: "#a07a89",
    fontStyle: "italic",
  },
  tooltip: {
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(244,192,209,0.7)",
    borderRadius: 14,
    padding: "10px 14px",
    boxShadow: "0 10px 30px rgba(212,83,126,0.18)",
    fontFamily: "'Inter', sans-serif",
    minWidth: 160,
  },
  tooltipTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#3d1f2d",
    textTransform: "capitalize",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: "1px dashed rgba(244,192,209,0.7)",
  },
  tooltipRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#6b4a58",
    padding: "2px 0",
  },
  tooltipVal: {
    marginLeft: "auto",
    color: "#3d1f2d",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  tooltipMentions: {
    marginTop: 6,
    fontSize: 10,
    color: "#a07a89",
    textAlign: "right",
    fontStyle: "italic",
  },
};