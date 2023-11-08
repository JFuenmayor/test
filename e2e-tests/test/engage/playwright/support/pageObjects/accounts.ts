import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import baseURL from '../../../../../playwright.config'
import type { FakeUser } from '../factories/user-factory'

export default class Accounts {
  //readonly page: Page
  readonly company_address_section: Locator
  readonly edit_button: Locator
  readonly edit_company_info_modal: Locator
  readonly display_name_field: Locator
  readonly street_address_1_field: Locator
  readonly street_address_2_field: Locator
  readonly city_field: Locator
  readonly postal_code_field: Locator
  readonly state_field_value: Locator
  readonly state_field: Locator
  readonly country_field_value: Locator
  readonly country_field: Locator
  readonly configure_User_Access_card: Locator
  readonly items_recipients_dropdown: Locator
  readonly items_recipients_menu: Locator
  readonly users_can_view_all_items_checkbox: Locator
  readonly events_recipients_dropdown: Locator
  readonly events_recipients_menu: Locator
  readonly users_can_view_all_events_checkbox: Locator
  readonly users_can_bulk_send_items_checkbox: Locator
  readonly autoApproveSelect: Locator
  constructor(page: Page) {
    this.company_address_section = page.getByTestId('Account_Info_CompanyAddress')
    this.edit_button = page.getByRole('button', { name: 'Edit company info' })
    this.edit_company_info_modal = page.getByRole('alertdialog', { name: 'Edit Company Info' })
    this.display_name_field = this.edit_company_info_modal.getByLabel('Display Name')
    this.street_address_1_field = this.edit_company_info_modal.getByLabel('Street Address 1')
    this.street_address_2_field = this.edit_company_info_modal.getByLabel('Street Address 2')
    this.city_field = this.edit_company_info_modal.getByLabel('City')
    this.postal_code_field = this.edit_company_info_modal.getByLabel('Postal Code')
    this.state_field_value = this.edit_company_info_modal
      .locator('.UiSelectTypeahead__value-container')
      .first()
    this.state_field = this.edit_company_info_modal
      .locator('.UiSelectTypeahead__input-container')
      .first()
    this.country_field_value = this.edit_company_info_modal
      .locator('.UiSelectTypeahead__value-container')
      .nth(1)
    this.country_field = this.edit_company_info_modal
      .locator('.UiSelectTypeahead__input-container')
      .nth(1)
    this.configure_User_Access_card = page.locator(
      `[data-testid="ui-card"]:has-Text("Configure User Access")`
    )
    this.items_recipients_dropdown = this.configure_User_Access_card.locator(
      `[data-testid="marketplaceRequestNotificationEmails-trigger"]`
    )
    this.items_recipients_menu = page.locator(
      `[data-testid="marketplaceRequestNotificationEmails-content"]`
    )
    this.users_can_view_all_items_checkbox = page
      .getByRole('group')
      .filter({ hasText: 'Users can view all items' })
      .locator('span')
      .nth(1)
    this.events_recipients_dropdown = this.configure_User_Access_card.locator(
      `[data-testid="eventRequestNotificationEmails-trigger"]`
    )
    this.events_recipients_menu = page.locator(
      `[data-testid="eventRequestNotificationEmails-content"]`
    )
    this.users_can_view_all_events_checkbox = page
      .getByRole('group')
      .filter({ hasText: 'Users can view all events' })
      .locator('span')
      .nth(1)
    this.users_can_bulk_send_items_checkbox = page
      .getByRole('group')
      .filter({ hasText: 'Users can Bulk Send Items' })
      .locator('span')
      .nth(1)
    this.autoApproveSelect = page.getByRole('combobox', { name: 'MagicLink Auto Approve' })
  }

