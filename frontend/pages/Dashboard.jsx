import SearchBar from "../components/SearchBar";
import ProductHero from "../components/ProductHero";
import SentimentKPIs from "../components/SentimentKPIs";
import AspectSentimentChart from "../components/AspectSentimentChart";
import SkinTypeDonutChart from "../components/SkinTypeDonutChart";
import DemographicTreemap from "../components/DemographicTreemap";
import RatingDistributionChart from "../components/RatingDistributionChart";
import TopReviews from "../components/TopReviews";
import SentimentTrendChart from "../components/SentimentTrendChart";
import AiInsightsPanel from "../components/AiInsightsPanel";
import IngredientPanel from "../components/IngredientPanel";

export default function Dashboard({ analysis }) {
  const { result, loading, error } = analysis || {};

  return (
    <div style={styles.pageContainer}>
      <style>{globalCss}</style>

      <div className="gl-bg" aria-hidden="true">
  <BackgroundPatches isAnalysis={!!result} />
</div>

      <div style={{ position: "relative", zIndex: 999 }}>
        <SearchBar analysis={analysis} />
      </div>

      <main style={styles.mainContent}>
        {!loading && !result && !error && <IdleState />}

        {loading && (
          <div style={styles.centerContent}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Analyzing reviews…</p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        {result && !loading && (
          <>
            <ProductHero product={result.product} analysis={result} />
            <SentimentKPIs distribution={result.distribution} />
            <IngredientPanel productId={result.product?.product_id} />
            <div className="gl-chart-grid">
              <AspectSentimentChart aspects={result.aspect_sentiment} />
              <SkinTypeDonutChart data={result.skin_type_breakdown} />
            </div>
            <div className="gl-chart-grid">
              <DemographicTreemap
                skinTone={result.skin_tone_breakdown}
                eyeColor={result.eye_color_breakdown}
                hairColor={result.hair_color_breakdown}
              />
              <RatingDistributionChart distribution={result.rating_distribution} />
            </div>
            <TopReviews
              topPositiveReviews={result.top_positive_reviews}
              topNegativeReviews={result.top_negative_reviews}
            />
            <SentimentTrendChart data={result.sentiment_over_time} />
            {result.analysis_available && (
              <AiInsightsPanel
                productId={result.product?.product_id}
                productName={result.product?.product_name}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// BACKGROUND — geometric color patches
// All positions use % or px-from-top so they spread naturally
// across the full document height when .gl-bg is position:absolute
// ════════════════════════════════════════════════════════════════
function BackgroundPatches({ isAnalysis }) {
  return (
    <>
      

    <svg
  className="gl-patches"
  viewBox={isAnalysis ? "0 0 1440 3000" : "0 0 1440 1200"}
  preserveAspectRatio="xMidYMin meet"
  aria-hidden="true"
>
        {/* ── Top-left triangle ── */}
        <polygon points="0,0 280,0 0,200" fill="#7C3AED" opacity="0.06" />
        <polygon points="0,0 280,0 0,200" fill="#7C3AED" opacity="0.06" />

        {/* ── Left side — perfume/bottle icon ~30% down ── */}
        <g transform="translate(0 900) scale(0.3) rotate(-12 300 300)" opacity="0.15">
          <path fill="#7C3AED" d="m293.98 425.94c0 58.125 47.293 105.41 105.42 105.41 58.129 0 105.41-47.281 105.41-105.41s-47.281-105.42-105.41-105.42c-58.125 0.003906-105.42 47.293-105.42 105.42zm205.79 0c0 55.34-45.031 100.37-100.37 100.37-55.348 0-100.38-45.031-100.38-100.37 0-55.348 45.031-100.38 100.38-100.38 55.34 0.003906 100.37 45.027 100.37 100.38z" />
          <path fill="#7C3AED" d="m283.72 425.59c0 63.781 51.898 115.68 115.68 115.68 63.789 0 115.67-51.891 115.67-115.68 0-63.789-51.887-115.68-115.67-115.68s-115.68 51.887-115.68 115.68zm226.31 0c0 61-49.637 110.64-110.63 110.64-61.008 0-110.64-49.637-110.64-110.64s49.637-110.64 110.64-110.64c61 0 110.63 49.633 110.63 110.64z" />
          <path fill="#7C3AED" d="m455.27 279.91h93.32v-2.5195c0-26.344-75.551-42.09-148.6-42.09-73.043 0-148.59 15.742-148.59 42.09v2.5195h94.566v1.3672c0 3.3672 1.3867 6.4492 3.6797 8.7617-53.734 20.199-92.082 72.102-92.082 132.8 0 78.207 63.625 141.83 141.83 141.83 78.211 0 141.84-63.625 141.84-141.83 0-60.039-37.52-111.45-90.324-132.11 2.707-2.3242 4.3594-5.7031 4.3594-9.457v-1.3633zm-198.45-5.0352c5.0898-17.121 61.332-34.531 143.18-34.531 81.855 0 138.1 17.406 143.18 34.531zm279.38 147.97c0 75.43-61.375 136.79-136.8 136.79-75.434 0-136.79-61.367-136.79-136.79 0-75.426 61.363-136.79 136.79-136.79 75.426 0 136.8 61.363 136.8 136.79z" />
        </g>

        {/* ── Right side — makeup palette ~13% down ── */}
        <g transform="translate(1255 400) scale(0.2) rotate(20 270 256)" opacity="0.21">
          <path fill="#10B981" d="m619.59 307.4h-439.19v15.113l0.28906 0.003906-0.28906 0.34766 17.758 14.559h70.223v1.4727h-75.828v153.7h414.89v-153.7h-75.832v-1.4727h70.223l17.758-14.559-0.28906-0.34766h0.28906v-15.117zm-17.191 36.531v143.62h-404.81v-143.62h70.797v7.7344h263.22v-7.7344zm-2.3711-11.547h-400.07l-12.047-9.8711h424.15zm14.523-14.906h-429.11v-5.0391h429.11z" />
          <path fill="#b42aa1" d="m315.23 361.77h-91.504c-6.9492 0-12.594 5.6523-12.594 12.594v91.5c0 6.9492 5.6484 12.594 12.594 12.594h91.5c6.9492 0 12.594-5.6484 12.594-12.594l0.003906-91.5c0-6.9414-5.6484-12.594-12.594-12.594z" />
          <path fill="#f6e1d5" d="m445.75 361.77h-91.504c-6.9492 0-12.594 5.6523-12.594 12.594v91.5c0 6.9492 5.6484 12.594 12.594 12.594h91.5c6.9492 0 12.594-5.6484 12.594-12.594l0.003906-91.5c0-6.9414-5.6484-12.594-12.594-12.594z" />
          <path fill="#86502d" d="m472.18 374.36v91.5c0 6.9492 5.6484 12.594 12.594 12.594h91.492c6.9492 0 12.594-5.6484 12.594-12.594l0.003906-91.5c0-6.9414-5.6484-12.594-12.594-12.594h-91.492c-6.9492 0-12.598 5.6523-12.598 12.594z" />
        </g>

        <polygon
  points="1440,3400 1200,3300 1440,2980"
  fill="#0891B2"
  opacity="0.1"
/>

      

        {/* ── Left — lipstick icon ~10% down ── */}
        <g transform="translate(100 300) scale(3)" opacity="0.20">
          <path fill="#F15A29" d="M6.47541 7.1557379h6.4508195v5.4098363H6.47541z" />
          <path fill="#F15A29" d="M7.7356558 6.1557379V0.5l2.0091028 1.0213795c1.1762362.5790699 1.9212246 1.7762096 1.9212246 3.0872598v1.5470986H7.7356558z" />
          <path fill="#1B75BC" d="M5 29.8401489C5 30.7568359 5.743103 31.5 6.6598511 31.5h2.8203735c-.4995728-.5447388-.8122559-1.263916-.8122559-2.0595703v-4.6616211c0-.140625.0297852-.2792969.0869141-.4077148.9933472-2.2253418 3.2095337-3.6633911 5.6467285-3.6655884v-1.0395508H5V29.8401489z" />
          <path fill="#00BBB4" d="M5 12.5655518h9.4016113v4.4569702H5z" />
          <path fill="#F15A29" d="M22.2606201 21.704834h-7.8532104c-1.9411621 0-3.6992798 1.0899048-4.5896606 2.795166h17.0325317c-.8901001-1.7052612-2.6482177-2.795166-4.5896597-2.795166z" />
          <path fill="#1B75BC" d="M9.6680298 26.5v2.9405518c0 1.1373901.9219971 2.0594482 2.0594482 2.0594482h13.2130737C26.0780029 31.5 27 30.5779419 27 29.4405518V26.5H9.6680298z" />
        </g>

        {/* ── Right — bottle icon ~63% down ── */}
        <g transform="translate(1280 1550) scale(0.2)" opacity="0.08">
          <path fill="#7C3AED" d="M121.829,0l1.535,76.78l33.727,302.372V512h197.818V379.151L388.546,77.57l0.088-0.79L390.171,0H121.829z M320,477.091h-29.583C287.645,460.581,273.296,448,256,448c-17.295,0-31.645,12.582-34.417,29.091H192v-81.455h128V477.091z M321.839,360.727H190.161l-28.553-256h188.784L321.839,360.727z M353.857,69.818H158.142l-0.699-34.909h197.114L353.857,69.818z" />
          <rect x="209.455" y="186.182" width="93.091" height="34.909" fill="#0891B2" />
          <rect x="232.727" y="244.364" width="46.545" height="34.909" fill="#10B981" />
        </g>

        {/* ── Extra icons for very long pages (analysis result) ── */}

        {/* Left — perfume bottle repeated ~65% down */}
        <g transform="translate(10 2300) scale(0.3) rotate(-12 300 300)" opacity="0.15">
          <path fill="#7C3AED" d="m293.98 425.94c0 58.125 47.293 105.41 105.42 105.41 58.129 0 105.41-47.281 105.41-105.41s-47.281-105.42-105.41-105.42c-58.125 0.003906-105.42 47.293-105.42 105.42zm205.79 0c0 55.34-45.031 100.37-100.37 100.37-55.348 0-100.38-45.031-100.38-100.37 0-55.348 45.031-100.38 100.38-100.38 55.34 0.003906 100.37 45.027 100.37 100.38z" />
          <path fill="#7C3AED" d="m455.27 279.91h93.32v-2.5195c0-26.344-75.551-42.09-148.6-42.09-73.043 0-148.59 15.742-148.59 42.09v2.5195h94.566v1.3672c0 3.3672 1.3867 6.4492 3.6797 8.7617-53.734 20.199-92.082 72.102-92.082 132.8 0 78.207 63.625 141.83 141.83 141.83 78.211 0 141.84-63.625 141.84-141.83 0-60.039-37.52-111.45-90.324-132.11 2.707-2.3242 4.3594-5.7031 4.3594-9.457v-1.3633zm-198.45-5.0352c5.0898-17.121 61.332-34.531 143.18-34.531 81.855 0 138.1 17.406 143.18 34.531zm279.38 147.97c0 75.43-61.375 136.79-136.8 136.79-75.434 0-136.79-61.367-136.79-136.79 0-75.426 61.363-136.79 136.79-136.79 75.426 0 136.8 61.363 136.8 136.79z" />
        </g>

        {/* Right — makeup palette repeated ~80% down */}
        <g transform="translate(1255 2400) scale(0.2) rotate(20 270 256)" opacity="0.12">
          <path fill="#10B981" d="m619.59 307.4h-439.19v15.113l0.28906 0.003906-0.28906 0.34766 17.758 14.559h70.223v1.4727h-75.828v153.7h414.89v-153.7h-75.832v-1.4727h70.223l17.758-14.559-0.28906-0.34766h0.28906v-15.117zm-17.191 36.531v143.62h-404.81v-143.62h70.797v7.7344h263.22v-7.7344zm-2.3711-11.547h-400.07l-12.047-9.8711h424.15zm14.523-14.906h-429.11v-5.0391h429.11z" />
          <path fill="#b42aa1" d="m315.23 361.77h-91.504c-6.9492 0-12.594 5.6523-12.594 12.594v91.5c0 6.9492 5.6484 12.594 12.594 12.594h91.5c6.9492 0 12.594-5.6484 12.594-12.594l0.003906-91.5c0-6.9414-5.6484-12.594-12.594-12.594z" />
          <path fill="#f6e1d5" d="m445.75 361.77h-91.504c-6.9492 0-12.594 5.6523-12.594 12.594v91.5c0 6.9492 5.6484 12.594 12.594 12.594h91.5c6.9492 0 12.594-5.6484 12.594-12.594l0.003906-91.5c0-6.9414-5.6484-12.594-12.594-12.594z" />
          <path fill="#86502d" d="m472.18 374.36v91.5c0 6.9492 5.6484 12.594 12.594 12.594h91.492c6.9492 0 12.594-5.6484 12.594-12.594l0.003906-91.5c0-6.9414-5.6484-12.594-12.594-12.594h-91.492c-6.9492 0-12.598 5.6523-12.598 12.594z" />
        </g>

        

      </svg>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// IDLE / LANDING STATE
// ════════════════════════════════════════════════════════════════
function IdleState() {
  const steps = [
    { icon: "⌕",  title: "Search a product",     desc: "Type a product name, brand, or category — try \"hair mask\" or \"NARS\"." },
    { icon: "◈",  title: "Hit Analyze",           desc: "We pull real customer reviews and run sentiment analysis instantly." },
    { icon: "⬡",  title: "Explore the breakdown", desc: "See sentiment by aspect, skin type, skin tone, ratings, and trends over time." },
    { icon: "◎",  title: "Get the AI verdict",    desc: "A beauty-editor-style summary tells you exactly who this product is for." },
  ];

  const features = [
    { icon: "◈", label: "Ingredient analysis" },
    { icon: "◉", label: "Real reviews, ranked" },
    { icon: "⬡", label: "Sentiment over time" },
    { icon: "◎", label: "Skin tone & type insights" },
    { icon: "✦", label: "AI-written verdicts" },
  ];

  return (
    <div className="gl-idle-wrapper">
      <div className="gl-idle-hero">
        <div style={idle.heroBadge}>✦ Beauty Intelligence</div>
        <h1 className="gl-idle-title">
          Know before you{" "}
          <span style={idle.heroAccent}>glow</span>
          <span style={idle.heroDot}>.</span>
        </h1>
        <p className="gl-idle-sub">
          Search any Sephora product to see what thousands of real reviewers
          actually think — broken down by skin type, tone etc.
        </p>
        <div style={idle.searchHint}>
          <span style={idle.arrow}>↑</span>
          Try <strong>"vitamin C serum"</strong>, <strong>"Olaplex"</strong>, or <strong>"setting spray"</strong>
        </div>
      </div>

      <div style={idle.section}>
        <div style={idle.sectionLabel}>HOW IT WORKS</div>
        <div className="gl-steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="gl-step-card" style={idle.stepCard}>
              <div style={{ ...idle.stepAccent, background: STEP_COLORS[i] }} />
              <div style={idle.stepNum}>0{i + 1}</div>
              <div style={idle.stepIcon}>{s.icon}</div>
              <div style={idle.stepTitle}>{s.title}</div>
              <div style={idle.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={idle.section}>
        <div style={idle.sectionLabel}>WHAT YOU'LL SEE</div>
        <div className="gl-features-row">
          {features.map((f, i) => (
            <div key={i} style={{ ...idle.featureChip, borderColor: CHIP_COLORS[i] }}>
              <span style={{ color: CHIP_COLORS[i], fontSize: 15 }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STEP_COLORS = ["#7C3AED", "#0891B2", "#10B981", "#F59E0B"];
const CHIP_COLORS = ["#7C3AED", "#0891B2", "#10B981", "#F59E0B", "#EC4899"];

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════
const styles = {
  pageContainer: {
    position: "relative",  // gl-bg is absolute inside this
    minHeight: "100vh",
  },
  mainContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1300,
    width: "100%",
    margin: "0 auto",
    padding: "7px",
    boxSizing: "border-box",
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 300,
    textAlign: "center",
    padding: "0 16px",
  },
  loadingText: {
    fontSize: "0.9rem",
    color: "#888",
    margin: 0,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #e2e2e2",
    borderTopColor: "#7C3AED",
    borderRadius: "50%",
    animation: "glSpin 0.7s linear infinite",
    marginBottom: 12,
  },
  errorBox: {
    background: "#fff8f0",
    border: "1px solid #fcd5a0",
    borderRadius: 14,
    padding: "1rem 1.25rem",
    fontSize: 14,
    color: "#92400e",
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    boxSizing: "border-box",
  },
};

const idle = {
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(124,58,237,0.07)",
    border: "1px solid rgba(124,58,237,0.22)",
    borderRadius: 999,
    padding: "5px 16px",
    fontSize: 11,
    fontWeight: 700,
    color: "#6D28D9",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: 24,
  },
  heroAccent: {
    background: "linear-gradient(110deg, #7C3AED 0%, #0891B2 50%, #10B981 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  heroDot: {
    color: "#F59E0B",
  },
  searchHint: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.8)",
    border: "1px dashed #ccc",
    borderRadius: 999,
    padding: "10px 24px",
    fontSize: 13,
    color: "#666",
  },
  arrow: {
    fontSize: 15,
    color: "#7C3AED",
    display: "inline-block",
    animation: "glBounce 1.8s ease-in-out infinite",
  },
  section: {
    marginBottom: 52,
  },
  sectionLabel: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "3px",
    color: "#aaa",
    marginBottom: 28,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  stepCard: {
    position: "relative",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 20,
    padding: "28px 22px 24px",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  },
  stepAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    borderRadius: "20px 20px 0 0",
  },
  stepNum: {
    fontSize: 10,
    fontWeight: 800,
    color: "#ccc",
    letterSpacing: "2px",
    marginBottom: 14,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  stepIcon: {
    fontSize: 26,
    marginBottom: 12,
    display: "block",
    color: "#444",
    fontFamily: "monospace",
  },
  stepTitle: {
    fontFamily: "'Syne', 'Space Grotesk', system-ui, sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: "#0F0E17",
    marginBottom: 8,
  },
  stepDesc: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 13,
    color: "#777",
    lineHeight: 1.65,
  },
  featureChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.75)",
    border: "1px solid",
    borderRadius: 999,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

// ════════════════════════════════════════════════════════════════
// GLOBAL CSS
// ════════════════════════════════════════════════════════════════
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

  @keyframes glSpin   { to { transform: rotate(360deg); } }
  @keyframes glBounce { 0%,100%{transform:translateY(0);opacity:.6} 50%{transform:translateY(-5px);opacity:1} }
  @keyframes glDrift  { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(28px,-20px) scale(1.04)} 70%{transform:translate(-18px,22px) scale(0.97)} }

  /* ── Background
     position: absolute — stretches to full document height so Chrome DevTools
     "Capture full size screenshot" (which scrolls+stitches) captures it once.
     position: fixed would repaint the bg at every scroll chunk = repeating tiles.
     Icons stay visible everywhere because the SVG viewBox is 1440x3000 and
     patches are spread at % intervals down the full height. ── */
  .gl-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  background:
    radial-gradient(circle at 15% 40%, #7C3AED10 0%, transparent 35%),
    radial-gradient(circle at 85% 60%, #10B98110 0%, transparent 35%),
    radial-gradient(circle at 50% 50%, #EC489910 0%, transparent 30%);
}
.gl-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      rgba(124,58,237,0.04) 0%,
      rgba(8,145,178,0.03) 35%,
      rgba(16,185,129,0.03) 70%,
      rgba(236,72,153,0.03) 100%
    );
}

  .gl-patches {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  min-height: 100%;
}

  .gl-blob {
    position: absolute;
    border-radius: 50%;
    filter: none;
    animation: glDrift 22s ease-in-out infinite;
  }

  .gl-step-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.09);
  }

  /* ── Chart grid — responsive ── */
  .gl-chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr));
    gap: 20px;
    align-items: stretch;
    margin-top: 24px;
    width: 100%;
    box-sizing: border-box;
  }

  /* ── Steps grid ── */
  .gl-steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
    gap: 16px;
  }

  /* ── Idle wrapper ── */
  .gl-idle-wrapper {
    max-width: 1100px;
    margin: 0 auto;
    padding: 52px 16px 88px;
    box-sizing: border-box;
  }

  .gl-idle-hero {
    text-align: center;
    margin-bottom: 64px;
  }

  .gl-idle-title {
    font-family: 'Syne', 'Space Grotesk', system-ui, sans-serif;
    font-size: clamp(2.2rem, 6vw, 4.2rem);
    font-weight: 800;
    color: #0F0E17;
    margin: 0 0 20px;
    letter-spacing: -0.03em;
    line-height: 1.08;
  }

  .gl-idle-sub {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: clamp(0.9rem, 2.5vw, 1.05rem);
    color: #555;
    max-width: 560px;
    margin: 0 auto 28px;
    line-height: 1.75;
    font-weight: 400;
  }

  .gl-features-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  /* ── Mobile overrides ── */
  @media (max-width: 600px) {
    .gl-idle-wrapper { padding: 32px 12px 56px; }
    .gl-idle-hero    { margin-bottom: 40px; }
    .gl-features-row { gap: 8px; }
    .gl-step-card    { padding: 20px 16px 18px !important; }
  }

  @media (max-width: 400px) {
    .gl-features-row > * {
      font-size: 12px !important;
      padding: 7px 12px !important;
    }
  }
`;