import axios from "axios";

const api = axios.create({
  baseURL: "https://ayuayuaayu-sephora-api.hf.space",
  timeout: 60000,
});

// Full search — used for search results page
export const searchAll = (q, limit = 10) =>
  api.get("/search", {
    params: { query: q, limit },
  }).then((res) => res.data);

// Autocomplete/suggestion dropdown — lighter, relevance-first
export const suggest = (q, limit = 10) =>
  api.get("/suggest", {
    params: { query: q, limit },
  }).then((res) => res.data);

// Analyze by product_id — path param
export const analyzeById = (id) =>
  api.get(`/analyze/${id}`).then((res) => res.data);

// Analyze by product name — query param
export const analyzeByName = (name) =>
  api.get("/analyze", {
    params: { product_name: name },
  }).then((res) => res.data);

// Get product info — path param
export const getProduct = (id) =>
  api.get(`/product/${id}`).then((res) => res.data);
export const getBrandProducts = (brand, limit = 5) =>
  api
    .get(`/brand/${encodeURIComponent(brand)}/products`, {
      params: { limit },
    })
    .then((r) => r.data);

export const getReviews = (id, limit = 100) =>
  api.get(`/product/${id}/reviews`, {
    params: { limit },
  }).then((res) => res.data);

export const getTopProducts = (min = 50) =>
  api.get("/top-products", {
    params: { min_reviews: min },
  }).then((res) => res.data);

export const getStats = () =>
  api.get("/stats").then((res) => res.data);

export const getHealth = () =>
  api.get("/health").then((res) => res.data);
export const getAiSummary = (productId) =>
  api.get(`/ai-summary/${productId}`).then(r => r.data);


export async function getIngredientAnalysis(productId, targetType, summaryOnly = true) {
  const params = {};
  if (targetType) params.target_type = targetType;
  if (summaryOnly) params.summary_only = "true";

  const response = await api.get(`/ingredients/${productId}`, {
    params,
  });

  return response.data;
}

export default api;