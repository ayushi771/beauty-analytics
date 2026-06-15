import { useState } from "react";
// TopReviews.jsx
const PINK = "#D4537E";
const PINK_BORDER = "rgba(244,192,209,0.6)";
const GREEN = "#87ae73";
const GREEN_LIGHT = "rgba(135,174,115,0.12)";
const GREEN_BORDER = "rgba(135,174,115,0.4)";
const RED = "#c71e1e";
const RED_LIGHT = "rgba(199,30,30,0.08)";
const RED_BORDER = "rgba(199,30,30,0.25)";

function ReviewCard({ text, index, type }) {
  const isPositive = type === "positive";
  const [expanded, setExpanded] = useState(false);

  // Split into title and body if " — " separator exists
  const sepIdx = text.indexOf(" — ");
  const rawTitle = sepIdx > -1 ? text.slice(0 , sepIdx): null;
  const title = rawTitle && rawTitle.toLowerCase() !== "nan" && rawTitle.trim() !==""? rawTitle : null;
  const body  = sepIdx > -1 ? text.slice(sepIdx + 3) : text;

  const PREVIEW_LEN = 100;
  const isLong = body.length > PREVIEW_LEN;
  const displayBody = expanded || !isLong ? body : body.slice(0, PREVIEW_LEN) + "…";

  return (
    <div style={{
      ...rc.card,
      borderColor: isPositive ? GREEN_BORDER : RED_BORDER,
      background: isPositive ? GREEN_LIGHT : RED_LIGHT,
    }}>
      <div style={rc.top}>
        <span style={{ ...rc.index, color: isPositive ? GREEN : RED }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span style={{ ...rc.icon }}>
          {isPositive ? "★" : "✕"}
        </span>
      </div>
      {title && <div style={rc.title}>{title}</div>}
      <p style={rc.body}>{displayBody}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ ...rc.toggle, color: isPositive ? GREEN : RED }}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}

export default function TopReviews({ topPositiveReviews = [], topNegativeReviews = [] }) {
  if (!topPositiveReviews.length && !topNegativeReviews.length) return null;

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <div style={{ ...s.blob, ...s.b1 }} />
        <div style={{ ...s.blob, ...s.b2 }} />
        <div style={s.spark1}>✦</div>
        <div style={s.spark2}>✧</div>

        <div style={s.header}>
          <h3 style={s.title}>What Reviewers Are Saying</h3>
          <div style={s.badges}>
            <span style={{ ...s.badge, background: GREEN_LIGHT, color: GREEN, borderColor: GREEN_BORDER }}>
              ★ {topPositiveReviews.length} positive
            </span>
            <span style={{ ...s.badge, background: RED_LIGHT, color: RED, borderColor: RED_BORDER }}>
              ✕ {topNegativeReviews.length} negative
            </span>
          </div>
        </div>

        <div style={s.columns}>
          {/* LEFT — Positive */}
          <div style={s.col}>
            <div style={{ ...s.colHeader, borderColor: GREEN_BORDER }}>
              <span style={{ ...s.colDot, background: GREEN }} />
              <span style={{ ...s.colLabel, color: GREEN }}>Top Positive</span>
            </div>
            <div style={s.reviewList}>
              {topPositiveReviews.length > 0
                ? topPositiveReviews.map((text, i) => (
                    <ReviewCard key={i} text={text} index={i} type="positive" />
                  ))
                : <div style={s.empty}>No positive reviews available.</div>
              }
            </div>
          </div>

          {/* DIVIDER */}
          <div style={s.divider} />

          {/* RIGHT — Negative */}
          <div style={s.col}>
            <div style={{ ...s.colHeader, borderColor: RED_BORDER }}>
              <span style={{ ...s.colDot, background: RED }} />
              <span style={{ ...s.colLabel, color: RED }}>Top Critical</span>
            </div>
            <div style={s.reviewList}>
              {topNegativeReviews.length > 0
                ? topNegativeReviews.map((text, i) => (
                    <ReviewCard key={i} text={text} index={i} type="negative" />
                  ))
                : <div style={s.empty}>No critical reviews available.</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  wrapper: { width: "100%", minWidth: 0, marginTop: 20 },
  card: {
    position: "relative",
    background: "linear-gradient(155deg,#FFF5F8 0%,#FFFFFF 45%,#FDF0F5 100%)",
    borderRadius: 28, padding: 18,
    border: `1px solid ${PINK_BORDER}`,
    boxShadow: "0 20px 50px -20px rgba(212,83,126,0.25),0 4px 12px rgba(212,83,126,0.06)",
    overflow: "hidden",
    fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(40px)", opacity: 0.4, pointerEvents: "none" },
  b1: { width: 200, height: 200, background: "radial-gradient(circle,#F8BBD0,transparent 70%)", top: -70, right: -60 },
  b2: { width: 180, height: 180, background: "radial-gradient(circle,#FFD9A8,transparent 70%)", bottom: -60, left: -50 },
  spark1: { position: "absolute", top: 16, left: 20, color: "#EC6FA0", fontSize: 14, opacity: 0.5 },
  spark2: { position: "absolute", top: 90, right: 30, color: PINK, fontSize: 10, opacity: 0.6 },
  header: {
    position: "relative",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 10, marginBottom: 16,
  },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#3d1f2d", letterSpacing: "-0.01em" },
  badges: { display: "flex", gap: 8 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
    border: "1px solid",
  },
  columns: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr 1px 1fr",
    gap: 0,
    alignItems: "start",
  },
  col: { padding: "0 14px" },
  divider: {
    background: "linear-gradient(to bottom, transparent, rgba(244,192,209,0.6), transparent)",
    alignSelf: "stretch",
    minHeight: 100,
  },
  colHeader: {
    display: "flex", alignItems: "center", gap: 8,
    paddingBottom: 12, marginBottom: 14,
    borderBottom: "1px solid",
  },
  colDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  colLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  reviewList: { display: "flex", flexDirection: "column", gap: 6 },
  empty: { fontSize: 13, color: "#a07a89", fontStyle: "italic", padding: "12px 0" },
};

const rc = {
  card: {
    borderRadius: 14,
    border: "1px solid",
    padding: "8px 10px",
    position: "relative",
  },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  index: { fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", opacity: 0.7 },
  icon:  { fontSize: 12, opacity: 0.5 },
  title: { fontSize: 13, fontWeight: 700, color: "#3d1f2d", marginBottom: 5, lineHeight: 1.3 },
  body:  { fontSize: 11, color: "#5b3a4a", lineHeight: 1.5, margin: 0 },
  toggle: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 11, fontWeight: 600, padding: "4px 0 0", display: "block",
  },
};