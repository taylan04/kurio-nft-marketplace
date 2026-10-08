import type { CartLine } from '@/types/domain'
import { formatEth } from '@/lib/money'

/** "Seus NFTs" do Pagamento desktop */
export function CheckoutItems({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="space-y-[13px]">
      {lines.map((line) => (
        <li key={line.nftId} className="grid h-[70px] grid-cols-[70px_1fr_auto_auto] items-center gap-x-2 bg-panel pr-4">
          <img src={line.nft.image} alt="" className="h-[70px] w-[70px] rounded-md border-[3px] border-panel object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-5">{line.nft.name}</p>
            <p className="text-[13px] leading-5 text-muted-dim">ID do token: {line.nft.tokenId}</p>
          </div>
          <span className="text-[13px] text-muted">(x {line.quantity})</span>
          <strong className="ml-2 text-[17px] text-accent-light">{formatEth(line.lineTotalEth)}</strong>
        </li>
      ))}
    </ul>
  )
}
