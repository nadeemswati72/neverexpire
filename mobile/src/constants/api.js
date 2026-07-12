import Constants from "expo-constants";

/**
 * Base URL for the NeverExpire Flask backend (used by ExtractionService).
 * Derived from the Expo dev server's LAN host — the phone running Expo Go
 * is already on the same network/IP as the dev machine, so reuse that host
 * and point at the Flask dev server's port instead of Metro's.
 */
const FLASK_PORT = 5000;

function resolveHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  if (!hostUri) return "localhost";
  return hostUri.split(":")[0];
}

export const API_BASE_URL = `http://${resolveHost()}:${FLASK_PORT}`;
export const API_V1_URL = `${API_BASE_URL}/api/v1`;
