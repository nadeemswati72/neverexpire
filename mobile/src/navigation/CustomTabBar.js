import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmojiIcon from "../components/common/EmojiIcon";
import GlossyIconPuck from "../components/common/GlossyIconPuck";
import PlusGlyph from "../components/common/PlusGlyph";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../constants/theme";
import { ROUTES } from "./routes";

const TAB_META = {
  [ROUTES.DASHBOARD]: {
    activeIcon: "home",
    inactiveIcon: "home-outline",
    label: "Dashboard",
    colorStart: COLORS.accent,
    colorEnd: COLORS.accentDark,
  },
  [ROUTES.FAMILY]: {
    activeIcon: "people",
    inactiveIcon: "people-outline",
    label: "Family",
    colorStart: COLORS.purpleLight,
    colorEnd: COLORS.purple,
  },
};

/**
 * Bottom tab bar with a raised center FAB for "Add Document". The FAB's
 * route (ROUTES.ADD_TAB) is never actually displayed — tapping it pushes
 * AddDocument onto the root stack instead of switching tabs, so the modal
 * appears above the drawer/tabs and "back" returns here.
 *
 * The focused tab gets the glossy 3D puck treatment (gradient + shadow +
 * highlight); unfocused tabs stay a flat, quiet emoji with no puck — that
 * contrast *is* the active/inactive signal, since true color emoji ignore
 * RN's color-tint prop and can't be dimmed the usual way.
 */
export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]}>
      {state.routes.map((route, index) => {
        if (route.name === ROUTES.ADD_TAB) {
          return (
            <View key={route.key} style={styles.fabSlot}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.getParent()?.navigate(ROUTES.ADD_DOCUMENT)}
                accessibilityLabel="Add document"
              >
                <GlossyIconPuck size={58} colorStart={COLORS.accent} colorEnd={COLORS.accentDark} shadowColor={COLORS.accentDark}>
                  <PlusGlyph size={26} />
                </GlossyIconPuck>
              </TouchableOpacity>
            </View>
          );
        }

        const isFocused = state.index === index;
        const meta = TAB_META[route.name];
        if (!meta) return null;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(route.name)}
            accessibilityLabel={meta.label}
          >
            {isFocused ? (
              <GlossyIconPuck size={32} colorStart={meta.colorStart} colorEnd={meta.colorEnd}>
                <EmojiIcon name={meta.activeIcon} size={16} />
              </GlossyIconPuck>
            ) : (
              <View style={styles.iconChip}>
                <EmojiIcon name={meta.inactiveIcon} size={18} />
              </View>
            )}
            <Text style={[styles.label, { color: isFocused ? COLORS.primary : COLORS.textMuted }]}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const FAB_SLOT_HEIGHT = 58;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  iconChip: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
    marginTop: -FAB_SLOT_HEIGHT / 2,
  },
});
