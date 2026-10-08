import { expect, test, type Page } from '@playwright/test'

async function setScenario(page: Page, data: Record<string, unknown>) {
  await page.evaluate(async (values) => {
    const result = await fetch('/api/mock/scenario', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values),
    })
    if (!result.ok) throw new Error(`Falha ao preparar cenário: ${result.status}`)
  }, data)
}

async function preparePurchase(page: Page) {
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
  if ((page.viewportSize()?.width || 1440) < 768) {
    await page.getByRole('button', { name: 'Revisar dados do colecionador' }).click()
  }
  await expect(page.getByLabel('E-mail')).toHaveValue('collector@kurio.test')
}


test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('checkout valida dados e conclui pedido com recibo persistente', async ({ page }) => {
  await preparePurchase(page)
  const email = page.getByLabel('E-mail')
  await expect(email).toHaveValue('collector@kurio.test')
  await email.fill('invalido')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
  await expect(page).toHaveURL(/\/checkout/)
  await email.fill('collector@kurio.test')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/order\/order-/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Emerald Ape #042')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
})

test('pagamento recusado mantém os NFTs no carrinho', async ({ page }) => {
  await preparePurchase(page)
  await setScenario(page, { payment: 'declined' })
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/order\/order-/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible({ timeout: 15_000 })
  await page.getByRole('link', { name: 'Voltar ao carrinho' }).click()
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
})
