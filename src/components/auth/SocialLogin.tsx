import { FacebookIcon, GoogleIcon } from '@/components/icons'
import { authSocial } from './authStyles'

/** Divisor "Ou continue com" + botões sociais. Fora do escopo do desafio: não simulam sucesso. */
export function SocialLogin() {
  return (
    <>
      <div className="mt-[38px] flex items-center gap-3 md:-mx-20 md:mt-[22px]">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[13px] leading-5">Ou continue com</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <button type="button" aria-disabled="true" title="Indisponível nesta demonstração" className={`${authSocial} mt-2.5 md:mt-[11px]`}>
        <GoogleIcon size={20} /> Continuar com Google
      </button>
      <button type="button" aria-disabled="true" title="Indisponível nesta demonstração" className={`${authSocial} mt-4 md:mt-[13px]`}>
        <FacebookIcon size={20} /> Continuar com Facebook
      </button>
    </>
  )
}
