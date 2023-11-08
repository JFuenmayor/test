import { userFactory } from '../../support/factories'
import { Universal } from '../../support/pageObjects'

describe('Integrations Testing', function () {
  const user = userFactory()
  const universal = new Universal()

  before(() => {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests rendering in Integrations`, function () {
    // only tests the rendering of the ui cards, images, and buttons of the integrations
    // doesn't attempt to click an integration and import anything from those services
    // that probably can't be mocked since an api isn't being called
    visitIntegrations()
    getIntegrationsLink().should('be.visible').and('have.attr', 'aria-current', 'page')
    universal.getSpinner().should('not.exist')
    //plus one added for the child below so the loop gets all 9 of them
    const numOfIntegrations = 9 + 1
    for (let i = 1; i < numOfIntegrations; i++) {
      cy.get(`:nth-child(${i}) > [data-testid="ui-card"]`).within(() => {
        getSvg().its('length').should('gte', 3)
        cy.findByRole('button', { name: 'Configure' }).should('not.be.disabled')
        cy.contains('Not Connected').should('exist')
      })
    }
    getAllIntegrationCards()
      .its('length')
      .should('eql', numOfIntegrations - 1)
  })
})

function visitIntegrations() {
  return cy.visit('/integrations')
}
function getIntegrationsLink() {
  return cy.contains('a', 'Integrations')
}
function getSvg() {
  return cy.get('svg')
}
function getAllIntegrationCards() {
  return cy.findAllByTestId('ui-card')
}
