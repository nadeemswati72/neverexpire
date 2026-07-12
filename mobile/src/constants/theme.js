/**
 * Central design tokens for NeverExpire mobile.
 * Derived from Sample/Mobile.jpg — keep all screens/components on these
 * tokens instead of inlining hex codes or magic numbers (see
 * .claude/rules/ui-consistency.md).
 */

export const COLORS = {
  // Brand
  primary: "#1B2A4A", // deep navy — headers, drawer, primary buttons
  primaryDark: "#11192E",
  primaryLight: "#2A3F66",
  accent: "#2BB3A6", // teal/green — logo, links, "All Documents"
  accentDark: "#1F8C82",

  // Status
  danger: "#EB5757", // expired / urgent (<= 0 days)
  dangerLight: "#FF9A9A",
  warning: "#F2994A", // expiring soon (<= 30 days)
  warningLight: "#FFC98A",
  success: "#27AE60", // valid / safe (> 30 days)
  successLight: "#6FE3A0",
  noExpiry: "#9CA3AF",

  // Family/people identity (glossy icon pucks, tab bar)
  purple: "#8B6FD6",
  purpleLight: "#C3B2F5",

  // Surfaces
  background: "#F4F6FA",
  surface: "#FFFFFF",
  overlay: "rgba(17, 25, 46, 0.45)",

  // Text
  textPrimary: "#1F2A3C",
  textSecondary: "#8A94A6",
  textMuted: "#B0B8C5",
  textInverse: "#FFFFFF",

  // Misc
  border: "#E7EBF0",
  white: "#FFFFFF",
  black: "#000000",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  display: 28,
};

export const FONT_WEIGHTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const SHADOW = {
  card: {
    shadowColor: "#1B2A4A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  fab: {
    shadowColor: "#1B2A4A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
};

/** Map of expiry-status keys (see utils/dateUtils.js) to status colors. */
export const STATUS_COLORS = {
  expired: COLORS.danger,
  expiring_soon: COLORS.warning,
  valid: COLORS.success,
  no_expiry: COLORS.noExpiry,
};

/**
 * Converts a "#rrggbb" (or "#rgb") color to an "rgba(r, g, b, alpha)" string.
 * Used for tinted backgrounds (status badges, icon boxes, summary cards)
 * that stay legible against the light theme.
 */
export function withOpacity(hexColor, alpha) {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const value = parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOW,
  STATUS_COLORS,
  withOpacity,
};
