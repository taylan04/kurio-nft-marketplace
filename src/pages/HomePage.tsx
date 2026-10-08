import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Settings2 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { NFTGrid } from '@/components/nft/NFTGrid'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNfts } from '@/hooks/useNfts'
import type { CatalogSearch } from '@/types/domain'
import { ErrorState } from '@/components/feedback/AsyncState'
import { HeroBanner } from '@/components/nft/HeroBanner'
import { MarketplaceFilters } from '@/components/nft/MarketplaceFilters'
import { SearchBar } from '@/components/nft/SearchBar'

export function HomePage() {
  const rawSearch = useSearch({ strict: false }) as CatalogSearch
  const navigate = useNavigate()
  const search = useMemo(
    () => ({ sort: 'recent', page: 1, ...rawSearch } satisfies CatalogSearch),
    [rawSearch],
  )
  const nfts = useNfts(search)
  const [draftQuery, setDraftQuery] = useState(search.q || '')

  // URL is the source of truth, including refresh and browser back/forward.
  useEffect(() => setDraftQuery(search.q || ''), [search.q])

  const updateSearch = (patch: Partial<CatalogSearch>, resetPage = true) =>
    navigate({
      to: '/',
      search: ((previous: CatalogSearch) => ({
        ...previous,
        ...patch,
        ...(resetPage ? { page: 1 } : {}),
      })) as never,
    })

  return (
    <AppShell>
      <div className="mx-auto max-w-page px-4 py-5 md:px-6 md:py-0 xl:px-0">
        {/* busca + filtros (mobile) */}
        <div className="mb-4 flex gap-2 md:hidden">
          <SearchBar
            value={draftQuery}
            onChange={setDraftQuery}
            onSubmit={() => updateSearch({ q: draftQuery || undefined })}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                aria-label="Abrir filtros"
                className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-[#b3703f] to-[#d38d52] p-0 text-[#2a160d] hover:opacity-90"
              >
                <Settings2 size={20} strokeWidth={1.8} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Filtros</DialogTitle>
              </DialogHeader>
              <MarketplaceFilters search={search} update={updateSearch} />
            </DialogContent>
          </Dialog>
        </div>

        <HeroBanner />

        <section className="mt-5 grid gap-8 md:mt-24 md:grid-cols-[230px_1fr] lg:grid-cols-[310px_1fr] lg:gap-12">
          <aside className="hidden md:block">
            <div className="bg-panel px-5 pb-[26px] pt-[17px]">
              <MarketplaceFilters search={search} update={updateSearch} />
            </div>

            {/* NFT em destaque */}
            <div className="mt-[25px]">
              <div className="bg-gradient-to-b from-[#2a1b11] to-[#1d130d] px-5 pb-4 pt-[26px]">
                <p className="text-2xl font-bold leading-7 text-accent-light">NFT EM DESTAQUE</p>
                <p className="mt-4 text-center text-[22px] font-bold leading-6">OFERTA LIMITADA</p>
              </div>
              <Link
                to="/nft/$nftId"
                params={{ nftId: '009' }}
                className="-mt-1.5 block aspect-[310/366] overflow-hidden rounded-[20px] bg-[#f7efd9]"
              >
                <img src="/nft-sage.webp" alt="Sage Nomad #009 em oferta limitada" loading="lazy" className="h-full w-full object-cover" />
              </Link>
            </div>
          </aside>

          <div>
            {/* abas + ordenação */}
            <div className="mb-4 flex flex-col justify-between gap-4 md:mb-7 lg:flex-row lg:items-start">
              <div className="flex gap-4 overflow-auto text-sm md:gap-[21px] md:text-[15px]" aria-label="Visões do catálogo">
                {([
                  ['all', 'Todos os NFTs', 'recent'],
                  ['new', 'Novos lançamentos', 'recent'],
                  ['trending', 'Em alta', 'popular'],
                ] as const).map(([tab, label, sort]) => {
                  const selected = (search.tab || 'all') === tab
                  return (
                    <button key={tab} type="button" aria-pressed={selected}
                      onClick={() => updateSearch(tab === 'all'
                        ? { tab: 'all', sort, category: undefined, network: '', q: undefined, minPrice: undefined, maxPrice: undefined }
                        : { tab, sort })}
                      className={`whitespace-nowrap pb-2 md:pb-0 md:font-medium md:leading-5 ${selected ? 'border-b-2 border-accent font-bold text-accent-light' : ''}`}>
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* ordenação: não existe no frame mobile */}
              <div className="hidden items-center text-[15px] leading-5 md:flex">
                <span id="sort-label">Ordenar por:</span>
                <Select
                  value={search.sort || 'recent'}
                  onValueChange={(value) =>
                    updateSearch({ sort: value as CatalogSearch['sort'], tab: value === 'popular' ? 'trending' : value === 'recent' ? 'new' : 'all' })
                  }
                >
                  <SelectTrigger aria-labelledby="sort-label" className="h-5 w-auto gap-1 border-0 px-0 pl-0.5 text-[15px] focus:ring-0 focus-visible:ring-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Listados recentemente</SelectItem>
                    <SelectItem value="price-asc">Menor preço</SelectItem>
                    <SelectItem value="price-desc">Maior preço</SelectItem>
                    <SelectItem value="popular">Mais populares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {nfts.isError ? (
              <ErrorState
                message="Não foi possível carregar o catálogo."
                retry={() => nfts.refetch()}
              />
            ) : (
              <NFTGrid items={nfts.data?.items} loading={nfts.isLoading} />
            )}

            {nfts.data && nfts.data.totalPages > 1 && (
              <nav aria-label="Paginação" className="mt-8 flex justify-end gap-[9px] md:mt-20">
                {Array.from({ length: nfts.data.totalPages }, (_, i) => i + 1).map((page) => {
                  const current = page === (search.page || 1)
                  return (
                    <button
                      key={page}
                      type="button"
                      aria-current={current ? 'page' : undefined}
                      aria-label={`Página ${page}`}
                      onClick={() => updateSearch({ page }, false)}
                      className={current ? pageCurrent : pageItem}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  type="button"
                  aria-label="Próxima página"
                  disabled={(search.page || 1) >= nfts.data.totalPages}
                  onClick={() => updateSearch({ page: (search.page || 1) + 1 }, false)}
                  className={pageItem}
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </div>
        </section>

        {/* banners inferiores (desktop) */}
        <section className="mt-[98px] hidden gap-[30px] md:grid lg:grid-cols-2">
          {banners.map((banner) => (
            <article key={banner.title} className="relative flex h-[250px] overflow-hidden rounded-md bg-panel">
              <img src={banner.image} alt="" loading="lazy" className="h-full w-[286px] shrink-0 rounded-[20px] object-cover" />
              {/* traço decorativo laranja do Figma */}
              <svg aria-hidden viewBox="0 0 80 120" className="pointer-events-none absolute bottom-0 left-0 h-[120px] w-20 text-accent/80" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M0 28c22 6 44 30 56 92M0 44c18 8 34 34 42 76" />
              </svg>
              <div className={`flex flex-1 flex-col items-end pt-9 text-right ${banner.padding}`}>
                <h2 className={`text-lg font-bold leading-6 ${banner.titleWidth}`}>{banner.title}</h2>
                <p className={`mt-[11px] text-sm leading-[23px] text-muted ${banner.textWidth}`}>{banner.text}</p>
                <button type="button" className="mt-auto mb-[45px] inline-flex h-10 w-[140px] items-center justify-center gap-1 rounded bg-accent text-[15px] font-medium text-[#1a100b] transition hover:brightness-110">
                  Explorar <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Diário da Cunhagem (desktop) */}
        <section aria-labelledby="journal-title" className="mt-[99px] hidden md:block">
          <h2 id="journal-title" className="text-center text-[28px] font-bold leading-[34px]">Diário da Cunhagem</h2>
          <p className="mt-3 text-center text-sm leading-5 text-muted">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
          <div className="mt-[39px] grid grid-cols-2 gap-6 lg:grid-cols-[repeat(4,268px)]">
            {posts.map((post) => (
              <article key={post.title} className="overflow-hidden rounded-md bg-panel">
                <img src={post.image} alt="" loading="lazy" className="h-[195px] w-full object-cover object-top" />
                <div className="px-4 pb-[15px] pt-[13px]">
                  <p className="text-xs font-medium leading-4 text-muted">{post.date}&nbsp;&nbsp;|&nbsp;&nbsp;{post.read}</p>
                  <h3 className="mt-[7px] text-base font-bold leading-[22px]">{post.title}</h3>
                  <p className="mt-[7px] text-xs leading-4 text-muted">{post.text}</p>
                  <span className="mt-[7px] block text-xs font-bold leading-4 text-accent-light">Ler mais →</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

const pageItem =
  'flex h-[33px] w-[34px] items-center justify-center rounded-[3px] border border-field text-base text-foreground transition hover:border-accent disabled:opacity-40'
const pageCurrent =
  'flex h-[33px] w-[34px] items-center justify-center rounded-[3px] bg-accent text-base font-bold text-background'

const banners = [
  {
    title: 'Lançamentos gênesis de edição limitada',
    text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    image: '/nft-emerald.webp',
    padding: 'pr-[30px]',
    titleWidth: 'max-w-[215px]',
    textWidth: 'max-w-[262px]',
  },
  {
    title: 'Arte digital selecionada e muito mais',
    text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a época.',
    image: '/nft-ivory.webp',
    padding: 'pr-[35px]',
    titleWidth: 'max-w-[262px]',
    textWidth: 'max-w-[250px]',
  },
]

const posts = [
  { image: '/nft-ivory.webp', date: '12 de setembro', read: 'Leitura de 6 min', title: 'Como funciona a propriedade de NFTs', text: 'Aprenda a colecionar, negociar e verificar ativos digitais.' },
  { image: '/nft-emerald.webp', date: '13 de setembro', read: 'Leitura de 2 min', title: '10 artistas digitais para acompanhar', text: 'Conheça criadores que moldam a cultura digital.' },
  { image: '/nft-sage.webp', date: '15 de setembro', read: 'Leitura de 3 min', title: 'Raridade, atributos e procedência', text: 'Entenda raridade, procedência, direitos autorais e utilidade.' },
  { image: '/nft-golden.webp', date: '15 de setembro', read: 'Leitura de 2 min', title: 'Como proteger sua carteira', text: 'Proteja sua carteira, seus ativos e sua identidade.' },
]
