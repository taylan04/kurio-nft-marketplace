import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import type { Order } from '@/types/domain'
import { formatEth } from '@/lib/money'
import { ThankYouIcon } from '@/components/icons'

const title = {
  confirmed: 'Seus NFTs agora estão na sua carteira',
  pending: 'Pedido pendente: aguardando confirmação na rede',
  declined: 'Pagamento recusado: nenhum valor foi cobrado',
} as const

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${d.getDate()} ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${d.getFullYear()}`
}

/** Recibo (frame "Confirmação de Pedido") — renderiza o snapshot imutável do pedido */
export function OrderReceipt({ order }: { order: Order }) {
  const cells = [
    { label: 'ID da transação', value: order.transactionHash, strong: true },
    { label: 'Data', value: formatDate(order.createdAt) },
    { label: 'Total', value: formatEth(order.quote.totalEth) },
    { label: 'Carteira', value: order.walletType, strong: true },
  ]
  return (
    <section aria-labelledby="receipt-title" className="relative mx-auto w-full max-w-[578px] bg-panel pb-[58px] text-muted">
      <Link to="/" aria-label="Fechar e voltar ao início" className="absolute right-[22px] top-[25px] text-accent-light hover:text-foreground">
        <X size={18} strokeWidth={1.5} />
      </Link>

      <div className="flex flex-col items-center px-6 pt-[22px] text-center">
        <ThankYouIcon size={80} className="text-accent" />
        <h1 id="receipt-title" aria-live="polite" className="mt-4 text-[15px] font-bold leading-5">{title[order.status]}</h1>
      </div>

      <dl className="mt-[20px] grid grid-cols-2 gap-y-3 border-y border-accent px-4 py-[13px] text-[13px] leading-[19px] sm:grid-cols-4 sm:gap-y-0 sm:pl-9 sm:pr-4">
        {cells.map((cell, i) => (
          <div key={cell.label} className={i > 0 ? 'sm:border-l sm:border-accent sm:pl-4' : ''}>
            <dt className={cell.strong ? 'font-bold' : ''}>{cell.label}</dt>
            <dd className="text-sm">{cell.value}</dd>
          </div>
        ))}
      </dl>

      <div className="px-4 sm:px-11">
        <h2 className="mt-[19px] text-sm font-bold leading-5 text-foreground">Detalhes da transação</h2>
        <div aria-hidden className="mt-2 grid grid-cols-[1fr_80px_100px] border-b border-border pb-[9px] text-[15px] font-medium leading-5 text-foreground">
          <span>NFTs</span><span className="text-center">Edições</span><span className="text-right">Subtotal</span>
        </div>
        <ul className="mt-3 space-y-3">
          {order.lines.map((line) => (
            <li key={line.nftId} className="grid grid-cols-[1fr_80px_100px] items-center">
              <div className="flex min-w-0 items-center gap-3">
                <img src={line.nft.image} alt="" className="h-[70px] w-[70px] shrink-0 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold leading-5 text-foreground">{line.nft.name}</p>
                  <p className="text-[13px] leading-5">ID do token: {line.nft.tokenId}</p>
                </div>
              </div>
              <span className="text-center text-[13px]">(x {line.quantity})</span>
              <strong className="text-right text-[17px] text-accent-light">{formatEth(line.lineTotalEth)}</strong>
            </li>
          ))}
        </ul>

        <dl className="mt-4 border-b border-border pb-2 text-[15px] leading-[29px] text-foreground sm:pl-[169px]">
          <div className="flex items-baseline justify-between"><dt>Taxa de rede</dt><dd className="text-[17px]">{formatEth(order.quote.networkFeeEth)}</dd></div>
          <div className="flex items-baseline justify-between font-bold"><dt>Total</dt><dd className="text-[17px] text-accent-light">{formatEth(order.quote.totalEth)}</dd></div>
        </dl>

        {order.status === 'confirmed' && (
          <p className="mt-[13px] text-center text-[13px] leading-[22px]">
            Transação simulada confirmada na rede {order.collector?.network || 'Ethereum'}. Nenhuma operação real foi enviada à blockchain.
          </p>
        )}
        <div className="mt-[19px] flex justify-center">
          {/* link de exploração simulado (sem blockchain real no desafio) */}
          <button type="button" aria-disabled="true" title="Link simulado: não há transação real na blockchain" className="h-[47px] rounded-[3px] bg-accent px-4 text-[15px] font-bold text-[#1a100b]">
            Ver no Etherscan
          </button>
        </div>
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[10px] bg-accent" />
    </section>
  )
}
