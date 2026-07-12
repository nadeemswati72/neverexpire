import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Avatar from "../common/Avatar";
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";

/**
 * Row card on the Family Members screen — avatar, name (with relationship),
 * document count, and a chevron to drill into that member's documents.
 * `onSharePress` (optional) adds a share icon for "share all documents".
 * `photoHeaders` carries the Authorization header for member photo loads.
 */
export default function FamilyMemberCard({ member, documentCount = 0, onPress, onSharePress, photoHeaders }) {
  const relationshipLabel = member.isSelf ? "Me" : member.relationship;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Avatar name={member.name} imageUri={member.photoUri} headers={photoHeaders} color={member.avatarColor} size={48} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
          {member.isSelf ? "" : `  ·  ${relationshipLabel}`}
        </Text>
        <Text style={styles.count}>
          {documentCount} {documentCount === 1 ? "Document" : "Documents"}
        </Text>
      </View>
      {onSharePress ? (
        <TouchableOpacity
          onPress={onSharePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.shareButton}
        >
          <Ionicons name="share-social-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.card,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  count: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  shareButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
});
