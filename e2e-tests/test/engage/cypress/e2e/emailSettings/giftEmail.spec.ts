import { userFactory } from '../../support/factories'
import { EmailSettings, Profile } from '../../support/pageObjects'

describe('Email Settings: Gift Email Settings', function () {
  const user = userFactory()
  const emailSettings = new EmailSettings()
  const profile = new Profile()

  it(`tests rendering in Gift Email Settings`, () => {
    cy.signup(user)
    cy.login(user)
    emailSettings.visitGiftEmails()
    cy.findAllByLabelText('Close', { timeout: 240000 }).click()
    profile.getGiftEmailsLink().should('be.visible')
    // tests that Actions is disabled
    emailSettings
      .getEnableGiftEmailsGroup()
      .should('be.visible')
      .within(() => {
        //finding the svg confirms the button is checked.
        emailSettings.getDefaultOnButton().should('contain.html', 'svg')
        emailSettings.getAlwaysButton().should('not.contain.html', 'svg')
        emailSettings.getDefaultOffButton().should('not.contain.html', 'svg')
        emailSettings
          .getNeverButton()
          .should('not.contain.html', 'svg')
          .find('input')
          .click({ force: true })
        emailSettings.getNeverButton().should('contain.html', 'svg')
        emailSettings.getDefaultOffButton().should('not.contain.html', 'svg')
        emailSettings.getDefaultOnButton().should('not.contain.html', 'svg')
        emailSettings
          .getAlwaysButton()
          .should('not.contain.html', 'svg')
          .find('input')
          .click({ force: true })
        emailSettings.getAlwaysButton().should('contain.html', 'svg')
        emailSettings.getDefaultOnButton().should('not.contain.html', 'svg')
        emailSettings.getNeverButton().should('not.contain.html', 'svg')
        emailSettings.getDefaultOffButton().should('not.contain.html', 'svg')
        emailSettings.getDefaultOffButton().find('input').click({ force: true })
        emailSettings.getDefaultOffButton().should('contain.html', 'svg')
        emailSettings.getAlwaysButton().should('not.contain.html', 'svg')
        emailSettings.getNeverButton().should('not.contain.html', 'svg')
        emailSettings
          .getDefaultOnButton()
          .should('not.contain.html', 'svg')
          .find('input')
          .click({ force: true })
        emailSettings.getDefaultOnButton().should('contain.html', 'svg')
      })
    emailSettings.getNeverButton().click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    emailSettings.getIfNoResponseGroup().within(() => {
      emailSettings.getSendAnywaysButton().should('not.contain.html', 'svg')
      emailSettings.getSendAnywaysButton().find('input').should('be.disabled')
      emailSettings
        .getCancelOrderButton()
        .should('contain.html', 'svg')
        .find('input')
        .should('be.disabled')
    })
    emailSettings.getAlwaysButton().find('input').click({ force: true })
    emailSettings.getIfNoResponseGroup().within(() => {
      emailSettings
        .getCancelOrderButton()
        .find('input')
        .should('not.be.disabled')
        .click({ force: true })
      emailSettings.getCancelOrderButton().and('contain.html', 'svg')
      emailSettings
        .getSendAnywaysButton()
        .should('not.contain.html', 'svg')
        .find('input')
        .should('not.be.disabled')
        .click({ force: true })
      emailSettings.getSendAnywaysButton().and('contain.html', 'svg')
    })
    emailSettings.getNeverButton().click({ force: true })
    emailSettings
      .getRespTimeLimitGroup()
      .scrollIntoView()
      .within(() => {
        emailSettings.getEmailDays().should('be.disabled')
      })
    emailSettings.getAlwaysButton().find('input').click({ force: true })
    emailSettings.getSettingsUpdatedAlert()
    emailSettings.getRespTimeLimitGroup().within(() => {
      emailSettings.getEmailDays().should('not.be.disabled').should('have.value', '7').select('3')
    })
    //emailSettings.getSettingsUpdatedAlert()
    emailSettings.getRespTimeLimitGroup().within(() => {
      emailSettings.getEmailDays().should('not.be.disabled').should('have.value', '3')
    })
    cy.wait(1700)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Settings updated')) {
        cy.contains('[role="status"]', 'Settings updated', { timeout: 99000 })
        cy.findAllByLabelText('Close', { timeout: 240000 }).click({
          force: true,
          multiple: true,
        })
      }
    })
    emailSettings.getGiftEmailTooltip().realHover()
    emailSettings.getGiftEmailTooltipText().should('be.visible')
  })
})
