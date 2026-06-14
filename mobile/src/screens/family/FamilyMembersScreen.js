import React, { useState } from "react";
import { View, Text, ScrollView, Modal, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import FamilyMemberCard from "../../components/family/FamilyMemberCard";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import EmptyState from "../../components/common/EmptyState";
import { useAppData } from "../../context/DataContext";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const AVATAR_COLORS = ["#4F8EF7", "#8B5CF6", "#34C38F", "#EF5DA8", "#F2994A", "#22B8CF"];

/** Family Members list (Mobile.jpg screen 5) with an inline "add member" modal. */
export default function FamilyMembersScreen() {
  const navigation = useNavigation();
  const { familyMembers, documents, addFamilyMember } = useAppData();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const openModal = () => {
    setName("");
    setRelationship("");
    setError(null);
    setIsModalVisible(true);
  };

  const closeModal = () => setIsModalVisible(false);

  const handleAddMember = async () => {
    if (!name.trim() || !relationship.trim()) {
      setError("Both name and relationship are required.");
      return;
    }

    setIsSaving(true);
    try {
      const avatarColor = AVATAR_COLORS[familyMembers.length % AVATAR_COLORS.length];
      await addFamilyMember({
        name: name.trim(),
        relationship: relationship.trim(),
        avatarColor,
        isSelf: false,
      });
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
              />
            );
          })
        )}
      </ScrollView>

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
            <AppTextInput
              label="Relationship"
              placeholder="e.g. Wife, Son, Daughter"
              value={relationship}
              onChangeText={setRelationship}
              autoCapitalize="words"
            />

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
