import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const STAR_COLOR = {
  5: "#97B899",
  4: "#E3D58F",
  3: "#E9D8D6",
  2: "#F06F5B",
  1: "#F08D92",
};

function StarLabel({ x, y, width, value }) {
  return (
    <text
      x={x + width / 2}
      y={y - 14}
      textAnchor="middle"
      fontSize={14}
      fontWeight={700}
      fill="#2d1830"
    >
      {value}%
    </text>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tt.box}>
      <div style={tt.title}>{"★".repeat(Number(label))}{"☆".repeat(5 - Number(label))}</div>
      <div style={{ fontSize: 13, color: "#3d1f2d", fontWeight: 700 }}>{payload[0].value}% of reviews</div>
    </div>
  );
}

export default function RatingDistributionChart({ distribution }) {
  const data = [5, 4, 3, 2, 1].map((star) => ({
    star: String(star),
    pct: distribution[star] ?? 0,
  }));

  const avg = (
    data.reduce((sum, d) => sum + d.star * d.pct, 0) /
    data.reduce((sum, d) => sum + d.pct, 0)
  ).toFixed(1);

  return (
    <div style={card.wrapper}>
      <div style={card.inner}>
        <div style={{ ...card.blob, ...card.b1 }} />
        <div style={{ ...card.blob, ...card.b2 }} />
        <div style={card.spark1}>✦</div>
        <div style={card.spark2}>✧</div>

        <div style={card.header}>
          <div>
      
            <h3 style={card.title}>Rating Distribution</h3>
          </div>
          <div style={card.avgBadge}>
            <span style={card.avgNum}>{avg}</span>
            <span style={card.avgStar}>★</span>
          </div>
        </div>

        <div style={{ position: "relative", height: 280 }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={data}
      margin={{
        top: 30,
        right: 10,
        left: 10,
        bottom: 10,
      }}
      barCategoryGap="20%"
    >
      <YAxis hide domain={[0, 100]} />

      <XAxis
        dataKey="star"
        axisLine={false}
        tickLine={false}
        tick={({ x, y, payload }) => (
          <text
            x={x}
            y={y + 22}
            textAnchor="middle"
            fontSize={15}
            fontWeight={700}
            fill="#6f5b65"
          >
            {"★".repeat(Number(payload.value))}
          </text>
        )}
      />

      <Tooltip
        content={<CustomTooltip />}
        cursor={false}
      />

      <Bar
        dataKey="pct"
        radius={[22, 22, 0, 0]}
        label={<StarLabel />}
      >
        {data.map((d) => (
          <Cell
            key={d.star}
            fill={STAR_COLOR[Number(d.star)]}
            stroke="rgba(120,80,90,0.25)"
            strokeWidth={1}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

        <div style={card.footer}>Based on verified buyer reviews</div>
      </div>
    </div>
  );
}

const PINK = "#D4537E";
const PINK_BORDER = "rgba(244,192,209,0.6)";

const card = {
  wrapper: { width: "100%", minWidth: 0 },
  inner: {
    position: "relative",
    background: "linear-gradient(155deg,#FFF5F8 0%,#FFFFFF 45%,#FDF0F5 100%)",
    borderRadius: 28,
    padding: 24,
    border: `1px solid ${PINK_BORDER}`,
    boxShadow: "0 20px 50px -20px rgba(212,83,126,0.25),0 4px 12px rgba(212,83,126,0.06)",
    overflow: "hidden",
    fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    height: "100%",
    boxSizing: "border-box",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(40px)", opacity: 0.45, pointerEvents: "none" },
  b1: { width: 160, height: 160, background: "radial-gradient(circle,#F8BBD0,transparent 70%)", top: -50, right: -40 },
  b2: { width: 140, height: 140, background: "radial-gradient(circle,#FFD9A8,transparent 70%)", bottom: -50, left: -30 },
  spark1: { position: "absolute", top: 14, left: 18, color: "#EC6FA0", fontSize: 14, opacity: 0.5 },
  spark2: { position: "absolute", top: 80, right: 28, color: PINK, fontSize: 10, opacity: 0.6 },
  header: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: PINK, marginBottom: 4 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#3d1f2d", letterSpacing: "-0.01em" },
  avgBadge: {
    display: "flex", alignItems: "baseline", gap: 3,
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)",
    border: "1px solid rgba(244,192,209,0.7)", borderRadius: 14,
    padding: "8px 14px",
  },
  avgNum: { fontSize: 26, fontWeight: 800, color: "#3d1f2d", lineHeight: 1 },
  avgStar: { fontSize: 18, color: "#FFB800" },
  footer: { position: "relative", marginTop: 10, textAlign: "center", fontSize: 11, color: "#a07a89", fontStyle: "italic" },
};

const tt = {
  box: { background: "rgba(255,255,255,0.97)", border: "1px solid rgba(244,192,209,0.7)", borderRadius: 14, padding: "10px 14px", boxShadow: "0 10px 30px rgba(212,83,126,0.18)", fontFamily: "'Inter',sans-serif" },
  title: { fontSize: 13, color: "#a07a89", marginBottom: 4 },
};