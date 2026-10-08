const TOKEN_KEY = 'kurio-session-token'
const GUEST_KEY = 'kurio-guest-id'
const REDIRECT_KEY = 'kurio-post-login-redirect'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token?: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(GUEST_KEY, id)
  }
  return id
}

export function rememberRedirect(url: string) {
  sessionStorage.setItem(REDIRECT_KEY, url)
}

export function consumeRedirect() {
  const target = sessionStorage.getItem(REDIRECT_KEY)
  sessionStorage.removeItem(REDIRECT_KEY)
  return target || '/'
}
