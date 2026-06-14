/**
 * Lightweight form validators shared by Login and Document forms.
 * Demo-mode auth doesn't hit a backend, but inputs are still validated for a
 * production-quality feel.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isNotEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidEmail(value) {
  return isNotEmpty(value) && EMAIL_REGEX.test(value.trim());
}

/** Accepts ISO "YYYY-MM-DD" strings and confirms they parse to a real date. */
export function isValidISODate(value) {
  if (!isNotEmpty(value) || !ISO_DATE_REGEX.test(value.trim())) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

/**
 * Validates the Add/Edit Document form. Returns a map of field -> error
 * message; an empty object means the form is valid.
 */
export function validateDocumentForm({ documentType, fullName, expiryDate }) {
  const errors = {};
  if (!isNotEmpty(documentType)) errors.documentType = "Select a document type.";
  if (!isNotEmpty(fullName)) errors.fullName = "Full name is required.";
  if (!isNotEmpty(expiryDate)) {
    errors.expiryDate = "Expiry date is required.";
  } else if (!isValidISODate(expiryDate)) {
    errors.expiryDate = "Use the format YYYY-MM-DD.";
  }
  return errors;
}

/** Validates the Login form. Returns a map of field -> error message. */
export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isNotEmpty(password)) errors.password = "Password is required.";
  return errors;
}
