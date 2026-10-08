import { SocialIcons } from '@/components/icons'

const features = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
]

const linkColumns = [
  { title: 'Meu perfil', links: ['Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'] },
  { title: 'Central de ajuda', links: ['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'] },
  { title: 'Coleções', links: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'] },
]

const socials = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['twitter', 'Twitter'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
] as const

export function Footer() {
  return (
    <footer className="mt-24 hidden md:block">
      <div className="mx-auto max-w-page bg-panel md:mx-6 xl:mx-auto">
        {/* destaques + newsletter */}
        <div className="grid grid-cols-2 gap-y-8 pb-4 pl-12 pr-[30px] pt-8 lg:grid-cols-[249fr_266fr_266fr_341fr] lg:gap-y-0">
          {features.map((item, index) => (
            <section key={item.letter} className={index === 0 ? 'pr-4' : 'pr-4 lg:border-l lg:border-accent/60 lg:pl-[17px]'}>
              <div aria-hidden className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-accent text-[22px] font-bold text-background">
                {item.letter}
              </div>
              <h2 className="mt-[11px] text-[17px] font-bold leading-5">{item.title}</h2>
              <p className="mt-2 max-w-[190px] text-sm leading-[22px] text-muted">{item.text}</p>
            </section>
          ))}

          <section className="lg:border-l lg:border-accent/60 lg:pl-4">
            <h2 className="text-lg font-bold leading-[17px]">Antecipe-se ao próximo lançamento</h2>
            <form className="mt-[22px] flex h-10" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                aria-label="Newsletter de lançamentos"
                placeholder="digite seu e-mail..."
                className="min-w-0 flex-1 rounded-l bg-band px-3 text-[15px] text-foreground outline-none placeholder:text-muted-dim focus-visible:ring-1 focus-visible:ring-accent"
              />
              <button type="submit" className="w-[85px] rounded-r bg-accent text-lg font-bold text-background transition hover:brightness-110">
                Enviar
              </button>
            </form>
            <p className="mt-3 text-[13px] leading-[22px] text-muted">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </section>
        </div>

        {/* faixa institucional */}
        <div className="grid h-[88px] grid-cols-[303fr_303fr_302fr_260fr] items-center bg-band pl-8 text-sm leading-[22px]">
          <span className="font-bold tracking-[0.12em]">KURIO</span>
          <span className="pr-4">Feito para colecionadores, criadores e cultura</span>
          <a href="mailto:contato@email.com" className="hover:text-accent-light">contato@email.com</a>
          <a href="tel:+551140028922" className="hover:text-accent-light">+55 11 4002 8922</a>
        </div>

        {/* links */}
        <div className="grid grid-cols-[303fr_303fr_302fr_260fr] pb-[34px] pl-8 pt-[28px]">
          {linkColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-lg font-bold leading-[22px]">{column.title}</h2>
              <ul className="mt-[9px] space-y-2 text-sm leading-[22px]">
                {column.links.map((link) => (
                  <li key={link}><span className="cursor-default">{link}</span></li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-lg font-bold leading-[22px]">Redes sociais</h2>
            <ul className="mt-4 flex gap-[9px]">
              {socials.map(([key, label]) => {
                const Icon = SocialIcons[key]
                return (
                  <li key={key}>
                    <a href="#" aria-label={label} onClick={(event) => event.preventDefault()} className="flex h-[31px] w-[31px] items-center justify-center rounded border border-accent text-accent transition hover:bg-accent hover:text-background">
                      <Icon size={key === 'youtube' ? 20 : 17} />
                    </a>
                  </li>
                )
              })}
            </ul>
            <h2 className="mt-[29px] text-lg font-bold leading-[22px]">Carteiras compatíveis</h2>
            <p className="mt-2 inline-flex h-[25px] items-center gap-3 rounded border border-[#7a4f29] bg-band px-2.5 text-[8.5px] font-bold text-accent-light">
              <span>METAMASK</span><span aria-hidden>•</span><span>WALLETCONNECT</span><span aria-hidden>•</span><span>COINBASE</span>
            </p>
          </div>
        </div>
      </div>
      <p className="py-[13px] text-center text-[13px]">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}
