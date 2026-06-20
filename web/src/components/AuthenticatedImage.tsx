import { useEffect, useState } from 'react'
import API_BASE from '../apiBase'

interface Props {
  fileId: number
  alt: string
  style?: React.CSSProperties
  onError?: () => void
}

export default function AuthenticatedImage({ fileId, alt, style, onError }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    const token = localStorage.getItem('ne_token')

    fetch(`${API_BASE}/api/v1/files/${fileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.blob()
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => {
        setFailed(true)
        onError?.()
      })

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId])

  if (failed) return null

  if (!blobUrl) return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,45,80,0.04)', color: '#b0bfd0', fontSize: 13 }}>
      Loading…
    </div>
  )

  return <img src={blobUrl} alt={alt} style={style} />
}
