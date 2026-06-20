import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Production: Railway backend. Change for local dev.
export const API_BASE = 'https://neverexpire-backend-production.up.railway.app'

const api = axios.create({ baseURL: `${API_BASE}/api/v1` })

api.interceptors.request.use(async cfg => {
  const token = await SecureStore.getItemAsync('ne_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  async err => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('ne_token')
    }
    return Promise.reject(err)
  }
)

export default api

export interface User {
  id: number
  email: string
  full_name: string
}

export interface Person {
  id: number
  full_name: string
  relation_type: string
  is_primary: boolean
  date_of_birth: string | null
  photo_path: string | null
}

export interface DocType {
  id: number
  code: string
  name: string
}

export interface DocumentBrief {
  id: number
  title: string
  document_type: DocType
  person_id: number
  person: { id: number; full_name: string } | null
  status: 'expired' | 'expiring_soon' | 'valid' | 'no_expiry'
  expiry_date: string | null
  issued_date: string | null
  days_remaining: number | null
  document_number: string | null
  source: string
}

export interface DocumentDetail extends DocumentBrief {
  issuing_authority: string | null
  holder_name: string | null
  notes: string | null
  files: Array<{ id: number; original_filename: string; mime_type: string }>
  extraction_runs: Array<{ id: number; model_name: string; confidence: string }>
}

export interface DashboardSummary {
  total: number
  expired: number
  expiring_soon: number
  valid: number
  no_expiry: number
  upcoming: DocumentBrief[]
}
