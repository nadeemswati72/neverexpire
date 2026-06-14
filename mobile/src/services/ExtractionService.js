import { API_BASE_URL } from "../constants/api";

/**
 * AI document extraction via the Flask backend's /api/extract endpoint
 * (wraps neverexpire/extractor.py). No auth — requires the phone and the
 * dev machine to be on the same Wi-Fi network as the Flask dev server.
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

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/extract`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    throw new ExtractionError(
      "Could not reach the server. Make sure this phone and the dev computer are on the same Wi-Fi network."
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ExtractionError(data?.error || "AI extraction failed.");
  }
  return data;
}
