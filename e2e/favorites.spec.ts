import { expect, test, type Page } from '@playwright/test'

async function setScenario(page: Page, values: Record<string, unknown>) {
  await page.evaluate(async (data) => {
    const response = await fetch('/api/mock/scenario', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Mock scenario failed: ${response.status}`)
  }, values)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('favoritos no catálogo persistem após recarregar a página', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)

  const card = page.locator('article').filter({ hasText: 'Emerald Ape #042' }).first()
  await expect(card.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()
  const removalSaved = page.waitForResponse((response) =>
    response.url().includes('/api/favorites/042') &&
    response.request().method() === 'DELETE' &&
    response.status() === 204,
  )
  await card.getByRole('button', { name: 'Remover dos favoritos' }).click()
  await removalSaved
  await expect(card.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeVisible()
  await page.reload()
  await expect(card.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeVisible()

  await card.getByRole('button', { name: 'Adicionar aos favoritos' }).click()
  await expect(card.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()
})

test('falha HTTP na mutation de favorito desfaz a atualização otimista', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  const card = page.locator('article').filter({ hasText: 'Emerald Ape #042' }).first()
  await expect(card.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()
  await setScenario(page, { force500: true })
  await card.getByRole('button', { name: 'Remover dos favoritos' }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível salvar o favorito', { timeout: 10_000 })
  await expect(card.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()
  await setScenario(page, { force500: false })
})
