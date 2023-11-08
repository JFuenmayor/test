import Universal from './universal'

export default class Billing {
  universal = new Universal()
  //visit
  visitBillingAccounts() {
    return cy.visit('/billing/accounts')
  }
  visitBillingFunds() {
    return cy.visit('/billing/funds')
  }
  visitTransfers() {
    return cy.visit('/billing/transfers')
  }
  //links
  getAccountsLink() {
    return cy.contains('a', 'Accounts')
  }
  getEditAccountLink() {
    return cy.contains('button', 'Edit Account')
  }
  getManageUsersLink() {
    return cy.contains('a', 'Manage Users')
  }
  getEditLink() {
    return cy.contains('a', 'Edit')
  }
  getSetupTransferLink() {
    return cy.contains('a', 'Set up a balance transfer')
  }
  getClearAllLink() {
    return cy.contains('a', 'Clear All')
  }
  //listed Accounts
  getFundsAccount(name: string) {
    return cy.contains('div', `${name}'s Fund Management Billing Account`)
  }
  getSubcriptionAccount(name: string) {
    return cy.contains('div', `${name}'s Subscription Billing Account`)
  }
  getUpdatedFundsAccount(accName: string) {
    return cy.contains('div', `${accName}'s Fund Management UP`)
  }
  getNewlyListedFundAccount(accName: string) {
    return cy.contains('div', `${accName} Fund Management`)
  }
  //Listed Card
  getTeamCardByName(name: string) {
    return this.universal.getRowByText(name)
  }
  //get all cards in the funds pagge
  getAllTeamsCards() {
    return cy.findAllByTestId('ui-card')
  }
  //Drawers
  getCreateBillingAccountDrawer() {
    return cy.contains('section', 'Create A Billing Account')
  }
  getCreateTeamDrawer() {
    return cy.findByRole('alertdialog', { name: `Create Team` })
  }
  getTeamMembersDrawer(teamName: string) {
    return cy.findByRole('dialog', { name: `${teamName}` })
  }
  //Selects
  getNewTeamBillingAccountSelect() {
    return cy.findByRole('combobox', { name: 'Billing Account' })
  }
  getNewTeamDepartmentSelect() {
    return cy.findByRole('combobox', { name: 'Department' })
  }
  getTransferFromSelect() {
    return cy.findByTestId('AutoCompleteTransferFromAccount')
  }
  getTransferToSelect() {
    return cy.findByTestId('AutoCompleteTransferToAccount')
  }
  getModalTransferToSelect() {
    return cy.findByRole('combobox', { name: 'Transfer To' })
  }
  //Inputs
  getBillingAccountNameInput() {
    return cy.findByLabelText('Billing Account Name')
  }
  getAccountNameInput() {
    return cy.findByRole('textbox', { name: 'Account Name' })
  }
  getFirstNameInput() {
    return cy.findByRole('textbox', { name: 'First Name' })
  }
  getLastNameInput() {
    return cy.findByRole('textbox', { name: 'Last Name' })
  }
  getWorkEmailInput() {
    return cy.contains('[role="group"]', 'Work Email').find('input')
  }
  getAddressInput() {
    return cy.contains('[role="group"]', 'Address').find('input')
  }
  getCityInput() {
    return cy.contains('[role="group"]', 'City').find('input')
  }
  getPostalCodeInput2() {
    return cy.contains('[role="group"]', 'Postal Code').find('input')
  }
  getPhoneNumberInput() {
    return cy.contains('[role="group"]', 'Phone Number').find('input')
  }
  getStateInput() {
    return cy.contains('div', 'State').find('input:not([type="hidden"])')
  }
  getCountryInput() {
    return cy.findByTestId('AutoCompleteCountry')
  }
  getTeamNameInput() {
    return cy.contains('div', 'Team Name').should('be.visible').find('input')
  }
  getNewPooledTeamInput() {
    return cy.contains('div', 'Team Name').find('input')
  }
  getNewTeamNameInput() {
    return cy.findByLabelText('Name*')
  }
  getBudgetAmountInput() {
    return cy.contains('div', 'Budget Amount*')
  }
  getListedBudgetAmountInput() {
    return cy.contains('div', 'Budget Amount').find('input')
  }
  getAddFundsInput() {
    return cy.contains('form', 'Add Funds').find('input')
  }
  getExpirationDateInput() {
    return cy.contains('div', 'Expiration Date')
  }
  getSecurityCodeInput() {
    return cy.contains('div', 'Security Code')
  }
  getPostalCodeInput() {
    return cy.contains('div', 'Postal/Zip Code')
  }
  getCardNumberInput() {
    return cy.contains('div', 'Card Number')
  }
  getAmountInput() {
    return cy.findByRole('spinbutton', { name: 'Amount' })
  }
  getNotesInput() {
    return cy.findByRole('textbox', { name: 'Notes' })
  }
  getReloadAmountInput() {
    return cy.findByRole('spinbutton', { name: 'Reload Amount' })
  }
  getWhenBalanceFallsBelowInput() {
    return cy.findByRole('spinbutton', { name: 'When balance falls below' })
  }
  //Alerts
  getNewAccountCreatedAlert() {
    return cy.getAlert({ message: 'New billing account created', close: 'close' })
  }
  getDeletedAccountAlert() {
    return cy.getAlert({ message: 'Billing Account Deleted', close: 'close' })
  }
  getUpdatedAlertByTeamName(name: string) {
    return cy.getAlert({ message: `${name} Updated`, close: 'close' })
  }
  getUnabletoDeleteAlert() {
    return cy.getAlert({
      message: `Unable to delete billing account currently being used by account or team`,
      close: 'close',
    })
  }
  getAmountLessAlert() {
    cy.getAlert({ message: 'Please provide an amount less than $100,000', close: 'close' })
  }
  getAccountUpdatedAlert() {
    return cy.getAlert({ message: 'Account updated', close: 'close' })
  }
  //Buttons
  getEditBillingAccountButton() {
    return cy.findByLabelText('SubNavbar Title')
  }
  getSaveBillingAccountNameButton() {
    return cy.findByLabelText('Save Billing Account Name')
  }
  getEditButton() {
    return cy.contains('button', 'Edit')
  }
  getBackToAccountsButton() {
    return cy.contains('a', 'Back to Accounts')
  }
  getAddFundsButton() {
    return cy.findByRole('button', { name: 'Add Funds' })
  }
  getAddCardButton() {
    return cy.findByRole('button', { name: 'Add Card' })
  }
  getAddBillingAccountButton() {
    return cy.findByRole('button', { name: 'Add a billing Account' })
  }
  getAddATeamButton() {
    return cy.findByRole('button', { name: 'Add a Team' })
  }
  getCreateTeamButton() {
    return cy.findByRole('button', { name: 'Create Team' })
  }
  getupdateRolesButton() {
    return cy.findByRole('button', { name: 'Update Roles' })
  }
  getDisabledButton() {
    return cy.contains('label', 'Disabled')
  }
  getPooledButton() {
    return cy.contains('label', 'Pooled')
  }
  getPerUserButton() {
    return cy.contains('label', 'Per User')
  }
  getMonthlyButton() {
    return cy.contains('label', 'Monthly')
  }
  getQuarterlyButton() {
    return cy.contains('label', 'Quarterly')
  }
  getYearlyButton() {
    return cy.contains('label', 'Yearly')
  }
  getChangePaymentMethodButton() {
    return cy.contains('a', 'Change Payment Method')
  }
  getSetUpTransferButton() {
    return cy.findByRole('button', { name: 'Set up transfer' })
  }
  getTransferButton() {
    return cy.findByRole('button', { name: 'Transfer' })
  }
  getRequestButton() {
    return cy.findByRole('button', { name: 'Submit' })
  }

