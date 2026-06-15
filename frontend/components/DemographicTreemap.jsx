import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const SKIN_META = {
  deep:        { label: "Deep",         color: "#6B3A2A" },
  tan:         { label: "Tan",          color: "#C47C3E" },
  dark:        { label: "Dark",         color: "#C4884E" },
  medium:      { label: "Medium",       color: "#D4956A" },
  lightmedium: { label: "Light Medium", color: "#E2A87A" },  // ← was lightMedium
  light:       { label: "Light",        color: "#EDBC96" },
  fairlight:   { label: "Fair Light",   color: "#F2CBAD" },  // ← was fairLight
  fair:        { label: "Fair",         color: "#F8DEC8" },
  mediumtan:   { label: "Medium Tan",   color: "#C89B6E" },  // ← add if needed
  olive:       { label: "Olive",        color: "#CCAB8B" },
  porcelain:   { label: "Porcelain",    color: "#f8e2e5" },
  ebony:       { label: "Ebony",        color: "#543328" },
  rich : {label:"rich" , color:"#E2B8A2"}
};

const EYE_COLORS = {
  brown: "#8B5E3C", blue: "#4A90D9", green: "#5A9E6F",
  hazel: "#9B7A3D", gray: "#8A9BA8", amber: "#D4943A",auburn: "#A52A2A", other: "#B57BA6", blonde :"#F0E2B6" , brunette : "#251D19" ,
};

const HAIR_COLORS = {
  black:    "#2C2C2C",
  brown:    "#7B4F2E",
  brunette: "#3B2A20",   // ← add
  auburn:   "#A52A2A",   // ← add
  blonde:   "#D4AA6A",
  red:      "#C0392B",
  gray:     "#8A8A8A",
  white:    "#DDDDDD",
  other:    "#B57BA6",
};

function getColor(type, key) {
  if (type === "skin_tone") return SKIN_META[key]?.color || "#D4537E";
  if (type === "eye_color") return EYE_COLORS[key] || "#B57BA6";
  return HAIR_COLORS[key] || "#B57BA6";
}

function getLabel(type, key) {
  if (type === "skin_tone") return SKIN_META[key]?.label || key;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d || !d.color) return null;
  return (
    <div style={tt.box}>
      <div style={tt.title}>{d.displayLabel}</div>
      <div style={tt.row}>
        <span style={{ ...tt.dot, background: d.color }} />
        Positive <strong style={tt.val}>{d.positive_pct}%</strong>
      </div>
      <div style={tt.sub}>{d.count} reviews</div>
    </div>
  );
}

// Defined OUTSIDE any other component so React doesn't remount it every render
function TreemapCell(props) {
  const { x, y, width, height, depth, color, displayLabel, positive_pct } = props;
  if (depth === 0 || !color) return null;
  const tooSmall = width < 50 || height < 30;
  const shortLabel =
  width < 60
    ? displayLabel.split(" ")[0]
    : displayLabel;
  return (
    <g>
      <rect
        x={x + 1} y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        fill={color}
        rx={6}
        style={{ cursor: "pointer" }}
      />
    
        <>
          <text
  x={x + width / 2}
  y={y + height / 2 - 6}
  textAnchor="middle"
  fontSize="10"
  fontWeight="700"
  fill="#fff"
>
  {shortLabel}
</text>

<text
  x={x + width / 2}
  y={y + height / 2 + 8}
  textAnchor="middle"
  fontSize="9"
  fill="#fff"
>
  {positive_pct}%
</text>
        </>
      
    </g>
  );
}

