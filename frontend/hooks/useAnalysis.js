// hooks/useAnalysis.js
import { useState, useCallback, useRef } from "react";
import { suggest, searchAll, analyzeById, analyzeByName, getBrandProducts } from "../utils/api";

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState({
    products: [],
    brands: [],
  });
  const [hasAnalysis, setHasAnalysis] = useState(false);

  // Debounce ref — cancels stale suggest calls while typing
  const suggestTimer = useRef(null);
  // AbortController ref — cancels in-flight suggest requests on new keystroke
  const suggestAbort = useRef(null);

  // ════════════════════════════════════════════════════════════════
  // LOAD BRAND PRODUCTS
  // ════════════════════════════════════════════════════════════════
  const loadBrandProducts = useCallback(async (brand) => {
    try {
      console.log("📦 Loading products for brand:", brand);
      const data = await getBrandProducts(brand);
      const products = data.products || [];
      console.log("✅ Loaded products:", products.length);
      return products;
    } catch (err) {
      console.error("❌ Error loading brand products:", err);
      return [];
    }
  }, []);

  // ════════════════════════════════════════════════════════════════
  // SEARCH (Debounced Autocomplete)
  // Used while typing in search bar
  // ════════════════════════════════════════════════════════════════
  const search = useCallback((q) => {
    // Clear previous debounce timer
    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    if (!q?.trim() || q.length < 2) {
      setSuggestions({ products: [], brands: [] });
      return;
    }

    suggestTimer.current = setTimeout(async () => {
      // Abort any in-flight request
      if (suggestAbort.current) suggestAbort.current.abort();
      suggestAbort.current = new AbortController();

      setSearching(true);
      try {
        const data = await suggest(q, 10);
        setSuggestions({
          products: data.products || [],
          brands: data.brands || [],
        });
      } catch (e) {
        // Ignore abort errors (user kept typing)
        if (e?.code !== "ERR_CANCELED") {
          setSuggestions({ products: [], brands: [] });
        }
      } finally {
        setSearching(false);
      }
    }, 250); // 250ms debounce
  }, []);

  // ════════════════════════════════════════════════════════════════
  // FULL SEARCH
  // Used when user submits / presses Enter
  // ════════════════════════════════════════════════════════════════
  const searchFull = useCallback(async (q, limit = 10) => {
    if (!q?.trim() || q.length < 2) return;
    setSearching(true);
    try {
      const data = await searchAll(q, limit);
      setSuggestions({
        products: data.results || [],
        brands: data.brands || [],
      });
    } catch {
      setSuggestions({ products: [], brands: [] });
    } finally {
      setSearching(false);
    }
  }, []);

  // ════════════════════════════════════════════════════════════════
  // ANALYZE - MAIN FUNCTION
  // Called when user clicks "Analyze" button
  // ════════════════════════════════════════════════════════════════
  const analyze = useCallback(async ({ productId, productName }) => {
    console.log("🔍 Starting analysis with:", { productId, productName });

    // Validation
    if (!productId && !productName) {
      setError("No product selected");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null); // Clear previous result
    setHasAnalysis(false);

    try {
      let data;

      // Try product ID first (more reliable)
      if (productId) {
        console.log("📍 Analyzing by product ID:", productId);
        data = await analyzeById(productId);
      } else {
        console.log("📍 Analyzing by product name:", productName);
        data = await analyzeByName(productName);
      }

      if (!data) {
        throw new Error("No data returned from API");
      }

      console.log("✅ Analysis complete:", data);

      // Update state with result
      setResult(data);
      setHasAnalysis(Boolean(data?.analysis_available));
      setError(null);
    } catch (e) {
      console.error("❌ Analysis error:", e);
      const errorMsg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "An error occurred during analysis.";
      setError(errorMsg);
      setResult(null);
      setHasAnalysis(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ════════════════════════════════════════════════════════════════
  // CLEAR ALL STATE
  // ════════════════════════════════════════════════════════════════
  const clear = useCallback(() => {
    setError(null);
    setResult(null);
    setHasAnalysis(false);
    setSuggestions({ products: [], brands: [] });
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (suggestAbort.current) suggestAbort.current.abort();
  }, []);

  // ════════════════════════════════════════════════════════════════
  // RETURN
  // ════════════════════════════════════════════════════════════════
  return {
    loading,
    searching,
    error,
    result,
    suggestions,
    hasAnalysis,
    search,              // debounced suggest
    searchFull,          // full search
    analyze,             // main analyze function
    clear,
    loadBrandProducts,
  };
}