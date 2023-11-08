import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import baseURL from '../../../../playwright.config'
import { signUpViaApi } from '../apiActions/signup-via-api'
import { userFactory } from '../factories/user-factory'
import { Account } from '../pageObjects'
const BASE_API_URL = process.env.API_URL

export default class SignUpIn {
  readonly page: Page
  readonly singleSignOnText: Locator
  readonly googleButton: Locator
  readonly salesforceButton: Locator
  readonly microsoftButton: Locator
  readonly orText: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly signUpButton: Locator
  readonly alreadyHaveAnAccount: Locator
  readonly companyInput: Locator
  readonly phoneInput: Locator
  readonly stateInput: Locator
  readonly startUsingPostalButton: Locator
  readonly agreeToToggle: Locator
  readonly logInButton: Locator
  readonly forgotPasswordLink: Locator
  readonly welcomeHeader: Locator
  readonly warningAlertBadUsername: Locator
  readonly warningAlertClose: Locator

  constructor(page: Page) {
    this.page = page
    this.singleSignOnText = page.locator('p', { hasText: 'Single Sign-on:' })
    this.googleButton = page.locator('data-testid=Button_Sso_google')
    this.salesforceButton = page.locator('data-testid=Button_Sso_salesforce')
    this.microsoftButton = page.locator('data-testid=Button_Sso_microsoft')
    this.orText = page.locator('p', { hasText: /Or/ })
    this.firstNameInput = page.locator('[placeholder="First Name"]')
    this.lastNameInput = page.locator('[placeholder="Last Name"]')
    this.emailInput = page.locator('[placeholder="me@mycompany.com"]')
    this.passwordInput = page.locator('[placeholder="mypassword"]')
    this.signUpButton = page.locator('button', { hasText: 'Sign Up Now' })
    this.alreadyHaveAnAccount = page.locator('p', { hasText: 'Already have an account?' })
    this.companyInput = page.locator('div[role="group"]:has-text("Company Name*") >> input')
    this.phoneInput = page.locator('div[role="group"]:has-text("Phone") >> input')
    this.stateInput = page.locator('data-testid="AutoCompleteState')
    this.agreeToToggle = page.locator('div[role="group"]:has-text("Agree to")  >> input')
    this.startUsingPostalButton = page.locator('button', { hasText: 'Start using Postal' })
    this.logInButton = page.locator('button', { hasText: 'Login' })
    this.forgotPasswordLink = page.locator('a', { hasText: 'I forgot my password' })
    this.welcomeHeader = page.locator('h1', {
      hasText: `Welcome to the Postal Offline Marketing Platform,`,
    })
    this.warningAlertBadUsername = page.locator(
      'div[role="alert"]:has-text("Bad Username/Password")'
    )
    this.warningAlertClose = page.locator('#chakra-toast-manager-top [aria-label="Close"]')
  }

  async gotoSignUp() {
    await this.page.goto(`${BASE_API_URL}/sign-up`)
  }

  async gotoSignIn() {
    await this.page.goto(`${BASE_API_URL}/sign-in`)
  }

  async gotoVerifyPageByRequestId(id: number) {
    await this.page.goto(`${BASE_API_URL}/verify/CLOONEY-${id}`)
  }
  async gotoVendor() {
    await this.page.goto(`${baseURL.use?.baseURL}/postal-vendor/`)
  }

  async new_user_is_generated_and_logged_into_Vendor_app(page: Page) {
    const user = userFactory()
    await signUpViaApi({ user: user, page })
    const shopBy = page.locator('text=Shop by category')
    await expect(shopBy).toBeVisible({ timeout: 90000 })
    await page.waitForTimeout(1000)
    await this.gotoVendor()
    await this.emailInput.fill(user.userName)
    await this.passwordInput.fill(user.password)
    await this.logInButton.click()
    await page.waitForURL('**/orders', { timeout: 120000 })
    await expect(page.url()).toContain('/orders')
    const ordersHeader = page.locator('[data-testid="ui-subnavbar-left"] >> text=Orders')
    await expect(ordersHeader).toBeVisible()
    return user
  }

  async user_should_be_able_to_log_back_in_with_new_password(page: Page, user: any) {
    const account = new Account(page)
    const genericPassword = 'Cucumberautomation!1'

    //Logout then Login invalid (old) password validation
    await account.logout()
    const context = page.context()
    await page.waitForURL('**/login')
    context.clearCookies()
    await page.reload({ timeout: 80000 })
    await this.emailInput.type(user.userName)
    await this.passwordInput.type(user.password)
    await this.logInButton.click()
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await expect(this.warningAlertBadUsername).toBeVisible()
    await this.emailInput.fill(user.userName)
    await this.passwordInput.fill(genericPassword)
    await this.logInButton.click()
    const loading2 = page.locator('text=Loading...')
    await expect(loading2).toHaveCount(0, { timeout: 90000 })
    await account.accountTab.click({ force: true })
    await page.waitForLoadState()
    await page.waitForTimeout(600)
    const firstNameInputVal = await account.firstNameInput.inputValue()
    await expect(await firstNameInputVal).toBe(user.firstName) //Validate logged back in
  }

  async user_navigates_to_vendor_login_page_after_signup_api_action(page: Page, user: any) {
    const banner = page.locator('label', { hasText: 'Email Address' })
    await signUpViaApi({ user: user, page })
    const shopBy = page.locator('text=Shop by category')
    await expect(shopBy).toBeVisible({ timeout: 90000 })
    await this.gotoVendor()
    await expect(banner).toHaveCount(1) //Vendor login page assertion
  }

  async generated_user_logs_into_vendor_app(page: Page, user: any) {
    const badUsernameAlert = page.locator('[role="alert"]', { hasText: 'Bad Username/Password' })
    // Test invalid credentials
    await this.emailInput.fill('someuser@postal.io')
    await this.passwordInput.fill('asdf123456')
    await this.logInButton.click()
    await expect(badUsernameAlert).toBeVisible({ timeout: 99000 })
    // Test valid credentials
    await this.emailInput.fill(user.userName)
    await this.passwordInput.fill(user.password)
    await this.logInButton.click()
  }

  async the_user_should_see_the_vendor_dashboard(page: Page, user: any) {
    const account = new Account(page)
    await page.waitForURL('**/orders')
    const ordersHeader = page.locator('[data-testid="ui-subnavbar-left"] >> text=Orders')

    //Assertions
    await expect(page.url()).toContain('/orders')
    await expect(ordersHeader).toBeVisible()
    await account.accountTab.click()
    await page.waitForURL('**/account')
    await expect(page.url()).toContain('/account')
    await page.waitForSelector('#emailAddress')
    await expect(account.firstNameInput).toBeVisible()
    const firstNameInputVal = await account.firstNameInput.inputValue()
    await expect(await firstNameInputVal).toBe(user.firstName)
  }
}
