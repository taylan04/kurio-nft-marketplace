import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWallets, saveWallet } from '@/api/account'
import { Input } from '@/components/ui/input'
import { EnsField, Field, SelectField, fieldClass } from '@/components/form/fields'
import type { Network, Wallet } from '@/types/domain'
import { cn } from '@/lib/utils'

const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const
const TYPES = ['MetaMask', 'WalletConnect', 'Coinbase Wallet'] as const

export function WalletForm() {
  const queryClient = useQueryClient()
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: ({ signal }) => fetchWallets(signal) })
  const [form, setForm] = useState({ label: '', nickname: '', profileName: '', network: '' as Network | '', address: '', secondary: '', type: '' as Wallet['type'] | '', email: '', ens: '', referralCode: '' })
  const [sameAsPrimary, setSameAsPrimary] = useState(false)
  const save = useMutation({
    mutationFn: () => saveWallet({ label: form.label, nickname: form.nickname, network: form.network || 'Ethereum', address: form.address, type: form.type || 'MetaMask', email: form.email, ens: form.ens, referralCode: form.referralCode, primary: true }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wallets'] }); setForm({ ...form, label: '', nickname: '', address: '', ens: '', referralCode: '' }) },
  })
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })
  const secondary = wallets.data?.filter((wallet) => !wallet.primary) || []

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-bold leading-5">Carteira principal</h1>
          <p className="mt-1 text-[13px] leading-5 text-muted">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
        </div>
        <span className="text-[15px] font-bold text-accent-light">Adicionar</span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate() }}>
        <div className="mt-[27px] grid gap-x-7 gap-y-[25px] md:grid-cols-2">
          <Field id="w-label" label="Nome de exibição" required><Input id="w-label" value={form.label} onChange={set('label')} className={fieldClass} /></Field>
          <Field id="w-nick" label="Apelido da carteira" required><Input id="w-nick" value={form.nickname} onChange={set('nickname')} className={fieldClass} /></Field>
          <Field id="w-network" label="Rede" required><SelectField id="w-network" placeholder="Selecione uma rede" options={NETWORKS} value={form.network || undefined} onValueChange={(v) => setForm({ ...form, network: v as Network })} /></Field>
          <Field id="w-profile" label="Nome do perfil" required><Input id="w-profile" value={form.profileName} onChange={set('profileName')} className={fieldClass} /></Field>
          <Field id="w-address" label="Endereço da carteira" required><Input id="w-address" placeholder="Endereço 0x da carteira" value={form.address} onChange={set('address')} aria-invalid={Boolean(save.error)} aria-describedby={save.error ? 'w-error' : undefined} className={fieldClass} /></Field>
          <Field><Input aria-label="ENS ou carteira secundária (opcional)" placeholder="ENS ou carteira secundária (opcional)" value={form.secondary} onChange={set('secondary')} className={fieldClass} /></Field>
          <Field id="w-type" label="Tipo de carteira" required><SelectField id="w-type" placeholder="Selecione uma carteira" options={TYPES} value={form.type || undefined} onValueChange={(v) => setForm({ ...form, type: v as Wallet['type'] })} /></Field>
          <Field id="w-ref" label="Código de indicação" required><Input id="w-ref" value={form.referralCode} onChange={set('referralCode')} className={fieldClass} /></Field>
          <Field id="w-email" label="E-mail" required><Input id="w-email" type="email" value={form.email} onChange={set('email')} className={fieldClass} /></Field>
          <Field id="w-ens" label="Nome ENS" required><EnsField id="w-ens" value={form.ens} onChange={(ens) => setForm({ ...form, ens })} /></Field>
        </div>
        {save.error && <p id="w-error" role="alert" className="mt-4 text-sm text-danger">Não foi possível salvar a carteira. O endereço deve começar com 0x.</p>}
        {save.isSuccess && <p role="status" className="mt-4 text-sm text-accent-light">Carteira salva.</p>}
        <button type="submit" disabled={save.isPending} className="mt-8 h-10 w-[131px] rounded-[2px] bg-accent text-sm font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60">Salvar carteira</button>
      </form>

      <div className="mt-[31px] flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold leading-5">Carteira secundária</h2>
        <div className="flex items-center gap-2 text-[15px]">
          <button type="button" role="checkbox" aria-checked={sameAsPrimary} onClick={() => setSameAsPrimary((v) => !v)} className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <span aria-hidden className={cn('h-4 w-4 rounded-full border-[1.5px] border-accent', sameAsPrimary && 'bg-accent shadow-[inset_0_0_0_2px_#140d0a]')} />
            Igual à carteira principal
          </button>
          <span className="ml-1 text-[17px] font-bold text-accent-light">Adicionar</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {secondary.length ? secondary.map((w) => `${w.label} · ${w.network}`).join(' | ') : 'Você ainda não adicionou uma carteira secundária.'}
      </p>
    </div>
  )
}
