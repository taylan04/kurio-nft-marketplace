export type Network = 'Ethereum' | 'Polygon' | 'Solana'
export type Edition = '1/1' | '1/10' | '1/50' | 'OPEN'

export interface NFT {
  id: string
  name: string
  image: string
  priceEth: string
  previousPriceEth?: string
  collection: string
  category: string
  network: Network
  rarity?: 'COMMON' | 'RARE' | 'EPIC'
  editions: Edition[]
  selectedEdition: Edition
  available: number
  rating: number
  reviews: number
  tokenId: string
  attributes: string[]
  description: string
  version: number
}

export interface CatalogSearch {
  q?: string
  category?: string
  network?: Network | ''
  minPrice?: string
  maxPrice?: string
  sort?: 'recent' | 'price-asc' | 'price-desc' | 'popular'
  page?: number
}

export interface CatalogResponse {
  items: NFT[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  ens?: string
  walletAlias?: string
}

export interface Session {
  token: string
  user: User
}

export interface Wallet {
  id: string
  userId: string
  label: string
  nickname: string
  address: string
  network: Network
  type: 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet'
  ens?: string
  email?: string
  referralCode?: string
  primary: boolean
}

export interface CartItem {
  nftId: string
  edition: Edition
  quantity: number
}

export interface CartLine extends CartItem {
  nft: NFT
  lineTotalEth: string
}

export interface Quote {
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  coupon?: string
  stale?: boolean
}

export interface Cart {
  items: CartItem[]
  lines: CartLine[]
  quote: Quote
}

export type OrderStatus = 'pending' | 'confirmed' | 'declined'

export interface Order {
  id: string
  userId: string
  createdAt: string
  status: OrderStatus
  transactionHash: string
  walletType: Wallet['type']
  walletLabel: string
  lines: CartLine[]
  quote: Quote
  idempotencyKey: string
  payloadSignature: string
  version: number
}

export interface RealtimeEnvelope<T> {
  resourceId: string
  version: number
  userId?: string
  data: T
}
