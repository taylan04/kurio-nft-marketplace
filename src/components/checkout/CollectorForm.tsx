import { useState, type ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EnsField, Field, SelectField, fieldClass } from '@/components/form/fields'
import { cn } from '@/lib/utils'
import type { CollectorDetails } from '@/types/domain'
import type { CollectorErrors } from '@/lib/collectorValidation'

const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const
const WALLETS = ['MetaMask', 'WalletConnect', 'Coinbase Wallet'] as const

type Props = {
  value: CollectorDetails
  onChange: (next: CollectorDetails) => void
  errors?: CollectorErrors
}

/** Fields share the same state and validation as checkout and the mocked REST API. */
export function CollectorForm({ value, onChange, errors = {} }: Props) {
  const [otherWallet, setOtherWallet] = useState(false)
  const set = (key: keyof CollectorDetails, next: string) => onChange({ ...value, [key]: next })
  const error = (key: keyof CollectorDetails) => errors[key] ? (
    <p id={`co-${key}-error`} role="alert" className="mt-1 text-xs text-danger">{errors[key]}</p>
  ) : null
  const inputProps = (key: keyof CollectorDetails) => ({
    value: value[key],
    onChange: (event: ChangeEvent<HTMLInputElement>) => set(key, event.target.value),
    'aria-invalid': Boolean(errors[key]) as boolean,
    'aria-describedby': errors[key] ? `co-${key}-error` : undefined,
  })

  return (
    <section aria-labelledby="collector-title">
      <h2 id="collector-title" className="text-[17px] font-bold leading-[22px]">Perfil do colecionador</h2>
      <div className="mt-3 grid gap-x-6 gap-y-4 md:grid-cols-2">
        <Field id="co-display" label="Nome de exibição" required>
          <Input id="co-display" required className={fieldClass} {...inputProps('displayName')} />{error('displayName')}
        </Field>
        <Field id="co-user" label="Nome de usuário" required>
          <Input id="co-user" required className={fieldClass} {...inputProps('username')} />{error('username')}
        </Field>
        <Field id="co-network" label="Rede" required>
          <SelectField id="co-network" placeholder="Selecione uma rede" options={NETWORKS} value={value.network || undefined} onValueChange={(next) => set('network', next)} ariaInvalid={Boolean(errors.network)} errorId={errors.network ? 'co-network-error' : undefined} />{error('network')}
        </Field>
        <Field id="co-profile" label="Nome do perfil" required>
          <Input id="co-profile" required className={fieldClass} {...inputProps('profileName')} />{error('profileName')}
        </Field>
        <Field id="co-address" label="Endereço da carteira" required>
          <Input id="co-address" required placeholder="Endereço 0x da carteira" className={cn(fieldClass, 'pl-[22px]')} {...inputProps('walletAddress')} />{error('walletAddress')}
        </Field>
        <Field>
          <Input aria-label="ENS ou carteira secundária (opcional)" placeholder="ENS ou carteira secundária (opcional)" className={cn(fieldClass, 'pl-[22px]')} {...inputProps('secondaryWallet')} />
        </Field>
        <Field id="co-wallet" label="Tipo de carteira" required>
          <SelectField id="co-wallet" placeholder="Selecione uma carteira" options={WALLETS} value={value.walletType || undefined} onValueChange={(next) => set('walletType', next)} ariaInvalid={Boolean(errors.walletType)} errorId={errors.walletType ? 'co-walletType-error' : undefined} />{error('walletType')}
        </Field>
        <Field id="co-ref" label="Código de indicação" required>
          <Input id="co-ref" required className={fieldClass} {...inputProps('referralCode')} />{error('referralCode')}
        </Field>
        <Field id="co-email" label="E-mail" required>
          <Input id="co-email" type="email" required className={fieldClass} {...inputProps('email')} />{error('email')}
        </Field>
        <Field id="co-ens" label="Nome ENS" required>
          <EnsField id="co-ens" value={value.ens} onChange={(next) => set('ens', next)} />{error('ens')}
        </Field>
      </div>

      <button type="button" role="checkbox" aria-checked={otherWallet} onClick={() => setOtherWallet((v) => !v)} className="mt-[22px] flex items-center gap-2 text-[15px] leading-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <span aria-hidden className={cn('h-[15px] w-[15px] rounded-full border-2 border-accent', otherWallet && 'bg-accent shadow-[inset_0_0_0_2px_#140d0a]')} />
        Usar outra carteira?
      </button>
      {otherWallet && <p role="status" className="mt-2 text-sm text-muted">Selecione outra carteira cadastrada em “Carteira e rede”. Para cadastrar um novo endereço, acesse a página Carteiras.</p>}

      <div className="mt-[21px]">
        <Label htmlFor="co-note" className="block text-[15px] font-normal leading-5">Observação do colecionador (opcional)</Label>
        <Textarea id="co-note" maxLength={500} value={value.note} onChange={(event) => set('note', event.target.value)} aria-invalid={Boolean(errors.note)} aria-describedby={errors.note ? 'co-note-error' : undefined} className="mt-2.5 block h-[152px] w-full max-w-[350px] resize-none rounded-[2px] border-field focus:border-accent focus:ring-0" />
        {error('note')}
      </div>
    </section>
  )
}
