import { expect, test, type Page } from '@playwright/test'

async function login(page: Page, email = 'collector@kurio.test') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('a sessao sobrevive ao refresh e o logout protege as rotas privadas', async ({ page }) => {
  await login(page)
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('E-mail')).toHaveValue('collector@kurio.test')

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await page.goto('/wallets')
  await expect(page).toHaveURL(/\/login/)
})

test('a troca de usuario nao mostra carteiras da sessao anterior', async ({ page }) => {
  await login(page)
  await page.goto('/wallets')
  await expect(page.getByRole('button', { name: 'Editar carteira principal Reserva' })).toBeVisible()
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')

  await login(page, 'second@kurio.test')
  await page.goto('/wallets')
  await expect(page.getByRole('button', { name: 'Editar carteira principal Principal' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Editar carteira principal Reserva' })).toHaveCount(0)
})

test('o carrinho do visitante sobrevive ao refresh e acompanha o login', async ({ page }) => {
  await page.goto('/nft/042')
  await page.getByRole('button', { name: /COMPRAR|Comprar NFT/ }).click()
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()

  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout/)
  if ((page.viewportSize()?.width ?? 1440) < 768) {
    await page.getByText(/Revisar itens do pedido/).click()
  }
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
})
