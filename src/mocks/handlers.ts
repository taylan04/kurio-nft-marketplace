import { delay, http, HttpResponse } from 'msw'
import Decimal from 'decimal.js'
import { multiplyEth } from '@/lib/money'
import { validateCollector } from '@/lib/collectorValidation'
import type { Cart, CartItem, CartLine, CatalogSearch, CollectorDetails, NFT, Order, Quote, Wallet } from '@/types/domain'
import { getAuthUser, getCartKey, readDb, resetDb, writeDb } from './db'
import { emitRealtime, realtimeHandler } from './realtime'
import { getScenario, resetScenario, setScenario } from './scenarios'
import { createPasswordSalt, hashPassword } from './passwords'
import { nftFixtures } from './fixtures'

async function networkDelay() {
  await delay(getScenario().latencyMs)
}

function error(message: string, status = 400) {
  return HttpResponse.json({ message }, { status })
}

function requireUser(request: Request) {
  const db = readDb()
  const user = getScenario().expireSession ? undefined : getAuthUser(request, db)
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
    revision: items.map((item) => {
      const nft = nfts.find((entry) => entry.id === item.nftId)
      return `${item.nftId}/${item.edition}/${item.quantity}/${nft?.version}/${nft?.priceEth}/${nft?.available}`
    }).join('|'),
    stale: items.some((item) => {
      const nft = nfts.find((entry) => entry.id === item.nftId)
      return !nft || !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
        item.quantity > nft.available || !nft.editions.includes(item.edition)
    }),
  }
}

function buildCart(request: Request): Cart {
  const db = readDb()
  const key = getCartKey(request, db)
  const items = db.carts[key] || []
  const lines: CartLine[] = items.flatMap((item) => {
    const nft = db.nfts.find((entry) => entry.id === item.nftId)
    if (!nft) return []
    return [{ ...item, nft, lineTotalEth: multiplyEth(nft.priceEth, item.quantity) }]
  })
  return { items, lines, quote: buildQuote(items, db.nfts, db.appliedCoupons[key]) }
}

function matchesQuote(expected: Quote | undefined, actual: Quote) {
  return !!expected && !actual.stale &&
    expected.subtotalEth === actual.subtotalEth &&
    expected.discountEth === actual.discountEth &&
    expected.networkFeeEth === actual.networkFeeEth &&
    expected.totalEth === actual.totalEth &&
    expected.revision === actual.revision &&
    (expected.coupon || '') === (actual.coupon || '')
}

function matchesItems(expected: CartItem[] | undefined, actual: CartItem[]) {
  if (!Array.isArray(expected) || expected.length !== actual.length) return false
  const key = (item: CartItem) => `${item.nftId}/${item.edition}/${item.quantity}`
  return expected.map(key).sort().join('|') === actual.map(key).sort().join('|')
}

