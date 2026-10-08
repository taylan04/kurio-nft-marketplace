import { api } from './client'
import type { Session } from '@/types/domain'

export async function fetchSession(signal?: AbortSignal) {
  const { data } = await api.get<Session>('/auth/session', { signal })
  return data
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<Session>('/auth/login', input)
  return data
}

export async function register(input: { username: string; email: string; password: string }) {
  const { data } = await api.post<Session>('/auth/register', input)
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}
