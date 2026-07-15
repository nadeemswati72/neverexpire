import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { fetchMe } from '../auth'
import type { User, Person } from '../api'

interface ReminderEntry {
  id: number
  document_id: number
  document_title: string
  person_name: string
  threshold_days: number
  rule_name: string
  due_date: string | null
  expiry_date: string | null
  days_remaining: number | null
  status: 'pending' | 'sent' | 'dismissed'
  sent_at: string | null
}

function urgency(daysRemaining: number | null): { label: string; color: string } {
  if (daysRemaining === null) return { label: 'UPCOMING', color: '#4a5568' }
  if (daysRemaining < 0) return { label: 'EXPIRED', color: '#c53030' }
  if (daysRemaining <= 7) return { label: 'URGENT', color: '#c53030' }
  if (daysRemaining <= 30) return { label: 'SOON', color: '#b45309' }
  return { label: 'UPCOMING', color: '#276749' }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RemindersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Person[]>([])
  const [reminders, setReminders] = useState<ReminderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  function load() {
    setLoading(true)
    Promise.all([api.get('/reminders'), api.get('/family')])
      .then(([r, fam]) => {
        setReminders(r.data.data)
        setFamily(fam.data.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMe().then(setUser).catch(() => {})
    load()
  }, [])

  async function handleSendNow() {
    setSending(true)
    setSendResult(null)
    try {
      const r = await api.post('/admin/run-reminder-check')
      const result = r.data.data
      if (result.error) {
        setSendResult(`⚠️ ${result.error}`)
      } else if (!result.sent) {
        setSendResult('No reminders are due right now — nothing to send.')
      } else {
        setSendResult(`✅ Sent — ${result.count} reminder${result.count !== 1 ? 's' : ''} included. Check Mock Inbox to view it.`)
      }
      load()
    } catch {
      setSendResult('⚠️ Failed to send — check the backend is reachable.')
    } finally {
      setSending(false)
    }
  }

  async function handleDismiss(id: number) {
    await api.put(`/reminders/${id}/dismiss`)
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const pending = reminders.filter(r => r.status === 'pending')
  const sent = reminders.filter(r => r.status === 'sent')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={family} selectedPersonId={null} onSelectPerson={() => {}} activePage="reminders" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#15203a', margin: 0 }}>🔔 Reminders</h1>
            <p style={{ fontSize: 12, color: '#8a9ab5', margin: 0, marginTop: 2 }}>
              You're reminded {[90, 30, 7].join(', ')} days before any document expires.
            </p>
          </div>
          <button
            onClick={handleSendNow}
            disabled={sending}
            style={{ background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}
          >
            {sending ? 'Sending…' : '📧 Send Reminder Digest Now'}
          </button>
        </div>

        {sendResult && (
          <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(52,201,186,0.1)', border: '1px solid rgba(52,201,186,0.25)', borderRadius: 10, fontSize: 13, color: '#15203a' }}>
            {sendResult}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#15203a', marginTop: 0, marginBottom: 14 }}>
            Pending ({pending.length})
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#8a9ab5' }}>Loading…</div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#8a9ab5' }}>No pending reminders — everything's on track.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {pending.map(r => {
                const u = urgency(r.days_remaining)
                const daysLabel = r.days_remaining === null ? '' : r.days_remaining < 0 ? `${Math.abs(r.days_remaining)}d ago` : `${r.days_remaining}d left`
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(30,45,80,0.08)', borderRadius: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: u.color, padding: '2px 8px', borderRadius: 99 }}>{u.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#15203a' }}>{r.document_title}</div>
                      <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 2 }}>{r.person_name} · {r.rule_name} ({r.threshold_days}d threshold)</div>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: u.color }}>{daysLabel}</div>
                      <div style={{ fontSize: 11, color: '#8a9ab5' }}>{formatDate(r.expiry_date)}</div>
                    </div>
                    <button
                      onClick={() => handleDismiss(r.id)}
                      style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Dismiss
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {sent.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 16, padding: '20px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#15203a', marginTop: 0, marginBottom: 14 }}>
              Already Sent ({sent.length})
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {sent.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(30,45,80,0.03)', borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#15203a' }}>{r.document_title}</div>
                    <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 2 }}>{r.person_name} · {r.rule_name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#8a9ab5', whiteSpace: 'nowrap' }}>Sent {formatDate(r.sent_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
