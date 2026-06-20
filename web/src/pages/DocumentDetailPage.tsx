import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import type { Person, User } from '../api'
import StatusBadge from '../components/StatusBadge'
import Sidebar from '../components/Sidebar'
import AuthenticatedImage from '../components/AuthenticatedImage'
import { fetchMe } from '../auth'

interface DocFile {
  id: number
  original_filename: string
  file_path: string
  created_at: string
}

interface DocumentDetail {
  id: number
  title: string
  document_type: { id: number; code: string; name: string }
  person: { id: number; full_name: string } | null
  person_id: number
  status: string
  expiry_date: string | null
  issued_date: string | null
  days_remaining: number | null
  document_number: string | null
  issuing_authority: string | null
  holder_name: string | null
  notes: string | null
  source: string
  files: DocFile[]
  extraction_runs: Array<{ id: number; model_name: string; confidence: string; created_at: string }>
  created_at: string
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function Field({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8a9ab5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: highlight ?? (value ? '#15203a' : '#b0bfd0'), fontWeight: value ? 500 : 400 }}>{value || '—'}</div>
    </div>
  )
}

const STATUS_COLOR: Record<string, string> = {
  expired: '#c53030', expiring_soon: '#b45309', valid: '#276749', no_expiry: '#4a5568'
}

