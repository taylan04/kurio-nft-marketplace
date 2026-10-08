import { api } from './client'
import type { Cart, Edition } from '@/types/domain'

export async function fetchCart(signal?: AbortSignal) {
  const { data } = await api.get<Cart>('/cart', { signal })
  return data
}

export async function addCartItem(input: { nftId: string; edition: Edition; quantity: number }) {
  const { data } = await api.post<Cart>('/cart/items', input)
  return data
}

export async function updateCartItem(nftId: string, input: { edition: Edition; quantity: number }) {
  const { data } = await api.patch<Cart>(`/cart/items/${nftId}`, input)
  return data
}

export async function removeCartItem(nftId: string) {
  const { data } = await api.delete<Cart>(`/cart/items/${nftId}`)
  return data
}

export async function applyCoupon(coupon?: string) {
  const { data } = await api.post<Cart>('/quote', { coupon })
  return data
}

export async function validateQuote(signal?: AbortSignal) {
  const { data } = await api.get<Cart>('/quote', { signal })
  return data
}
