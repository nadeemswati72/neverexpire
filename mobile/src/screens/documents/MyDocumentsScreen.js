import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import AppTextInput from "../../components/common/AppTextInput";
import DocumentListItem from "../../components/documents/DocumentListItem";
import EmptyState from "../../components/common/EmptyState";
import { useAppData } from "../../context/DataContext";
import { getDocumentTypeMeta } from "../../constants/documentTypes";
import { EXPIRY_STATUS, getExpiryStatus, daysRemaining } from "../../utils/dateUtils";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "expiring_soon", label: "Expiring Soon" },
  { key: "expired", label: "Expired" },
  { key: "valid", label: "Valid" },
];

/** Full, searchable, filterable document list (Dashboard "See All"). */
export default function MyDocumentsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { documents, getFamilyMemberById } = useAppData();

  const [activeFilter, setActiveFilter] = useState(
    route.params?.filter === "expiring_soon" ? "expiring_soon" : "all"
  );
  const [search, setSearch] = useState("");

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents
      .filter((doc) => {
        const status = getExpiryStatus(doc.expiryDate);
        switch (activeFilter) {
          case "expiring_soon":
            return status === EXPIRY_STATUS.EXPIRING_SOON || status === EXPIRY_STATUS.EXPIRED;
          case "expired":
            return status === EXPIRY_STATUS.EXPIRED;
          case "valid":
            return status === EXPIRY_STATUS.VALID;
          default:
            return true;
        }
      })
      .filter((doc) => {
        if (!query) return true;
        const typeMeta = getDocumentTypeMeta(doc.documentType);
        const member = getFamilyMemberById(doc.familyMemberId);
        const haystack = `${typeMeta.label} ${doc.fullName || ""} ${doc.documentNumber || ""} ${member?.name || ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const daysA = daysRemaining(a.expiryDate);
        const daysB = daysRemaining(b.expiryDate);
        if (daysA === null) return 1;
        if (daysB === null) return -1;
        return daysA - daysB;
      });
  }, [documents, activeFilter, search, getFamilyMemberById]);

  return (
    <ScreenContainer>
      <Header variant="back" title="My Documents" />

      <View style={styles.searchWrap}>
        <AppTextInput
          placeholder="Search documents"
          value={search}
          onChangeText={setSearch}
          leftIcon="search-outline"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.listScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredDocuments.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No documents found"
            message="Try a different filter or search term."
          />
        ) : (
          <Card padded={false} style={styles.listCard}>
            {filteredDocuments.map((doc, index) => {
              const member = getFamilyMemberById(doc.familyMemberId);
              return (
                <View key={doc.id}>
                  <DocumentListItem
                    document={doc}
                    subtitle={member?.name}
                    onPress={() => navigation.navigate(ROUTES.DOCUMENT_DETAILS, { documentId: doc.id })}
                  />
                  {index < filteredDocuments.length - 1 ? <View style={styles.separator} /> : null}
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: SPACING.lg,
  },
  searchInput: {
    marginBottom: SPACING.md,
  },
  // flexGrow: 0 stops the horizontal chip strip from flexing against the
  // document list below — without it the strip's height varies with how
  // many documents the list holds.
  filterScroll: {
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
    alignItems: "center",
  },
  listScroll: {
    flex: 1,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textInverse,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  listCard: {
    paddingHorizontal: SPACING.lg,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
