/**
 * Expiry date helpers shared by the dashboard, document list, and details
 * screens. The 30-day "expiring soon" threshold mirrors
 * REMINDER_DAYS_THRESHOLD in the NeverExpire Flask backend
 * (neverexpire/config.py) so status colors stay consistent across the
 * product.
 */

export const EXPIRY_STATUS = {
  EXPIRED: "expired",
  EXPIRING_SOON: "expiring_soon",
  VALID: "valid",
  NO_EXPIRY: "no_expiry",
};

export const EXPIRING_SOON_THRESHOLD_DAYS = 30;

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Returns the (signed) number of whole days between today and the given
 * ISO date string ("YYYY-MM-DD"). Negative values mean the date is in the
 * past. Returns null if dateStr is falsy.
 */
export function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(dateStr));
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Classifies an expiry date into one of EXPIRY_STATUS for color-coding.
 */
export function getExpiryStatus(dateStr) {
  if (!dateStr) return EXPIRY_STATUS.NO_EXPIRY;
  const days = daysRemaining(dateStr);
  if (days < 0) return EXPIRY_STATUS.EXPIRED;
  if (days <= EXPIRING_SOON_THRESHOLD_DAYS) return EXPIRY_STATUS.EXPIRING_SOON;
  return EXPIRY_STATUS.VALID;
}

/**
 * Human-readable "days left" label used on document rows and the details
 * screen, e.g. "25 days left", "Expires today", "Expired 4 days ago".
 */
export function formatDaysLabel(dateStr) {
  if (!dateStr) return "No expiry date";
  const days = daysRemaining(dateStr);
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

/**
 * Formats an ISO date string ("YYYY-MM-DD") as "10 Aug 2026" to match the
 * Mobile.jpg design.
 */
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "Expires on 10 Aug 2026" label used under document titles. */
export function formatExpiresOn(dateStr) {
  if (!dateStr) return "No expiry date";
  return `Expires on ${formatDate(dateStr)}`;
}

/** Converts a Date object to an ISO "YYYY-MM-DD" string (local time). */
export function toISODateString(date) {
  const copy = startOfDay(date);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const day = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
