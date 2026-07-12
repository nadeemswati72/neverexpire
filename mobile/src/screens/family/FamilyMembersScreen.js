import React, { useState } from "react";
import { View, Text, ScrollView, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import FamilyMemberCard from "../../components/family/FamilyMemberCard";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import EmptyState from "../../components/common/EmptyState";
import ShareModal from "../../components/documents/ShareModal";
import { useAppData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { authHeader } from "../../services/ApiService";
import { RELATION_TYPES } from "../../services/FamilyService";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/** Family Members list (Mobile.jpg screen 5) with an inline "add member" modal. */
export default function FamilyMembersScreen() {
  const navigation = useNavigation();
  const { familyMembers, documents, addFamilyMember } = useAppData();
  const { token } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [relationshipCode, setRelationshipCode] = useState(RELATION_TYPES[0].code);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sharingMember, setSharingMember] = useState(null);

  const openModal = () => {
    setName("");
    setRelationshipCode(RELATION_TYPES[0].code);
    setError(null);
    setIsModalVisible(true);
  };

  const closeModal = () => setIsModalVisible(false);

  const handleAddMember = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      await addFamilyMember({ name: name.trim(), relationshipCode });
      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Family" rightIcon="person-add-outline" onRightPress={openModal} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {familyMembers.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No family members yet"
            message="Tap the add icon above to add your first family member."
          />
        ) : (
          familyMembers.map((member) => {
            const documentCount = documents.filter((doc) => doc.familyMemberId === member.id).length;
            return (
              <FamilyMemberCard
                key={member.id}
                member={member}
                documentCount={documentCount}
                onPress={() => navigation.navigate(ROUTES.FAMILY_MEMBER_DOCUMENTS, { familyMemberId: member.id })}
                onSharePress={documentCount > 0 ? () => setSharingMember(member) : undefined}
                photoHeaders={authHeader(token)}
              />
            );
          })
        )}
      </ScrollView>

      <ShareModal
        visible={!!sharingMember}
        onClose={() => setSharingMember(null)}
        personId={sharingMember?.id}
        personName={sharingMember?.name}
      />

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Family Member</Text>

            <AppTextInput
              label="Name"
              placeholder="e.g. Sarah Ahmad"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.pickerLabel}>Relationship</Text>
            <View style={styles.chipRow}>
              {RELATION_TYPES.map((type) => {
                const selected = relationshipCode === type.code;
                return (
                  <TouchableOpacity
                    key={type.code}
                    style={[
                      styles.relationChip,
                      selected && { borderColor: type.color, backgroundColor: withOpacity(type.color, 0.1) },
                    ]}
                    onPress={() => setRelationshipCode(type.code)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.relationChipText, selected && { color: type.color }]}>{type.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? <Text style={styles.modalError}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <AppButton label="Cancel" variant="outline" onPress={closeModal} style={styles.modalButton} />
              <AppButton label="Add" onPress={handleAddMember} loading={isSaving} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.card,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  pickerLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  relationChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  relationChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  modalError: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});
