import type { Locator, Page } from '@playwright/test'

export default class Hero {
  readonly page: Page
  readonly headingInput: Locator
  readonly descriptionInput: Locator
  readonly buttonTextInput: Locator

  constructor(page: Page) {
    this.page = page
    this.headingInput = page.locator('input[name="properties.heading"]')
    this.descriptionInput = page.locator('textarea[name="properties.description"]')
    this.buttonTextInput = page.locator('input[name="properties.button.text"]')
  }
}
