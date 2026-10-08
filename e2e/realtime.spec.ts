import { expect, test } from '@playwright/test'

// MSW intercepts fetch inside the page (not Playwright's Node request fixture).
async function simulate(page: import('@playwright/test').Page, path: string, data: object) {
  await page.evaluate(async ({ path, data }) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Mock endpoint: ${response.status}`)
  }, { path, data })
}

test('Socket.IO updates NFT details and ignores old events', async ({ page }) => {
  await page.goto('/nft/042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()

  await simulate(page, '/api/mock/nft-update', { nftId: '042', priceEth: '1.79' })
  await expect(page.getByText('1.79 ETH').first()).toBeVisible()

  // The old version travels through MSW's Socket.IO handler, not a UI setter.
  await simulate(page, '/api/mock/replay-old-nft', { nftId: '042' })
  await expect(page.getByText('1.79 ETH').first()).toBeVisible()
})

test('cart recalculates the REST quote when a price changes', async ({ page }) => {
  await page.goto('/nft/042')
  await page.getByRole('button', { name: /COMPRAR|Comprar NFT/ }).click()
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  await simulate(page, '/api/mock/nft-update', { nftId: '042', priceEth: '1.79' })
  await expect(page.getByText('1.79 ETH').first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('1.79 ETH').first()).toBeVisible()
})
