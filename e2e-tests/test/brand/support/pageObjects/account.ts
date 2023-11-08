import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

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
  readonly getAlertSuccessPassword: Locator
  readonly getAlertClose: Locator
  readonly userAccount: Locator

  constructor(page: Page) {
    this.page = page
    this.accountTab = page.locator('[data-testid="ui-skeleton"] >> text=Account')
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
    this.updatePasswordButton = page.locator('div[role="dialog"] >> text=Update Password')
    this.updateProfileHeader = page.locator('header >> text=Update Your Profile')
    this.getAlertSuccessPassword = page.locator(
      '#chakra-toast-manager-top div[role="alert"]:has-text("Success!Password updated")'
    )
    this.getAlertClose = page.locator('#chakra-toast-manager-top [aria-label="Close"]')
    this.userAccount = page.locator('[data-testid="profile-data-test"]')
  }
  async logout() {
    await this.page.locator('[data-testid="dropdown"]').click()
    await this.page.locator('text=Logout').click()
    await expect(await this.userAccount).not.toBeVisible()
  }
}
