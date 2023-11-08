import { faker } from '@faker-js/faker'
import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { Navbar, Products, StoreFrontDesign, StoreSettings } from '../pageObjects'

export default class NewStore {
  readonly page: Page
  readonly storeNameInput: Locator
  readonly storeSubDomainInput: Locator
  readonly saveButton: Locator
  readonly createAStoreButton: Locator
  readonly homeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.storeNameInput = page.locator('div[role="group"]:has-text("Store Name") >> input')
    this.storeSubDomainInput = page.locator('div[role="group"]:has-text("Subdomain") >> input')
    this.saveButton = page.locator('text=Save')
    this.createAStoreButton = page.locator('a:has-text("Create a Store")')
    this.homeButton = page.locator('a:has-text("Home")')
  }
  async storefront_has_been_created(page: Page) {
    const navbar = new Navbar(page)
    const newStore = new NewStore(page)
    const storefront = new StoreFrontDesign(page)
    const storeName = `${faker.animal.cat()} ${faker.lorem.word()}`
    const uniqueSubDomain = faker.string.uuid()

    //Create a store
    await page.waitForTimeout(200)
    await newStore.createAStoreButton.click({ timeout: 90000 })
    await newStore.storeNameInput.waitFor({ state: 'visible' })
    await newStore.storeNameInput.fill(storeName)
    await newStore.storeSubDomainInput.fill(uniqueSubDomain)
    await newStore.saveButton.click()
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await page.waitForTimeout(7600)
    if ((await page.$('text=Error')) !== null) {
      await page.waitForTimeout(200)
      await page.reload()
    } else if ((await page.$('text=Save')) !== null) {
      await page.waitForTimeout(200)
      await newStore.saveButton.click()
    } else {
      const addproducts = page.locator('text=Storefront Products')
      await addproducts.waitFor({ timeout: 60000 })
      await expect(addproducts).toHaveCount(1, { timeout: 90000 })
    }

    //Storefront Theme
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('storefront?_data=routes%2Fbrand.store.storefront') &&
          resp.status() === 200,
        {
          timeout: 30000,
        }
      ),
      await navbar.storeFrontButton.click({ force: true }),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    })
    await page.locator('text=Themes').scrollIntoViewIfNeeded({ timeout: 90000 })
    await expect(page.locator('text=Theme1')).toBeVisible({ timeout: 90000 })
    await expect(storefront.themeEditorButton).not.toBeVisible() //Theme Editor button should not be visible on new storefront creation
    await storefront.theme1.click()
    await expect(page.locator('text=Change Theme')).toBeVisible()
    await storefront.confirmButton.click(), await navbar.getAlert('Updated Theme')
    return { storeName: storeName, uniqueSubDomain: uniqueSubDomain }
  }

  async storefront_has_Active_status(page: Page) {
    const storeSettings = new StoreSettings(page)
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('settings?_data=routes%2Fbrand.store.storefront.settings') &&
          resp.status() === 200 &&
          (await resp.text()).includes('categories'),
        {
          timeout: 8000,
        }
      ),
      await storeSettings.storeSettingsLink.click(),
    ]).catch(async () => {
      await page.waitForTimeout(700)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    })
    await storeSettings.statusSelect.selectOption({ label: 'Active' })
    await expect(storeSettings.billingSelect).toHaveCount(1)
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().includes('settings?_data=routes%2Fbrand') &&
          resp.status() === 200 &&
          (await resp.text()).includes('summary'),
        {
          timeout: 80000,
        }
      ),
      await expect(page.getByText('Update Store Status')).toHaveCount(1),
      await page.getByRole('button', { name: 'Confirm' }).click(),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
  }

  async user_clicks_Account_Menu_button(page: Page) {
    const navbar = new Navbar(page)
    await navbar.accountMenuButton.click()
  }

  async user_clicks_Manage_Stores(page: Page) {
    const navbar = new Navbar(page)
    await navbar.manageStoresButton.click()
  }

  async user_clicks_Create_a_Store(page: Page) {
    await page.waitForTimeout(200)
    await this.createAStoreButton.click()
    await page.waitForTimeout(500)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  async user_selects_an_Engage_account_from_drop_down(page: Page, string: string, user: any) {
    const stringSelect = page.locator(`div:has-text("${string}") >> select`)
    await stringSelect.selectText(user.company)
  }

  async user_enters_a_unique_store_name(page: Page) {
    const newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`
    await this.storeNameInput.pressSequentially(newStoreName)
    return newStoreName
  }

  async user_enters_a_unique_subdomain(page: Page) {
    const uniqueSubDomain = faker.string.uuid()
    await this.storeSubDomainInput.pressSequentially(uniqueSubDomain)
    return uniqueSubDomain
  }
  async user_clicks_Save(page: Page) {
    const button = page.locator(`button:has-text("Save")`)
    await button.click({ force: true })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
  }

  async user_will_see_a_success_toast(page: Page) {
    const alert = page.locator(`[role="status"]:has-text('Store Created')`)
    await expect(alert.nth(0)).toHaveCount(1, { timeout: 200000 })
    const close = alert.locator('button').nth(0)
    await close.click({ force: true })
  }

  async store_will_be_visible_in_Stores_list(
    page: Page,
    newStoreName: string,
    uniqueSubDomain: string
  ) {
    const navbar = new Navbar(page)
    await navbar.accountMenuButton.click()
    await navbar.manageStoresButton.click()
    const storesHeader = page.getByRole('heading', { name: 'Stores' })
    await expect(storesHeader).toBeVisible({ timeout: 80000 })
    const storeRow = page.locator(`tr:has-text("${newStoreName}")`)
    await expect(storeRow).toBeVisible({ timeout: 80000 })
    await expect(storeRow).toContainText(newStoreName)
    await expect(storeRow).toContainText(uniqueSubDomain)
    await expect(storeRow).toContainText('PENDING')
    await expect(storeRow).toContainText('Current Account')
  }

  async a_brand_storefront_has_been_created(page: Page, newStoreName: string) {
    const newStore = new NewStore(page)
    const products = new Products(page)
    await expect(newStore.createAStoreButton).toBeVisible({ timeout: 90000 })
    // await Promise.all([
    //   page.waitForResponse(
    //     async (resp: any) =>
    //       resp.url().endsWith('setup%2Fnew') &&
    //       resp.status() === 200 &&
    //       (await resp.text()).includes('accounts'),
    //     {
    //       timeout: 80000,
    //     }
    //   ),
    await newStore.createAStoreButton.click({ timeout: 80000 })
    // ]).catch(async () => {
    //   await page.waitForTimeout(500)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload()
    //   }
    // })
    await newStore.storeNameInput.waitFor({ state: 'visible' })
    await newStore.storeNameInput.pressSequentially(newStoreName)
    await newStore.storeSubDomainInput.pressSequentially(faker.string.uuid())
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('products?_data=routes%2Fbrand.store.products._index') &&
          resp.status() === 200 &&
          (await resp.text()).includes('results'),
        {
          timeout: 80000,
        }
      ),
      await newStore.saveButton.click({ force: true }),
    ]).catch(async () => {
      await page.waitForTimeout(1000)
      if ((await page.$('text=Unexpected token')) !== null) {
        await page.waitForTimeout(200)
        await newStore.saveButton.click({ force: true })
      } else if ((await page.$('text=Error')) !== null) {
        await page.waitForTimeout(200)
        await page.reload()
      } else if ((await page.$('text=socket disconnected ')) !== null) {
        await page.waitForTimeout(200)
        await products.gotoProducts()
        if ((await page.$('text=Error')) !== null) {
          await page.reload()
        }
      } else if ((await page.$('text=socket hangup')) !== null) {
        await page.waitForTimeout(200)
        await products.gotoProducts()
        if ((await page.$('text=Error')) !== null) {
          await page.reload()
        }
      } else if ((await page.$('text=Save')) !== null) {
        await page.waitForTimeout(200)
        await products.gotoProducts()
        if ((await page.$('text=Error')) !== null) {
          await page.reload()
        }
      }
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 99000 })
    await page.waitForTimeout(500)
    if ((await page.$('text=socket hang up')) !== null) {
      await page.waitForTimeout(200)
      await products.gotoProducts()
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    } else if ((await page.$('text=ETIMEDOUT')) !== null) {
      await page.waitForTimeout(200)
      await products.gotoProducts()
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    } else if ((await page.$('text=socket disconnected')) !== null) {
      await page.waitForTimeout(200)
      await products.gotoProducts()
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    } else if ((await page.$('text=Error')) !== null) {
      await page.waitForTimeout(200)
      await products.gotoProducts()
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    }
    const storeproduct = page.locator('text=Storefront Products')
    await storeproduct.waitFor({ timeout: 60000 })
    await expect(storeproduct).toHaveCount(1, { timeout: 199000 })
  }
}
