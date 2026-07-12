import React from "react";
import { View, Text, StyleSheet } from "react-native";

import Card from "../common/Card";
import DonutChart from "./DonutChart";
import { EXPIRY_STATUS, getExpiryStatus } from "../../utils/dateUtils";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, STATUS_COLORS } from "../../constants/theme";

/**
 * Donut chart + legend card summarising a document set by expiry status.
 * Mirrors the web dashboard's hero chart; used on Dashboard (optionally
 * filtered to one member) and on Family Member Documents.
 */
export default function StatusOverview({ documents, title = "Status Overview" }) {
  const counts = {
    expired: 0,
    expiring_soon: 0,
    valid: 0,
    no_expiry: 0,
  };
  documents.forEach((doc) => {
    const status = getExpiryStatus(doc.expiryDate);
    counts[status] += 1;
  });
  const total = documents.length;

  const legend = [
    { key: EXPIRY_STATUS.EXPIRED, label: "Expired", value: counts.expired },
    { key: EXPIRY_STATUS.EXPIRING_SOON, label: "Expiring", value: counts.expiring_soon },
    { key: EXPIRY_STATUS.VALID, label: "Valid", value: counts.valid },
    { key: EXPIRY_STATUS.NO_EXPIRY, label: "No expiry", value: counts.no_expiry },
  ];

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <DonutChart
          total={total}
          size={124}
          thickness={16}
          segments={legend.map((l) => ({ value: l.value, color: STATUS_COLORS[l.key], label: l.label }))}
        />
        <View style={styles.legend}>
          {legend.map((l) => (
            <View key={l.key} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLORS[l.key] }]} />
              <Text style={styles.legendLabel}>{l.label}</Text>
              <Text style={styles.legendValue}>{l.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  legend: {
    flex: 1,
    marginLeft: SPACING.xxl,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  legendValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
});
