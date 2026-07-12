import React from "react";
import { Text, View } from "react-native";

import ShareIcon from "./ShareIcon";
import { emojiFor } from "../../constants/emojiIcons";

/**
 * Drop-in replacement for `<Ionicons name={x} size={y} color={z} />` that
 * renders the app's emoji glyph set instead. `color` only visibly affects
 * the handful of non-pictographic Unicode symbols in EMOJI_ICONS (chevron,
 * close, menu, back) — true color emoji ignore text color by design.
 *
 * "share-social-outline" is special-cased to a hand-drawn vector icon
 * (see ShareIcon) since there's no real emoji for the well-known
 * node-and-lines "share" glyph.
 */
export default function EmojiIcon({ name, size = 20, color, style }) {
  if (name === "share-social-outline") {
    return (
      <View style={style}>
        <ShareIcon size={size} />
      </View>
    );
  }
  return <Text style={[{ fontSize: size, lineHeight: size * 1.15, color }, style]}>{emojiFor(name)}</Text>;
}
