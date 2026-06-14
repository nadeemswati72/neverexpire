import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenContainer from "../../components/common/ScreenContainer";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import { useAuth } from "../../context/AuthContext";
import { AuthError } from "../../services/AuthService";
import { validateLoginForm } from "../../utils/validators";
import { DEMO_USERS, DEMO_PASSWORD } from "../../data/mockUsers";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";

/**
 * Demo-mode login. Validates input locally, then calls AuthContext.login,
 * which checks the email/password against DEMO_USERS (see AuthService).
 * The "Demo accounts" card lets testers autofill either seeded account.
 */
export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const validationErrors = validateLoginForm({ email, password });
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setFormError(null);
  };

  return (
    <ScreenContainer scroll edges={["top", "bottom"]} contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.brandTitle}>NeverExpire</Text>
          <Text style={styles.brandTagline}>Never miss a renewal again</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to manage your documents</Text>

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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            leftIcon="lock-closed-outline"
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <AppButton label="Log In" onPress={handleLogin} loading={isSubmitting} style={styles.loginButton} />
        </View>

        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo accounts</Text>
          <Text style={styles.demoSubtitle}>Tap an account to autofill — password is shared.</Text>

          {DEMO_USERS.map((demoUser) => (
            <TouchableOpacity
              key={demoUser.id}
              style={styles.demoRow}
              onPress={() => fillDemoAccount(demoUser.email)}
              activeOpacity={0.8}
            >
              <View style={[styles.demoAvatar, { backgroundColor: demoUser.avatarColor }]}>
                <Text style={styles.demoAvatarText}>{demoUser.name.charAt(0)}</Text>
              </View>
              <View style={styles.demoInfo}>
                <Text style={styles.demoName}>{demoUser.name}</Text>
                <Text style={styles.demoEmail}>{demoUser.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}

          <Text style={styles.demoPassword}>Password: {DEMO_PASSWORD}</Text>
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
    marginBottom: SPACING.xxxl,
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
    marginBottom: SPACING.xxl,
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
  loginButton: {
    marginTop: SPACING.sm,
  },
  demoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.card,
  },
  demoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  demoSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  demoAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  demoAvatarText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.md,
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  demoEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  demoPassword: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.accentDark,
  },
});
