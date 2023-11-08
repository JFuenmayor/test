import type { Page } from '@playwright/test'

export const GotoWithRetry = async (page: Page, url: string, retryCount: number = 2) => {
  if (retryCount < 0) {
    throw new Error(`Failed to navigate to ${url} after 4 retries.`)
  }
  await Promise.all([
    page.goto(url, {
      timeout: 60 * 1000,
      waitUntil: 'load',
    }),
    page.waitForResponse((response) => response.ok(), { timeout: 60000 }),
  ]).catch(() => {
    GotoWithRetry(page, url, retryCount - 1)
  })
}
