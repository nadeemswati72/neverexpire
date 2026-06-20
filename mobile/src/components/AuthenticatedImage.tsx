import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, View, type StyleProp, type ImageStyle } from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import { API_BASE } from '../api'

interface Props {
  path: string       // e.g. "/api/v1/files/3" or "/api/v1/family/2/photo"
  style?: StyleProp<ImageStyle>
  fallback?: React.ReactNode
}

export default function AuthenticatedImage({ path, style, fallback }: Props) {
  const [localUri, setLocalUri] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = await SecureStore.getItemAsync('ne_token')
        const url = `${API_BASE}${path}`
        const dest = `${FileSystem.cacheDirectory}${encodeURIComponent(path).replace(/[^a-z0-9]/gi, '_')}`
        const result = await FileSystem.downloadAsync(url, dest, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!cancelled) setLocalUri(result.uri)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [path])

  if (failed) return <>{fallback ?? null}</>
  if (!localUri) return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style as any]}>
      <ActivityIndicator size="small" color="#34c9ba" />
    </View>
  )
  return <Image source={{ uri: localUri }} style={style} />
}
