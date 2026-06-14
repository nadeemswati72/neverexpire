import { DEMO_PASSWORD, DEMO_USERS } from "../data/mockUsers";
import * as StorageService from "./StorageService";

/**
 * Mock authentication: no backend, no password hashing. Any email from
 * DEMO_USERS + DEMO_PASSWORD "logs in" and is persisted to AsyncStorage so
 * the session survives app restarts.
 */

export class AuthError extends Error {}

export async function login(email, password) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || password !== DEMO_PASSWORD) {
    throw new AuthError("Invalid email or password. Use one of the demo accounts below.");
  }

  await StorageService.setItem(StorageService.STORAGE_KEYS.CURRENT_USER, user);
  return user;
}

export async function logout() {
  await StorageService.removeItem(StorageService.STORAGE_KEYS.CURRENT_USER);
}

export async function getCurrentUser() {
  return StorageService.getItem(StorageService.STORAGE_KEYS.CURRENT_USER, null);
}

export async function updateProfile(updates) {
  const current = await getCurrentUser();
  if (!current) {
    throw new AuthError("Not logged in.");
  }
  const updated = { ...current, ...updates };
  await StorageService.setItem(StorageService.STORAGE_KEYS.CURRENT_USER, updated);
  return updated;
}
