import { userFactory } from '../../support/factories'
import { EmailSettings, Profile, Universal } from '../../support/pageObjects'

describe('Email Settings: Email Templates Testings', function () {
  const user = userFactory()
  const emailSettings = new EmailSettings()
  const universal = new Universal()
  const profile = new Profile()

  before(() => {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests rendering Email Templates`, function () {
    emailSettings.visitEmailTemplates()
    profile.getEmailTemplatesLink().should('be.visible')
    cy.contains('Email Templates')
    // tests that Actions is disabled
    cy.contains('button', RegExp('Color Splash' + '|' + 'Default')).click()
    emailSettings.getColorSplashCard().within(() => {
      //tests that the 'selected' border shows up
      cy.get('svg').should('be.visible')
      //tests that the default image placeholder is present
      cy.get('iframe').should('exist')
      emailSettings.getSeeExampleButton().should('not.be.disabled').click({ force: true })
    })
    cy.findByRole('dialog').within(() => {
      const emails = [
        'Personalized Email',
        'Personalized Email - Expiring Tomorrow',
        'Address Refresh',
        'Electronic Gift Card Delivery',
        'Electronic Charity Card Delivery',
        'Event Invitation',
        'Event Invitation - Expiring Soon',
        'Reminder - Event is Today',
        'Reminder - Event is Tomorrow',
        'Event is Cancelled',
        'Registration Confirmed for Event',
        'Event Meeting Link Changed',
      ]
      emails.forEach((i) => {
        cy.contains('div', i)
          .parent('div')
          .within(() => {
            cy.get('iframe').its('length').should('eql', 1)
          })
      })
      universal.getCloseButtonByLabelText().click()
    })
    emailSettings.getSetBrandingLink().click()
    cy.url().should('include', '/account/branding')
    cy.findByText('Main Logo')
  })
})
