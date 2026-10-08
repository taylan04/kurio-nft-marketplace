import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, Mail, Minus, Plus, Search, Star } from 'lucide-react'
import type { Edition, NFT } from '@/types/domain'
import { AppShell } from '@/components/layout/AppShell'
import { NFTCarousel } from '@/components/nft/NFTCarousel'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialIcons } from '@/components/icons'
import { useNfts } from '@/hooks/useNfts'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

export const editionLabel = (edition: Edition) => (edition === 'OPEN' ? 'ABERTA' : edition)

type Props = {
  nft: NFT
  favorite: boolean
  onFavorite: () => void
  quantity: number
  maxQuantity: number
  onQuantity: (value: number) => void
  edition: Edition
  onEdition: (value: Edition) => void
  onBuy: () => void
  pending: boolean
}

const qtyButton =
  'flex h-12 w-[31px] items-center justify-center rounded-full bg-accent text-background transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed'

function Breadcrumb() {
  return (
    <nav aria-label="Você está em" className="pt-8 text-[15px] font-bold leading-5">
      <Link to="/" className="hover:text-accent-light">Início</Link>
      <span aria-hidden> / </span>
      <Link to="/" search={{ category: 'Arte digital' } as never} className="hover:text-accent-light">Mercado</Link>
    </nav>
  )
}

