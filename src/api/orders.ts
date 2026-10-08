import { api } from './client'
import type { CartItem, Order, Quote, Wallet } from '@/types/domain'

export async function createOrder(input: { walletType: Wallet['type']; expectedQuote: Quote; expectedItems: CartItem[]; idempotencyKey: string }) {
  const { data } = await api.post<Order>('/orders', {
    walletType: input.walletType, expectedQuote: input.expectedQuote, expectedItems: input.expectedItems,
  }, {
    headers: { 'Idempotency-Key': input.idempotencyKey },
  })
  return data
}

export async function fetchOrderByKey(key: string) {
  const { data } = await api.get<Order>(`/orders/by-key/${encodeURIComponent(key)}`)
  return data
}

export async function fetchOrder(id: string, signal?: AbortSignal) {
  const { data } = await api.get<Order>(`/orders/${id}`, { signal })
  return data
}
