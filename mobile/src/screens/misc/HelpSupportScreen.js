import React from "react";
import { View, Text, ScrollView, Linking, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import SectionHeader from "../../components/common/SectionHeader";
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

const FAQ_ITEMS = [
  {
    question: "How do I add a new document?",
    answer:
      "Tap the + button on the bottom navigation bar, then choose to take a photo, pick from your gallery, or upload a file.",
  },
  {
    question: "How are expiry statuses calculated?",
    answer:
      "Documents expiring within 30 days are marked 'Expiring Soon' in orange, overdue documents are marked 'Expired' in red, and everything else is 'Valid' in green.",
  },
  {
    question: "Can I track documents for my family?",
    answer:
      "Yes — open Family Members from the menu, add a family member, and assign documents to them when adding or editing.",
  },
  {
    question: "Is my data stored securely?",
    answer: "In this demo, documents are stored locally on your device. No data is sent to external servers.",
  },
];

const CONTACT_OPTIONS = [
  {
    icon: "mail-outline",
    label: "Email Support",
    value: "support@neverexpire.app",
    action: () => Linking.openURL("mailto:support@neverexpire.app"),
  },
  {
    icon: "call-outline",
    label: "Call Us",
    value: "+971 4 123 4567",
    action: () => Linking.openURL("tel:+97141234567"),
  },
];

/** Static FAQ + contact info (drawer "Help & Support"). */
export default function HelpSupportScreen() {
  return (
    <ScreenContainer>
      <Header variant="back" title="Help & Support" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <SectionHeader title="Frequently Asked Questions" />
          {FAQ_ITEMS.map((item, index) => (
            <View key={item.question} style={index < FAQ_ITEMS.length - 1 ? styles.faqItem : null}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Contact Us" />
          {CONTACT_OPTIONS.map((option, index) => (
            <View key={option.label}>
              <TouchableOpacity style={styles.contactRow} onPress={option.action} activeOpacity={0.85}>
                <View style={styles.contactIcon}>
                  <Ionicons name={option.icon} size={20} color={COLORS.accent} />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactLabel}>{option.label}</Text>
                  <Text style={styles.contactValue}>{option.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
              {index < CONTACT_OPTIONS.length - 1 ? <View style={styles.separator} /> : null}
            </View>
          ))}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  faqItem: {
    marginBottom: SPACING.lg,
  },
  question: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  answer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  contactValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