function Section({ title, type, rawData, availableHeight }) {
  const entries = Object.entries(rawData).map(([key, val]) => [
    key.toLowerCase().trim(), val
  ]);
  if (!entries.length) return null;

  const total = entries.reduce((sum, [, v]) => sum + v.count, 0);
  const data = entries.map(([key, val]) => ({
    name:         key,
    displayLabel: getLabel(type, key),
    size:         total === 0 ? 1 : val.count,
    count:        val.count,
    positive_pct: val.positive_pct,
    color:        getColor(type, key),
  }));

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={sec.label}>{title}</div>
      <div style={{ height: availableHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data} dataKey="size" content={<TreemapCell />} isAnimationActive={false}>
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default function DemographicTreemap({ skinTone, eyeColor, hairColor }) {
  const hasSkin = skinTone && Object.keys(skinTone).length > 0;
  const hasEye  = eyeColor  && Object.keys(eyeColor).length  > 0;
  const hasHair = hairColor && Object.keys(hairColor).length > 0;
  const activeCount = [hasSkin, hasEye, hasHair].filter(Boolean).length;
  const TOTAL_HEIGHT = 320;
  const LABEL_HEIGHT = 24;   // space the "SKIN TONE" label takes
  const perSectionHeight = Math.floor(
    (TOTAL_HEIGHT - activeCount * LABEL_HEIGHT) / activeCount
  );
  if (!hasSkin && !hasEye && !hasHair) return null;

  return (
    <div style={card.wrapper}>
        <div style={{ ...card.inner, minHeight: TOTAL_HEIGHT + 80 }}>
        <div style={{ ...card.blob, ...card.b1 }} />
        <div style={{ ...card.blob, ...card.b2 }} />
        <div style={card.spark1}>✦</div>
        <div style={card.spark2}>✧</div>

        <div style={card.header}>
          <div>
          
            <h3 style={card.title}>detailed breakdown</h3>
          </div>
        </div>

        {hasSkin && (
          <Section title="Skin Tone"  type="skin_tone"  rawData={skinTone}
            availableHeight={perSectionHeight} />
        )}
        {hasEye && (
          <Section title="Eye Color"  type="eye_color"  rawData={eyeColor}
            availableHeight={perSectionHeight} />
        )}
        {hasHair && (
          <Section title="Hair Color" type="hair_color" rawData={hairColor}
            availableHeight={perSectionHeight} />
        )}
       
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
    borderRadius: 28, padding: 24,
    border: `1px solid ${PINK_BORDER}`,
    boxShadow: "0 20px 50px -20px rgba(212,83,126,0.25),0 4px 12px rgba(212,83,126,0.06)",
    overflow: "hidden",
    fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    height: "100%", boxSizing: "border-box",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(40px)", opacity: 0.45, pointerEvents: "none" },
  b1: { width: 180, height: 180, background: "radial-gradient(circle,#F8BBD0,transparent 70%)", top: -60, right: -50 },
  b2: { width: 160, height: 160, background: "radial-gradient(circle,#FFD9A8,transparent 70%)", bottom: -60, left: -40 },
  spark1: { position: "absolute", top: 14, left: 18, color: "#EC6FA0", fontSize: 14, opacity: 0.5 },
  spark2: { position: "absolute", top: 80, right: 28, color: PINK, fontSize: 10, opacity: 0.6 },
  header: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: PINK, marginBottom: 4 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#3d1f2d", letterSpacing: "-0.01em" },
  footer: { position: "relative", marginTop: 8, textAlign: "center", fontSize: 11, color: "#a07a89", fontStyle: "italic" },
};

const sec = {
  label: { fontSize: 11, fontWeight: 700, color: "#a07a89", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 },
};

const tt = {
  box: { background: "rgba(255,255,255,0.97)", border: "1px solid rgba(244,192,209,0.7)", borderRadius: 14, padding: "10px 14px", boxShadow: "0 10px 30px rgba(212,83,126,0.18)", fontFamily: "'Inter',sans-serif", minWidth: 150 },
  title: { fontSize: 13, fontWeight: 700, color: "#3d1f2d", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed rgba(244,192,209,0.7)" },
  row: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b4a58" },
  val: { marginLeft: "auto", color: "#3d1f2d" },
  dot: { width: 8, height: 8, borderRadius: "50%" },
  sub: { marginTop: 6, fontSize: 10, color: "#a07a89", textAlign: "right", fontStyle: "italic" },
};