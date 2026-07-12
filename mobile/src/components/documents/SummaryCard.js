import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import EmojiIcon from "../common/EmojiIcon";
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

/**
 * Dashboard stat card ("Expiring Soon" / "All Documents"). `color` tints the
 * background and icon; tapping navigates to a filtered document list.
 */
export default function SummaryCard({ icon, label, count, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: withOpacity(color, 0.1) }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, { backgroundColor: withOpacity(color, 0.18) }]}>
        <EmojiIcon name={icon} size={18} color={color} />
      </View>
      <Text style={styles.count}>{count}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  count: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
