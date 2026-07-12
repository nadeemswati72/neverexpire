import React from "react";
import { View, Text, StyleSheet } from "react-native";

import EmojiIcon from "./EmojiIcon";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

/**
 * Centered placeholder shown when a list has no items yet (no documents for
 * a family member, no notifications, etc.).
 */
export default function EmptyState({ icon = "document-text-outline", title, message, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <EmojiIcon name={icon} size={32} color={COLORS.accent} />
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
