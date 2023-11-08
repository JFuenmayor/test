import type { Locator, Page } from '@playwright/test'
import { Navbar, NewStore } from '../pageObjects'
import { expect } from '@playwright/test'
import { gotoWithRetry } from '../helpers'
import { userFactory } from '../factories/user-factory'

const password = userFactory().password

export default class StoreSettings {
  readonly page: Page
  readonly statusSelect: Locator
  readonly billingSelect: Locator
  readonly storeSettingsLink: Locator
  readonly saveChangesButton: Locator
  readonly themeEditorLink: Locator
  readonly footerLink: Locator
  readonly featuredLink: Locator
  readonly categoriesLink: Locator
  readonly passwordProtectToggle: Locator
  readonly passwordProtectPasswordField: Locator
  readonly acceptCreditCardToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.statusSelect = page.locator('select[name="status"]')
    this.billingSelect = page.locator('select[name="billingAccountId"]')
    this.storeSettingsLink = page.getByRole('link', { name: 'Store Settings' })
    this.saveChangesButton = page.locator('button:has-text("Save Changes")')
    this.themeEditorLink = page.locator('a:text-is("Theme Editor")')
    this.footerLink = page.locator('[data-testid="ZSidebar_grid"] >> text=Footer')
    this.featuredLink = page.locator('a:has-text("Featured")')
    this.categoriesLink = page.locator('a:has-text("Categories")')
    this.passwordProtectToggle = page.locator(
      'div:has-text("Password Protect") >> input[name="storeAuthMethod"]'
    )
    this.passwordProtectPasswordField = page.locator(
      'div:has-text("Password Protect") >> input[type="password"]'
    )
    this.acceptCreditCardToggle = page.locator('label', {
      has: page.locator('input[name="showCreditCardPayment"]'),
    })
  }
  async gotoHttpStore() {
    //const url = await this.page.url()
    const hostname = await this.page.locator(`a:has-text("mypostal.io")`).textContent()
    await gotoWithRetry(this.page, `http://${hostname}`, 5)
  }

  async gotoHttpStoreA() {
    //const url = await this.page.url()
    const hostname = await this.page.locator(`a:has-text("mypostal.io")`).textContent()
    await Promise.all([
      this.page.goto(`http://${hostname}`, {
        timeout: 60 * 1000,
        waitUntil: 'load',
      }),
    ]).catch(() => {
      gotoWithRetry(this.page, `http://${hostname}`, 3)
    })
  }

  async the_user_has_navigated_to_the_store_settings_tab(page: Page) {
    const navbar = new Navbar(page)
    //Navigate to store settings page
    await navbar.storeFrontButton.click()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    await this.storeSettingsLink.click()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  async the_user_turns_off_the_Accept_Credit_Cards_setting(page: Page) {
    await this.acceptCreditCardToggle.waitFor({ state: 'attached' })
    await expect(this.acceptCreditCardToggle).toBeChecked({ checked: true })
    await this.acceptCreditCardToggle.scrollIntoViewIfNeeded()
    await this.acceptCreditCardToggle.uncheck({ force: true })
    await expect(this.acceptCreditCardToggle).toBeChecked({ checked: false, timeout: 80000 })
  }

  async the_user_will_not_see_the_credit_card_input(page: Page) {
    await page.getByPlaceholder('Gift Card Number').waitFor({ state: 'attached' })
    await expect(page.locator('.__PrivateStripeElement-input')).toHaveCount(0)
  }

  async password_protect_is_toggled_on(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.passwordProtectToggle.scrollIntoViewIfNeeded()
    await expect(storeSettings.passwordProtectToggle).toBeChecked({ checked: false })
    await page
      .locator('div')
      .filter({ hasText: /^OffPassword$/ })
      .locator('span')
      .nth(1)
      .check({ force: true })
    await expect(storeSettings.passwordProtectToggle).toBeChecked({ checked: true })
  }

  async a_password_is_provided(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.passwordProtectPasswordField.pressSequentially(password)
    await page.waitForTimeout(500)
  }

  async selecting_Save_Changes_displays_a_toast(page: Page, string: string) {
    await page.waitForTimeout(900)
    const saveButton = page.locator('button:text-is("Save Changes")')
    await saveButton.scrollIntoViewIfNeeded()
    await expect(saveButton).toBeVisible()
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith('settings?_data=routes%2Fbrand.store.storefront.settings') &&
          resp.status() === 200,
        {
          timeout: 120000,
        }
      ),
      await saveButton.click({ force: true }),
    ]).catch(async () => {
      await saveButton.click({ force: true })
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
    //await saveButton.waitFor({ state: 'detached' })
    await page.waitForTimeout(1200)
    if (string === 'Theme Updated') {
      await expect(saveButton).toHaveCount(0, { timeout: 199000 })
    }
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else if ((await page.$('text= ETIMEDOUT')) !== null) {
      return true
    } else if ((await page.$('text=Save Changes')) !== null) {
      await saveButton.click({ force: true })
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 199000 })
    }
    // if ((await page.$('text=Cancel')) !== null) {
    //   await pag
    // }
    // else {
    //   await navbar.getAlert(string)
    // }
  }

  async the_user_navigates_to_brand_store(page: Page) {
    const navbar = new Navbar(page)
    await navbar.storeFrontButton.click()
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('settings?_data=routes%2Fbrand.store.storefront.settings') &&
          resp.status() === 200 &&
          (await resp.text()).includes('categories'),
        {
          timeout: 120000,
        }
      ),
      await this.storeSettingsLink.click(),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      } else {
        await this.storeSettingsLink.click()
      }
    })
    await page.waitForTimeout(200)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    await this.gotoHttpStore()
  }

  async the_user_navigates_to_brand_storeA(page: Page) {
    const navbar = new Navbar(page)
    await navbar.storeFrontButton.click()
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('settings?_data=routes%2Fbrand.store.storefront.settings') &&
          resp.status() === 200 &&
          (await resp.text()).includes('categories'),
        {
          timeout: 120000,
        }
      ),
      await this.storeSettingsLink.click(),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      } else {
        await this.storeSettingsLink.click()
      }
    })
    await page.waitForTimeout(200)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    await this.gotoHttpStoreA()
  }

  async user_selects_Storefront_Settings_link(page: Page) {
    await this.storeSettingsLink.click()
  }

  async user_changes_status_from_Pending_to_Active(page: Page) {
    const storeSettings = new StoreSettings(page)
    await page.waitForTimeout(200)
    const pending = await page.locator(`text=Pending`)
    await expect(pending).toHaveCount(1, { timeout: 99000 })
    await storeSettings.statusSelect.selectOption({ label: 'Active' })
    await expect(storeSettings.billingSelect).toHaveCount(1, { timeout: 99000 })
    await expect(page.getByText('Update Store Status')).toHaveCount(1)
    await page.getByRole('button', { name: 'Confirm' }).click()
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
    if ((await page.$('text=ETIMEDOUT')) !== null) {
      await page.waitForTimeout(200)
      await storeSettings.saveChangesButton.click()
    }
    // const alert = page.locator(`[role="status"]:has-text('Store Updated')`)
    // await expect(alert.nth(0)).toBeVisible({ timeout: 120000 })
    // const close = alert.locator('button').nth(0)
    // await close.click()
  }
  async user_will_be_able_to_navigate_to_hostname_and_store_will_load_successfully(page: Page) {
    const navbar = new Navbar(page)
    const newStore = new NewStore(page)
    await navbar.storeFrontButton.click()
    await this.storeSettingsLink.click()
    const storeName = await newStore.storeNameInput.inputValue()
    await this.gotoHttpStore()
    const storeNametText = page.locator(`h2:text-is("${storeName}")`)
    await expect(storeNametText).toBeVisible({ timeout: 200000 })
    const shopAllLink = page.locator(`a:text-is("Shop All")`).nth(1)
    await expect(shopAllLink).toBeVisible({ timeout: 200000 })
    const shoppingCart = page.locator(`[aria-label="Shopping Bag"]`)
    await expect(shoppingCart).toBeVisible({ timeout: 200000 })
    const storeHeader = page.locator(`h1:text-is("Pride 2002 Collection")`)
    await expect(storeHeader).toBeVisible({ timeout: 200000 })
    const seeCollectionButton = page.locator(`button:text-is("See the Collection")`)
    await expect(seeCollectionButton).toBeVisible({ timeout: 200000 })
    const allCategoriesHeader = page.locator(`h2:text-is("All")`)
    await expect(allCategoriesHeader).toHaveCount(2, { timeout: 200000 })
    const viewAllLink = page.locator(`div:text-is("View All")`)
    await expect(viewAllLink).toHaveCount(2)
    const learnMore = page.locator(`button:text-is("Learn More")`)
    await expect(learnMore).toBeVisible({ timeout: 200000 })
  }
}
