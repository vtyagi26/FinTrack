const rawBackendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";
export const API_BASE_URL = rawBackendUrl.replace(/\/+$/, "");

const rawPredictionUrl =
  import.meta.env.VITE_PREDICTION_SERVICE_URL ||
  "https://stock-analyser-ggjy.onrender.com";
export const PREDICTION_SERVICE_URL = rawPredictionUrl.replace(/\/+$/, "");

