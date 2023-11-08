import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export default class Navbar {
  readonly page: Page
  readonly storeFrontButton: Locator
  readonly productsButton: Locator
  readonly accountMenuButton: Locator
  readonly manageStoresButton: Locator
  readonly getAlertClose: Locator
  readonly giftcardsButton: Locator
  readonly saveChangesButton: Locator
  readonly addLinkTextInput: Locator
  readonly bannerButton: Locator

  constructor(page: Page) {
    this.page = page
    this.productsButton = page.locator('a:has-text("Products")').nth(1)
    this.storeFrontButton = page.locator('a:text-is("Storefront")').nth(1)
    this.accountMenuButton = page.locator('[data-testid="atomic-subnavbar-right"] >> button').nth(0)
    this.manageStoresButton = page.locator('button:has-text("Manage Stores")').nth(0)
    this.getAlertClose = page.locator('[aria-label="Close"]').nth(0)
    this.giftcardsButton = page.locator('text=Gift Cards').nth(1)
    this.saveChangesButton = page.locator('button:text-is("Save Changes")')
    this.addLinkTextInput = page.locator('#add-link-text')
    this.bannerButton = page.locator('[data-testid="ZSidebar_grid"] >> text=Banner')
  }
  async getAlert(text: string) {
    const alert = this.page.locator(`[role="status"]:has-text('${text}')`)
    await expect(alert.nth(0)).toHaveCount(1, { timeout: 120000 })
    // const close = alert.getByRole('button', { name: 'Close' })
    // await close.click({ force: true })
  }
}
