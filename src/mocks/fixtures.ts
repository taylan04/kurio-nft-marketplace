import type { NFT, User, Wallet } from '@/types/domain'

const baseNfts: NFT[] = [
  {
    id: '042', name: 'Emerald Ape #042', image: '/nft-emerald.webp', priceEth: '1.19',
    collection: 'Kurio Apes', category: 'Arte digital', network: 'Ethereum',
    editions: ['1/1', '1/10', '1/50', 'OPEN'], selectedEdition: '1/50', available: 50,
    rating: 4.8, reviews: 19, tokenId: '#0042', attributes: ['Óculos', 'Esmeralda', 'Raro'],
    description: 'Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.', version: 1,
  },
  {
    id: '009', name: 'Sage Nomad #009', image: '/nft-sage.webp', priceEth: '1.69',
    collection: 'Kurio Nomads', category: 'Fotografia', network: 'Polygon',
    editions: ['1/1', '1/10'], selectedEdition: '1/10', available: 10,
    rating: 4.6, reviews: 12, tokenId: '#0009', attributes: ['Chapéu', 'Lilás'],
    description: 'Retrato digital da série Nomads, criado para colecionadores de arte generativa.', version: 1,
  },
  {
    id: '552', name: 'Neon Vessel #552', image: '/nft-ivory.webp', priceEth: '1.99', previousPriceEth: '2.29',
    collection: 'Vessels', category: 'Arte 3D', network: 'Ethereum', rarity: 'RARE',
    editions: ['1/1'], selectedEdition: '1/1', available: 1,
    rating: 4.9, reviews: 27, tokenId: '#0552', attributes: ['Preto', 'Blazer'],
    description: 'Peça única da coleção Vessels.', version: 1,
  },
  {
    id: '118', name: 'Cosmic Bloom #118', image: '/nft-sage.webp', priceEth: '1.29',
    collection: 'Kurio Nomads', category: 'Música', network: 'Solana',
    editions: ['1/10'], selectedEdition: '1/10', available: 8,
    rating: 4.5, reviews: 8, tokenId: '#0118', attributes: ['Cosmic', 'Bloom'],
    description: 'Colecionável audiovisual da coleção Cosmic.', version: 1,
  },
  {
    id: '314', name: 'Violet Nomad #314', image: '/nft-violet.webp', priceEth: '1.39',
    collection: 'Kurio Nomads', category: 'Colecionáveis', network: 'Polygon',
    editions: ['1/1'], selectedEdition: '1/1', available: 7,
    rating: 4.7, reviews: 14, tokenId: '#0314', attributes: ['Violeta', 'Nomad'],
    description: 'Um Nomad de edição limitada.', version: 1,
  },
  {
    id: '088', name: 'Ivory Baron #088', image: '/nft-ivory.webp', priceEth: '1.79',
    collection: 'Barons', category: 'Arte digital', network: 'Ethereum',
    editions: ['1/10'], selectedEdition: '1/10', available: 10,
    rating: 4.8, reviews: 22, tokenId: '#0088', attributes: ['Marfim', 'Barão'],
    description: 'Retrato digital da série Barons.', version: 1,
  },
  {
    id: '207', name: 'Golden Beat #207', image: '/nft-golden.webp', priceEth: '0.99',
    collection: 'Golden Beats', category: 'Música', network: 'Solana',
    editions: ['1/50'], selectedEdition: '1/50', available: 50,
    rating: 4.4, reviews: 7, tokenId: '#0207', attributes: ['Dourado', 'Headphone'],
    description: 'Colecionável musical Golden Beat.', version: 1,
  },
  {
    id: '071', name: 'Golden Frequency #071', image: '/nft-golden.webp', priceEth: '0.59',
    collection: 'Golden Beats', category: 'Generativa', network: 'Polygon',
    editions: ['OPEN'], selectedEdition: 'OPEN', available: 999,
    rating: 4.2, reviews: 5, tokenId: '#0071', attributes: ['Frequency'],
    description: 'Arte generativa da coleção Golden.', version: 1,
  },
  {
    id: '160', name: 'Golden Signal #160', image: '/nft-golden.webp', priceEth: '0.39',
    collection: 'Golden Beats', category: 'Utilidade', network: 'Ethereum',
    editions: ['1/50'], selectedEdition: '1/50', available: 50,
    rating: 4.3, reviews: 6, tokenId: '#0160', attributes: ['Signal'],
    description: 'Token utilitário da coleção Golden.', version: 1,
  },
]

