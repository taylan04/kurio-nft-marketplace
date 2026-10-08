import { Link, useNavigate } from '@tanstack/react-router'
import { Download, Heart, LogOut, MapPin, ShoppingCart, TriangleAlert, User, ChartNoAxesCombined } from 'lucide-react'
import { useLogout } from '@/hooks/useSession'

// Fora do escopo do desafio: aparecem como no Figma, mas sem fingir que funcionam
const disabled = [
  [ShoppingCart, 'Atividade'], [Heart, 'Lista de interesse'], [ChartNoAxesCombined, 'Ofertas'], [Download, 'Arquivos baixados'], [TriangleAlert, 'Suporte'],
] as const

const item = 'flex h-[45px] items-center gap-[13px] border-l-[5px] border-transparent pl-[11px] data-[status=active]:border-accent text-[15px] text-accent-light'

export function AccountSidebar() {
  const logout = useLogout()
  const navigate = useNavigate()
  return (
    <aside className="w-full shrink-0 self-start bg-panel md:w-[310px]">
      <h2 className="px-2.5 pb-[7px] pt-[15px] text-lg font-bold leading-6">Meu perfil</h2>
      <nav aria-label="Conta">
        <Link to="/profile" className={item}><User size={18} strokeWidth={1.6} />Dados do perfil</Link>
        <Link to="/wallets" className={item}><MapPin size={18} strokeWidth={1.6} />Carteiras</Link>
        {disabled.map(([Icon, label]) => (
          <span key={label} aria-disabled="true" className={`${item} cursor-default`}><Icon size={18} strokeWidth={1.6} />{label}</span>
        ))}
        <button type="button" onClick={() => logout.mutate(undefined, { onSettled: () => navigate({ to: '/' }) })} className="flex h-[48px] w-full items-center gap-[9px] border-t border-border pl-4 text-left text-[15px] font-bold text-accent-light">
          <LogOut size={20} strokeWidth={1.6} />Sair
        </button>
      </nav>
    </aside>
  )
}
