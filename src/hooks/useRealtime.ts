import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import type { Cart, CatalogResponse, NFT, Order, RealtimeEnvelope } from '@/types/domain'
import { multiplyEth } from '@/lib/money'
import { useSession } from './useSession'

/**
 * A socket belongs to one React effect / authenticated session. Closing it when
 * the session changes prevents listeners from a previous user receiving events.
 * REST remains the source of truth; websocket updates only speed up the UI.
 */
export function useRealtime() {
  const queryClient = useQueryClient()
  const userId = useSession().data?.user.id
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const versions = new Map<string, number>()
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'wss://kurio.mock', {
      transports: ['websocket'],
      path: '/socket.io/',
      reconnection: true,
    })

    const onNft = (event: RealtimeEnvelope<NFT>) => {
      if (!event?.data || event.resourceId !== event.data.id || event.version !== event.data.version) return

      const key = `nft:${event.resourceId}`
      const detail = queryClient.getQueryData<NFT>(['nft', event.resourceId])
      let knownVersion = Math.max(versions.get(key) || 0, detail?.version || 0)
      for (const [, catalog] of queryClient.getQueriesData<CatalogResponse>({ queryKey: ['nfts'] })) {
        const cached = catalog?.items.find((item) => item.id === event.resourceId)
        knownVersion = Math.max(knownVersion, cached?.version || 0)
      }
      // Duplicated and delayed packets must never roll the UI back.
      if (event.version <= knownVersion) return
      versions.set(key, event.version)

      queryClient.setQueryData<NFT>(['nft', event.resourceId], event.data)
      queryClient.setQueriesData<CatalogResponse>({ queryKey: ['nfts'] }, (previous) => previous ? {
        ...previous,
        items: previous.items.map((item) => item.id === event.resourceId ? event.data : item),
      } : previous)
      queryClient.setQueryData<Cart>(['cart'], (previous) => previous ? {
        ...previous,
        lines: previous.lines.map((line) => line.nftId === event.resourceId ? {
          ...line,
          nft: event.data,
          lineTotalEth: multiplyEth(event.data.priceEth, line.quantity),
        } : line),
      } : previous)

      // Refetch to recalculate totals and account for changed sort/filter results.
      void queryClient.invalidateQueries({ queryKey: ['nfts'], refetchType: 'active' })
      void queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'active' })
      setAnnouncement(`${event.data.name}: preço ou disponibilidade atualizado. Revise o carrinho antes de comprar.`)
    }

    const onOrder = (event: RealtimeEnvelope<Order>) => {
      if (!userId || event?.userId !== userId || event.resourceId !== event.data?.id ||
          event.data.userId !== userId || event.version !== event.data.version) return

      const key = `order:${event.resourceId}`
      const current = queryClient.getQueryData<Order>(['order', event.resourceId])
      const knownVersion = Math.max(versions.get(key) || 0, current?.version || 0)
      if (event.version <= knownVersion || (current && current.status !== 'pending')) return
      versions.set(key, event.version)
      queryClient.setQueryData(['order', event.resourceId], event.data)
      if (event.data.status === 'confirmed') {
        void queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'active' })
        void queryClient.invalidateQueries({ queryKey: ['nfts'], refetchType: 'active' })
      }
      const status = event.data.status === 'confirmed' ? 'confirmado' : event.data.status === 'declined' ? 'recusado' : 'pendente'
      setAnnouncement(`Pedido ${event.resourceId}: ${status}.`)
    }

    const reconcile = () => {
      void queryClient.invalidateQueries({ queryKey: ['nfts'], refetchType: 'active' })
      void queryClient.invalidateQueries({ queryKey: ['nft'], refetchType: 'active' })
      void queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'active' })
      if (userId) void queryClient.invalidateQueries({ queryKey: ['order'], refetchType: 'active' })
    }

    const onConnect = () => {
      // A conexão deve estar pronta antes de disparar cenários de tempo real.
      // Isso também dá feedback acessível para quem perdeu a conexão.
      setAnnouncement('Tempo real conectado. Atualizações sincronizadas.')
      reconcile()
    }
    const onDisconnect = () => setAnnouncement('Tempo real desconectado. Tentando reconectar.')
    const onConnectError = () => setAnnouncement('Não foi possível conectar ao tempo real. Tentando novamente.')

    socket.on('nft.updated', onNft)
    socket.on('order.updated', onOrder)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('nft.updated', onNft)
      socket.off('order.updated', onOrder)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.disconnect()
    }
  }, [queryClient, userId])

  return announcement
}
