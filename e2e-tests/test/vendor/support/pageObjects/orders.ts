import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export default class Orders {
  readonly page: Page
  readonly bulkImportButton: Locator
  readonly bulkExportButton: Locator
  readonly savedExportsButton: Locator
  readonly confirmSelectedButton: Locator
  readonly exportSelectedButton: Locator
  readonly filterProducts: Locator
  readonly searchDate: Locator
  readonly fulfillmentStatus: Locator
  readonly uiCardTop: Locator
  readonly searchIcon: Locator
  readonly clearIcon: Locator
  readonly selectAllCheckbox: Locator
  readonly pagination: Locator
  readonly paginationPages: Locator
  readonly pageLeft: Locator
  readonly pageRight: Locator
  readonly ordersHeader: Locator
  readonly ordersTab: Locator

  constructor(page: Page) {
    this.page = page
    this.bulkImportButton = page.locator('text=BULK IMPORT')
    this.bulkExportButton = page.locator('text=BULK EXPORT')
    this.savedExportsButton = page.locator('text=SAVED EXPORTS')
    this.confirmSelectedButton = page.locator('[aria-label="Confirm Selected"]')
    this.exportSelectedButton = page.locator('button:has-text("Fulfillment Status")')
    this.filterProducts = page.locator('[placeholder="Filter Products"]')
    this.searchDate = page.locator('input[type="text"]')
    this.fulfillmentStatus = page.locator('button:has-text("Fulfillment Status")')
    this.uiCardTop = page.locator('[data-testid="ui-card"]').first()
    this.searchIcon = page.locator('.chakra-input__right-element >> nth=0')
    this.clearIcon = page.locator('[aria-label="clear button"]')
    this.pagination = page.locator('[data-testid="pagination"]')
    this.paginationPages = page.locator('[data-testid="pagination"]')
    this.pageLeft = page.locator('[data-testid="angleLeft"]')
    this.pageRight = page.locator('[data-testid="pagination"]')
    this.selectAllCheckbox = page.locator('[data-testid="th-checkbox"] span >> nth=0')
    this.ordersHeader = page.locator('[data-testid="ui-subnavbar-left"] >> text=Orders')
    this.ordersTab = page.getByRole('link', { name: 'Orders' })
  }
  async user_clicks_Orders_tab() {
    await this.ordersTab.click()
  }

  async user_is_redirected_to_orders(page: Page) {
    await page.waitForURL('**/orders')
  }

  async new_user_should_see_Orders_page_with_no_items_found(page: Page) {
    await page.waitForURL('**/orders')
    //Assertions
    await expect(page.url()).toContain('/orders')
    const noItemsFound = page.locator('table', { hasText: 'No items found' })
    await expect(this.ordersHeader).toBeVisible()
    await expect(noItemsFound).toBeVisible()
  }
}
