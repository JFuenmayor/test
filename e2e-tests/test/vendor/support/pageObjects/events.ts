import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export default class Events {
  readonly page: Page
  readonly searchEvent: Locator
  readonly searchDate: Locator
  readonly eventStatusButton: Locator
  readonly uiTag: Locator
  readonly pagination: Locator
  readonly eventsTab: Locator
  readonly eventsHeader: Locator

  constructor(page: Page) {
    this.page = page
    this.searchEvent = page.locator('[placeholder="Event name"]')
    this.searchDate = page.locator('input[type="text"]')
    this.eventStatusButton = page.locator('text=Event Status')
    this.uiTag = page.locator('[data-testid="ui-tag"]')
    this.pagination = page.locator('[data-testid="ui-tag"]')
    this.eventsTab = page.getByRole('link', { name: 'Events' })
    this.eventsHeader = page.locator('h2', { hasText: 'Events' })
  }

  async user_clicks_on_Events_tab() {
    await this.eventsTab.click()
  }

  async user_is_redirected_to_events(page: Page) {
    await page.waitForURL('**/events')
  }

  async new_user_should_see_Events_page(page: Page) {
    await expect(page.url()).toContain('/events')
    await expect(this.eventsHeader).toBeVisible()
  }
}
