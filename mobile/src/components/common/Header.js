import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";

import EmojiIcon from "./EmojiIcon";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

/**
 * Shared top app bar used across all main screens.
 *
 * - `variant="menu"` shows a hamburger icon that opens the drawer (top-level
 *   tabs: Dashboard, Family).
 * - `variant="back"` shows a back arrow that pops the current screen.
 * - `brand` renders the "NeverExpire" wordmark + logo instead of `title`.
 * - `rightIcon`/`onRightPress` adds a single action icon on the right
 *   (notification bell, edit, add, etc.), with an optional `rightBadge` dot.
 */
export default function Header({
  title,
  brand = false,
  variant = "menu",
  rightIcon,
  onRightPress,
  rightBadge = false,
}) {
  const navigation = useNavigation();

  const handleLeftPress = () => {
    if (variant === "back") {
      navigation.goBack();
    } else if (variant === "menu") {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {variant !== "none" && (
          <TouchableOpacity
            onPress={handleLeftPress}
            style={styles.iconButton}
            accessibilityLabel={variant === "back" ? "Go back" : "Open menu"}
          >
            <EmojiIcon name={variant === "back" ? "arrow-back" : "menu"} size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        {brand ? (
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <EmojiIcon name="shield-checkmark" size={14} />
            </View>
            <Text style={styles.brandText}>NeverExpire</Text>
          </View>
        ) : (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={[styles.side, styles.right]}>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconButton}
            accessibilityLabel="Header action"
          >
            <EmojiIcon name={rightIcon} size={20} color={COLORS.textPrimary} />
            {rightBadge && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const ICON_BUTTON_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    height: 56,
    backgroundColor: COLORS.background,
  },
  side: {
    width: ICON_BUTTON_SIZE,
    alignItems: "flex-start",
  },
  right: {
    alignItems: "flex-end",
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  brandText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
});
