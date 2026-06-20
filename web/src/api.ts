import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ne_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ne_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Types
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

export interface DocumentType {
  id: number
  code: string
  name: string
}

export interface DocumentBrief {
  id: number
  title: string
  document_type: DocumentType
  person_id: number
  person: { id: number; full_name: string; is_primary: boolean } | null
  status: 'expired' | 'expiring_soon' | 'valid' | 'no_expiry'
  expiry_date: string | null
  days_remaining: number | null
  issued_date: string | null
  document_number: string | null
}

export interface DashboardSummary {
  total: number
  expired: number
  expiring_soon: number
  valid: number
  no_expiry: number
  upcoming: DocumentBrief[]
}
