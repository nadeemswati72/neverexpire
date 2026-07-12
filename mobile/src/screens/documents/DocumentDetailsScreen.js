import React from "react";
import { View, Text, Image, ScrollView, Alert, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import IconBox from "../../components/common/IconBox";
import AppButton from "../../components/common/AppButton";
import EmptyState from "../../components/common/EmptyState";
import { useAppData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { authHeader } from "../../services/ApiService";
import { getDocumentTypeMeta } from "../../constants/documentTypes";
import { getExpiryStatus, formatDaysLabel, formatExpiresOn, formatDate } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/** Full document record view (Mobile.jpg screen 4), with edit & delete. */
export default function DocumentDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { documentId } = route.params || {};
  const { getDocumentById, getFamilyMemberById, deleteDocument } = useAppData();
  const { token } = useAuth();

  const document = getDocumentById(documentId);

  if (!document) {
    return (
      <ScreenContainer>
        <Header variant="back" title="Document Details" />
        <EmptyState
          icon="alert-circle-outline"
          title="Document not found"
          message="This document may have been deleted."
        />
      </ScreenContainer>
    );
  }

  const typeMeta = getDocumentTypeMeta(document.documentType);
  const status = getExpiryStatus(document.expiryDate);
  const member = getFamilyMemberById(document.familyMemberId);

  const handleEdit = () => {
    navigation.navigate(ROUTES.DOCUMENT_FORM, { documentId: document.id });
  };

  const handleDelete = () => {
    Alert.alert("Delete Document", `Are you sure you want to delete this ${typeMeta.label}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDocument(document.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const infoRows = [
    { label: "Full Name", value: document.fullName },
    { label: "Document Number", value: document.documentNumber },
    { label: "Date of Birth", value: document.dateOfBirth ? formatDate(document.dateOfBirth) : null },
    { label: "Issued Date", value: document.issuedDate ? formatDate(document.issuedDate) : null },
    { label: "Expiry Date", value: document.expiryDate ? formatDate(document.expiryDate) : "No expiry" },
    { label: "Issued By", value: document.issuedBy },
    {
      label: "Belongs To",
      value: member ? (member.isSelf ? `${member.name} (Me)` : `${member.name} (${member.relationship})`) : null,
    },
  ].filter((row) => !!row.value);

  return (
    <ScreenContainer>
      <Header variant="back" title="Document Details" rightIcon="create-outline" onRightPress={handleEdit} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {document.imageUri ? (
          <Image
            source={{ uri: document.imageUri, headers: authHeader(token) }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: withOpacity(typeMeta.color, 0.08) }]}>
            <MaterialCommunityIcons name={typeMeta.icon} size={48} color={typeMeta.color} />
          </View>
        )}

        <View style={styles.titleRow}>
          <IconBox icon={typeMeta.icon} color={typeMeta.color} size={48} />
          <View style={styles.titleText}>
            <Text style={styles.title}>{typeMeta.label}</Text>
            <Text style={styles.subtitle}>{formatExpiresOn(document.expiryDate)}</Text>
          </View>
          <Badge label={formatDaysLabel(document.expiryDate)} status={status} variant="solid" />
        </View>

        <Card style={styles.infoCard} padded={false}>
          {infoRows.map((row, index) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
              {index < infoRows.length - 1 ? <View style={styles.infoSeparator} /> : null}
            </View>
          ))}
        </Card>

        {document.notes ? (
          <Card style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{document.notes}</Text>
          </Card>
        ) : null}

        <AppButton
          label="Edit Document"
          onPress={handleEdit}
          variant="outline"
          icon="create-outline"
          style={styles.actionButton}
        />
        <AppButton
          label="Delete Document"
          onPress={handleDelete}
          variant="danger"
          icon="trash-outline"
          style={styles.actionButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.border,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  titleText: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  infoSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  notesCard: {
    marginBottom: SPACING.lg,
  },
  notesLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
});
