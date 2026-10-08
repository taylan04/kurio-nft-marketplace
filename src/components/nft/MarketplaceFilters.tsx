import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import type { CatalogSearch, Network } from '@/types/domain'
import { cn } from '@/lib/utils'

// Contagens exibidas no Figma
const categories: Array<[string, number]> = [
  ['Arte digital', 33], ['Fotografia', 12], ['Música', 65], ['Arte 3D', 39], ['Colecionáveis', 23],
  ['Generativa', 17], ['Jogos', 19], ['Assinaturas', 13], ['Utilidade', 18],
]
const networks: Array<[Network, number]> = [['Ethereum', 119], ['Polygon', 78], ['Solana', 86]]

const PRICE_MIN = 0.02
const PRICE_MAX = 12.3
// o trilho do Figma vai um pouco além do valor máximo padrão
const SLIDER_MAX = 16
const formatBr = (value: number) => value.toFixed(2).replace('.', ',')

type Props = { search: CatalogSearch; update: (patch: Partial<CatalogSearch>) => void }

export function MarketplaceFilters({ search, update }: Props) {
  const [range, setRange] = useState<number[]>([
    Number(search.minPrice ?? PRICE_MIN),
    Number(search.maxPrice ?? PRICE_MAX),
  ])

  useEffect(() => {
    setRange([Number(search.minPrice ?? PRICE_MIN), Number(search.maxPrice ?? PRICE_MAX)])
  }, [search.minPrice, search.maxPrice])

  return (
    <div>
      <h2 className="text-lg font-bold leading-6">Coleções</h2>
      <ul className="mt-4 space-y-4 pl-3 pr-[13px]">
        {categories.map(([category, count]) => {
          const active = search.category === category
          return (
            <li key={category}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => update({ category: active ? undefined : category })}
                className={cn('flex w-full justify-between text-left text-[15px] leading-6 transition-colors hover:text-accent-light', active ? 'text-accent-light' : 'text-muted')}
              >
                <span>{category}</span>
                <span className="font-bold">({count})</span>
              </button>
            </li>
          )
        })}
      </ul>

      <h2 className="mt-[44px] text-lg font-bold leading-6">Faixa de preço</h2>
      <div className="mt-2 pl-4">
        <Slider
          min={PRICE_MIN}
          max={SLIDER_MAX}
          step={0.01}
          minStepsBetweenThumbs={1}
          value={range}
          onValueChange={setRange}
        />
      </div>
      <p className="mt-[15px] pl-3 text-sm leading-5">
        Preço: {formatBr(range[0])} - {formatBr(range[1])} ETH
      </p>
      <button
        type="button"
        onClick={() => update({ minPrice: range[0].toFixed(2), maxPrice: range[1].toFixed(2) })}
        className="ml-3 mt-[11px] h-9 rounded-[3px] bg-accent px-3 text-[15px] font-bold text-background transition hover:brightness-110"
      >
        Aplicar
      </button>

      <h2 className="mt-9 text-lg font-bold leading-6">Rede</h2>
      <ul className="mt-4 space-y-4 pl-3">
        {networks.map(([network, count]) => {
          const active = search.network === network
          return (
            <li key={network}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => update({ network: active ? '' : network })}
                className={cn('flex w-full justify-between text-left text-[15px] leading-6 transition-colors hover:text-accent-light', active ? 'text-accent-light' : 'text-muted')}
              >
                <span>{network}</span>
                <span className="text-muted-dim">({count})</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