// Catálogo extra (determinístico) para exercitar filtros e paginação — o Figma mostra 4 páginas de 9 NFTs.
const extraNames = [
  'Amber Pulse', 'Jade Rider', 'Onyx Duke', 'Lilac Drifter', 'Copper Wave', 'Moss Baron', 'Velvet Echo', 'Saffron Beat', 'Ivory Sage',
  'Cobalt Ape', 'Dune Nomad', 'Ember Vessel', 'Mint Bloom', 'Plum Nomad', 'Coal Baron', 'Honey Beat', 'Static Frequency', 'Brass Signal',
  'Forest Ape', 'Fog Nomad', 'Night Vessel', 'Petal Bloom', 'Iris Nomad', 'Pearl Baron', 'Gold Rush', 'Radio Frequency', 'Sun Signal',
]

const extraNfts: NFT[] = extraNames.map((name, index) => {
  const base = baseNfts[index % baseNfts.length]
  const id = String(400 + index * 7).padStart(3, '0')
  const price = (0.29 + ((index * 37) % 290) / 100).toFixed(2)
  return {
    ...base,
    id,
    name: `${name} #${id}`,
    priceEth: price,
    previousPriceEth: undefined,
    rarity: index % 5 === 2 ? 'RARE' : undefined,
    tokenId: `#0${id}`,
    rating: Number((4 + ((index * 3) % 10) / 10).toFixed(1)),
    reviews: 3 + ((index * 11) % 30),
    version: 1,
  }
})

export const nftFixtures: NFT[] = [...baseNfts, ...extraNfts]

export const userFixtures: Array<User & { passwordSalt: string; passwordHash: string }> = [
  { id: 'user-1', username: 'collector', displayName: 'Colecionador Kurio', email: 'collector@kurio.test', passwordSalt: 'eeb390e362b397eb712830c4d118cfcf', passwordHash: '560ce199809d4bd705ad37ef043562ee8110c2f139c33eaedc5dc340e022b573', ens: 'nova.kurio.eth', walletAlias: 'Reserva' },
  { id: 'user-2', username: 'second', displayName: 'Segundo Colecionador', email: 'second@kurio.test', passwordSalt: 'd50d1fbd2d65420c0187415738818c2b', passwordHash: '60550e07cd380327746c3424b51bf8293d020a4671de7c33c97c879f1ad03e71', ens: 'second.kurio.eth', walletAlias: 'Principal' },
]

export const walletFixtures: Wallet[] = [
  { id: 'wallet-1', userId: 'user-1', label: 'Reserva', nickname: 'Reserva', address: '0x7C3D...91A0', network: 'Polygon', type: 'Coinbase Wallet', ens: 'nova.kurio.eth', email: 'collector@kurio.test', referralCode: 'KURIO', primary: true },
  { id: 'wallet-2', userId: 'user-1', label: 'Principal', nickname: 'Principal', address: '0xA91F…E82C', network: 'Ethereum', type: 'MetaMask', email: 'collector@kurio.test', referralCode: 'KURIO', primary: false },
  { id: 'wallet-3', userId: 'user-2', label: 'Principal', nickname: 'Principal', address: '0x2222...2222', network: 'Ethereum', type: 'MetaMask', email: 'second@kurio.test', referralCode: 'SECOND', primary: true },
]
