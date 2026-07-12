import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { fetchMe } from '../auth'
import type { User } from '../api'

interface MockEmail {
  timestamp: string
  to: string
  subject: string
  from: string
  body: string
}

export default function MockInboxPage() {
  const [user, setUser] = useState<User | null>(null)
  const [emails, setEmails] = useState<MockEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetchMe().then(setUser).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get(`/mock-inbox${showAll ? '?all=1' : ''}`)
      .then(r => setEmails(r.data.data))
      .finally(() => setLoading(false))
  }, [showAll])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={[]} selectedPersonId={null} onSelectPerson={() => {}} activePage="mock-inbox" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 16, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#15203a' }}>📬 Mock Email Inbox</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a5568', cursor: 'pointer' }}>
              <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
              Show all mailboxes (demo)
            </label>
          </div>
          <p style={{ fontSize: 12, color: '#8a9ab5', marginTop: 0, marginBottom: 20 }}>
            NeverExpire doesn't send real emails in this PoC — sharing/revoke notifications are logged here so the flow can be demoed live.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ab5' }}>Loading…</div>
          ) : emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ab5' }}>No mock emails yet</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {emails.map((e, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(30,45,80,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#15203a' }}>{e.subject}</div>
                      <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 2 }}>To: {e.to}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#8a9ab5', whiteSpace: 'nowrap' }}>{e.timestamp}</div>
                  </div>
                  {expanded === i && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(30,45,80,0.07)' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12.5, color: '#4a5568', marginTop: 12, lineHeight: 1.6 }}>{e.body}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
