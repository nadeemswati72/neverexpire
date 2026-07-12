import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../api'

interface NotificationEntry {
  id: number
  message: string
  document_id: number | null
  is_read: boolean
  created_at: string
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationEntry[]>([])
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function load() {
    api.get('/notifications').then(r => {
      setUnreadCount(r.data.data.unread_count)
      setNotifications(r.data.data.notifications)
    }).catch(() => {})
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen(o => !o)
  }

  async function handleNotificationClick(n: NotificationEntry) {
    if (!n.is_read) {
      await api.put(`/notifications/${n.id}/read`)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
      setUnreadCount(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (n.document_id) navigate(`/documents/${n.document_id}`)
  }

  async function handleMarkAllRead() {
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(x => ({ ...x, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        style={{
          position: 'relative', background: 'rgba(30,45,80,0.06)', border: '1px solid rgba(30,45,80,0.1)',
          borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 15,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#c53030', color: 'white',
            borderRadius: 99, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed', top: coords.top, left: coords.left, width: 320, maxHeight: 420, overflowY: 'auto',
            background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(30,45,80,0.1)',
            borderRadius: 12, boxShadow: '0 10px 30px rgba(30,45,80,0.18)', zIndex: 9999,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(30,45,80,0.07)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#15203a' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#22a99c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: '#8a9ab5', fontSize: 13 }}>No notifications yet</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '11px 14px', fontSize: 12.5, color: '#15203a', cursor: 'pointer',
                  borderBottom: '1px solid rgba(30,45,80,0.05)', background: n.is_read ? 'transparent' : 'rgba(52,201,186,0.06)',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}
              >
                {!n.is_read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c9ba', marginTop: 5, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 3 }}>{timeAgo(n.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
