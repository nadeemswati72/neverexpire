import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, DrawerActions } from "@react-navigation/native";

import EmojiIcon from "./EmojiIcon";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

/**
 * Shared top app bar used across all main screens.
 *
 * - `variant="menu"` shows a hamburger icon that opens the drawer (top-level
 *   tabs: Dashboard, Family).
 * - `variant="back"` shows a back arrow that pops the current screen.
 * - `brand` renders the "NeverExpire" wordmark + logo instead of `title`.
 * - `rightIcon`/`onRightPress` adds a single action icon on the right
 *   (notification bell, edit, add, etc.), with an optional `rightBadge` dot.
 *
 * Nav icons sit in a soft tinted circular chip (matching the drawer's icon
 * treatment) rather than a bare glyph — plain chevrons/hamburgers read as
 * "dull" next to the rest of the app's colorful emoji icon chips.
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
            <View style={styles.iconChip}>
              <EmojiIcon name={variant === "back" ? "arrow-back" : "menu"} size={18} color={COLORS.accentDark} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        {brand ? (
          <View style={styles.brandRow}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.brandMark}
            >
              <EmojiIcon name="shield-checkmark" size={13} />
            </LinearGradient>
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
            <View style={styles.iconChip}>
              <EmojiIcon name={rightIcon} size={17} color={COLORS.accentDark} />
              {rightBadge && <View style={styles.badgeDot} />}
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const ICON_BUTTON_SIZE = 40;
const CHIP_SIZE = 34;

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
  iconChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    backgroundColor: `${COLORS.accent}20`,
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
    borderRadius: RADIUS.sm,
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
    top: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
});
