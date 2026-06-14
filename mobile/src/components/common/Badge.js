import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, STATUS_COLORS, withOpacity } from "../../constants/theme";

/**
 * Small pill used to show expiry status ("25 days left", "Expired",
 * "Valid") with the color-coded scheme from STATUS_COLORS. `variant="solid"`
 * fills the background with the status color (used for emphasis); the
 * default `"soft"` variant uses a tinted background with colored text.
 */
export default function Badge({ label, status = "valid", variant = "soft", style }) {
  const color = STATUS_COLORS[status] || COLORS.textSecondary;
  const isSolid = variant === "solid";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isSolid ? color : withOpacity(color, 0.12) },
        style,
      ]}
    >
      <Text style={[styles.label, { color: isSolid ? COLORS.white : color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
