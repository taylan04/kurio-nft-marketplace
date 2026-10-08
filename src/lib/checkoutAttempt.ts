import type { CartItem, CollectorDetails, Quote, Wallet } from '@/types/domain'
import { newIdempotencyKey } from './idempotency'

const KEY = 'kurio-checkout-attempt-v1'

export interface CheckoutAttempt {
  key: string
  userId: string
  walletType: Wallet['type']
  expectedQuote: Quote
  expectedItems: CartItem[]
  collector: CollectorDetails
}

export function readCheckoutAttempt(userId: string): CheckoutAttempt | undefined {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return
    const attempt = JSON.parse(raw) as CheckoutAttempt
    return attempt.userId === userId ? attempt : undefined
  } catch {
    return undefined
  }
}

export function createCheckoutAttempt(userId: string, walletType: Wallet['type'], quote: Quote, items: CartItem[], collector: CollectorDetails) {
  const existing = readCheckoutAttempt(userId)
  if (existing && existing.walletType === walletType &&
      JSON.stringify(existing.expectedQuote) === JSON.stringify(quote) &&
      JSON.stringify(existing.expectedItems) === JSON.stringify(items) &&
      JSON.stringify(existing.collector) === JSON.stringify(collector)) return existing
  const attempt: CheckoutAttempt = { key: newIdempotencyKey(), userId, walletType, expectedQuote: quote, expectedItems: items, collector: structuredClone(collector) }
  sessionStorage.setItem(KEY, JSON.stringify(attempt))
  return attempt
}

export function clearCheckoutAttempt() {
  sessionStorage.removeItem(KEY)
}
