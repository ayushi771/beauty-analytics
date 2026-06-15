import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const SKIN_META = {
  combination: { label: "Combination", color: "#EC6FA0" },
  dry: { label: "Dry",  color: "#F4A988" },
  normal: { label: "Normal", color: "#B57BA6" },
  oily: { label: "Oily",  color: "#7FB8C9" },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipTitle}>{d.emoji} {d.label}</div>
      <div style={styles.tooltipRow}>
        <span style={{ ...styles.dot, background: d.color }} />
        Positive <strong style={styles.tooltipVal}>{d.positive_pct}%</strong>
      </div>
      <div style={styles.tooltipMentions}>{d.count} reviews</div>
    </div>
  );
}

export default function SkinTypeDonutChart({ data: skinData }) {
  const data = Object.entries(skinData)
  .map(([key, value]) => ({
    key,
    label: SKIN_META[key]?.label || key,
    emoji: SKIN_META[key]?.emoji || "•",
    color: SKIN_META[key]?.color || "#D4537E",
    count: value.count,
    positive_pct: value.positive_pct,
  }))
  .filter((d) => d.positive_pct > 0);

  const totalReviews = data.reduce((sum, d) => sum + d.count, 0);
  const weightedPositive =
    data.reduce((sum, d) => sum + d.positive_pct * d.count, 0) / totalReviews;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ ...styles.blob, ...styles.blobOne }} />
        <div style={{ ...styles.blob, ...styles.blobTwo }} />
        <div style={styles.sparkle1}>✦</div>
        <div style={styles.sparkle2}>✧</div>
        <div style={styles.sparkle3}>✦</div>

        <div style={styles.header}>
          <div>
           
            <h3 style={styles.title}>Positive Reviews by Skin Type</h3>
          </div>
          <span style={styles.badge}>
            <span style={styles.badgeDot} />
            {totalReviews} reviews
          </span>
        </div>

        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <defs>
                {data.map((d) => (
                  <linearGradient key={d.key} id={`skinGrad-${d.key}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={d.color} stopOpacity={0.65} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
  data={data}
  dataKey="count"
  nameKey="label"
  cx="50%"
  cy="50%"
  innerRadius={62}
  outerRadius={100}
  paddingAngle={3}
  stroke="#fff"
  strokeWidth={2}
  label={({ positive_pct }) => `${positive_pct}%`}
  labelLine={false}
>
  {data.map((d) => (
    <Cell key={d.key} fill={`url(#skinGrad-${d.key})`} />
  ))}
</Pie>
              
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

         
        </div>

        <div style={styles.legend}>
          {data.map((d) => (
            <div key={d.key} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: d.color }} />
              <span style={styles.legendLabel}>{d.emoji} {d.label}</span>
              <span style={styles.legendPct}>{d.positive_pct}%</span>
              <span style={styles.legendCount}>· {d.count}</span>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
  width: "100%",
  minWidth: 0,
  display: "flex",
},
  card: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(155deg, #FFF5F8 0%, #FFFFFF 45%, #FDF0F5 100%)",
    borderRadius: 28,
    padding: 24,
    border: "1px solid rgba(244,192,209,0.6)",
    boxShadow:
      "0 20px 50px -20px rgba(212,83,126,0.28), 0 4px 12px rgba(212,83,126,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(40px)", opacity: 0.55, pointerEvents: "none" },
  blobOne: { width: 180, height: 180, background: "radial-gradient(circle, #F8BBD0, transparent 70%)", top: -60, right: -50 },
  blobTwo: { width: 160, height: 160, background: "radial-gradient(circle, #FFD9A8, transparent 70%)", bottom: -60, left: -40 },
  sparkle1: { position: "absolute", top: 14, left: 18, color: "#EC6FA0", fontSize: 14, opacity: 0.5 },
  sparkle2: { position: "absolute", top: 80, right: 28, color: "#D4537E", fontSize: 10, opacity: 0.6 },
  sparkle3: { position: "absolute", bottom: 22, right: 50, color: "#B57BA6", fontSize: 12, opacity: 0.5 },
  header: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "#D4537E", marginBottom: 4 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#3d1f2d", letterSpacing: "-0.01em" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(6px)", color: "#D4537E", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 700, border: "1px solid rgba(244,192,209,0.7)" },
  badgeDot: { width: 6, height: 6, borderRadius: "50%", background: "#EC6FA0", boxShadow: "0 0 0 3px rgba(236,111,160,0.2)" },
  chartWrap: { position: "relative" },
  centerLabel: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" },
  centerPct: { fontSize: 28, fontWeight: 800, color: "#3d1f2d", letterSpacing: "-0.02em", lineHeight: 1 },
  centerSub: { marginTop: 4, fontSize: 11, fontWeight: 600, color: "#a07a89", textTransform: "uppercase", letterSpacing: "1px" },
  legend: { position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b4a58", fontWeight: 600, background: "rgba(255,255,255,0.6)", padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(244,192,209,0.4)" },
  legendDot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  legendLabel: { flex: 1 },
  legendPct: { color: "#3d1f2d", fontWeight: 700 },
  legendCount: { color: "#a07a89", fontWeight: 500, fontSize: 11 },
  footer: { position: "relative", marginTop: 12, textAlign: "center", fontSize: 11, color: "#a07a89", fontStyle: "italic" },
  tooltip: { background: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)", border: "1px solid rgba(244,192,209,0.7)", borderRadius: 14, padding: "10px 14px", boxShadow: "0 10px 30px rgba(212,83,126,0.18)", fontFamily: "'Inter', sans-serif", minWidth: 160 },
  tooltipTitle: { fontSize: 13, fontWeight: 700, color: "#3d1f2d", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed rgba(244,192,209,0.7)" },
  tooltipRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b4a58" },
  tooltipVal: { marginLeft: "auto", color: "#3d1f2d" },
  dot: { width: 8, height: 8, borderRadius: "50%" },
  tooltipMentions: { marginTop: 6, fontSize: 10, color: "#a07a89", textAlign: "right", fontStyle: "italic" },
};
