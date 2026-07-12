import React from "react";
import { Text } from "react-native";

import { emojiFor } from "../../constants/emojiIcons";

/**
 * Drop-in replacement for `<Ionicons name={x} size={y} color={z} />` that
 * renders the app's emoji glyph set instead. `color` only visibly affects
 * the handful of non-pictographic Unicode symbols in EMOJI_ICONS (chevron,
 * close, menu, back) — true color emoji ignore text color by design.
 */
export default function EmojiIcon({ name, size = 20, color, style }) {
  return <Text style={[{ fontSize: size, lineHeight: size * 1.15, color }, style]}>{emojiFor(name)}</Text>;
}
