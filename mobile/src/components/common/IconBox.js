import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { RADIUS, withOpacity } from "../../constants/theme";

/**
 * Rounded square with a tinted background and a MaterialCommunityIcons
 * glyph — used for document-type icons in list rows and the icon options
 * on the Add Document screen.
 */
export default function IconBox({ icon, color, size = 44, iconSize, style }) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, backgroundColor: withOpacity(color, 0.14) },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize || size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
