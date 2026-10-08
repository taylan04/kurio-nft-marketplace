import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import type { CatalogSearch } from '@/types/domain'
import { HomePage } from '@/pages/HomePage'
import { NFTDetailsPage } from '@/pages/NFTDetailsPage'
import { CartPage } from '@/pages/CartPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderPage } from '@/pages/OrderPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { WalletsPage } from '@/pages/WalletsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { getToken, rememberRedirect } from '@/lib/session'

const rootRoute = createRootRoute({ component: () => <Outlet/>, notFoundComponent: NotFoundPage })

function parseCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const page = Number(search.page || 1)
  return {
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
    category: typeof search.category === 'string' && search.category ? search.category : undefined,
    network: typeof search.network === 'string' ? search.network as CatalogSearch['network'] : '',
    minPrice: typeof search.minPrice === 'string' && search.minPrice ? search.minPrice : undefined,
    maxPrice: typeof search.maxPrice === 'string' && search.maxPrice ? search.maxPrice : undefined,
    sort: ['recent','price-asc','price-desc','popular'].includes(String(search.sort)) ? search.sort as CatalogSearch['sort'] : 'recent',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

function privateBeforeLoad(locationHref: string) {
  if (!getToken()) {
    rememberRedirect(locationHref)
    throw redirect({ to: '/login' })
  }
}

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: parseCatalogSearch, component: HomePage })
const nftRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: NFTDetailsPage })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: CartPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage })
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', beforeLoad: ({ location }) => privateBeforeLoad(location.href), component: CheckoutPage })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/order/$orderId', beforeLoad: ({ location }) => privateBeforeLoad(location.href), component: OrderPage })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', beforeLoad: ({ location }) => privateBeforeLoad(location.href), component: ProfilePage })
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', beforeLoad: ({ location }) => privateBeforeLoad(location.href), component: WalletsPage })

const routeTree = rootRoute.addChildren([homeRoute, nftRoute, cartRoute, loginRoute, registerRoute, checkoutRoute, orderRoute, profileRoute, walletsRoute])

export const router = createRouter({ routeTree, defaultPreload: 'intent', scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
