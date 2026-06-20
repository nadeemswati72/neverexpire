import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { DocumentBrief, Person } from '../api'
import StatusBadge from '../components/StatusBadge'
import Sidebar from '../components/Sidebar'
import { fetchMe } from '../auth'
import type { User } from '../api'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'expired', label: 'Expired' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'valid', label: 'Valid' },
  { value: 'no_expiry', label: 'No Expiry' },
]

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLabel(days: number | null, status: string) {
  if (days === null) return null
  if (status === 'expired') return `${Math.abs(days)}d ago`
  return `${days}d left`
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Person[]>([])
  const [docs, setDocs] = useState<DocumentBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [personFilter, setPersonFilter] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([fetchMe(), api.get('/family'), api.get('/documents')])
      .then(([me, fam, d]) => {
        setUser(me)
        setFamily(fam.data.data)
        setDocs(d.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false
    if (personFilter && d.person_id !== personFilter) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !(d.person?.full_name ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dde4f0 0%, #c8d3e8 100%)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 32 }}>📄</div><div style={{ color: '#4a5568', fontSize: 15, marginTop: 12 }}>Loading documents…</div></div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={family} selectedPersonId={personFilter} onSelectPerson={setPersonFilter} activePage="documents" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.55)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#15203a', margin: 0 }}>Documents</h1>
            <p style={{ fontSize: 12, color: '#8a9ab5', margin: 0, marginTop: 2 }}>{filtered.length} of {docs.length} documents</p>
          </div>
          <button onClick={() => navigate('/documents/add')} style={{ background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(52,201,186,0.35)' }}>
            + Add Document
          </button>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input
              placeholder="Search documents or people…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#15203a', outline: 'none' }}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#15203a', outline: 'none', cursor: 'pointer' }}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Document cards */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.55)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#15203a' }}>No documents found</div>
              <div style={{ fontSize: 13, color: '#8a9ab5', marginTop: 6 }}>Try adjusting your filters or add a new document</div>
              <button onClick={() => navigate('/documents/add')} style={{ marginTop: 16, background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                + Add Document
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 2px 10px rgba(30,45,80,0.06)', transition: 'transform 0.1s, box-shadow 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(30,45,80,0.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(30,45,80,0.06)' }}
                >
                  {/* Type icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: doc.status === 'expired' ? 'rgba(229,62,62,0.1)' : doc.status === 'expiring_soon' ? 'rgba(217,119,6,0.1)' : 'rgba(52,201,186,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {DOC_ICON[doc.document_type?.code] ?? '📄'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#15203a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 2 }}>
                      {doc.person?.full_name ?? '—'} · {doc.document_type?.name ?? '—'}
                      {doc.document_number && <span style={{ marginLeft: 8, color: '#b0bfd0' }}>#{doc.document_number}</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <StatusBadge status={doc.status} />
                    <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 4 }}>
                      {doc.expiry_date ? formatDate(doc.expiry_date) : 'No expiry'}
                    </div>
                    {doc.days_remaining !== null && (
                      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 1, color: doc.status === 'expired' ? '#c53030' : doc.status === 'expiring_soon' ? '#b45309' : '#276749' }}>
                        {daysLabel(doc.days_remaining, doc.status)}
                      </div>
                    )}
                  </div>

                  <div style={{ color: '#b0bfd0', fontSize: 16, marginLeft: 4 }}>›</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DOC_ICON: Record<string, string> = {
  PASSPORT: '🛂', VISA: '✈️', DRIVING_LICENSE: '🚗', VEHICLE_REGISTRATION: '🚙',
  HEALTH_INSURANCE: '🏥', INSURANCE: '🛡️', WARRANTY: '🔧', MEDICATION: '💊',
  FOOD_ITEM: '🥫', CERTIFICATE: '🎓', SUBSCRIPTION: '📱', OTHER: '📄',
}
