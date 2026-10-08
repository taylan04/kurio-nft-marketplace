import { api } from './client'
import type { User, Wallet } from '@/types/domain' 

export async function fetchProfile(signal?: AbortSignal) {
  const { data } = await api.get<User>('/profile', { signal })
  return data
}

export async function updateProfile(input: Partial<User>) {
  const { data } = await api.patch<User>('/profile', input)
  return data
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  await api.post('/profile/password', input)
}

export async function fetchWallets(signal?: AbortSignal) {
  const { data } = await api.get<Wallet[]>('/wallets', { signal })
  return data
}

export async function saveWallet(input: Omit<Wallet, 'id' | 'userId'> & { id?: string }) {
  const { data } = await api.post<Wallet>('/wallets', input)
  return data
}
