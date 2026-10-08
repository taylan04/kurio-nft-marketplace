import { useEffect, useMemo, useState } from 'react'
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
import { createOrder, fetchOrderByKey } from '@/api/orders'
import { validateQuote } from '@/api/cart'
import { fetchWallets } from '@/api/account'
import { isAxiosError } from 'axios'
import { clearCheckoutAttempt, createCheckoutAttempt, readCheckoutAttempt } from '@/lib/checkoutAttempt'
import { formatEth } from '@/lib/money'
import { useSession } from '@/hooks/useSession'
import type { CollectorDetails, Quote, Wallet } from '@/types/domain'
import { validateCollector, type CollectorErrors } from '@/lib/collectorValidation'
import { apiErrorMessage } from '@/lib/apiError'

function sameQuote(a: Quote, b: Quote) {
  return a.totalEth === b.totalEth && a.subtotalEth === b.subtotalEth &&
    a.discountEth === b.discountEth && a.networkFeeEth === b.networkFeeEth &&
    a.coupon === b.coupon && a.revision === b.revision
}

export function CheckoutPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isDesktop = useIsDesktop()
  const session = useSession()
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: ({ signal }) => fetchWallets(signal), enabled: !!session.data })
  const [wallet, setWallet] = useState<Wallet['type']>('Coinbase Wallet')
  const [showCoupon, setShowCoupon] = useState(false)
  const [reviewNotice, setReviewNotice] = useState('')
  const [recovering, setRecovering] = useState(false)
  const [collector, setCollector] = useState<CollectorDetails>({
    displayName: '', username: '', network: 'Ethereum', profileName: '', walletAddress: '',
    secondaryWallet: '', walletType: 'Coinbase Wallet', referralCode: '', email: '', ens: '', note: '',
  })
  const [collectorErrors, setCollectorErrors] = useState<CollectorErrors>({})
  const [showMobileCollector, setShowMobileCollector] = useState(false)
  const savedWallet = wallets.data?.find((entry) => entry.type === wallet && entry.userId === session.data?.user.id)

  useEffect(() => {
    const user = session.data?.user
    const activeWallet = wallets.data?.find((entry) => entry.type === wallet && entry.userId === user?.id)
    if (!user || !activeWallet) return
    setCollector((current) => ({
      displayName: user.displayName, username: user.username, profileName: user.displayName,
      email: user.email, ens: user.ens || activeWallet.ens || '', note: current.note,
      network: activeWallet.network, walletAddress: activeWallet.address,
      walletType: activeWallet.type, referralCode: activeWallet.referralCode || '', secondaryWallet: '',
    }))
    setCollectorErrors({})
  }, [session.data?.user, wallets.data, wallet])

  const confirmPurchase = () => {
    const errors = validateCollector(collector, savedWallet)
    setCollectorErrors(errors)
    if (Object.keys(errors).length) {
      setShowMobileCollector(true)
      return
    }
    order.mutate()
  }

  useEffect(() => {
    if (wallets.data?.length && !wallets.data.some((entry) => entry.type === wallet)) {
      setWallet((wallets.data.find((entry) => entry.primary) || wallets.data[0]).type)
    }
  }, [wallets.data, wallet])

  // If a request timed out after the server created it, reopen the SAME order
  // rather than starting a second purchase when the collector returns.
  useEffect(() => {
    const userId = session.data?.user.id
    if (!userId) return
    const attempt = readCheckoutAttempt(userId)
    if (!attempt) return
    let active = true
    setRecovering(true)
    fetchOrderByKey(attempt.key)
      .then((existing) => {
        if (!active) return
        clearCheckoutAttempt()
        queryClient.setQueryData(['order', existing.id], existing)
        navigate({ to: '/order/$orderId', params: { orderId: existing.id } })
      })
      .catch(() => { /* 404 means the request never arrived; the key remains reusable. */ })
      .finally(() => { if (active) setRecovering(false) })
    return () => { active = false }
  }, [session.data?.user.id, navigate, queryClient])

  const order = useMutation({
    mutationFn: async () => {
      const userId = session.data?.user.id
      if (!userId) throw new Error('Sua sessão expirou. Entre novamente para continuar.')
      const previous = readCheckoutAttempt(userId)
      if (previous) {
        // The order may have been accepted before a network timeout.
        try {
          return await fetchOrderByKey(previous.key)
        } catch (error) {
          if (!isAxiosError(error) || error.response?.status !== 404) throw error
        }
      }
      if (!savedWallet) throw new Error('Cadastre uma carteira desse tipo para continuar.')
      if (Object.keys(validateCollector(collector, savedWallet)).length)
        throw new Error('Revise os campos obrigatórios do perfil do colecionador.')
      // Always compare the latest REST quote with what the collector last saw.
      const latest = await validateQuote()
      queryClient.setQueryData(['cart'], latest)
      if (latest.quote.stale) throw new Error('Uma edição está esgotada. Ajuste as quantidades no carrinho.')
      if (!cart.data || !sameQuote(cart.data.quote, latest.quote)) {
        setReviewNotice('Os preços ou taxas mudaram. Revise os novos valores e confirme novamente.')
        throw new Error('Sua cotação mudou. Revise os valores antes de confirmar.')
      }
      const attempt = createCheckoutAttempt(userId, wallet, latest.quote, latest.items, collector)
      return createOrder({ walletType: attempt.walletType, expectedQuote: attempt.expectedQuote, expectedItems: attempt.expectedItems, collector: attempt.collector, idempotencyKey: attempt.key })
    },
    onSuccess: (data) => {
      clearCheckoutAttempt()
      queryClient.setQueryData(['order', data.id], data)
      navigate({ to: '/order/$orderId', params: { orderId: data.id } })
    },
  })
  const disabled = useMemo(() => !cart.data?.lines.length || order.isPending || recovering,
    [cart.data?.lines.length, order.isPending, recovering])

  const status = cart.isLoading ? 'Carregando checkout...' : !cart.data?.lines.length ? 'Seu carrinho está vazio.' : null
  if (status) {
    return isDesktop
      ? <AppShell withMobileNav={false}><div className="mx-auto max-w-page px-6 py-8 xl:px-0">{status}</div></AppShell>
      : <main className="min-h-screen bg-background p-7 text-foreground">{status}</main>
  }
  const data = cart.data!

  const orderError = order.error && <p role="alert" className="mt-4 text-sm text-danger">{apiErrorMessage(order.error)}</p>
  const collectorNotice = Object.keys(collectorErrors).length > 0 && <p role="alert" className="mt-3 text-sm text-danger">Revise os campos destacados do perfil do colecionador.</p>
  const reviewMessage = reviewNotice && <p role="status" className="mt-3 text-sm text-accent-light">{reviewNotice}</p>
  const confirmLabel = order.isPending ? 'Verificando e enviando...' : recovering ? 'Recuperando pedido...' : 'Confirmar compra'

  if (isDesktop) {
    return (
      <AppShell withMobileNav={false}>
        <div className="mx-auto max-w-page px-6 xl:px-0">
          <nav aria-label="Você está em" className="pt-8 text-[15px] font-bold leading-5">
            <Link to="/" className="hover:text-accent-light">Início</Link> / <Link to="/cart" className="hover:text-accent-light">Mercado</Link> / <span aria-current="page">Pagamento</span>
          </nav>
          <h1 className="sr-only">Pagamento</h1>

          <div className="mt-[27px] grid gap-10 lg:grid-cols-[762px_405px] lg:justify-between">
            <CollectorForm value={collector} onChange={(next) => { setCollector(next); setCollectorErrors({}) }} errors={collectorErrors} />

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
              {reviewMessage}
              {collectorNotice}
              {orderError}
              <button type="button" disabled={disabled} onClick={confirmPurchase} className="mt-6 h-11 w-full rounded-[3px] bg-accent text-[15px] font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60">
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

      <ConnectedWallets onSelect={setWallet} />

      <div className="mt-5">
        <button type="button" aria-expanded={showMobileCollector} onClick={() => setShowMobileCollector((visible) => !visible)} className="text-sm font-bold text-accent-light underline underline-offset-4">
          {showMobileCollector ? 'Ocultar dados do colecionador' : 'Revisar dados do colecionador'}
        </button>
        {showMobileCollector && <div className="mt-4"><CollectorForm value={collector} onChange={(next) => { setCollector(next); setCollectorErrors({}) }} errors={collectorErrors} /></div>}
      </div>

      <h2 className="mt-[13px] text-[15px] font-bold leading-5">Carteira e rede</h2>
      <div className="mt-4"><WalletSelector variant="mobile" value={wallet} onChange={setWallet} /></div>

      <p className="mt-[17px] flex items-baseline justify-end gap-[27px] font-bold">
        <span className="text-[15px]">Total:</span>
        <span className="text-[17px] text-accent-light">{formatEth(data.quote.totalEth)}</span>
      </p>
      {reviewMessage}
      {collectorNotice}
      {orderError}

      <div className="fixed inset-x-0 bottom-0 bg-background px-7 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
        <button type="button" disabled={disabled} onClick={confirmPurchase} className="h-[58px] w-full rounded-full bg-gradient-to-r from-[#d99357] to-[#b77a49] text-[15px] font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60">
          {confirmLabel}
        </button>
      </div>
    </main>
  )
}

/** Carteiras salvas do colecionador (mobile) */
function ConnectedWallets({ onSelect }: { onSelect: (value: Wallet['type']) => void }) {
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
      <RadioGroup aria-labelledby="connected-title" value={current} onValueChange={(id) => {
        setSelected(id)
        const selectedWallet = list.find((entry) => entry.id === id)
        if (selectedWallet) onSelect(selectedWallet.type)
      }} className="mt-3 gap-[21px]">
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
