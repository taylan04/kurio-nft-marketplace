import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, fetchFavorites, fetchNft, fetchNfts, removeFavorite } from '@/api/nfts'
import type { CatalogSearch } from '@/types/domain'

export function useNfts(search: CatalogSearch) {
  return useQuery({
    queryKey: ['nfts', search],
    queryFn: ({ signal }) => fetchNfts(search, signal),
    placeholderData: (previous) => previous,
    staleTime: 20_000,
  })
}

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => fetchNft(id, signal),
    staleTime: 20_000,
  })
}

export function useFavorites(enabled = true) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: ({ signal }) => fetchFavorites(signal),
    enabled,
    retry: false,
  })
  const toggle = useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => favorite ? removeFavorite(id) : addFavorite(id),
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previous = queryClient.getQueryData<string[]>(['favorites']) || []
      queryClient.setQueryData<string[]>(['favorites'], favorite ? previous.filter((entry) => entry !== id) : [...previous, id])
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(['favorites'], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
  return { ...query, toggle }
}
