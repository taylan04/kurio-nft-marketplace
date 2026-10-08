import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { fetchOrder } from '@/api/orders'
import { OrderReceipt } from '@/components/order/OrderReceipt'
import { Link } from '@tanstack/react-router'

// Figma: recibo sozinho sobre o fundo escuro (sem header/rodapé)
export function OrderPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string }
  const order = useQuery({ queryKey: ['order', orderId], queryFn: ({ signal }) => fetchOrder(orderId, signal), refetchInterval: (query) => query.state.data?.status === 'pending' ? 2000 : false })
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground md:pt-[166px]">
      {order.isLoading ? <p role="status" className="text-center">Recuperando pedido...</p> :
        order.data?.status === 'confirmed' ? <OrderReceipt order={order.data} /> :
        order.data?.status === 'pending' ? (
          <section role="status" className="mx-auto max-w-[578px] rounded-lg bg-panel px-8 py-16 text-center">
            <h1 className="text-xl font-bold">Seu pedido está pendente</h1>
            <p className="mt-4">Estamos aguardando a confirmação simulada. Esta página atualiza automaticamente e você pode voltar depois.</p>
            <p className="mt-3 text-sm text-muted">Pedido: {order.data.id}</p>
          </section>
        ) : order.data?.status === 'declined' ? (
          <section role="alert" className="mx-auto max-w-[578px] rounded-lg bg-panel px-8 py-16 text-center">
            <h1 className="text-xl font-bold">Pagamento recusado</h1>
            <p className="mt-4">A simulação recusou este pagamento. Seus NFTs continuam no carrinho.</p>
            <Link to="/cart" className="mt-6 inline-block rounded bg-accent px-5 py-3 font-bold text-background">Voltar ao carrinho</Link>
          </section>
        ) : <div className="text-center" role="alert">Não foi possível consultar o pedido. <button onClick={() => order.refetch()} className="underline">Tentar novamente</button></div>}
    </main>
  )
}
