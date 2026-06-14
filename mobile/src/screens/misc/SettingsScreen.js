import React, { useState } from "react";
import { View, Text, ScrollView, Switch, StyleSheet } from "react-native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import SectionHeader from "../../components/common/SectionHeader";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

const NOTIFICATION_OPTIONS = [
  {
    key: "expiryReminders",
    label: "Expiry Reminders",
    description: "Get notified 30 days before a document expires",
    defaultValue: true,
  },
  {
    key: "expiredAlerts",
    label: "Expired Document Alerts",
    description: "Get notified immediately when a document expires",
    defaultValue: true,
  },
  {
    key: "weeklyDigest",
    label: "Weekly Email Digest",
    description: "Receive a weekly summary of upcoming expiries",
    defaultValue: false,
  },
];

/**
 * Notification preferences (drawer "Settings"). UI-only — toggles are kept
 * in local state for the demo and aren't wired to a real notification
 * service yet.
 */
export default function SettingsScreen() {
  const [toggles, setToggles] = useState(() =>
    NOTIFICATION_OPTIONS.reduce((acc, option) => {
      acc[option.key] = option.defaultValue;
      return acc;
    }, {})
  );

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScreenContainer>
      <Header variant="back" title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <SectionHeader title="Notifications" />
          {NOTIFICATION_OPTIONS.map((option, index) => (
            <View key={option.key}>
              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <Text style={styles.label}>{option.label}</Text>
                  <Text style={styles.description}>{option.description}</Text>
                </View>
                <Switch
                  value={toggles[option.key]}
                  onValueChange={() => handleToggle(option.key)}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={COLORS.surface}
                />
              </View>
              {index < NOTIFICATION_OPTIONS.length - 1 ? <View style={styles.separator} /> : null}
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="App" />
          <View style={styles.row}>
            <Text style={styles.label}>App Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
  },
  textWrap: {
    flex: 1,
    marginRight: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  value: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
