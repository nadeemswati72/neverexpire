import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import * as SharingService from "../../services/SharingService";
import { PERMISSION_LEVELS } from "../../services/SharingService";
import { useAppData } from "../../context/DataContext";
import { formatDate } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const PERMISSION_LABELS = Object.fromEntries(PERMISSION_LEVELS.map((p) => [p.code, p.label]));

const TABS = [
  { key: "incoming", label: "Shared with Me" },
  { key: "outgoing", label: "Shared by Me" },
];

/**
 * Sharing overview — the mobile counterpart of the web SharingPage.
 * "Shared with Me" lists documents others shared with this account (tap to
 * open); "Shared by Me" lists outgoing shares with revoke.
 */
export default function SharingScreen() {
  const navigation = useNavigation();
  const { reload } = useAppData();
  const [activeTab, setActiveTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inc, out] = await Promise.all([
        SharingService.getIncomingShares(),
        SharingService.getOutgoingShares(),
      ]);
      setIncoming(inc);
      setOutgoing(out);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDocument = async (documentId) => {
    // Shared docs are part of the main documents list; make sure it's fresh
    // before navigating so getDocumentById finds it.
    await reload();
    navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId });
  };

  const handleRevoke = (share) => {
    Alert.alert("Revoke Access", `Stop sharing "${share.document_title}" with ${share.shared_with_email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          await SharingService.revokeShare(share.share_id);
          load();
        },
      },
    ]);
  };

  const rows = activeTab === "incoming" ? incoming : outgoing;

  return (
    <ScreenContainer>
      <Header variant="back" title="Sharing" />

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.listScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rows.length === 0 && !isLoading ? (
          <EmptyState
            icon="share-social-outline"
            title={activeTab === "incoming" ? "Nothing shared with you" : "You haven't shared anything"}
            message={
              activeTab === "incoming"
                ? "Documents that others share with you will appear here."
                : "Open a document and tap Share to give someone access."
            }
          />
        ) : (
          <Card padded={false} style={styles.listCard}>
            {rows.map((share, index) => (
              <View key={share.share_id}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => openDocument(share.document_id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconWrap, share.is_expired && styles.iconWrapExpired]}>
                    <Ionicons
                      name={activeTab === "incoming" ? "arrow-down-outline" : "arrow-up-outline"}
                      size={16}
                      color={share.is_expired ? COLORS.textMuted : COLORS.accentDark}
                    />
                  </View>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{share.document_title}</Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {activeTab === "incoming"
                        ? `From ${share.shared_by_email}`
                        : `To ${share.shared_with_email}`}
                      {" · "}
                      {PERMISSION_LABELS[share.permission_level] || share.permission_level}
                    </Text>
                    <Text style={styles.rowDate}>
                      {share.is_expired
                        ? "Access expired"
                        : share.expires_at
                          ? `Expires ${formatDate(share.expires_at)}`
                          : `Shared ${formatDate(share.created_at)}`}
                    </Text>
                  </View>
                  {activeTab === "outgoing" ? (
                    <TouchableOpacity onPress={() => handleRevoke(share)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.revokeText}>Revoke</Text>
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
                {index < rows.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: withOpacity(COLORS.primary, 0.06),
    borderRadius: RADIUS.pill,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.surface,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  listScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  iconWrapExpired: {
    backgroundColor: withOpacity(COLORS.textMuted, 0.15),
  },
  rowMain: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  rowMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rowDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  revokeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.danger,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
