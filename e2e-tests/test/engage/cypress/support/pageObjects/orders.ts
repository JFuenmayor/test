export default class Orders {
  visitOrders = () => {
    return cy.visit('/orders/all')
  }
  visitOrdersOverview = () => {
    return cy.visit('/orders')
  }
  getGroupOrdersButton = () => {
    return cy.contains('button', 'Group Orders')
  }

  getGroupDirectsButton = () => {
    return cy.contains('button', 'Group Directs')
  }

  getGroupOrderNameInput = () => {
    return cy.findByRole('textbox', { name: 'Name' })
  }

  getSearchInput = () => {
    return cy.findByPlaceholderText('Search...')
  }

  getScheduledForInfo = () => {
    return cy.contains('div', 'Scheduled for')
  }

  getEditGroupOrderButton = () => {
    return cy.contains('a', 'Edit Group Order')
  }

  getUpdateGroupOrderButton = () => {
    return cy.contains('button', 'Update Group Order')
  }

  getUpdateGroupOrderSection = () => {
    return cy.contains('section', 'Update Group Order Info')
  }

  getStartDateText = () => {
    return cy.findByText('Start Date')
  }

  getEditStatusSelect = () => {
    return cy.findByRole('combobox', { name: 'Status' })
  }

  getNowButton = () => {
    return cy.findByRole('button', { name: 'Now' })
  }

  getTomorrowMorningButton = () => {
    return cy.findByRole('button', { name: 'Tomorrow Morning' })
  }

  getRemoveFromCampaignButton = () => {
    return cy.findByTestId('deleteIcon')
  }

  getDatePickerInput = () => {
    return cy.get('[name="date"]').next()
  }

  getReviewCampaignName = () => {
    return cy.contains('div', 'Campaign Name').parent('div')
  }

  getReviewSendOn = () => {
    return cy.contains('div', 'Send On').parent('div')
  }

  getCostStats = () => {
    return cy.contains('div', 'Cost')
  }

  getEditNameInput = () => {
    return cy.findByRole('textbox', { name: 'Name' })
  }

  getStartDatePickerInput = () => {
    return cy.get('[name="scheduleDate"]').next()
  }

  getSendOnText() {
    return cy.findByText('Send On')
  }

  getSaveDraft() {
    return cy.findByText('Save Draft')
  }

  getSaveDraftSection = () => {
    return cy.contains('section', 'Save Draft')
  }

  getDraftNameInput = () => {
    return cy.findByRole('textbox', { name: 'Draft Name' })
  }
  getSaveDraftText = () => {
    return cy.contains('Please enter a name to save your draft.')
  }

  getGoToOrdersPageInput = () => {
    return cy.contains('div', 'Go to orders page').find('input')
  }

  getSaveAndExitButton = () => {
    return cy.findByRole('button', { name: 'Save and Exit' })
  }

  getDraftsCard = () => {
    return cy.contains('[data-testid="ui-card"]', 'Drafts')
  }

  getUpdateDraft() {
    return cy.findByText('Update Draft')
  }

  getUpdateDraftSection = () => {
    return cy.contains('section', 'Update Draft')
  }

  getUpdateAndExitButton = () => {
    return cy.findByRole('button', { name: 'Update and Exit' })
  }

  getEmailsCard = () => {
    return cy.contains('[data-testid="ui-card"]', 'Emails')
  }
  getMagicLinksCard = () => {
    return cy.contains('[data-testid="ui-card"]', 'MagicLinks')
  }
  getDirectsCard = () => {
    return cy.contains('[data-testid="ui-card"]', 'Directs')
  }
}
