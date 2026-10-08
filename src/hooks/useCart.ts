import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addCartItem, applyCoupon, fetchCart, removeCartItem, updateCartItem } from '@/api/cart'
import { multiplyEth } from '@/lib/money'
import type { Cart, Edition } from '@/types/domain'

export function useCart() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['cart'], queryFn: ({ signal }) => fetchCart(signal), staleTime: 5_000 })

  const add = useMutation({
    mutationFn: addCartItem,
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  })

  const update = useMutation({
    mutationFn: ({ nftId, edition, quantity }: { nftId: string; edition: Edition; quantity: number }) => updateCartItem(nftId, { edition, quantity }),
    onMutate: async ({ nftId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previous = queryClient.getQueryData<Cart>(['cart'])
      if (previous) {
        const lines = previous.lines.map((line) => line.nftId === nftId ? { ...line, quantity, lineTotalEth: multiplyEth(line.nft.priceEth, quantity) } : line)
        const items = previous.items.map((item) => item.nftId === nftId ? { ...item, quantity } : item)
        queryClient.setQueryData<Cart>(['cart'], { ...previous, lines, items })
      }
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(['cart'], context?.previous),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  })

  const remove = useMutation({ mutationFn: removeCartItem, onSuccess: (cart) => queryClient.setQueryData(['cart'], cart) })
  const coupon = useMutation({ mutationFn: applyCoupon, onSuccess: (cart) => queryClient.setQueryData(['cart'], cart) })

  return { ...query, add, update, remove, coupon }
}
