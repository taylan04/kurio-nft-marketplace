import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWallets, saveWallet } from '@/api/account'
import { Input } from '@/components/ui/input'
import { EnsField, Field, SelectField, fieldClass } from '@/components/form/fields'
import type { Network, Wallet } from '@/types/domain'
import { cn } from '@/lib/utils'
import { apiErrorMessage } from '@/lib/apiError'

const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const
const TYPES = ['MetaMask', 'WalletConnect', 'Coinbase Wallet'] as const

type WalletDraft = {
  label: string
  nickname: string
  profileName: string
  network: Network | ''
  address: string
  secondary: string
  type: Wallet['type'] | ''
  email: string
  ens: string
  referralCode: string
}

const emptyDraft = (): WalletDraft => ({
  label: '', nickname: '', profileName: '', network: '', address: '',
  secondary: '', type: '', email: '', ens: '', referralCode: '',
})

function draftFromWallet(wallet: Wallet): WalletDraft {
  return {
    label: wallet.label, nickname: wallet.nickname,
    profileName: wallet.profileName || wallet.label,
    network: wallet.network, address: wallet.address,
    secondary: wallet.secondary || '', type: wallet.type,
    email: wallet.email || '', ens: wallet.ens || '',
    referralCode: wallet.referralCode || '',
  }
}

