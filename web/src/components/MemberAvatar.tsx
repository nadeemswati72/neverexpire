import { useEffect, useRef, useState } from 'react'
import API_BASE from '../apiBase'

interface Props {
  personId: number
  initials: string
  color: string
  size?: number
  hasPhoto: boolean
  onPhotoChange?: () => void
  editable?: boolean
}

export default function MemberAvatar({ personId, initials, color, size = 62, hasPhoto, onPhotoChange, editable = false }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImgFailed(false)
    if (!hasPhoto) { setBlobUrl(null); return }
    let url: string | null = null
    const token = localStorage.getItem('ne_token')
    fetch(`${API_BASE}/api/v1/family/${personId}/photo`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(blob => { url = URL.createObjectURL(blob); setBlobUrl(url) })
      .catch(() => setBlobUrl(null))
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [personId, hasPhoto])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const token = localStorage.getItem('ne_token')
    try {
      const r = await fetch(`${API_BASE}/api/v1/family/${personId}/photo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (r.ok) {
        // Revoke old blob and refetch
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
        const blob = await fetch(`${API_BASE}/api/v1/family/${personId}/photo`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(r2 => r2.blob())
        setBlobUrl(URL.createObjectURL(blob))
        onPhotoChange?.()
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div
      style={{ position: 'relative', width: size, height: size, flexShrink: 0, cursor: editable ? 'pointer' : 'default' }}
      onMouseEnter={() => editable && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => editable && fileRef.current?.click()}
    >
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Photo or initials */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: (blobUrl && !imgFailed) ? 'transparent' : `linear-gradient(135deg, ${color}33, ${color}55)`,
        border: `2px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size / 3, fontWeight: 800, color,
        overflow: 'hidden',
      }}>
        {(blobUrl && !imgFailed)
          ? <img src={blobUrl} alt={initials} onError={() => setImgFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (uploading ? '⏳' : initials)
        }
      </div>

      {/* Edit overlay on hover */}
      {editable && hovering && !uploading && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(15,23,42,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size / 4, color: 'white',
        }}>
          📷
        </div>
      )}
    </div>
  )
}
