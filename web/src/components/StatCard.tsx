interface Props {
  label: string
  value: number
  icon: string
  color: string
  bgColor: string
  borderColor: string
}

export default function StatCard({ label, value, icon, color, bgColor, borderColor }: Props) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 16,
      padding: '20px 22px',
      boxShadow: '0 4px 16px rgba(30,45,80,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flex: 1,
      minWidth: 0,
    }}>
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
    </div>
  )
}
