import { DEFAULT_DOCUMENTS } from "../data/mockDocuments";
import { EXPIRY_STATUS, getExpiryStatus } from "../utils/dateUtils";
import * as StorageService from "./StorageService";

/**
 * Document CRUD against AsyncStorage, seeded from DEFAULT_DOCUMENTS on first
 * run. Documents from every demo account live in the same array; callers
 * (DataContext) filter by `userId`.
 */

export async function getAllDocuments() {
  const stored = await StorageService.getItem(StorageService.STORAGE_KEYS.DOCUMENTS);
  if (stored && stored.length) return stored;

  await StorageService.setItem(StorageService.STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  return DEFAULT_DOCUMENTS;
}

/**
 * Creates a new document (when `document.id` is absent) or updates an
 * existing one in place. Returns the full updated list.
 */
export async function saveDocument(document) {
  const documents = await getAllDocuments();

  let updated;
  if (document.id) {
    updated = documents.map((doc) => (doc.id === document.id ? { ...doc, ...document } : doc));
  } else {
    const newDocument = {
      ...document,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updated = [newDocument, ...documents];
  }

  await StorageService.setItem(StorageService.STORAGE_KEYS.DOCUMENTS, updated);
  return updated;
}

export async function deleteDocument(documentId) {
  const documents = await getAllDocuments();
  const updated = documents.filter((doc) => doc.id !== documentId);
  await StorageService.setItem(StorageService.STORAGE_KEYS.DOCUMENTS, updated);
  return updated;
}

/**
 * Dashboard summary counts. "Expiring Soon" counts anything that needs
 * attention now — already expired or due within the 30-day threshold —
 * matching the "Needs Attention" filter on the NeverExpire web dashboard.
 */
export function getDashboardSummary(documents) {
  const totalCount = documents.length;
  const expiringSoonCount = documents.filter((doc) => {
    const status = getExpiryStatus(doc.expiryDate);
    return status === EXPIRY_STATUS.EXPIRING_SOON || status === EXPIRY_STATUS.EXPIRED;
  }).length;

  return { totalCount, expiringSoonCount };
}
