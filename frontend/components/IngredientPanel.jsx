import { useState, useEffect } from "react";
import { getIngredientAnalysis } from "../utils/api";

const PINK        = "#D4537E";
const PINK_BORDER = "rgba(244,192,209,0.6)";
const GREEN       = "#4a7a3a";
const GREEN_BG    = "#eef6e9";
const GREEN_BD    = "#b5d9a0";
const ORANGE      = "#995500";
const ORANGE_BG   = "#fff4e0";
const ORANGE_BD   = "#f5c97a";
const GREY        = "#555";
const GREY_BG     = "#f5f5f5";
const GREY_BD     = "#ddd";

const TOP_N = 5;

const SKIN_TYPES = [
  { value: "normal",      label: "Normal" },
  { value: "dry",         label: "Dry" },
  { value: "oily",        label: "Oily" },
  { value: "combination", label: "Combination" },
  { value: "sensitive",   label: "Sensitive" },
  { value: "acne-prone",  label: "Acne-Prone" },
];

const HAIR_TYPES = [
  { value: "normal",             label: "Normal" },
  { value: "dry",                label: "Dry" },
  { value: "oily",               label: "Oily" },
  { value: "curly",              label: "Curly" },
  { value: "frizzy hair",        label: "Frizzy" },
  { value: "damaged hair",       label: "Damaged" },
  { value: "color-treated hair", label: "Color-Treated" },
  { value: "fine hair",          label: "Fine" },
];

const CAT_LABEL = {
  actives:           "Active",
  hydrators:         "Hydrator",
  silicones:         "Silicone",
  antioxidants:      "Antioxidant",
  preservatives:     "Preservative",
  ph_adjusters:      "Stabilizer",
  fragrance_related: "Fragrance",
  natural_extracts:  "Natural Extract",
  surfactants:       "Surfactant",
  emulsifiers:       "Emulsifier",
  uv_filters:        "UV Filter",
  proteins:          "Protein",
  emollients:        "Emollient",
  other:             "Base",
};

const SKIP_CONCERNS = ["None.", "None significant."];

function IngCard({ ing, bg, borderColor, labelColor }) {
  const hasConcern = ing.concerns && !SKIP_CONCERNS.includes(ing.concerns);
  return (
    <div style={{
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      padding: "9px 11px",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: labelColor, marginBottom: 1 }}>
        {ing.name}
      </div>
      <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 }}>
        {CAT_LABEL[ing.category] || ing.category}
      </div>
      {ing.benefits && (
        <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5, marginBottom: hasConcern ? 4 : 0 }}>
          {ing.benefits}
        </div>
      )}
      {hasConcern && (
        <div style={{ fontSize: 11, color: ORANGE, lineHeight: 1.5 }}>
          ⚠ {ing.concerns}
        </div>
      )}
    </div>
  );
}

function Section({ label, labelColor, bg, borderColor, items, total }) {
  if (!items || items.length === 0) return null;
  const shown = items.slice(0, TOP_N);
  const rest  = total - shown.length;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: labelColor, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
        
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(225px,1fr))", gap: 7 }}>
        {shown.map((ing, i) => (
          <IngCard key={i} ing={ing} bg={bg} borderColor={borderColor} labelColor={labelColor} />
        ))}
      </div>
      
    </div>
  );
}

