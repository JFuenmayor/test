import { Marketplace, Universal } from '../../support/pageObjects'

export interface addVariantProps {
  postalName: string
  variantName: string
}

Cypress.Commands.add('addVariant', (args: addVariantProps) => {
  const marketplace = new Marketplace()
  const universal = new Universal()
  const postalName = args.postalName
  const variantName = args.variantName
  const log = Cypress.log({
    name: 'addVariant',
    displayName: 'Postal',
    message: [`📬 Updating | ${postalName}: adding a Variant`],
    autoEnd: false,
  })
  marketplace.visitMyItems()
  universal.getSpinner().should('not.exist')
  cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
  universal.getUISpinner().should('not.exist')
  cy.wait(300)
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Tolosa')) {
      cy.wait(3100)
      cy.reload()
    }
  })
  cy.contains('a', postalName).should('be.visible')
  cy.contains('a', postalName).click()
  cy.findAllByText(postalName).should('exist')
  marketplace.getEditButton().should('be.visible').click({ force: true })
  marketplace.getOptionByName(variantName).click({ force: true })
  marketplace.getUpdatePostalButton().click()
  marketplace.getItemUpdatedMessage()
  marketplace.getSendButton().should('be.visible')
  log.end()
})
