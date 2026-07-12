import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import EmojiIcon from "../../components/common/EmojiIcon";
import { useAuth } from "../../context/AuthContext";
import { AuthError } from "../../services/AuthService";
import { isValidEmail } from "../../utils/validators";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";

/**
 * Account creation against POST /api/v1/auth/register. Successful signup
 * returns a token, so the user lands straight on the dashboard (a SELF
 * person is created server-side).
 */
export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!isValidEmail(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    return next;
  };

  const handleRegister = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register(email.trim(), password, fullName.trim());
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll edges={["top", "bottom"]} contentContainerStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <EmojiIcon name="shield-checkmark" size={30} />
          </View>
          <Text style={styles.brandTitle}>NeverExpire</Text>
          <Text style={styles.brandTagline}>Never miss a renewal again</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Track your family's documents in one place</Text>

          <AppTextInput
            label="Full name"
            placeholder="e.g. Sarah Ahmad"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            error={errors.fullName}
            leftIcon="person-outline"
          />
          <AppTextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            leftIcon="mail-outline"
          />
          <AppTextInput
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            leftIcon="lock-closed-outline"
          />
          <AppTextInput
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon="lock-closed-outline"
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <AppButton label="Create Account" onPress={handleRegister} loading={isSubmitting} style={styles.registerButton} />

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink} activeOpacity={0.8}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkAccent}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOW.fab,
  },
  brandTitle: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  formError: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.danger,
    marginBottom: SPACING.lg,
  },
  registerButton: {
    marginTop: SPACING.sm,
  },
  loginLink: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  loginLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loginLinkAccent: {
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
