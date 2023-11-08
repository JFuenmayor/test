import { FakeUser } from '../factories'

export default class AccountInfo {
  //visit
  visitAccountInfo() {
    return cy.visit('/account/info')
  }
  //text elements
  getNotSetText() {
    return cy.contains('Not Set')
  }
  getSupportAccessEnabledText() {
    return cy.findByText(/Support Access Enabled/i)
  }
  getAccessTimeRemainingText() {
    return cy.findByText('Access time remaining')
  }
  //groups
  getAccountNameGroup() {
    return cy.findByTestId('Account_Info_AccountName')
  }
  getDisplaytNameGroup() {
    return cy.findByTestId('Account_Info_DisplayName')
  }
  getCompanyAddressGroup() {
    return cy.findByTestId('Account_Info_CompanyAddress')
  }
  //headings
  getCompanyInfoHeading() {
    return cy.contains('Company Info')
  }
  //links
  getAccountSettingsLink() {
    return cy.findByRole('link', { name: 'Account Settings' })
  }
  getSavedMessagesLink() {
    return cy.findByRole('link', { name: 'Saved Messages' })
  }
  //drawers
  getEditCompanyInfoDrawer() {
    return cy.findByRole('alertdialog', { name: 'Edit Company Info' })
  }
  //inputs
  getAccounNameInput() {
    return cy.findByLabelText('Account Name')
  }
  getDisplayNameInput() {
    return cy.findByLabelText('Display Name')
  }
  getStreetAddress1Input() {
    return cy.findByLabelText('Street Address 1')
  }
  getStreetAddress2Input() {
    return cy.findByLabelText('Street Address 2')
  }
  getCityInput() {
    return cy.findByLabelText('City')
  }
  getStateInput() {
    return cy.contains('div', 'State').find('input:not([type="hidden"])')
  }
  getPostalCodeInput() {
    return cy.findByLabelText('Postal Code')
  }
  //cards
  getUserProductVisibilityCard() {
    return cy.contains('[data-testid="ui-card"]', 'Configure User Access')
  }
  getSupportAccessCard() {
    return cy.contains('[data-testid="ui-card"]', 'Support Access')
  }
  getMagicLinkSettingsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Account Configurations')
  }
  getBudgetTimelineCard() {
    return cy.contains('[data-testid="ui-card"]', 'Budget Timeline', { timeout: 99000 })
  }
  //checkboxes
  getViewAllItemsCheckbox() {
    return cy.contains('div', 'Users can view all items').find('input')
  }
  getViewAllEventsCheckbox() {
    return cy.contains('div', 'Users can view all events').find('input')
  }
  //buttons
  getItemEmailNotficationsButton() {
    return cy.findByTestId('marketplaceRequestNotificationEmails-trigger')
  }
  getItemEmailNotificationsContent() {
    return cy.findByTestId('marketplaceRequestNotificationEmails-content', { timeout: 68000 })
  }
  getEventEmailNotficationsButton() {
    return cy.findByTestId('eventRequestNotificationEmails-trigger')
  }
  getEventEmailNotificationsContent() {
    return cy.findByTestId('eventRequestNotificationEmails-content')
  }
  getEmailNotificationCheckbox(user: FakeUser) {
    return cy.findByLabelText(new RegExp(`${user.firstName} ${user.lastName}`))
  }
  getEmailNotificationSelectedTag(user: FakeUser) {
    return cy.contains('li', new RegExp(`${user.firstName} ${user.lastName?.[0]}.`)).find('button')
  }
  getEmailNotificationClear() {
    return cy.findByRole('button', { name: 'Clear' })
  }
  getEditCompanyInfoButton() {
    return cy.findByLabelText('Edit company info')
  }
  getRevokeAccessImmediatelyButton() {
    return cy.findByRole('button', { name: 'Revoke Access Immediately' })
  }
  getEnableSupportAccessButton() {
    return cy.findByRole('button', { name: 'Enable Support Access' })
  }
  //tooltips and tooltip text
  getProductVisibilityTooltip() {
    return cy.contains('label', 'Users can view all items').find('svg')
  }
  getProductVisibilityTooltipText() {
    return cy.contains('When toggled on, Users can view all Marketplace items.')
  }
  getBudgetTimelineTooltip() {
    return cy.contains('Budget Timeline').find('svg')
  }
  getBudgetTimelineTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Changing this setting will adjust the start and end dates of budget periods.',
    })
  }
  getConfigurationNumberTooltip() {
    return cy.contains('label', 'Configuration').find('svg')
  }
  getConfigurationNumberTooltipText() {
    return cy.findByRole('tooltip', {
      name: `Enter the number of months the start of your company's fiscal year is offset from the start of the calendar year. (e.g. if your company's fiscal year begins Feb. 1st, then put '1' here)`,
    })
  }
  getConfigurationDateTooltip() {
    return cy.contains('label', 'Configuration').find('svg')
  }
  getConfigurationDateTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Enter the start of Q1 this year (the start date of the fiscal year that begins this current calendar year).',
    })
  }
  //select
  getEnableAccessForSelect() {
    return cy.findByRole('combobox', { name: 'Enable access for' })
  }
  getAutoApproveSelect() {
    return cy.findByLabelText('MagicLink Auto Approve')
  }
  getMethodSelect() {
    return cy.findByLabelText('Method')
  }
  getConfigurationNumberField() {
    return cy.findByRole('spinbutton')
  }
  getConfigurationDateInput() {
    return cy.findAllByPlaceholderText('Enter the start day of Q1 this year.')
  }
}
