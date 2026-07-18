import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import AppButton from "../../components/common/AppButton";
import EmptyState from "../../components/common/EmptyState";
import * as RemindersService from "../../services/RemindersService";
import { formatDate } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

/**
 * Real backend-tracked reminders (90/30/7-day rules) — mirrors web's
 * RemindersPage. Distinct from NotificationsScreen's sharing-activity feed;
 * that screen links here instead of faking its own reminder list.
 */

function urgency(daysRemaining) {
  if (daysRemaining === null || daysRemaining === undefined) return { label: "UPCOMING", color: COLORS.textSecondary };
  if (daysRemaining < 0) return { label: "EXPIRED", color: COLORS.danger };
  if (daysRemaining <= 7) return { label: "URGENT", color: COLORS.danger };
  if (daysRemaining <= 30) return { label: "SOON", color: COLORS.warning };
  return { label: "UPCOMING", color: COLORS.success };
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await RemindersService.getReminders();
      setReminders(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSendNow = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const result = await RemindersService.sendReminderDigestNow();
      if (result.error) {
        setSendResult(`⚠️ ${result.error}`);
      } else if (!result.sent) {
        setSendResult("No reminders are due right now — nothing to send.");
      } else {
        setSendResult(`✅ Sent — ${result.count} reminder${result.count !== 1 ? "s" : ""} included.`);
      }
      load();
    } catch (err) {
      setSendResult("⚠️ Failed to send — check the backend is reachable.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDismiss = async (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await RemindersService.dismissReminder(id);
  };

  const pending = reminders.filter((r) => r.status === "pending");
  const sent = reminders.filter((r) => r.status === "sent");

  return (
    <ScreenContainer>
      <Header variant="back" title="Reminders" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>You're reminded 90, 30, 7 days before any document expires.</Text>

        <AppButton
          label={isSending ? "Sending…" : "📧 Send Reminder Digest Now"}
          onPress={handleSendNow}
          loading={isSending}
          style={styles.sendButton}
        />

        {sendResult ? <Text style={styles.sendResult}>{sendResult}</Text> : null}

        <Text style={styles.sectionTitle}>Pending ({pending.length})</Text>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading…</Text>
        ) : pending.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="All caught up" message="No pending reminders — everything's on track." />
        ) : (
          <Card padded={false} style={styles.listCard}>
            {pending.map((r, index) => {
              const u = urgency(r.days_remaining);
              const daysLabel =
                r.days_remaining === null
                  ? ""
                  : r.days_remaining < 0
                    ? `${Math.abs(r.days_remaining)}d ago`
                    : `${r.days_remaining}d left`;
              return (
                <View key={r.id}>
                  <View style={styles.row}>
                    <View style={[styles.badge, { backgroundColor: u.color }]}>
                      <Text style={styles.badgeText}>{u.label}</Text>
                    </View>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{r.document_title}</Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {r.person_name} · {r.rule_name} ({r.threshold_days}d threshold)
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={[styles.rowDays, { color: u.color }]}>{daysLabel}</Text>
                      <Text style={styles.rowDate}>{formatDate(r.expiry_date)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDismiss(r.id)} style={styles.dismissButton} activeOpacity={0.85}>
                      <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                  {index < pending.length - 1 ? <View style={styles.separator} /> : null}
                </View>
              );
            })}
          </Card>
        )}

        {sent.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Already Sent ({sent.length})</Text>
            <Card padded={false} style={styles.listCard}>
              {sent.map((r, index) => (
                <View key={r.id}>
                  <View style={styles.row}>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{r.document_title}</Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>{r.person_name} · {r.rule_name}</Text>
                    </View>
                    <Text style={styles.rowDate}>Sent {formatDate(r.sent_at)}</Text>
                  </View>
                  {index < sent.length - 1 ? <View style={styles.separator} /> : null}
                </View>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sendButton: {
    marginBottom: SPACING.sm,
  },
  sendResult: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  loadingText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    padding: SPACING.xl,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  badge: {
    borderRadius: RADIUS.pill,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  rowMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  rowDays: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  rowDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  dismissButton: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  dismissText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
