import { api } from './client'
import type { CatalogResponse, CatalogSearch, NFT } from '@/types/domain'

export async function fetchNfts(search: CatalogSearch, signal?: AbortSignal) {
  const { data } = await api.get<CatalogResponse>('/nfts', { params: search, signal })
  return data
}

export async function fetchNft(id: string, signal?: AbortSignal) {
  const { data } = await api.get<NFT>(`/nfts/${id}`, { signal })
  return data
}

export async function fetchFavorites(signal?: AbortSignal) {
  const { data } = await api.get<{ ids: string[] }>('/favorites', { signal })
  return data.ids
}

export async function addFavorite(id: string) {
  await api.post(`/favorites/${id}`)
}

export async function removeFavorite(id: string) {
  await api.delete(`/favorites/${id}`)
}