export default function IngredientPanel({ productId }) {
  const [selectedType, setSelectedType] = useState("normal");
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showFullList, setShowFullList] = useState(false);

  const isHair      = data?.product_type === "haircare";
  const typeOptions = isHair ? HAIR_TYPES : SKIN_TYPES;

  useEffect(() => {
    setLoading(true);
    getIngredientAnalysis(productId, selectedType, false)
      .then((res) => {
        setData({
          ...res,
          avoid_for_user:   res.avoid_for_user   || res.high_concern    || [],
          caution_for_user: res.caution_for_user || res.caution_matches || [],
          great_for_user:   res.great_for_user   || res.good_matches    || [],
          neutral_for_user: res.neutral_for_user || res.safe_ingredients || [],
          full_list:        res.full_list        || [],
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId, selectedType]);

  if (loading && !data) {
    return (
      <div style={s.wrapper}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0" }}>
          <div style={s.spinner} />
          <span style={{ fontSize: 13, color: "#a07a89", fontStyle: "italic" }}>Analyzing ingredients…</span>
        </div>
      </div>
    );
  }

  if (!data || !data.has_ingredients) return null;

  const productTypeLabel =
    data.product_type === "haircare" ? "Hair Care"  :
    data.product_type === "perfume"  ? "Fragrance"  :
    data.product_type === "bodycare" ? "Body Care"  : "Skin Care";

  const selectedLabel = typeOptions.find((t) => t.value === selectedType)?.label || selectedType;

  const hasAnyMatches =
    data.avoid_for_user.length   > 0 ||
    data.caution_for_user.length > 0 ||
    data.great_for_user.length   > 0 ||
    data.neutral_for_user.length > 0;

  return (
    <div style={s.wrapper}>
      <div style={{ ...s.blob, ...s.b1 }} />
      <div style={{ ...s.blob, ...s.b2 }} />

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.eyebrow}>INGREDIENT GUIDE</div>
          <h3 style={s.title}>What's Inside</h3>
        </div>
        <div style={s.typeTag}>{productTypeLabel}</div>
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 16 }}>
        <span style={s.selectorLabel}>Your {isHair ? "hair" : "skin"} type:</span>
        <div style={s.pillRow}>
          {typeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              style={{ ...s.pill, ...(selectedType === t.value ? s.pillActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections — top 5 each */}
      <Section
        label={`Great for ${selectedLabel}`}
        labelColor={GREEN}
        bg={GREEN_BG}
        borderColor={GREEN_BD}
        items={data.great_for_user}
        total={data.great_for_user.length}
      />
      <Section
        label="Use with caution"
        labelColor={ORANGE}
        bg={ORANGE_BG}
        borderColor={ORANGE_BD}
        items={data.caution_for_user}
        total={data.caution_for_user.length}
      />
      <Section
        label="Neutral"
        labelColor={GREY}
        bg={GREY_BG}
        borderColor={GREY_BD}
        items={data.neutral_for_user}
        total={data.neutral_for_user.length}
      />

      {!hasAnyMatches && (
        <p style={{ fontSize: 12, color: "#a07a89", fontStyle: "italic", padding: "8px 0" }}>
          No recognized ingredients to evaluate for {selectedLabel}.
        </p>
      )}

      {/* Full list toggle */}
      {data.full_list && data.full_list.length > 0 && (
        <div style={s.fullListSection}>
          <button style={s.toggleBtn} onClick={() => setShowFullList((v) => !v)}>
            {showFullList ? "▲ Hide" : "▼ Show"} all ingredients ({data.total_ingredients})
          </button>
          {showFullList && (
            <div style={s.fullGrid}>
              {data.full_list.map((name, i) => (
                <div key={i} style={s.fullItem}>
                  <span style={s.fullNum}>{i + 1}.</span>
                  <span style={s.fullName}>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper: {
    position: "relative",
    background: "linear-gradient(155deg,#FFF5F8 0%,#FFFFFF 45%,#FDF0F5 100%)",
    border: `1px solid ${PINK_BORDER}`,
    borderRadius: 24,
    padding: 18,
    marginTop: 20,
    overflow: "hidden",
    fontFamily: "'Inter',-apple-system,sans-serif",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(40px)", opacity: 0.35, pointerEvents: "none" },
  b1: { width: 100, height: 180, background: "radial-gradient(circle,#F8BBD0,transparent 70%)", top: -60, right: -50 },
  b2: { width: 120, height: 160, background: "radial-gradient(circle,#FFD9A8,transparent 70%)", bottom: -60, left: -40 },
  header: {
    position: "relative", display: "flex",
    justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16,
  },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: PINK, marginBottom: 4 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#3d1f2d" },
  typeTag: {
    fontSize: 11, fontWeight: 700, color: "#666",
    background: "rgba(212,83,126,0.1)", padding: "4px 10px", borderRadius: 6,
  },
  selectorLabel: { fontSize: 12, color: "#a07a89", fontWeight: 600, marginBottom: 8, display: "block" },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  pill: {
    background: "#f8f8f8", border: `1px solid ${PINK_BORDER}`, borderRadius: 999,
    padding: "5px 13px", fontSize: 12, fontWeight: 600, color: "#666", cursor: "pointer",
  },
  pillActive: { background: "#FBEAF0", borderColor: PINK, color: "#993556" },
  fullListSection: { marginTop: 18, paddingTop: 14, borderTop: `1px solid ${PINK_BORDER}` },
  toggleBtn: {
    fontSize: 12, fontWeight: 600, color: PINK,
    background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 10,
  },
  fullGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 7,
  },
  fullItem: {
    display: "flex", gap: 8, fontSize: 11, color: "#555",
    padding: "6px 10px", background: "rgba(255,255,255,0.8)",
    borderRadius: 6, border: `1px solid ${PINK_BORDER}`,
  },
  fullNum: { fontWeight: 700, color: PINK, minWidth: 20 },
  fullName: { flex: 1, wordBreak: "break-word" },
  spinner: {
    width: 18, height: 18, border: `2px solid ${PINK_BORDER}`,
    borderTopColor: PINK, borderRadius: "50%",
    animation: "spin 0.7s linear infinite", flexShrink: 0,
  },
};