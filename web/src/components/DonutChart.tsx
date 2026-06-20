interface Segment {
  value: number
  color: string
  label: string
}

interface Props {
  segments: Segment[]
  total: number
  size?: number
  thickness?: number
}

export default function DonutChart({ segments, total, size = 120, thickness = 18 }: Props) {
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  // Build arcs
  const filtered = segments.filter(s => s.value > 0)
  let offset = 0
  const gap = total > 0 ? 2 : 0 // small gap between segments

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {total === 0 ? (
          // Empty state — grey ring
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={thickness} />
        ) : (
          filtered.map((seg, i) => {
            const frac = seg.value / total
            const dash = Math.max(0, frac * circumference - gap)
            const arc = (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset * circumference}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            )
            offset += frac
            return arc
          })
        )}
      </svg>
      {/* Centre label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: size / 4, fontWeight: 800, color: '#e8f0fe', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: size / 10, color: '#8fa8cc', marginTop: 2, fontWeight: 500 }}>docs</div>
      </div>
    </div>
  )
}
