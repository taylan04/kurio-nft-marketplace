/** Only for this local MSW demonstration. No passwords are stored in plaintext. */
const ITERATIONS = 100_000

export function createPasswordSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) => n.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string, salt: string) {
  const secret = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bytes = Uint8Array.from(salt.match(/../g) || [], (pair) => parseInt(pair, 16))
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bytes, iterations: ITERATIONS, hash: 'SHA-256' }, secret, 256)
  return Array.from(new Uint8Array(bits), (n) => n.toString(16).padStart(2, '0')).join('')
}
