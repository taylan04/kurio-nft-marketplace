import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroBanner() {
  return (
    <>
      {/* MOBILE */}
      <section className="relative flex h-[187px] items-start overflow-hidden rounded-3xl bg-gradient-to-br from-[#6b4528] to-[#5a3720] px-4 pt-2.5 md:hidden">
        {/* círculos decorativos do fundo */}
        <div className="pointer-events-none absolute left-[72px] top-[-14px] h-[231px] w-[231px] rounded-full bg-[#a76b3d]/20" />
        <div className="pointer-events-none absolute left-[170px] top-[-30px] h-[260px] w-[260px] rounded-full bg-[#8c5733]/25" />

        {/* texto */}
        <div className="relative z-10 min-w-0 flex-1">
          <p className="text-[12px] font-medium text-[#fff7ec]">
            Bem-vindo à Kurio
          </p>

          <h1 className="mt-1 whitespace-nowrap text-[18px] font-bold leading-[1.6] text-white">
            SEJA DONO DA
            <br />
            CULTURA DIGITAL
          </h1>

          <p className="mt-1.5 whitespace-nowrap text-[12px] leading-[1.5] text-[#d1ad82]">
            Descubra NFTs selecionados
            <br />
            de criadores do mundo
            <br />
            todo.
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#e9964a]"
          >
            EXPLORAR
            <ArrowRight size={14} />
          </button>
        </div>

        {/* imagem principal + miniatura
            (o wrapper não tem overflow-hidden para a miniatura poder vazar) */}
        <div className="relative z-10 h-[136px] w-[136px] shrink-0">
          <div className="h-full w-full overflow-hidden rounded-[18px] bg-[#eee7c8]">
            <img
              src="/nft-emerald.webp"
              alt="NFT Emerald Ape em destaque"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-2 left-[13px] h-14 w-14 overflow-hidden rounded-[14px] border-2 border-[#f2e9cb] bg-[#eee7c8]">
            <img
              src="/nft-violet.webp"
              alt="NFT Violet Nomad"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* indicadores */}
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
          <span className="h-[7px] w-[7px] rounded-full bg-[#e4954b]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#e4954b]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#e4954b]" />
        </div>
      </section>

      {/* DESKTOP (medidas do frame de 1440px) */}
      <section className="relative hidden md:grid md:grid-cols-[1fr_minmax(0,360px)] md:gap-8 lg:grid-cols-[1fr_450px] lg:gap-0">
        <div className="pl-0 pt-[75px] lg:pl-10">
          <p className="text-sm font-medium leading-[18px] tracking-[0.1em]">Bem-vindo à Kurio</p>

          <h1 className="mt-[9px] text-[32px] font-bold leading-[52px] lg:text-[43px] lg:leading-[70px]">
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h1>

          <p className="mt-0.5 max-w-[560px] text-sm leading-6 text-muted">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>

          <Button className="mt-8 h-10 w-[140px] rounded-[3px] text-base font-medium text-[#1a100b]">EXPLORAR</Button>
        </div>

        <div className="pt-[33px]">
          <div className="aspect-square w-full overflow-hidden rounded-[20px] bg-[#eee8cc]">
            <img
              src="/nft-emerald.webp"
              alt="NFT Emerald Ape em destaque"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* indicadores do carrossel */}
        <div aria-hidden className="absolute bottom-[43px] left-[600px] hidden gap-2 lg:flex">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="h-2 w-2 rounded-full bg-accent" />
        </div>
      </section>
    </>
  )
}