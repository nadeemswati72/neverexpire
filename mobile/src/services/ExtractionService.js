import { API_V1_URL } from "../constants/api";
import * as ApiService from "./ApiService";

/**
 * AI document extraction via the real Flask backend's
 * POST /api/v1/documents/extract (wraps neverexpire/extractor.py). Requires
 * auth (JWT) and requires the phone and dev machine to be on the same Wi-Fi
 * network as the Flask dev server.
 */

export class ExtractionError extends Error {}

const FILENAME_MIME_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

export async function extractDocumentDetails(fileUri) {
  const filename = fileUri.split("/").pop() || "document.jpg";
  const extension = filename.split(".").pop()?.toLowerCase();
  const type = FILENAME_MIME_TYPES[extension] || "image/jpeg";

  const formData = new FormData();
  formData.append("file", { uri: fileUri, name: filename, type });

  const token = await ApiService.getAuthToken();

  let response;
  try {
    response = await fetch(`${API_V1_URL}/documents/extract`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json", ...ApiService.authHeader(token) },
    });
  } catch (err) {
    throw new ExtractionError(
      "Could not reach the server. Make sure this phone and the dev computer are on the same Wi-Fi network."
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ExtractionError(payload?.error || "AI extraction failed.");
  }

  const data = payload?.data || {};
  // Normalize to the field names DocumentFormScreen already expects.
  return { ...data, additional_notes: data.notes };
}
