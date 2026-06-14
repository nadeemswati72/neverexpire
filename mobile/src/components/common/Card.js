import React from "react";
import { View, StyleSheet } from "react-native";

import { COLORS, RADIUS, SPACING, SHADOW } from "../../constants/theme";

/**
 * Generic white surface with rounded corners and a soft shadow. Used as the
 * base for summary cards, list rows, form sections, etc. — pass `padded`
 * false when the content needs to control its own padding (e.g. a list of
 * rows with dividers).
 */
export default function Card({ children, padded = true, style }) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOW.card,
  },
  padded: {
    padding: SPACING.lg,
  },
});
