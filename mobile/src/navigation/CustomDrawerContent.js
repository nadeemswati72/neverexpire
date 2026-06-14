import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "../components/common/Avatar";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, RADIUS } from "../constants/theme";
import { ROUTES } from "./routes";

/**
 * Side navigation drawer (Mobile.jpg screen 8). Each item either switches
 * the bottom tab (Dashboard, Family Members) or pushes a screen onto the
 * root stack via `navigation.getParent()` so it appears above the drawer.
 */
const MENU_ITEMS = [
  {
    key: ROUTES.DASHBOARD,
    icon: "home-outline",
    label: "Dashboard",
    action: (navigation) => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DASHBOARD }),
  },
  {
    key: ROUTES.ADD_DOCUMENT,
    icon: "add-circle-outline",
    label: "Add Document",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.ADD_DOCUMENT),
  },
  {
    key: ROUTES.MY_DOCUMENTS,
    icon: "document-text-outline",
    label: "My Documents",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.MY_DOCUMENTS),
  },
  {
    key: ROUTES.FAMILY,
    icon: "people-outline",
    label: "Family Members",
    action: (navigation) => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.FAMILY }),
  },
  {
    key: ROUTES.NOTIFICATIONS,
    icon: "notifications-outline",
    label: "Notifications",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.NOTIFICATIONS),
  },
  {
    key: ROUTES.SETTINGS,
    icon: "settings-outline",
    label: "Settings",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.SETTINGS),
  },
  {
    key: ROUTES.HELP_SUPPORT,
    icon: "help-circle-outline",
    label: "Help & Support",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.HELP_SUPPORT),
  },
  {
    key: ROUTES.ABOUT,
    icon: "information-circle-outline",
    label: "About",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.ABOUT),
  },
  // TEMPORARY: remove this entry along with ROUTES.TESTING_GUIDE and
  // TestingGuideScreen.js once this testing round is done.
  {
    key: ROUTES.TESTING_GUIDE,
    icon: "construct-outline",
    label: "Testing Guide",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.TESTING_GUIDE),
  },
];

export default function CustomDrawerContent({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNavigate = (item) => {
    navigation.closeDrawer();
    item.action(navigation);
  };

  const handleProfilePress = () => {
    navigation.closeDrawer();
    navigation.getParent()?.navigate(ROUTES.PROFILE);
  };

  const handleLogout = async () => {
    navigation.closeDrawer();
    await logout();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }]}>
      <TouchableOpacity style={styles.profile} onPress={handleProfilePress} activeOpacity={0.85}>
        <Avatar name={user?.name} color={user?.avatarColor} size={56} />
        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.menuItem} onPress={() => handleNavigate(item)}>
            <Ionicons name={item.icon} size={20} color={COLORS.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.menuItem, styles.logout]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={styles.menuIcon} />
        <Text style={[styles.menuLabel, styles.logoutLabel]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: SPACING.xl,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menu: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  menuIcon: {
    marginRight: SPACING.lg,
    width: 24,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  logout: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
  logoutLabel: {
    color: COLORS.danger,
  },
});
