import { delay, http, HttpResponse } from 'msw'
import Decimal from 'decimal.js'
import { multiplyEth } from '@/lib/money'
import type { Cart, CartItem, CartLine, CatalogSearch, NFT, Order, Quote, Wallet } from '@/types/domain'
import { getAuthUser, getCartKey, readDb, resetDb, writeDb } from './db'
import { emitRealtime, realtimeHandler } from './realtime'
import { getScenario, setScenario } from './scenarios'

async function networkDelay() {
  await delay(getScenario().latencyMs)
}

function error(message: string, status = 400) {
  return HttpResponse.json({ message }, { status })
}

function requireUser(request: Request) {
  const db = readDb()
  const user = getAuthUser(request, db)
  return { db, user }
}

function buildQuote(items: CartItem[], nfts: NFT[], coupon?: string): Quote {
  const subtotal = items.reduce((total, item) => {
    const nft = nfts.find((entry) => entry.id === item.nftId)
    return nft ? total.plus(new Decimal(nft.priceEth).times(item.quantity)) : total
  }, new Decimal(0))
  const discount = coupon === 'KURIO10' ? subtotal.times('0.10') : new Decimal(0)
  const fee = new Decimal('0.016')
  return {
    subtotalEth: subtotal.toFixed(3),
    discountEth: discount.toFixed(3),
    networkFeeEth: fee.toFixed(3),
    totalEth: subtotal.minus(discount).plus(fee).toFixed(3),
    coupon,
  }
}

function buildCart(request: Request, coupon?: string): Cart {
  const db = readDb()
  const key = getCartKey(request, db)
  const items = db.carts[key] || []
  const lines: CartLine[] = items.flatMap((item) => {
    const nft = db.nfts.find((entry) => entry.id === item.nftId)
    if (!nft) return []
    return [{ ...item, nft, lineTotalEth: multiplyEth(nft.priceEth, item.quantity) }]
  })
  return { items, lines, quote: buildQuote(items, db.nfts, coupon) }
}

