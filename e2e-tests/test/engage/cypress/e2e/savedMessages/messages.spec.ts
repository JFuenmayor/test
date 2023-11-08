import { userFactory } from '../../support/factories'
import { Form, SavedMessages, Universal } from '../../support/pageObjects'

describe('Creating, Editing, and Deleting Saved Messages', function () {
  const user = userFactory()
  const savedMessages = new SavedMessages()
  const universal = new Universal()
  const form = new Form()

  before(function () {
    cy.signup(user)
    //the following ensures the seed is always created after the default messages are created.
    savedMessages.visitMessages()
    universal.getSpinner().should('not.exist')
    savedMessages.getWinBackSavedMessage().should('be.visible')
    cy.messagesSeed()
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests that submitting the create a Message form without any input is invalid`, function () {
    cy.wait(300)
    savedMessages.visitMessages()
    universal.getSpinner().should('not.exist')
    savedMessages.getMessageCardByTitle('ALERT ALERT').should('be.visible')
    savedMessages.getSavedMessagessHeader().should('be.visible')
    savedMessages.getCreateMessageButton().click({ force: true })
    savedMessages.getCreateANewTemplateDrawer().within(() => {
      savedMessages.getCreateTemplateButton().click({ force: true })
      savedMessages.getMessageTitleInput().then(form.checkValidity).should('be.false')
      savedMessages.getMessageTitleInput().fill('something')
      savedMessages.getMessageTitleInput().then(form.checkValidity).should('be.true')
      savedMessages.getMessageTemplateInput().then(form.checkValidity).should('be.false')
      savedMessages.getMessageTemplateInput().fill('something')
      savedMessages.getMessageTemplateInput().then(form.checkValidity).should('be.true')
    })
    //tests that the User/Admin/Manager can create a Message
    savedMessages.getCreateANewTemplateDrawer().within(() => {
      savedMessages.getMessageTitleInput().clear().fill('Welcome to Postal')
      savedMessages
        .getMessageTemplateInput()
        .clear()
        .fill(
          'So Glad you all could join the team! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        )
      savedMessages.getMessageTitleInput().then(form.checkValidity).should('be.true')
      savedMessages.getMessageTemplateInput().then(form.checkValidity).should('be.true')
      savedMessages.getCreateTemplateButton().click({ force: true })
    })
    savedMessages.getCreateANewTemplateDrawer().should('not.exist')
    //tests that the new Message Template info makes it to the messages page
    savedMessages.visitMessages()
    universal.getSpinner().should('not.exist')
    cy.contains(`You don't have any saved messages yet.`).should('not.exist')
    savedMessages.getMessageCardByTitle('Welcome to Postal').within(() => {
      cy.contains('So Glad you all could join the team! Lorem')
    })
    //tests that the close button works on the Create Message drawer
    savedMessages.getCreateMessageButton().click({ force: true })
    savedMessages.getCreateANewTemplateDrawer().within(() => {
      savedMessages.getMessageTitleInput().fill('Welcome to Catalog')
      savedMessages
        .getMessageTemplateInput()
        .fill('So glad you all could join the Major! Lorem ipsum.')
      universal.getCloseButtonByLabelText().click()
    })
    savedMessages.getMessageCardByTitle('Welcome to Catalog').should('not.exist')
    //tests that the close button works on the Create Message drawer
    savedMessages.getCreateMessageButton().click({ force: true })
    savedMessages.getCreateANewTemplateDrawer().within(() => {
      savedMessages.getMessageTitleInput().fill('closeTest')
      savedMessages.getMessageTemplateInput().fill("Testing that the close button doesn't save")
      universal.getCancelButton().click()
    })
    savedMessages.getMessageCardByTitle('closeTest').should('not.exist')
    //tests Expand/Collapse toggle
    savedMessages.getMessageCardByTitle('Welcome to Postal').within(() => {
      savedMessages.getExpandLink().click()
      cy.contains('deserunt mollit anim id est laborum.').should('be.visible')
      savedMessages.getCollapseLink().click()
      cy.contains('deserunt mollit anim id est laborum.').should('not.exist')
    })
    //tests that the info on message page makes it ito the edit form
    savedMessages.visitMessages()
    savedMessages.getMessageCardByTitle('ALERT ALERT').within(() => {
      savedMessages.getEditMessageButton().click()
    })
    savedMessages.getEditMessageDrawerByName('ALERT ALERT').within(() => {
      savedMessages.getMessageTitleInput().should('have.value', 'ALERT ALERT')
      savedMessages
        .getMessageTemplateInput()
        .should(
          'have.value',
          'BIG SALE TODAY! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        )
    })
    //tests that the edit form won't submit with empty fields
    savedMessages.getEditMessageDrawerByName('ALERT ALERT').within(() => {
      savedMessages.getMessageTitleInput().clear()
      savedMessages.getMessageTemplateInput().clear()
      savedMessages.getUpdateTemplateButton().click()
      savedMessages.getMessageTitleInput().then(form.checkValidity).should('be.false')
      savedMessages.getMessageTemplateInput().then(form.checkValidity).should('be.false')
    })
    //tests that the close button works on the Edit Message drawer
    savedMessages.getEditMessageDrawerByName('ALERT ALERT').within(() => {
      savedMessages.getMessageTitleInput().clear().fill('closeTestEdit')
      savedMessages
        .getMessageTemplateInput()
        .clear()
        .fill("Testing that the close button doesn't save on edit")
      universal.getCloseButtonByLabelText().click()
    })
    savedMessages.getMessageCardByTitle('closeTest').should('not.exist')
    //tests that the cancel button works on the Edit Message drawer
    savedMessages.getMessageCardByTitle('ALERT ALERT').within(() => {
      savedMessages.getEditMessageButton().click()
    })
    savedMessages.getEditMessageDrawerByName('ALERT ALERT').within(() => {
      savedMessages.getMessageTitleInput().clear().fill('closeTestEdit')
      savedMessages
        .getMessageTemplateInput()
        .clear()
        .fill("Testing that the close button doesn't save on edit")
      universal.getCancelButton().click()
    })
    savedMessages.getMessageCardByTitle('closeTestEdit').should('not.exist')
    //tests that a User/Admin/Manager can edit a saved message
    savedMessages.getMessageCardByTitle('Welcome to Postal').within(() => {
      savedMessages.getEditMessageButton().click()
    })
    savedMessages.getEditMessageDrawerByName('Welcome to Postal').within(() => {
      savedMessages.getMessageTitleInput().clear().fill('ALERT Updated!')
      savedMessages.getMessageTemplateInput().clear().fill('updated via automated testing!')
      savedMessages.getUpdateTemplateButton().click()
    })
    savedMessages
      .getMessageCardByTitle('ALERT Updated!')
      .should('exist')
      .within(() => {
        cy.contains('updated via automated testing!').should('exist')
      })
    //tests that new edited info makes it to the edit drawer
    savedMessages.getMessageCardByTitle('ALERT Updated!').within(() => {
      savedMessages.getEditMessageButton().click()
    })
    savedMessages.getEditMessageDrawerByName('ALERT Updated!').within(() => {
      savedMessages.getMessageTitleInput().should('have.value', 'ALERT Updated!')
      savedMessages.getMessageTemplateInput().should('have.value', 'updated via automated testing!')
      universal.getCancelButton().click()
    })
    //tests that the Delete modal renders as it should
    savedMessages.getMessageCardByTitle('TESTING').within(() => {
      savedMessages.getDeleteMessageButton().click()
    })
    savedMessages.getDeleteModal().within(() => {
      savedMessages.getDeleteModalText().should('exist')
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().should('exist')
    })
    //`tests that the Delete's cancel button works
    savedMessages.getDeleteModal().within(() => {
      universal.getCancelButton().click()
    })
    savedMessages.getMessageCardByTitle('TESTING').should('exist')
    //tests that the User/Admin/Manager can delete messages
    savedMessages.getMessageCardByTitle('ALERT Updated!').within(() => {
      savedMessages.getDeleteMessageButton().click()
    })
    savedMessages.getDeleteModal().within(() => {
      universal.getDeleteButton().click()
    })
    savedMessages.getTemplateRemovedAlert()
    savedMessages.getMessageCardByTitle('ALERT Updated!').should('not.exist')
    //tests that a user can't create a message with non-ascii characters
    savedMessages.getCreateMessageButton().click({ force: true })
    savedMessages.getCreateANewTemplateDrawer().within(() => {
      savedMessages
        .getMessageTitleInput()
        .clear()
        .fill('Ascii test')
        .then(form.checkValidity)
        .should('be.true')
      savedMessages
        .getMessageTemplateInput()
        .clear()
        .fill('Hællæ World, 🥳!')
        .then(form.checkValidity)
        .should('be.true')
      savedMessages.getCreateTemplateButton().click({ force: true })
    })
    savedMessages.getMessageCardByTitle('Ascii test').within(() => {
      cy.contains('Hællæ World, 🥳!').should('not.exist')
      cy.contains('Hll World, !').should('exist')
    })
    //tests that a user can't edit a message with non-ascii characters
    savedMessages.getMessageCardByTitle('Ascii test').within(() => {
      savedMessages.getEditMessageButton().click()
    })
    savedMessages.getEditMessageDrawerByName('Ascii test').within(() => {
      savedMessages.getMessageTemplateInput().clear().fill('I 🫀 emojis!!!')
      savedMessages.getUpdateTemplateButton().click()
    })
    savedMessages.getMessageCardByTitle('Ascii test').within(() => {
      cy.contains('I emojis!!!').should('exist')
      cy.contains('I 🫀 emojis!!!').should('not.exist')
    })
    //searches messages
    cy.findAllByTestId('ui-card').should('have.length.gte', 8)
    savedMessages.getSearchTemplateNameFilter().fill('First Meeting Request 2')
    cy.findAllByTestId('ui-card').should('have.length', 1)
    savedMessages.getMessageCardByTitle('First Meeting Request 2').should('be.visible')
    savedMessages.getSearchTemplateNameFilter().clear()
    cy.findAllByTestId('ui-card').should('have.length.gte', 8)
    savedMessages.getSearchTemplateBodyFilter().fill('RSVP at')
    cy.findAllByTestId('ui-card').should('have.length', 1)
    savedMessages.getMessageCardByTitle('Invite').should('be.visible')
    savedMessages.getSearchTemplateBodyFilter().clear()
    cy.findAllByTestId('ui-card').should('have.length.gte', 8)
  })
})
