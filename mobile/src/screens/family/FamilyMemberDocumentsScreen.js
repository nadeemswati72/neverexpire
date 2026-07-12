import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import StatusOverview from "../../components/documents/StatusOverview";
import DocumentListItem from "../../components/documents/DocumentListItem";
import EmptyState from "../../components/common/EmptyState";
import { useAppData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { authHeader } from "../../services/ApiService";
import { daysRemaining } from "../../utils/dateUtils";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/** Documents belonging to a single family member (Mobile.jpg screen 6). */
export default function FamilyMemberDocumentsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { familyMemberId } = route.params || {};
  const { getFamilyMemberById, getDocumentsForMember } = useAppData();
  const { token } = useAuth();

  const member = getFamilyMemberById(familyMemberId);

  const documents = useMemo(() => {
    return [...getDocumentsForMember(familyMemberId)].sort((a, b) => {
      const daysA = daysRemaining(a.expiryDate);
      const daysB = daysRemaining(b.expiryDate);
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      return daysA - daysB;
    });
  }, [familyMemberId, getDocumentsForMember]);

  if (!member) {
    return (
      <ScreenContainer>
        <Header variant="back" title="Family Member" />
        <EmptyState icon="alert-circle-outline" title="Member not found" message="This family member may have been removed." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        variant="back"
        title={member.name}
        rightIcon="add"
        onRightPress={() => navigation.navigate(ROUTES.ADD_DOCUMENT, { familyMemberId: member.id })}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileRow}>
          <Avatar name={member.name} imageUri={member.photoUri} headers={authHeader(token)} color={member.avatarColor} size={56} />
          <View style={styles.profileText}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.relationship}>{member.isSelf ? "Me" : member.relationship}</Text>
          </View>
        </View>

        {documents.length > 0 ? <StatusOverview documents={documents} title="Status Overview" /> : null}

        {documents.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No documents yet"
            message={`${member.name} doesn't have any documents yet. Tap + to add one.`}
          />
        ) : (
          <Card padded={false} style={styles.listCard}>
            {documents.map((doc, index) => (
              <View key={doc.id}>
                <DocumentListItem
                  document={doc}
                  onPress={() => navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId: doc.id })}
                />
                {index < documents.length - 1 ? <View style={styles.separator} /> : null}
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
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  profileText: {
    marginLeft: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  relationship: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
