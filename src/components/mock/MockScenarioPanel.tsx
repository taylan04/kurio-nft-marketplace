import { useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

export function MockScenarioPanel() {
  const [open, setOpen] = useState(false)
  if (import.meta.env.VITE_SHOW_MOCK_TOOLS !== 'true') return null
  return <div className="fixed bottom-20 right-3 z-[80] md:bottom-4"><Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>Mock tools</Button>{open && <div className="mt-2 w-64 space-y-2 rounded-xl border border-border bg-panel p-3 shadow-soft"><p className="text-xs text-muted">Cenários reproduzíveis do desafio</p><Button size="sm" className="w-full" onClick={() => api.post('/mock/nft-update', { nftId: '042' })}>Alterar preço NFT #042</Button><Button size="sm" variant="outline" className="w-full" onClick={() => api.post('/mock/scenario', { payment: 'declined' })}>Próximo pagamento recusado</Button><Button size="sm" variant="outline" className="w-full" onClick={() => api.post('/mock/scenario', { payment: 'confirmed', force500: false, expireSession: false, latencyMs: 250 })}>Cenário normal</Button><Button size="sm" variant="outline" className="w-full" onClick={() => api.post('/mock/scenario', { expireSession: true })}>Expirar sessão atual</Button><Button size="sm" variant="outline" className="w-full" onClick={() => api.post('/mock/scenario', { latencyMs: 1800 })}>Rede lenta</Button><Button size="sm" variant="danger" className="w-full" onClick={async () => { await api.post('/mock/reset'); location.href = '/' }}>Resetar mocks</Button></div>}</div>
}
