import { Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

interface Segment { value: number; color: string }

interface Props {
  segments: Segment[]
  total: number
  size?: number
  thickness?: number
}

export default function DonutChart({ segments, total, size = 110, thickness = 16 }: Props) {
  const r = (size - thickness) / 2
  const circumference = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2
  const gap = total > 0 ? 2 : 0
  let offset = 0

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        {total === 0 ? (
          <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={thickness} />
        ) : (
          segments.filter(s => s.value > 0).map((seg, i) => {
            const frac = seg.value / total
            const dash = Math.max(0, frac * circumference - gap)
            const el = (
              <Circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset * circumference}
              />
            )
            offset += frac
            return el
          })
        )}
      </Svg>
      <Text style={{ fontSize: size / 4, fontWeight: '800', color: '#e8f0fe' }}>{total}</Text>
      <Text style={{ fontSize: 10, color: '#8fa8cc', marginTop: 1 }}>docs</Text>
    </View>
  )
}
