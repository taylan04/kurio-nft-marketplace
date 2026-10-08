import type { ReactNode } from 'react'
import { Header } from './Header'
import { MobileNavigation } from './MobileNavigation'
import { Footer } from './Footer'

type AppShellProps = {
  children: ReactNode
  withFooter?: boolean
  /** No Figma, só a Home tem a barra inferior no mobile; as demais telas têm cabeçalho próprio. */
  withMobileNav?: boolean
}

export function AppShell({ children, withFooter = true, withMobileNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className={withMobileNav ? 'pb-28 md:pb-0' : undefined}>{children}</main>
      {withFooter && <Footer />}
      {withMobileNav && <MobileNavigation />}
    </div>
  )
}
