import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { userFactory } from '../factories/user-factory'
import { Products, Navbar, StoreFrontDesign, StoreSettings, GiftCards } from '../pageObjects'

//const newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`.replace('error', '')
let cardCode30: string | null
let cardCode5: string | null

export default class Checkout {
  readonly page: Page
  readonly totalRemainingText: Locator
  readonly confirmationText: Locator
  readonly confirmationText2: Locator
  readonly payNowButton: Locator

  constructor(page: Page) {
    this.page = page
    this.totalRemainingText = page.locator('p:has-text("Total Remaining")')
    this.confirmationText = page.locator(
      'p:has-text("Your order has been successfully submitted.")'
    )
    this.confirmationText2 = page.locator(
      'p:has-text("Please check your email for an order confirmation and tracking details.")'
    )
    this.payNowButton = page.locator(`button:has-text("Pay Now")`)
  }

  async store_has_an_Active_status(page: Page) {
    //in order to have a active status the store must select a theme
    const navbar = new Navbar(page)
    const storeFrontDesign = new StoreFrontDesign(page)
    const storeSettings = new StoreSettings(page)
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('brand.store.storefront._index') &&
          resp.status() === 200 &&
          (await resp.text()).includes('store'),
        {
          timeout: 30000,
        }
      ),
      await navbar.storeFrontButton.click({ timeout: 90000 }),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload({ timeout: 60000 })
      }
    })
    await storeFrontDesign.theme1.click({ timeout: 90000 })
    await storeFrontDesign.confirmButton.click({ timeout: 90000 })
    await page.waitForTimeout(900)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else {
      const alert = this.page.locator(`[role="status"]:has-text('Updated Theme')`)
      await expect(alert).toHaveCount(1, { timeout: 120000 })
    }
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('brand.store.storefront.settings') &&
          resp.status() === 200 &&
          (await resp.text()).includes('store'),
        {
          timeout: 10000,
          //timeout: 120000,
        }
      ),
      await storeSettings.storeSettingsLink.click(),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      } else if ((await page.$('text=Password Protect')) !== null) {
        /* empty */
      }
    })
    await storeSettings.statusSelect.selectOption({ label: 'Active' })
    await expect(storeSettings.billingSelect).toHaveCount(1)
    await expect(page.getByText('Update Store Status')).toHaveCount(1)
    await page.getByRole('button', { name: 'Confirm' }).click()
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    if ((await page.$('text=ETIMEDOUT')) !== null) {
      await page.waitForTimeout(200)
      await storeSettings.saveChangesButton.click({ timeout: 90000 })
    } else if ((await page.$('text=Error')) !== null) {
      await page.waitForTimeout(200)
      await page.reload()
    }
    // else {
    //   await navbar.getAlert('Store Updated')
    // }
  }

  async a_generated_gift_card_has_been_added_to_products(page: Page, newStoreName: string) {
    const products = new Products(page)
    await page.waitForTimeout(60000) //wait needed for the giftcard product to generate in the background
    await products.gotoProductsAdd()
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
    await page.waitForTimeout(4000)
  }

  async store_has_Active_products(page: Page, newStoreName: string) {
    const products = new Products(page)
    await products.gotoProducts()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    const giftCard = page.locator(`tr:has-text("${newStoreName} Gift Card")`)
    await expect(giftCard).toBeVisible({ timeout: 80000 })
    const pending = page.getByText('Pending')
    await expect(pending).toBeVisible({ timeout: 80000 })
    const giftCardEdit = await page.locator(`tr:has-text("${newStoreName} Gift Card") >> a`)
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('productId._index') &&
          resp.status() === 200 &&
          (await resp.text()).includes('item'),
        {
          timeout: 30000,
        }
      ),
      await giftCardEdit.click(),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    })
    await expect(products.statusSelect).toHaveCount(1, { timeout: 199999 })
    await products.statusSelect.selectOption({ label: 'Active' })
    await page.waitForTimeout(400)
    await products.saveChangesButton.click({ timeout: 199999, force: true })
    const alert = page.locator('text=Product Updated').nth(0)
    await expect(alert).toBeVisible({ timeout: 80000 })
    await page.waitForTimeout(3000)
    await products.gotoProducts()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    const active = page.getByText('Active', { exact: true })
    await expect(active).toBeVisible({ timeout: 80000 })
  }

  async the_user_selects_a_product(page: Page, newStoreName: string) {
    const giftCard = page.locator(`p:has-text("${newStoreName} Gift Card")`)
    //flakey
    //await expect(giftCard).toHaveCount(2, { timeout: 80000 })
    await giftCard.nth(0).click()
    await page.waitForTimeout(200)
    if ((await page.$('text=404')) !== null) {
      await page.reload()
    }
  }

  async user_clicks_Add_to_Cart(page: Page) {
    const all = page.locator('text=swag or other gifts')
    await expect(all).toHaveCount(1, { timeout: 99000 })
    await page.waitForTimeout(1100)
    const addToCartButton = page.locator(`button:has-text("Add to Cart")`)
    await addToCartButton.click({ force: true })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await page.waitForTimeout(600)
    const cartContainer = await page.locator('[id*="popover-trigger"]')
    const cartText = await cartContainer.textContent()
    if (await !cartText?.includes('1')) {
      await page.reload({ timeout: 60000 })
      if ((await page.$('text=404')) !== null) {
        await page.reload({ timeout: 60000 })
      } else if (await !cartText?.includes('1')) {
        await addToCartButton.click({ force: true })
      }
    }
    await expect(cartContainer).toHaveText('1', { timeout: 289999 })
  }

  async user_clicks_Checkout_in_cart_modal(page: Page) {
    const cartButton = page.locator('[aria-label="Shopping Bag"]')
    await cartButton.click({ force: true })
    const checkoutButton = page.locator(`a:text-is("Checkout")`)
    await expect(checkoutButton).toBeVisible({ timeout: 80000 })
    await checkoutButton.click({ force: true })
  }

  async the_user_fills_out_the_contact_information_and_address_fields(page: Page) {
    const user = userFactory()
    const firstName = page.locator(`[placeholder="First Name (required)"]`)
    await firstName.fill(user.firstName)
    const lastName = page.locator(`[placeholder="Last Name (required)"]`)
    await lastName.fill(user.lastName)
    const emailAddress = page.locator(`[placeholder="Email Address (required)"]`)
    await emailAddress.fill(user.userName)
    const phoneNumber = page.locator(`[placeholder="Phone Number"]`)
    await phoneNumber.fill(faker.phone.number())
    const address = page.locator('[placeholder="Address (required)"]')
    await address.fill('1821 N 27th St')
    const city = page.locator('[placeholder="City (required)"]')
    await city.fill('Kansas City')
    const state = page.locator('[placeholder="State (required)"]')
    await state.fill('Kansas')
    const postalCode = page.locator(`[placeholder="Postal Code (required)"]`)
    await postalCode.fill('66104')
    const country = page.locator(`[placeholder="Country (required)"]`)
    await country.fill('United States')
    await page.waitForTimeout(1300)
    const submitButton = page.locator(`text=Calculate Shipping and Taxes`)
    await submitButton.click()
  }

  async two_new_giftcards_have_been_created(page: Page) {
    const navbar = new Navbar(page)
    const giftcards = new GiftCards(page)
    await page.waitForTimeout(300)
    await giftcards.gotoGiftcards()
    if ((await page.$('text=Error')) !== null) {
      await page.reload({ timeout: 60000 })
    }
    await page.waitForTimeout(300)
    await giftcards.createGiftCardButton.click()
    if ((await page.$('text=Error')) !== null) {
      await page.reload({ timeout: 60000 })
    }
    await giftcards.amountInput.waitFor({ state: 'visible' })
    await giftcards.amountInput.fill('34')
    //await page.waitForTimeout(900)
    // await Promise.all([
    //   page.waitForResponse(
    //     (resp) => resp.url().endsWith('gift-cards%2Findex') && resp.status() === 200,
    //     {
    //       timeout: 30000,
    //     }
    //   ),
    await giftcards.modalSaveButton.click()
    // ]).catch(async () => {
    //   await page.waitForTimeout(300)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload({ timeout: 60000 })
    //   }
    // })
    const alert = this.page.locator(`[role="status"]:has-text('Gift Card Created!')`)
    await expect(alert).toHaveCount(1, { timeout: 120000 })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    cardCode30 = await page.locator('td >> a').textContent()
    await giftcards.createGiftCardButton.click()
    await giftcards.amountInput.waitFor({ state: 'visible' })
    await giftcards.amountInput.fill('5')
    // await Promise.all([
    //   page.waitForResponse(
    //     (resp) => resp.url().endsWith('gift-cards%2Findex') && resp.status() === 200,
    //     {
    //       timeout: 30000,
    //     }
    //   ),
    await giftcards.modalSaveButton.click()
    // ]).catch(async () => {
    //   await page.waitForTimeout(300)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload({ timeout: 60000 })
    //   }
    // })
    await navbar.getAlert('Gift Card Created!')
    cardCode5 = await page.locator('td >> a').nth(0).textContent()
    const loading2 = page.locator('text=Loading...')
    await expect(loading2).toHaveCount(0, { timeout: 90000 })
  }

  async user_enters_gift_card_code_into_Gift_Card_fields(page: Page, string: string) {
    const giftcard = page.locator(`[placeholder="Gift Card Number"]`)
    if (string == '$30') {
      // @ts-expect-error
      await giftcard.pressSequentially(cardCode30)
    } else if (string == '$5') {
      // @ts-expect-error
      await giftcard.pressSequentially(cardCode5)
    }
  }

  async user_clicks_Apply(page: Page) {
    await page.locator('button', { hasText: 'Apply' }).click()
  }

  async user_will_see_a_toast_message(page: Page, string: string) {
    const alert = this.page.locator(`[role="status"]:has-text('${string}')`)
    await expect(alert.nth(0)).toHaveCount(1, { timeout: 120000 })
  }

  async total_Remaining_balance_should_update_to_0(page: Page) {
    await this.totalRemainingText.waitFor({ timeout: 60000 })
    const totalRemaining = await this.totalRemainingText.textContent()
    await expect(totalRemaining).toEqual('Total Remaining: $0.00')
  }

  async user_will_see_order_confirmation_screen(page: Page) {
    const confirmationText = await this.confirmationText
    await expect(confirmationText).toHaveCount(1, { timeout: 90000 })
    const confirmationText2 = await this.confirmationText2
    await expect(confirmationText2).toHaveCount(1, { timeout: 90000 })
  }

  async user_clicks_Pay_Now(page: Page, string?: string) {
    await page.waitForTimeout(200)
    if (string === 'invalid' || string === 'insufficient') {
      await Promise.all([
        page.waitForResponse((resp) => resp.url().endsWith('0') && resp.status() === 200, {
          timeout: 30000,
        }),
        await this.payNowButton.click(),
      ]).catch(async () => {
        await page.waitForTimeout(3500)
        // if ((await page.$('text=Error')) !== null) {
        //   await page.reload()
        // }
        if ((await page.$('text=Errors')) !== null) {
          await this.payNowButton.click()
        }
      })
    } else {
      await Promise.all([
        page.waitForResponse(
          async (resp) =>
            resp.url().endsWith('orderId') &&
            resp.status() === 200 &&
            (await resp.text()).includes('fullfillment'),
          {
            timeout: 30000,
          }
        ),
        await this.payNowButton.click(),
      ]).catch(async () => {
        await page.waitForTimeout(3500)
        // if ((await page.$('text=Error')) !== null) {
        //   await page.reload()
        // }
        if ((await page.$('text=Errors')) !== null) {
          await this.payNowButton.click()
        }
      })
    }
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
  }

  async user_fills_out_the_creditCardNumber_expDate_cvc_and_zip_fields(page: Page, string: string) {
    await page.waitForTimeout(600)
    const creditCardInput = await page.locator('.__PrivateStripeElement-input')

    //const creditCardInput = await page.locator('iframe[name*="__privateStripeFrame"]')
    if (string == 'valid') {
      await creditCardInput.pressSequentially(' 4242 4242 4242 4242', {
        delay: 400,
        timeout: 20000,
      })
    } else if (string == 'invalid') {
      await creditCardInput.pressSequentially(' 4242 4242 4242 4241', {
        delay: 500,
        timeout: 20000,
      })
    }
    await creditCardInput.pressSequentially(' 05/2612366104', { delay: 400, timeout: 20000 })
  }

  async total_Remaining_balance_is_higher_than_0(page: Page) {
    await this.totalRemainingText.waitFor({ timeout: 60000 })
    const totalRemaining = await this.totalRemainingText.textContent()
    await expect(totalRemaining).not.toEqual('Total Remaining: $0.00')
  }

  async user_will_be_unable_to_complete_order(page: Page) {
    const confirmationText = await this.confirmationText
    await expect(confirmationText).toHaveCount(0)
  }

  async user_will_see_values_in_Credit_Card_field_turn_red(page: Page) {
    const stripeFrame = page.frameLocator('iframe').first()
    const creditCardInput = await stripeFrame.locator('[placeholder="Card number"]')
    await expect(creditCardInput).toHaveAttribute('aria-invalid', 'true')
  }
}
