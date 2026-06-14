import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../constants/theme";

/**
 * Base screen wrapper: applies the app background, top safe-area inset, and
 * (optionally) makes the body scrollable. Every screen should render its
 * content inside one of these so spacing stays consistent without each
 * screen re-implementing SafeAreaView/ScrollView boilerplate.
 */
export default function ScreenContainer({
  children,
  scroll = false,
  edges = ["top"],
  style,
  contentContainerStyle,
}) {
  const insets = useSafeAreaInsets();
  const paddingStyle = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
  };

  if (scroll) {
    return (
      <View style={[styles.root, paddingStyle, style]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.root, paddingStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
