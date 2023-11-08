import { Marketplace, SendItem, Subscriptions, Universal } from '../../pageObjects'

const subscriptions = new Subscriptions()
const sendItem = new SendItem()
const marketplace = new Marketplace()
const universal = new Universal()

Cypress.Commands.add('crudSubscriptions', (itemName: string, admin?: boolean) => {
  //Create
  subscriptions.visitSubscriptions()
  subscriptions.getStartHereButton().click()
  subscriptions.getAddAStepButton().click()
  cy.contains('a', itemName).click()
  cy.wait(1000)
  subscriptions.getPlaybookStepDelayInput().fill('3')
  if (admin === true) {
    cy.selectAutoComplete('AymerisUp Arnold', 'AutoCompleteSpendAs')
  }
  sendItem.getReviewButton().click()
  universal.getSpinner().should('not.exist')
  universal.getUISpinner().should('not.exist')
  sendItem.getReviewShippingAndPostage().should('be.visible')
  cy.contains('$', { timeout: 44000 }).should('be.visible')
  cy.contains(
    'button',
    RegExp('Add Funds to confirm and Send' + '|' + 'Update Subscription Step')
  ).click()

  const newSubscriptionName = `New Subscription - ${new Date().toLocaleDateString()}`
  //Add Funds to confirm and Send
  subscriptions.getCreatePlaybookButton().click()
  cy.contains(newSubscriptionName)
  //Edit
  subscriptions.getEditPlaybookButton().click()
  universal.getCloseButtonByLabelText().should('be.visible')
  subscriptions.getPlaybookNameInputByDisplayValue(newSubscriptionName).fill('Delete Me')
  subscriptions.getUpdatePlaybookButton().click({ force: true })
  cy.wait(2000)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Back to Home')) {
      cy.wait(600)
      cy.reload()
      cy.wait(600)
    }
  })
  cy.contains('Delete Me')
  //Delete
  marketplace.getEllipsesButton().click()
  subscriptions.getDeletePlaybookMenuItem().click({ force: true })
  subscriptions.getDeletePlaybookModal().within(() => {
    universal.getDeleteButton().should('be.visible').click()
  })
  subscriptions.getDeletePlaybookModal().should('not.exist')
  subscriptions.visitSubscriptions()
  cy.wait(500)
  cy.url().should('not.include', '/subscriptions/')
  cy.url().should('include', '/subscriptions')
  universal.getSpinner().should('not.exist')
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Subscription One') || $body.text().includes('Delete Me')) {
      cy.wait(3100)
      cy.reload()
    }
  })
  subscriptions.getPlaybookByName('Subscription One').should('exist')
  subscriptions.getPlaybookByName('Delete Me').should('not.exist')
})
