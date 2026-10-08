import Decimal from 'decimal.js'
import type { Quote } from '@/types/domain'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'compact' | 'checkout'

/**
 * Totais do pedido. Valores no formato do Figma: "26.83 ETH", "(-) 00.00", "0.016 ETH".
 * default = carrinho desktop · compact = carrinho mobile · checkout = pagamento desktop
 */
export function OrderSummary({ quote, variant = 'default', className }: { quote: Quote; variant?: Variant; className?: string }) {
  const hasDiscount = new Decimal(quote.discountEth || 0).gt(0)
  const value = variant === 'compact' ? 'text-[15px]' : 'text-[17px]'
  return (
    <dl className={cn('text-[15px] leading-5', className)}>
      <div className="flex items-baseline justify-between">
        <dt>Subtotal</dt>
        <dd className={value}>{formatEth(quote.subtotalEth)}</dd>
      </div>
      <div className="mt-[13px] flex items-baseline justify-between">
        <dt>Desconto do lançamento</dt>
        <dd>(-) {hasDiscount ? formatEth(quote.discountEth) : '00.00'}</dd>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <dt>Taxa de rede</dt>
        <dd className={value}>{formatEth(quote.networkFeeEth)}</dd>
      </div>
      <p className={cn('text-[11px] text-accent-light', {
        'mt-2.5 text-right': variant === 'default',
        'mt-0.5 text-right': variant === 'compact',
        'mt-[11px] text-center': variant === 'checkout',
      })}>
        Taxa estimada
      </p>
      <div className={cn('flex items-baseline justify-between font-bold', {
        'mt-[19px]': variant === 'default',
        'mt-4': variant === 'compact',
        'mt-[7px] border-t border-border px-[42px] pt-[9px]': variant === 'checkout',
      })}>
        <dt className="text-base">Total</dt>
        <dd className="text-[17px] text-accent-light">{formatEth(quote.totalEth)}</dd>
      </div>
    </dl>
  )
}
