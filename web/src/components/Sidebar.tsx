import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../auth'
import type { Person, User } from '../api'
import MemberAvatar from './MemberAvatar'
import NotificationBell from './NotificationBell'

interface Props {
  user: User | null
  family: Person[]
  selectedPersonId: number | null
  onSelectPerson: (id: number | null) => void
  activePage?: string
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '▦', path: '/', id: 'dashboard' },
  { label: 'Documents', icon: '📄', path: '/documents', id: 'documents' },
  { label: 'Family', icon: '👨‍👩‍👧', path: '/family', id: 'family' },
  { label: 'Sharing', icon: '🔗', path: '/sharing', id: 'sharing' },
  { label: 'Mock Inbox', icon: '📬', path: '/mock-inbox', id: 'mock-inbox' },
  { label: 'Reminders', icon: '🔔', path: '/reminders', id: 'reminders' },
  { label: 'Settings', icon: '⚙️', path: '/settings', id: 'settings' },
]

const RELATION_ICONS: Record<string, string> = {
  SELF: '👤', SPOUSE: '💑', CHILD: '👶', PARENT: '👴', SIBLING: '🧑', DOMESTIC_HELP: '🧹', OTHER: '🙂',
}

const RELATION_COLORS: Record<string, string> = {
  SELF: '#34c9ba', SPOUSE: '#e879a0', CHILD: '#f6ad55',
  PARENT: '#68d391', SIBLING: '#76e4f7', DOMESTIC_HELP: '#f6a5c0', OTHER: '#b794f4',
}

function formatRelationLabel(code: string) {
  return code.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

export default function Sidebar({ user, family, selectedPersonId, onSelectPerson, activePage = 'dashboard' }: Props) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger — hidden on desktop, hidden once the drawer is open */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden"
          aria-label="Open menu"
          style={{
            position: 'fixed', top: 14, left: 14, zIndex: 50,
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(30,45,80,0.1)', boxShadow: '0 2px 10px rgba(30,45,80,0.12)',
            fontSize: 18, cursor: 'pointer', color: '#15203a',
          }}
        >
          ☰
        </button>
      )}

      {/* Backdrop — mobile only, closes the drawer on tap */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 40 }}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 md:z-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          width: 240,
          minHeight: '100vh',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.55)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 0 24px',
          flexShrink: 0,
          boxShadow: '2px 0 16px rgba(30,45,80,0.06)',
          transition: 'transform 0.2s ease',
          overflowY: 'auto',
        }}
      >
      {/* Brand */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(30,45,80,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #34c9ba, #22a99c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 3px 10px rgba(52,201,186,0.3)',
          }}>⏰</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#15203a', letterSpacing: '-0.3px' }}>NeverExpire</div>
            <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 1 }}>Document Tracker</div>
          </div>
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
            aria-label="Close menu"
            style={{ background: 'none', border: 'none', fontSize: 18, color: '#4a5568', cursor: 'pointer', padding: 4 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#8a9ab5', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 9, marginBottom: 2,
                cursor: 'pointer',
                background: isActive ? 'rgba(52,201,186,0.12)' : 'transparent',
                color: isActive ? '#15203a' : '#4a5568',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? 'rgba(52,201,186,0.12)' : 'rgba(30,45,80,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? 'rgba(52,201,186,0.12)' : 'transparent' }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#34c9ba' }} />
              )}
            </div>
          )
        })}
      </nav>

      {/* Family members */}
      {family.length > 0 && (
        <div style={{ padding: '0 10px', marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#8a9ab5', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
            Family
          </div>
          <div
            onClick={() => onSelectPerson(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 9, marginBottom: 2,
              cursor: 'pointer', fontSize: 13,
              background: selectedPersonId === null ? 'rgba(52,201,186,0.1)' : 'transparent',
              color: selectedPersonId === null ? '#15203a' : '#4a5568',
              fontWeight: selectedPersonId === null ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 14 }}>👨‍👩‍👧</span>
            <span>All members</span>
          </div>
          {family.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectPerson(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 9, marginBottom: 2,
                cursor: 'pointer', fontSize: 13,
                background: selectedPersonId === p.id ? 'rgba(52,201,186,0.1)' : 'transparent',
                color: selectedPersonId === p.id ? '#15203a' : '#4a5568',
                fontWeight: selectedPersonId === p.id ? 600 : 400,
                transition: 'background 0.15s',
              }}
            >
              {/* Avatar + relation badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <MemberAvatar
                  personId={p.id}
                  initials={p.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  color={RELATION_COLORS[p.relation_type] ?? '#b794f4'}
                  size={32}
                  hasPhoto={!!p.photo_path}
                  editable={false}
                />
                <div style={{
                  position: 'absolute', bottom: -2, right: -3,
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'white', border: '1px solid rgba(30,45,80,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, lineHeight: 1, pointerEvents: 'none',
                }}>
                  {RELATION_ICONS[p.relation_type] || '🙂'}
                </div>
              </div>
              <div>
                <div>{p.full_name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: '#8a9ab5' }}>{p.relation_type ? formatRelationLabel(p.relation_type) : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User + logout */}
      <div style={{ marginTop: 'auto', padding: '16px 10px 0', borderTop: '1px solid rgba(30,45,80,0.07)' }}>
        {user && (
          <div style={{ padding: '8px 10px', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#15203a' }}>{user.full_name}</div>
            <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 2 }}>{user.email}</div>
          </div>
        )}
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '9px 10px',
            background: 'rgba(229,62,62,0.08)',
            border: '1px solid rgba(229,62,62,0.15)',
            borderRadius: 9, cursor: 'pointer',
            fontSize: 13, color: '#c53030', fontWeight: 500,
          }}
        >
          <span>🚪</span> Sign out
        </button>
      </div>
      </aside>
    </>
  )
}
