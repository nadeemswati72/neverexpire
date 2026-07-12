import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import EmojiIcon from "../../components/common/EmojiIcon";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW } from "../../constants/theme";

const APP_VERSION = "1.0.0";

const FEATURES = [
  "Color-coded expiry tracking",
  "Family member document organization",
  "Quick document capture via camera or gallery",
  "Local, private storage on your device",
];

/** App info (drawer "About"). */
export default function AboutScreen() {
  return (
    <ScreenContainer>
      <Header variant="back" title="About" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <EmojiIcon name="shield-checkmark" size={30} />
          </View>
          <Text style={styles.brandTitle}>NeverExpire</Text>
          <Text style={styles.brandVersion}>Version {APP_VERSION}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.paragraph}>
            NeverExpire helps you keep track of every important document — passports, IDs, visas, licenses,
            insurance policies, and more — for yourself and your family, so nothing ever expires unnoticed.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Features</Text>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <EmojiIcon name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Card>

        <Text style={styles.footer}>© {new Date().getFullYear()} NeverExpire. All rights reserved.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  brand: {
    alignItems: "center",
    marginVertical: SPACING.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOW.fab,
  },
  brandTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandVersion: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  paragraph: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  footer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.lg,
  },
});
