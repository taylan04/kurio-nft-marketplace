import { Link } from '@tanstack/react-router'
import { Minus, Plus, Trash } from 'lucide-react'
import type { CartLine } from '@/types/domain'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

type Props = { line: CartLine; onQuantity: (value: number) => void; onRemove: () => void }

/* "−" e "+" em pílula laranja (desktop) */
const pill =
  'flex h-[26px] w-[18px] items-center justify-center rounded-full bg-accent text-background transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed'

/** Linha da tabela do carrinho (desktop) */
export function CartItemRow({ line, onQuantity, onRemove }: Props) {
  const max = line.nft.available
  return (
    <li className="grid h-[70px] grid-cols-[70px_241px_138px_136px_1fr_auto] items-center bg-panel pr-[25px]">
      <Link to="/nft/$nftId" params={{ nftId: line.nftId }} tabIndex={-1} aria-hidden>
        <img src={line.nft.image} alt="" className="h-[70px] w-[70px] object-cover" />
      </Link>
      <div className="min-w-0 pl-4">
        <Link to="/nft/$nftId" params={{ nftId: line.nftId }} className="block truncate text-[15px] font-bold leading-5 hover:text-accent-light">
          {line.nft.name}
        </Link>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-dim">ID do token: {line.nft.tokenId}</p>
      </div>
      <p className="text-[15px] font-bold text-muted">{formatEth(line.nft.priceEth)}</p>
      <div className="flex items-center">
        <button type="button" aria-label={`Diminuir quantidade de ${line.nft.name}`} disabled={line.quantity <= 1} onClick={() => onQuantity(line.quantity - 1)} className={pill}>
          <Minus size={12} strokeWidth={2.5} />
        </button>
        <span aria-live="polite" className="w-[37px] text-center text-[15px]">{line.quantity}</span>
        <button type="button" aria-label={`Aumentar quantidade de ${line.nft.name}`} disabled={line.quantity >= max} onClick={() => onQuantity(line.quantity + 1)} className={pill}>
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>
      <p className="text-[15px] font-bold text-accent-light">{formatEth(line.lineTotalEth)}</p>
      <button type="button" aria-label={`Remover ${line.nft.name}`} onClick={onRemove} className="rounded text-muted transition hover:text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <Trash size={20} strokeWidth={1.6} />
      </button>
    </li>
  )
}

/* bolinhas escuras do "−" e "+" (mobile) */
const round =
  'flex h-6 w-6 items-center justify-center rounded-full bg-[#3a2318] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed'

/** Card do carrinho (mobile) */
export function CartItemCard({ line, onQuantity, onRemove }: Props) {
  const max = line.nft.available
  return (
    <li className="relative flex h-[100px] overflow-hidden rounded-[10px] bg-panel">
      <img src={line.nft.image} alt="" className="h-[100px] w-[100px] shrink-0 object-cover" />
      <div className="min-w-0 flex-1 pl-[9px] pt-[13px]">
        <Link to="/nft/$nftId" params={{ nftId: line.nftId }} className="block truncate pr-8 text-[15px] font-bold leading-[18px]">
          {line.nft.name}
        </Link>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-dim">Edição: {line.edition === 'OPEN' ? 'ABERTA' : line.edition}</p>
        <p className="mt-[13px] text-[17px] font-bold leading-5 text-accent-light">{formatEth(line.lineTotalEth)}</p>
      </div>

      <div className="absolute bottom-[38px] right-4 flex items-center">
        <button type="button" aria-label={`Diminuir quantidade de ${line.nft.name}`} disabled={line.quantity <= 1} onClick={() => onQuantity(line.quantity - 1)} className={cn(round, line.quantity <= 1 ? 'text-[#5e3c26]' : 'text-foreground')}>
          <Minus size={13} strokeWidth={2.5} />
        </button>
        <span aria-live="polite" className="w-[34px] text-center text-[15px]">{line.quantity}</span>
        <button type="button" aria-label={`Aumentar quantidade de ${line.nft.name}`} disabled={line.quantity >= max} onClick={() => onQuantity(line.quantity + 1)} className={cn(round, 'text-foreground')}>
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </div>

      <button type="button" aria-label={`Remover ${line.nft.name}`} onClick={onRemove} className="absolute right-3 top-3 rounded text-muted-dim transition hover:text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <Trash size={16} strokeWidth={1.6} />
      </button>
    </li>
  )
}
