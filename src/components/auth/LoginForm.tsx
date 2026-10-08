import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from './PasswordInput'
import { SocialLogin } from './SocialLogin'
import { authInput, authSubmit } from './authStyles'
import { useLogin } from '@/hooks/useSession'
import { consumeRedirect } from '@/lib/session'
import { apiErrorMessage } from '@/lib/apiError'

export function LoginForm() {
  const mutation = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) || !password) {
      setValidationError('Informe um e-mail válido e sua senha.')
      return
    }
    setValidationError('')
    mutation.mutate({ email, password }, { onSuccess: () => { window.location.assign(consumeRedirect()) } })
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-3">
        <div>
          <Label htmlFor="login-email" className="sr-only">E-mail</Label>
          <Input id="login-email" type="email" autoComplete="email" placeholder="contato@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={authInput} />
        </div>
        <div>
          <Label htmlFor="login-password" className="sr-only">Senha</Label>
          <PasswordInput id="login-password" autoComplete="current-password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className={authInput} />
        </div>
      </div>

      <div className="mt-2.5 flex justify-end md:mt-[11px]">
        <span aria-disabled="true" title="Recuperação de senha indisponível nesta demonstração" className="text-sm leading-5 text-muted">Esqueceu a senha?</span>
      </div>

      {(mutation.error || validationError) && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {validationError || apiErrorMessage(mutation.error, 'Não foi possível entrar.')}
        </p>
      )}

      <button className={`${authSubmit} mt-[38px] md:mt-[22px]`} disabled={mutation.isPending}>
        {mutation.isPending ? 'Entrando...' : 'Entrar'}
      </button>

      <SocialLogin />

      <p className="mt-10 text-center text-sm leading-5 text-muted md:hidden">
        Novo na Kurio? <Link to="/register" replace className="hover:text-accent-light hover:underline">Crie uma conta</Link>
      </p>
    </form>
  )
}
