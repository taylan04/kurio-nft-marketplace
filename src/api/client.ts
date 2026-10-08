import axios from 'axios'
import { getGuestId, getToken } from '@/lib/session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 8_000,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  config.headers.set('x-guest-id', getGuestId())
  if (token) config.headers.set('authorization', `Bearer ${token}`)
  return config
})
