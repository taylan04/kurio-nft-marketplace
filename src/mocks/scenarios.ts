export type MockScenario = {
  latencyMs: number
  payment: 'confirmed' | 'declined'
  force500: boolean
  expireSession: boolean
  // Apenas o próximo POST /orders: pedido é criado, mas a resposta demora mais que o timeout do Axios.
  timeoutAfterOrderCreation: boolean
}

const KEY = 'kurio-mock-scenario'
const defaults: MockScenario = { latencyMs: 250, payment: 'confirmed', force500: false, expireSession: false, timeoutAfterOrderCreation: false }

export function getScenario(): MockScenario {
  const raw = localStorage.getItem(KEY)
  return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<MockScenario>) } : defaults
}

export function setScenario(next: Partial<MockScenario>) {
  localStorage.setItem(KEY, JSON.stringify({ ...getScenario(), ...next }))
}

export function resetScenario() {
  localStorage.removeItem(KEY)
}
