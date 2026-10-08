import { expect, test, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('12345678')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('edita carteira principal e mantém os dados após atualizar a página', async ({ page }) => {
  await login(page)
  await page.goto('/wallets')
  await page.getByRole('button', { name: 'Editar carteira principal Reserva' }).click()
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Reserva')
  await page.getByLabel('Nome de exibição').fill('Reserva atualizada')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByRole('status', { name: 'Carteira salva.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Editar carteira principal Reserva atualizada' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Editar carteira principal Reserva atualizada' })).toBeVisible()
})

test('cria carteira secundária independente da principal', async ({ page }) => {
  await login(page)
  await page.goto('/wallets')
  await page.getByRole('checkbox', { name: 'Igual à carteira principal' }).click()
  await expect(page.getByText('Cadastrando carteira secundária')).toBeVisible()
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Reserva')
  await page.getByLabel('Nome de exibição').fill('Carteira Secundária Teste')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByRole('status', { name: 'Carteira salva.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Editar carteira secundária Carteira Secundária Teste' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Editar carteira principal Reserva' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Editar carteira secundária Carteira Secundária Teste' })).toBeVisible()
})
