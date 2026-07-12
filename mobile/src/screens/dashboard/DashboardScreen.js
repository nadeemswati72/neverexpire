import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import SectionHeader from "../../components/common/SectionHeader";
import SummaryCard from "../../components/documents/SummaryCard";
import StatusOverview from "../../components/documents/StatusOverview";
import DocumentListItem from "../../components/documents/DocumentListItem";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/DataContext";
import { authHeader } from "../../services/ApiService";
import * as NotificationService from "../../services/NotificationService";
import { EXPIRY_STATUS, getExpiryStatus, daysRemaining } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const RECENT_LIMIT = 5;

/**
 * Dashboard home screen. Tapping a family member chip narrows the summary
 * cards, donut chart, and recent list to that member — mirroring the web
 * dashboard's sidebar person filter.
 */
export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { documents, familyMembers, getFamilyMemberById } = useAppData();
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refresh the bell badge whenever the dashboard regains focus (e.g. after
  // reading notifications or receiving a new share).
  useFocusEffect(
    useCallback(() => {
      NotificationService.getNotifications()
        .then((data) => setUnreadCount(data.unread_count || 0))
        .catch(() => {});
    }, [])
  );

  const firstName = (user?.name || "").split(" ")[0];

  const visibleDocuments = useMemo(
    () => (selectedMemberId ? documents.filter((doc) => doc.familyMemberId === selectedMemberId) : documents),
    [documents, selectedMemberId]
  );

  const summary = useMemo(() => {
    const expiringSoonCount = visibleDocuments.filter((doc) => {
      const status = getExpiryStatus(doc.expiryDate);
      return status === EXPIRY_STATUS.EXPIRING_SOON || status === EXPIRY_STATUS.EXPIRED;
    }).length;
    return { totalCount: visibleDocuments.length, expiringSoonCount };
  }, [visibleDocuments]);

  const recentDocuments = useMemo(() => {
    return [...visibleDocuments]
      .sort((a, b) => {
        const daysA = daysRemaining(a.expiryDate);
        const daysB = daysRemaining(b.expiryDate);
        if (daysA === null) return 1;
        if (daysB === null) return -1;
        return daysA - daysB;
      })
      .slice(0, RECENT_LIMIT);
  }, [visibleDocuments]);

  const selectedMember = selectedMemberId ? getFamilyMemberById(selectedMemberId) : null;

  const openDocument = (documentId) => {
    navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId });
  };

  const openAllDocuments = (filter) => {
    navigation.navigate(ROUTES.MY_DOCUMENTS, { filter, familyMemberId: selectedMemberId || undefined });
  };

  return (
    <ScreenContainer>
      <Header
        brand
        rightIcon="notifications-outline"
        rightBadge={unreadCount > 0}
        onRightPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hello, {firstName} 👋</Text>
          <Text style={styles.greetingSubtitle}>
            {selectedMember ? `Showing ${selectedMember.name}'s documents` : "Here's your document overview"}
          </Text>
        </View>

        {familyMembers.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.memberScroll}
            contentContainerStyle={styles.memberRow}
          >
            <TouchableOpacity
              style={[styles.memberChip, selectedMemberId === null && styles.memberChipActive]}
              onPress={() => setSelectedMemberId(null)}
              activeOpacity={0.85}
            >
              <Text style={[styles.memberChipText, selectedMemberId === null && styles.memberChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {familyMembers.map((member) => {
              const active = selectedMemberId === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberChip, active && styles.memberChipActive]}
                  onPress={() => setSelectedMemberId(active ? null : member.id)}
                  activeOpacity={0.85}
                >
                  <Avatar
                    name={member.name}
                    imageUri={member.photoUri}
                    headers={authHeader(token)}
                    color={member.avatarColor}
                    size={22}
                  />
                  <Text style={[styles.memberChipText, active && styles.memberChipTextActive]} numberOfLines={1}>
                    {member.isSelf ? "Me" : member.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.summaryRow}>
          <SummaryCard
            icon="alert-circle-outline"
            label="Expiring Soon"
            count={summary.expiringSoonCount}
            color={COLORS.warning}
            onPress={() => openAllDocuments("expiring_soon")}
          />
          <View style={styles.summaryGap} />
          <SummaryCard
            icon="folder-outline"
            label="All Documents"
            count={summary.totalCount}
            color={COLORS.accent}
            onPress={() => openAllDocuments("all")}
          />
        </View>

        <StatusOverview
          documents={visibleDocuments}
          title={selectedMember ? `${selectedMember.name}'s Status` : "Family Status Overview"}
        />

        <SectionHeader
          title="Recent Documents"
          actionLabel="See All"
          onActionPress={() => openAllDocuments("all")}
        />

        {recentDocuments.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No documents yet"
            message="Tap the + button below to add your first document."
          />
        ) : (
          <Card padded={false} style={styles.listCard}>
            {recentDocuments.map((doc, index) => {
              const member = getFamilyMemberById(doc.familyMemberId);
              return (
                <View key={doc.id}>
                  <DocumentListItem
                    document={doc}
                    subtitle={member?.name}
                    onPress={() => openDocument(doc.id)}
                  />
                  {index < recentDocuments.length - 1 ? <View style={styles.separator} /> : null}
                </View>
              );
            })}
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
  greeting: {
    marginBottom: SPACING.lg,
  },
  greetingTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  greetingSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  memberScroll: {
    flexGrow: 0,
    marginBottom: SPACING.lg,
  },
  memberRow: {
    gap: SPACING.sm,
    alignItems: "center",
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  memberChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
  },
  memberChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    maxWidth: 90,
  },
  memberChipTextActive: {
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: SPACING.xl,
  },
  summaryGap: {
    width: SPACING.md,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
