import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { MockScenarioPanel } from '@/components/mock/MockScenarioPanel'
import { useRealtime } from '@/hooks/useRealtime'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})

function RuntimeServices() {
  useRealtime()
  return <><RouterProvider router={router}/><MockScenarioPanel/></>
}

export function App() {
  return <QueryClientProvider client={queryClient}><RuntimeServices/></QueryClientProvider>
}
