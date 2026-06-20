import api from './api'
import type { User } from './api'

export async function login(email: string, password: string): Promise<User> {
  const r = await api.post('/auth/login', { email, password })
  localStorage.setItem('ne_token', r.data.data.token)
  return r.data.data.user
}

export async function register(email: string, password: string, full_name: string): Promise<User> {
  const r = await api.post('/auth/register', { email, password, full_name })
  localStorage.setItem('ne_token', r.data.data.token)
  return r.data.data.user
}

export function logout() {
  localStorage.removeItem('ne_token')
  window.location.href = '/login'
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('ne_token')
}

export async function fetchMe(): Promise<User> {
  const r = await api.get('/auth/me')
  return r.data.data
}
