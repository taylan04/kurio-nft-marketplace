import { Link } from '@tanstack/react-router'
import { ScanLine } from 'lucide-react'

// Ícones preenchidos (Material Icons) — o Figma usa glifos sólidos, não os de traço do lucide.
const PATHS = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  heart:
    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
} as const

function Glyph({ name, size = 24 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

// Cor padrão dos ícones inativos; o ativo (rota atual) fica laranja via data-status do TanStack Router.
const itemClass =
  'flex h-11 w-9 items-center justify-center rounded-full text-[#cfb28c] transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[status=active]:text-[#e89b55]'

export function MobileNavigation() {
  return (
    <nav aria-label="Navegação mobile" className="fixed inset-x-0 -bottom-0.5 z-40 h-[94px] md:hidden">
      {/* barra em 3 partes: esquerda | recorte central (SVG) | direita */}
      <div className="grid h-full grid-cols-[1fr_132px_1fr]">
        <div className="flex items-start justify-between -mr-0.5 rounded-tl-[36px] bg-panel pl-[26px] pr-[5px] pt-[29px]">
          <Link to="/" aria-label="Início" activeOptions={{ exact: true }} className={itemClass}>
            <Glyph name="home" />
          </Link>
          <button type="button" aria-label="Favoritos" className={itemClass}>
            <Glyph name="heart" />
          </button>
        </div>

        {/* recorte: halo escuro (fundo da página) + bordas arredondadas da barra */}
        <svg viewBox="0 0 132 94" width="132" height="94" aria-hidden="true" className="block">
          <path d="M2 0 A26 26 0 0 1 28 26 A46.04 46.04 0 0 0 104 26 A26 26 0 0 1 130 0 Z" fill="#100a07" />
          <path
            d="M0 0 H2 A26 26 0 0 1 28 26 A46.04 46.04 0 0 0 104 26 A26 26 0 0 1 130 0 H132 V94 H0 Z"
            className="fill-panel"
          />
        </svg>

        <div className="flex items-start justify-between -ml-0.5 rounded-tr-[36px] bg-panel pl-[5px] pr-[26px] pt-[29px]">
          <Link to="/cart" aria-label="Carrinho" className={itemClass}>
            <Glyph name="cart" size={20} />
          </Link>
          <Link to="/profile" aria-label="Perfil" className={itemClass}>
            <Glyph name="user" />
          </Link>
        </div>
      </div>

      {/* botão central flutuante (metade acima da barra); opaco para não vazar o conteúdo que rola por trás */}
      <button
        type="button"
        aria-label="Escanear"
        className="absolute left-1/2 top-0 z-10 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-[#8a5a33] to-[#c98446] text-[#f5f1eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ScanLine size={24} strokeWidth={1.8} />
      </button>
    </nav>
  )
}