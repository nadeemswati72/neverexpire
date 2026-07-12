import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigationState } from "@react-navigation/native";

import Avatar from "../components/common/Avatar";
import ShareIcon from "../components/common/ShareIcon";
import GlossyIconPuck from "../components/common/GlossyIconPuck";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, RADIUS } from "../constants/theme";
import { ROUTES } from "./routes";

/**
 * Side navigation drawer — "Emoji Nav" design, chosen from three mockups
 * (see docs/testing-guide.html-adjacent design review). Expressive emoji
 * icons, a soft teal gradient pill for the active row, and a gradient brand
 * logo, echoing the web sidebar's teal identity with more personality.
 */
const MENU_ITEMS = [
  {
    key: ROUTES.DASHBOARD,
    emoji: "🏠",
    label: "Dashboard",
    action: (navigation) => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DASHBOARD }),
  },
  {
    key: ROUTES.ADD_DOCUMENT,
    emoji: "➕",
    label: "Add Document",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.ADD_DOCUMENT),
  },
  {
    key: ROUTES.MY_DOCUMENTS,
    emoji: "📄",
    label: "My Documents",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.MY_DOCUMENTS),
  },
  {
    key: ROUTES.SHARING,
    isShareIcon: true,
    label: "Sharing",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.SHARING),
  },
  {
    key: ROUTES.FAMILY,
    emoji: "👪",
    label: "Family Members",
    action: (navigation) => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.FAMILY }),
  },
  {
    key: ROUTES.NOTIFICATIONS,
    emoji: "🔔",
    label: "Notifications",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.NOTIFICATIONS),
  },
  {
    key: ROUTES.SETTINGS,
    emoji: "⚙️",
    label: "Settings",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.SETTINGS),
  },
  {
    key: ROUTES.HELP_SUPPORT,
    emoji: "❓",
    label: "Help & Support",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.HELP_SUPPORT),
  },
  {
    key: ROUTES.ABOUT,
    emoji: "ℹ️",
    label: "About",
    action: (navigation) => navigation.getParent()?.navigate(ROUTES.ABOUT),
  },
  // TEMPORARY: remove this entry along with ROUTES.TESTING_GUIDE and
  // TestingGuideScreen.js once this testing round is done.
  {
    key: ROUTES.TESTING_GUIDE,
    emoji: "🧪",
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
        <LinearGradient
          colors={[COLORS.accent, COLORS.accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandLogo}
        >
          <Text style={styles.brandLogoEmoji}>🛡️</Text>
        </LinearGradient>
        <View>
          <Text style={styles.brandTitle}>NeverExpire</Text>
          <Text style={styles.brandSubtitle}>Document Tracker</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.profile, pressed && styles.profilePressed]}
        onPress={handleProfilePress}
      >
        <View style={styles.avatarShadowWrap}>
          <Avatar name={user?.name} color={user?.avatarColor} size={48} />
        </View>
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
          const Row = isActive ? LinearGradient : View;
          const rowGradientProps = isActive
            ? {
                colors: [`${COLORS.accent}2E`, `${COLORS.accent}14`],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
              }
            : {};
          return (
            <Pressable key={item.key} onPress={() => handleNavigate(item)}>
              {({ pressed }) => (
                <Row style={[styles.menuItem, pressed && !isActive && styles.menuItemPressed]} {...rowGradientProps}>
                  <View style={styles.emojiWrap}>
                    {item.isShareIcon ? (
                      <GlossyIconPuck size={24} colorStart={COLORS.accent} colorEnd={COLORS.accentDark}>
                        <ShareIcon size={12} colorStart="#FFFFFF" colorEnd="#FFFFFF" />
                      </GlossyIconPuck>
                    ) : (
                      <Text style={styles.emojiText}>{item.emoji}</Text>
                    )}
                  </View>
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
                  {isActive ? <View style={styles.activeDot} /> : null}
                </Row>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.menuItem, styles.logout, pressed && styles.logoutPressed]}
        onPress={handleLogout}
      >
        <View style={styles.emojiWrap}>
          <Text style={styles.emojiText}>🚪</Text>
        </View>
        <Text style={[styles.menuLabel, styles.logoutLabel]}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoEmoji: {
    fontSize: 16,
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
    backgroundColor: `${COLORS.accent}0F`,
  },
  avatarShadowWrap: {
    shadowColor: COLORS.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.textMuted,
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  menuItemPressed: {
    backgroundColor: `${COLORS.primary}0D`,
  },
  emojiWrap: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  emojiText: {
    fontSize: 17,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#46516E",
  },
  menuLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
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
    backgroundColor: `${COLORS.danger}0F`,
  },
  logoutLabel: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
