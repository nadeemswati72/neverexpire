import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { COLORS, FONT_WEIGHTS, withOpacity } from "../../constants/theme";

/**
 * Status donut chart — the mobile counterpart of the web dashboard's
 * DonutChart.tsx, drawn with stroke-dasharray arcs so both platforms render
 * the same proportions. Segments with value 0 are skipped; when total is 0
 * a neutral empty ring is shown instead.
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

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${c}, ${c}`}>
          {total === 0 ? (
            <Circle cx={c} cy={c} r={r} fill="none" stroke={withOpacity(COLORS.textMuted, 0.25)} strokeWidth={thickness} />
          ) : (
            filtered.map((seg, i) => {
              const frac = seg.value / total;
              const dash = Math.max(0, frac * circumference - gap);
              const arc = (
                <Circle
                  key={`${seg.label}-${i}`}
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset * circumference}
                  strokeLinecap="butt"
                />
              );
              offset += frac;
              return arc;
            })
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
