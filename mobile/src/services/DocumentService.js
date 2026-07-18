import { API_V1_URL } from "../constants/api";
import { EXPIRY_STATUS, getExpiryStatus } from "../utils/dateUtils";
import * as ApiService from "./ApiService";

/**
 * Document CRUD against the real Flask backend (was AsyncStorage). Backend
 * field names are translated to/from the shape screens already expect
 * (documentType, familyMemberId, fullName, etc.) so screens don't need to
 * change — except image rendering, which now needs an Authorization header
 * (see imageUrlFor below) since files are served from an authenticated
 * endpoint rather than a local device URI.
 */

// Mobile's DOCUMENT_TYPES uses "EMIRATES_ID"; the backend's document_types
// table uses "ID_CARD". Everything else lines up 1:1.
const TYPE_MOBILE_TO_BACKEND = { EMIRATES_ID: "ID_CARD" };
const TYPE_BACKEND_TO_MOBILE = { ID_CARD: "EMIRATES_ID" };

function toBackendType(mobileCode) {
  return TYPE_MOBILE_TO_BACKEND[mobileCode] || mobileCode || "OTHER";
}

function toMobileType(backendCode) {
  return TYPE_BACKEND_TO_MOBILE[backendCode] || backendCode || "OTHER";
}

/** Authenticated file URL — pair with { headers: authHeader } on <Image source>. */
export function imageUrlFor(fileId) {
  return `${API_V1_URL}/files/${fileId}`;
}

function toAppDocument(backendDoc) {
  const files = (backendDoc.files || []).map((f) => ({
    id: f.id,
    uri: imageUrlFor(f.id),
    originalFilename: f.original_filename,
    mimeType: f.mime_type,
  }));
  const firstFile = files[0];
  return {
    id: backendDoc.id,
    familyMemberId: backendDoc.person_id,
    documentType: toMobileType(backendDoc.document_type?.code),
    fullName: backendDoc.holder_name || backendDoc.person?.full_name || "",
    documentNumber: backendDoc.document_number,
    dateOfBirth: backendDoc.person?.date_of_birth || null,
    issuedDate: backendDoc.issued_date,
    expiryDate: backendDoc.expiry_date,
    issuedBy: backendDoc.issuing_authority,
    notes: backendDoc.notes,
    // `files` preserves every attached file (not just the first) so extra
    // files added from web aren't silently hidden on mobile; imageUri/
    // imageFileId stay as convenience aliases for screens that only show one.
    files,
    imageUri: firstFile ? firstFile.uri : null,
    imageFileId: firstFile ? firstFile.id : null,
    createdAt: backendDoc.created_at,
    source: backendDoc.source || null,
    // Only present on the single-document fetch (document_detail), not the
    // list endpoint — undefined on list-derived docs, which is fine since
    // only DocumentDetailsScreen (which uses getDocument()) needs them.
    watermarkedForViewer: backendDoc.watermarked_for_viewer,
    extractionRuns: backendDoc.extraction_runs || [],
    // Sharing: the backend list mixes in documents shared with this user.
    isOwner: backendDoc.is_owner !== false,
    userPermission: backendDoc.user_permission || null,
    sharedByEmail: backendDoc.shared_by_email || null,
  };
}

export async function getAllDocuments() {
  const docs = await ApiService.get("/documents");
  return docs.map(toAppDocument);
}

export async function getDocument(documentId) {
  const doc = await ApiService.get(`/documents/${documentId}`);
  return toAppDocument(doc);
}

async function uploadDocumentImage(documentId, imageUri) {
  const filename = imageUri.split("/").pop() || "document.jpg";
  const extension = filename.split(".").pop()?.toLowerCase();
  const type = extension === "png" ? "image/png" : extension === "pdf" ? "application/pdf" : "image/jpeg";

  const formData = new FormData();
  formData.append("file", { uri: imageUri, name: filename, type });
  await ApiService.postForm(`/documents/${documentId}/files`, formData);
}

/**
 * Attaches an extra picture to an EXISTING document without going through
 * full field editing or AI extraction — the mobile counterpart of web's
 * "Add Picture" quick action on the document detail page.
 */
export async function addPictureToDocument(documentId, imageUri) {
  await uploadDocumentImage(documentId, imageUri);
  return getDocument(documentId);
}

/**
 * Creates a new document (when `document.id` is absent) or updates an
 * existing one. Returns { documents, saved } — the full refreshed list plus
 * the single document that was just created/updated (callers should
 * navigate using `saved.id` rather than assuming list order).
 */
export async function saveDocument(document) {
  const isNewLocalImage = document.imageUri && !document.imageUri.startsWith("http");

  const payload = {
    document_type_code: toBackendType(document.documentType),
    title: document.fullName || "Untitled Document",
    document_number: document.documentNumber || null,
    issued_date: document.issuedDate || null,
    expiry_date: document.expiryDate || null,
    issuing_authority: document.issuedBy || null,
    holder_name: document.fullName || null,
    notes: document.notes || null,
  };

  let savedId = document.id;
  if (document.id) {
    await ApiService.put(`/documents/${document.id}`, payload);
  } else {
    const created = await ApiService.post("/documents", {
      ...payload,
      person_id: document.familyMemberId,
    });
    savedId = created.id;
  }

  if (isNewLocalImage) {
    await uploadDocumentImage(savedId, document.imageUri);
  }

  const [documents, saved] = await Promise.all([getAllDocuments(), getDocument(savedId)]);
  return { documents, saved };
}

export async function deleteDocument(documentId) {
  await ApiService.del(`/documents/${documentId}`);
  return getAllDocuments();
}

/**
 * Dashboard summary counts. "Expiring Soon" counts anything that needs
 * attention now — already expired or due within the threshold — matching
 * the "Needs Attention" filter on the NeverExpire web dashboard.
 */
export function getDashboardSummary(documents) {
  const totalCount = documents.length;
  const expiringSoonCount = documents.filter((doc) => {
    const status = getExpiryStatus(doc.expiryDate);
    return status === EXPIRY_STATUS.EXPIRING_SOON || status === EXPIRY_STATUS.EXPIRED;
  }).length;

  return { totalCount, expiringSoonCount };
}
