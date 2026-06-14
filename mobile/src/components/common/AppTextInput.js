import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";

/**
 * Labeled text input with consistent styling, an inline error message, and
 * a built-in show/hide toggle when `secureTextEntry` is set. Used for
 * login, profile editing, and document form fields.
 */
export default function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  leftIcon,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "none",
  editable = true,
  style,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const showToggle = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          error && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={COLORS.textSecondary} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={showToggle && !isVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          editable={editable}
        />
        {showToggle ? (
          <TouchableOpacity onPress={() => setIsVisible((prev) => !prev)} accessibilityLabel="Toggle password visibility">
            <Ionicons
              name={isVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    height: 52,
  },
  inputWrapperMultiline: {
    height: undefined,
    minHeight: 96,
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  inputWrapperDisabled: {
    backgroundColor: COLORS.background,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    padding: 0,
  },
  inputMultiline: {
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
  },
});
