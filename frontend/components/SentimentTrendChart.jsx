import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";

const COLORS = {
  positive: "#87ae73",
  neutral:  "#E8B97A",
  negative: "#c71e1e",
};

function formatMonth(str) {
  const [year, month] = str.split("-");
  const m = new Date(+year, +month - 1).toLocaleString("default", { month: "short" });
  return `${m} '${year.slice(2)}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.payload?.count;
  return (
    <div style={tt.box}>
      <div style={tt.title}>{formatMonth(label)}</div>
      {["positive", "neutral", "negative"].map(key => {
        const p = payload.find(p => p.dataKey === key);
        if (!p) return null;
        return (
          <div key={key} style={tt.row}>
            <span style={{ ...tt.dot, background: COLORS[key] }} />
            <span style={tt.key}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <strong style={tt.val}>{Number(p.value).toFixed(1)}%</strong>
          </div>
        );
      })}
      {count != null && <div style={tt.sub}>{count.toLocaleString()} reviews</div>}
    </div>
  );
}

function CustomXAxisTick({ x, y, payload, data }) {
  const idx = data.findIndex(d => d.month === payload.value);
  const step =
    data.length > 72 ? 12 :
    data.length > 48 ? 8 :
    data.length > 24 ? 4 :
    data.length > 12 ? 2 : 1;
  if (idx % step !== 0) return null;
  return (
    <text x={x} y={y + 14} textAnchor="middle" fontSize={10} fill="#a07a89" fontWeight={600}>
      {formatMonth(payload.value)}
    </text>
  );
}

export default function SentimentTrendChart({ data = [] }) {
  if (!data || data.length < 2) return null;

  // ---- Derived values (this is what was missing) ----
  const minPositive = data.reduce(
    (min, d) => (d.positive < min ? d.positive : min),
    data[0].positive
  );
  const worstMonth = data.reduce(
    (min, d) => (d.positive < min.positive ? d : min),
    data[0]
  );
  const yMin = Math.max(0, Math.floor((minPositive - 10) / 10) * 10);

  return (
    <div style={card.wrapper}>
      <div style={card.inner}>
        <div style={{ ...card.blob, ...card.b1 }} />
        <div style={{ ...card.blob, ...card.b2 }} />
        <div style={card.spark1}>✦</div>
        <div style={card.spark2}>✧</div>

        <div style={card.header}>
          <div>
            <div style={card.eyebrow}>OVER TIME</div>
            <h3 style={card.title}>Sentiment Trend</h3>
          </div>
          <div style={card.meta}>
            <span style={card.metaItem}>{data.length} months</span>
            <span style={card.metaDot}>·</span>
            <span style={card.metaItem}>
              {formatMonth(data[0].month)} – {formatMonth(data[data.length - 1].month)}
            </span>
          </div>
        </div>

        <div style={card.legend}>
          {["positive", "neutral", "negative"].map(key => (
            <span key={key} style={card.legendItem}>
              <span style={{ ...card.legendDot, background: COLORS[key] }} />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
          ))}
        </div>

        <div style={{ height: 260, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 4 }}>
              <defs>
                {["positive", "neutral", "negative"].map(key => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={COLORS[key]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS[key]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,192,209,0.35)" vertical={false} />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={<CustomXAxisTick data={data} />}
                height={28}
                interval={0}
              />
              <YAxis
                domain={[yMin, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#a07a89" }}
                tickFormatter={v => `${v}%`}
                width={40}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(212,83,126,0.25)", strokeWidth: 1 }} />

              <ReferenceLine
                x={worstMonth.month}
                stroke="rgba(199,30,30,0.35)"
                strokeDasharray="4 3"
                label={{ value: "↓ low", position: "top", fontSize: 10, fill: "#c71e1e", fontWeight: 700 }}
              />

              <Area
                type="monotone"
                dataKey="negative"
                stroke={COLORS.negative}
                strokeWidth={1.5}
                fill="url(#grad-negative)"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stroke={COLORS.neutral}
                strokeWidth={1.5}
                fill="url(#grad-neutral)"
              />
              <Area
                type="monotone"
                dataKey="positive"
                stroke={COLORS.positive}
                strokeWidth={2.5}
                fill="url(#grad-positive)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card.footer}>
          Monthly sentiment across {data.reduce((s, d) => s + (d.count || 0), 0).toLocaleString()} reviews
        </div>
      </div>
    </div>
  );
}

const PINK = "#D4537E";
const PINK_BORDER = "rgba(244,192,209,0.6)";

const card = {
  wrapper: { width: "100%", minWidth: 0 , marginTop:20 , marginBottom:20},
  inner: {
    position: "relative",
    background: "linear-gradient(155deg,#FFF5F8 0%,#FFFFFF 45%,#FDF0F5 100%)",
    borderRadius: 28, padding: 24,
    border: `1px solid ${PINK_BORDER}`,
    boxShadow: "0 20px 50px -20px rgba(212,83,126,0.25),0 4px 12px rgba(212,83,126,0.06)",
    overflow: "hidden",
    fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    boxSizing: "border-box",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(40px)", opacity: 0.45, pointerEvents: "none" },
  b1: { width: 180, height: 180, background: "radial-gradient(circle,#F8BBD0,transparent 70%)", top: -60, right: -50 },
  b2: { width: 160, height: 160, background: "radial-gradient(circle,#FFD9A8,transparent 70%)", bottom: -60, left: -40 },
  spark1: { position: "absolute", top: 14, left: 18, color: "#EC6FA0", fontSize: 14, opacity: 0.5 },
  spark2: { position: "absolute", top: 80, right: 28, color: PINK, fontSize: 10, opacity: 0.6 },
  header: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12, flexWrap: "wrap" },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: PINK, marginBottom: 4 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#3d1f2d", letterSpacing: "-0.01em" },
  meta: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a07a89" },
  metaItem: { fontWeight: 600 },
  metaDot: { opacity: 0.5 },
  legend: { position: "relative", display: "flex", gap: 14, marginBottom: 4 },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b4a58", fontWeight: 600 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  footer: { marginTop: 10, textAlign: "center", fontSize: 11, color: "#a07a89", fontStyle: "italic", position: "relative" },
};

const tt = {
  box: { background: "rgba(255,255,255,0.97)", border: "1px solid rgba(244,192,209,0.7)", borderRadius: 14, padding: "10px 14px", boxShadow: "0 10px 30px rgba(212,83,126,0.18)", fontFamily: "'Inter',sans-serif", minWidth: 170 },
  title: { fontSize: 13, fontWeight: 700, color: "#3d1f2d", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed rgba(244,192,209,0.7)" },
  row: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b4a58", padding: "2px 0" },
  key: { flex: 1 },
  val: { color: "#3d1f2d" },
  dot: { width: 8, height: 8, borderRadius: "50%" },
  sub: { marginTop: 6, fontSize: 10, color: "#a07a89", textAlign: "right", fontStyle: "italic" },
};
