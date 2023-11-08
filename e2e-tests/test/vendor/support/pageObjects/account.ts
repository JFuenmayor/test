import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { SignUpIn } from '../pageObjects'

export default class Account {
  readonly page: Page
  readonly accountTab: Locator
  readonly updatePassword: Locator
  readonly companyInfoHeader: Locator
  readonly actionsButton: Locator
  readonly shopifyConnectButton: Locator
  readonly companyInfoSidePanel: Locator
  readonly companyNameInput: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly companyBioInput: Locator
  readonly currentPasswordInput: Locator
  readonly newPasswordInput: Locator
  readonly reEnterNewPasswordInput: Locator
  readonly cancelButton: Locator
  readonly updatePasswordButton: Locator
  readonly updateProfileHeader: Locator
  readonly updateProfileButton: Locator
  readonly getAlertSuccessPassword: Locator
  readonly getAlertSuccessProfile: Locator
  readonly getAlertClose: Locator
  readonly userAccount: Locator
  readonly bipocToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.accountTab = page.getByRole('link', { name: 'Account' })
    this.companyInfoHeader = page.locator('h2 >> text=Company Information')
    this.actionsButton = page.locator('button:has-text("Actions")')
    this.updatePassword = page.locator('button >> text=Update Password')
    this.shopifyConnectButton = page.locator('button:has-text("Connect")')
    this.companyInfoSidePanel = page.locator(
      '[data-testid="UiSidebar_card"] div:has-text("Company Information")'
    )
    this.companyNameInput = page.locator('#companyName')
    this.firstNameInput = page.locator('#firstName')
    this.lastNameInput = page.locator('#lastName')
    this.emailInput = page.locator('#emailAddress')
    this.phoneInput = page.locator('#phoneNumber')
    this.companyBioInput = page.locator('#description')
    this.currentPasswordInput = page.locator('#currentPassword')
    this.newPasswordInput = page.locator('#newPassword1')
    this.reEnterNewPasswordInput = page.locator('#newPassword2')
    this.cancelButton = page.locator('button:has-text("Cancel")')
    this.updatePasswordButton = page.locator('section[role="dialog"] >> text=Update Password')
    this.updateProfileHeader = page.locator('header >> text=Update Your Profile')
    this.updateProfileButton = page.locator('button >> text=Update Profile')
    this.getAlertSuccessPassword = page.locator(
      '#chakra-toast-manager-top div[role="status"]:has-text("Success!Password updated")'
    )
    this.getAlertSuccessProfile = page.locator(
      '#chakra-toast-manager-top div[role="status"]:has-text("Success!Profile updated")'
    )
    this.getAlertClose = page.locator('#chakra-toast-manager-top [aria-label="Close"]')
    this.userAccount = page.locator('[data-testid="profile-data-test"]')
    this.bipocToggle = page.locator('.chakra-switch__track >> nth=0')
  }
  async logout() {
    await this.page.waitForTimeout(300)
    if ((await this.page.$('text=Update Profile')) !== null) {
      await this.page.getByText('Cancel', { exact: true }).click({ force: true })
      await this.page.getByRole('button', { name: 'Confirm' }).click({ force: true })
    }
    await this.page.waitForTimeout(300)
    this.page
      .locator('[data-testid="atomic-subnavbar-right"]')
      .getByRole('button')
      .nth(1)
      .click({ force: true })
    await this.page.locator('text=Logout').click()
    await expect(await this.userAccount).not.toBeVisible({ timeout: 60000 })
  }

  async user_clicks_Account_tab(page: Page) {
    await Promise.all([page.waitForLoadState(), await this.accountTab.click()])
    await page.waitForURL('**/account')
    await expect(await this.page.getByTestId('spinner')).toHaveCount(0)
    await page.waitForSelector('#emailAddress')
  }

  async user_is_redirected_to_account(page: Page) {
    await page.waitForURL('**/account')
  }

  async new_user_should_see_Account_page(page: Page) {
    await expect(page.url()).toContain('/account')
    await expect(this.companyInfoHeader).toBeVisible()
  }
  async user_clicks_actions_tab_to_change_password() {
    await this.accountTab.click()
    await this.page.waitForURL('**/account')
    await this.page.waitForSelector('#emailAddress')
    await this.actionsButton.click()
    await this.updatePassword.click()
  }

  async user_updates_password(user: any) {
    const genericPassword = 'Cucumberautomation!1'
    await expect(await this.page.getByTestId('spinner')).toHaveCount(0)
    await this.page.waitForSelector('#currentPassword')
    await this.currentPasswordInput.type(user.password)
    await this.newPasswordInput.type(genericPassword)
    await this.reEnterNewPasswordInput.type(genericPassword)
    await this.updatePasswordButton.click()
    await expect(this.getAlertSuccessPassword).toHaveCount(1)
    await this.getAlertClose.click({ force: true })
  }

  async user_updates_account_info_and_logs_out(page: Page, user: any) {
    const firstNameInputVal = await this.firstNameInput.inputValue()
    const lastNameInputVal = await this.lastNameInput.inputValue()
    const phoneInputVal = await this.phoneInput.inputValue()
    const genericFirstName = 'John'
    const genericLastName = 'Doe'
    const genericPhone = '805-123-4567'

    //Assert input value fields before updating
    await expect(await firstNameInputVal).toBe(user.firstName)
    await expect(await lastNameInputVal).toBe(user.lastName)
    await expect(await phoneInputVal).toBe('') // Assert phone number field is empty by default
    await expect(this.updateProfileButton).not.toBeVisible()
    // Fun Fact - the vendors are the fulfillment partners and BIPOC owned and the other toggles
    // are all set in the db for that vendor/fulfillment partner
    // so if one test run edits it to be checked, in the next test run it will remain checked
    // can't test for defaults
    await expect(this.bipocToggle).toBeVisible()

    //Update input fields
    await this.firstNameInput.fill(genericFirstName)
    await expect(this.updateProfileButton).toBeVisible() //Assert update profile button is visible after input field is changed
    await this.lastNameInput.fill(genericLastName)
    await this.phoneInput.fill(genericPhone)
    await this.updateProfileButton.click()
    await expect(this.getAlertSuccessProfile).toBeVisible()
    await this.getAlertClose.click()
    await this.logout()
    const context = page.context()
    await page.waitForURL('**/login')
    context.clearCookies()
    await page.reload({ timeout: 80000 })
  }

  async user_should_see_updated_changes_after_login(page: Page, user: any) {
    const signupIn = new SignUpIn(page)
    const genericFirstName = 'John'
    const genericLastName = 'Doe'
    const genericPhone = '805-123-4567'

    //Login
    await signupIn.emailInput.fill(user.userName)
    await signupIn.passwordInput.fill(user.password)
    await signupIn.logInButton.click({ force: true })
    const loading2 = page.locator('text=Loading...')
    await expect(loading2).toHaveCount(0, { timeout: 90000 })
    await this.accountTab.click({ force: true })
    await page.waitForURL('**/account')
    await page.waitForSelector('#emailAddress')

    //Assert changes saved
    const genericFirstNameInput = await this.firstNameInput.inputValue()
    const genericLastNameInput = await this.lastNameInput.inputValue()
    const genericPhoneInput = await this.phoneInput.inputValue()

    await expect(genericFirstNameInput).toBe(genericFirstName)
    await expect(genericLastNameInput).toBe(genericLastName)
    await expect(genericPhoneInput).toBe(genericPhone)
    //bug PV-915
    //await expect(this.bipocToggle).toBeChecked()
  }
}
