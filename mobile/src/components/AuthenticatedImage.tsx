import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, View, type StyleProp, type ImageStyle } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { API_BASE } from '../api'

interface Props {
  path: string       // e.g. "/api/v1/files/3" or "/api/v1/family/2/photo"
  style?: StyleProp<ImageStyle>
  fallback?: React.ReactNode
}

// Downloads a JWT-protected image to a local base64 data URI.
// Can't use <Image src> with custom headers in React Native, so we
// fetch the bytes ourselves and hand back a data: URI.
export default function AuthenticatedImage({ path, style, fallback }: Props) {
  const [dataUri, setDataUri] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = await SecureStore.getItemAsync('ne_token')
        const url = `${API_BASE}${path}`
        const resp = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!resp.ok) throw new Error(`${resp.status}`)
        const blob = await resp.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          if (!cancelled) setDataUri(reader.result as string)
        }
        reader.readAsDataURL(blob)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [path])

  if (failed) return <>{fallback ?? null}</>
  if (!dataUri) return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style as any]}>
      <ActivityIndicator size="small" color="#34c9ba" />
    </View>
  )
  return <Image source={{ uri: dataUri }} style={style} />
}
