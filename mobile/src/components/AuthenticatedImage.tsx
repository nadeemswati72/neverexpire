import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, View, type StyleProp, type ImageStyle } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { API_BASE } from '../api'

interface Props {
  path: string
  style?: StyleProp<ImageStyle>
  fallback?: React.ReactNode
}

// Downloads JWT-protected image using fetch + FileReader (blob → data URI).
// Works on both iOS and Android in Expo Go managed workflow.
export default function AuthenticatedImage({ path, style, fallback }: Props) {
  const [uri, setUri] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = await SecureStore.getItemAsync('ne_token')
        const resp = await fetch(`${API_BASE}${path}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!resp.ok) throw new Error(`${resp.status}`)

        // Convert blob to base64 data URI — most reliable approach in RN
        const blob = await resp.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === 'string') {
            setUri(reader.result)
          }
        }
        reader.onerror = () => { if (!cancelled) setFailed(true) }
        reader.readAsDataURL(blob)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [path])

  if (failed) return <>{fallback ?? null}</>

  if (!uri) return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', minHeight: 100 }, style as any]}>
      <ActivityIndicator size="large" color="#34c9ba" />
    </View>
  )

  return <Image source={{ uri }} style={style} resizeMode="contain" />
}