  //Toggles
  getAutoReloadToggle() {
    return cy.findByRole('checkbox')
  }
  //Tooltips and Tooltip text
  getAutoReloadTooltip() {
    return cy.contains('Auto Reload ').find('svg')
  }
  getTooltipOffText() {
    return cy.contains(
      'Auto-reload is off. We recommend you turn it on to ensure your account always has funds available for what you send.'
    )
  }
  getTooltipOnText() {
    return cy.contains(
      'Auto-reload is turned on, to ensure your account always has funds available for what you send. You can turn it off if you prefer to manually add funds.'
    )
  }
  getBudgetModeTooltip() {
    return cy.contains('Budget Mode').find('svg')
  }
  getRemainingBudgetTooltip() {
    return cy.contains('Remaining Budget').find('svg')
  }
  getRemainingBudgetTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The budget the team has to spend over a given duration. This amount can be lower or higher than the actual funds loaded, and it serves as a safeguard to prevent over-spending.',
    })
  }
  //Text elements
  getAddFunds() {
    return cy.findByLabelText('Add Funds')
  }
  getPaymentMethodText() {
    return cy.findByText('Payment Method')
  }
  getVisaText() {
    return cy.findByText(/^Visa$/)
  }
  getNoFundsText() {
    return cy.contains('You currently have no funds.')
  }
  getNewTeamBillingAccountText() {
    return cy.findByText('Billing Account*')
  }
  getBudgetDurationText() {
    return cy.findByText('Budget Duration')
  }
  getCardNumberHint() {
    return cy.findByText('**** **** **** 4242')
  }
  getConfirmTransferText(amount: string, fromAccount: string, toAccount: string, date: string) {
    return cy.contains(
      `By clicking confirm you acknowledge the transfer of funds in the amount of ${amount} from ${fromAccount} to ${toAccount} effective ${date}`
    )
  }
  //TextElements
  tranfersTableHeaderText() {
    return 'From AccountTo AccountStatusAmountDateNotes'
  }
  newTranfersTableHeaderText() {
    return 'From AccountTo AccountStatusAmountFX RateDateNotes'
  }
  //Menu items
  getDeleteButton() {
    return cy.contains('button', 'Delete Account')
  }
  getAddTeamItem() {
    return cy.findByRole('menuitem', { name: 'Add Team' })
  }
  //Modals
  getChangePaymentModal() {
    return cy.contains('section', 'Card Number')
  }
  getEditBillingAccountsModal() {
    return cy.findByRole('alertdialog', { name: 'Edit Billing Account' })
  }
  getBudgetModalText() {
    return cy.findByText('Budgets are used to limit user spending.')
  }
  getDeleteBillingAccountModal() {
    return cy.findByRole('alertdialog', { name: `Confirm Delete Billing Account` })
  }
  getDeleteModalText() {
    return cy.findByText('Deleting a billing account will hide it and make it unusable by teams.')
  }
  getBudgetModesModal() {
    return cy.findByRole('dialog', { name: `Budget Modes` })
  }
  getBudgetModesModalV2() {
    return cy.findByRole('dialog', { name: `Budget Modes` })
  }
  getConfirmFundsModal() {
    return cy.contains('section', 'Confirm Funds')
  }
  getOldConfirmFundsModal() {
    return cy.findByRole('alertdialog', { name: 'Confirm Funds' })
  }
  getReviewandConfirmModal() {
    return cy.findByRole('alertdialog', { name: 'Review and Confirm' })
  }
  getSetUpATransferModal() {
    return cy.findByRole('alertdialog', { name: 'Set up a transfer' })
  }
  getFundByInvoiceModal() {
    return cy.findByRole('alertdialog', { name: 'Pay by Invoice' })
  }
  getConfirmForeignTransferModal() {
    return cy.contains('section', 'Confirm Foreign Transfer')
  }
  //Cards
  getCurrentBalance() {
    return cy.contains('div', `Current Balance`, { timeout: 25000 })
  }
  getRemainingBudget() {
    return cy.contains('div', `Remaining Budget`, { timeout: 95000 })
  }
  getActiveTeams() {
    return cy.contains('div', `Active Teams`)
  }
  getCurrentAccountCard(name: string | RegExp) {
    return cy.contains('[data-testid="ui-card"]', name, { timeout: 25000 })
  }
  getSetUpATransferCard() {
    return cy.contains('[data-testid="ui-card"]', 'Set up a domestic transfer')
  }
  getTransferHistoryCard() {
    return cy.contains('[data-testid="ui-card"]', 'Transfer History')
  }
  getRequestToFundByInvoiceCard() {
    return cy.contains('[data-testid="ui-card"]', 'Pay by Invoice')
  }
  getDomesticTransferInfoCard() {
    return cy.contains(
      '[data-testid="ui-card"]',
      'A domestic transfer is between two billing accounts of the same currency.'
    )
  }
  getForeignCurrencyTransferInfoCard() {
    return cy.contains(
      '[data-testid="ui-card"]',
      `A foreign currency transfer exchanges one currency for another. After confirming the terms you'll get an email receipt with the transfer details`
    )
  }
  //Tags
  getTagByText(text: string | RegExp) {
    return cy.contains('[data-testid="ui-tag"]', text, { timeout: 50000 })
  }
  //Info
  getTransferFrom() {
    return cy.contains('div', 'Transfer From')
  }
  getTransferTo() {
    return cy.contains('div', 'Transfer To')
  }
  getAmount() {
    return cy.contains('div', 'Amount')
  }
  getDate() {
    return cy.contains('div', 'Date')
  }
  getConfirmForeignTransferFrom() {
    return cy.contains('div', 'From')
  }
  getConfirmForeignTransferTo() {
    return cy.contains('div', 'To')
  }
  //Tabs
  getSetUpADomesticTransfer() {
    return cy.findByRole('tab', { name: 'Set up a domestic transfer' })
  }
  getSetUpAForeignCurrencyTransfer() {
    return cy.findByRole('tab', { name: 'Set up a foreign currency transfer' })
  }
}
