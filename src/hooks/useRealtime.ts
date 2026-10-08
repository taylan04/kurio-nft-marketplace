import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import type { NFT, Order, RealtimeEnvelope } from '@/types/domain'
import { useSession } from './useSession'

let socket: Socket | null = null

export function useRealtime() {
  const queryClient = useQueryClient()
  const session = useSession()

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_SOCKET_URL || 'wss://kurio.mock', {
        transports: ['websocket'],
        path: '/socket.io/',
        reconnection: true,
      })
    }

    const onNft = (event: RealtimeEnvelope<NFT>) => {
      const current = queryClient.getQueryData<NFT>(['nft', event.resourceId])
      if (!current || event.version > current.version) queryClient.setQueryData(['nft', event.resourceId], event.data)
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }

    const onOrder = (event: RealtimeEnvelope<Order>) => {
      if (event.userId && event.userId !== session.data?.user.id) return
      const current = queryClient.getQueryData<Order>(['order', event.resourceId])
      if (!current || event.version > current.version) queryClient.setQueryData(['order', event.resourceId], event.data)
      if (event.data.status === 'confirmed') queryClient.invalidateQueries({ queryKey: ['cart'] })
    }

    socket.on('nft.updated', onNft)
    socket.on('order.updated', onOrder)
    socket.on('connect', () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
    })

    return () => {
      socket?.off('nft.updated', onNft)
      socket?.off('order.updated', onOrder)
    }
  }, [queryClient, session.data?.user.id])
}
