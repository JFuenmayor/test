import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { userFactory } from '../factories/user-factory'
import { signup } from '../helpers/signup'
const apiUrl = 'https://test.postal.dev'
//let user: any

//const password = userFactory().password

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

  async a_new_user_is_generated_and_logged_into_the_Enagage_app(page: Page) {
    const user = userFactory()
    await signup(user, page)
    const shopBy = page.locator('text=Shop by category')
    await expect(shopBy).toBeVisible({ timeout: 90000 })
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    return user
  }
}
