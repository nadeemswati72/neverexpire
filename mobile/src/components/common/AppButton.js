import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from "react-native";

import EmojiIcon from "./EmojiIcon";
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

const VARIANTS = {
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    textColor: COLORS.textInverse,
  },
  accent: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    textColor: COLORS.textInverse,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: COLORS.border,
    textColor: COLORS.textPrimary,
  },
  danger: {
    backgroundColor: "transparent",
    borderColor: COLORS.danger,
    textColor: COLORS.danger,
  },
};

/**
 * Primary call-to-action button used for "Login", "Save Document",
 * "Logout", etc. `variant` selects the color treatment; `icon` is an
 * optional Ionicons glyph name rendered before the label.
 */
export default function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  loading = false,
  style,
}) {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <EmojiIcon name={icon} size={18} color={palette.textColor} style={styles.icon} /> : null}
          <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
