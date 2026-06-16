import { useState, useRef, useEffect, useCallback } from "react";
import { useAnalysis } from "../hooks/useAnalysis";

const CATEGORIES = [
  { label: "Skincare", icon: "💧", q: "skincare" },
  { label: "Makeup", icon: "💄", q: "makeup" },
  { label: "Hair", icon: "✂️", q: "hair" },
  { label: "Fragrance", icon: "🌸", q: "fragrance" },
  { label: "Body care", icon: "🛁", q: "body care" },
];

function highlight(text, q) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(re, "<mark>$1</mark>");
}

export default function SearchBar({ analysis }) {
  const hook = useAnalysis();
  const {
    search,
    searching,
    suggestions,
    analyze,
    loading,
    loadBrandProducts,
  } = analysis || hook;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [brandProducts, setBrandProducts] = useState([]);
  const [showBrandProducts, setShowBrandProducts] = useState(false);

  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const debounce = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = useCallback((e) => {
    const q = e.target.value;
    setQuery(q);
    setShowBrandProducts(false);
    setBrandProducts([]);
    setSelected(null);
    setActiveCat(null);

    if (q.length < 2) {
      setOpen(false);
      return;
    }

    setOpen(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(q), 250);
  }, [search]);

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setActiveCat(null);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectProduct = (p) => {
    setSelected(p);
    setQuery(p.product_name);
    setOpen(false);
  };

  const handleSelectBrand = async (b) => {
    setQuery(b.brand_name);
    const products = await loadBrandProducts(b.brand_name);
    // ── Only show reviewed products in brand drill-down too ──
    setBrandProducts(products.filter((p) => p.has_reviews));
    setShowBrandProducts(true);
    setOpen(true);
  };

  const handleCat = (cat) => {
    const next = activeCat === cat ? null : cat;
    setActiveCat(next);
    if (next) {
      setQuery(next);
      setOpen(true);
      search(next);
    } else {
      setQuery("");
      setSelected(null);
      setOpen(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selected) return;
    await analyze({
      productId: selected.product_id,
      productName: selected.product_name,
    });
  };

  const { products = [], brands = [] } = suggestions;

  // ── Only show products that have real reviews — filter out "Catalog Only" ──
  const reviewedProducts = products.filter((p) => p.has_reviews);

  return (
    <nav style={styles.navbar}>
      {/* BRAND LOGO */}
      <a href="/" style={styles.brand}>
        <div style={styles.brandIcon}>✦</div>
        <span style={styles.brandName}>
          Beauty Product<span style={{ color: "var(--color-text-primary)", fontWeight: 400 }}> Analytics</span>
        </span>
      </a>

      {/* SEARCH BAR */}
      <div style={styles.searchWrap} ref={wrapRef}>
        <div style={{ ...styles.inputRow, ...(open ? styles.inputRowFocus : {}) }}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && selected) handleAnalyze();
            }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder="Search products, brands, or categories…"
            style={styles.input}
            aria-label="Search products"
          />
          {query && (
            <button onClick={handleClear} style={styles.clearBtn} aria-label="Clear">✕</button>
          )}
        </div>

        {/* DROPDOWN */}
        {open && (
          <div style={styles.dropdown}>
            {/* CATEGORY CHIPS */}
            <div style={styles.chips}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.q}
                  onClick={() => handleCat(c.q)}
                  style={{ ...styles.chip, ...(activeCat === c.q ? styles.chipActive : {}) }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {searching ? (
              <div style={styles.searching}>
                <div style={styles.spinner} /> Finding matches…
              </div>
            ) : brands.length === 0 && reviewedProducts.length === 0 ? (
              <div style={styles.empty}>No results for "{query}"</div>
            ) : (
              <>
                {/* BRANDS SECTION */}
                {brands.length > 0 && (
                  <>
                    <div style={styles.sectionLabel}>🏬 Brands</div>
                    <div style={styles.brandGrid}>
                      {brands.slice(0, 10).map((b) => (
                        <button
                          key={b.brand_name}
                          style={{
                            ...styles.brandPill,
                            ...(query.toLowerCase() === b.brand_name.toLowerCase()
                              ? styles.brandPillActive : {})
                          }}
                          onMouseDown={() => handleSelectBrand(b)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#FBEAF0";
                            e.currentTarget.style.borderColor = PINK;
                            e.currentTarget.style.color = PINK_DARK;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#f8f8f8";
                            e.currentTarget.style.borderColor = PINK_BORDER;
                            e.currentTarget.style.color = "#555";
                          }}
                        >
                          <span style={styles.brandPillIcon}>🏬</span>
                          <span
                            style={styles.brandPillName}
                            dangerouslySetInnerHTML={{ __html: highlight(b.brand_name, query) }}
                          />
                        </button>
                      ))}
                    </div>
                    {reviewedProducts.length > 0 && <div style={styles.divider} />}
                  </>
                )}

                {/* BRAND PRODUCTS — already filtered in handleSelectBrand */}
                {showBrandProducts ? (
                  <>
                    <div style={styles.sectionLabel}>✨ {query} Products</div>
                    {brandProducts.map((p) => (
                      <div
                        key={p.product_id}
                        style={styles.ddItem}
                        onMouseDown={() => handleSelectProduct(p)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FBEAF0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={styles.ddIcon}>💄</div>
                        <div style={styles.ddText}>
                          <div style={styles.ddName}>{p.product_name}</div>
                          <div style={styles.ddSub}>
                            {p.brand_name}
                            {p.catalog_reviews_count > 0 && ` · ${p.catalog_reviews_count.toLocaleString()} reviews`}
                          </div>
                        </div>
                      </div>
                    ))}
                    {brandProducts.length === 0 && (
                      <div style={styles.empty}>No reviewed products found for this brand.</div>
                    )}
                  </>
                ) : (
                  /* SEARCH PRODUCTS — filtered to reviewed only */
                  reviewedProducts.length > 0 && (
                    <>
                      <div style={styles.sectionLabel}>✦ Products</div>
                      {reviewedProducts.map((p) => (
                        <div
                          key={p.product_id}
                          style={styles.ddItem}
                          onMouseDown={() => handleSelectProduct(p)}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#FBEAF0")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={styles.ddIcon}>✦</div>
                          <div style={styles.ddText}>
                            <div
                              style={styles.ddName}
                              dangerouslySetInnerHTML={{ __html: highlight(p.product_name, query) }}
                            />
                            <div style={styles.ddSub}>
                              {p.brand_name}
                              {p.catalog_reviews_count > 0 && ` · ${p.catalog_reviews_count.toLocaleString()} reviews`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* SELECTED PRODUCT PILL */}
      {selected && (
        <div style={styles.pill}>
          <span style={styles.pillLabel}>{selected.brand_name || selected.product_name}</span>
          <button onClick={() => setSelected(null)} style={styles.pillClose}>✕</button>
        </div>
      )}

      {/* ANALYZE BUTTON */}
      <button
        style={{ ...styles.analyzeBtn, ...(!selected || loading ? styles.analyzeBtnDisabled : {}) }}
        disabled={!selected || loading}
        onClick={handleAnalyze}
      >
        {loading ? "Analyzing…" : "✦ Analyze"}
      </button>
    </nav>
  );
}

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════
const PINK = "#D4537E";
const PINK_LIGHT = "#FBEAF0";
const PINK_BORDER = "#F4C0D1";
const PINK_DARK = "#993556";

const styles = {
  brandGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    padding: "4px 12px 10px",
  },
  brandPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#f8f8f8",
    border: `0.5px solid ${PINK_BORDER}`,
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    color: "#555",
    transition: "background 0.12s, border-color 0.12s, color 0.12s",
    whiteSpace: "nowrap",
  },
  brandPillActive: {
    background: PINK_LIGHT,
    borderColor: PINK,
    color: PINK_DARK,
  },
  brandPillIcon: { fontSize: 11 },
  brandPillName: {
    maxWidth: "clamp(70px, 12vw, 100px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 clamp(10px, 3vw, 32px)",
    minHeight: 64,
    gap: "clamp(8px, 2vw, 24px)",
    fontFamily: "sans-serif",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    textDecoration: "none",
  },
  brandIcon: {
    width: 32,
    height: 32,
    background: PINK,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 15,
  },
  brandName: {
    fontSize: "clamp(13px, 2vw, 16px)",
    fontWeight: 500,
    color: PINK,
    letterSpacing: "-0.3px",
  },
  searchWrap: {
    flex: 1,
    minWidth: "220px",
    maxWidth: 480,
    position: "relative",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    background: "#f8f8f8",
    border: `1px solid ${PINK_BORDER}`,
    borderRadius: 999,
    padding: "0 8px",
    height: "clamp(36px, 5vw, 40px)",
    gap: 8,
    transition: "border-color 0.15s, background-color 0.15s",
  },
  inputRowFocus: {
    borderColor: PINK,
    background: "#fff",
  },
  searchIcon: { fontSize: 14, flexShrink: 0 },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "clamp(12px, 1.8vw, 14px)",
    minWidth: 0,
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    padding: 0,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: `0.5px solid ${PINK_BORDER}`,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 100,
    maxHeight: "70vh",
    overflowY: "auto",
    boxShadow: "0 4px 16px rgba(212,83,126,0.08)",
  },
  chips: {
    display: "flex",
    gap: 6,
    padding: "8px 12px",
    flexWrap: "wrap",
    borderBottom: `0.5px solid ${PINK_BORDER}`,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#f8f8f8",
    border: `0.5px solid ${PINK_BORDER}`,
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 11,
    cursor: "pointer",
    color: "#666",
  },
  chipActive: {
    background: PINK_LIGHT,
    borderColor: PINK,
    color: PINK_DARK,
  },
  searching: {
    padding: "1rem 14px",
    fontSize: 13,
    color: "#888",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    width: 14,
    height: 14,
    border: `2px solid ${PINK_BORDER}`,
    borderTopColor: PINK,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  empty: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#aaa",
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: PINK,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "10px 14px 4px",
  },
  ddItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    cursor: "pointer",
    transition: "background 0.1s",
    background: "transparent",
  },
  ddIcon: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: PINK_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    flexShrink: 0,
  },
  ddText: { flex: 1, minWidth: 0 },
  ddName: {
    fontSize: "clamp(12px, 1.7vw, 13px)",
    color: "#111",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ddSub: {
    fontSize: "clamp(10px, 1.5vw, 11px)",
    color: "#888",
    marginTop: 1,
  },
  divider: {
    height: 0.5,
    background: PINK_BORDER,
    margin: "4px 0",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: PINK_LIGHT,
    border: `1px solid #ED93B1`,
    borderRadius: 999,
    padding: "0 10px",
    height: 28,
    fontSize: "clamp(11px, 1.7vw, 12px)",
    color: PINK_DARK,
    flexShrink: 0,
    maxWidth: "clamp(100px, 20vw, 160px)",
  },
  pillLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  pillClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: PINK,
    fontSize: 12,
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  analyzeBtn: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    background: PINK,
    color: "#fcf8f8",
    border: "none",
    borderRadius: 999,
    padding: "0 clamp(12px, 2vw, 18px)",
    height: "clamp(36px, 5vw, 40px)",
    fontSize: "clamp(12px, 1.8vw, 14px)",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  analyzeBtnDisabled: {
    cursor: "not-allowed",
  },
};