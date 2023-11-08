import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import baseURL from '../../../../playwright.config'
import { signUpViaApi } from '../apiActions/signup-via-api'
import { userFactory } from '../factories/user-factory'
import { gotoWithRetry, reloadWithRetry } from '../helpers'
const apiUrl = process.env.API_URL
let user: any

const password = userFactory().password

export default class SignUpIn {
  readonly page: Page
  readonly storeEmailInput: Locator
  readonly storePasswordInput: Locator
  readonly storeLogInButton: Locator
  readonly passwordProtectedStorefrontPasswordInput: Locator

  constructor(page: Page) {
    this.page = page
    this.storeEmailInput = page.locator('[placeholder="me@mycompany.com"]')
    this.storePasswordInput = page.locator('[placeholder="mypassword"]')
    this.storeLogInButton = page.locator('button', { hasText: 'Login' })
    this.passwordProtectedStorefrontPasswordInput = page.locator('[placeholder="Password"]')
  }

  async gotoVerifyPageByRequestId(id: number) {
    await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes(`/verify/CLOONEY-${id}`) && resp.status() === 200,
        {
          timeout: 120000,
        }
      ),
      await this.page.goto(`${apiUrl}/verify/CLOONEY-${id}`, { timeout: 199000 }),
    ])
  }
  async user_is_associated_to_an_Engage_account(page: Page) {
    user = userFactory()
    await signUpViaApi({ user: user, page })
    return user
  }

  async user_has_been_granted_Brand_product_access(page: Page) {
    await page.waitForTimeout(300)
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    if ((await page.$('text=Agree To')) !== null) {
      await page
        .getByRole('group')
        .filter({ hasText: 'Agree to Terms & Conditions / Privacy Policy*' })
        .locator('span')
        .nth(1)
        .check({ force: true })
      await page.getByRole('button').click({ force: true })
    }
    const userAccount = page.locator('text=Shop by category')
    await expect(userAccount).toBeVisible({ timeout: 90000 })
  }

  async nagivates_to_the_postal_store_login_page(page: Page) {
    await page.waitForTimeout(200)
    await gotoWithRetry(page, `${baseURL.use?.baseURL}/brand/login`, 5)
  }

  async user_logs_in(page: Page) {
    await this.storeEmailInput.waitFor()
    await this.storeEmailInput.fill(user.userName)
    await this.storePasswordInput.fill(user.password)
    // await Promise.all([
    //   page.waitForResponse(
    //     (resp) => resp.url().endsWith('Fsetup%2Findex') && resp.status() === 200,
    //     {
    //       timeout: 120000,
    //     }
    //   ),
    await this.storeLogInButton.click()
    // ]).catch(async () => {
    //   await page.waitForTimeout(300)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload()
    //   }
    //   if ((await page.$('text=ETIMEDOUT')) !== null) {
    //     await this.storeLogInButton.click()
    //   }
    //   if ((await page.$('text=socket disconnected')) !== null) {
    //     await this.storeLogInButton.click()
    //   }
    // })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await this.storePasswordInput.waitFor({ state: 'hidden' })
  }

  async user_will_be_directed_to_the_login_route(page: Page) {
    const url = await page.url()
    await expect(url).toContain('/login')
  }

  async user_will_be_directed_to_the_login_route_A(page: Page, hostname: string) {
    await page.waitForTimeout(300)
    if ((await page.$('text=Shop All')) !== null) {
      const context = page.context()
      const cookies = await context.cookies()
      const filteredCookies = await cookies.filter(
        (cookie) => cookie.name !== '__postal_brand_store_session_test'
      )
      const filteredCookies2 = await filteredCookies.filter(
        (cookie) => cookie.name !== 'postal-brand-welcome-back'
      )
      context.clearCookies()
      context.addCookies(filteredCookies2)
      await page.waitForTimeout(1000)
      await reloadWithRetry(this.page, 5)
      await page.waitForTimeout(700)
    }
    const url = await page.url()
    await expect(url).toContain('/login')
  }

  async user_will_see_a_password_input_field_and_a_Login_button(page: Page) {
    await expect(this.passwordProtectedStorefrontPasswordInput).toBeVisible()
    await expect(this.storeLogInButton).toBeVisible()
  }

  async user_inputs_correct_password_with_12_chars_or_more_into_password_field(page: Page) {
    await this.passwordProtectedStorefrontPasswordInput.pressSequentially(password)
  }

  async user_clicks_the_Login_button(page: Page) {
    await this.storeLogInButton.click()
  }

  async the_user_will_be_navigated_to_the_storefront_homepage(page: Page) {
    await expect(await this.storeLogInButton).toHaveCount(0, { timeout: 199999 })
    const shoppingCart = await page.locator(`[aria-label="Shopping Bag"]`)
    await expect(await shoppingCart).toBeVisible({ timeout: 299999 })
    const url = await page.url()
    await expect(url).not.toContain('/login')
  }

  async the_test_clears_the_session_cookie_to_mimic_a_users_expired_store_session(page: Page) {
    const context = page.context()
    const cookies = await context.cookies()
    const filteredCookies = await cookies.filter(
      (cookie) => cookie.name !== '__postal_brand_store_session_test'
    )
    const filteredCookies2 = await filteredCookies.filter(
      (cookie) => cookie.name !== 'postal-brand-welcome-back'
    )
    context.clearCookies()
    context.addCookies(filteredCookies2)
  }

  async reloads_the_storefront_page(page: Page) {
    await page.waitForTimeout(130000)
    await page.reload()
  }

  async user_inputs_an_invalid_password_into_the_password_field(page: Page) {
    await this.passwordProtectedStorefrontPasswordInput.pressSequentially('NotThePassword')
  }

  async user_will_see_an_error_message(page: Page, string: string) {
    await expect(page.locator(`text=${string}`)).toBeVisible({ timeout: 90000 })
  }

  async a_new_user_is_generated_and_logged_into_the_Store_app(page: Page) {
    const user = userFactory()
    const signupIn = new SignUpIn(page)
    await signUpViaApi({ user: user, page })
    if ((await page.$('text=Agree To')) !== null) {
      await page
        .getByRole('group')
        .filter({ hasText: 'Agree to Terms & Conditions / Privacy Policy*' })
        .locator('span')
        .nth(1)
        .check({ force: true })
      await page.getByRole('button').click({ force: true })
    }
    const userAccount = page.locator('text=Shop by category')
    await expect(userAccount).toBeVisible({ timeout: 90000 })
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    await gotoWithRetry(page, `${baseURL.use?.baseURL}/brand/`, 5)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    }
    await signupIn.storeEmailInput.fill(user.userName)
    await signupIn.storePasswordInput.fill(user.password)
    // await Promise.all([
    //   page.waitForResponse(
    //     (resp) => resp.url().endsWith('Fsetup%2Findex') && resp.status() === 200,
    //     {
    //       timeout: 120000,
    //     }
    //   ),
    await signupIn.storeLogInButton.click()
    // ]).catch(async () => {
    //   await page.waitForTimeout(300)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload()
    //   }
    //   if ((await page.$('text=ETIMEDOUT')) !== null) {
    //     await signupIn.storeLogInButton.click()
    //   }
    // })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await this.storePasswordInput.waitFor({ state: 'hidden' })
    await page.waitForTimeout(300)
    if ((await page.$('text=socket disconnected')) !== null) {
      await signupIn.storeLogInButton.click()
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 90000 })
    }
    return user
  }
}
