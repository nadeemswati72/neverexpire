import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import ScreenContainer from "../../components/common/ScreenContainer";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import EmojiIcon from "../../components/common/EmojiIcon";
import { useAuth } from "../../context/AuthContext";
import { AuthError } from "../../services/AuthService";
import { validateLoginForm } from "../../utils/validators";
import { DEMO_USERS, DEMO_PASSWORD } from "../../data/mockUsers";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/**
 * Login against the real Flask backend. Validates input locally, then calls
 * AuthContext.login, which POSTs to /api/v1/auth/login (see AuthService).
 * The "Demo accounts" card autofills one of the real seeded accounts from
 * backend/seed_rich_demo.py.
 */
export default function LoginScreen() {
  const navigation = useNavigation();
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
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <EmojiIcon name="shield-checkmark" size={30} />
          </LinearGradient>
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

          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
            style={styles.forgotLink}
            activeOpacity={0.8}
          >
            <Text style={styles.forgotLinkText}>Forgot password?</Text>
          </TouchableOpacity>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <AppButton label="Log In" onPress={handleLogin} loading={isSubmitting} style={styles.loginButton} />

          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            style={styles.registerLink}
            activeOpacity={0.8}
          >
            <Text style={styles.registerLinkText}>
              New to NeverExpire? <Text style={styles.registerLinkAccent}>Create an account</Text>
            </Text>
          </TouchableOpacity>
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
              <EmojiIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
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
  forgotLink: {
    alignItems: "flex-end",
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  forgotLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  formError: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.danger,
    marginBottom: SPACING.lg,
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  registerLink: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  registerLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  registerLinkAccent: {
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.semibold,
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
