import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('filtros e paginação ficam na URL e o histórico restaura o estado', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Página 2' })).toBeVisible()
  await page.getByRole('button', { name: 'Página 2' }).click()
  await expect(page).toHaveURL(/page=2/)

  await page.getByRole('button', { name: /Arte digital\s*\(/ }).click()
  await expect(page).toHaveURL(/category=Arte%20digital|category=Arte\+digital/)
  await expect(page).toHaveURL(/page=1/)
  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
})

test('abas executam ordenação real e persistem no refresh', async ({ page }) => {
  await page.getByRole('button', { name: 'Em alta' }).click()
  await expect(page).toHaveURL(/sort=popular/)
  await expect(page.getByRole('button', { name: 'Em alta' })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Em alta' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Novos lançamentos' }).click()
  await expect(page).toHaveURL(/sort=recent/)
  await expect(page.getByRole('button', { name: 'Novos lançamentos' })).toHaveAttribute('aria-pressed', 'true')
})

test('busca retorna resultados vazios e restaura os parâmetros ao voltar', async ({ page }) => {
  await page.goto('/?q=Emerald&sort=recent&page=1')
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  await page.goto('/?q=nao-existe-nft&sort=recent&page=1')
  await expect(page.getByText('Nenhum NFT encontrado com esses filtros.')).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/q=Emerald/)
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
})
