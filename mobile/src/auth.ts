import * as SecureStore from 'expo-secure-store'
import api from './api'
import type { User } from './api'

export async function login(email: string, password: string): Promise<User> {
  const r = await api.post('/auth/login', { email, password })
  await SecureStore.setItemAsync('ne_token', r.data.data.token)
  return r.data.data.user
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('ne_token')
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('ne_token')
  return !!token
}

export async function fetchMe(): Promise<User> {
  const r = await api.get('/auth/me')
  return r.data.data
}
