import type { NFT } from '@/types/domain'

export function NFTGallery({ nft }: { nft: NFT }) {
  return <div className="grid gap-3 md:grid-cols-[90px_1fr]"><div className="order-2 flex gap-2 overflow-auto md:order-1 md:flex-col">{Array.from({ length: 4 }).map((_, index) => <button key={index} type="button" className="h-16 w-16 shrink-0 overflow-hidden rounded border border-border focus:ring-2 focus:ring-accent md:h-20 md:w-20"><img src={nft.image} alt={`Miniatura ${index + 1} de ${nft.name}`} className="h-full w-full object-cover" /></button>)}</div><div className="order-1 overflow-hidden rounded-xl bg-[#eee8cc] md:order-2"><img src={nft.image} alt={`Imagem principal de ${nft.name}`} className="aspect-square w-full object-cover" /></div></div>
}
