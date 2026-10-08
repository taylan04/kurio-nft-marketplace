import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { fetchOrder } from '@/api/orders'
import { OrderReceipt } from '@/components/order/OrderReceipt'

// Figma: recibo sozinho sobre o fundo escuro (sem header/rodapé)
export function OrderPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string }
  const order = useQuery({ queryKey: ['order', orderId], queryFn: ({ signal }) => fetchOrder(orderId, signal), refetchInterval: (query) => query.state.data?.status === 'pending' ? 2000 : false })
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground md:pt-[166px]">
      {order.isLoading ? <p className="text-center">Recuperando pedido...</p> : order.data ? <OrderReceipt order={order.data} /> : <p className="text-center">Pedido não encontrado.</p>}
    </main>
  )
}
