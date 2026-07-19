import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import ScreenContainer from "../../components/common/ScreenContainer";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import EmojiIcon from "../../components/common/EmojiIcon";
import * as AuthService from "../../services/AuthService";
import { isValidEmail } from "../../utils/validators";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";

/**
 * Requests a reset email (POST /auth/forgot-password) — mirrors web's
 * ForgotPasswordPage. The emailed link opens the web reset-password page
 * (works fine from a phone's browser), so there's no native "enter new
 * password" screen on mobile; this only covers the request step.
 */
export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const responseMessage = await AuthService.forgotPassword(email);
      setMessage(responseMessage);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll edges={["top", "bottom"]} contentContainerStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
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
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Reset your password</Text>
          <Text style={styles.subheading}>Enter your account email and we'll send you a reset link</Text>

          {message ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : (
            <>
              <AppTextInput
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={error}
                leftIcon="mail-outline"
              />

              <AppButton
                label="Send reset link"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.submitButton}
              />
            </>
          )}

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink} activeOpacity={0.8}>
            <Text style={styles.backLinkText}>← Back to sign in</Text>
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
  form: {
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  successBox: {
    backgroundColor: COLORS.accent + "1A",
    borderWidth: 1,
    borderColor: COLORS.accent + "40",
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  backLink: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  backLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