export const handlers = [
  realtimeHandler,

  http.get('/api/nfts', async ({ request }) => {
    await networkDelay()
    if (getScenario().force500) return error('Falha transitória simulada.', 500)
    const db = readDb()
    const url = new URL(request.url)
    const search: CatalogSearch = {
      q: url.searchParams.get('q') || undefined,
      category: url.searchParams.get('category') || undefined,
      network: (url.searchParams.get('network') || '') as CatalogSearch['network'],
      minPrice: url.searchParams.get('minPrice') || undefined,
      maxPrice: url.searchParams.get('maxPrice') || undefined,
      sort: (url.searchParams.get('sort') || 'recent') as CatalogSearch['sort'],
      page: Number(url.searchParams.get('page') || 1),
    }
    let items = [...db.nfts]
    if (search.q) items = items.filter((nft) => `${nft.name} ${nft.collection}`.toLowerCase().includes(search.q!.toLowerCase()))
    if (search.category) items = items.filter((nft) => nft.category === search.category)
    if (search.network) items = items.filter((nft) => nft.network === search.network)
    if (search.minPrice) items = items.filter((nft) => new Decimal(nft.priceEth).gte(search.minPrice!))
    if (search.maxPrice) items = items.filter((nft) => new Decimal(nft.priceEth).lte(search.maxPrice!))
    if (search.sort === 'price-asc') items.sort((a, b) => new Decimal(a.priceEth).cmp(b.priceEth))
    if (search.sort === 'price-desc') items.sort((a, b) => new Decimal(b.priceEth).cmp(a.priceEth))
    if (search.sort === 'popular') items.sort((a, b) => b.reviews - a.reviews)
    const pageSize = 9
    const page = Math.max(1, search.page || 1)
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    return HttpResponse.json({ items: items.slice(start, start + pageSize), page, pageSize, total, totalPages })
  }),

  http.get('/api/nfts/:id', async ({ params }) => {
    await networkDelay()
    const nft = readDb().nfts.find((item) => item.id === params.id)
    return nft ? HttpResponse.json(nft) : error('NFT não encontrado.', 404)
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await networkDelay()
    const input = await request.json() as { email: string; password: string }
    const db = readDb()
    const user = db.users.find((entry) => entry.email.toLowerCase() === input.email.toLowerCase())
    if (!user || user.password !== input.password) return error('E-mail ou senha inválidos.', 401)
    const token = crypto.randomUUID()
    db.sessions[token] = user.id
    const guestId = request.headers.get('x-guest-id')
    if (guestId) {
      const guestKey = `guest:${guestId}`
      const userKey = `user:${user.id}`
      const merged = [...(db.carts[userKey] || [])]
      for (const guestItem of db.carts[guestKey] || []) {
        const existing = merged.find((item) => item.nftId === guestItem.nftId && item.edition === guestItem.edition)
        if (existing) existing.quantity += guestItem.quantity
        else merged.push(guestItem)
      }
      db.carts[userKey] = merged
      delete db.carts[guestKey]
    }
    writeDb(db)
    const { password: _password, ...safeUser } = user
    return HttpResponse.json({ token, user: safeUser })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await networkDelay()
    const input = await request.json() as { username: string; email: string; password: string }
    const db = readDb()
    if (db.users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase())) return error('Este e-mail já está cadastrado.', 409)
    if (input.password.length < 8) return error('A senha precisa ter pelo menos 8 caracteres.', 422)
    const user = { id: crypto.randomUUID(), username: input.username, displayName: input.username, email: input.email, password: input.password }
    db.users.push(user)
    const token = crypto.randomUUID()
    db.sessions[token] = user.id
    writeDb(db)
    const { password: _password, ...safeUser } = user
    return HttpResponse.json({ token, user: safeUser }, { status: 201 })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    await networkDelay()
    const { user } = requireUser(request)
    if (!user) return error('Sessão inválida ou expirada.', 401)
    const { password: _password, ...safeUser } = user
    const token = request.headers.get('authorization')!.replace(/^Bearer\s+/i, '')
    return HttpResponse.json({ token, user: safeUser })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const db = readDb()
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (token) delete db.sessions[token]
    writeDb(db)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/favorites', async ({ request }) => {
    const { db, user } = requireUser(request)
    if (!user) return error('Faça login para ver favoritos.', 401)
    return HttpResponse.json({ ids: db.favorites[user.id] || [] })
  }),

  http.post('/api/favorites/:id', async ({ request, params }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Faça login para favoritar.', 401)
    const ids = new Set(db.favorites[user.id] || [])
    ids.add(String(params.id))
    db.favorites[user.id] = [...ids]
    writeDb(db)
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('/api/favorites/:id', async ({ request, params }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Faça login para favoritar.', 401)
    db.favorites[user.id] = (db.favorites[user.id] || []).filter((id) => id !== params.id)
    writeDb(db)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/cart', async ({ request }) => {
    await networkDelay()
    return HttpResponse.json(buildCart(request))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    await networkDelay()
    const input = await request.json() as CartItem
    const db = readDb()
    const nft = db.nfts.find((entry) => entry.id === input.nftId)
    if (!nft) return error('NFT não encontrado.', 404)
    const key = getCartKey(request, db)
    const items = db.carts[key] || []
    const existing = items.find((item) => item.nftId === input.nftId && item.edition === input.edition)
    const nextQuantity = (existing?.quantity || 0) + input.quantity
    if (nextQuantity > nft.available) return error('Quantidade indisponível.', 409)
    if (existing) existing.quantity = nextQuantity
    else items.push(input)
    db.carts[key] = items
    writeDb(db)
    return HttpResponse.json(buildCart(request), { status: 201 })
  }),

  http.patch('/api/cart/items/:id', async ({ request, params }) => {
    await networkDelay()
    const input = await request.json() as { edition: CartItem['edition']; quantity: number }
    const db = readDb()
    const nft = db.nfts.find((entry) => entry.id === params.id)
    if (!nft) return error('NFT não encontrado.', 404)
    if (input.quantity < 1 || input.quantity > nft.available) return error('Quantidade indisponível.', 409)
    const key = getCartKey(request, db)
    const item = (db.carts[key] || []).find((entry) => entry.nftId === params.id)
    if (!item) return error('Item não está no carrinho.', 404)
    item.quantity = input.quantity
    item.edition = input.edition
    writeDb(db)
    return HttpResponse.json(buildCart(request))
  }),

  http.delete('/api/cart/items/:id', async ({ request, params }) => {
    await networkDelay()
    const db = readDb()
    const key = getCartKey(request, db)
    db.carts[key] = (db.carts[key] || []).filter((entry) => entry.nftId !== params.id)
    writeDb(db)
    return HttpResponse.json(buildCart(request))
  }),

  http.post('/api/quote', async ({ request }) => {
    await networkDelay()
    const { coupon } = await request.json() as { coupon?: string }
    const db = readDb()
    if (coupon && !db.coupons[coupon]) return error('Cupom inválido.', 422)
    if (coupon && db.coupons[coupon] === 'expired') return error('Cupom expirado.', 422)
    return HttpResponse.json(buildCart(request, coupon))
  }),

  http.post('/api/orders', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) return error('Idempotency-Key é obrigatória.', 400)
    const input = await request.json() as { walletType: Wallet['type'] }
    const cart = buildCart(request)
    if (!cart.items.length) return error('Carrinho vazio.', 409)
    const payloadSignature = JSON.stringify({ input, items: cart.items })
    const previous = db.orders.find((order) => order.idempotencyKey === idempotencyKey)
    if (previous) {
      if (previous.payloadSignature !== payloadSignature) return error('Chave de idempotência reutilizada com conteúdo diferente.', 409)
      return HttpResponse.json(previous)
    }
    const order: Order = {
      id: `order-${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      transactionHash: `0x${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
      walletType: input.walletType,
      walletLabel: input.walletType,
      lines: structuredClone(cart.lines),
      quote: structuredClone(cart.quote),
      idempotencyKey,
      payloadSignature,
      version: 1,
    }
    db.orders.push(order)
    writeDb(db)

    setTimeout(() => {
      const latestDb = readDb()
      const stored = latestDb.orders.find((entry) => entry.id === order.id)
      if (!stored || stored.status !== 'pending') return
      stored.status = getScenario().payment === 'declined' ? 'declined' : 'confirmed'
      stored.version += 1
      if (stored.status === 'confirmed') {
        const cartKey = `user:${user.id}`
        latestDb.carts[cartKey] = (latestDb.carts[cartKey] || []).filter((item) => !stored.lines.some((line) => line.nftId === item.nftId))
      }
      writeDb(latestDb)
      emitRealtime('order.updated', { resourceId: stored.id, userId: user.id, version: stored.version, data: stored })
    }, 1400)

    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/orders/:id', async ({ request, params }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const order = db.orders.find((entry) => entry.id === params.id && entry.userId === user.id)
    return order ? HttpResponse.json(order) : error('Pedido não encontrado.', 404)
  }),

  http.get('/api/profile', async ({ request }) => {
    const { user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const { password: _password, ...safeUser } = user
    return HttpResponse.json(safeUser)
  }),

  http.patch('/api/profile', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const input = await request.json() as Record<string, string>
    Object.assign(user, input)
    writeDb(db)
    const { password: _password, ...safeUser } = user
    return HttpResponse.json(safeUser)
  }),

  http.post('/api/profile/password', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const input = await request.json() as { currentPassword: string; newPassword: string }
    if (input.currentPassword !== user.password) return error('Senha atual incorreta.', 422)
    if (input.newPassword.length < 8) return error('Nova senha muito curta.', 422)
    user.password = input.newPassword
    writeDb(db)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/wallets', async ({ request }) => {
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    return HttpResponse.json(db.wallets.filter((wallet) => wallet.userId === user.id))
  }),

  http.post('/api/wallets', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const input = await request.json() as Omit<Wallet, 'userId'>
    if (!input.address?.startsWith('0x')) return error('Endereço de carteira inválido.', 422)
    const wallet: Wallet = { ...input, id: input.id || crypto.randomUUID(), userId: user.id }
    const index = db.wallets.findIndex((entry) => entry.id === wallet.id && entry.userId === user.id)
    if (index >= 0) db.wallets[index] = wallet
    else db.wallets.push(wallet)
    writeDb(db)
    return HttpResponse.json(wallet, { status: index >= 0 ? 200 : 201 })
  }),

  http.post('/api/mock/reset', () => {
    resetDb()
    return HttpResponse.json({ ok: true })
  }),

  http.post('/api/mock/scenario', async ({ request }) => {
    const input = await request.json() as Parameters<typeof setScenario>[0]
    setScenario(input)
    return HttpResponse.json(getScenario())
  }),

  http.post('/api/mock/nft-update', async ({ request }) => {
    const input = await request.json() as { nftId?: string; priceEth?: string; available?: number }
    const db = readDb()
    const nft = db.nfts.find((entry) => entry.id === (input.nftId || '042'))
    if (!nft) return error('NFT não encontrado.', 404)
    if (input.priceEth) nft.priceEth = input.priceEth
    else nft.priceEth = new Decimal(nft.priceEth).plus('0.10').toFixed(2)
    if (typeof input.available === 'number') nft.available = input.available
    nft.version += 1
    writeDb(db)
    emitRealtime('nft.updated', { resourceId: nft.id, version: nft.version, data: nft })
    return HttpResponse.json(nft)
  }),
]
