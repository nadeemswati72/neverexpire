/**
 * Document type catalogue: drives the icon + color shown in document lists,
 * the "Choose Document Type" picker on the Add Document form, and the
 * "Document Type" field on Document Details.
 *
 * `icon` is the raw emoji glyph rendered directly by IconBox — part of the
 * app-wide "Emoji Nav" icon set (see constants/emojiIcons.js for the
 * Ionicons-derived counterpart used by shared chrome components).
 */
// Icons match web's DOC_ICON map (web/src/pages/DocumentsPage.tsx) exactly
// for every code both platforms share, so a document type reads as the same
// glyph regardless of platform. Covers all 13 backend document_types (see
// backend/neverexpire/db/seed.py) — previously only 7 were listed here, so
// the other 6 silently rendered as generic "Other" on mobile.
export const DOCUMENT_TYPES = {
  PASSPORT: {
    code: "PASSPORT",
    label: "Passport",
    icon: "🛂",
    color: "#4F8EF7",
  },
  EMIRATES_ID: {
    code: "EMIRATES_ID",
    label: "Emirates ID",
    icon: "🪪",
    color: "#34C38F",
  },
  VISA: {
    code: "VISA",
    label: "Visa",
    icon: "✈️",
    color: "#8B5CF6",
  },
  DRIVING_LICENSE: {
    code: "DRIVING_LICENSE",
    label: "Driving License",
    icon: "🚗",
    color: "#EF5DA8",
  },
  VEHICLE_REGISTRATION: {
    code: "VEHICLE_REGISTRATION",
    label: "Vehicle Registration",
    icon: "🚙",
    color: "#4F8EF7",
  },
  HEALTH_INSURANCE: {
    code: "HEALTH_INSURANCE",
    label: "Health Insurance",
    icon: "🏥",
    color: "#22B8CF",
  },
  INSURANCE: {
    code: "INSURANCE",
    label: "Insurance",
    icon: "🛡️",
    color: "#22B8CF",
  },
  WARRANTY: {
    code: "WARRANTY",
    label: "Warranty",
    icon: "🔧",
    color: "#9CA3AF",
  },
  MEDICATION: {
    code: "MEDICATION",
    label: "Medication",
    icon: "💊",
    color: "#EF5DA8",
  },
  FOOD_ITEM: {
    code: "FOOD_ITEM",
    label: "Food Item",
    icon: "🥫",
    color: "#F2994A",
  },
  CERTIFICATE: {
    code: "CERTIFICATE",
    label: "Certificate",
    icon: "🎓",
    color: "#F2994A",
  },
  SUBSCRIPTION: {
    code: "SUBSCRIPTION",
    label: "Subscription",
    icon: "📱",
    color: "#8B5CF6",
  },
  OTHER: {
    code: "OTHER",
    label: "Other Document",
    icon: "📄",
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
  ["vehicle registration", "VEHICLE_REGISTRATION"],
  ["car registration", "VEHICLE_REGISTRATION"],
  ["driving", "DRIVING_LICENSE"],
  ["license", "DRIVING_LICENSE"],
  ["licence", "DRIVING_LICENSE"],
  ["visa", "VISA"],
  ["residency", "VISA"],
  ["permit", "VISA"],
  ["health insurance", "HEALTH_INSURANCE"],
  ["medical insurance", "HEALTH_INSURANCE"],
  ["insurance", "INSURANCE"],
  ["policy", "INSURANCE"],
  ["warranty", "WARRANTY"],
  ["guarantee", "WARRANTY"],
  ["medication", "MEDICATION"],
  ["prescription", "MEDICATION"],
  ["food", "FOOD_ITEM"],
  ["expiry label", "FOOD_ITEM"],
  ["subscription", "SUBSCRIPTION"],
  ["membership", "SUBSCRIPTION"],
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
