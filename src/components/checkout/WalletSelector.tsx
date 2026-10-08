import { Wallet as WalletIcon } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Wallet } from '@/types/domain'
import { cn } from '@/lib/utils'

const options: Wallet['type'][] = ['WalletConnect', 'MetaMask', 'Coinbase Wallet']

type Props = { value: Wallet['type']; onChange: (value: Wallet['type']) => void; variant?: 'desktop' | 'mobile' }

/** Carteira e rede. Desktop: linhas com borda e rádio à esquerda. Mobile: cards com ícone e rádio à direita. */
export function WalletSelector({ value, onChange, variant = 'desktop' }: Props) {
  const mobile = variant === 'mobile'
  return (
    <RadioGroup aria-label="Carteira e rede" value={value} onValueChange={(next) => onChange(next as Wallet['type'])} className={mobile ? 'gap-[17px]' : 'gap-4'}>
      {options.map((option) => {
        const id = `wallet-${variant}-${option.replace(/\s/g, '')}`
        const checked = value === option
        return mobile ? (
          <label key={option} htmlFor={id} className="flex h-16 cursor-pointer items-center rounded-[10px] bg-panel pl-3.5 pr-4">
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3a2318] text-[13px] font-bold text-accent-light">
              {option === 'Coinbase Wallet' ? <WalletIcon size={18} strokeWidth={1.6} /> : option[0]}
            </span>
            <span className="ml-[13px] flex-1 text-[13px]">{option}</span>
            <RadioGroupItem id={id} value={option} className="h-[15px] w-[15px] border-[1.5px] border-[#5e3c26] data-[state=checked]:border-accent" />
          </label>
        ) : (
          <label key={option} htmlFor={id} className={cn('flex h-[45px] cursor-pointer items-center gap-[18px] border px-5 text-[15px]', checked ? 'border-foreground/90' : 'border-field')}>
            <RadioGroupItem id={id} value={option} className="h-[15px] w-[15px] border-[1.5px]" />
            {option}
          </label>
        )
      })}
    </RadioGroup>
  )
}