export function NFTDetailsDesktop(props: Props) {
  const { nft, favorite, onFavorite, quantity, maxQuantity, onQuantity, edition, onEdition, onBuy, pending } = props
  const [thumb, setThumb] = useState(0)
  const page1 = useNfts({ sort: 'recent', page: 1 })
  const page2 = useNfts({ sort: 'recent', page: 2 })
  const related = [...(page1.data?.items || []), ...(page2.data?.items || [])].filter((item) => item.id !== nft.id).slice(0, 15)
  const fullStars = Math.floor(nft.rating)

  return (
    <AppShell withMobileNav={false}>
      <div className="mx-auto max-w-page px-6 xl:px-0">
        <Breadcrumb />

        <div className="mt-[9px] grid gap-8 lg:grid-cols-[571px_1fr] lg:gap-[34px]">
          {/* galeria: miniaturas + imagem principal */}
          <div className="grid grid-cols-[100px_1fr] gap-7">
            <div className="flex flex-col gap-4" role="group" aria-label="Miniaturas">
              {Array.from({ length: 4 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ver imagem ${index + 1} de ${nft.name}`}
                  aria-pressed={thumb === index}
                  onClick={() => setThumb(index)}
                  className={cn(
                    'h-[100px] w-[100px] overflow-hidden rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    thumb === index ? 'border-accent' : 'border-transparent',
                  )}
                >
                  <img src={nft.image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="relative mt-0.5 self-start rounded-md bg-panel p-5">
              <div className="aspect-square overflow-hidden rounded-[20px] bg-[#eee8cc]">
                <img src={nft.image} alt={`Imagem principal de ${nft.name}`} className="h-full w-full object-cover" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" aria-label="Ampliar imagem" className="absolute right-3 top-3 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2f1d15] text-foreground transition hover:text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <Search size={20} strokeWidth={2.2} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[640px] p-4">
                  <DialogTitle className="sr-only">{nft.name}</DialogTitle>
                  <img src={nft.image} alt={`Imagem ampliada de ${nft.name}`} className="w-full rounded-[20px]" />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* informações */}
          <div>
            <h1 className="text-[28px] font-bold leading-[34px]">{nft.name}</h1>

            <div className="mt-2.5 flex items-center justify-between">
              <p className="text-[22px] font-bold leading-7 text-accent-light">{formatEth(nft.priceEth)}</p>
              <p className="flex items-center gap-1 text-[15px] leading-5">
                <span className="flex gap-[3px]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} strokeWidth={0} fill={index < fullStars ? '#d28a4c' : '#cfb28c'} />
                  ))}
                </span>
                <span className="sr-only">Nota {nft.rating} de 5,</span>
                {nft.reviews} avaliações de colecionadores
              </p>
            </div>
            <hr className="mr-[22px] mt-1.5 border-border" />

            <h2 className="mt-[13px] text-sm font-bold leading-5">Sobre este NFT:</h2>
            <p className="mt-[9px] text-sm leading-6 text-muted">{nft.description}</p>

            <h2 className="mt-1.5 text-sm font-bold leading-5">Edição:</h2>
            <div role="radiogroup" aria-label="Edição" className="mt-[11px] flex flex-wrap gap-[7px]">
              {nft.editions.map((ed) => {
                const active = ed === edition
                return (
                  <button
                    key={ed}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onEdition(ed)}
                    className={cn(
                      'h-6 rounded-full border px-2 text-[13px] leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      active ? 'border-accent font-bold text-accent-light' : 'border-field text-muted hover:text-foreground',
                    )}
                  >
                    {editionLabel(ed)}
                  </button>
                )
              })}
            </div>

            <div className="mt-[17px] flex items-start justify-between">
              <div className="flex items-center">
                <button type="button" aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => onQuantity(Math.max(1, quantity - 1))} className={qtyButton}>
                  <Minus size={22} strokeWidth={2.2} />
                </button>
                <span aria-live="polite" aria-label={`Quantidade: ${quantity}`} className="mx-[18px] min-w-[11px] text-center text-lg">{quantity}</span>
                <button type="button" aria-label="Aumentar quantidade" disabled={quantity >= maxQuantity} onClick={() => onQuantity(Math.min(maxQuantity, quantity + 1))} className={qtyButton}>
                  <Plus size={22} strokeWidth={2.2} />
                </button>
              </div>

              <div className="flex gap-2">
                <button type="button" disabled={pending} onClick={onBuy} className="h-10 w-[130px] rounded-[3px] bg-accent text-sm font-bold text-[#1a100b] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-60">
                  COMPRAR
                </button>
                <button type="button" aria-pressed={favorite} onClick={onFavorite} className="flex h-10 w-[130px] items-center justify-center gap-2 rounded-[3px] border border-accent text-sm text-accent-light transition hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <Heart size={20} strokeWidth={1.8} fill={favorite ? 'currentColor' : 'none'} />
                  {favorite ? 'Favoritado' : 'Favoritar'}
                </button>
              </div>
            </div>

            <dl className="mt-[13px] space-y-2 text-[15px] leading-6 text-muted-dim">
              <div><dt className="inline">ID do token: </dt><dd className="inline">{nft.tokenId}</dd></div>
              <div><dt className="inline">Coleção: </dt><dd className="inline">{nft.collection}</dd></div>
              <div><dt className="inline">Atributos: </dt><dd className="inline">{nft.attributes.join(', ')}</dd></div>
            </dl>

            <div className="mt-2 flex items-center gap-2 text-sm font-bold leading-5">
              <span>Compartilhar este NFT:</span>
              <a href="#" onClick={(event) => event.preventDefault()} aria-label="Compartilhar no LinkedIn" className="hover:text-accent-light"><SocialIcons.linkedin size={16} /></a>
              <a href={`mailto:?subject=${encodeURIComponent(nft.name)}`} aria-label="Compartilhar por e-mail" className="hover:text-accent-light"><Mail size={17} strokeWidth={1.8} /></a>
              <a href="#" onClick={(event) => event.preventDefault()} aria-label="Compartilhar no Twitter" className="hover:text-accent-light"><SocialIcons.twitter size={16} /></a>
            </div>
          </div>
        </div>

        {/* abas de detalhes / avaliações */}
        <Tabs defaultValue="details" className="mt-[94px]">
          <TabsList className="flex w-full gap-[33px] border-b border-border">
            <TabsTrigger value="details" className="-mb-px border-b-[3px] px-0 pb-1.5 pr-[7px] pt-0 text-[17px] leading-6 data-[state=active]:font-bold data-[state=active]:text-accent-light">
              Detalhes do NFT
            </TabsTrigger>
            <TabsTrigger value="reviews" className="-mb-px border-b-[3px] px-0 pb-1.5 pt-0 text-[17px] leading-6 data-[state=active]:font-bold data-[state=active]:text-accent-light">
              Avaliações de colecionadores ({nft.reviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-3 text-sm leading-6 text-muted">
            <p>
              {nft.name} é uma obra digital {editionLabel(nft.selectedEdition)} finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na {nft.network}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
            </p>
            <p className="mt-6">
              A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.
            </p>
            <h3 className="mt-3.5 font-bold leading-5 text-foreground">Rede:</h3>
            <p className="mt-0.5">Cunhado na {nft.network} com procedência imutável e metadados armazenados no IPFS.</p>
            <h3 className="mt-3.5 font-bold leading-5 text-foreground">Contrato:</h3>
            <p className="mt-0.5">Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
            <h3 className="mt-3.5 font-bold leading-5 text-foreground">Direitos autorais:</h3>
            <p className="mt-0.5">0x7A42...19E8 • Contrato inteligente ERC-721 verificado.</p>
          </TabsContent>
          <TabsContent value="reviews" className="mt-3 text-sm leading-6 text-muted">
            <p>
              Nota média {nft.rating.toFixed(1).replace('.', ',')} de 5 com base em {nft.reviews} avaliações de colecionadores verificados.
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-[93px]">
          <NFTCarousel title="Mais desta coleção" items={related} loading={page1.isLoading} />
        </div>
      </div>
    </AppShell>
  )
}

/** Mesmas dimensões do layout final, para não "pular" quando os dados chegam */
export function NFTDetailsDesktopSkeleton({ notFound = false }: { notFound?: boolean }) {
  return (
    <AppShell withMobileNav={false}>
      <div className="mx-auto max-w-page px-6 xl:px-0">
        <Breadcrumb />
        {notFound ? (
          <p role="alert" className="mt-10 text-lg">NFT não encontrado.</p>
        ) : (
          <div className="mt-[9px] grid gap-8 lg:grid-cols-[571px_1fr] lg:gap-[34px]" aria-busy="true" aria-label="Carregando NFT">
            <div className="grid grid-cols-[100px_1fr] gap-7">
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[100px] w-[100px]" />)}
              </div>
              <Skeleton className="aspect-square w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-1/2" />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
