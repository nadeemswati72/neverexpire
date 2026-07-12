import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import IconBox from "../../components/common/IconBox";
import EmojiIcon from "../../components/common/EmojiIcon";
import AppButton from "../../components/common/AppButton";
import EmptyState from "../../components/common/EmptyState";
import ShareModal from "../../components/documents/ShareModal";
import { useAppData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { authHeader } from "../../services/ApiService";
import * as SharingService from "../../services/SharingService";
import { PERMISSION_LEVELS } from "../../services/SharingService";
import { getDocumentTypeMeta } from "../../constants/documentTypes";
import { getExpiryStatus, formatDaysLabel, formatExpiresOn, formatDate } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const ACCESS_LOG_POLL_MS = 15000;

const PERMISSION_LABELS = Object.fromEntries(PERMISSION_LEVELS.map((p) => [p.code, p.label]));

function formatLogTime(isoString) {
  if (!isoString) return "";
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return "";
  return `${formatDate(isoString)} ${dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Full document record view with edit & delete for owners, plus the sharing
 * features from the web app: share button, who-has-access list with revoke,
 * and a polled access history (who viewed/downloaded). Non-owners get a
 * "shared by" banner instead, with actions gated by their permission level.
 */
export default function DocumentDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { documentId } = route.params || {};
  const { getDocumentById, getFamilyMemberById, deleteDocument } = useAppData();
  const { token } = useAuth();

  const document = getDocumentById(documentId);
  const isOwner = document ? document.isOwner !== false : false;
  const canEdit = isOwner || document?.userPermission === "edit";

  const [shareVisible, setShareVisible] = useState(false);
  const [shares, setShares] = useState([]);
  const [accessLog, setAccessLog] = useState([]);

  const loadSharingInfo = useCallback(async () => {
    if (!documentId) return;
    try {
      // /sharing/outgoing carries recipient emails; per-doc /shares does not.
      const [outgoing, log] = await Promise.all([
        SharingService.getOutgoingShares(),
        SharingService.getAccessLog(documentId),
      ]);
      setShares(outgoing.filter((s) => s.document_id === documentId));
      setAccessLog(log);
    } catch {
      // Non-owner or transient failure — sharing panels simply stay hidden.
    }
  }, [documentId]);

  useEffect(() => {
    if (!isOwner) return undefined;
    loadSharingInfo();
    const interval = setInterval(loadSharingInfo, ACCESS_LOG_POLL_MS);
    return () => clearInterval(interval);
  }, [isOwner, loadSharingInfo]);

  if (!document) {
    return (
      <ScreenContainer>
        <Header variant="back" title="Document Details" />
        <EmptyState
          icon="alert-circle-outline"
          title="Document not found"
          message="This document may have been deleted."
        />
      </ScreenContainer>
    );
  }

  const typeMeta = getDocumentTypeMeta(document.documentType);
  const status = getExpiryStatus(document.expiryDate);
  const member = getFamilyMemberById(document.familyMemberId);

  const handleEdit = () => {
    navigation.navigate(ROUTES.DOCUMENT_FORM, { documentId: document.id });
  };

  const handleDelete = () => {
    Alert.alert("Delete Document", `Are you sure you want to delete this ${typeMeta.label}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDocument(document.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleRevoke = (share) => {
    Alert.alert("Revoke Access", `Stop sharing with ${share.shared_with_email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          await SharingService.revokeShare(share.share_id);
          loadSharingInfo();
        },
      },
    ]);
  };

  const infoRows = [
    { label: "Full Name", value: document.fullName },
    { label: "Document Number", value: document.documentNumber },
    { label: "Date of Birth", value: document.dateOfBirth ? formatDate(document.dateOfBirth) : null },
    { label: "Issued Date", value: document.issuedDate ? formatDate(document.issuedDate) : null },
    { label: "Expiry Date", value: document.expiryDate ? formatDate(document.expiryDate) : "No expiry" },
    { label: "Issued By", value: document.issuedBy },
    {
      label: "Belongs To",
      value: member ? (member.isSelf ? `${member.name} (Me)` : `${member.name} (${member.relationship})`) : null,
    },
  ].filter((row) => !!row.value);

  return (
    <ScreenContainer>
      <Header
        variant="back"
        title="Document Details"
        rightIcon={canEdit ? "create-outline" : undefined}
        onRightPress={canEdit ? handleEdit : undefined}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isOwner ? (
          <View style={styles.sharedBanner}>
            <EmojiIcon name="people-outline" size={15} color={COLORS.accentDark} />
            <Text style={styles.sharedBannerText} numberOfLines={2}>
              Shared by {document.sharedByEmail || "another user"}
              {document.userPermission ? ` · ${PERMISSION_LABELS[document.userPermission] || document.userPermission}` : ""}
            </Text>
          </View>
        ) : null}

        {document.imageUri ? (
          <Image
            source={{ uri: document.imageUri, headers: authHeader(token) }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: withOpacity(typeMeta.color, 0.08) }]}>
            <Text style={styles.placeholderEmoji}>{typeMeta.icon}</Text>
          </View>
        )}

        <View style={styles.titleRow}>
          <IconBox icon={typeMeta.icon} color={typeMeta.color} size={48} />
          <View style={styles.titleText}>
            <Text style={styles.title}>{typeMeta.label}</Text>
            <Text style={styles.subtitle}>{formatExpiresOn(document.expiryDate)}</Text>
          </View>
          <Badge label={formatDaysLabel(document.expiryDate)} status={status} variant="solid" />
        </View>

        <Card style={styles.infoCard} padded={false}>
          {infoRows.map((row, index) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
              {index < infoRows.length - 1 ? <View style={styles.infoSeparator} /> : null}
            </View>
          ))}
        </Card>

        {document.notes ? (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{document.notes}</Text>
          </Card>
        ) : null}

        {isOwner ? (
          <Card style={styles.notesCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Shared With</Text>
              <TouchableOpacity onPress={() => setShareVisible(true)} activeOpacity={0.8} style={styles.shareLink}>
                <EmojiIcon name="share-social-outline" size={13} color={COLORS.accentDark} />
                <Text style={styles.shareLinkText}>Share</Text>
              </TouchableOpacity>
            </View>
            {shares.length === 0 ? (
              <Text style={styles.emptyText}>Not shared with anyone yet.</Text>
            ) : (
              shares.map((share, index) => (
                <View key={share.share_id}>
                  <View style={styles.shareRow}>
                    <View style={styles.shareInfo}>
                      <Text style={styles.shareEmail} numberOfLines={1}>{share.shared_with_email}</Text>
                      <Text style={styles.shareMeta}>
                        {PERMISSION_LABELS[share.permission_level] || share.permission_level}
                        {share.expires_at ? ` · until ${formatDate(share.expires_at)}` : ""}
                        {share.is_expired ? " · expired" : ""}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRevoke(share)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.revokeText}>Revoke</Text>
                    </TouchableOpacity>
                  </View>
                  {index < shares.length - 1 ? <View style={styles.infoSeparator} /> : null}
                </View>
              ))
            )}
          </Card>
        ) : null}

        {isOwner && accessLog.length > 0 ? (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionLabel}>Access History</Text>
            {accessLog.slice(0, 10).map((entry, index) => (
              <View key={entry.id}>
                <View style={styles.logRow}>
                  <EmojiIcon
                    name={entry.action === "download" ? "download-outline" : "eye-outline"}
                    size={14}
                    color={COLORS.textSecondary}
                    style={styles.logIcon}
                  />
                  <View style={styles.shareInfo}>
                    <Text style={styles.shareEmail} numberOfLines={1}>{entry.user_email}</Text>
                    <Text style={styles.shareMeta}>
                      {entry.action === "download" ? "Downloaded" : "Viewed"} · {formatLogTime(entry.created_at)}
                    </Text>
                  </View>
                </View>
                {index < Math.min(accessLog.length, 10) - 1 ? <View style={styles.infoSeparator} /> : null}
              </View>
            ))}
          </Card>
        ) : null}

        {isOwner ? (
          <AppButton
            label="Share Document"
            onPress={() => setShareVisible(true)}
            icon="share-social-outline"
            style={styles.actionButton}
          />
        ) : null}
        {canEdit ? (
          <AppButton
            label="Edit Document"
            onPress={handleEdit}
            variant="outline"
            icon="create-outline"
            style={styles.actionButton}
          />
        ) : null}
        {isOwner ? (
          <AppButton
            label="Delete Document"
            onPress={handleDelete}
            variant="danger"
            icon="trash-outline"
            style={styles.actionButton}
          />
        ) : null}
      </ScrollView>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        onShared={loadSharingInfo}
        documentId={document.id}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  sharedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sharedBannerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHTS.medium,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.border,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  titleText: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  infoSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  notesCard: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  shareLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shareLinkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accentDark,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    paddingVertical: SPACING.xs,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  shareInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  shareEmail: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  shareMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  revokeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.danger,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  logIcon: {
    marginRight: SPACING.sm,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
});
