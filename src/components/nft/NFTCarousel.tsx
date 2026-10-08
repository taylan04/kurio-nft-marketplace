import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { NFT } from '@/types/domain'
import { formatEth } from '@/lib/money'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 5

/**
 * Faixa "Mais desta coleção" / "Colecionadores também viram" (desktop).
 * 5 cards por página e bolinhas para trocar de página, como no Figma.
 */
export function NFTCarousel({ title, items, loading = false }: { title: string; items?: NFT[]; loading?: boolean }) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil((items?.length || 0) / PAGE_SIZE))
  const visible = items?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) || []

  return (
    <section aria-label={title} className="hidden md:block">
      <h2 className="border-b border-border pb-2 text-[17px] font-bold leading-6 text-accent-light">{title}</h2>

      <div className="mt-[33px] grid grid-cols-3 gap-[26px] lg:grid-cols-5">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index}>
                <Skeleton className="aspect-[219/254] w-full rounded-none" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            ))
          : visible.map((nft) => (
              <Link key={nft.id} to="/nft/$nftId" params={{ nftId: nft.id }} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <div className="flex aspect-[219/254] items-center bg-panel px-1">
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#eee8cc]">
                    <img src={nft.image} alt={`Arte do NFT ${nft.name}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  </div>
                </div>
                <h3 className="mt-[14px] truncate text-[15px] leading-5">{nft.name}</h3>
                <p className="text-[15px] font-bold leading-[18px] text-accent-light">{formatEth(nft.priceEth)}</p>
              </Link>
            ))}
      </div>

      <div className="mt-[30px] flex justify-center gap-2">
        {Array.from({ length: Math.max(3, pages) }).map((_, index) => {
          const disabled = index >= pages
          return (
            <button
              key={index}
              type="button"
              aria-label={`Página ${index + 1} de ${title}`}
              aria-current={index === page ? 'true' : undefined}
              disabled={disabled}
              onClick={() => setPage(index)}
              className={cn(
                'h-3 w-3 rounded-full border-[1.5px] border-accent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-light',
                index === page && 'bg-accent',
                disabled && 'cursor-default',
              )}
            />
          )
        })}
      </div>
    </section>
  )
}
