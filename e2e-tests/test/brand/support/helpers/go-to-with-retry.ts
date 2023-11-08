import type { Page } from '@playwright/test'

export const gotoWithRetry = async (page: Page, url: string, retryCount: number = 3) => {
  await page.waitForTimeout(500)
  if (retryCount < 0) {
    throw new Error(`Failed to navigate to ${url} after ${retryCount} retries.`)
  }
  await Promise.all([
    page.goto(url, {
      timeout: 60 * 1000,
      waitUntil: 'load',
    }),
    page.waitForResponse((response) => response.ok(), { timeout: 60000 }),
  ]).catch(() => {
    gotoWithRetry(page, url, retryCount - 1)
  })
}
