import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { SearchBar } from '@/components/nft/SearchBar'
import { LogOut, Search, User } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useSession } from '@/hooks/useSession'
import { CartOutlineIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

// Mercado fica ativo nas telas de compra (detalhe, carrinho e pagamento), como no Figma.
const MARKET_PATHS = ['/nft', '/cart', '/checkout']

const navItem =
  'flex h-full items-start border-b-[3px] border-transparent pt-[22px] text-base leading-[22px] text-foreground transition-colors hover:text-accent-light'
const navActive = 'border-accent font-medium text-accent-light'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()
  const cart = useCart()
  const session = useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const count = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  const inMarket = MARKET_PATHS.some((path) => pathname.startsWith(path))

  return (
    <header className="sticky top-0 z-40 hidden bg-background md:block">
      <div className="mx-auto grid h-[68px] max-w-page grid-cols-[1fr_auto_1fr] items-center border-b border-border md:mx-6 xl:mx-auto">
        <Link to="/" className="justify-self-start text-sm font-bold tracking-[0.12em]">
          KURIO
        </Link>

        <nav aria-label="Navegação principal" className="flex h-full gap-6 lg:relative lg:right-6 lg:gap-10">
          {/* no Figma, Início fica ativo também em login, cadastro, perfil e carteiras */}
          <Link to="/" className={cn(navItem, !inMarket && navActive)}>
            Início
          </Link>
          <Link to="/" search={{ category: 'Arte digital' } as never} className={cn(navItem, inMarket && navActive)}>
            Mercado
          </Link>
          <span className={cn(navItem, 'cursor-default')} aria-disabled="true">Criadores</span>
          <span className={cn(navItem, 'cursor-default')} aria-disabled="true">Aprenda</span>
        </nav>

        <div className="flex items-center gap-7 justify-self-end">
          <div className="relative">
            <button type="button" aria-label="Buscar NFTs" aria-expanded={searchOpen} aria-controls="desktop-nft-search"
              className="text-foreground transition-colors hover:text-accent-light"
              onClick={() => setSearchOpen((current) => !current)}>
              <Search size={22} strokeWidth={2} />
            </button>
            {searchOpen && (
              <div id="desktop-nft-search" className="absolute right-0 top-9 z-50 w-72 rounded-xl border border-border bg-panel p-2 shadow-soft">
                <SearchBar value={searchText} onChange={setSearchText} onSubmit={() => {
                  void navigate({ to: '/', search: { q: searchText || undefined, network: '', sort: 'recent', page: 1 } as never })
                  setSearchOpen(false)
                }} />
              </div>
            )}
          </div>
          <Link to="/cart" className="relative text-foreground transition-colors hover:text-accent-light" aria-label={`Carrinho com ${count} itens`}>
            <CartOutlineIcon size={26} />
            {count > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-background">
                {count}
              </span>
            )}
          </Link>
          <Link
            to={session.data ? '/profile' : '/login'}
            className="inline-flex h-[34px] items-center gap-1.5 rounded bg-accent px-2.5 text-base font-medium text-[#1a100b] transition hover:brightness-110"
          >
            {session.data ? <User size={18} strokeWidth={2} /> : <LogOut size={18} strokeWidth={2} />}
            {session.data ? 'Perfil' : 'Entrar'}
          </Link>
        </div>
      </div>
    </header>
  )
}
