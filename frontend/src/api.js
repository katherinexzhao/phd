const DEV_BACKEND = "http://localhost:5001";
const PROD_BACKEND = "https://phd-backend-olj1.onrender.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? DEV_BACKEND : PROD_BACKEND);