import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { COLORS, FONT_WEIGHTS } from "../../constants/theme";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Circular avatar. Renders `imageUri` when provided, otherwise falls back to
 * initials on a colored background — used for the logged-in user and every
 * family member across Dashboard, Family, and Profile screens.
 */
export default function Avatar({ name, imageUri, color = COLORS.primary, size = 48 }) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (imageUri) {
    return <Image source={{ uri: imageUri }} style={[styles.image, dimensionStyle]} />;
  }

  return (
    <View style={[styles.placeholder, dimensionStyle, { backgroundColor: color }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: COLORS.border,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
