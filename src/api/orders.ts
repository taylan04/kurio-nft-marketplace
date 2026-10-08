import { api } from './client'
import type { Order, Wallet } from '@/types/domain'

export async function createOrder(input: { walletType: Wallet['type']; idempotencyKey: string }) {
  const { data } = await api.post<Order>('/orders', { walletType: input.walletType }, {
    headers: { 'Idempotency-Key': input.idempotencyKey },
  })
  return data
}

export async function fetchOrder(id: string, signal?: AbortSignal) {
  const { data } = await api.get<Order>(`/orders/${id}`, { signal })
  return data
}
