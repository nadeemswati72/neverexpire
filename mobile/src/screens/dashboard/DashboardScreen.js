import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import SectionHeader from "../../components/common/SectionHeader";
import SummaryCard from "../../components/documents/SummaryCard";
import DocumentListItem from "../../components/documents/DocumentListItem";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/DataContext";
import { daysRemaining } from "../../utils/dateUtils";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const RECENT_LIMIT = 5;

/** Dashboard / "My Documents" home screen (Mobile.jpg screen 2). */
export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { documents, summary, getFamilyMemberById } = useAppData();

  const firstName = (user?.name || "").split(" ")[0];

  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => {
        const daysA = daysRemaining(a.expiryDate);
        const daysB = daysRemaining(b.expiryDate);
        if (daysA === null) return 1;
        if (daysB === null) return -1;
        return daysA - daysB;
      })
      .slice(0, RECENT_LIMIT);
  }, [documents]);

  const openDocument = (documentId) => {
    navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId });
  };

  const openAllDocuments = (filter) => {
    navigation.navigate(ROUTES.MY_DOCUMENTS, { filter });
  };

  return (
    <ScreenContainer>
      <Header
        brand
        rightIcon="notifications-outline"
        rightBadge
        onRightPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hello, {firstName} 👋</Text>
          <Text style={styles.greetingSubtitle}>Here's your document overview</Text>
        </View>

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
    marginBottom: SPACING.xl,
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
