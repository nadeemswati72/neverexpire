import React from "react";
import Svg, { Line } from "react-native-svg";

/** White rounded-cross glyph for the Add/FAB glossy puck. */
export default function PlusGlyph({ size = 24, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    </Svg>
  );
}
