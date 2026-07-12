import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Rect, Defs, LinearGradient, RadialGradient, Stop } from "react-native-svg";

/**
 * Colored "3D plastic" puck — diagonal gradient fill, a drop shadow behind
 * it, and a soft radial specular highlight over the upper-left — hosting a
 * glyph (custom SVG or emoji Text) centered on top via `children`. Used for
 * the app's most prominent icons (Add, Menu, Share, tab icons) rather than
 * every icon, since it's a heavier visual treatment than a flat emoji chip.
 *
 * `shape="circle"` (default) or `"square"` (rounded rect, radius ~28% of size).
 */
export default function GlossyIconPuck({
  size = 44,
  shape = "circle",
  colorStart,
  colorEnd,
  shadowColor,
  children,
}) {
  const gradId = `puckGrad-${shape}-${size}-${colorStart}`;
  const highlightId = `puckHighlight-${shape}-${size}`;
  const radius = shape === "circle" ? size / 2 : size * 0.28;
  const center = size / 2;

  const Shape = shape === "circle" ? Circle : Rect;
  const shapeProps =
    shape === "circle"
      ? { cx: center, cy: center, r: center }
      : { x: 0, y: 0, width: size, height: size, rx: radius };

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.shadowLayer,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: colorEnd,
            shadowColor: shadowColor || colorEnd,
          },
        ]}
      />
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={colorStart} />
            <Stop offset="1" stopColor={colorEnd} />
          </LinearGradient>
          <RadialGradient id={highlightId} cx="0.34" cy="0.26" rx="0.55" ry="0.42">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.6} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Shape {...shapeProps} fill={`url(#${gradId})`} />
        <Shape {...shapeProps} fill={`url(#${highlightId})`} />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 9,
    elevation: 7,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
