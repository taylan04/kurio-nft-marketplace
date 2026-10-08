export type MockScenario = {
  latencyMs: number
  payment: 'confirmed' | 'declined'
  force500: boolean
}

const KEY = 'kurio-mock-scenario'
const defaults: MockScenario = { latencyMs: 250, payment: 'confirmed', force500: false }

export function getScenario(): MockScenario {
  const raw = localStorage.getItem(KEY)
  return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<MockScenario>) } : defaults
}

export function setScenario(next: Partial<MockScenario>) {
  localStorage.setItem(KEY, JSON.stringify({ ...getScenario(), ...next }))
}
