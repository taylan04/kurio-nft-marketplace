import { Minus, Plus } from 'lucide-react'

export function QuantitySelector({ value, min = 1, max = 99, onChange }: { value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return <div className="inline-flex items-center gap-3"><button type="button" aria-label="Diminuir quantidade" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-8 w-8 items-center justify-center rounded-full border border-border disabled:opacity-40"><Minus size={15} /></button><span aria-live="polite" className="w-5 text-center font-bold">{value}</span><button type="button" aria-label="Aumentar quantidade" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-8 w-8 items-center justify-center rounded-full border border-border disabled:opacity-40"><Plus size={15} /></button></div>
}
