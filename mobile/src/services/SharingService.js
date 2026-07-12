import * as ApiService from "./ApiService";

/**
 * Document/person sharing against the Flask backend — the mobile
 * counterpart of the web app's ShareModal + SharingPanel + SharingPage.
 * Permission levels mirror the backend: "read", "download", "edit".
 */

export const PERMISSION_LEVELS = [
  { code: "read", label: "View only", icon: "eye-outline" },
  { code: "download", label: "View + Download", icon: "download-outline" },
  { code: "edit", label: "Can Edit", icon: "create-outline" },
];

export const EXPIRY_OPTIONS = [
  { days: null, label: "Never expires" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
];

/** Share one document with another user by email. */
export async function shareDocument(documentId, { recipientEmail, permissionLevel, expiresInDays }) {
  return ApiService.post(`/documents/${documentId}/share`, {
    recipient_email: recipientEmail,
    permission_level: permissionLevel,
    expires_in_days: expiresInDays || null,
  });
}

/** Share ALL of a family member's documents with another user by email. */
export async function shareAllForMember(personId, { recipientEmail, permissionLevel, includeFuture, expiresInDays }) {
  return ApiService.post(`/persons/${personId}/share-all`, {
    recipient_email: recipientEmail,
    permission_level: permissionLevel,
    include_future: !!includeFuture,
    expires_in_days: expiresInDays || null,
  });
}

/** Existing shares on a document (owner only). */
export async function getDocumentShares(documentId) {
  return ApiService.get(`/documents/${documentId}/shares`);
}

export async function revokeShare(shareId) {
  return ApiService.del(`/shares/${shareId}`);
}

/** Documents other people shared with me. */
export async function getIncomingShares() {
  return ApiService.get("/sharing/incoming");
}

/** Documents I shared with other people. */
export async function getOutgoingShares() {
  return ApiService.get("/sharing/outgoing");
}

/** Who viewed/downloaded a document (owner only). */
export async function getAccessLog(documentId) {
  return ApiService.get(`/documents/${documentId}/access-log`);
}
