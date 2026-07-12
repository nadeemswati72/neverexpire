import React from "react";
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from "react-native-svg";

import { COLORS } from "../../constants/theme";

/**
 * The well-known "share" glyph — one node on the left, two on the right,
 * connected by lines — drawn as SVG rather than emoji (there's no real
 * Unicode emoji for it). Filled with a diagonal gradient for the same
 * glossy look as the rest of the icon set.
 */
export default function ShareIcon({ size = 20, colorStart = COLORS.accent, colorEnd = COLORS.accentDark }) {
  const gradientId = "shareIconGradient";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colorStart} />
          <Stop offset="1" stopColor={colorEnd} />
        </LinearGradient>
      </Defs>
      <Line x1="7.2" y1="12" x2="16.5" y2="6.5" stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" />
      <Line x1="7.2" y1="12" x2="16.5" y2="17.5" stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="5.5" cy="12" r="3" fill={`url(#${gradientId})`} />
      <Circle cx="18" cy="5.5" r="3" fill={`url(#${gradientId})`} />
      <Circle cx="18" cy="18.5" r="3" fill={`url(#${gradientId})`} />
    </Svg>
  );
}
