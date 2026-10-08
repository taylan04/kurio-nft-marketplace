import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { MockScenarioPanel } from '@/components/mock/MockScenarioPanel'
import { useRealtime } from '@/hooks/useRealtime'
import { rememberRedirect } from '@/lib/session'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})

function RuntimeServices() {
  useRealtime()
  useEffect(() => {
    const sessionExpired = () => {
      const path = window.location.pathname + window.location.search
      if (/^\/(checkout|order|profile|wallets)(\/|$)/.test(path)) rememberRedirect(path)
      queryClient.clear()
      router.navigate({ to: '/login' })
    }
    window.addEventListener('kurio:session-expired', sessionExpired)
    return () => window.removeEventListener('kurio:session-expired', sessionExpired)
  }, [])
  return <><RouterProvider router={router}/><MockScenarioPanel/></>
}

export function App() {
  return <QueryClientProvider client={queryClient}><RuntimeServices/></QueryClientProvider>
}