  async the_user_is_on_the_Account_Settings_page(page: Page) {
    await page.goto(`${baseURL.use?.baseURL}/account/info`, { timeout: 70000 })
  }
  async the_user_should_see_the_account_name_displayed_correctly(page: Page, user: FakeUser) {
    const name = user.company
    const spinner = await page.getByTestId('spinner')
    await expect(spinner).toHaveCount(0)
    const companyInfo = await page.getByText('Company Info')
    await companyInfo.waitFor({ state: 'visible' })
    const account_info = await page.getByTestId('Account_Info_AccountName')
    //checks the profile data in the navbar too
    await expect(account_info).toContainText(name)
    const truncatedName = name.slice(0, 12)
    const profile = await page.locator(
      `[data-testid="atomic-subnavbar-right"] >> [role="menuitem"]:has-Text("${truncatedName}")`
    )
    await expect(profile).toHaveCount(1)
  }
  async the_Display_Name_should_not_be_set(page: Page) {
    const display_name = await page.getByTestId('Account_Info_DisplayName')
    await expect(display_name).toContainText('Not Set')
  }
  async the_Company_Address_should_not_be_set() {
    await expect(this.company_address_section).toContainText('Not Set')
  }
  async the_Accounts_Settings_Link_in_the_sidebar_should_be_active(page: Page) {
    const account_settings_link = await page.getByRole('link', { name: 'Account Settings' })
    await expect(account_settings_link).toHaveClass(/active/)
  }
  async the_user_clicks_the_Edit_Company_Info_button() {
    await this.edit_button.click({ force: true })
  }
  async fills_the_Display_Name_field_with_a_new_value() {
    const close_button = this.edit_company_info_modal.getByRole('button', { name: 'Close' })
    await expect(close_button).toHaveCount(1)
    await expect(this.display_name_field).toHaveValue('')
    await this.display_name_field.fill('new display name')
  }
  async fills_the_Street_Address_1_field_with_a_new_value() {
    await expect(this.street_address_1_field).toHaveValue('')
    await this.street_address_1_field.fill('101 Royal Way')
  }
  async fills_the_Street_Address_2_field_with_a_new_value() {
    await expect(this.street_address_2_field).toHaveValue('')
    await this.street_address_2_field.fill('Apt 1')
  }
  async fills_the_City_field_with_a_new_value() {
    await expect(this.city_field).toHaveValue('')
    await this.city_field.fill('San Diego')
  }
  async fills_the_Postal_Code_field_with_a_new_value() {
    await expect(this.postal_code_field).toHaveValue('')
    await this.postal_code_field.fill('93405')
  }
  async fills_the_State_field_with_a_value() {
    await this.state_field_value.scrollIntoViewIfNeeded({ timeout: 10000 })
    await expect(this.state_field_value).not.toBeEmpty()
    await this.state_field.click()
    await this.state_field.type('California')
  }
  async fills_the_Country_field_with_a_value() {
    await this.country_field_value.scrollIntoViewIfNeeded({ timeout: 10000 })
    await expect(this.country_field_value).not.toBeEmpty()
    await this.country_field.click()
    await this.country_field.type('United States')
  }
  async the_user_clicks_the_Save_button(page: Page) {
    const save_button = await page.getByRole('button', { name: 'Save' /* timeout: 94000 */ })
    await save_button.click()
  }
  async the_user_should_see_that_the_company_info_has_been_updated() {
    await expect(this.edit_company_info_modal).toHaveCount(0)
    await expect(this.company_address_section.getByText(' Primary Company Address')).toHaveCount(1)
    await expect(this.company_address_section.getByText('101 Royal Way')).toHaveCount(1)
    await expect(this.company_address_section.getByText('Apt 1')).toHaveCount(1)
    await expect(this.company_address_section.getByText('San Diego,')).toHaveCount(1)
    await expect(this.company_address_section.getByText('93405')).toHaveCount(1)
    await expect(this.company_address_section.getByText('USA')).toHaveCount(1)
  }
  async the_user_should_see_that_the_updated_info_made_it_into_the_edit_drawer(page: Page) {
    await this.edit_button.click({ force: true })
    await expect(this.edit_company_info_modal).toHaveCount(1)
    await expect(this.display_name_field).toHaveValue('new display name')
    await expect(this.street_address_1_field).toHaveValue('101 Royal Way')
    await expect(this.street_address_2_field).toHaveValue('Apt 1')
    await expect(this.city_field).toHaveValue('San Diego')
    const one_of_these = new RegExp(
      'Texas' +
        '|' +
        'California' +
        '|' +
        'Virginia' +
        '|' +
        'Iowa' +
        '|' +
        'Washington State' +
        '|' +
        'Ohio' +
        '|' +
        'Arizona'
    )
    const check_state_value = await page.locator(`[role="group"]:has-Text("State")`).first()
    await expect(check_state_value).toContainText(one_of_these)
    await expect(this.postal_code_field).toHaveValue('93405')
    const check_country_value = await page.locator(`[role="group"]:has-Text("Country")`)
    await expect(check_country_value).toContainText('United States')
  }
  async the_user_selects_an_Admin_for_Item_Request_Email_Recipients(page: Page, user: FakeUser) {
    await page.waitForSelector(`[data-testid="marketplaceRequestNotificationEmails-trigger"]`, {
      state: 'visible',
    })
    await expect(this.items_recipients_dropdown).not.toBeDisabled()
    await expect(this.items_recipients_dropdown).toContainText('All Admins')
    await this.items_recipients_dropdown.click({ force: true })
    await page.waitForSelector(
      '[data-testid="marketplaceRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'visible',
      }
    )
    const recipient_to_select = this.items_recipients_menu
      .locator('div')
      .filter({ hasText: `${user.firstName} ${user.lastName}` })
      .nth(1)
    await recipient_to_select.click({ force: true })
    await page.waitForSelector(
      '[data-testid="marketplaceRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'hidden',
      }
    )
    //tests the clear button
    await page.getByRole('button', { name: 'Clear' }).click({ delay: 10 })
    await page.waitForSelector(
      '[data-testid="marketplaceRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'visible',
      }
    )
    //selects again
    await recipient_to_select.click({ delay: 10 })
    await page.waitForSelector(
      '[data-testid="marketplaceRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'hidden',
      }
    )
  }
  async the_user_should_see_that_one_Admin_was_saved_for_Item_Request_Email_Recipients(page: Page) {
    await page.getByRole('heading', { name: 'Account Settings' }).click()
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await expect(this.items_recipients_dropdown).toContainText('(1) Admin')
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
  }
  async the_user_selects_All_Admins_for_Item_Request_Email_Recipients(page: Page, user: FakeUser) {
    await page.waitForTimeout(1000)
    if ((await page.$('text=Item Request Email Recipients')) === null) {
      await this.users_can_view_all_items_checkbox.click()
    }
    await this.items_recipients_dropdown.click({ force: true })
    const recipient_to_select = this.items_recipients_menu
      .locator('div')
      .filter({ hasText: `${user.firstName} ${user.lastName}` })
      .nth(1)
    //unclicks
    await recipient_to_select.click({ force: true })
    await page.waitForSelector(
      '[data-testid="marketplaceRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'visible',
      }
    )
  }
  async the_user_should_see_that_All_Admins_was_saved_for_Item_Request_Email_Recipients(
    page: Page
  ) {
    await this.configure_User_Access_card.click()
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await expect(this.items_recipients_dropdown).toContainText('All Admins')
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
  }
  async the_user_turns_off_Users_can_view_all_items() {
    await expect(this.users_can_view_all_items_checkbox).toBeChecked({ checked: true })
    await this.users_can_view_all_items_checkbox.uncheck()
  }
  async the_user_should_see_that_Off_was_saved_for_Users_can_view_all_items(page: Page) {
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
    await expect(this.users_can_view_all_items_checkbox).toBeChecked({ checked: false })
  }
  async the_user_turns_On_Users_can_view_all_items() {
    await this.users_can_view_all_items_checkbox.check()
  }
  async the_user_should_see_that_On_was_saved_for_Users_can_view_all_items(page: Page) {
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
    await expect(this.users_can_view_all_items_checkbox).toBeChecked({ checked: true })
  }
  async the_user_selects_an_Admin_for_Event_Request_Email_Recipients(page: Page, user: FakeUser) {
    await page.waitForSelector(`[data-testid="eventRequestNotificationEmails-trigger"]`, {
      state: 'visible',
    })
    await expect(this.events_recipients_dropdown).not.toBeDisabled()
    await expect(this.events_recipients_dropdown).toContainText('All Admins')
    await this.events_recipients_dropdown.click({ force: true })
    await page.waitForSelector(
      '[data-testid="eventRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'visible',
      }
    )
    const recipient_to_select = this.events_recipients_menu
      .locator('div')
      .filter({ hasText: `${user.firstName} ${user.lastName}` })
      .nth(1)
    await recipient_to_select.click({ force: true })
    await page.waitForSelector(
      '[data-testid="eventRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'hidden',
      }
    )
    //tests the clear button
    await page.getByRole('button', { name: 'Clear' }).click()
    await page.waitForSelector(
      '[data-testid="eventRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'visible',
      }
    )
    //selects again
    await recipient_to_select.click({ force: true })
    await page.waitForSelector(
      '[data-testid="eventRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'hidden',
      }
    )
  }
  async the_user_should_see_that_one_Admin_was_saved_for_Event_Request_Email_Recipients(
    page: Page
  ) {
    await page.getByRole('heading', { name: 'Account Settings' }).click()
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await expect(this.events_recipients_dropdown).toContainText('(1) Admin')
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
  }
  async the_user_selects_All_Admins_for_Event_Request_Email_Recipients(page: Page, user: FakeUser) {
    await this.events_recipients_dropdown.click({ force: true })
    const recipient_to_select = this.events_recipients_menu
      .locator('div')
      .filter({ hasText: `${user.firstName} ${user.lastName}` })
      .nth(1)
    //unclicks
    await recipient_to_select.click({ force: true })
    await page.waitForSelector(
      '[data-testid="eventRequestNotificationEmails-content"]:has-Text("All Admins")',
      {
        state: 'visible',
      }
    )
  }
  async the_user_should_see_that_All_Admins_was_saved_for_Event_Request_Email_Recipients(
    page: Page
  ) {
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('/api/user/graphql') &&
          resp.status() === 200 &&
          (await resp.text()).includes('updateAccount'),
        {
          timeout: 30000,
        }
      ),
      await page.getByRole('heading', { name: 'Account Settings' }).click(),
    ]).catch(async () => {
      await page.waitForTimeout(500)
      if ((await page.$('text=Error')) !== null) {
        await page.reload({ timeout: 60000 })
      }
    })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await expect(this.events_recipients_dropdown).toContainText('All Admins')
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
    await page.waitForTimeout(10000)
  }
  async the_user_turns_off_Users_can_view_all_events() {
    await expect(this.events_recipients_dropdown).toHaveCount(1)
    await expect(this.users_can_view_all_events_checkbox).toBeChecked({ checked: true })
    await this.users_can_view_all_events_checkbox.uncheck({ force: true })
  }
  async the_user_should_see_that_Off_was_saved_for_Users_can_view_all_events(page: Page) {
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
    await expect(this.users_can_view_all_events_checkbox).toBeChecked({ checked: false })
    await expect(this.events_recipients_dropdown).toHaveCount(0)
  }
  async the_user_turns_On_Users_can_view_all_events() {
    await this.users_can_view_all_events_checkbox.check()
  }
  async the_user_should_see_that_On_was_saved_for_Users_can_view_all_events(page: Page) {
    await expect(this.users_can_view_all_events_checkbox).toBeChecked({ checked: true })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
    await expect(this.events_recipients_dropdown).toHaveCount(1)
  }
  async the_user_turns_On_Users_can_bulk_send_items() {
    await expect(this.users_can_bulk_send_items_checkbox).toBeChecked({ checked: false })
    await this.users_can_bulk_send_items_checkbox.check()
  }
  async the_user_should_see_that_On_was_saved_for_Users_can_bulk_send_items(page: Page) {
    await expect(this.users_can_bulk_send_items_checkbox).toBeChecked({ checked: true })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
  }
  async the_user_turns_off_Users_can_bulk_send_items() {
    await this.users_can_bulk_send_items_checkbox.uncheck()
  }
  async the_user_should_see_that_Off_was_saved_for_Users_can_bulk_send_items(page: Page) {
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'visible' })
    await page.waitForSelector('[role="status"]:has-text("Setting Updated")', { state: 'hidden' })
    await expect(this.users_can_bulk_send_items_checkbox).toBeChecked({ checked: false })
  }
  async the_user_selects_a_MagicLink_Auto_Approve_Setting(page: Page) {
    await expect(page.getByText('MagicLink Auto Approve')).toHaveCount(1)
    const text = await this.autoApproveSelect.getByRole('option').allTextContents()
    expect(text).toEqual([
      'Never',
      'After 2 Business Days',
      'After 5 Business Days',
      'After 10 Business Days',
    ])
    await this.autoApproveSelect.selectOption({ value: '2' })
  }
  async the_user_should_see_that_the_MagicLink_Auto_Approve_Setting_has_been_set() {
    expect(this.autoApproveSelect).toHaveValue('2')
  }
}
