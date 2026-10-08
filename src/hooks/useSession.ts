import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSession, login, logout, register } from '@/api/auth'
import { setToken } from '@/lib/session'

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
      setToken(session.token)
      queryClient.setQueryData(['session'], session)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      setToken()
      queryClient.clear()
    },
  })
}
