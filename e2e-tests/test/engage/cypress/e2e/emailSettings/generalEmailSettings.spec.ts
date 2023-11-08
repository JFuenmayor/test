import { userFactory } from '../../support/factories'
import { EmailSettings, Universal } from '../../support/pageObjects'

describe('Email Settings: General Testing', function () {
  const user = userFactory()
  const emailSettings = new EmailSettings()
  const universal = new Universal()

  beforeEach(() => {
    cy.signup(user)
    cy.createAContact({ emailAddress: 'mm@postal.dev' })
    cy.login(user)
  })

  it(`tests rendering in General`, () => {
    // only tests the rendering of the ui cards, tooltips, clicking of buttons/toggles
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getFunds') {
        req.alias = 'getFunds'
      }
    })
    emailSettings.visitEmailSettings()
    cy.wait('@getFunds')
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    emailSettings
      .getEmailSettingsLink()
      .should('be.visible')
      .and('have.attr', 'aria-current', 'page')
    universal.getSpinner().should('not.exist')

    // tests the tooltips
    cy.wait(3000)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Setting Updated')) {
        cy.contains('[role="status"]', 'Setting Updated', { timeout: 99000 }).within(() => {
          cy.findByLabelText('Close', { timeout: 240000 }).click({
            force: true,
            multiple: true,
          })
        })
      }
    })
    cy.wait(4000)
    emailSettings.getRecipientInformationTooltip().realHover()
    emailSettings.getRecipientInformationTooltipText().should('be.visible')
    //tests Recipient Information Download button
    emailSettings.getRecipientInformationCard().within(() => {
      emailSettings.getUnsubscribedText().should('exist')
      emailSettings.getUnsuscribedDatePicker().should('exist')
      emailSettings.getDownloadButton().click()
    })
    emailSettings.getDownloadingAlert()
    //tests unsuscribing a contact
    emailSettings.getUnsuscibeContactInput().should('exist')
    emailSettings.getSubmitButton().click()
    emailSettings.getUnsubscribeModal().within(() => {
      emailSettings.getUnsuscribeModalText().should('exist')
      universal.getCancelButton().should('exist')
      universal.getRemoveButton().click()
    })
    emailSettings.getValidEmailAlert()
    universal.getCancelButton().click()
    emailSettings.getUnsubscribeModal().should('not.exist')
    emailSettings.getUnsuscibeContactInput().type('mm@postal.dev')
    emailSettings.getSubmitButton().click()
    emailSettings.getUnsubscribeModal().within(() => {
      cy.wait(100)
      universal.getRemoveButton().should('be.visible').click({ force: true })
    })
    cy.wait(3000)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Contact unsubscribed.')) {
        cy.getAlert({ message: 'Contact unsubscribed.', close: 'close' })
      }
    })
    emailSettings.getUnsuscibeContactInput().fill('mm@postal.dev')
    emailSettings.getSubmitButton().click()
    emailSettings.getUnsubscribeModal().within(() => {
      universal.getRemoveButton().click()
    })
    emailSettings.getEmailNotFoundAlert()
  })
})
