import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Setup global test data or authentication if needed
  await page.goto('http://localhost:3000')

  // Wait for app to be ready
  await page.waitForLoadState('networkidle')

  await browser.close()
}

export default globalSetup
