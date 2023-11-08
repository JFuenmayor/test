import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import baseURL from '../../../../playwright.config'
import { gotoWithRetry } from '../helpers'
import { Navbar, NewStore, StoreSettings } from '../pageObjects'

export default class Products {
  readonly page: Page
  //readonly addProductsButton: Locator
  //readonly addProductButton: Locator
  readonly statusSelect: Locator
  readonly saveChangesButton: Locator

  constructor(page: Page) {
    this.page = page
    //this.addProductsButton = page.locator('a:has-text("Add Products")')
    //this.addProductButton = page.locator('button:has-text("Add Product")')
    this.statusSelect = page.getByRole('combobox')
    this.saveChangesButton = page.locator('button:has-text("Save Changes")')
  }
  async gotoProducts() {
    await gotoWithRetry(this.page, `${baseURL.use?.baseURL}/brand/store/products`, 5)
    await this.page.waitForTimeout(200)
  }

  async gotoProductsAdd() {
    await gotoWithRetry(this.page, `${baseURL.use?.baseURL}/brand/store/products/add`, 5)
    await this.page.waitForTimeout(200)
  }

  async the_user_clicks_the_Products_button(page: Page) {
    const navbar = new Navbar(page)
    const storeSettings = new StoreSettings(page)

    //Navigate to store settings page to get store name for giftcard validation
    await navbar.storeFrontButton.click()
    await storeSettings.storeSettingsLink.click()
    await navbar.productsButton.click()
    await page.waitForTimeout(60000)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  async the_user_adds_a_product_to_the_storefront(page: Page, newStoreName: string) {
    await this.gotoProductsAdd()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    const giftCard = page.locator(`td:has-text("${newStoreName} Gift Card")`)
    await expect(giftCard).toBeVisible({ timeout: 80000 })
    await page
      .locator(`tr:has-text("${newStoreName} Gift Card")`)
      .getByTestId('tr-checkbox')
      .click({ force: true })
    await page
      .getByRole('button', { name: 'Add 1 Product to Storefront' })
      .waitFor({ state: 'visible' })
    await page.getByRole('button', { name: 'Add 1 Product to Storefront' }).click({ delay: 40 })
    await page.getByRole('button', { name: 'Confirm' }).click({ force: true })
    await page.waitForTimeout(3000)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  // async the_user_clicks_the_Add_Product_on_a_product_in_the_Available_Products_table(page: Page) {
  //   await expect(page.locator(`text=Available Products`)).toBeVisible({ timeout: 90000 })
  //   await expect(page.locator(`text=${storeName} Gift Card`)).toBeVisible()
  //   await page.waitForTimeout(400)
  //   await this.addProductButton.click({ force: true })
  // }

  async the_user_will_see_Product_Added_toast_message(page: Page) {
    const navbar = new Navbar(page)
    await navbar.getAlert('Product Added!')
    await page.waitForTimeout(8000)
  }

  async the_product_will_be_visible_on_the_Store_Products_table_with_a_Pending_status(
    page: Page,
    newStoreName: string
  ) {
    await page.getByRole('tab', { name: 'Storefront Products' }).click({ force: true })
    await page.waitForTimeout(200)
    const text = /^Gift Card$/
    if ((await page.$(`text="${text}"`)) === null) {
      await page.reload({ timeout: 60000 })
    }
    if ((await page.$(`text="Pending"`)) === null) {
      await page.getByRole('tab', { name: 'Storefront Products' }).click({ force: true })
    }
    await expect(page.locator(`td:has-text("${newStoreName} Gift Card")`)).toBeVisible({
      timeout: 90000,
    })
    const tag = await page.getByText('Pending')
    await expect(tag).toHaveCount(1, { timeout: 90000 })
  }

  async the_user_edits_the_product(page: Page, newStoreName: string) {
    const giftCard = page.locator(`td:has-text("${newStoreName} Gift Card")`)
    await expect(giftCard).toBeVisible({ timeout: 80000 })
    await page
      .locator(`tr:has-text("${newStoreName} Gift Card")`)
      .getByTestId('tr-checkbox')
      .click({ force: true })
    await page.waitForTimeout(300)
    const editButton = page.getByRole('button', { name: 'Edit Status' })
    await editButton.waitFor({ state: 'visible' })
    await editButton.click({ force: true })
  }

  async the_user_selects_Active_from_the_Status_drop_down(page: Page) {
    const navbar = new Navbar(page)
    await this.statusSelect.waitFor({ state: 'visible' })
    await this.statusSelect.selectOption({ label: 'Active' })
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Confirm' }).click()
    await navbar.getAlert('The status will be updated shortly')
    const spinner = page.getByTestId('spinner')
    await expect(spinner).toHaveCount(0, { timeout: 100000 })
  }

  async the_item_status_will_change_to_Active(page: Page) {
    await page.waitForTimeout(2000)
    await this.gotoProducts()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else if ((await page.$('text=Active')) === null) {
      await page.reload()
    }
    const active = await page.getByText('Active')
    await expect(active).toBeVisible({ timeout: 100000 })
  }

  async the_product_will_be_visible_on_the_users_store(page: Page) {
    const navbar = new Navbar(page)
    const storeSettings = new StoreSettings(page)
    const newStore = new NewStore(page)
    await navbar.storeFrontButton.click()
    await page.waitForTimeout(800)
    const inventory = page.locator(`text=Inventory`)
    await expect(inventory).not.toBeVisible({ timeout: 100000 })
    await storeSettings.storeSettingsLink.click()
    const storeName = await newStore.storeNameInput.inputValue()
    await storeSettings.gotoHttpStore()
    const giftCard = page.locator(`p:has-text("${storeName} Gift Card")`)
    await expect(giftCard).toHaveCount(2)
  }

  async the_user_has_added_a_product_and_it_is_visible_in_the_users_store(
    page: Page,
    newStoreName: string
  ) {
    const navbar = new Navbar(page)
    const storeSettings = new StoreSettings(page)
    const newStore = new NewStore(page)
    //Navigate to store settings page to get store name for giftcard validation
    await navbar.storeFrontButton.click()
    await storeSettings.storeSettingsLink.click()
    await page.waitForTimeout(70000)
    await this.gotoProductsAdd()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    if ((await page.$(`text=${newStoreName} Gift Card`)) == null) {
      await page.waitForTimeout(400)
      await page.reload()
    }
    const giftCard = page.locator(`td:has-text("${newStoreName} Gift Card")`)
    await expect(giftCard).toBeVisible({ timeout: 80000 })
    await page
      .locator(`tr:has-text("${newStoreName} Gift Card")`)
      .getByTestId('tr-checkbox')
      .click({ force: true })
    await page
      .getByRole('button', { name: 'Add 1 Product to Storefront' })
      .waitFor({ state: 'visible' })
    await page.getByRole('button', { name: 'Add 1 Product to Storefront' }).click({ delay: 40 })
    await page.getByRole('button', { name: 'Confirm' }).waitFor({ state: 'visible' })
    await page.getByRole('button', { name: 'Confirm' }).click({ force: true })
    const spinner = page.getByTestId('spinner')
    await expect(spinner).toHaveCount(0, { timeout: 100000 })
    await page.waitForTimeout(1000)
    await this.gotoProducts()
    const text = /^Gift Card$/
    if ((await page.$(`text="${text}"`)) === null) {
      await page.waitForTimeout(1000)
      await page.reload({ timeout: 60000 })
    }
    try {
      await expect(page.locator(`tr:has-text("${newStoreName} Gift Card")`)).toBeVisible({
        timeout: 90000,
      })
    } catch {
      if ((await page.$('text=Error')) !== null) {
        await page.reload({ timeout: 60000 })
      }
    }
    const tag = await page.getByText('Pending')
    await expect(tag).toHaveCount(1, { timeout: 90000 })
    await page
      .locator(`tr:has-text("${newStoreName} Gift Card")`)
      .getByTestId('tr-checkbox')
      .click({ force: true })
    await page.waitForTimeout(300)
    const editButton = page.getByRole('button', { name: 'Edit Status' })
    await editButton.waitFor({ state: 'visible' })
    await editButton.click({ force: true })
    await this.statusSelect.selectOption({ label: 'Active' })
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Confirm' }).click({ force: true })
    const spinner2 = await page.getByText('Updating products status on storefrontLoading...')
    await expect(spinner2).toHaveCount(0, { timeout: 100000 })
    await page.waitForTimeout(1000)
    await this.gotoProducts()
    // const exportText = /^Export$/
    // const exportSpinner = page.getByRole('button', { name: exportText })
    // await expect(exportSpinner).not.toBeDisabled()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    if ((await page.$('text=Pending')) !== null) {
      await page.waitForTimeout(60000)
      await page.reload()
    }
    const active = page.getByText('Active')
    await expect(active).toBeVisible({ timeout: 200000 })
    await navbar.storeFrontButton.click()
    await page.waitForTimeout(800)
    const inventory = page.locator(`text=Inventory`)
    await expect(inventory).not.toBeVisible({ timeout: 200000 })
    await storeSettings.storeSettingsLink.click()
    const storeName2 = await newStore.storeNameInput.inputValue()
    await storeSettings.gotoHttpStore()
    const giftCard2 = page.locator(`p:has-text("${storeName2} Gift Card")`)
    await expect(giftCard2).toHaveCount(2)
  }

  async the_user_goes_back_to_the_Store_Products_page(page: Page) {
    const products = new Products(page)
    await products.gotoProducts()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  async the_user_removes_the_product_from_the_storefront(page: Page, newStoreName: string) {
    const giftCard = page.locator(`td:has-text("${newStoreName} Gift Card")`)
    await expect(giftCard).toBeVisible({ timeout: 80000 })
    await page
      .locator(`tr:has-text("${newStoreName} Gift Card")`)
      .getByTestId('tr-checkbox')
      .click({ force: true })
    await page.waitForTimeout(300)
    const editButton = page.getByRole('button', { name: 'Edit Status' })
    await editButton.waitFor({ state: 'visible' })
    await page
      .locator('div')
      .filter({ hasText: /^Edit StatusAdd CategoriesRemove from StorefrontEdit Status$/ })
      .getByRole('button')
      .nth(2)
      .click()
    await page.getByRole('menuitem', { name: 'Remove from Storefront' }).click()
  }

  async the_user_clicks_the_confirm_button(page: Page) {
    const dialog = await page.locator(`role=dialog[name="Remove Products"]`)
    const dialogDeleteButton = await dialog.locator('button:has-text("Confirm")')
    await dialogDeleteButton.click()
    await expect(dialog).toHaveCount(0, { timeout: 90000 })
    const spinner2 = page.getByTestId('spinner')
    await expect(spinner2).toHaveCount(0, { timeout: 100000 })
  }

  async the_user_refreshs_the_page(page: Page) {
    await Promise.all([
      page.waitForResponse((resp) => resp.url().endsWith('products') && resp.status() === 200, {
        timeout: 120000,
      }),
      await page.reload({ timeout: 99000 }),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload({ timeout: 99000 })
      }
    })
    if ((await page.$('text=Active')) !== null) {
      await page.waitForTimeout(60000)
      await page.reload({ timeout: 99000 })
    }
  }

  async the_user_will_see_that_the_product_was_removed_from_Brand(page: Page) {
    const noItems = page.locator('text=No items found')
    await expect(noItems).toHaveCount(1, { timeout: 90000 })
  }

  async the_user_will_see_that_the_product_was_removed_from_the_storefront(page: Page) {
    const storeSettings = new StoreSettings(page)
    const newStore = new NewStore(page)
    const navbar = new Navbar(page)
    await navbar.storeFrontButton.click()
    await page.waitForTimeout(200)
    await storeSettings.storeSettingsLink.click()
    const storeName2 = await newStore.storeNameInput.inputValue()
    await storeSettings.gotoHttpStore()
    const giftCard = page.locator(`p:has-text("${storeName2} Gift Card")`)
    await expect(giftCard).toHaveCount(0)
  }

  async user_clicks_Back_to_Store(page: Page) {
    const gobackButton = page.locator(`text=Back to Store`)
    await gobackButton.click({ force: true })
    await page.waitForTimeout(300)
  }
}
