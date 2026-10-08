import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('catálogo mantém busca na URL e abre detalhe', async ({ page }) => {
  await page.getByLabel('Explorar coleções').fill('Emerald')
  await page.getByLabel('Explorar coleções').press('Enter')
  await expect(page).toHaveURL(/q=Emerald/)
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  await page.getByText('Emerald Ape #042').first().click()
  await expect(page).toHaveURL(/\/nft\/042/)
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
})

test('login recupera sessão simulada', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha').fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
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
