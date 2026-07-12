import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";

import { COLORS, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

function hexToRgb(hexColor) {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const value = parseInt(hex, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

/** Mixes a hex color toward white by `amount` (0-1) for a glossy highlight stop. */
function lighten(hexColor, amount) {
  const { r, g, b } = hexToRgb(hexColor);
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Mixes a hex color toward black by `amount` (0-1) for the gradient's dark stop. */
function darken(hexColor, amount) {
  const { r, g, b } = hexToRgb(hexColor);
  const mix = (channel) => Math.round(channel * (1 - amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/**
 * Status donut chart — the mobile counterpart of the web dashboard's
 * DonutChart.tsx, drawn with stroke-dasharray arcs so both platforms render
 * the same proportions. Segments with value 0 are skipped; when total is 0
 * a neutral empty ring is shown instead.
 *
 * Glossy/3D treatment (matching the shadowed, gradient look used on the
 * drawer logo and avatars elsewhere): each segment gets a diagonal
 * light-to-base gradient sharing one light direction across the whole ring
 * (like a single light source), a soft drop shadow sits behind the chart,
 * and a thin white specular arc is layered over the upper-left to fake a
 * glass-like sheen.
 *
 * segments: [{ value, color, label }]
 */
export default function DonutChart({ segments, total, size = 132, thickness = 18 }) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = total > 0 ? 2 : 0;

  const filtered = segments.filter((s) => s.value > 0);
  let offset = 0;

  const highlightDash = circumference * 0.22;
  const highlightOffset = circumference * 0.06;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.shadowDisc,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS.surface },
        ]}
      />
      <Svg width={size} height={size}>
        <Defs>
          {filtered.map((seg, i) => (
            <LinearGradient key={`grad-${seg.label}-${i}`} id={`donutGrad${i}`} x1="0.1" y1="0" x2="0.9" y2="1">
              <Stop offset="0" stopColor={lighten(seg.color, 0.45)} />
              <Stop offset="0.55" stopColor={seg.color} />
              <Stop offset="1" stopColor={darken(seg.color, 0.28)} />
            </LinearGradient>
          ))}
        </Defs>
        <G rotation={-90} origin={`${c}, ${c}`}>
          {total === 0 ? (
            <Circle cx={c} cy={c} r={r} fill="none" stroke={withOpacity(COLORS.textMuted, 0.25)} strokeWidth={thickness} />
          ) : (
            <>
              {filtered.map((seg, i) => {
                const frac = seg.value / total;
                const dash = Math.max(0, frac * circumference - gap);
                const arc = (
                  <Circle
                    key={`${seg.label}-${i}`}
                    cx={c}
                    cy={c}
                    r={r}
                    fill="none"
                    stroke={`url(#donutGrad${i})`}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset * circumference}
                    strokeLinecap="butt"
                  />
                );
                offset += frac;
                return arc;
              })}
              {/* Specular sheen — a bold rounded white arc over the upper-left, like a glossy tube. */}
              <Circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity={0.5}
                strokeWidth={thickness * 0.32}
                strokeDasharray={`${highlightDash} ${circumference - highlightDash}`}
                strokeDashoffset={highlightOffset}
                strokeLinecap="round"
              />
            </>
          )}
        </G>
      </Svg>
      <View style={styles.centre} pointerEvents="none">
        <Text style={[styles.total, { fontSize: size / 4 }]}>{total}</Text>
        <Text style={[styles.caption, { fontSize: size / 10 }]}>docs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowDisc: {
    position: "absolute",
    top: 0,
    left: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 8,
  },
  centre: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  total: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    lineHeight: undefined,
  },
  caption: {
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
});
