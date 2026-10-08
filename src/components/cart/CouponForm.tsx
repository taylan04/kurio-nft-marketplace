import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = { pending?: boolean; error?: boolean; onApply: (coupon?: string) => void; variant?: 'box' | 'pill' }

/** Cupom: "box" = desktop (campo com borda laranja + botão reto); "pill" = mobile (cápsula com botão em gradiente). */
export function CouponForm({ pending, error, onApply, variant = 'box' }: Props) {
  const [coupon, setCoupon] = useState('')
  const pill = variant === 'pill'
  return (
    <div>
      <form
        className={cn('flex', pill ? 'h-[50px] rounded-full bg-[#1a100c] p-0' : 'h-10')}
        onSubmit={(event) => { event.preventDefault(); onApply(coupon || undefined) }}
      >
        <input
          aria-label="Código promocional"
          aria-invalid={error || undefined}
          aria-describedby={error ? `coupon-error-${variant}` : undefined}
          placeholder="Digite o código promocional..."
          value={coupon}
          onChange={(event) => setCoupon(event.target.value)}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-dim',
            pill ? 'rounded-l-full pl-4 text-[13px] focus-visible:ring-1 focus-visible:ring-accent' : 'rounded-l-[2px] border border-r-0 border-accent pl-2 pr-1 text-xs focus:ring-1 focus:ring-accent',
          )}
        />
        <button
          disabled={pending}
          className={cn(
            'shrink-0 font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60',
            pill ? 'w-[97px] rounded-full bg-gradient-to-r from-[#d99357] to-[#b77a49] text-[15px]' : 'w-[101px] rounded-r-[2px] bg-accent text-base',
          )}
        >
          Aplicar
        </button>
      </form>
      {error && <p id={`coupon-error-${variant}`} role="alert" className="mt-2 text-xs text-danger">Cupom inválido ou expirado.</p>}
    </div>
  )
}
