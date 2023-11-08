import { userFactory } from '../../support/factories'
import { Contacts, Universal } from '../../support/pageObjects'

describe('Customize Contacts Table Options', function () {
  const contacts = new Contacts()
  const universal = new Universal()
  const user = userFactory()

  before(() => {
    cy.signup(user)
    cy.contactsSeed(5)
  })

  it('tests the customize contacts table options', function () {
    //tests unchecking all the options and that the table re-renders as it should
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.url().should('include', '/contacts')
    universal.getTableHeader().should('have.text', 'NameEmailTitleCompanyCreated')
    universal.getNoItemsMessage().should('not.exist')
    getCustomizeTableButton().click({ force: true })
    getCustomizeTableDrawer().within(() => {
      getNameToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getEmailToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getTitleToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getCompanyToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getCreatedToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getLastSendToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getAddressVerifiedToggle()
        .should('be.checked')
        .click({ force: true })
        .should('not.be.checked')
      getItemsToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getCampaignsToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      getTagsToggle().should('be.checked').click({ force: true }).should('not.be.checked')
      universal.getCloseButtonByLabelText().click()
      cy.wait(500)
    })
    universal.getTableHeader().should('not.contain', 'NameEmailTitleCompanyCreated')
    getCustomizeTableButton().click({ force: true })
    getCustomizeTableDrawer().within(() => {
      getNameToggle().should('not.be.checked').click({ force: true }).should('be.checked')
      getEmailToggle().should('not.be.checked').click({ force: true }).should('be.checked')
      getTitleToggle().should('not.be.checked').click({ force: true }).should('be.checked')
    })
    universal.getTableHeader().should('contain', 'NameEmailTitle')
    //tests moving columns
    getCustomizeTableDrawer().within(() => {
      cy.findAllByLabelText('Move Item').parent('div').eq(1).keyboardMoveBy(10, 'up')
    })
    universal.getTableHeader().should('contain', 'EmailNameTitle')
  })
})

function getCustomizeTableDrawer() {
  return cy.findByRole('dialog', { name: 'Customize Table' })
}
function getCustomizeTableButton() {
  return cy.findByRole('button', { name: 'Customize Table' })
}
function getNameToggle() {
  return cy.contains('div', 'Name').find('input')
}
function getEmailToggle() {
  return cy.contains('div', 'Email').find('input')
}
function getTitleToggle() {
  return cy.contains('div', 'Title').find('input')
}
function getCompanyToggle() {
  return cy.contains('div', 'Company').find('input')
}
function getCreatedToggle() {
  return cy.contains('div', 'Created').find('input')
}
function getLastSendToggle() {
  return cy.contains('div', 'Last Send').find('input')
}
function getAddressVerifiedToggle() {
  return cy.contains('div', 'Verified').find('input')
}
function getItemsToggle() {
  return cy.contains('div', 'Items').find('input')
}
function getCampaignsToggle() {
  return cy.contains('div', 'Campaigns').find('input')
}
function getTagsToggle() {
  return cy.contains('div', 'Tags').find('input')
}
