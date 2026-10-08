import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSession, login, logout, register } from '@/api/auth'
import { setToken } from '@/lib/session'
import { clearCheckoutAttempt } from '@/lib/checkoutAttempt'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => fetchSession(signal),
    retry: false,
    staleTime: 30_000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.clear()
      setToken(session.token)
      queryClient.setQueryData(['session'], session)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      queryClient.clear()
      setToken(session.token)
      queryClient.setQueryData(['session'], session)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      setToken()
      clearCheckoutAttempt()
      queryClient.clear()
    },
  })
}
