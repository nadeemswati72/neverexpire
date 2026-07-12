import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { RADIUS, withOpacity } from "../../constants/theme";

/**
 * Rounded square with a tinted background showing a document-type emoji
 * (see constants/documentTypes.js) — used for document-type icons in list
 * rows and the icon options on the Add Document screen. `icon` is the raw
 * emoji character itself, not an icon-font name.
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
      <Text style={{ fontSize: iconSize || size * 0.5, lineHeight: (iconSize || size * 0.5) * 1.15 }}>{icon}</Text>
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
