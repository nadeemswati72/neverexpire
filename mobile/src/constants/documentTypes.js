/**
 * Document type catalogue: drives the icon + color shown in document lists,
 * the "Choose Document Type" picker on the Add Document form, and the
 * "Document Type" field on Document Details.
 *
 * `icon` names refer to @expo/vector-icons MaterialCommunityIcons glyphs.
 */
export const DOCUMENT_TYPES = {
  PASSPORT: {
    code: "PASSPORT",
    label: "Passport",
    icon: "passport",
    color: "#4F8EF7",
  },
  EMIRATES_ID: {
    code: "EMIRATES_ID",
    label: "Emirates ID",
    icon: "card-account-details",
    color: "#34C38F",
  },
  DRIVING_LICENSE: {
    code: "DRIVING_LICENSE",
    label: "Driving License",
    icon: "car",
    color: "#EF5DA8",
  },
  VISA: {
    code: "VISA",
    label: "Visa",
    icon: "ticket-confirmation",
    color: "#8B5CF6",
  },
  INSURANCE: {
    code: "INSURANCE",
    label: "Insurance",
    icon: "shield-check",
    color: "#22B8CF",
  },
  CERTIFICATE: {
    code: "CERTIFICATE",
    label: "Certificate",
    icon: "certificate",
    color: "#F2994A",
  },
  OTHER: {
    code: "OTHER",
    label: "Other Document",
    icon: "file-document-outline",
    color: "#9CA3AF",
  },
};

export const DOCUMENT_TYPE_LIST = Object.values(DOCUMENT_TYPES);

/** Returns the type meta for a code, falling back to OTHER. */
export function getDocumentTypeMeta(code) {
  return DOCUMENT_TYPES[code] || DOCUMENT_TYPES.OTHER;
}

// Keyword -> DOCUMENT_TYPES code, checked in order against the AI's
// free-text `document_type` guess (see neverexpire/extractor.py).
const EXTRACTED_TYPE_KEYWORDS = [
  ["passport", "PASSPORT"],
  ["emirates", "EMIRATES_ID"],
  ["national id", "EMIRATES_ID"],
  ["identity", "EMIRATES_ID"],
  ["driving", "DRIVING_LICENSE"],
  ["license", "DRIVING_LICENSE"],
  ["licence", "DRIVING_LICENSE"],
  ["visa", "VISA"],
  ["residency", "VISA"],
  ["permit", "VISA"],
  ["insurance", "INSURANCE"],
  ["policy", "INSURANCE"],
  ["certificate", "CERTIFICATE"],
  ["certification", "CERTIFICATE"],
  ["diploma", "CERTIFICATE"],
];

/**
 * Maps the AI extraction's free-text `document_type` (e.g. "passport",
 * "insurance policy") to one of mobile's fixed DOCUMENT_TYPES codes, falling
 * back to OTHER when nothing matches.
 */
export function mapExtractedDocumentType(extractedType) {
  if (!extractedType) return DOCUMENT_TYPES.OTHER.code;
  const normalized = extractedType.toLowerCase();
  const match = EXTRACTED_TYPE_KEYWORDS.find(([keyword]) => normalized.includes(keyword));
  return match ? DOCUMENT_TYPES[match[1]].code : DOCUMENT_TYPES.OTHER.code;
}
