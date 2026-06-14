import React, { useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import SectionHeader from "../../components/common/SectionHeader";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import { useAuth } from "../../context/AuthContext";
import { isNotEmpty, isValidEmail } from "../../utils/validators";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

/**
 * Profile / Settings (Mobile.jpg screen 7). Account details are editable
 * and persisted via AuthContext.updateProfile; the "Change Password"
 * section is UI-only (demo mode has no real credential store).
 */
export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);

  const toggleEditing = () => {
    if (isEditing) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setErrors({});
    }
    setIsEditing((prev) => !prev);
  };

  const handleSaveProfile = async () => {
    const validationErrors = {};
    if (!isNotEmpty(name)) validationErrors.name = "Name is required.";
    if (!isValidEmail(email)) validationErrors.email = "Enter a valid email address.";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (!isNotEmpty(currentPassword) || !isNotEmpty(newPassword) || !isNotEmpty(confirmPassword)) {
      setPasswordMessage("Fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    setPasswordMessage("Password updated for this demo session.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScreenContainer>
      <Header variant="back" title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.name} color={user?.avatarColor} size={72} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.card}>
          <SectionHeader
            title="Account Details"
            actionLabel={isEditing ? "Cancel" : "Edit"}
            onActionPress={toggleEditing}
          />
          <AppTextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            editable={isEditing}
            error={errors.name}
            autoCapitalize="words"
          />
          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            error={errors.email}
            keyboardType="email-address"
          />
          {isEditing ? (
            <AppButton label="Save Changes" onPress={handleSaveProfile} loading={isSaving} />
          ) : null}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Change Password" />
          <AppTextInput
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <AppTextInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <AppTextInput
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {passwordMessage ? <Text style={styles.passwordMessage}>{passwordMessage}</Text> : null}
          <AppButton label="Update Password" variant="outline" onPress={handleChangePassword} />
        </Card>

        <AppButton
          label="Log Out"
          variant="danger"
          icon="log-out-outline"
          onPress={handleLogout}
          style={styles.logoutButton}
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
  profileHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  passwordMessage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accentDark,
    marginBottom: SPACING.md,
  },
  logoutButton: {
    marginTop: SPACING.sm,
  },
});
