export const API_HOST =
  import.meta.env.VITE_API_HOST || "http://127.0.0.1:8000";

export const API_PREFIX = "/api/v1";

export function getAccessToken() {
  return localStorage.getItem("access");
}