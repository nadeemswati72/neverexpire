import React from "react";
import Svg, { Line } from "react-native-svg";

/** White three-bar hamburger glyph for the Menu glossy puck. */
export default function MenuGlyph({ size = 22, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
