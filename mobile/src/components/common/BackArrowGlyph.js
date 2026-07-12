import React from "react";
import Svg, { Line, Polyline } from "react-native-svg";

/** White back-arrow glyph for the Header's back-button glossy puck. */
export default function BackArrowGlyph({ size = 22, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="19" y1="12" x2="6" y2="12" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      <Polyline points="11,6 5,12 11,18" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
