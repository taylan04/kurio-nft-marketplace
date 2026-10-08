import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('catálogo mantém busca na URL e abre detalhe', async ({ page }) => {
  const search = page.getByRole('textbox', { name: 'Explorar coleções' })
  // Mobile displays the search field directly; only desktop uses the header toggle.
  if ((page.viewportSize()?.width ?? 1440) >= 768) {
    await page.getByRole('button', { name: 'Buscar NFTs' }).click()
  }
  await expect(search).toBeVisible()
  await search.fill('Emerald')
  await search.press('Enter')
  await expect(page).toHaveURL(/q=Emerald/)
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  await page.getByText('Emerald Ape #042').first().click()
  await expect(page).toHaveURL(/\/nft\/042/)
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
})

test('login recupera sessão simulada', async ({ page }) => {
  // Em desktop navega sem recarregar o worker; em mobile usa acesso direto.
  const loginLink = page.getByRole('link', { name: 'Entrar', exact: true })
  if (await loginLink.isVisible()) {
    await loginLink.click()
  } else {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
  }
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
})

test('adiciona NFT ao carrinho e mantém após refresh', async ({ page }) => {
  await page.goto('/nft/042')
  await page.getByRole('button', { name: 'COMPRAR' }).click()
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
})

test('rota inexistente mostra 404', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
})
