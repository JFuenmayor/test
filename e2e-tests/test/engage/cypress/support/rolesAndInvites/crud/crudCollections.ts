import { Collections, Marketplace, Universal } from '../../pageObjects'

export interface crudCollectionsProps {
  collectionName: string
  userRole: 'user' | 'admin' | 'teamAdmin'
}
const marketplace = new Marketplace()
const universal = new Universal()
const collections = new Collections()

Cypress.Commands.add('crudCollections', (args: crudCollectionsProps) => {
  const collectionName = args.collectionName
  const userRole = args.userRole
  //Creates a Collection
  collections.getNameCollectionInput().should('be.visible').fill(collectionName)
  cy.contains('div', 'USD').click()
  collections.getSelectAnItemsButton().click()
  universal.getUISpinner().should('not.exist')
  cy.contains('a', 'Chipotle').click({ force: true })
  if (userRole === 'user') {
    marketplace.getAllItemsTab().should('not.exist')
    marketplace.getMyItemsTab().should('not.exist')
  } else if (userRole === 'admin') {
    marketplace.getAllItemsTab().should('exist').and('have.attr', 'aria-selected', 'true')
    marketplace.getMyItemsTab().should('exist').and('have.attr', 'aria-selected', 'false')
  }
  collections.getSelectOptionsButton().click()
  universal.getSpinner().should('not.exist')
  collections.getSelectedVariantOptionByName('$10').should('be.visible')
  cy.contains('button', 'Create Collection').should('not.be.disabled').click()
  collections.getCollectionCreatedAlert()
  universal.getSpinner().should('not.exist')
  //Edits a collection
  collections.getEnableThisCollectionButton().click()
  //collections.getCollectionStatsSidebarByStatus('Enabled').should('exist')
  collections.getEditThisCollectionButton().click({ force: true })
  collections.getCollectionEditDrawerByName('Collection Settings').within(() => {
    collections
      .getEditCollectionNameInput()
      .should('have.value', collectionName)
      .clear()
      .fill(`${collectionName}Edited`)
    universal.getCancelButton().should('exist')
    universal.getSaveButton().click({ force: true })
  })
  collections.getCollectionUpdatedAlert()
  collections.getCollectionEditDrawerByName('Collection Settings').should('not.exist')
  collections.getCollectionNavCenterByName(`${collectionName}Edited`)
  collections.getBackToCollectionsButton().click()
  //Clones a collection
  universal.getSpinner().should('not.exist')
  cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
  universal.getUISpinner().should('not.exist')
  cy.wait(600)
  cy.get('body').then(($body) => {
    if (!$body.text().includes(`Show My Collections`)) {
      cy.wait(3200)
      cy.reload()
      cy.wait(600)
    }
  })
  collections.getShowTeamCollectionsCheckbox().check({ force: true })
  cy.wait(300)
  cy.get('body').then(($body) => {
    if (!$body.text().includes(`${collectionName}Edited`)) {
      cy.wait(3200)
      cy.reload()
      collections.getShowTeamCollectionsCheckbox().check({ force: true })
    }
  })
  collections.getCollectionByName(`${collectionName}Edited`).should('exist').realHover()
  collections.getCollectionByName(`${collectionName}Edited`).within(() => {
    collections.getViewCollectionButton().should('be.visible').click()
  })
  marketplace.getEllipsesButton().eq(0).trigger('click', { force: true })
  collections.getCloneCollectionMenuItem().click()
  collections.getCloneCollectionModal().within(() => {
    collections.getCloneCollectionButton().click()
  })
  cy.contains('[role="status"]', 'Collection Cloned', { timeout: 99000 }).within(() => {
    cy.findByLabelText('Close', { timeout: 99000 }).click({
      force: true,
      multiple: true,
    })
  })
  collections.getCloneCollectionModal().should('not.exist')
  cy.contains(`Copy - ${collectionName}Edited`)
  collections.getEnableThisCollectionButton().should('be.visible')
})
