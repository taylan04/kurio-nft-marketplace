import type { SVGProps } from 'react'

/*
  Ícones desenhados para ficar iguais aos glifos do Figma.
  Onde o lucide já é idêntico (Search, LogOut, ChevronLeft...), usamos o lucide direto nos componentes.
*/

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number, props: IconProps) => ({
  width: size,
  height: size,
  'aria-hidden': true as const,
  focusable: 'false' as const,
  ...props,
})

/* Carrinho de traço com a linha interna (header desktop) */
export function CartOutlineIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...base(size, props)}>
      <path d="M2.5 3h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7.2H6" />
      <path d="M10 10.5h4" />
      <circle cx="9.3" cy="19.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* Carrinho sólido (Material) — barra mobile e botão do detalhe */
export function CartSolidIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  )
}

/* Olho riscado do Figma (campos de senha) */
export function EyeOffIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...base(size, props)}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 20 20 4" />
    </svg>
  )
}

export function EyeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...base(size, props)}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/* "G" colorido do Google */
export function GoogleIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, props)}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

/* "f" azul do Facebook (botão social) */
export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 320 512" fill="#3b5998" {...base(size, props)}>
      <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z" />
    </svg>
  )
}

/* Ícones das redes sociais do rodapé (preenchidos, como no Figma) */
export const SocialIcons = {
  facebook: (p: IconProps) => (
    <svg viewBox="0 0 320 512" fill="currentColor" {...base(p.size ?? 16, p)}>
      <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z" />
    </svg>
  ),
  instagram: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...base(p.size ?? 16, p)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: (p: IconProps) => (
    <svg viewBox="0 0 512 512" fill="currentColor" {...base(p.size ?? 16, p)}>
      <path d="M459.4 151.7c.3 4.5.3 9.1.3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
    </svg>
  ),
  linkedin: (p: IconProps) => (
    <svg viewBox="0 0 448 512" fill="currentColor" {...base(p.size ?? 16, p)}>
      <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
    </svg>
  ),
  youtube: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(p.size ?? 16, p)}>
      <path fillRule="evenodd" d="M5 5h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm2 4v6h10V9H7zm3.5 1.2v3.6L13.6 12l-3.1-1.8z" />
    </svg>
  ),
}

/* Ícone do botão central da barra mobile (scan) */
export function ScanIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" {...base(size, props)}>
      <path d="M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15M7.5 12h9" />
    </svg>
  )
}

/* Envelope "THANK YOU" da confirmação de pedido */
export function ThankYouIcon({ size = 80, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round" {...base(size, props)}>
      <path d="M12 34v36a3 3 0 0 0 3 3h50a3 3 0 0 0 3-3V34" />
      <path d="M12 34l10-8M68 34l-10-8" />
      <path d="M12 72l22-20M68 72L46 52" />
      <path d="M22 50V10a3 3 0 0 1 3-3h10l5-4 5 4h10a3 3 0 0 1 3 3v40" />
      <path d="M22 50l18 12 18-12" />
      <text x="40" y="23" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Roboto Mono, monospace" fontWeight="800" fontSize="10.5">THANK</text>
      <text x="40" y="35" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Roboto Mono, monospace" fontWeight="800" fontSize="10.5">YOU</text>
    </svg>
  )
}
