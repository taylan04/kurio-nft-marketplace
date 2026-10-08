import axios from 'axios'
import { getGuestId, getToken, setToken } from '@/lib/session'

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

api.interceptors.response.use((response) => response, (reason: unknown) => {
  if (axios.isAxiosError(reason) && reason.response?.status === 401) {
    const url = reason.config?.url || ''
    const currentToken = getToken()
    // A delayed response from a previous user must not log out the new user.
    const requestToken = reason.config?.headers?.get('authorization')
    if (currentToken && requestToken === `Bearer ${currentToken}` && !/\/auth\/(login|register)$/.test(url)) {
      setToken()
      window.dispatchEvent(new Event('kurio:session-expired'))
    }
  }
  return Promise.reject(reason)
})
