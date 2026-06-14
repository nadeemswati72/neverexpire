import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

/**
 * Section title row with an optional trailing action link (e.g. "See All").
 * Used above the document list on the Dashboard and My Documents screens.
 */
export default function SectionHeader({ title, actionLabel, onActionPress, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  action: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.accent,
  },
});
