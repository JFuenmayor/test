export default class AccountSettings {
  //visit
  visitGiftEmails() {
    return cy.visit('/account/personalized-emails')
  }
  visitEmailSettings() {
    return cy.visit('/account/email-settings')
  }
  visitNotificationSettings() {
    return cy.visit('notifications/general')
  }
  visitEmailTemplates() {
    return cy.visit('/account/email-templates')
  }
  //buttons
  getEnabledButton() {
    return cy.contains('label', 'Enabled')
  }
  getDisabledButton() {
    return cy.contains('label', 'Disabled')
  }
  get3MonthsButton() {
    return cy.contains('label', '3 months')
  }
  get6MonthsButton() {
    return cy.contains('label', '6 months')
  }
  get1YearButton() {
    return cy.contains('label', '1 year')
  }
  getCancelOrderButton() {
    return cy.contains('label', 'Cancel Order')
  }
  getSendAnywaysButton() {
    return cy.contains('label', 'Send Anyways!')
  }
  getEmailDays() {
    return cy.findByRole('combobox', { name: /How much time/ })
  }
  getAlwaysButton() {
    return cy.contains('label', 'Always')
  }
  getDefaultOnButton() {
    return cy.contains('label', 'Default On')
  }
  getDefaultOffButton() {
    return cy.contains('label', 'Default Off')
  }
  getNeverButton() {
    return cy.contains('label', 'Never')
  }
  getDownloadButton() {
    return cy.findByRole('button', { name: /^Download$/ })
  }
  getSeeExampleButton() {
    return cy.findByRole('button', { name: 'See an Example' })
  }
  getSubmitButton() {
    return cy.findByRole('button', { name: 'Submit' })
  }
  //tooltips
  getGiftEmailTooltip() {
    return cy.contains('header', 'Personalized Email Settings').find('svg', { timeout: 90000 })
  }
  getGiftEmailTooltipText() {
    return cy.contains('These emails are sent before an item is shipped.')
  }
  getOrderIssuesTooltip() {
    return cy.contains('Order Issues').find('svg')
  }
  getOrderIssuesTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Issues pertaining to orders blocked by the admin-set blocklist',
    })
  }
  getSendAnEmailTooltip() {
    return cy.contains('header', 'Notifications').find('svg')
  }
  getSendAnEmailTooltipText() {
    return cy.findByRole('tooltip', { name: 'Send me an email when the following actions occur.' })
  }
  getRecipientInformationTooltip() {
    return cy.contains('header', 'Recipient Information').find('svg')
  }
  getRecipientInformationTooltipText() {
    return cy.findByRole('tooltip', { name: 'Download information about recipient actions' })
  }
  getTemplatesTooltip() {
    return cy.findByRole('heading', { name: 'Email Templates Desktop' }).find('svg').eq(0)
  }
  getTemplatesTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Select which email template you prefer for all emails that are sent to your contacts.',
    })
  }
  getNotificationSummaryEmailTooltip() {
    return cy.contains('header', 'Notification Summary Email').find('svg').eq(0)
  }
  getNotificationSummaryEmailTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'These settings affect the notification type and frequency of the digest email and will not affect your other email notification settings.',
    })
  }
  //group elements
  getHowOftenGroup() {
    return cy.contains('[role="group"]', 'How often should we send Address Refresh Emails?')
  }
  getIfNoResponseGroup() {
    return cy.contains('[role="group"]', 'If the recipient does not respond to')
  }
  getRespTimeLimitGroup() {
    return cy.contains('[role="group"]', 'How much time does the recipient have to')
  }
  getEnableGiftEmailsGroup() {
    return cy.contains(
      '[role="group"]',
      'Do you want gift recipients to confirm by email before accepting gifts?'
    )
  }
  //cards
  getSampleEmailCard() {
    return cy.contains('[data-testid="ui-card"]', 'Sample Email')
  }
  getNotificationThresholdsCard() {
    return cy.contains('section', 'Notification Thresholds')
  }
  getColorSplashCard() {
    return cy.contains('li', RegExp('Color Splash' + '|' + 'Default'))
  }
  getNotificationsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Notifications')
  }
  getRecipientInformationCard() {
    return cy.contains('[data-testid="ui-card"]', 'Recipient Information')
  }
  getNotificationSummaryEmailCard() {
    return cy.contains('[data-testid="ui-card"]', 'Notification Summary Email')
  }
  //Alerts
  getSettingsUpdatedAlert(close?: string) {
    close
      ? cy.getAlert({ message: 'Settings updated', close: 'close' })
      : cy.getAlert({ message: 'Settings updated' })
  }
  getDownloadingAlert() {
    return cy.getAlert({
      message: 'Your report is being generated and will download shortly.',
    })
  }
  getAlreadySelectedAlert() {
    return cy.getAlert({ message: 'This template is already selected', close: 'close' })
  }
  getEmailNotFoundAlert() {
    return cy.getAlert({ message: 'This email address was not found.', close: 'close' })
  }
  getContactUnsuscribedAlert() {
    return cy.getAlert({ message: 'Contact unsubscribed.', close: 'close' })
  }
  getValidEmailAlert() {
    return cy.getAlert({ message: 'Please provide a valid email address', close: 'close' })
  }
  //links
  getEmailSettingsLink() {
    return cy.contains('a', 'Email Settings')
  }
  getNotificationsLink() {
    return cy.contains('a', 'Notifications')
  }
  getNotificationSettingsLink() {
    return cy.contains('a', 'Notification Settings')
  }
  getEmailTemplatesLink() {
    return cy.contains('a', 'Email Templates')
  }
  getGiftEmailsLink() {
    return cy.contains('a', 'Gift Emails', { timeout: 34000 })
  }
  getSetBrandingLink() {
    return cy.findByRole('link', { name: 'Set your branding, colors, fonts, and logo' })
  }
  //inputs
  getBudgetLowThresholdInput() {
    return cy.contains('div', 'Budget Low Threshold').should('be.visible').find('input')
  }
  getBalancetLowThresholdInput() {
    return cy.contains('div', 'Balance Low Threshold').find('input')
  }
  getUnsuscibeContactInput() {
    return cy.findByLabelText('Unsubscribe contact')
  }
  //datePickers
  getUnsuscribedDatePicker() {
    return cy.findAllByPlaceholderText('Date Range')
  }
  //toggles
  getBalanceLowToggle() {
    return cy.contains('div', 'Balance Low').next().find('input')
  }
  getBudgetLowToggle() {
    return cy.contains('div', 'Budget Low').next().find('input')
  }
  getGiftEmailAcceptanceToggle() {
    return cy.contains('div', 'Gift Email Acceptance').next().find('input')
  }
  getMagicLinkAcceptanceToggle() {
    return cy.contains('div', 'MagicLink Acceptance').next().find('input')
  }
  getOrderDeliveredToggle() {
    return cy.contains('div', 'Order Delivered').next().find('input')
  }
  getAutoReloadFailuresToggle() {
    return cy.contains('div', 'Auto Reload Failures').next().find('input')
  }
  getOrderIssuesToggle() {
    return cy.contains('div', 'Order Issues').next().find('input')
  }
  getProcessingErrorsToggle() {
    return cy.contains('Processing Errors').next().find('input')
  }
  getMagicLinkApprovalsToggle() {
    return cy.contains('MagicLink Approvals').next().find('input')
  }
  getItemRemovedToggle() {
    return cy.contains('Item Removed').next().find('input')
  }
  getNewItemToggle() {
    return cy.contains('New Item').next().find('input')
  }
  getNewEventToggle() {
    return cy.contains('New Event').next().find('input')
  }
  getNewCollectionToggle() {
    return cy.contains('New Collection').next().find('input')
  }

  //Select
  getMobileDesktopSelect() {
    return cy.findByRole('combobox')
  }
  selectDesktop() {
    return cy.findByRole('combobox').select('Desktop')
  }
  getFrequencySelect() {
    return cy.contains('div', 'Frequency').next().find('select')
  }
  //Text
  getUnsubscribedText() {
    return cy.findByText('Contacts who have unsubscribed from Postal emails')
  }
  getUnsuscribeModalText() {
    return cy.contains('Are you sure you want to unsubscribe this contact?')
  }
  //Modals
  getUnsubscribeModal() {
    return cy.findByRole('alertdialog', { name: 'Unsubscribe Contact Email' })
  }
}
