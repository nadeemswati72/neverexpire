import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import IconBox from "../common/IconBox";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, STATUS_COLORS, withOpacity } from "../../constants/theme";
import { getDocumentTypeMeta } from "../../constants/documentTypes";
import { getExpiryStatus, formatDaysLabel, formatExpiresOn } from "../../utils/dateUtils";

/**
 * Single row in a document list (Dashboard, My Documents, Family Member
 * Documents). Shows the document-type icon/label, a secondary line
 * (`subtitle` — e.g. the owner's name or document number), and the
 * color-coded "days left" status with its expiry date.
 */
export default function DocumentListItem({ document, subtitle, onPress }) {
  const typeMeta = getDocumentTypeMeta(document.documentType);
  const status = getExpiryStatus(document.expiryDate);
  const statusColor = STATUS_COLORS[status];
  const resolvedSubtitle = subtitle ?? document.documentNumber ?? null;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <IconBox icon={typeMeta.icon} color={typeMeta.color} />
      <View style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {typeMeta.label}
          </Text>
          {document.isOwner === false ? (
            <View style={styles.sharedBadge}>
              <Text style={styles.sharedBadgeText}>Shared</Text>
            </View>
          ) : null}
        </View>
        {resolvedSubtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {resolvedSubtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text style={[styles.days, { color: statusColor }]}>{formatDaysLabel(document.expiryDate)}</Text>
        <Text style={styles.expires} numberOfLines={1}>
          {formatExpiresOn(document.expiryDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  main: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  sharedBadge: {
    backgroundColor: withOpacity(COLORS.accent, 0.14),
    borderRadius: RADIUS.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  sharedBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accentDark,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  meta: {
    alignItems: "flex-end",
  },
  days: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  expires: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
