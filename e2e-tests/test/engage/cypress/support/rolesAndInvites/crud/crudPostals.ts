import { Marketplace, Universal } from '../../pageObjects'

export interface crudPostalsProps {
  postalName: string
  role: string
  team: string
}
Cypress.Commands.add('crudPostals', (args: crudPostalsProps) => {
  const universal = new Universal()
  const marketplace = new Marketplace()
  const postalName = args.postalName
  const role = args.role
  const team = args.team

  //Create
  marketplace.visitAllItems()
  marketplace.getPostcardButton().click()
  //console.log(cy.url())
  marketplace.getApproveThisButton().click()
  marketplace.getPostalNameInput().clear().fill(postalName)
  marketplace.getDisplayNameInput().clear().fill(postalName)
  marketplace.getPostalDescriptionInput().clear().fill(role)
  marketplace.getSavePostalButton().click({ force: true })
  marketplace.getApproveAnywayButton().click()
  cy.url().should('contain', '/items/postals')
  universal.getSpinner().should('not.exist')
  cy.getAlert({ message: 'Approved Item Created', close: 'close' })
  cy.findAllByText(postalName)
  cy.wait(1500)
  cy.contains('Ships on certain days').should('exist')
  marketplace.getEllipsesButton().eq(0).realClick()
  cy.wait(300)
  marketplace.getCloneActionItem().realClick()
  marketplace.getCloneItemModal().within(() => {
    marketplace.getCloneItemButton().trigger('click')
  })
  marketplace.getCloneItemModal().should('not.exist')
  marketplace.getItemClonedMessage()
  marketplace.getAvailableTeams().should('contain', team)
  // cy.queryForUpdateRecurse({
  //   request: SearchApprovedPostalsDocument,
  //   operationName: 'searchApprovedPostals',
  //   key: '0',
  //   value: `${postalName}-CLONE`,
  //   key2: 'name',
  // })
  //Edit
  universal.getSpinner().should('not.exist')
  cy.findByText(`${postalName}-CLONE`)
  marketplace.getEditButton().should('be.visible')
  marketplace.getEditButton().click({ force: true })
  cy.wait(500)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Back to Home')) {
      cy.wait(300)
      cy.reload()
      cy.wait(600)
    }
  })
  // cy.catchCallsRecurse({
  //   operationName: 'getBackgroundTaskById',
  //   key: 'successCount',
  //   value: 1,
  // })
  marketplace.getDisplayNameInput().clear().fill('Delete Me')
  marketplace.getPostalNameInput().clear().fill('Delete Me')
  marketplace.getPostalDescriptionInput().clear()
  marketplace.getPostalDescriptionInput().type('Delete this please')
  marketplace.getSetStatusToggle().scrollIntoView()
  marketplace.getSetStatusToggle().find('input').click({ force: true })
  marketplace
    .getPostalNameInput()
    .invoke('val')
    .then(($val) => {
      if ($val !== 'Delete Me') {
        marketplace.getPostalNameInput().clear().fill('Delete Me').and('have.value', 'Delete Me')
        marketplace.getSetStatusToggle().then(($status) => {
          if ($status.text().includes('Draft')) {
            marketplace
              .getSetStatusToggle()
              .scrollIntoView()
              .find('input')
              .click({ force: true })
              .should('be.checked')
          }
        })
      }
    })
  marketplace.getUpdatePostalButton().scrollIntoView().click({ force: true })
  // cy.queryForUpdateRecurse({
  //   request: SearchApprovedPostalsDocument,
  //   operationName: 'searchApprovedPostals',
  //   key: '0',
  //   value: 'Delete Me',
  //   key2: 'name',
  // })
  cy.wait(800)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Back to Home')) {
      cy.wait(300)
      cy.reload()
      cy.wait(600)
    }
  })
  cy.findAllByText('Delete Me')
  //cy.findByText(`${postalName}-CLONE`)
  marketplace.getMyItemsHeaderButton().click({ force: true })
  cy.wait(900)
  cy.url().should('not.include', '/items/postals/')
  cy.url().should('include', '/items/postals')

  //Delete
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Delete Me')) {
      cy.wait(4100)
      cy.reload()
    }
  })
  cy.get('body').then(($body) => {
    if ($body.text().includes('Back to Home')) {
      cy.wait(200)
      cy.reload()
      cy.wait(600)
    }
  })
  cy.contains('a', 'Delete Me').click()
  universal.getSpinner().should('not.exist')
  cy.findAllByText('Delete Me').should('be.visible')
  cy.wait(1300)
  cy.contains('Ships on certain days').should('exist')
  cy.wait(500)
  marketplace.getEllipsesButton().eq(0).realClick()
  cy.wait(300)
  marketplace.getDeleteActionItem().realClick()
  marketplace
    .getDeleteItemModal()
    .should('be.visible')
    .within(() => {
      marketplace.getDeleteButton().click({ force: true })
    })
  marketplace.getItemDeletedMessage()
  cy.url().should('eq', `${Cypress.config().baseUrl}/items/postals`)
  universal.getUISpinner().should('not.exist')
  cy.wait(300)
  // this uses deleteApprovedPostalAndAllAutomations which is a bg task
  cy.get('body').then(($body) => {
    if ($body.text().includes('Delete Me')) {
      cy.wait(61000)
      cy.reload()
    }
  })
  marketplace.getNewPostalByName(postalName).should('be.visible')
  marketplace.getNewPostalByName(`Delete Me`).should('not.exist')
})
