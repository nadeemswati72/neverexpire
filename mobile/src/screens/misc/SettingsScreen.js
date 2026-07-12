import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Switch, StyleSheet } from "react-native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import SectionHeader from "../../components/common/SectionHeader";
import { useAppData } from "../../context/DataContext";
import * as NotificationSchedulerService from "../../services/NotificationSchedulerService";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

const NOTIFICATION_OPTIONS = [
  {
    key: "expiryReminders",
    label: "Expiry Reminders",
    description: "On-device alerts 30/7/1 days before a document expires",
  },
  {
    key: "expiredAlerts",
    label: "Expired Document Alerts",
    description: "On-device alert on the day a document expires",
  },
  {
    key: "weeklyDigest",
    label: "Weekly Email Digest",
    description: "Receive a weekly summary of upcoming expiries (UI-only for this round)",
    isEmailOnly: true,
  },
];

const DEFAULT_TOGGLES = { expiryReminders: true, expiredAlerts: true, weeklyDigest: false };

/**
 * Notification preferences. expiryReminders/expiredAlerts are real —
 * persisted to AsyncStorage and control on-device scheduled notifications
 * (see NotificationSchedulerService). weeklyDigest stays UI-only; the
 * actual reminder digest email is a server-side feature, not a device toggle.
 */
export default function SettingsScreen() {
  const { documents } = useAppData();
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    NotificationSchedulerService.getPreferences().then((prefs) => {
      setToggles({ ...DEFAULT_TOGGLES, ...prefs });
      setIsLoaded(true);
    });
  }, []);

  const handleToggle = async (key, option) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    if (option.isEmailOnly) return;

    await NotificationSchedulerService.setPreferences(next);
    NotificationSchedulerService.syncExpiryNotifications(documents).catch(() => {});
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
                  onValueChange={() => handleToggle(option.key, option)}
                  disabled={!isLoaded}
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
