import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageIcon } from 'lucide-react'
import { changePassword, fetchProfile, updateProfile } from '@/api/account'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { EnsField, Field, fieldClass } from '@/components/form/fields'

const saveButton = 'h-10 w-[131px] rounded-[2px] bg-accent text-sm font-bold text-[#1a100b] transition hover:brightness-110 disabled:opacity-60'

export function ProfileForm() {
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: ['profile'], queryFn: ({ signal }) => fetchProfile(signal) })
  const [form, setForm] = useState({ displayName: '', username: '', email: '', ens: '', walletAlias: '', avatar: '' })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (profile.data) setForm({ displayName: profile.data.displayName || '', username: profile.data.username || '', email: profile.data.email || '', ens: profile.data.ens || '', walletAlias: profile.data.walletAlias || '', avatar: profile.data.avatar || '' }) }, [profile.data])
  const save = useMutation({ mutationFn: () => updateProfile(form), onSuccess: (data) => { queryClient.setQueryData(['profile'], data); queryClient.invalidateQueries({ queryKey: ['session'] }) } })
  const pass = useMutation({ mutationFn: () => changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword }), onSuccess: () => setPassword({ currentPassword: '', newPassword: '', confirm: '' }) })
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })
  const mismatch = Boolean(password.confirm) && password.confirm !== password.newPassword
  const pickAvatar = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((f) => ({ ...f, avatar: String(reader.result) })); reader.readAsDataURL(file) }

  if (profile.isLoading) return <p>Carregando perfil...</p>
  return (
    <div>
      <h1 className="text-[15px] font-bold leading-5">Perfil do colecionador</h1>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="mt-[33px] grid gap-x-7 gap-y-[38px] md:grid-cols-2">
        <Field id="displayName" label="Nome de exibição" required><Input id="displayName" value={form.displayName} onChange={set('displayName')} className={fieldClass} /></Field>
        <Field id="username" label="Nome de usuário" required><Input id="username" value={form.username} onChange={set('username')} className={fieldClass} /></Field>
        <Field id="email" label="E-mail" required><Input id="email" type="email" value={form.email} onChange={set('email')} className={fieldClass} /></Field>
        <Field id="ens" label="Nome ENS" required><EnsField id="ens" value={form.ens} onChange={(ens) => setForm({ ...form, ens })} /></Field>
        <Field id="walletAlias" label="Apelido da carteira" required><Input id="walletAlias" value={form.walletAlias} onChange={set('walletAlias')} className={fieldClass} /></Field>
        <div>
          <p className="text-[15px] leading-5">Avatar</p>
          <div className="mt-2 flex items-center gap-6">
            <span className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border border-field bg-panel text-accent-light">
              {form.avatar ? <img src={form.avatar} alt="Seu avatar" className="h-full w-full object-cover" /> : <ImageIcon size={22} strokeWidth={1.6} aria-hidden />}
            </span>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Escolher avatar" onChange={(e) => pickAvatar(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} className="h-10 w-[98px] rounded-[2px] bg-accent text-sm font-bold text-[#1a100b]">Alterar</button>
            <button type="button" onClick={() => setForm({ ...form, avatar: '' })} className="text-sm hover:text-accent-light">Remover</button>
          </div>
        </div>
        {/* o Figma não tem botão separado para os dados; mantemos um "Salvar" discreto só para este bloco */}
        <button type="submit" className="sr-only focus:not-sr-only" disabled={save.isPending}>Salvar dados</button>
      </form>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); if (password.currentPassword) pass.mutate() }} className="mt-10 max-w-[417px]">
        <h2 className="text-[15px] font-bold leading-5">Alterar senha</h2>
        <div className="mt-[19px] space-y-[18px]">
          <Field id="pw-current" label="Senha atual"><PasswordInput id="pw-current" autoComplete="current-password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} className={fieldClass} /></Field>
          <Field id="pw-new" label="Nova senha"><PasswordInput id="pw-new" autoComplete="new-password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} className={fieldClass} /></Field>
          <Field id="pw-confirm" label="Confirmar nova senha"><PasswordInput id="pw-confirm" autoComplete="new-password" aria-invalid={mismatch} aria-describedby={mismatch ? 'pw-error' : undefined} value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} className={fieldClass} /></Field>
        </div>
        {mismatch && <p id="pw-error" role="alert" className="mt-2 text-sm text-danger">As senhas não coincidem.</p>}
        {(save.isSuccess || pass.isSuccess) && <p role="status" className="mt-2 text-sm text-accent-light">Alterações salvas.</p>}
        <button type="submit" disabled={save.isPending || pass.isPending || mismatch || (Boolean(password.currentPassword) && password.newPassword.length < 8)} className={`${saveButton} mt-8`}>Salvar</button>
      </form>
    </div>
  )
}
