import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CartItemCard, CartItemRow } from '@/components/cart/CartItem'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { CouponForm } from '@/components/cart/CouponForm'
import { NFTCarousel } from '@/components/nft/NFTCarousel'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/useCart'
import { useNfts } from '@/hooks/useNfts'
import { useSession } from '@/hooks/useSession'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { rememberRedirect } from '@/lib/session'

export function CartPage() {
  const cart = useCart()
  const session = useSession()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const finish = () => {
    if (!session.data) { rememberRedirect('/checkout'); navigate({ to: '/login' }); return }
    navigate({ to: '/checkout' })
  }

  const lines = cart.data?.lines || []
  const empty = !cart.isLoading && !lines.length
  const updateQuantity = (line: (typeof lines)[number]) => (quantity: number) => cart.update.mutate({ nftId: line.nftId, edition: line.edition, quantity })
  const coupon = <CouponForm variant={isDesktop ? 'box' : 'pill'} pending={cart.coupon.isPending} error={Boolean(cart.coupon.error)} onApply={(code) => cart.coupon.mutate(code)} />

  return isDesktop ? (
    <AppShell withMobileNav={false}>
      <div className="mx-auto max-w-page px-6 xl:px-0">
        <nav aria-label="Você está em" className="pt-8 text-[15px] font-bold leading-5">
          <Link to="/" className="hover:text-accent-light">Início</Link> / <Link to="/" search={{ category: 'Arte digital' } as never} className="hover:text-accent-light">Mercado</Link> / <span aria-current="page">Carrinho</span>
        </nav>

        <div className="mt-[7px] grid gap-10 lg:grid-cols-[781px_332px] lg:justify-between">
          <section aria-labelledby="cart-title">
            <h1 id="cart-title" className="sr-only">Carrinho de NFTs</h1>
            <div aria-hidden className="grid h-[29px] grid-cols-[311px_138px_136px_1fr] items-start border-b border-border text-[15px] font-bold leading-5">
              <span>NFTs</span><span>Preço</span><span>Edições</span><span>Total</span>
            </div>
            {cart.isLoading ? (
              <div className="mt-3 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[70px] w-full rounded-none" />)}</div>
            ) : empty ? (
              <EmptyCart />
            ) : (
              <ul className="mt-3 space-y-3">
                {lines.map((line) => <CartItemRow key={line.nftId} line={line} onQuantity={updateQuantity(line)} onRemove={() => cart.remove.mutate(line.nftId)} />)}
              </ul>
            )}
          </section>

          <aside aria-labelledby="summary-title">
            <h2 id="summary-title" className="border-b border-border pb-1.5 text-lg font-bold leading-6">Resumo da carteira</h2>
            <p className="mt-[23px] text-sm font-bold leading-5">Código promocional</p>
            <div className="mt-1.5">{coupon}</div>
            {cart.data ? <OrderSummary quote={cart.data.quote} className="mt-6" /> : <Skeleton className="mt-6 h-40 w-full" />}
            <button type="button" disabled={empty} onClick={finish} className="mt-[22px] h-10 w-full rounded-[2px] bg-accent text-[15px] font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-50">
              Conectar e finalizar
            </button>
            <Link to="/" className="mt-3 block text-center text-[15px] text-accent-light hover:underline">Continuar explorando</Link>
          </aside>
        </div>

        <div className="mt-[107px]">
          <Suggestions />
        </div>
      </div>
    </AppShell>
  ) : (
    /* Mobile: cabeçalho próprio, lista rolável e resumo fixo embaixo (sem a barra inferior) */
    <main className="min-h-screen bg-background pb-[360px] text-foreground">
      <header className="relative flex h-[100px] items-center justify-center px-7">
        <button type="button" aria-label="Voltar" onClick={() => history.length > 1 ? history.back() : navigate({ to: '/' })} className="absolute left-7 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#3a2318] text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Carrinho de NFTs</h1>
      </header>

      <div className="px-7">
        {cart.isLoading ? (
          <div className="space-y-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[100px] w-full rounded-[10px]" />)}</div>
        ) : empty ? (
          <EmptyCart />
        ) : (
          <ul className="-mt-3 space-y-5">
            {lines.map((line) => <CartItemCard key={line.nftId} line={line} onQuantity={updateQuantity(line)} onRemove={() => cart.remove.mutate(line.nftId)} />)}
          </ul>
        )}
      </div>

      <section aria-label="Resumo do pedido" className="fixed inset-x-0 bottom-0 z-30 rounded-t-[36px] bg-panel px-6 pb-[max(36px,env(safe-area-inset-bottom))] pt-[23px] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
        {coupon}
        {cart.data && <OrderSummary quote={cart.data.quote} variant="compact" className="mt-[15px]" />}
        <button type="button" disabled={empty} onClick={finish} className="mt-[22px] h-[60px] w-full rounded-full bg-gradient-to-r from-[#d99357] to-[#b77a49] text-base font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-50">
          Conectar e finalizar
        </button>
      </section>
    </main>
  )
}

function EmptyCart() {
  return (
    <div className="mt-6 rounded-[10px] border border-dashed border-border p-10 text-center md:rounded-none">
      <p>Seu carrinho está vazio.</p>
      <Link to="/" className="mt-4 inline-flex h-10 items-center rounded-[3px] bg-accent px-4 text-sm font-bold text-background">Explorar NFTs</Link>
    </div>
  )
}

function Suggestions() {
  const suggestions = useNfts({ sort: 'popular', page: 1 })
  const more = useNfts({ sort: 'popular', page: 2 })
  const items = [...(suggestions.data?.items || []), ...(more.data?.items || [])].slice(0, 15)
  return <NFTCarousel title="Colecionadores também viram" items={items} loading={suggestions.isLoading} />
}
