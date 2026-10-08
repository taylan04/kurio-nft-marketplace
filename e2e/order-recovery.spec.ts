import { expect, test, type Page } from '@playwright/test'

async function scenario(page: Page, values: Record<string, unknown>) {
  await page.evaluate(async (data) => {
    const response = await fetch('/api/mock/scenario', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Falha ao preparar mock: ${response.status}`)
  }, values)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('timeout depois de criar o pedido recupera a mesma compra no refresh', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/nft/042')
  await page.getByRole('button', { name: /COMPRAR|Comprar NFT/ }).click()
  await expect(page).toHaveURL(/\/cart/)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page).toHaveURL(/\/checkout/)
  await expect(page.getByLabel('E-mail')).toHaveValue('collector@kurio.test')

  await scenario(page, { timeoutAfterOrderCreation: true })
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  // A cotação é válida e o servidor cria o pedido, mas o Axios expira antes
  // de receber a resposta. A confirmação ainda NÃO deve ser apresentada.
  await expect(page).toHaveURL(/\/checkout/, { timeout: 15_000 })
  await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 15_000 })

  await page.reload()
  await expect(page).toHaveURL(/\/order\/order-/, { timeout: 20_000 })
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
  const orderUrl = page.url()
  await page.reload()
  await expect(page).toHaveURL(orderUrl)
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
})
