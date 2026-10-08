import type { ReactNode } from 'react'
import { AccountSidebar } from './AccountSidebar'

export function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-7 px-5 py-8 md:flex-row md:px-6 md:pt-8 xl:px-0">
      <AccountSidebar />
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  )
}
