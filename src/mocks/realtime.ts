import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { RealtimeEnvelope } from '@/types/domain'

const socketServer = ws.link('wss://kurio.mock/socket.io/')

type SocketIoConnection = ReturnType<typeof toSocketIo>

const connections = new Set<SocketIoConnection>()

export const realtimeHandler = socketServer.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection)
  connections.add(io)
  connection.client.addEventListener('close', () => connections.delete(io))
})

export function emitRealtime<T>(
  eventName: 'nft.updated' | 'order.updated',
  envelope: RealtimeEnvelope<T>,
) {
  connections.forEach((io) => io.client.emit(eventName, envelope))
}