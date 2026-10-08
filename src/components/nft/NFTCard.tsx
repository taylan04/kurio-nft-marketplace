import { Link } from '@tanstack/react-router'
import { Heart, Search } from 'lucide-react'
import type { NFT } from '@/types/domain'
import { formatEth } from '@/lib/money'
import { useCart } from '@/hooks/useCart'
import { CartOutlineIcon } from '@/components/icons'

const hoverAction =
  'flex h-[34px] w-[34px] items-center justify-center rounded-[3px] bg-panel text-foreground transition hover:text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function NFTCard({ nft, onFavorite, favorite = false }: { nft: NFT; favorite?: boolean; onFavorite?: () => void }) {
  const cart = useCart()

  return (
    <article className="group relative min-w-0">
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="block rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:rounded-none"
      >
        {/* Mobile: painel arredondado com a imagem. Desktop: painel 258x300 com a imagem 250x250 centralizada. */}
        <div className="relative rounded-[20px] bg-panel px-[3px] pb-5 pt-3 md:rounded-none md:px-1 md:py-[25px]">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eee8cc] md:rounded-[14px]">
            <img
              src={nft.image}
              alt={`Arte do NFT ${nft.name}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 md:group-hover:scale-[1.03]"
            />
          </div>

          {nft.rarity && (
            <span className="absolute left-0 top-3 bg-accent px-[18px] py-2 text-xs font-black leading-4 text-black md:top-[15px] md:flex md:h-7 md:items-center md:px-[15px] md:py-0 md:text-[15px] md:font-medium">
              {nft.rarity === 'RARE' ? 'RARO' : nft.rarity}
            </span>
          )}
        </div>

        <div className="px-2 pt-2.5 md:px-0 md:pt-[11px]">
          <h3 className="truncate text-[15px] leading-[17px] md:leading-5">{nft.name}</h3>
          <p className="text-base font-bold leading-[17px] text-accent-light md:mt-2 md:leading-5">
            {formatEth(nft.priceEth)}
            {nft.previousPriceEth && (
              <span className="ml-3 font-normal text-muted-dim">
                <span className="sr-only">Preço anterior: </span>
                {formatEth(nft.previousPriceEth)}
              </span>
            )}
          </p>
        </div>
      </Link>

      {/* Favoritar (mobile): bolinha no canto da imagem */}
      {onFavorite && (
        <button
          type="button"
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={favorite}
          onClick={onFavorite}
          className="absolute right-2.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 text-accent focus:outline-none focus:ring-2 focus:ring-accent md:hidden"
        >
          <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Ações rápidas (desktop, ao passar o mouse/focar), como no frame do Figma */}
      {/* camada com o mesmo tamanho do painel (258x300 no Figma); só os botões recebem clique */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden aspect-[258/300] items-end justify-center gap-[11px] pb-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 md:flex [&>*]:pointer-events-auto">
        <button
          type="button"
          aria-label={`Adicionar ${nft.name} ao carrinho`}
          disabled={cart.add.isPending}
          onClick={() => cart.add.mutate({ nftId: nft.id, edition: nft.selectedEdition, quantity: 1 })}
          className={hoverAction}
        >
          <CartOutlineIcon size={20} />
        </button>
        {onFavorite && (
          <button type="button" aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} aria-pressed={favorite} onClick={onFavorite} className={hoverAction}>
            <Heart size={19} strokeWidth={1.8} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        )}
        <Link to="/nft/$nftId" params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`} className={hoverAction}>
          <Search size={19} strokeWidth={2} />
        </Link>
      </div>
    </article>
  )
}
