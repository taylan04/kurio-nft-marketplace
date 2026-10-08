import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Alguns campos do Figma (ex.: "Confirmar senha" no cadastro) não mostram o olho */
  hideToggle?: boolean
  iconClassName?: string
}

export function PasswordInput({ className, hideToggle = false, iconClassName, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn(!hideToggle && 'pr-11', className)} />
      {!hideToggle && (
        <button
          type="button"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className={cn('absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-[#8a6a4a] transition hover:text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent', iconClassName)}
        >
          {/* no Figma o campo oculto mostra o olho riscado */}
          {visible ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
        </button>
      )}
    </div>
  )
}
