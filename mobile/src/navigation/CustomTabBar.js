import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmojiIcon from "../components/common/EmojiIcon";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../constants/theme";
import { ROUTES } from "./routes";

const TAB_META = {
  [ROUTES.DASHBOARD]: { activeIcon: "home", inactiveIcon: "home-outline", label: "Dashboard" },
  [ROUTES.FAMILY]: { activeIcon: "people", inactiveIcon: "people-outline", label: "Family" },
};

/**
 * Bottom tab bar with a raised center FAB for "Add Document". The FAB's
 * route (ROUTES.ADD_TAB) is never actually displayed — tapping it pushes
 * AddDocument onto the root stack instead of switching tabs, so the modal
 * appears above the drawer/tabs and "back" returns here.
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
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() => navigation.getParent()?.navigate(ROUTES.ADD_DOCUMENT)}
                accessibilityLabel="Add document"
              >
                <EmojiIcon name="add" size={24} />
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
            <EmojiIcon
              name={isFocused ? meta.activeIcon : meta.inactiveIcon}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.label, { color: isFocused ? COLORS.primary : COLORS.textMuted }]}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const FAB_SIZE = 56;

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
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -FAB_SIZE / 2,
    ...SHADOW.fab,
  },
});
