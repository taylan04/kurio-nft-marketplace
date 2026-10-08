import { useState } from 'react'
import type { NFT } from '@/types/domain'
import { NFTCard } from './NFTCard'
import { Skeleton } from '@/components/ui/skeleton'

// Mobile: 2 colunas com respiro vertical maior e coluna da direita deslocada (efeito "masonry" do Figma).
// md+: volta ao grid original.
const gridClass = 'grid grid-cols-2 gap-x-4 gap-y-6 pb-8 md:gap-x-[34px] md:gap-y-[68px] md:pb-0 lg:grid-cols-3'
const offsetClass = 'relative top-8 md:top-0'

export function NFTGrid({ items, loading = false }: { items?: NFT[]; loading?: boolean }) {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  const toggleFavorite = (id: string) =>
    setFavorites((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (loading)
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`min-w-0 ${index % 2 === 1 ? offsetClass : ''}`}>
            <Skeleton className="aspect-[172/197] w-full rounded-[20px] md:aspect-[258/300] md:rounded-none" />
            <Skeleton className="ml-2 mt-3 h-4 w-3/5 md:ml-0 md:w-4/5" />
            <Skeleton className="ml-2 mt-2 h-4 w-2/5 md:ml-0 md:w-1/2" />
          </div>
        ))}
      </div>
    )

  if (!items?.length)
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted md:rounded-none">
        Nenhum NFT encontrado com esses filtros.
      </div>
    )

  return (
    <div className={gridClass}>
      {items.map((nft, index) => (
        <div key={nft.id} className={`min-w-0 ${index % 2 === 1 ? offsetClass : ''}`}>
          <NFTCard nft={nft} favorite={favorites.has(nft.id)} onFavorite={() => toggleFavorite(nft.id)} />
        </div>
      ))}
    </div>
  )
}