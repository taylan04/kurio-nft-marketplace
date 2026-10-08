import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthDialog({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  return <Dialog><DialogTrigger asChild><Button>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{mode === 'login' ? 'Entrar' : 'Criar conta'}</DialogTitle><DialogDescription>Gerencie sua carteira, coleção e perfil de criador.</DialogDescription></DialogHeader>{mode === 'login' ? <LoginForm/> : <RegisterForm/>}</DialogContent></Dialog>
}