function FilePreview({ file }: { file: DocFile }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.original_filename || '')
  const fileUrl = `/api/v1/files/${file.id}`
  if (isImage) {
    return (
      <AuthenticatedImage
        fileId={file.id}
        alt={file.original_filename}
        style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'contain', background: '#f0f4fa' }}
      />
    )
  }
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
      <div style={{ fontSize: 13, color: '#4a5568', fontWeight: 600 }}>{file.original_filename}</div>
      <a href={fileUrl} download={file.original_filename} style={{ display: 'inline-block', marginTop: 12, background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>⬇ Download</a>
    </div>
  )
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Person[]>([])
  const [doc, setDoc] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editExpiry, setEditExpiry] = useState('')
  const [editIssued, setEditIssued] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [previewFile, setPreviewFile] = useState<DocFile | null>(null)

  useEffect(() => {
    Promise.all([
      fetchMe(),
      api.get('/family'),
      api.get(`/documents/${id}`),
    ]).then(([me, fam, d]) => {
      setUser(me)
      setFamily(fam.data.data)
      const docData = d.data.data
      setDoc(docData)
      setEditTitle(docData.title)
      setEditExpiry(docData.expiry_date ?? '')
      setEditIssued(docData.issued_date ?? '')
      setEditNotes(docData.notes ?? '')
      if (docData.files?.length > 0) setPreviewFile(docData.files[0])
    }).catch(() => navigate('/documents')).finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    if (!doc) return
    setSaving(true)
    try {
      const r = await api.put(`/documents/${doc.id}`, {
        title: editTitle,
        issued_date: editIssued || null,
        expiry_date: editExpiry || null,
        notes: editNotes || null,
      })
      setDoc(r.data.data)
      setEditing(false)
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!doc || !window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await api.delete(`/documents/${doc.id}`)
    navigate('/documents')
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 240, background: 'rgba(255,255,255,0.52)', backdropFilter: 'blur(20px)' }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 32 }}>📄</div>
      </div>
    </div>
  )
  if (!doc) return null

  const statusColor = STATUS_COLOR[doc.status] ?? '#4a5568'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={family} selectedPersonId={doc.person_id ?? null} onSelectPerson={() => navigate('/documents')} activePage="documents" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => navigate('/documents')} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(30,45,80,0.1)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#4a5568', cursor: 'pointer' }}>← Documents</button>
          <div style={{ flex: 1 }}>
            {editing
              ? <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: 16, fontWeight: 700, color: '#15203a', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(52,201,186,0.4)', borderRadius: 7, padding: '4px 10px', width: 320, outline: 'none' }} />
              : <span style={{ fontSize: 16, fontWeight: 700, color: '#15203a' }}>{doc.title}</span>
            }
          </div>
          <StatusBadge status={doc.status} />
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,45,80,0.12)', borderRadius: 8, padding: '7px 16px', fontSize: 13, color: '#4a5568', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button onClick={handleDelete} disabled={deleting} style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: '#c53030', cursor: 'pointer' }}>
                  {deleting ? 'Deleting…' : '🗑 Delete'}
                </button>
                <button onClick={() => setEditing(true)} style={{ background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* Hero dark card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(21,32,58,0.92) 0%, rgba(30,45,80,0.96) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '24px 28px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,201,186,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: '#8fa8cc', marginBottom: 4 }}>{doc.person?.full_name} · {doc.document_type?.name}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#e8f0fe' }}>{doc.title}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={doc.status} />
                {doc.days_remaining !== null && (
                  <div style={{ fontSize: 28, fontWeight: 800, color: statusColor, marginTop: 6 }}>
                    {doc.status === 'expired' ? `${Math.abs(doc.days_remaining)}d ago` : `${doc.days_remaining}d left`}
                  </div>
                )}
              </div>
            </div>
            {/* Date strip */}
            <div style={{ display: 'flex', gap: 32, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa8cc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issued</div>
                {editing
                  ? <input type="date" value={editIssued} onChange={e => setEditIssued(e.target.value)} style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 8px', color: '#e8f0fe', outline: 'none', marginTop: 4 }} />
                  : <div style={{ fontSize: 15, color: '#e8f0fe', fontWeight: 600, marginTop: 4 }}>{formatDate(doc.issued_date)}</div>
                }
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa8cc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expires</div>
                {editing
                  ? <input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)} style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 8px', color: '#e8f0fe', outline: 'none', marginTop: 4 }} />
                  : <div style={{ fontSize: 15, color: statusColor, fontWeight: 700, marginTop: 4 }}>{formatDate(doc.expiry_date)}</div>
                }
              </div>
              {doc.document_number && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa8cc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Document No.</div>
                  <div style={{ fontSize: 15, color: '#e8f0fe', fontWeight: 600, marginTop: 4, fontFamily: 'monospace' }}>{doc.document_number}</div>
                </div>
              )}
            </div>
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: previewFile ? '1fr 340px' : '1fr', gap: 16 }}>

            {/* Left: details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Document details */}
              <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: '22px 24px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#15203a', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(30,45,80,0.07)' }}>Document Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <Field label="Issued Date" value={formatDate(doc.issued_date)} />
                  <Field label="Expiry Date" value={formatDate(doc.expiry_date)} highlight={statusColor} />
                  <Field label="Document Number" value={doc.document_number} />
                  <Field label="Issuing Authority" value={doc.issuing_authority} />
                  <Field label="Holder Name" value={doc.holder_name} />
                  <Field label="Source" value={doc.source === 'ai_extracted' ? '🤖 AI Extracted' : '✏️ Manual Entry'} />
                </div>
              </div>

              {/* Notes + AI */}
              <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: '22px 24px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#15203a', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(30,45,80,0.07)' }}>Notes</h3>
                {editing
                  ? <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={4} style={{ width: '100%', background: 'rgba(30,45,80,0.04)', border: '1px solid rgba(30,45,80,0.12)', borderRadius: 8, padding: '10px', fontSize: 13, color: '#15203a', outline: 'none', resize: 'none' }} placeholder="Add notes…" />
                  : <div style={{ fontSize: 14, color: doc.notes ? '#15203a' : '#b0bfd0', lineHeight: 1.6 }}>{doc.notes || 'No notes added'}</div>
                }
                {doc.extraction_runs?.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(30,45,80,0.07)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8a9ab5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>AI Extraction</div>
                    {doc.extraction_runs.map(r => (
                      <div key={r.id} style={{ display: 'flex', gap: 12, fontSize: 12, color: '#4a5568' }}>
                        <span style={{ background: 'rgba(52,201,186,0.1)', color: '#22a99c', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>{r.model_name}</span>
                        <span>Confidence: <strong>{r.confidence}</strong></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: file preview */}
            {previewFile && (
              <div>
                <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 80 }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(30,45,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#15203a' }}>📎 Document Preview</div>
                      <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 2 }}>Watermarked copy</div>
                    </div>
                    {doc.files.length > 1 && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {doc.files.map((f, i) => (
                          <button key={f.id} onClick={() => setPreviewFile(f)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: previewFile.id === f.id ? '#34c9ba' : 'rgba(30,45,80,0.15)', cursor: 'pointer', padding: 0 }} />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Preview image */}
                  <FilePreview file={previewFile} />
                  <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(30,45,80,0.07)', fontSize: 11, color: '#8a9ab5', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🔒</span> For NeverExpire use only · Watermarked
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
