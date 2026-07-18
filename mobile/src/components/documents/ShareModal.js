import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, Switch, StyleSheet } from "react-native";

import AppTextInput from "../common/AppTextInput";
import AppButton from "../common/AppButton";
import EmojiIcon from "../common/EmojiIcon";
import * as SharingService from "../../services/SharingService";
import { PERMISSION_LEVELS, EXPIRY_OPTIONS } from "../../services/SharingService";
import { isValidEmail } from "../../utils/validators";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

/**
 * Share sheet for a single document (`documentId`) or for ALL of a family
 * member's documents (`personId` + `personName`) — the mobile counterpart
 * of the web ShareModal's two modes. Exactly one of documentId/personId
 * should be provided.
 */
export default function ShareModal({ visible, onClose, onShared, documentId, personId, personName }) {
  const isPersonMode = !!personId;

  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [expiresInDays, setExpiresInDays] = useState(null);
  const [includeFuture, setIncludeFuture] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [isInvite, setIsInvite] = useState(false);
  const [error, setError] = useState(null);
  const [showInviteOption, setShowInviteOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setPermission("read");
    setExpiresInDays(null);
    setIncludeFuture(true);
    setWatermark(true);
    setIsInvite(false);
    setError(null);
    setShowInviteOption(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleShare = async () => {
    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setShowInviteOption(false);
    setIsSubmitting(true);
    try {
      if (isPersonMode) {
        await SharingService.shareAllForMember(personId, {
          recipientEmail: email.trim(),
          permissionLevel: permission,
          includeFuture,
          expiresInDays,
          watermark,
          isInvite,
        });
      } else {
        await SharingService.shareDocument(documentId, {
          recipientEmail: email.trim(),
          permissionLevel: permission,
          expiresInDays,
          watermark,
          isInvite,
        });
      }
      reset();
      onShared?.();
      onClose();
    } catch (err) {
      const message = err.message || "Could not share. Please try again.";
      if (message.toLowerCase().includes("not found")) {
        setError(`User not found with email: ${email.trim()}`);
        setShowInviteOption(true);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mirrors web ShareModal's mock-invitation flow — no account exists yet
  // for this email, so there's nothing to grant access to server-side; this
  // just acknowledges the intent the same way web does.
  const handleSendInvitation = () => {
    setError(`Invitation sent to ${email.trim()}!`);
    setShowInviteOption(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {isPersonMode ? `Share All of ${personName}'s Documents` : "Share Document"}
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <EmojiIcon name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <AppTextInput
            label="Recipient email"
            placeholder="person@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
          />

          <Text style={styles.fieldLabel}>Permission</Text>
          <View style={styles.chipRow}>
            {PERMISSION_LEVELS.map((level) => {
              const active = permission === level.code;
              return (
                <TouchableOpacity
                  key={level.code}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setPermission(level.code)}
                  activeOpacity={0.85}
                >
                  <EmojiIcon name={level.icon} size={13} color={active ? COLORS.accentDark : COLORS.textSecondary} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{level.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Access expires</Text>
          <View style={styles.chipRow}>
            {EXPIRY_OPTIONS.map((option) => {
              const active = expiresInDays === option.days;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setExpiresInDays(option.days)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isPersonMode ? (
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.switchLabel}>Include future documents</Text>
                <Text style={styles.switchHint}>Also share documents added later</Text>
              </View>
              <Switch
                value={includeFuture}
                onValueChange={setIncludeFuture}
                trackColor={{ true: withOpacity(COLORS.accent, 0.45), false: COLORS.border }}
                thumbColor={includeFuture ? COLORS.accent : COLORS.surface}
              />
            </View>
          ) : null}

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Add watermark to shared copy</Text>
              <Text style={styles.switchHint}>
                {watermark
                  ? "Recipient sees a personalized stamped copy — traceable if it leaks."
                  : "⚠️ Recipient gets the clean original — not traceable if shared further."}
              </Text>
            </View>
            <Switch
              value={watermark}
              onValueChange={setWatermark}
              trackColor={{ true: withOpacity(COLORS.accent, 0.45), false: COLORS.border }}
              thumbColor={watermark ? COLORS.accent : COLORS.surface}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Send as invite</Text>
              <Text style={styles.switchHint}>Requires the recipient to accept before access starts</Text>
            </View>
            <Switch
              value={isInvite}
              onValueChange={setIsInvite}
              trackColor={{ true: withOpacity(COLORS.accent, 0.45), false: COLORS.border }}
              thumbColor={isInvite ? COLORS.accent : COLORS.surface}
            />
          </View>

          {error ? (
            <View>
              <Text style={styles.error}>{error}</Text>
              {showInviteOption ? (
                <TouchableOpacity onPress={handleSendInvitation} style={styles.inviteButton} activeOpacity={0.85}>
                  <Text style={styles.inviteButtonText}>📧 Send Invitation</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <AppButton
            label={isPersonMode ? "Share All Documents" : "Share"}
            onPress={handleShare}
            loading={isSubmitting}
            icon="share-social-outline"
            style={styles.shareButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  switchText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  switchHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  error: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.danger,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  inviteButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  inviteButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  shareButton: {
    marginTop: SPACING.md,
  },
});
