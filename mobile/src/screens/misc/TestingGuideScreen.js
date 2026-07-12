import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import SectionHeader from "../../components/common/SectionHeader";
import EmojiIcon from "../../components/common/EmojiIcon";
import { DEMO_USERS, DEMO_PASSWORD } from "../../data/mockUsers";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

const TEST_FLOWS = [
  "Log in with a demo account (or create a new one via 'Create an account')",
  "Dashboard: summary cards, status donut chart, and family member filter chips — tap a member to narrow everything to them",
  "Add Document: take a photo, choose from gallery, or upload a file — the form is auto-filled by AI, review and edit before saving (or skip with 'Enter details manually')",
  "Document Details: watermarked picture, details, edit, and delete",
  "Share a document: Details → Share, enter another demo account's email, pick permission + expiry; log in as the recipient to see it (with a personalized watermark)",
  "Sharing screen (drawer): 'Shared with Me' and 'Shared by Me' tabs; revoke an outgoing share",
  "Access History on a shared document: as the owner, watch views/downloads appear",
  "Family: view members (with photos), add a new member, share ALL of a member's documents via the share icon",
  "Family Member Documents: per-member status donut + documents",
  "My Documents: search and filter chips (All / Expiring Soon / Expired / Valid)",
  "Notifications (bell): sharing activity with unread badges + expiry reminders",
  "Side drawer: Sharing, My Documents, Settings, Help & Support, About, Logout",
];

const KNOWN_LIMITATIONS = [
  "The app talks to the developer's Flask server — your phone must be on the same Wi-Fi network. Data is shared with the website (same accounts, same documents).",
  "Camera capture needs a real device; emulators often don't have a working camera.",
  "Change Password and Notification toggles in Settings are UI-only for this round.",
  "Share emails are mocked (viewable in the website's Mock Inbox) — recipients see in-app notifications instead.",
];

/**
 * TEMPORARY screen for this testing round — gives testers demo logins, a
 * suggested test flow, and known limitations so bug reports are accurate.
 * Remove this screen, its route (ROUTES.TESTING_GUIDE), and its drawer entry
 * in CustomDrawerContent.js once testing wraps up.
 */
export default function TestingGuideScreen() {
  return (
    <ScreenContainer>
      <Header variant="back" title="Testing Guide" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <EmojiIcon name="construct" size={16} color={COLORS.warning} />
          <Text style={styles.bannerText}>Temporary screen for this testing round only.</Text>
        </View>

        <View style={[styles.banner, styles.bannerInfo]}>
          <EmojiIcon name="globe-outline" size={16} color={COLORS.primary} />
          <Text style={styles.bannerText}>
            For combined website + mobile instructions, ask the developer for the website's
            "Testing Guide" page (/testing).
          </Text>
        </View>

        <Card style={styles.card}>
          <SectionHeader title="Demo Accounts" />
          {DEMO_USERS.map((demoUser) => (
            <View key={demoUser.id} style={styles.accountRow}>
              <Text style={styles.accountName}>{demoUser.name}</Text>
              <Text style={styles.accountEmail}>{demoUser.email}</Text>
            </View>
          ))}
          <View style={styles.passwordRow}>
            <Text style={styles.passwordLabel}>Password (all accounts)</Text>
            <Text style={styles.passwordValue}>{DEMO_PASSWORD}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Suggested Test Flow" />
          {TEST_FLOWS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Known Limitations" />
          {KNOWN_LIMITATIONS.map((item) => (
            <View key={item} style={styles.limitationRow}>
              <EmojiIcon name="information-circle" size={15} color={COLORS.textSecondary} />
              <Text style={styles.limitationText}>{item}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: withOpacity(COLORS.warning, 0.12),
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bannerInfo: {
    backgroundColor: withOpacity(COLORS.primary, 0.08),
  },
  bannerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  accountRow: {
    marginBottom: SPACING.sm,
  },
  accountName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  accountEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  passwordRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  passwordLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  passwordValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
    marginTop: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.pill,
    backgroundColor: withOpacity(COLORS.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  limitationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  limitationText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
});
