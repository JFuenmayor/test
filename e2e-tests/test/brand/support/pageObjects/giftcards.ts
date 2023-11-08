import { addWeeks, format, addDays } from 'date-fns'
import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import baseURL from '../../../../playwright.config'
import { gotoWithRetry } from '../helpers'
import { Navbar } from '../pageObjects'
const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
const dateFormatEnUs = (date: Date) => format(date, 'M/d/yyyy')
const weekFromToday = dateFormatInput(addWeeks(new Date(), 1))
const todaysDate = new Date().toLocaleDateString()
const tomorrowsDate = addDays(new Date(), 1).toLocaleDateString()
const weekFromTodayEnUs = dateFormatEnUs(addWeeks(new Date(), 1))

export default class GiftCards {
  readonly page: Page
  readonly createGiftCardButton: Locator
  readonly modalSaveButton: Locator
  readonly expirationDateInput: Locator
  readonly amountInput: Locator

  constructor(page: Page) {
    this.page = page
    this.createGiftCardButton = page.locator('text=Create a Gift Card')
    this.modalSaveButton = page.locator('button', { hasText: 'Save' })
    this.expirationDateInput = page.locator('[placeholder="Expiration Date"]').nth(1)
    this.amountInput = page.locator('input[name="initialValue"]')
  }

  async gotoGiftcards() {
    await gotoWithRetry(this.page, `${baseURL.use?.baseURL}/brand/store/gift-cards`, 5)
  }

  async user_clicks_Gift_Cards_tab(page: Page) {
    const navbar = new Navbar(page)
    await navbar.giftcardsButton.click()
  }

  async user_clicks_Create_a_gift_card(page: Page) {
    const giftcards = new GiftCards(page)
    await giftcards.createGiftCardButton.waitFor({ state: 'visible' })
    await giftcards.createGiftCardButton.click()
  }

  async user_selects_a_currency_from_the_currency_drop_down(page: Page) {
    await page
      .getByTestId('AutoCompleteCurrency')
      .locator('div')
      .filter({ hasText: 'USD' })
      .nth(1)
      .click()
    await page.getByText('MXN').click()
    await page
      .getByTestId('AutoCompleteCurrency')
      .locator('div')
      .filter({ hasText: 'MXN' })
      .nth(1)
      .click()
    await page.getByText('USD').click()
  }

  async user_enters_a_positive_integer_in_Amount_field(page: Page) {
    await page.locator('#card-amount').fill('10')
  }

  async user_does_not_enter_an_expiration_date(page: Page) {}

  async user_enters_an_expiration_date_that_is_in_the_future(page: Page) {
    const giftcards = new GiftCards(page)
    await giftcards.expirationDateInput.fill(weekFromToday, { force: true })
    await giftcards.expirationDateInput.press('Enter')
  }

  async user_clicks_Save(page: Page) {
    await page.locator('button', { hasText: 'Save' }).click()
  }

  async user_will_see_a_toast_message(page: Page, string: string) {
    const alert = await page.locator(`#chakra-toast-manager-top >> text=${string}`)
    await expect(alert).toBeVisible({ timeout: 99000 })
  }

  async gift_card_code_amount_remaining_and_created_columns_will_be_populated(page: Page) {
    if ((await page.$('text=$10.00')) === null) {
      await page.waitForTimeout(200)
      await page.reload({ timeout: 60000 })
    }
    const giftCardRow = await page.locator('tbody >> tr')
    await expect(giftCardRow).toContainText('$10.00')
    await expect(giftCardRow).toContainText(RegExp(todaysDate + '|' + tomorrowsDate))
  }

  async the_code_amount_remaining_created_and_expires_columns_will_be_populated(page: Page) {
    if ((await page.$('text=$10.00')) === null) {
      await page.waitForTimeout(200)
      await page.reload()
    }
    const giftCardRow = await page.locator('tbody >> tr')
    await expect(giftCardRow).toContainText('$10.00')
    await expect(giftCardRow).toContainText(RegExp(todaysDate + '|' + tomorrowsDate))
    await expect(giftCardRow).toContainText(weekFromTodayEnUs)
    /*
      TODO: Assertion commented out for now due to bug where expiration date is not correctly
      reflecting after saved. Will uncomment assertion once bug is fixed.

      await expect(giftCardRow).toContainText(futureDateNoLeadingZeroes)
     */
  }

  async gift_card_status_will_be_set_to_Active(page: Page) {
    const giftCardRow = await page.locator('tbody >> tr')
    await expect(giftCardRow).toContainText('Active')
  }
}
