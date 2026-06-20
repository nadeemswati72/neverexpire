export const colors = {
  bgStart: '#dde4f0',
  bgEnd: '#c8d3e8',
  brand: '#34c9ba',
  brandDark: '#22a99c',
  glassWhite: 'rgba(255,255,255,0.62)',
  glassDark: 'rgba(21,32,58,0.92)',
  border: 'rgba(255,255,255,0.55)',
  borderDark: 'rgba(255,255,255,0.1)',
  textPrimary: '#15203a',
  textSecondary: '#4a5568',
  textMuted: '#8a9ab5',
  textOnDark: '#e8f0fe',
  textMutedDark: '#8fa8cc',
  expired: '#e53e3e',
  expiredBg: 'rgba(229,62,62,0.12)',
  expiring: '#d97706',
  expiringBg: 'rgba(217,119,6,0.12)',
  valid: '#38a169',
  validBg: 'rgba(56,161,105,0.12)',
  noExpiry: '#718096',
  noExpiryBg: 'rgba(113,128,150,0.12)',
  relation: {
    SELF: '#34c9ba', SPOUSE: '#e879a0', CHILD: '#f6ad55',
    PARENT: '#68d391', SIBLING: '#76e4f7', OTHER: '#b794f4',
  },
}

export const radius = {
  card: 16,
  button: 12,
  pill: 99,
  avatar: 999,
}

export const shadow = {
  card: { shadowColor: '#1e2d50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  dark: { shadowColor: '#1e2d50', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 8 },
}

export const STATUS_COLOR: Record<string, string> = {
  expired: '#e53e3e',
  expiring_soon: '#d97706',
  valid: '#38a169',
  no_expiry: '#718096',
}

export const STATUS_BG: Record<string, string> = {
  expired: 'rgba(229,62,62,0.12)',
  expiring_soon: 'rgba(217,119,6,0.12)',
  valid: 'rgba(56,161,105,0.12)',
  no_expiry: 'rgba(113,128,150,0.12)',
}

export const STATUS_LABEL: Record<string, string> = {
  expired: 'Expired',
  expiring_soon: 'Expiring soon',
  valid: 'Valid',
  no_expiry: 'No expiry',
}

export const DOC_ICON: Record<string, string> = {
  PASSPORT: '🛂', ID_CARD: '🪪', VISA: '✈️', DRIVING_LICENSE: '🚗', VEHICLE_REGISTRATION: '🚙',
  HEALTH_INSURANCE: '🏥', INSURANCE: '🛡️', WARRANTY: '🔧', MEDICATION: '💊',
  FOOD_ITEM: '🥫', CERTIFICATE: '🎓', SUBSCRIPTION: '📱', OTHER: '📄',
}

export const RELATION_ICON: Record<string, string> = {
  SELF: '👤', SPOUSE: '💑', CHILD: '👶', PARENT: '👴', SIBLING: '🧑', OTHER: '🙂',
}
