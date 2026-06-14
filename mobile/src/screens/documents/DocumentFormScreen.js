import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Avatar from "../../components/common/Avatar";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import { useAppData } from "../../context/DataContext";
import { DOCUMENT_TYPE_LIST, mapExtractedDocumentType } from "../../constants/documentTypes";
import { extractDocumentDetails, ExtractionError } from "../../services/ExtractionService";
import { validateDocumentForm, isValidISODate } from "../../utils/validators";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/**
 * Editable document fields — used both to finish "Add Document" (params:
 * `imageUri` from the picker) and to edit an existing document (params:
 * `documentId`). Saves via DataContext.saveDocument, which creates or
 * merge-updates the record in AsyncStorage.
 */
export default function DocumentFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri: pickedImageUri, documentId, familyMemberId: preselectedFamilyMemberId } = route.params || {};
  const { familyMembers, getDocumentById, saveDocument } = useAppData();

  const existingDocument = documentId ? getDocumentById(documentId) : null;
  const isEditing = !!existingDocument;

  const [documentType, setDocumentType] = useState(existingDocument?.documentType || "");
  const [familyMemberId, setFamilyMemberId] = useState(
    existingDocument?.familyMemberId || preselectedFamilyMemberId || familyMembers[0]?.id || ""
  );
  const [fullName, setFullName] = useState(existingDocument?.fullName || "");
  const [documentNumber, setDocumentNumber] = useState(existingDocument?.documentNumber || "");
  const [issuedDate, setIssuedDate] = useState(existingDocument?.issuedDate || "");
  const [expiryDate, setExpiryDate] = useState(existingDocument?.expiryDate || "");
  const [issuedBy, setIssuedBy] = useState(existingDocument?.issuedBy || "");
  const [notes, setNotes] = useState(existingDocument?.notes || "");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const imageUri = existingDocument?.imageUri ?? pickedImageUri ?? null;

  // On a freshly picked image (not when editing an existing document), ask
  // the Flask backend's /api/extract to read the document and pre-fill the
  // form — same AI extraction the web "Add Document" flow uses.
  useEffect(() => {
    if (!pickedImageUri || isEditing) return;

    let isCancelled = false;
    (async () => {
      setIsExtracting(true);
      try {
        const result = await extractDocumentDetails(pickedImageUri);
        if (isCancelled) return;
        setDocumentType(mapExtractedDocumentType(result.document_type));
        if (result.holder_name) setFullName(result.holder_name);
        if (result.document_number) setDocumentNumber(result.document_number);
        if (result.issued_date) setIssuedDate(result.issued_date);
        if (result.expiry_date) setExpiryDate(result.expiry_date);
        if (result.issuing_authority) setIssuedBy(result.issuing_authority);
        if (result.additional_notes) setNotes(result.additional_notes);
      } catch (err) {
        if (isCancelled) return;
        const message = err instanceof ExtractionError ? err.message : "AI extraction failed.";
        Alert.alert("AI extraction unavailable", `${message}\n\nYou can still fill in the details manually.`);
      } finally {
        if (!isCancelled) setIsExtracting(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [pickedImageUri, isEditing]);

  const handleSave = async () => {
    const validationErrors = validateDocumentForm({ documentType, fullName, expiryDate });
    if (issuedDate.trim() && !isValidISODate(issuedDate)) {
      validationErrors.issuedDate = "Use the format YYYY-MM-DD.";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      const updatedList = await saveDocument({
        id: existingDocument?.id,
        familyMemberId,
        documentType,
        fullName: fullName.trim(),
        documentNumber: documentNumber.trim() || null,
        issuedDate: issuedDate.trim() || null,
        expiryDate: expiryDate.trim() || null,
        issuedBy: issuedBy.trim() || null,
        notes: notes.trim() || null,
        imageUri,
        dateOfBirth: existingDocument?.dateOfBirth ?? null,
      });

      const savedDocument = isEditing
        ? updatedList.find((doc) => doc.id === existingDocument.id)
        : updatedList[0];

      navigation.replace(ROUTES.DOCUMENT_DETAILS, { documentId: savedDocument.id });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Header variant="back" title={isEditing ? "Edit Document" : "Add Document"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.imagePlaceholderText}>No image attached</Text>
          </View>
        )}

        {isExtracting ? (
          <View style={styles.extractingBanner}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.extractingText}>Reading document with AI&hellip;</Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Document Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {DOCUMENT_TYPE_LIST.map((type) => {
            const selected = documentType === type.code;
            return (
              <TouchableOpacity
                key={type.code}
                style={[
                  styles.typeChip,
                  selected && { borderColor: type.color, backgroundColor: withOpacity(type.color, 0.1) },
                ]}
                onPress={() => setDocumentType(type.code)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name={type.icon}
                  size={18}
                  color={selected ? type.color : COLORS.textSecondary}
                />
                <Text style={[styles.typeChipText, selected && { color: type.color }]}>{type.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {errors.documentType ? <Text style={styles.errorText}>{errors.documentType}</Text> : null}

        <Text style={styles.sectionLabel}>Belongs To</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {familyMembers.map((member) => {
            const selected = familyMemberId === member.id;
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberChip, selected && styles.memberChipSelected]}
                onPress={() => setFamilyMemberId(member.id)}
                activeOpacity={0.85}
              >
                <Avatar name={member.name} color={member.avatarColor} size={28} />
                <Text style={[styles.memberChipText, selected && styles.memberChipTextSelected]}>
                  {member.isSelf ? "Me" : member.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <AppTextInput
          label="Full Name"
          placeholder="e.g. Nadeem Ahmad"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
        />
        <AppTextInput
          label="Document Number"
          placeholder="e.g. A1234567"
          value={documentNumber}
          onChangeText={setDocumentNumber}
        />
        <AppTextInput
          label="Issued Date"
          placeholder="YYYY-MM-DD"
          value={issuedDate}
          onChangeText={setIssuedDate}
          error={errors.issuedDate}
        />
        <AppTextInput
          label="Expiry Date"
          placeholder="YYYY-MM-DD"
          value={expiryDate}
          onChangeText={setExpiryDate}
          error={errors.expiryDate}
        />
        <AppTextInput
          label="Issued By"
          placeholder="e.g. General Directorate of Residency"
          value={issuedBy}
          onChangeText={setIssuedBy}
        />
        <AppTextInput
          label="Notes"
          placeholder="Optional notes"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <AppButton
          label={isEditing ? "Save Changes" : "Save Document"}
          onPress={handleSave}
          loading={isSaving}
          disabled={isExtracting}
          style={styles.saveButton}
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
    height: 180,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.border,
  },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  imagePlaceholderText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  extractingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: withOpacity(COLORS.primary, 0.08),
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  extractingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  typeChipText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  memberChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: withOpacity(COLORS.primary, 0.08),
  },
  memberChipText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  memberChipTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});
