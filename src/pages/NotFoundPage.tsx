import { Link } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'

export function NotFoundPage() { return <AppShell withFooter={false}><div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center"><h1 className="text-4xl font-black">404</h1><p className="text-muted">A rota que você tentou acessar não existe.</p><Button asChild><Link to="/">Voltar ao início</Link></Button></div></AppShell> }