// Orders are persisted immediately; reading an order after a refresh can finish a
// pending operation even when the original tab's timer was interrupted.
function settleOrder(orderId: string) {
  const db = readDb()
  const order = db.orders.find((entry) => entry.id === orderId)
  if (!order || order.status !== 'pending') return
  if (Date.now() - new Date(order.createdAt).getTime() < 1400) return

  order.status = getScenario().payment === 'declined' ? 'declined' : 'confirmed'
  order.version += 1
  if (order.status === 'confirmed') {
    const cartKey = `user:${order.userId}`
    const purchased = new Map(order.lines.map((line) => [`${line.nftId}:${line.edition}`, line.quantity]))
    db.carts[cartKey] = (db.carts[cartKey] || []).flatMap((item) => {
      const bought = purchased.get(`${item.nftId}:${item.edition}`) || 0
      return item.quantity > bought ? [{ ...item, quantity: item.quantity - bought }] : []
    })
    for (const line of order.lines) {
      const nft = db.nfts.find((entry) => entry.id === line.nftId)
      if (!nft) continue
      nft.available = Math.max(0, nft.available - line.quantity)
      nft.version += 1
    }
  }
  writeDb(db)
  if (order.status === 'confirmed') {
    for (const line of order.lines) {
      const nft = db.nfts.find((entry) => entry.id === line.nftId)
      if (nft) emitRealtime('nft.updated', { resourceId: nft.id, version: nft.version, data: nft })
    }
  }
  emitRealtime('order.updated', { resourceId: order.id, userId: order.userId, version: order.version, data: order })
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
    if (!user || !input.password || await hashPassword(input.password, user.passwordSalt) !== user.passwordHash) return error('E-mail ou senha inválidos.', 401)
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
      if (db.appliedCoupons[guestKey] && !db.appliedCoupons[userKey]) db.appliedCoupons[userKey] = db.appliedCoupons[guestKey]
      delete db.carts[guestKey]
      delete db.appliedCoupons[guestKey]
    }
    writeDb(db)
    const { passwordHash: _hash, passwordSalt: _salt, ...safeUser } = user
    return HttpResponse.json({ token, user: safeUser })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await networkDelay()
    const input = await request.json() as { username: string; email: string; password: string }
    const db = readDb()
    const email = input.email?.trim().toLowerCase()
    if (!input.username?.trim() || input.username.trim().length < 3 || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return error('Informe nome de usuário (mínimo 3 caracteres) e e-mail válidos.', 422)
    if (db.users.some((entry) => entry.email.toLowerCase() === email)) return error('Este e-mail já está cadastrado.', 409)
    if (!input.password || input.password.length < 8) return error('A senha precisa ter pelo menos 8 caracteres.', 422)
    const salt = createPasswordSalt()
    const user = { id: crypto.randomUUID(), username: input.username.trim(), displayName: input.username.trim(), email, passwordSalt: salt, passwordHash: await hashPassword(input.password, salt) }
    db.users.push(user)
    const token = crypto.randomUUID()
    db.sessions[token] = user.id
    writeDb(db)
    const { passwordHash: _hash, passwordSalt: _salt, ...safeUser } = user
    return HttpResponse.json({ token, user: safeUser }, { status: 201 })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    await networkDelay()
    const { user } = requireUser(request)
    if (!user) return error('Sessão inválida ou expirada.', 401)
    const { passwordHash: _hash, passwordSalt: _salt, ...safeUser } = user
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
    if (getScenario().force500) return error('Falha transitória simulada nos favoritos.', 500)
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
    if (getScenario().force500) return error('Falha transitória simulada nos favoritos.', 500)
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
    if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 ||
        !nft.editions.includes(input.edition) || nextQuantity > nft.available) return error('Edição ou quantidade indisponível.', 409)
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
    if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > nft.available ||
      !nft.editions.includes(input.edition)) return error('Edição ou quantidade indisponível.', 409)
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
    const normalized = coupon?.trim().toUpperCase()
    if (normalized && !db.coupons[normalized]) return error('Cupom inválido.', 422)
    if (normalized && db.coupons[normalized] === 'expired') return error('Cupom expirado.', 422)
    const key = getCartKey(request, db)
    if (normalized) db.appliedCoupons[key] = normalized
    else delete db.appliedCoupons[key]
    writeDb(db)
    return HttpResponse.json(buildCart(request))
  }),

  http.get('/api/quote', async ({ request }) => {
    await networkDelay()
    return HttpResponse.json(buildCart(request))
  }),

  http.post('/api/orders', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) return error('Idempotency-Key é obrigatória.', 400)
    const input = await request.json() as { walletType: Wallet['type']; expectedQuote: Quote; expectedItems: CartItem[]; collector: CollectorDetails }
    const payloadSignature = JSON.stringify(input)
    const previous = db.orders.find((order) => order.idempotencyKey === idempotencyKey)
    if (previous) {
      if (previous.userId !== user.id || previous.payloadSignature !== payloadSignature) return error('Chave de idempotência reutilizada com conteúdo diferente.', 409)
      settleOrder(previous.id)
      const recovered = readDb().orders.find((entry) => entry.id === previous.id)!
      return HttpResponse.json(recovered)
    }
    const savedWallet = db.wallets.find((entry) => entry.userId === user.id && entry.type === input.walletType)
    if (!savedWallet) return error('Cadastre uma carteira deste tipo antes de finalizar.', 422)
    if (!input.collector || typeof input.collector !== 'object') return error('Preencha os dados do colecionador.', 422)
    const collectorErrors = validateCollector(input.collector, savedWallet)
    if (Object.keys(collectorErrors).length) return HttpResponse.json({ message: 'Revise os dados do colecionador.', fields: collectorErrors }, { status: 422 })
    const cart = buildCart(request)
    if (!cart.items.length) return error('Carrinho vazio.', 409)
    if (!matchesQuote(input.expectedQuote, cart.quote) || !matchesItems(input.expectedItems, cart.items))
      return HttpResponse.json({ message: 'A cotação ou disponibilidade mudou. Revise o pedido.', quote: cart.quote }, { status: 409 })
    const order: Order = {
      id: `order-${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      transactionHash: `0x${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
      walletType: input.walletType,
      walletLabel: savedWallet.label,
      collector: structuredClone(input.collector),
      lines: structuredClone(cart.lines),
      quote: structuredClone(cart.quote),
      idempotencyKey,
      payloadSignature,
      version: 1,
    }
    db.orders.push(order)
    writeDb(db)

    setTimeout(() => settleOrder(order.id), 1450)

    // A operação foi persistida, mas a resposta se perde no caminho. Na
    // próxima tentativa, a chave de idempotência recupera o mesmo pedido.
    // O cenário é de uso único para não manter todas as tentativas bloqueadas.
    if (getScenario().timeoutAfterOrderCreation) {
      setScenario({ timeoutAfterOrderCreation: false })
      // A transação já existe, mas o gateway simulou timeout (HTTP 504).
      // Sem sucesso HTTP, o cliente mantém a mesma chave para recuperação.
      await delay(1_200)
      return error('Tempo limite do gateway: consulte o pedido antes de reenviar.', 504)
    }

    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/orders/by-key/:key', async ({ request, params }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const existing = db.orders.find((entry) => entry.userId === user.id && entry.idempotencyKey === params.key)
    if (!existing) return error('Pedido não encontrado.', 404)
    settleOrder(existing.id)
    return HttpResponse.json(readDb().orders.find((entry) => entry.id === existing.id))
  }),

  http.get('/api/orders/:id', async ({ request, params }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const order = db.orders.find((entry) => entry.id === params.id && entry.userId === user.id)
    if (!order) return error('Pedido não encontrado.', 404)
    settleOrder(order.id)
    return HttpResponse.json(readDb().orders.find((entry) => entry.id === order.id))
  }),

  http.get('/api/profile', async ({ request }) => {
    const { user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const { passwordHash: _hash, passwordSalt: _salt, ...safeUser } = user
    return HttpResponse.json(safeUser)
  }),

  http.patch('/api/profile', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const input = await request.json() as Record<string, string>
    if (!input.displayName?.trim() || !input.username?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email || ''))
      return error('Preencha os campos obrigatórios com dados válidos.', 422)
    if (db.users.some((entry) => entry.id !== user.id && entry.email.toLowerCase() === input.email.toLowerCase()))
      return error('Este e-mail já pertence a outra conta.', 409)
    // Only user-editable fields are accepted; never mass-assign secrets.
    user.displayName = input.displayName.trim()
    user.username = input.username.trim()
    user.email = input.email.trim().toLowerCase()
    user.ens = input.ens?.trim()
    user.walletAlias = input.walletAlias?.trim()
    if (typeof input.avatar === 'string') user.avatar = input.avatar
    writeDb(db)
    const { passwordHash: _hash, passwordSalt: _salt, ...safeUser } = user
    return HttpResponse.json(safeUser)
  }),

  http.post('/api/profile/password', async ({ request }) => {
    await networkDelay()
    const { db, user } = requireUser(request)
    if (!user) return error('Sessão expirada.', 401)
    const input = await request.json() as { currentPassword: string; newPassword: string }
    if (!input.currentPassword || await hashPassword(input.currentPassword, user.passwordSalt) !== user.passwordHash) return error('Senha atual incorreta.', 422)
    if (!input.newPassword || input.newPassword.length < 8) return error('Nova senha muito curta.', 422)
    user.passwordSalt = createPasswordSalt()
    user.passwordHash = await hashPassword(input.newPassword, user.passwordSalt)
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
    if (!input.label?.trim() || !input.nickname?.trim() || !input.profileName?.trim() ||
        !['Ethereum', 'Polygon', 'Solana'].includes(input.network) ||
        !['MetaMask', 'WalletConnect', 'Coinbase Wallet'].includes(input.type) ||
        !/^0x\S{4,}$/.test(input.address || '') ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email || '') ||
        !input.referralCode?.trim()) {
      return error('Preencha todos os campos obrigatórios da carteira com dados válidos.', 422)
    }
    // Ownership is determined from the session. An id owned by another account
    // can never be used to replace (or clone) a wallet from that account.
    if (input.id && db.wallets.some((entry) => entry.id === input.id && entry.userId !== user.id))
      return error('Você não pode editar essa carteira.', 403)
    const index = input.id ? db.wallets.findIndex((entry) => entry.id === input.id && entry.userId === user.id) : -1
    if (input.id && index < 0) return error('Carteira não encontrada.', 404)
    const wallet: Wallet = {
      id: input.id || crypto.randomUUID(), userId: user.id,
      label: input.label.trim(), nickname: input.nickname.trim(),
      profileName: input.profileName.trim(), secondary: input.secondary?.trim(),
      address: input.address.trim(), network: input.network, type: input.type,
      email: (input.email ?? '').trim().toLowerCase(), ens: input.ens?.trim(),
      referralCode: input.referralCode.trim(), primary: Boolean(input.primary),
    }
    // Only one main wallet per user; secondary wallets stay independent.
    if (wallet.primary) {
      for (const existing of db.wallets) {
        if (existing.userId === user.id && existing.id !== wallet.id) existing.primary = false
      }
    }
    if (index >= 0) db.wallets[index] = wallet
    else db.wallets.push(wallet)
    writeDb(db)
    return HttpResponse.json(wallet, { status: index >= 0 ? 200 : 201 })
  }),

  http.post('/api/mock/reset', () => {
    resetDb()
    resetScenario()
    return HttpResponse.json({ ok: true })
  }),

  http.post('/api/mock/scenario', async ({ request }) => {
    const input = await request.json() as Parameters<typeof setScenario>[0]
    setScenario(input)
    return HttpResponse.json(getScenario())
  }),

  // Test-only replay of the original NFT snapshot through the actual Socket.IO
  // transport. The database is NOT changed: this must be ignored by a newer UI.
  http.post('/api/mock/replay-old-nft', async ({ request }) => {
    const { nftId } = await request.json() as { nftId: string }
    const original = nftFixtures.find((entry) => entry.id === nftId)
    if (!original) return error('NFT não encontrado.', 404)
    emitRealtime('nft.updated', {
      resourceId: original.id,
      version: original.version,
      data: structuredClone(original),
    })
    return HttpResponse.json({ replayedVersion: original.version })
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
