import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import IconBox from "../../components/common/IconBox";
import EmptyState from "../../components/common/EmptyState";
import { useAppData } from "../../context/DataContext";
import * as NotificationService from "../../services/NotificationService";
import { getDocumentTypeMeta } from "../../constants/documentTypes";
import { EXPIRY_STATUS, getExpiryStatus, formatDaysLabel, formatDate, daysRemaining } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, STATUS_COLORS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

function formatNotificationTime(isoString) {
  if (!isoString) return "";
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return "";
  return `${formatDate(isoString)} ${dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Notifications feed. Two sections: sharing activity from the backend
 * (someone shared/revoked a document — with unread state + "mark all read"),
 * and expiry reminders derived from the document list.
 */
export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { documents, getFamilyMemberById } = useAppData();

  const [sharingNotifications, setSharingNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications();
      setSharingNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Offline or transient failure — expiry reminders below still render.
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

  const reminders = useMemo(() => {
    return documents
      .filter((doc) => {
        const status = getExpiryStatus(doc.expiryDate);
        return status === EXPIRY_STATUS.EXPIRING_SOON || status === EXPIRY_STATUS.EXPIRED;
      })
      .sort((a, b) => daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate))
      .map((doc) => {
        const typeMeta = getDocumentTypeMeta(doc.documentType);
        const status = getExpiryStatus(doc.expiryDate);
        const member = getFamilyMemberById(doc.familyMemberId);
        return {
          id: doc.id,
          documentId: doc.id,
          icon: typeMeta.icon,
          color: STATUS_COLORS[status],
          title: `${typeMeta.label}${status === EXPIRY_STATUS.EXPIRED ? " expired" : " expiring soon"}`,
          subtitle: `${member?.name || "Document"} · ${formatDaysLabel(doc.expiryDate)}`,
        };
      });
  }, [documents, getFamilyMemberById]);

  const isEmpty = sharingNotifications.length === 0 && reminders.length === 0;

  return (
    <ScreenContainer>
      <Header variant="back" title="Notifications" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isEmpty ? (
          <EmptyState
            icon="notifications-outline"
            title="You're all caught up"
            message="Sharing activity and expiry reminders will appear here."
          />
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
                      <Ionicons
                        name="share-social-outline"
                        size={16}
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

        {reminders.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Expiry Reminders</Text>
            </View>
            <Card padded={false} style={styles.listCard}>
              {reminders.map((reminder, index) => (
                <View key={reminder.id}>
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId: reminder.documentId })}
                  >
                    <IconBox icon={reminder.icon} color={reminder.color} />
                    <View style={styles.textWrap}>
                      <Text style={styles.title}>{reminder.title}</Text>
                      <Text style={styles.subtitle}>{reminder.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                  {index < reminders.length - 1 ? <View style={styles.separator} /> : null}
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
