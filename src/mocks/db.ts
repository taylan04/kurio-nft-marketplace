import type { CartItem, NFT, Order, User, Wallet } from '@/types/domain'
import { nftFixtures, userFixtures, walletFixtures } from './fixtures'

export interface MockUser extends User {
  passwordHash: string
  passwordSalt: string
}

export interface MockDb {
  nfts: NFT[]
  users: MockUser[]
  wallets: Wallet[]
  favorites: Record<string, string[]>
  carts: Record<string, CartItem[]>
  coupons: Record<string, 'valid' | 'expired'>
  appliedCoupons: Record<string, string>
  sessions: Record<string, string>
  orders: Order[]
}

// v2: imagens reais (webp) e catálogo ampliado para paginação
const DB_KEY = 'kurio-mock-db-v3'
const LEGACY_DB_KEY = 'kurio-mock-db-v2'

export function createInitialDb(): MockDb {
  return {
    nfts: structuredClone(nftFixtures),
    users: structuredClone(userFixtures),
    wallets: structuredClone(walletFixtures),
    favorites: { 'user-1': ['042'], 'user-2': [] },
    carts: {},
    coupons: { KURIO10: 'valid', EXPIRED: 'expired' },
    appliedCoupons: {},
    sessions: {},
    orders: [],
  }
}

export function readDb(): MockDb {
  // An early mock build stored demonstration passwords in localStorage.
  // Never retain that legacy state when migrating to password hashes.
  localStorage.removeItem(LEGACY_DB_KEY)
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const db = createInitialDb()
    writeDb(db)
    return db
  }
  const saved = JSON.parse(raw) as MockDb
  // Preserve existing local data created by older demonstration builds.
  return { ...saved, appliedCoupons: saved.appliedCoupons || {} }
}

export function writeDb(db: MockDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function resetDb() {
  const db = createInitialDb()
  writeDb(db)
  localStorage.removeItem(LEGACY_DB_KEY)
  localStorage.removeItem('kurio-session-token')
  return db
}

export function getAuthUser(request: Request, db = readDb()) {
  const header = request.headers.get('authorization')
  const token = header?.replace(/^Bearer\s+/i, '')
  if (!token) return undefined
  const userId = db.sessions[token]
  return db.users.find((user) => user.id === userId)
}

export function getCartKey(request: Request, db = readDb()) {
  const user = getAuthUser(request, db)
  if (user) return `user:${user.id}`
  const guestId = request.headers.get('x-guest-id') || 'anonymous'
  return `guest:${guestId}`
}
