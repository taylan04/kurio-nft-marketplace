import { Button } from '@/components/ui/button'
export function ErrorState({ message = 'Algo deu errado.', retry }: { message?: string; retry?: () => void }) { return <div role="alert" className="rounded-xl border border-danger/50 p-6 text-center"><p>{message}</p>{retry && <Button variant="outline" className="mt-4" onClick={retry}>Tentar novamente</Button>}</div> }
