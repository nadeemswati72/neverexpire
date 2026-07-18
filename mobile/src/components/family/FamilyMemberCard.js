import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import Avatar from "../common/Avatar";
import EmojiIcon from "../common/EmojiIcon";
import { RELATION_TYPES } from "../../services/FamilyService";
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOW, withOpacity } from "../../constants/theme";

const RELATION_ICONS = {
  SELF: "👤",
  SPOUSE: "💑",
  CHILD: "👶",
  PARENT: "👴",
  SIBLING: "🧑",
  DOMESTIC_HELP: "🧹",
  OTHER: "🙂",
};

const RELATION_COLORS = Object.fromEntries(RELATION_TYPES.map((r) => [r.code, r.color]));

/**
 * Row card on the Family Members screen — avatar (with a relation-type
 * badge, matching web's overlay), name, per-status document breakdown, and
 * Edit/Remove/Share actions. `docStats` = { total, expired, expiringSoon,
 * valid }. `onSharePress` (optional) adds a share icon for "share all
 * documents"; `onEditPress`/`onDeletePress` surface the 3-dot-menu actions
 * web has that mobile previously lacked entirely.
 */
export default function FamilyMemberCard({
  member,
  docStats = { total: 0, expired: 0, expiringSoon: 0, valid: 0 },
  onPress,
  onSharePress,
  onEditPress,
  onDeletePress,
  photoHeaders,
}) {
  const relationshipLabel = member.isSelf ? "Me" : member.relationship;
  const relationCode = member.isSelf ? "SELF" : member.relationshipCode;
  const badgeColor = RELATION_COLORS[relationCode] || COLORS.purple;
  const badgeIcon = RELATION_ICONS[relationCode] || "🙂";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarWrap}>
        <Avatar name={member.name} imageUri={member.photoUri} headers={photoHeaders} color={member.avatarColor} size={48} />
        <View style={[styles.relationBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.relationBadgeText}>{badgeIcon}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
          {member.isSelf ? "" : `  ·  ${relationshipLabel}`}
        </Text>
        {docStats.total === 0 ? (
          <Text style={styles.count}>No documents yet</Text>
        ) : (
          <View style={styles.statRow}>
            <Text style={styles.count}>{docStats.total} total</Text>
            {docStats.expired > 0 ? (
              <Text style={[styles.statChip, { color: COLORS.danger }]}>{docStats.expired} expired</Text>
            ) : null}
            {docStats.expiringSoon > 0 ? (
              <Text style={[styles.statChip, { color: COLORS.warning }]}>{docStats.expiringSoon} soon</Text>
            ) : null}
          </View>
        )}
      </View>
      {onEditPress || onDeletePress ? (
        <TouchableOpacity
          onPress={() => onEditPress?.()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconButton}
        >
          <EmojiIcon name="create-outline" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}
      {onDeletePress ? (
        <TouchableOpacity
          onPress={() => onDeletePress?.()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconButton}
        >
          <EmojiIcon name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      ) : null}
      {onSharePress ? (
        <TouchableOpacity
          onPress={onSharePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconButton}
        >
          <EmojiIcon name="share-social-outline" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}
      <EmojiIcon name="chevron-forward" size={20} color={COLORS.textMuted} />
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
  avatarWrap: {
    position: "relative",
  },
  relationBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  relationBadgeText: {
    fontSize: 9,
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
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: 2,
  },
  statChip: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  iconButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
});
