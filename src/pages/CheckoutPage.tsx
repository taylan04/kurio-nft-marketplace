import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CollectorForm } from '@/components/checkout/CollectorForm'
import { WalletSelector } from '@/components/checkout/WalletSelector'
import { CheckoutItems } from '@/components/checkout/CheckoutItems'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { CouponForm } from '@/components/cart/CouponForm'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/hooks/useCart'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { createOrder } from '@/api/orders'
import { fetchWallets } from '@/api/account'
import { newIdempotencyKey } from '@/lib/idempotency'
import { formatEth } from '@/lib/money'
import type { Wallet } from '@/types/domain'

export function CheckoutPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isDesktop = useIsDesktop()
  const [wallet, setWallet] = useState<Wallet['type']>('Coinbase Wallet')
  const [showCoupon, setShowCoupon] = useState(false)
  const keyRef = useRef<string>(newIdempotencyKey())
  const order = useMutation({
    mutationFn: () => createOrder({ walletType: wallet, idempotencyKey: keyRef.current }),
    onSuccess: (data) => {
      queryClient.setQueryData(['order', data.id], data)
      navigate({ to: '/order/$orderId', params: { orderId: data.id } })
    },
  })
  const disabled = useMemo(() => !cart.data?.lines.length || order.isPending, [cart.data?.lines.length, order.isPending])

  const status = cart.isLoading ? 'Carregando checkout...' : !cart.data?.lines.length ? 'Seu carrinho está vazio.' : null
  if (status) {
    return isDesktop
      ? <AppShell withMobileNav={false}><div className="mx-auto max-w-page px-6 py-8 xl:px-0">{status}</div></AppShell>
      : <main className="min-h-screen bg-background p-7 text-foreground">{status}</main>
  }
  const data = cart.data!

  const orderError = order.error && <p role="alert" className="mt-4 text-sm text-danger">Não foi possível enviar o pedido. O carrinho foi preservado.</p>
  const confirmLabel = order.isPending ? 'Enviando pedido...' : 'Confirmar compra'

  if (isDesktop) {
    return (
      <AppShell withMobileNav={false}>
        <div className="mx-auto max-w-page px-6 xl:px-0">
          <nav aria-label="Você está em" className="pt-8 text-[15px] font-bold leading-5">
            <Link to="/" className="hover:text-accent-light">Início</Link> / <Link to="/cart" className="hover:text-accent-light">Mercado</Link> / <span aria-current="page">Pagamento</span>
          </nav>
          <h1 className="sr-only">Pagamento</h1>

          <div className="mt-[27px] grid gap-10 lg:grid-cols-[762px_405px] lg:justify-between">
            <CollectorForm />

            <aside aria-labelledby="your-nfts">
              <h2 id="your-nfts" className="text-[17px] font-bold leading-[22px]">Seus NFTs</h2>
              <div aria-hidden className="mt-[5px] flex justify-between border-b border-border pb-[7px] text-[15px] font-medium leading-5">
                <span>NFTs</span><span>Subtotal</span>
              </div>
              <div className="mt-[13px]"><CheckoutItems lines={data.lines} /></div>

              <p className="mt-2.5 text-center text-sm leading-5">
                Tem um código promocional?{' '}
                <button type="button" aria-expanded={showCoupon} onClick={() => setShowCoupon((v) => !v)} className="hover:text-accent-light hover:underline">Aplique aqui</button>
              </p>
              {showCoupon && (
                <div className="mt-3">
                  <CouponForm pending={cart.coupon.isPending} error={Boolean(cart.coupon.error)} onApply={(code) => cart.coupon.mutate(code)} />
                </div>
              )}

              <OrderSummary quote={data.quote} variant="checkout" className="mt-[11px]" />

              <h2 className="mt-1.5 text-center text-[17px] font-bold leading-[22px]">Carteira e rede</h2>
              <div className="mt-4"><WalletSelector value={wallet} onChange={setWallet} /></div>
              {orderError}
              <button type="button" disabled={disabled} onClick={() => order.mutate()} className="mt-6 h-11 w-full rounded-[3px] bg-accent text-[15px] font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60">
                {confirmLabel}
              </button>
            </aside>
          </div>
        </div>
      </AppShell>
    )
  }

  /* Mobile: "Pagamento com carteira" */
  return (
    <main className="min-h-screen bg-background px-7 pb-[130px] text-foreground">
      <header className="flex h-[100px] items-center gap-[25px]">
        <button type="button" aria-label="Voltar para o carrinho" onClick={() => navigate({ to: '/cart' })} className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#3a2318] text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Pagamento com carteira</h1>
      </header>

      <ConnectedWallets />

      <h2 className="mt-[13px] text-[15px] font-bold leading-5">Carteira e rede</h2>
      <div className="mt-4"><WalletSelector variant="mobile" value={wallet} onChange={setWallet} /></div>

      <p className="mt-[17px] flex items-baseline justify-end gap-[27px] font-bold">
        <span className="text-[15px]">Total:</span>
        <span className="text-[17px] text-accent-light">{formatEth(data.quote.totalEth)}</span>
      </p>
      {orderError}

      <div className="fixed inset-x-0 bottom-0 bg-background px-7 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
        <button type="button" disabled={disabled} onClick={() => order.mutate()} className="h-[58px] w-full rounded-full bg-gradient-to-r from-[#d99357] to-[#b77a49] text-[15px] font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60">
          {confirmLabel}
        </button>
      </div>
    </main>
  )
}

/** Carteiras salvas do colecionador (mobile) */
function ConnectedWallets() {
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: ({ signal }) => fetchWallets(signal) })
  const [selected, setSelected] = useState<string>()
  const list = wallets.data || []
  const current = selected ?? list.find((wallet) => wallet.primary)?.id ?? list[0]?.id

  return (
    <section aria-labelledby="connected-title" className="-mt-2.5">
      <div className="flex items-baseline justify-between">
        <h2 id="connected-title" className="text-[15px] font-bold leading-5">Carteira conectada</h2>
        <Link to="/wallets" className="text-[13px] font-bold text-accent-light hover:underline">Trocar carteira</Link>
      </div>
      <RadioGroup aria-labelledby="connected-title" value={current} onValueChange={setSelected} className="mt-3 gap-[21px]">
        {list.map((wallet) => (
          <label key={wallet.id} htmlFor={`cw-${wallet.id}`} className="relative flex h-[92px] cursor-pointer items-center rounded-[10px] bg-panel pl-5 pr-4">
            <RadioGroupItem id={`cw-${wallet.id}`} value={wallet.id} className="h-[15px] w-[15px] border-[1.5px] data-[state=unchecked]:border-[#5e3c26]" />
            <span className="ml-3 flex-1 text-[13px] leading-[22px]">
              <span className="block text-[15px] font-bold">{wallet.label}</span>
              <span className="block text-muted">{wallet.ens || wallet.address}</span>
              <span className="block text-muted">{wallet.network === 'Ethereum' ? 'Rede principal Ethereum' : `Rede ${wallet.network}`}</span>
            </span>
            <MoreVertical aria-hidden size={18} className="text-muted" />
          </label>
        ))}
      </RadioGroup>
    </section>
  )
}
