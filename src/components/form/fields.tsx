import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/*
  Campos dos formulários de Pagamento, Perfil e Carteiras (desktop do Figma):
  rótulo de 15px com asterisco salmão, campo de 40px com borda #3f2319 e cantos quase retos.
*/
export const fieldClass =
  'h-10 rounded-[2px] border-field bg-transparent px-3 text-sm text-foreground placeholder:text-muted-dim focus:border-accent focus:ring-0 focus-visible:outline-none'

export function Field({ id, label, required = false, children, className }: { id?: string; label?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={id} className="flex h-5 items-center text-[15px] font-normal leading-5">
          {label}
          {required && <span aria-hidden className="relative top-[3px] ml-0.5 text-[22px] leading-none text-[#f0805f]">*</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </Label>
      ) : (
        <span aria-hidden className="block h-5" />
      )}
      <div className="mt-[5px]">{children}</div>
    </div>
  )
}

export function SelectField({ id, placeholder, options, value, onValueChange, className }: {
  id?: string
  placeholder: string
  options: readonly string[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={cn(fieldClass, 'pr-7 data-[placeholder]:text-muted-dim [&_svg]:text-foreground', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/** "Nome ENS": seletor ".eth" de 78px + (opcional) campo ao lado */
export function EnsField({ id, value, onChange, withInput = true }: { id: string; value?: string; onChange?: (value: string) => void; withInput?: boolean }) {
  return (
    <div className="flex gap-2.5">
      <Select defaultValue=".eth">
        <SelectTrigger aria-label="Domínio ENS" className={cn(fieldClass, 'w-[78px] shrink-0 gap-1 px-2.5 text-base [&_svg]:text-foreground')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=".eth">.eth</SelectItem>
        </SelectContent>
      </Select>
      {withInput && (
        <input id={id} value={value} onChange={(event) => onChange?.(event.target.value)} className={cn('w-full min-w-0 border', fieldClass)} />
      )}
    </div>
  )
}
