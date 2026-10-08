import type { CollectorDetails, Wallet } from '@/types/domain'

export type CollectorErrors = Partial<Record<keyof CollectorDetails, string>>

/** Shared validation for the collector form and the MSW REST contract. */
export function validateCollector(details: CollectorDetails, savedWallet?: Wallet): CollectorErrors {
  const errors: CollectorErrors = {}
  const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
  if (!text(details.displayName)) errors.displayName = 'Informe o nome de exibição.'
  if (text(details.username).length < 3) errors.username = 'Use pelo menos 3 caracteres.'
  if (!text(details.profileName)) errors.profileName = 'Informe o nome do perfil.'
  if (!['Ethereum', 'Polygon', 'Solana'].includes(details.network)) errors.network = 'Selecione uma rede.'
  if (!text(details.walletAddress).startsWith('0x') || text(details.walletAddress).length < 8)
    errors.walletAddress = 'Informe um endereço de carteira válido.'
  if (!['Coinbase Wallet', 'MetaMask', 'WalletConnect'].includes(details.walletType)) errors.walletType = 'Selecione uma carteira.'
  if (!text(details.referralCode)) errors.referralCode = 'Informe o código de indicação.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text(details.email))) errors.email = 'Informe um e-mail válido.'
  if (!text(details.ens)) errors.ens = 'Informe o nome ENS.'
  if (text(details.note).length > 500) errors.note = 'Use no máximo 500 caracteres.'
  if (savedWallet && details.walletType !== savedWallet.type) errors.walletType = 'Selecione uma carteira cadastrada.'
  if (savedWallet && details.network !== savedWallet.network) errors.network = 'A rede precisa corresponder à carteira cadastrada.'
  if (savedWallet && text(details.walletAddress) !== savedWallet.address)
    errors.walletAddress = 'Use o endereço da carteira cadastrada.'
  return errors
}
