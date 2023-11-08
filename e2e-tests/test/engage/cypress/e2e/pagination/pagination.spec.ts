import { userFactory } from '../../support/factories'
import { Contacts, Marketplace, Universal } from '../../support/pageObjects'

describe('Pagination test suite', () => {
  const user = userFactory()
  const marketplace = new Marketplace()
  const universal = new Universal()
  const contacts = new Contacts()

  before(() => {
    cy.signup(user)
    cy.contactsSeed(1)
    Cypress.on('uncaught:exception', () => {
      return false
    })
  })

  beforeEach(() => {
    cy.login(user)
  })

  it('tests pagination on the /items/marketplace/ page', () => {
    cy.graphqlMockSet({
      operationName: 'marketplaceSearch',
      fixture: 'marketplaceSearch1.json',
      count: 10,
    })
    cy.graphqlMockStart()
    marketplace.visitAllItems()
    marketplace.getAllItems().should('have.length', 51)
    marketplace.getNewPostalByName('End of Mock A').scrollIntoView()
    cy.graphqlMockSet({
      operationName: 'marketplaceSearch',
      fixture: 'marketplaceSearch2.json',
      count: 10,
    })
    universal.getPagesPaginationButton().should('contain', '1 / 6')
    universal.getRightButton().click()
    marketplace.getNewPostalByName('Start of Mock B').should('exist')
    marketplace.getAllItems().should('have.length', 51)
    cy.graphqlMockClear()
  })
  it('tests pagination on the /items/postals/ page', () => {
    cy.graphqlMockSet({
      operationName: 'marketplaceSearch',
      fixture: 'marketplaceSearch1.json',
      count: 10,
    })
    cy.graphqlMockStart()
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    marketplace.getAllViewThisItemButtons().should('have.length', 50)
    cy.graphqlMockClear()
    marketplace.getNewPostalByName('End of Mock A').scrollIntoView()
    cy.graphqlMockSet({
      operationName: 'marketplaceSearch',
      fixture: 'marketplaceSearch2.json',
      count: 10,
    })
    marketplace.getNewPostalByName('Start of Mock B')
    marketplace.getAllViewThisItemButtons().should('have.length', 50)
    cy.graphqlMockClear()
  })
  it(`tests pagaination on the 'send postal' page`, () => {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.clickCheckboxByRowNumber({ num: 0 })
    cy.graphqlMockSet({
      operationName: 'marketplaceSearch',
      fixture: 'marketplaceSearch1.json',
      count: 10,
    })
    cy.graphqlMockStart()
    contacts.getSendItemButton().click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('End of Mock A').scrollIntoView()
    marketplace.getNewPostalByName('End of Mock A').should('be.visible')
    marketplace.getAllItems().should('have.length', 50)
    cy.graphqlMockClear()
    cy.graphqlMockSet({
      operationName: 'marketplaceSearch',
      fixture: 'marketplaceSearch2.json',
      count: 10,
    })
    universal.getPagesPaginationButton().should('contain', '1 / 6')
    universal.getRightButton().click()
    marketplace.getNewPostalByName('Start of Mock B').should('exist')
    marketplace.getAllItems().should('have.length', 50)
    cy.graphqlMockClear()
  })
})
//todo: when the feature is merged double check that the mock handles large amounts of products in sandbox like it does above
