import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { Person, User } from '../api'
import { fetchMe } from '../auth'
import AiExtractingAnimation from '../components/AiExtractingAnimation'
import Sidebar from '../components/Sidebar'

interface DocType { id: number; code: string; name: string }
interface Extraction {
  document_type: string | null
  title: string | null
  issued_date: string | null
  expiry_date: string | null
  document_number: string | null
  issuing_authority: string | null
  holder_name: string | null
  notes: string | null
  confidence: string | null
}

type Step = 'choose' | 'upload' | 'preview' | 'manual'

export default function AddDocumentPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('choose')
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Person[]>([])
  const [docTypes, setDocTypes] = useState<DocType[]>([])

  // Upload + extraction state
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extraction, setExtraction] = useState<Extraction | null>(null)
  const [extractError, setExtractError] = useState('')

  // Form fields
  const [personId, setPersonId] = useState<number | ''>('')
  const [docTypeCode, setDocTypeCode] = useState('OTHER')
  const [title, setTitle] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [issuingAuthority, setIssuingAuthority] = useState('')
  const [holderName, setHolderName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchMe(), api.get('/family'), api.get('/document-types')]).then(([me, f, dt]) => {
      setUser(me)
      setFamily(f.data.data)
      setDocTypes(dt.data.data)
      if (f.data.data.length > 0) setPersonId(f.data.data[0].id)
    })
  }, [])

  function fillFromExtraction(e: Extraction) {
    if (e.title) setTitle(e.title)
    if (e.document_number) setDocNumber(e.document_number)
    if (e.issued_date) setIssuedDate(e.issued_date)
    if (e.expiry_date) setExpiryDate(e.expiry_date)
    if (e.issuing_authority) setIssuingAuthority(e.issuing_authority)
    if (e.holder_name) setHolderName(e.holder_name)
    if (e.notes) setNotes(e.notes)
    const matched = docTypes.find(d => d.code === e.document_type || d.name?.toLowerCase() === e.document_type?.toLowerCase())
    if (matched) setDocTypeCode(matched.code)
  }

  async function handleFileUpload(f: File) {
    setFile(f)
    setExtracting(true)
    setExtractError('')
    const fd = new FormData()
    fd.append('file', f)
    try {
      const r = await api.post('/documents/extract', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setExtraction(r.data.data)
      fillFromExtraction(r.data.data)
      setStep('preview')
    } catch (e: any) {
      setExtractError(e.response?.data?.error || 'Extraction failed. You can fill in details manually.')
      setStep('preview')
    } finally { setExtracting(false) }
  }

  async function handleSave() {
    if (!personId || !title) { setError('Person and title are required.'); return }
    setSaving(true)
    setError('')
    try {
      let r
      if (file && extraction) {
        // AI flow: send file + confirmed fields together so source = ai_extracted
        const fd = new FormData()
        fd.append('file', file)
        fd.append('person_id', String(personId))
        fd.append('document_type_code', docTypeCode)
        fd.append('title', title)
        if (docNumber) fd.append('document_number', docNumber)
        if (issuedDate) fd.append('issued_date', issuedDate)
        if (expiryDate) fd.append('expiry_date', expiryDate)
        if (issuingAuthority) fd.append('issuing_authority', issuingAuthority)
        if (holderName) fd.append('holder_name', holderName)
        if (notes) fd.append('notes', notes)
        r = await api.post('/documents/upload-and-create', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        // Manual flow
        r = await api.post('/documents', {
          person_id: personId,
          document_type_code: docTypeCode,
          title,
          document_number: docNumber || null,
          issued_date: issuedDate || null,
          expiry_date: expiryDate || null,
          issuing_authority: issuingAuthority || null,
          holder_name: holderName || null,
          notes: notes || null,
        })
      }
      navigate(`/documents/${r.data.data.id}`)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save document.')
    } finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,45,80,0.12)',
    borderRadius: 9, padding: '9px 12px', fontSize: 14, color: '#15203a', outline: 'none',
  }
  const labelStyle = { display: 'block' as const, fontSize: 12, fontWeight: 700 as const, color: '#4a5568', marginBottom: 5 }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} family={family} selectedPersonId={null} onSelectPerson={() => navigate('/documents')} activePage="documents" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <button onClick={() => navigate('/documents')} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: '#4a5568', cursor: 'pointer', marginBottom: 20 }}>
          ← Back to Documents
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#15203a', marginBottom: 4 }}>Add Document</h1>
        <p style={{ fontSize: 13, color: '#8a9ab5', marginBottom: 24 }}>Upload a document for AI extraction or fill in details manually.</p>

        {/* Step: choose */}
        {step === 'choose' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <button
              onClick={() => setStep('upload')}
              style={{ background: 'linear-gradient(135deg, rgba(21,32,58,0.9), rgba(30,45,80,0.95))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 20px', cursor: 'pointer', textAlign: 'left', color: 'white' }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>AI Extraction</div>
              <div style={{ fontSize: 12, color: '#8fa8cc', marginTop: 6, lineHeight: 1.5 }}>Upload a photo or scan — Claude reads the document and fills in the details automatically.</div>
              <div style={{ marginTop: 14, display: 'inline-block', background: 'rgba(52,201,186,0.2)', border: '1px solid rgba(52,201,186,0.3)', borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#34c9ba' }}>Recommended</div>
            </button>

            <button
              onClick={() => setStep('manual')}
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: '28px 20px', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>✏️</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#15203a' }}>Manual Entry</div>
              <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 6, lineHeight: 1.5 }}>Fill in document details yourself. Good for documents without a physical copy.</div>
            </button>
          </div>
        )}

        {/* Step: upload */}
        {step === 'upload' && (
          <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: 32 }}>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]) }} />

            {extracting ? (
              <AiExtractingAnimation filename={file?.name} />
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed rgba(52,201,186,0.4)', borderRadius: 14, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#34c9ba')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(52,201,186,0.4)')}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📎</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#15203a' }}>Click to upload document</div>
                <div style={{ fontSize: 13, color: '#8a9ab5', marginTop: 6 }}>JPG, PNG, PDF supported · Max 16MB</div>
              </div>
            )}

            <button onClick={() => setStep('choose')} style={{ marginTop: 16, background: 'none', border: 'none', color: '#8a9ab5', fontSize: 13, cursor: 'pointer' }}>← Back</button>
          </div>
        )}

        {/* Step: preview (after extraction) or manual */}
        {(step === 'preview' || step === 'manual') && (
          <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: '28px 32px' }}>

            {step === 'preview' && extraction && (
              <div style={{ background: 'rgba(52,201,186,0.08)', border: '1px solid rgba(52,201,186,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#15203a' }}>AI extraction complete</div>
                  <div style={{ fontSize: 12, color: '#8a9ab5' }}>Confidence: {extraction.confidence ?? 'medium'} · Review and confirm the details below</div>
                </div>
              </div>
            )}

            {extractError && (
              <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#b45309' }}>
                ⚠️ {extractError} — fill in details below manually.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Family Member *</label>
                <select value={personId} onChange={e => setPersonId(Number(e.target.value))} style={inputStyle}>
                  {family.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Document Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Alice Passport" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Document Type</label>
                <select value={docTypeCode} onChange={e => setDocTypeCode(e.target.value)} style={inputStyle}>
                  {docTypes.map(dt => <option key={dt.code} value={dt.code}>{dt.name}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Document Number</label>
                <input value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="e.g. A12345678" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Issued Date</label>
                <input type="date" value={issuedDate} onChange={e => setIssuedDate(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Expiry Date</label>
                <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Issuing Authority</label>
                <input value={issuingAuthority} onChange={e => setIssuingAuthority(e.target.value)} placeholder="e.g. UAE Ministry of Interior" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Holder Name</label>
                <input value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="Name on document" style={inputStyle} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any additional notes…" style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 16, background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c53030' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setStep('choose')} style={{ background: 'none', border: '1px solid rgba(30,45,80,0.15)', borderRadius: 10, padding: '9px 20px', fontSize: 13, color: '#4a5568', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#8a9ab5' : 'linear-gradient(135deg, #34c9ba, #22a99c)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 24px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 12px rgba(52,201,186,0.35)' }}>
                {saving ? 'Saving…' : '✓ Save Document'}
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
