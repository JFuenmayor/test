import type { Page } from '@playwright/test'

export const reloadWithRetry = async (page: Page, retryCount: number = 3) => {
  if (retryCount < 0) {
    throw new Error(`Failed to reload after ${retryCount} retries.`)
  }
  await Promise.all([
    page.waitForResponse(async (resp) => resp.status() === 302, {
      timeout: 30000,
    }),
    page.reload({
      timeout: 30 * 1000,
      waitUntil: 'load',
    }),
  ]).catch(async () => {
    await reloadWithRetry(page, retryCount - 1)
  })
}
