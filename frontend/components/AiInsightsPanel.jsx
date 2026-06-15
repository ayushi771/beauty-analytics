import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Gem,
} from "lucide-react";

import { getAiSummary } from "../utils/api";

const PINK = "#D4537E";
const PINK_BORDER = "rgba(244,192,209,0.6)";

function parseAiSummary(text) {
  if (!text) return {};

  const sections = {};

  const matches = text.matchAll(
    /\*\*(.*?)\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g
  );

  for (const match of matches) {
    sections[match[1].trim()] = match[2].trim();
  }

  return sections;
}

export default function AiInsightsPanel({
  productId,
  productName,
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAiSummary(productId);
      setSummary(data.summary);
    } catch {
      setError("Could not generate AI summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSummary(null);
    setError(null);

    if (productId) {
      fetchSummary();
    }
  }, [productId]);

  const parsed = parseAiSummary(summary);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Decorative Glow */}
        <div style={{ ...styles.blob, ...styles.blob1 }} />
        <div style={{ ...styles.blob, ...styles.blob2 }} />

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <Sparkles size={14} />
          </div>

          <div>
            <h3 style={styles.title}>
              AI Beauty Insights
            </h3>

            <p style={styles.subtitle}>
              Personalized intelligence generated
              from real customer reviews
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />

            <span style={styles.loadingText}>
              Analyzing {productName}...
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate */}
        {!loading && !summary && !error && (
          <button
            style={styles.generateBtn}
            onClick={fetchSummary}
          >
            Generate AI Summary
          </button>
        )}

        {/* Results */}
        {!loading && summary && (
          <div style={styles.stack}>
            {/* Verdict */}
            <div style={styles.verdictCard}>
              <Label
                icon={<Sparkles size={14} />}
              >
                Quick Verdict
              </Label>

              <p style={styles.verdictText}>
                {parsed["QUICK VERDICT"]}
              </p>
            </div>

            {/* Good / Bad */}
            <div style={styles.grid}>
              <div style={styles.goodCard}>
                <Label
                  icon={
                    <CheckCircle2 size={14} />
                  }
                >
                  What It Does Well
                </Label>

                <p style={styles.body}>
                  {
                    parsed[
                      "WHAT IT DOES WELL"
                    ]
                  }
                </p>
              </div>

              <div style={styles.warnCard}>
                <Label
                  icon={
                    <AlertTriangle size={14} />
                  }
                >
                  Watch Out For
                </Label>

                <p style={styles.body}>
                  {
                    parsed[
                      "WATCH OUT FOR"
                    ]
                  }
                </p>
              </div>
            </div>

            {/* Best For */}
            <div style={styles.bestForCard}>
              <Label
                icon={<Heart size={14} />}
              >
                Best For
              </Label>

              <p style={styles.body}>
                {parsed["BEST FOR"]}
              </p>
            </div>

            {/* Bottom Line */}
            <div style={styles.bottomCard}>
              <Label
                icon={<Gem size={14} />}
              >
                The Bottom Line
              </Label>

              <p style={styles.bottomText}>
                {
                  parsed[
                    "THE BOTTOM LINE"
                  ]
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ icon, children }) {
  return (
    <div style={styles.label}>
      {icon}
      {children}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    marginTop: 24,
  },

  card: {
    position: "relative",
    overflow: "hidden",

    padding: 28,

    borderRadius: 28,

    background:
      "linear-gradient(155deg,#FFF6FA 0%,#FFFFFF 45%,#FFF2F7 100%)",

    border: `1px solid ${PINK_BORDER}`,

    boxShadow:
      "0 20px 50px -20px rgba(212,83,126,0.18)",
  },

  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  blob1: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
   
  },

  blob2: {
    width: 180,
    height: 180,
    left: -50,
    bottom: -70,
   
  },

  header: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginBottom: 24,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,

    background:
      "linear-gradient(135deg,#D4537E,#EC7CA0)",

    color: "#fff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#331B25",
  },

  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#8A6B78",
  },

  loading: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 0",
  },

  spinner: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: `2px solid ${PINK_BORDER}`,
    borderTopColor: PINK,
    animation:
      "spin 0.7s linear infinite",
  },

  loadingText: {
    color: "#8A6B78",
    fontSize: 14,
  },

  error: {
    padding: 14,
    borderRadius: 12,
    background: "#FFF0F3",
    color: "#B13E58",
  },

  generateBtn: {
    display: "block",
    margin: "0 auto",

    padding: "12px 26px",

    border: "none",
    borderRadius: 999,

    background: PINK,
    color: "#fff",

    fontWeight: 600,
    cursor: "pointer",
  },

  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: 8,

    marginBottom: 10,

    fontSize: 11,
    fontWeight: 800,

    color: PINK,

    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  verdictCard: {
    padding: 20,
    borderRadius: 20,
    background:
      "linear-gradient(135deg,#FFF5F8,#FFFFFF)",
    border:
      "1px solid rgba(244,192,209,0.4)",
  },

  verdictText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#3D1F2D",
    fontWeight: 500,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  goodCard: {
    padding: 18,
    borderRadius: 18,
    background: "#F4FFF7",
    border:
      "1px solid rgba(34,197,94,0.15)",
  },

  warnCard: {
    padding: 18,
    borderRadius: 18,
    background: "#FFF8F1",
    border:
      "1px solid rgba(251,146,60,0.15)",
  },

  bestForCard: {
    padding: 18,
    borderRadius: 18,
    background: "#FFF6FB",
    border:
      "1px solid rgba(244,192,209,0.4)",
  },

  bottomCard: {
    padding: 20,
    borderRadius: 20,
    background:
      "linear-gradient(135deg,#FFF9FB,#FFFDFD)",

    border:
      "1px solid rgba(212,83,126,0.15)",
  },

  body: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.8,
    color: "#4A2D3A",
  },

  bottomText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#3D1F2D",
    fontWeight: 600,
  },
};