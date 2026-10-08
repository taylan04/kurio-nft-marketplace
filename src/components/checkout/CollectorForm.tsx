import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EnsField, Field, SelectField, fieldClass } from '@/components/form/fields'
import { cn } from '@/lib/utils'

const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const
const WALLETS = ['MetaMask', 'WalletConnect', 'Coinbase Wallet'] as const

/** "Perfil do colecionador" do Pagamento desktop */
export function CollectorForm() {
  const [otherWallet, setOtherWallet] = useState(false)
  return (
    <section aria-labelledby="collector-title">
      <h2 id="collector-title" className="text-[17px] font-bold leading-[22px]">Perfil do colecionador</h2>
      <div className="mt-3 grid gap-x-6 gap-y-4 md:grid-cols-2">
        <Field id="co-display" label="Nome de exibição" required><Input id="co-display" required className={fieldClass} /></Field>
        <Field id="co-user" label="Nome de usuário" required><Input id="co-user" required className={fieldClass} /></Field>
        <Field id="co-network" label="Rede" required><SelectField id="co-network" placeholder="Selecione uma rede" options={NETWORKS} /></Field>
        <Field id="co-profile" label="Nome do perfil" required><Input id="co-profile" required className={fieldClass} /></Field>
        <Field id="co-address" label="Endereço da carteira" required><Input id="co-address" placeholder="Endereço 0x da carteira" required className={cn(fieldClass, 'pl-[22px]')} /></Field>
        <Field>
          <Input aria-label="ENS ou carteira secundária (opcional)" placeholder="ENS ou carteira secundária (opcional)" className={cn(fieldClass, 'pl-[22px]')} />
        </Field>
        <Field id="co-wallet" label="Tipo de carteira" required><SelectField id="co-wallet" placeholder="Selecione uma carteira" options={WALLETS} /></Field>
        <Field id="co-ref" label="Código de indicação" required><Input id="co-ref" required className={fieldClass} /></Field>
        <Field id="co-email" label="E-mail" required><Input id="co-email" type="email" required className={fieldClass} /></Field>
        <Field id="co-ens" label="Nome ENS" required><EnsField id="co-ens" withInput={false} /></Field>
      </div>

      <button type="button" role="checkbox" aria-checked={otherWallet} onClick={() => setOtherWallet((v) => !v)} className="mt-[22px] flex items-center gap-2 text-[15px] leading-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <span aria-hidden className={cn('h-[15px] w-[15px] rounded-full border-2 border-accent', otherWallet && 'bg-accent shadow-[inset_0_0_0_2px_#140d0a]')} />
        Usar outra carteira?
      </button>

      <div className="mt-[21px]">
        <Label htmlFor="co-note" className="block text-[15px] font-normal leading-5">Observação do colecionador (opcional)</Label>
        <Textarea id="co-note" className="mt-2.5 block h-[152px] w-full max-w-[350px] resize-none rounded-[2px] border-field focus:border-accent focus:ring-0" />
      </div>
    </section>
  )
}
