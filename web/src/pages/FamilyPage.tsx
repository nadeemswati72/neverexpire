import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { User } from '../api'
import { fetchMe } from '../auth'
import Sidebar from '../components/Sidebar'
import MemberAvatar from '../components/MemberAvatar'
import { ShareModal } from '../components/ShareModal'

interface FamilyMember {
  id: number
  user_id: number
  full_name: string
  relation_type: string
  is_primary: boolean
  date_of_birth: string | null
  photo_path: string | null
}

interface DocSummary {
  total: number
  expired: number
  expiring_soon: number
  valid: number
}

const RELATION_TYPES = ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'DOMESTIC_HELP', 'OTHER']
const RELATION_ICONS: Record<string, string> = {
  SELF: '👤', SPOUSE: '💑', CHILD: '👶', PARENT: '👴', SIBLING: '🧑', DOMESTIC_HELP: '🧹', OTHER: '🙂',
}
const RELATION_COLORS: Record<string, string> = {
  SELF: '#34c9ba', SPOUSE: '#e879a0', CHILD: '#f6ad55',
  PARENT: '#68d391', SIBLING: '#76e4f7', DOMESTIC_HELP: '#f6a5c0', OTHER: '#b794f4',
}

function formatDOB(d: string | null) {
  if (!d) return null
  const date = new Date(d)
  const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000))
  return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${age}y`
}

function formatRelationLabel(code: string) {
  return code.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

function MemberCard({
  member, docSummary, onEdit, onDelete, onAddDoc, onShareAll, onPhotoChange, isPrimary,
}: {
  member: FamilyMember
  docSummary: DocSummary
  onEdit: (m: FamilyMember) => void
  onDelete: (m: FamilyMember) => void
  onAddDoc: (m: FamilyMember) => void
  onShareAll: (m: FamilyMember) => void
  onPhotoChange: () => void
  isPrimary: boolean
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const color = RELATION_COLORS[member.relation_type] ?? '#b794f4'
  const icon = RELATION_ICONS[member.relation_type] ?? '🙂'
  const relation = member.is_primary ? 'Self' : formatRelationLabel(member.relation_type)
  const initials = member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.6)',
      borderRadius: 18,
      padding: '20px 20px 16px',
      boxShadow: '0 4px 16px rgba(30,45,80,0.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* 3-dot menu — top right, only for non-primary */}
      {!isPrimary && (
        <div ref={menuRef} style={{ position: 'absolute', top: 14, right: 14 }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'rgba(30,45,80,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#8a9ab5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >⋮</button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 34, background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(30,45,80,0.15)', border: '1px solid rgba(30,45,80,0.08)', minWidth: 150, zIndex: 20, overflow: 'hidden' }}>
              <button onClick={() => { setMenuOpen(false); onAddDoc(member) }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#15203a', cursor: 'pointer', fontWeight: 500 }}>📄 Add Document</button>
              <div style={{ height: 1, background: 'rgba(30,45,80,0.06)' }} />
              <button onClick={() => { setMenuOpen(false); onShareAll(member) }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#22a99c', cursor: 'pointer', fontWeight: 500 }}>🔗 Share All Documents</button>
              <div style={{ height: 1, background: 'rgba(30,45,80,0.06)' }} />
              <button onClick={() => { setMenuOpen(false); onEdit(member) }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#15203a', cursor: 'pointer', fontWeight: 500 }}>✏️ Edit</button>
              <div style={{ height: 1, background: 'rgba(30,45,80,0.06)' }} />
              <button onClick={() => { setMenuOpen(false); onDelete(member) }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#c53030', cursor: 'pointer', fontWeight: 500 }}>🗑 Remove</button>
            </div>
          )}
        </div>
      )}

      {/* Photo + relation icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        {/* Avatar with relation icon badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <MemberAvatar
            personId={member.id}
            initials={initials}
            color={color}
            size={62}
            hasPhoto={!!member.photo_path}
            editable={true}
            onPhotoChange={onPhotoChange}
          />
          {/* Relation icon badge */}
          <div style={{
            position: 'absolute', bottom: -2, right: -4,
            width: 24, height: 24, borderRadius: '50%',
            background: 'white',
            border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
            boxShadow: '0 2px 6px rgba(30,45,80,0.12)',
            pointerEvents: 'none',
          }}>
            {icon}
          </div>
        </div>

        {/* Name + relation + DOB */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: isPrimary ? 0 : 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#15203a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {member.full_name}
          </div>
          <span style={{
            display: 'inline-block', marginTop: 4,
            background: `${color}22`, color, border: `1px solid ${color}44`,
            borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700,
          }}>{relation}</span>
          {member.date_of_birth && (
            <div style={{ fontSize: 11, color: '#8a9ab5', marginTop: 5 }}>
              🎂 {formatDOB(member.date_of_birth)}
            </div>
          )}
        </div>
      </div>

      {/* Doc stats — each tile navigates to filtered documents */}
      <div style={{ display: 'flex', gap: 6, borderTop: '1px solid rgba(30,45,80,0.06)', paddingTop: 14 }}>
        {[
          { label: 'Total', value: docSummary.total, color: '#4a5568', bg: 'rgba(30,45,80,0.06)', status: '' },
          { label: 'Expired', value: docSummary.expired, color: '#c53030', bg: 'rgba(229,62,62,0.08)', status: 'expired' },
          { label: 'Expiring', value: docSummary.expiring_soon, color: '#b45309', bg: 'rgba(217,119,6,0.08)', status: 'expiring_soon' },
          { label: 'Valid', value: docSummary.valid, color: '#276749', bg: 'rgba(56,161,105,0.08)', status: 'valid' },
        ].map(s => (
          <div
            key={s.label}
            onClick={() => navigate(`/documents?person_id=${member.id}${s.status ? `&status=${s.status}` : ''}`)}
            style={{ flex: 1, background: s.bg, borderRadius: 8, padding: '8px 4px', textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#8a9ab5', fontWeight: 600, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface FormState {
  full_name: string
  relation_type: string
  date_of_birth: string
}

function MemberModal({
  member, onSave, onClose, saving,
}: {
  member: FamilyMember | null
  onSave: (data: FormState) => void
  onClose: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<FormState>({
    full_name: member?.full_name ?? '',
    relation_type: member?.relation_type ?? 'CHILD',
    date_of_birth: member?.date_of_birth ?? '',
  })

  const isEdit = !!member
  const inp = (field: keyof FormState) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value })),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(30,45,80,0.2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#15203a', marginBottom: 6 }}>
          {isEdit ? 'Edit Family Member' : 'Add Family Member'}
        </h2>
        <p style={{ fontSize: 13, color: '#8a9ab5', marginBottom: 24 }}>
          {isEdit ? 'Update the details below.' : 'Fill in the details to add a new family member.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4a5568', marginBottom: 6 }}>Full Name *</label>
            <input {...inp('full_name')} placeholder="e.g. Sarah Johnson" style={{ width: '100%', background: 'rgba(30,45,80,0.04)', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#15203a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4a5568', marginBottom: 6 }}>Relation</label>
            <select {...inp('relation_type')} style={{ width: '100%', background: 'rgba(30,45,80,0.04)', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#15203a', outline: 'none', cursor: 'pointer' }}>
              {RELATION_TYPES.map(r => (
                <option key={r} value={r}>{formatRelationLabel(r)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4a5568', marginBottom: 6 }}>Date of Birth <span style={{ color: '#b0bfd0', fontWeight: 400 }}>(optional)</span></label>
            <input type="date" {...inp('date_of_birth')} style={{ width: '100%', background: 'rgba(30,45,80,0.04)', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#15203a', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 28 }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, padding: '10px 20px', fontSize: 14, color: '#4a5568', cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.full_name.trim()}
            style={{ background: saving ? '#8a9ab5' : 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 12px rgba(52,201,186,0.35)' }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FamilyPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<FamilyMember | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [sharingMember, setSharingMember] = useState<FamilyMember | null>(null)

  function loadData() {
    return Promise.all([fetchMe(), api.get('/family'), api.get('/documents')])
      .then(([me, fam, docs]) => {
        setUser(me)
        setFamily(fam.data.data)
        setAllDocs(docs.data.data)
      })
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  function docSummaryFor(personId: number): DocSummary {
    const docs = allDocs.filter(d => d.person_id === personId)
    return {
      total: docs.length,
      expired: docs.filter(d => d.status === 'expired').length,
      expiring_soon: docs.filter(d => d.status === 'expiring_soon').length,
      valid: docs.filter(d => d.status === 'valid' || d.status === 'no_expiry').length,
    }
  }

  async function handleSave(form: FormState) {
    setSaving(true)
    try {
      if (editingMember) {
        await api.put(`/family/${editingMember.id}`, {
          full_name: form.full_name.trim(),
          date_of_birth: form.date_of_birth || null,
          relation_type: form.relation_type,
        })
      } else {
        await api.post('/family', {
          full_name: form.full_name.trim(),
          relation_type: form.relation_type,
          date_of_birth: form.date_of_birth || null,
        })
      }
      await loadData()
      setShowModal(false)
      setEditingMember(null)
    } finally { setSaving(false) }
  }

  async function handleDelete(member: FamilyMember) {
    setDeleting(true)
    try {
      await api.delete(`/family/${member.id}`)
      await loadData()
      setDeleteConfirm(null)
    } finally { setDeleting(false) }
  }

  const primaryMember = family.find(m => m.is_primary)


  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 240, background: 'rgba(255,255,255,0.52)' }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 32 }}>👨‍👩‍👧</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={family} selectedPersonId={null} onSelectPerson={id => id && navigate(`/documents?person_id=${id}`)} activePage="family" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.55)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#15203a', margin: 0 }}>Family Members</h1>
            <p style={{ fontSize: 12, color: '#8a9ab5', margin: 0, marginTop: 2 }}>{family.length} member{family.length !== 1 ? 's' : ''} · manage your family profile</p>
          </div>
          <button
            onClick={() => { setEditingMember(null); setShowModal(true) }}
            style={{ background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(52,201,186,0.35)' }}
          >
            + Add Member
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* Summary strip */}
          <div style={{ background: 'linear-gradient(135deg, rgba(21,32,58,0.9), rgba(30,45,80,0.95))', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,201,186,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 40 }}>👨‍👩‍👧</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e8f0fe' }}>{family.length} Family Member{family.length !== 1 ? 's' : ''}</div>
              <div style={{ fontSize: 13, color: '#8fa8cc', marginTop: 4 }}>
                {allDocs.length} total documents · {allDocs.filter(d => d.status === 'expired').length} expired · {allDocs.filter(d => d.status === 'expiring_soon').length} expiring soon
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#8fa8cc', marginBottom: 4 }}>Primary account</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#34c9ba' }}>{primaryMember?.full_name ?? '—'}</div>
            </div>
          </div>

          {/* Member grid */}
          {family.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.55)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#15203a' }}>No family members yet</div>
              <div style={{ fontSize: 13, color: '#8a9ab5', marginTop: 6 }}>Add your spouse, children, or parents to track their documents too</div>
              <button onClick={() => { setEditingMember(null); setShowModal(true) }} style={{ marginTop: 16, background: 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                + Add First Member
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {family.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  docSummary={docSummaryFor(member.id)}
                  isPrimary={member.is_primary}
                  onEdit={m => { setEditingMember(m); setShowModal(true) }}
                  onDelete={m => setDeleteConfirm(m)}
                  onAddDoc={m => navigate(`/documents/add?person_id=${m.id}`)}
                  onShareAll={m => setSharingMember(m)}
                  onPhotoChange={loadData}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <MemberModal
          member={editingMember}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingMember(null) }}
          saving={saving}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 20, padding: '32px 36px', maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(30,45,80,0.2)' }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#15203a', textAlign: 'center', marginBottom: 8 }}>Remove {deleteConfirm.full_name}?</h2>
            <p style={{ fontSize: 13, color: '#8a9ab5', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              This will deactivate their profile. Their documents will remain in the system but will no longer appear in your dashboard.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: 'none', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, padding: '10px 22px', fontSize: 14, color: '#4a5568', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} style={{ background: deleting ? '#8a9ab5' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {deleting ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share all documents modal */}
      {sharingMember && (
        <ShareModal
          personId={sharingMember.id}
          personName={sharingMember.full_name}
          isOpen={true}
          onClose={() => setSharingMember(null)}
          onShareSuccess={() => setSharingMember(null)}
        />
      )}
    </div>
  )
}
