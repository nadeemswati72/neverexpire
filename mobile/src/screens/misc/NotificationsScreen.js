import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import EmojiIcon from "../../components/common/EmojiIcon";
import * as NotificationService from "../../services/NotificationService";
import { formatDate } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

function formatNotificationTime(isoString) {
  if (!isoString) return "";
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return "";
  return `${formatDate(isoString)} ${dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Sharing-activity feed only (someone shared/revoked a document — with
 * unread state + "mark all read"). Expiry reminders live on their own real,
 * backend-tracked screen (RemindersScreen) — this used to fake a reminders
 * section by deriving it client-side from the document list, which had no
 * 90/30/7-day rule distinction and no server-side dismiss/send-now.
 */
export default function NotificationsScreen() {
  const navigation = useNavigation();

  const [sharingNotifications, setSharingNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications();
      setSharingNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Offline or transient failure.
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    await NotificationService.markAllRead();
    loadNotifications();
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.is_read) {
      NotificationService.markRead(notification.id).then(loadNotifications).catch(() => {});
    }
    if (notification.document_id) {
      navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId: notification.document_id });
    }
  };

  return (
    <ScreenContainer>
      <Header variant="back" title="Notifications" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.remindersLink}
          onPress={() => navigation.navigate(ROUTES.REMINDERS)}
          activeOpacity={0.85}
        >
          <View style={styles.remindersLinkIcon}>
            <EmojiIcon name="alarm-outline" size={18} color={COLORS.accentDark} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>Expiry Reminders</Text>
            <Text style={styles.subtitle}>90/30/7-day rules, dismiss, and send-now</Text>
          </View>
          <EmojiIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {sharingNotifications.length === 0 ? (
          <Text style={styles.emptyText}>No sharing activity yet.</Text>
        ) : null}

        {sharingNotifications.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Sharing Activity</Text>
              {unreadCount > 0 ? (
                <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
                  <Text style={styles.markAll}>Mark all read</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Card padded={false} style={styles.listCard}>
              {sharingNotifications.map((notification, index) => (
                <View key={notification.id}>
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.85}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={[styles.shareIcon, !notification.is_read && styles.shareIconUnread]}>
                      <EmojiIcon
                        name="share-social-outline"
                        size={15}
                        color={notification.is_read ? COLORS.textSecondary : COLORS.accentDark}
                      />
                    </View>
                    <View style={styles.textWrap}>
                      <Text style={[styles.title, !notification.is_read && styles.titleUnread]} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.subtitle}>{formatNotificationTime(notification.created_at)}</Text>
                    </View>
                    {!notification.is_read ? <View style={styles.unreadDot} /> : null}
                  </TouchableOpacity>
                  {index < sharingNotifications.length - 1 ? <View style={styles.separator} /> : null}
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
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  remindersLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  remindersLinkIcon: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    padding: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  markAll: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accentDark,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  shareIcon: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: withOpacity(COLORS.textMuted, 0.15),
    alignItems: "center",
    justifyContent: "center",
  },
  shareIconUnread: {
    backgroundColor: withOpacity(COLORS.accent, 0.14),
  },
  textWrap: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  titleUnread: {
    fontWeight: FONT_WEIGHTS.semibold,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
