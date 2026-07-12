import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import AppButton from "../../components/common/AppButton";
import EmojiIcon from "../../components/common/EmojiIcon";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const EXAMPLES = [
  "My Dubai driving license expires next March 15th",
  "Remind me — Zain's passport expires in 6 months",
  "Fatima's health insurance renews on 1 January 2027",
];

/**
 * "Speak it" entry point for Add Document. There's no in-app audio
 * transcription — instead this leans on the phone keyboard's own dictation
 * (the mic icon every iOS/Android keyboard already has), which writes
 * plain text into this field for free. That text is then sent to the
 * backend, which uses Claude to parse it into document fields — the same
 * pre-fill-then-confirm step DocumentFormScreen already does for photos.
 */
export default function VoiceReminderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { familyMemberId } = route.params || {};
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleContinue = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    navigation.replace(ROUTES.DOCUMENT_FORM, { voiceText: trimmed, familyMemberId });
  };

  return (
    <ScreenContainer>
      <Header variant="back" title="Voice Reminder" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <EmojiIcon name="mic-outline" size={30} color={COLORS.accent} />
          </View>
          <Text style={styles.heading}>Describe your document</Text>
          <Text style={styles.subheading}>
            Tap the field, then use your keyboard's mic to dictate — or just type. AI will fill in the form for you.
          </Text>

          <TouchableOpacity
            style={styles.inputWrap}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="e.g. My Dubai driving license expires next March 15th"
              placeholderTextColor={COLORS.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              returnKeyType="done"
              blurOnSubmit
            />
          </TouchableOpacity>

          <View style={styles.examples}>
            <Text style={styles.examplesLabel}>Try saying something like:</Text>
            {EXAMPLES.map((example) => (
              <TouchableOpacity key={example} onPress={() => setText(example)} activeOpacity={0.7}>
                <Text style={styles.exampleText}>"{example}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppButton
            label="Continue"
            onPress={handleContinue}
            disabled={!text.trim()}
            icon="arrow-forward"
            style={styles.continueButton}
          />
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
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    minHeight: 110,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  input: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    textAlignVertical: "top",
    minHeight: 80,
  },
  examples: {
    marginBottom: SPACING.xl,
  },
  examplesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  exampleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accentDark,
    marginBottom: SPACING.sm,
    fontStyle: "italic",
  },
  continueButton: {
    marginTop: "auto",
    marginBottom: SPACING.lg,
  },
});
