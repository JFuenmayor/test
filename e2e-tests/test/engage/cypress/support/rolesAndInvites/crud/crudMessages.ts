import { SavedMessages, Universal } from '../../pageObjects'

export interface crudMessagesProps {
  header: string
  body: string
}
Cypress.Commands.add('crudMessages', (args: crudMessagesProps) => {
  const savedMessages = new SavedMessages()
  const universal = new Universal()
  const header = args.header
  const body = args.body
  //Creates a message that will remain in order to do further testing
  savedMessages.visitMessages()
  cy.url().should('include', '/saved-messages')
  cy.contains('Budget History').should('be.visible')
  cy.wait(300)
  savedMessages.getCreateMessageButton().click({ force: true })
  savedMessages.getCreateANewTemplateDrawer().within(() => {
    universal.getCloseButtonByLabelText()
    savedMessages.getMessageTitleInput().fill(header)
    savedMessages.getMessageTemplateInput().fill(body)
    savedMessages.getCreateTemplateButton().click()
  })

  // Creates a Second Message specifically for deleting
  savedMessages.getCreateANewTemplateDrawer().should('not.exist')
  savedMessages.getCreateMessageButton().click({ force: true })
  savedMessages.getCreateANewTemplateDrawer().within(() => {
    universal.getCloseButtonByLabelText()
    savedMessages.getMessageTitleInput().fill('Delete Me')
    savedMessages.getMessageTemplateInput().fill(`${body} Delete Me!!`)
    savedMessages.getCreateTemplateButton().click()
  })
  savedMessages.getCreateANewTemplateDrawer().should('not.exist')

  //Edit
  savedMessages.getMessageCardByTitle('Delete Me').within(() => {
    savedMessages.getEditMessageButton().click()
  })
  savedMessages.getEditMessageDrawerByName('Delete Me').within(() => {
    universal.getCloseButtonByLabelText()
    savedMessages.getMessageTitleInput().clear()
    savedMessages.getMessageTitleInput().type(`- Updated`, { force: true })
    savedMessages.getMessageTemplateInput().type(`- Updated`, { force: true })
    savedMessages.getUpdateTemplateButton().click()
    cy.contains('Loading...', { timeout: 99000 }).should('not.exist')
  })
  savedMessages.getCreateANewTemplateDrawer().should('not.exist')

  //Delete
  savedMessages.getMessageCardByTitle('- Updated').within(() => {
    savedMessages.getDeleteMessageButton().click()
  })
  savedMessages.getDeleteModal().within(() => {
    universal.getDeleteButton().click()
  })
  savedMessages.getDeleteModal().should('not.exist')
  savedMessages.visitMessages()
  cy.url().should('include', '/saved-messages')

  universal.getSpinner().should('not.exist')
  savedMessages.getMessageCardByTitle('- Updated').should('not.exist')
})
