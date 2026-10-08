import { isAxiosError } from 'axios'

export function apiErrorMessage(reason: unknown, fallback = 'Não foi possível concluir a operação.') {
  if (isAxiosError(reason)) {
    const payload = reason.response?.data as { message?: string } | undefined
    if (payload && typeof payload.message === 'string') return payload.message
  }
  return reason instanceof Error && reason.message ? reason.message : fallback
}
