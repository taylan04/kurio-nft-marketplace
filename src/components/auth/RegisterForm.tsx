import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from './PasswordInput'
import { SocialLogin } from './SocialLogin'
import { authInput, authSubmit } from './authStyles'
import { useRegister } from '@/hooks/useSession'

export function RegisterForm() {
  const navigate = useNavigate()
  const mutation = useRegister()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (form.password !== form.confirm) return
    mutation.mutate({ username: form.username, email: form.email, password: form.password }, { onSuccess: () => navigate({ to: '/' }) })
  }
  const mismatch = form.confirm.length > 0 && form.password !== form.confirm

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-3">
        <div>
          <Label htmlFor="reg-user" className="sr-only">Nome de usuário</Label>
          <Input id="reg-user" autoComplete="username" placeholder="Nome de usuário" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className={authInput} />
        </div>
        <div>
          <Label htmlFor="reg-email" className="sr-only">E-mail</Label>
          <Input id="reg-email" type="email" autoComplete="email" placeholder="Digite seu e-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={authInput} />
        </div>
        <div>
          <Label htmlFor="reg-pass" className="sr-only">Senha</Label>
          <PasswordInput id="reg-pass" autoComplete="new-password" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className={authInput} />
        </div>
        <div>
          <Label htmlFor="reg-confirm" className="sr-only">Confirmar senha</Label>
          {/* no Figma desktop o "Confirmar senha" não tem o olho; no mobile tem */}
          <PasswordInput id="reg-confirm" autoComplete="new-password" placeholder="Confirmar senha" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} aria-invalid={mismatch} aria-describedby={mismatch ? 'reg-confirm-error' : undefined} className={authInput} iconClassName="md:hidden" />
          {mismatch && <p id="reg-confirm-error" role="alert" className="mt-1 text-xs text-danger">As senhas não coincidem.</p>}
        </div>
      </div>

      {mutation.error && <p role="alert" className="mt-3 text-sm text-danger">Não foi possível criar a conta. Verifique os dados.</p>}

      <button className={`${authSubmit} mt-10 md:mt-6`} disabled={mutation.isPending || mismatch}>
        <span className="md:hidden">Criar perfil</span>
        <span className="hidden md:inline">Criar conta</span>
      </button>

      <SocialLogin />

      <p className="mt-10 text-center text-sm leading-5 text-muted md:hidden">
        Já tem uma conta? <Link to="/login" replace className="hover:text-accent-light hover:underline">Entre</Link>
      </p>
    </form>
  )
}
