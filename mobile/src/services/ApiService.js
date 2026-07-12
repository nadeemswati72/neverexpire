import { API_V1_URL } from "../constants/api";
import * as StorageService from "./StorageService";

/**
 * Thin fetch wrapper for the real Flask backend — attaches the JWT Bearer
 * token, JSON-encodes bodies, and throws ApiError with the backend's own
 * error message on non-2xx responses. Mirrors web/src/api.ts.
 *
 * On 401 the stored token is cleared; AuthContext's next getCurrentUser()
 * call will then correctly report "logged out" instead of looping.
 */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const token = await StorageService.getItem(StorageService.STORAGE_KEYS.AUTH_TOKEN);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_V1_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the server. Make sure this phone and the dev computer are on the same Wi-Fi network.",
      0
    );
  }

  if (response.status === 401) {
    await StorageService.removeItem(StorageService.STORAGE_KEYS.AUTH_TOKEN);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error || `Request failed (${response.status})`, response.status);
  }

  return payload?.data;
}

export const get = (path) => request(path);
export const post = (path, body) => request(path, { method: "POST", body });
export const put = (path, body) => request(path, { method: "PUT", body });
export const del = (path) => request(path, { method: "DELETE" });
export const postForm = (path, formData) => request(path, { method: "POST", body: formData, isFormData: true });

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAuthToken() {
  return StorageService.getItem(StorageService.STORAGE_KEYS.AUTH_TOKEN);
}
