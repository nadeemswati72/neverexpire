import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigationState } from "@react-navigation/native";

import Avatar from "../components/common/Avatar";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, RADIUS, withOpacity } from "../constants/theme";
import { ROUTES } from "./routes";

/**
 * Side navigation drawer. Rebuilt to match the web sidebar's teal identity:
 * a branded header block (logo + wordmark, same as web's top-left), teal
 * icon chips on every row (previously flat black icons with no background —
 * the biggest visual gap vs. web), and a teal active/pressed state on top.
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
    key: ROUTES.SHARING,
    icon: "share-social-outline",
    label: "Sharing",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.SHARING),
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

/** Bonus: highlights Dashboard/Family when that tab is currently focused. */
function useActiveTabRoute() {
  return useNavigationState((state) => {
    const drawerRoute = state?.routes?.[state.index];
    const tabState = drawerRoute?.state;
    if (!tabState || tabState.type !== "tab") return null;
    return tabState.routes?.[tabState.index]?.name ?? null;
  });
}

export default function CustomDrawerContent({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const activeTabRoute = useActiveTabRoute();

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
      <View style={styles.brandRow}>
        <View style={styles.brandLogo}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
        </View>
        <View>
          <Text style={styles.brandTitle}>NeverExpire</Text>
          <Text style={styles.brandSubtitle}>Document Tracker</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.profile, pressed && styles.profilePressed]}
        onPress={handleProfilePress}
      >
        <Avatar name={user?.name} color={user?.avatarColor} size={52} />
        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </Pressable>

      <Text style={styles.sectionLabel}>Menu</Text>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => {
          const isActive = item.key === activeTabRoute;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.menuItem,
                isActive && styles.menuItemActive,
                pressed && !isActive && styles.menuItemPressed,
              ]}
              onPress={() => handleNavigate(item)}
            >
              <View style={[styles.iconChip, isActive && styles.iconChipActive]}>
                <Ionicons name={item.icon} size={17} color={isActive ? COLORS.white : COLORS.accentDark} />
              </View>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
              {isActive ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.menuItem, styles.logout, pressed && styles.logoutPressed]}
        onPress={handleLogout}
      >
        <View style={[styles.iconChip, styles.iconChipDanger]}>
          <Ionicons name="log-out-outline" size={17} color={COLORS.danger} />
        </View>
        <Text style={[styles.menuLabel, styles.logoutLabel]}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  profilePressed: {
    backgroundColor: withOpacity(COLORS.accent, 0.06),
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
  sectionLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.accentDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  menu: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  menuItemActive: {
    backgroundColor: withOpacity(COLORS.accent, 0.12),
  },
  menuItemPressed: {
    backgroundColor: withOpacity(COLORS.primary, 0.05),
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: withOpacity(COLORS.accent, 0.14),
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  iconChipActive: {
    backgroundColor: COLORS.accent,
  },
  iconChipDanger: {
    backgroundColor: withOpacity(COLORS.danger, 0.12),
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  menuLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginLeft: "auto",
  },
  logout: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderRadius: 0,
    paddingTop: SPACING.lg,
    marginTop: SPACING.xs,
  },
  logoutPressed: {
    backgroundColor: withOpacity(COLORS.danger, 0.06),
  },
  logoutLabel: {
    color: COLORS.danger,
  },
});
