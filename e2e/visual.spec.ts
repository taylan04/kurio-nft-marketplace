
import { expect, test, type Page } from '@playwright/test'

test.use({
  reducedMotion: 'reduce',
})

const isMobile = (page: Page) =>
  (page.viewportSize()?.width ?? 1440) < 768

async function captureVisual(page: Page, name: string) {
  // Aguarda o carregamento das fontes e imagens.
  await page.evaluate(async () => {
    await document.fonts.ready

    const images = Array.from(document.images)

    // Carrega também as imagens que estão fora da tela.
    images.forEach((img) => {
      img.loading = 'eager'
    })

    await Promise.all(
      images.map((img) => img.decode().catch(() => undefined))
    )

    window.scrollTo(0, 0)
  })

  // Compara a captura atual com a imagem de referência.
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
    maxDiffPixelRatio: 0.01,
    timeout: 20000,
  })
}

async function login(page: Page) {
  await page.goto('/login')

  await page.getByLabel('E-mail').fill('collector@kurio.test')

  await page.getByLabel('Senha', { exact: true }).fill('12345678')

  await page.getByRole('button', {
    name: 'Entrar',
    exact: true,
  }).click()

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/')
}

async function addNftToCart(page: Page) {
  await page.goto('/nft/042')

  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' })
  ).toBeVisible()

  await page.getByRole('button', {
    name: /COMPRAR|Comprar NFT/,
  }).click()

  await expect(page).toHaveURL(/\/cart/)

  await expect(
    page.getByText('Emerald Ape #042').first()
  ).toBeVisible()
}

test.beforeEach(async ({ page }, testInfo) => {
  // Resoluções fixas para manter as capturas consistentes.
  const mobile = testInfo.project.name === 'chromium-mobile'

  await page.setViewportSize(
    mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 }
  )

  await page.goto('/')

  // Espera o catálogo e o MSW estarem prontos.
  await expect(
    page.getByRole('button', { name: 'Página 2' })
  ).toBeVisible({ timeout: 15000 })

  // Restaura os dados simulados antes de cada teste.
  await page.evaluate(async () => {
    const response = await fetch('/api/mock/reset', {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Não foi possível restaurar o mock')
    }
  })

  await page.reload()

  await expect(
    page.getByRole('button', { name: 'Página 2' })
  ).toBeVisible({ timeout: 15000 })
})

test('visual - página inicial', async ({ page }) => {
  await captureVisual(page, 'home.png')
})

test('visual - detalhes do NFT', async ({ page }) => {
  await page.goto('/nft/042')

  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' })
  ).toBeVisible()

  await captureVisual(page, 'nft-details.png')
})

test('visual - carrinho', async ({ page }) => {
  await addNftToCart(page)

  await captureVisual(page, 'cart.png')
})

test('visual - checkout', async ({ page }) => {
  await login(page)

  await addNftToCart(page)

  await page.getByRole('button', {
    name: 'Conectar e finalizar',
  }).click()

  await expect(page).toHaveURL(/\/checkout/)

  await expect(
    page.getByRole('button', { name: 'Confirmar compra' })
  ).toBeEnabled()

  // Espera os dados de carteira carregarem.
  if (isMobile(page)) {
    await expect(
      page.getByText('nova.kurio.eth').first()
    ).toBeVisible()
  } else {
    await expect(
      page.getByLabel('E-mail')
    ).toHaveValue('collector@kurio.test')
  }

  await captureVisual(page, 'checkout.png')
})
