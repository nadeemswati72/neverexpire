interface Props {
  label: string
  value: number
  icon: string
  color: string
  bgColor: string
  borderColor: string
  active?: boolean
  onClick?: () => void
}

export default function StatCard({ label, value, icon, color, bgColor, borderColor, active, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `${bgColor.replace('0.1', '0.22')}` : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1.5px solid ${active ? color + '66' : borderColor}`,
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: active ? `0 4px 20px ${color}22` : '0 4px 16px rgba(30,45,80,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: 1,
        minWidth: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s ease',
        transform: active ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 13,
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 2, fontWeight: 500 }}>{label}</div>
      </div>
      {active && (
        <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      )}
    </div>
  )
}
