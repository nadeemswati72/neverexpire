import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { DashboardSummary, DocumentBrief, Person, User } from '../api'
import { fetchMe } from '../auth'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import DonutChart from '../components/DonutChart'
import MemberAvatar from '../components/MemberAvatar'

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

const STATUS_LABELS: Record<string, string> = {
  expired: 'Expired Documents',
  expiring_soon: 'Expiring Soon',
  valid: 'Valid Documents',
  no_expiry: 'No Expiry',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLabel(days: number | null, status: string) {
  if (days === null) return '—'
  if (status === 'expired') return `${Math.abs(days)}d ago`
  return `${days}d left`
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Person[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [allDocs, setAllDocs] = useState<DocumentBrief[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchMe(),
      api.get('/family'),
      api.get('/dashboard/summary'),
      api.get('/documents'),
    ]).then(([me, fam, dash, docs]) => {
      setUser(me)
      setFamily(fam.data.data)
      setSummary(dash.data.data)
      setAllDocs(docs.data.data)
    }).finally(() => setLoading(false))
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    function handle(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [userMenuOpen])

  // Filtered by selected family member only — used for the stat cards and donut
  // chart, which must ignore the status-filter click (that only narrows the lists below).
  const personDocs: DocumentBrief[] = allDocs
    .filter(d => !selectedPersonId || d.person_id === selectedPersonId)

  const filteredDocs: DocumentBrief[] = personDocs
    .filter(d => !statusFilter || d.status === statusFilter)

  const attentionDocs = filteredDocs
    .filter(d => d.status === 'expired' || d.status === 'expiring_soon')
    .sort((a, b) => (a.days_remaining ?? 0) - (b.days_remaining ?? 0))

  const validDocs = filteredDocs.filter(d => d.status === 'valid' || d.status === 'no_expiry')

  const selectedPerson = family.find(p => p.id === selectedPersonId)

  // Derived from personDocs (not the whole-family `summary`) so stat cards and the
  // donut chart update when a family member is selected in the sidebar.
  const displayCounts = {
    total: personDocs.length,
    expired: personDocs.filter(dc => dc.status === 'expired').length,
    expiring_soon: personDocs.filter(dc => dc.status === 'expiring_soon').length,
    valid: personDocs.filter(dc => dc.status === 'valid').length,
    no_expiry: personDocs.filter(dc => dc.status === 'no_expiry').length,
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #dde4f0 0%, #c8d3e8 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏰</div>
          <div style={{ color: '#4a5568', fontSize: 15 }}>Loading your documents…</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        user={user}
        family={family}
        selectedPersonId={selectedPersonId}
        onSelectPerson={setSelectedPersonId}
        activePage="dashboard"
      />

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

        {/* Top bar */}
        <div style={{
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.55)',
          padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#15203a', margin: 0 }}>
              {selectedPerson ? `${selectedPerson.full_name}'s Documents` : 'Family Dashboard'}
            </h1>
            <p style={{ fontSize: 12, color: '#8a9ab5', margin: 0, marginTop: 2 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* User menu — top right */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setUserMenuOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 12, background: userMenuOpen ? 'rgba(52,201,186,0.1)' : 'transparent', transition: 'background 0.15s' }}
            >
              {user && (
                <>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#15203a' }}>
                      {greeting()}, {user.full_name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 10, color: '#8a9ab5' }}>🇦🇪 UAE</div>
                  </div>
                  {(() => {
                    const primary = family.find(p => p.is_primary)
                    return primary ? (
                      <MemberAvatar personId={primary.id} initials={user.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()} color="#34c9ba" size={36} hasPhoto={!!primary.photo_path} editable={false} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #34c9ba33, #34c9ba55)', border: '2px solid #34c9ba44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#34c9ba' }}>
                        {user.full_name.charAt(0)}
                      </div>
                    )
                  })()}
                  <span style={{ fontSize: 10, color: '#8a9ab5' }}>▾</span>
                </>
              )}
            </div>

            {userMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 50, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(30,45,80,0.15)', border: '1px solid rgba(30,45,80,0.08)', minWidth: 180, zIndex: 50, overflow: 'hidden' }}>
                {user && (
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(30,45,80,0.06)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#15203a' }}>{user.full_name}</div>
                    <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 2 }}>{user.email}</div>
                  </div>
                )}
                <button onClick={() => { setUserMenuOpen(false); navigate('/family') }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#15203a', cursor: 'pointer' }}>👨‍👩‍👧 Family</button>
                <button onClick={() => { setUserMenuOpen(false); navigate('/documents') }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#15203a', cursor: 'pointer' }}>📄 Documents</button>
                <div style={{ height: 1, background: 'rgba(30,45,80,0.06)' }} />
                <button onClick={() => { import('../auth').then(m => m.logout()) }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#c53030', cursor: 'pointer', fontWeight: 500 }}>🚪 Sign out</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* Stat cards */}
          {summary && (
            <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
              <StatCard label="Total Documents" value={displayCounts.total} icon="📋"
                color="#15203a" bgColor="rgba(30,45,80,0.08)" borderColor="rgba(30,45,80,0.1)"
                active={statusFilter === null} onClick={() => setStatusFilter(null)} />
              <StatCard label="Expired" value={displayCounts.expired} icon="🔴"
                color="#c53030" bgColor="rgba(229,62,62,0.1)" borderColor="rgba(229,62,62,0.2)"
                active={statusFilter === 'expired'} onClick={() => setStatusFilter(f => f === 'expired' ? null : 'expired')} />
              <StatCard label="Expiring Soon" value={displayCounts.expiring_soon} icon="⚠️"
                color="#b45309" bgColor="rgba(217,119,6,0.1)" borderColor="rgba(217,119,6,0.2)"
                active={statusFilter === 'expiring_soon'} onClick={() => setStatusFilter(f => f === 'expiring_soon' ? null : 'expiring_soon')} />
              <StatCard label="Valid" value={displayCounts.valid} icon="✅"
                color="#276749" bgColor="rgba(56,161,105,0.1)" borderColor="rgba(56,161,105,0.2)"
                active={statusFilter === 'valid'} onClick={() => setStatusFilter(f => f === 'valid' ? null : 'valid')} />
            </div>
          )}

          {/* Hero card — donut chart + attention list */}
          {summary && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(21,32,58,0.9) 0%, rgba(30,45,80,0.95) 100%)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 20,
            boxShadow: '0 8px 32px rgba(30,45,80,0.2)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            gap: 28,
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,201,186,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Left — donut chart */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, flexShrink: 0 }}>
              <DonutChart
                total={displayCounts.total}
                size={140}
                thickness={20}
                segments={[
                  { value: displayCounts.expired,       color: '#e53e3e', label: 'Expired' },
                  { value: displayCounts.expiring_soon, color: '#d97706', label: 'Expiring' },
                  { value: displayCounts.valid,         color: '#38a169', label: 'Valid' },
                  { value: displayCounts.no_expiry,     color: '#718096', label: 'No expiry' },
                ]}
              />
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { color: '#e53e3e', label: 'Expired',   value: displayCounts.expired },
                  { color: '#d97706', label: 'Expiring',  value: displayCounts.expiring_soon },
                  { color: '#38a169', label: 'Valid',     value: displayCounts.valid },
                  { color: '#718096', label: 'No expiry', value: displayCounts.no_expiry },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#8fa8cc' }}>{l.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e8f0fe', marginLeft: 'auto', paddingLeft: 10 }}>{l.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

            {/* Right — attention list */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e8f0fe', margin: '0 0 4px' }}>
                {attentionDocs.length > 0 ? '⚠️ Documents Need Attention' : '✅ All Clear'}
              </h2>
              <p style={{ fontSize: 12, color: '#8fa8cc', marginBottom: 14 }}>
                {attentionDocs.length > 0
                  ? `${attentionDocs.length} document${attentionDocs.length !== 1 ? 's' : ''} require action`
                  : 'All your documents are up to date'}
              </p>

              {attentionDocs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attentionDocs.slice(0, 4).map(doc => (
                    <div key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e8f0fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: '#8fa8cc', marginTop: 2 }}>{doc.person?.full_name} · {doc.document_type?.name}</div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                        <StatusBadge status={doc.status} />
                        <div style={{ fontSize: 11, color: '#8fa8cc', marginTop: 3 }}>{daysLabel(doc.days_remaining, doc.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#34c9ba', fontSize: 13 }}>
                  🎉 All documents are in order
                </div>
              )}
            </div>
          </div>
          )}

          {/* Two column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Upcoming expiries table */}
            <div style={{
              background: 'rgba(255,255,255,0.58)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.55)',
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(30,45,80,0.08)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid rgba(30,45,80,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#15203a', margin: 0 }}>
                    {statusFilter ? STATUS_LABELS[statusFilter] : 'All Documents'}
                  </h3>
                  {statusFilter && (
                    <button onClick={() => setStatusFilter(null)} style={{ fontSize: 11, background: 'rgba(30,45,80,0.08)', border: 'none', borderRadius: 99, padding: '2px 8px', color: '#8a9ab5', cursor: 'pointer' }}>✕ clear</button>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#8a9ab5', marginTop: 2 }}>
                  {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                  {selectedPerson ? ` for ${selectedPerson.full_name}` : ' across all members'}
                </p>
              </div>

              {filteredDocs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#8a9ab5', fontSize: 13 }}>
                  No documents yet
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(30,45,80,0.03)' }}>
                        {['Document', 'Person', 'Expiry', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8a9ab5', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map((doc, i) => (
                        <tr key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)} style={{ borderTop: '1px solid rgba(30,45,80,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(30,45,80,0.015)', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,201,186,0.05)')}
                          onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(30,45,80,0.015)')}
                        >
                          <td style={{ padding: '11px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#15203a' }}>{doc.title}</div>
                            <div style={{ fontSize: 11, color: '#8a9ab5' }}>{doc.document_type?.name}</div>
                          </td>
                          <td style={{ padding: '11px 16px', color: '#4a5568' }}>{doc.person?.full_name}</td>
                          <td style={{ padding: '11px 16px', color: '#4a5568', whiteSpace: 'nowrap' }}>
                            {formatDate(doc.expiry_date)}
                            {doc.days_remaining !== null && (
                              <div style={{ fontSize: 11, color: '#8a9ab5' }}>{daysLabel(doc.days_remaining, doc.status)}</div>
                            )}
                          </td>
                          <td style={{ padding: '11px 16px' }}><StatusBadge status={doc.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Family overview */}
              <div style={{
                background: 'rgba(255,255,255,0.58)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.55)',
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(30,45,80,0.08)',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#15203a', marginBottom: 14 }}>Family Members</h3>
                {family.map(p => {
                  const memberDocs = allDocs.filter(d => d.person_id === p.id)
                  const memberExpired = memberDocs.filter(d => d.status === 'expired').length
                  const memberExpiring = memberDocs.filter(d => d.status === 'expiring_soon').length
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPersonId(selectedPersonId === p.id ? null : p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                        cursor: 'pointer',
                        background: selectedPersonId === p.id ? 'rgba(52,201,186,0.1)' : 'rgba(30,45,80,0.03)',
                        border: `1px solid ${selectedPersonId === p.id ? 'rgba(52,201,186,0.25)' : 'transparent'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <MemberAvatar
                          personId={p.id}
                          initials={p.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
                          color={RELATION_COLORS[p.relation_type] ?? '#34c9ba'}
                          size={36}
                          hasPhoto={!!p.photo_path}
                          editable={false}
                        />
                        <div style={{
                          position: 'absolute', bottom: -2, right: -3,
                          width: 14, height: 14, borderRadius: '50%',
                          background: 'white', border: '1px solid rgba(30,45,80,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 8, pointerEvents: 'none',
                        }}>
                          {RELATION_ICONS[p.relation_type] || '🙂'}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#15203a' }}>{p.full_name}</div>
                        <div style={{ fontSize: 11, color: '#8a9ab5' }}>
                          {memberDocs.length} doc{memberDocs.length !== 1 ? 's' : ''} · {p.relation_type ? formatRelationLabel(p.relation_type) : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {memberExpired > 0 && (
                          <span style={{ background: 'rgba(229,62,62,0.12)', color: '#c53030', padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                            {memberExpired} exp
                          </span>
                        )}
                        {memberExpiring > 0 && (
                          <span style={{ background: 'rgba(217,119,6,0.12)', color: '#b45309', padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                            {memberExpiring} soon
                          </span>
                        )}
                        {memberExpired === 0 && memberExpiring === 0 && memberDocs.length > 0 && (
                          <span style={{ background: 'rgba(56,161,105,0.1)', color: '#276749', padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                            ✓ ok
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Valid docs */}
              {validDocs.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.58)',
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.55)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  boxShadow: '0 4px 16px rgba(30,45,80,0.08)',
                  flex: 1,
                }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#15203a', marginBottom: 14 }}>
                    ✅ Valid Documents
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#8a9ab5', marginLeft: 8 }}>{validDocs.length}</span>
                  </h3>
                  {validDocs.map(doc => (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 0',
                      borderBottom: '1px solid rgba(30,45,80,0.05)',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#15203a' }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 1 }}>{doc.person?.full_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {doc.expiry_date && (
                          <div style={{ fontSize: 11, color: '#8a9ab5' }}>{formatDate(doc.expiry_date)}</div>
                        )}
                        {doc.days_remaining !== null && (
                          <div style={{ fontSize: 11, color: '#276749', fontWeight: 600 }}>{doc.days_remaining}d left</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
