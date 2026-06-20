const CONFIG = {
  expired:       { label: 'Expired',        bg: 'rgba(229,62,62,0.12)',   color: '#c53030', border: 'rgba(229,62,62,0.25)' },
  expiring_soon: { label: 'Expiring soon',  bg: 'rgba(217,119,6,0.12)',   color: '#b45309', border: 'rgba(217,119,6,0.25)' },
  valid:         { label: 'Valid',           bg: 'rgba(56,161,105,0.12)',  color: '#276749', border: 'rgba(56,161,105,0.25)' },
  no_expiry:     { label: 'No expiry',      bg: 'rgba(113,128,150,0.12)', color: '#4a5568', border: 'rgba(113,128,150,0.2)' },
}

export default function StatusBadge({ status }: { status: string }) {
  const c = CONFIG[status as keyof typeof CONFIG] ?? CONFIG.no_expiry
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  )
}
