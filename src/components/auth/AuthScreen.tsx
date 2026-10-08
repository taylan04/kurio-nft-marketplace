import { Link, useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { HomePage } from '@/pages/HomePage'
import { cn } from '@/lib/utils'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

type Mode = 'login' | 'register'

const copy = {
  login: {
    mobileTitle: 'Entrar',
    description: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
  },
  register: {
    mobileTitle: 'Criar perfil de colecionador',
    description: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
  },
} as const

/**
 * Figma: no mobile, Login/Cadastro são telas cheias (sem header e sem barra inferior);
 * no desktop, são um modal sobre a Home com as abas "Entrar | Criar conta".
 */
export function AuthScreen({ mode }: { mode: Mode }) {
  const isDesktop = useIsDesktop()
  return isDesktop ? <AuthModal mode={mode} /> : <AuthMobile mode={mode} />
}

function AuthMobile({ mode }: { mode: Mode }) {
  return (
    <main className="min-h-screen bg-background px-7 pb-12 pt-[128px] text-foreground">
      <Link to="/" className="block text-center text-[32px] font-bold leading-10 tracking-[0.08em]">KURIO</Link>
      <h1 className={cn('mt-[83px] text-center font-bold leading-7', mode === 'login' ? 'text-xl' : 'text-lg')}>
        {copy[mode].mobileTitle}
      </h1>
      <div className="mx-auto mt-[33px] max-w-[420px]">
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </main>
  )
}

const tab = 'text-xl font-medium leading-7 transition-colors hover:text-accent-light'

function AuthModal({ mode }: { mode: Mode }) {
  const navigate = useNavigate()
  return (
    <>
      {/* a Home continua visível atrás do modal, como no frame */}
      <HomePage />
      <Dialog open onOpenChange={(open) => { if (!open) navigate({ to: '/' }) }}>
        <DialogContent
          overlayClassName="bg-transparent backdrop-blur-0"
          closeClassName="right-[14px] top-[13px] text-accent-light hover:text-foreground"
          className={cn(
            // 160px do topo como no Figma; em telas baixas sobe o modal para ele caber inteiro
            'top-[max(16px,min(160px,calc(100vh_-_700px)))] w-[500px] max-w-[calc(100%-2rem)] translate-y-0',
            'overflow-hidden rounded-md border-0 p-0 px-20 pt-[45px] shadow-soft',
            // só rola se a tela for mais baixa que o próprio modal
            'max-h-[calc(100vh_-_32px)] overflow-y-auto',
          )}
        >
          <DialogTitle className="flex items-center justify-center gap-0 text-xl font-medium">
            <Link to="/login" replace aria-current={mode === 'login' ? 'page' : undefined} className={cn(tab, mode === 'login' && 'text-accent-light')}>Entrar</Link>
            <span aria-hidden className="ml-2.5 mr-2 h-[22px] w-px bg-accent" />
            <Link to="/register" replace aria-current={mode === 'register' ? 'page' : undefined} className={cn(tab, mode === 'register' && 'text-accent-light')}>Criar conta</Link>
          </DialogTitle>
          <DialogDescription className="-mx-[30px] mt-[35px] text-center text-[13px] leading-4 text-foreground">
            {copy[mode].description}
          </DialogDescription>
          <div className="mt-6">
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
          {/* faixa laranja da base: é o último elemento do modal, então ele sempre termina nela */}
          <span aria-hidden className={cn('-mx-20 block h-[10px] bg-accent', mode === 'login' ? 'mt-[94px]' : 'mt-[66px]')} />
        </DialogContent>
      </Dialog>
    </>
  )
}