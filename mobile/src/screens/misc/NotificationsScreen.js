import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import IconBox from "../../components/common/IconBox";
import EmptyState from "../../components/common/EmptyState";
import { useAppData } from "../../context/DataContext";
import { getDocumentTypeMeta } from "../../constants/documentTypes";
import { EXPIRY_STATUS, getExpiryStatus, formatDaysLabel, daysRemaining } from "../../utils/dateUtils";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, STATUS_COLORS } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/**
 * Reminder feed (drawer "Notifications"). Derived from documents that are
 * expired or expiring within the threshold — there's no separate
 * notifications data model, so this stays in sync with the document list
 * automatically.
 */
export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { documents, getFamilyMemberById } = useAppData();

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

  return (
    <ScreenContainer>
      <Header variant="back" title="Notifications" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="You're all caught up"
            message="We'll notify you here when a document is expiring soon."
          />
        ) : (
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
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  textWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
