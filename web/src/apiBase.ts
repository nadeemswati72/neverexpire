// Single source of truth for the API base URL.
// In dev: empty string (Vite proxy handles /api → localhost:5000)
// In prod: the Railway URL set via VITE_API_URL env var
const API_BASE: string = (import.meta.env.VITE_API_URL as string) ?? ''
export default API_BASE