export function WalletForm() {
  const queryClient = useQueryClient()
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: ({ signal }) => fetchWallets(signal) })
  const [form, setForm] = useState<WalletDraft>(emptyDraft)
  const [isSecondary, setIsSecondary] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [sameAsPrimary, setSameAsPrimary] = useState(false)
  const [validationError, setValidationError] = useState('')
  const primary = wallets.data?.find((wallet) => wallet.primary)
  const secondary = wallets.data?.filter((wallet) => !wallet.primary) || []

  const save = useMutation({
    mutationFn: () => saveWallet({
      ...form, id: editingId, network: form.network as Network,
      type: form.type as Wallet['type'], primary: !isSecondary,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallets'] })
      setEditingId(undefined)
      setForm(emptyDraft())
      setSameAsPrimary(false)
      setValidationError('')
    },
  })

  const beginNew = (secondaryWallet: boolean) => {
    setIsSecondary(secondaryWallet)
    setEditingId(undefined)
    setSameAsPrimary(false)
    setForm(emptyDraft())
    setValidationError('')
    save.reset()
  }
  const beginEdit = (wallet: Wallet) => {
    setIsSecondary(!wallet.primary)
    setEditingId(wallet.id)
    setSameAsPrimary(false)
    setForm(draftFromWallet(wallet))
    setValidationError('')
    save.reset()
  }
  const copyPrimary = (checked: boolean) => {
    setSameAsPrimary(checked)
    setIsSecondary(true)
    setEditingId(undefined)
    setForm(checked && primary ? draftFromWallet(primary) : emptyDraft())
    setValidationError('')
    save.reset()
  }
  const set = (key: keyof WalletDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((previous) => ({ ...previous, [key]: e.target.value }))
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.label.trim() || !form.nickname.trim() || !form.profileName.trim() ||
        !form.network || !form.type || !/^0x\S{4,}$/.test(form.address.trim()) ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) ||
        !form.referralCode.trim()) {
      setValidationError('Preencha todos os campos obrigatórios da carteira com dados válidos.')
      return
    }
    setValidationError('')
    save.mutate()
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-bold leading-5">Carteira principal</h1>
          <p className="mt-1 text-[13px] leading-5 text-muted">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
        </div>
        <button type="button" className="text-[15px] font-bold text-accent-light hover:underline" onClick={() => beginNew(false)}>Adicionar</button>
      </div>
      {wallets.isError && <p role="alert" className="mt-3 text-sm text-danger">Não foi possível carregar suas carteiras. <button type="button" className="underline" onClick={() => void wallets.refetch()}>Tentar novamente</button></p>}
      {wallets.isLoading && <p role="status" className="mt-3 text-sm text-muted">Carregando carteiras...</p>}
      {primary && <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
        <p>{primary.label} · {primary.network}</p>
        <button type="button" onClick={() => beginEdit(primary)} className="text-accent-light hover:underline" aria-label={`Editar carteira principal ${primary.label}`}>Editar</button>
      </div>}
      <p className="mt-5 text-sm text-accent-light" role="status" aria-live="polite">
        {editingId ? `Editando carteira ${isSecondary ? 'secundária' : 'principal'}` : `Cadastrando carteira ${isSecondary ? 'secundária' : 'principal'}`}
      </p>

      <form onSubmit={submit} noValidate>
        <div className="mt-[27px] grid gap-x-7 gap-y-[25px] md:grid-cols-2">
          <Field id="w-label" label="Nome de exibição" required><Input id="w-label" value={form.label} onChange={set('label')} className={fieldClass} /></Field>
          <Field id="w-nick" label="Apelido da carteira" required><Input id="w-nick" value={form.nickname} onChange={set('nickname')} className={fieldClass} /></Field>
          <Field id="w-network" label="Rede" required><SelectField id="w-network" placeholder="Selecione uma rede" options={NETWORKS} value={form.network || undefined} onValueChange={(v) => setForm((previous) => ({ ...previous, network: v as Network }))} /></Field>
          <Field id="w-profile" label="Nome do perfil" required><Input id="w-profile" value={form.profileName} onChange={set('profileName')} className={fieldClass} /></Field>
          <Field id="w-address" label="Endereço da carteira" required><Input id="w-address" placeholder="Endereço 0x da carteira" value={form.address} onChange={set('address')} aria-invalid={Boolean(save.error || validationError)} aria-describedby={save.error || validationError ? 'w-error' : undefined} className={fieldClass} /></Field>
          <Field><Input aria-label="ENS ou carteira secundária (opcional)" placeholder="ENS ou carteira secundária (opcional)" value={form.secondary} onChange={set('secondary')} className={fieldClass} /></Field>
          <Field id="w-type" label="Tipo de carteira" required><SelectField id="w-type" placeholder="Selecione uma carteira" options={TYPES} value={form.type || undefined} onValueChange={(v) => setForm((previous) => ({ ...previous, type: v as Wallet['type'] }))} /></Field>
          <Field id="w-ref" label="Código de indicação" required><Input id="w-ref" value={form.referralCode} onChange={set('referralCode')} className={fieldClass} /></Field>
          <Field id="w-email" label="E-mail" required><Input id="w-email" type="email" value={form.email} onChange={set('email')} className={fieldClass} /></Field>
          <Field id="w-ens" label="Nome ENS"><EnsField id="w-ens" value={form.ens} onChange={(ens) => setForm((previous) => ({ ...previous, ens }))} /></Field>
        </div>
        {(save.error || validationError) && <p id="w-error" role="alert" className="mt-4 text-sm text-danger">{validationError || apiErrorMessage(save.error, 'Não foi possível salvar a carteira.')}</p>}
        {save.isSuccess && <p role="status" className="mt-4 text-sm text-accent-light">Carteira salva.</p>}
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" disabled={save.isPending} className="h-10 w-[131px] rounded-[2px] bg-accent text-sm font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60">{save.isPending ? 'Salvando...' : 'Salvar carteira'}</button>
          {editingId && <button type="button" className="text-sm text-muted underline" onClick={() => beginNew(isSecondary)}>Cancelar edição</button>}
        </div>
      </form>

      <div className="mt-[31px] flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold leading-5">Carteira secundária</h2>
        <div className="flex items-center gap-2 text-[15px]">
          <button type="button" role="checkbox" aria-checked={sameAsPrimary} disabled={!primary} onClick={() => copyPrimary(!sameAsPrimary)} className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50">
            <span aria-hidden className={cn('h-4 w-4 rounded-full border-[1.5px] border-accent', sameAsPrimary && 'bg-accent shadow-[inset_0_0_0_2px_#140d0a]')} />
            Igual à carteira principal
          </button>
          <button type="button" onClick={() => beginNew(true)} className="ml-1 text-[17px] font-bold text-accent-light hover:underline">Adicionar</button>
        </div>
      </div>
      {secondary.length ? <ul className="mt-2 space-y-2 text-[13px] text-muted">{secondary.map((wallet) => <li key={wallet.id} className="flex justify-between gap-4">
        <span>{wallet.label} · {wallet.network}</span>
        <button type="button" className="text-accent-light hover:underline" onClick={() => beginEdit(wallet)} aria-label={`Editar carteira secundária ${wallet.label}`}>Editar</button>
      </li>)}</ul> : <p className="mt-2 text-[13px] text-muted">Você ainda não adicionou uma carteira secundária.</p>}
    </div>
  )
}
