import * as ApiService from "./ApiService";
import * as StorageService from "./StorageService";

/**
 * Real backend authentication (POST /api/v1/auth/login, /register, GET /me).
 * The JWT is stored under STORAGE_KEYS.AUTH_TOKEN; the cached user profile
 * under STORAGE_KEYS.CURRENT_USER so getCurrentUser() can resolve instantly
 * on app start without waiting on a network round-trip (falls back to a
 * fresh /me call to confirm the token is still valid).
 */

export class AuthError extends Error {}

// Deterministic per-account color since the backend doesn't track one.
const AVATAR_COLORS = ["#4F8EF7", "#8B5CF6", "#EF5DA8", "#34C38F", "#F2994A", "#22a99c"];
function colorForUserId(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function toAppUser(backendUser) {
  return {
    id: backendUser.id,
    name: backendUser.full_name,
    email: backendUser.email,
    avatarColor: colorForUserId(backendUser.id),
  };
}

export async function login(email, password) {
  let data;
  try {
    data = await ApiService.post("/auth/login", { email: email.trim(), password });
  } catch (err) {
    throw new AuthError(err.message || "Invalid email or password.");
  }

  await StorageService.setItem(StorageService.STORAGE_KEYS.AUTH_TOKEN, data.token);
  const user = toAppUser(data.user);
  await StorageService.setItem(StorageService.STORAGE_KEYS.CURRENT_USER, user);
  return user;
}

export async function register(email, password, fullName) {
  let data;
  try {
    data = await ApiService.post("/auth/register", {
      email: email.trim(),
      password,
      full_name: fullName.trim(),
    });
  } catch (err) {
    throw new AuthError(err.message || "Could not create account.");
  }

  await StorageService.setItem(StorageService.STORAGE_KEYS.AUTH_TOKEN, data.token);
  const user = toAppUser(data.user);
  await StorageService.setItem(StorageService.STORAGE_KEYS.CURRENT_USER, user);
  return user;
}

export async function logout() {
  await StorageService.removeItem(StorageService.STORAGE_KEYS.AUTH_TOKEN);
  await StorageService.removeItem(StorageService.STORAGE_KEYS.CURRENT_USER);
}

export async function getCurrentUser() {
  const token = await StorageService.getItem(StorageService.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return null;

  try {
    const backendUser = await ApiService.get("/auth/me");
    const user = toAppUser(backendUser);
    await StorageService.setItem(StorageService.STORAGE_KEYS.CURRENT_USER, user);
    return user;
  } catch (err) {
    // Token expired/invalid — ApiService already cleared it on a 401.
    return null;
  }
}

/**
 * NOTE: the backend has no profile-update endpoint yet (name/email are
 * fixed at registration). This only updates the locally cached copy so the
 * existing Profile screen keeps working; it does not persist server-side.
 * Revisit once PUT /api/v1/auth/me exists.
 */
export async function updateProfile(updates) {
  const current = await StorageService.getItem(StorageService.STORAGE_KEYS.CURRENT_USER);
  if (!current) {
    throw new AuthError("Not logged in.");
  }
  const updated = { ...current, ...updates };
  await StorageService.setItem(StorageService.STORAGE_KEYS.CURRENT_USER, updated);
  return updated;
}
