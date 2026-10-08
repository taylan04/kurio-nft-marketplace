import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, Heart, Minus, Plus, Star } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useFavorites, useNft } from '@/hooks/useNfts'
import { useSession } from '@/hooks/useSession'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { formatEth, multiplyEth } from '@/lib/money'
import type { Edition } from '@/types/domain'
import { NFTDetailsDesktop, NFTDetailsDesktopSkeleton, editionLabel } from '@/components/nft/NFTDetailsDesktop'

/*
  Paleta do design (valores exatos):
  fundo / barra de compra ... #2a1912
  painel de detalhes ........ #1d120d
  laranja (destaque) ........ #d98c52
  texto principal ........... #f3e6d8
  texto corpo ............... #e9d5c3
  texto secundário .......... #b9a392
*/

const topButton =
  'flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#1d120d] text-[#d98c52] transition hover:bg-[#3a251b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d98c52]'

const stepButton =
  'flex h-[26px] w-[18px] items-center justify-center rounded-full bg-[#d98c52] text-[#1d120d] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3e6d8] disabled:cursor-not-allowed'

/* Carrinho sólido (estilo Material Design), mais próximo do ícone do Figma */
function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  )
}

export function NFTDetailsPage() {
  const { nftId } = useParams({ strict: false }) as { nftId: string }
  const nft = useNft(nftId)
  const cart = useCart()
  const session = useSession()
  const favorites = useFavorites(Boolean(session.data))
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [edition, setEdition] = useState<Edition | null>(null)
  const isDesktop = useIsDesktop()

  if (isDesktop && (nft.isLoading || !nft.data)) return <NFTDetailsDesktopSkeleton notFound={!nft.isLoading} />
  if (nft.isLoading) return <div className="min-h-screen bg-[#2a1912] p-8 font-mono text-white">Carregando NFT...</div>
  if (!nft.data) return <div className="min-h-screen bg-[#2a1912] p-8 font-mono text-white">NFT não encontrado.</div>

  const item = nft.data
  const favorite = favorites.data?.includes(item.id) || false
  const selectedEdition = edition ?? item.selectedEdition
  const maxQuantity = item.available ?? 99
  const total = multiplyEth(item.priceEth, quantity)

  const addToCart = (goToCart: boolean) =>
    cart.add.mutate(
      { nftId: item.id, edition: selectedEdition, quantity },
      { onSuccess: goToCart ? () => navigate({ to: '/cart' }) : undefined },
    )

  const toggleFavorite = () => {
    if (!session.data) return navigate({ to: '/login' })
    favorites.toggle.mutate({ id: item.id, favorite })
  }

  if (isDesktop)
    return (
      <NFTDetailsDesktop
        nft={item}
        favorite={favorite}
        onFavorite={toggleFavorite}
        quantity={quantity}
        maxQuantity={maxQuantity}
        onQuantity={setQuantity}
        edition={selectedEdition}
        onEdition={setEdition}
        onBuy={() => addToCart(true)}
        pending={cart.add.isPending}
      />
    )

  return (
    <>
      <div className="min-h-screen bg-[#2a1912] font-mono">
        <article className="mx-auto w-full max-w-[420px] px-4 pt-6 text-[#e9d5c3]">
          {/* Topo */}
          <header className="mb-2 flex items-center justify-between px-3">
            <button
              type="button"
              aria-label="Voltar"
              onClick={() => navigate({ to: '/' })}
              className={topButton}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              aria-label="Favoritar"
              aria-pressed={favorite}
              onClick={toggleFavorite}
              className={topButton}
            >
              <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </header>

          {/* Imagem */}
          <div className="mx-3 overflow-hidden rounded-[20px] bg-[#ece7d3]">
            <img
              src={item.image}
              alt={item.name}
              className="aspect-square w-full object-cover object-top"
            />
          </div>

          {/* Painel de detalhes
              pb-36 reserva espaço para a barra fixa não cobrir o conteúdo */}
          <section className="relative z-10 -mx-4 -mt-10 rounded-t-3xl bg-[#241612] px-6 pb-48 pt-[44px]">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-lg font-bold leading-tight text-[#f3e6d8]">{item.name}</h1>
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#d98c52] px-2 py-0.5 text-[11px] font-semibold text-[#f3e6d8]">
                <Star size={11} fill="currentColor" className="text-[#d98c52]" />
                {item.rating}
                <span className="font-normal">({item.reviews})</span>
              </span>
            </div>

            <p className="mt-2.5 text-sm leading-6 text-muted">{item.description}</p>

            <h2 className="mb-2 mt-2 text-sm font-bold leading-5 text-[#f3e6d8]">Edição:</h2>
            <div role="radiogroup" aria-label="Edição" className="flex flex-wrap gap-2">
              {item.editions.map((ed, index) => {
                const active = ed === selectedEdition
                return (
                  <button
                    key={`${ed}-${index}`}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setEdition(ed)}
                    className={`h-6 rounded-full border px-2 text-[13px] leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d98c52] ${
                      active
                        ? 'border-[#d98c52] font-bold text-[#e89b55]'
                        : 'border-[#3f2319] text-muted hover:text-[#f3e6d8]'
                    }`}
                  >
                    {editionLabel(ed)}
                  </button>
                )
              })}
            </div>

            <dl className="mt-3 text-sm leading-8 text-muted-dim">
              <div>
                <dt className="inline">ID do token: </dt>
                <dd className="inline">{item.tokenId}</dd>
              </div>
              <div>
                <dt className="inline">Coleção: </dt>
                <dd className="inline">{item.collection}</dd>
              </div>
              <div>
                <dt className="inline">Atributos: </dt>
                <dd className="inline">{item.attributes.join(', ')}</dd>
              </div>
            </dl>
          </section>
        </article>

        {/* Barra de compra fixa no rodapé, com sombra */}
        <footer className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[420px] rounded-t-3xl bg-[#241612] px-6 pb-[max(34px,env(safe-area-inset-bottom))] pt-6 shadow-[0_-4px_14px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[15px] font-bold text-[#CFB28C]">
              <span>Qtd.</span>
              <button
                type="button"
                aria-label="Diminuir quantidade"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={stepButton}
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span aria-live="polite" className="w-4 text-center text-xl font-medium text-[#f3e6d8]">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                disabled={quantity >= maxQuantity}
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                className={stepButton}
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>

            <p className="text-xl font-bold text-accent-light">{formatEth(total)}</p>
          </div>

          {/* Botão à esquerda (largura fixa) + carrinho colado ao lado, como no Figma */}
          <div className="mt-5 flex items-center justify-start gap-3">
            <button
              type="button"
              disabled={cart.add.isPending}
              onClick={() => addToCart(true)}
              className="h-[60px] w-[196px] shrink-0 rounded-full bg-gradient-to-r from-[#d99357] to-[#b77a49] text-[15px] font-bold text-[#241612] shadow-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3e6d8] disabled:opacity-60"
            >
              Comprar NFT
            </button>

            <button
              type="button"
              aria-label="Adicionar ao carrinho"
              disabled={cart.add.isPending}
              onClick={() => addToCart(false)}
              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#2f1d15] text-[#d98c52] transition hover:bg-[#4a2f22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d98c52] disabled:opacity-60"
            >
              <CartIcon size={20} />
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}