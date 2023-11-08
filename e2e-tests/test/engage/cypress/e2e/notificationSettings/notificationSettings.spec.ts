import { userFactory } from '../../support/factories'
import { EmailSettings, Universal } from '../../support/pageObjects'

describe('Email Settings: Notifications Testing', function () {
  const emailSettings = new EmailSettings()
  const universal = new Universal()

  it(`tests rendering in Notifications`, () => {
    const user = userFactory()
    cy.signup(user)
    cy.createAContact({ emailAddress: 'mm@postal.dev' })
    // only tests the rendering of the ui cards, tooltips, clicking of buttons/toggles,
    // and input and saving of form fields
    // doesn't attempt to confirm that any emails are sent in accordance with these settings
    // the email server is not currently part of the test.postal.dev envirnoment.
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getFunds') {
        req.alias = 'getFunds'
      }
    })

    emailSettings.visitNotificationSettings()
    cy.wait('@getFunds')
    universal.getSpinner().should('not.exist')
    emailSettings
      .getNotificationSettingsLink()
      .should('be.visible')
      .and('have.attr', 'aria-current', 'page')
    universal.getSpinner().should('not.exist')
    emailSettings.getNotificationSettingsLink().should('be.visible')
    // tests the thresholds' input fields
    cy.contains('General').should('be.visible')
    cy.contains('Set budget thresholds here >').click()
    emailSettings
      .getBudgetLowThresholdInput()
      .should('have.value', '500')
      .clear()
      .type('300{enter}')
    emailSettings.getBudgetLowThresholdInput().and('have.value', '300')
    emailSettings.getSettingsUpdatedAlert()
    universal.getResetButton().should('not.exist')
    emailSettings.getNotificationThresholdsCard().within(() => {
      emailSettings.getBalancetLowThresholdInput().should('have.value', '500')
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Settings updated')) {
        cy.contains('[role="status"]', 'Settings updated', { timeout: 99000 }).within(() => {
          cy.findByLabelText('Close', { timeout: 240000 }).click({
            force: true,
            multiple: true,
          })
        })
      }
    })
    cy.contains('Set budget thresholds here >').click()
    emailSettings.getNotificationThresholdsCard().within(() => {
      emailSettings.getBalancetLowThresholdInput().clear()
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Settings updated')) {
        cy.contains('[role="status"]', 'Settings updated', { timeout: 99000 }).within(() => {
          cy.findByLabelText('Close', { timeout: 240000 }).click({
            force: true,
            multiple: true,
          })
        })
      }
    })
    cy.wait(300)
    emailSettings.getNotificationThresholdsCard().within(() => {
      emailSettings.getBalancetLowThresholdInput().type('600', { delay: 20 })
      universal.getCancelButton().click()
      cy.wait(300)
    })
    cy.contains('Set balance thresholds here >').click()
    emailSettings.getNotificationThresholdsCard().within(() => {
      emailSettings.getBalancetLowThresholdInput().should('have.value', '600').clear().type('700')
      universal.getSaveButton().should('be.visible').click()
    })
    emailSettings.getSettingsUpdatedAlert()
    universal.getSaveButton().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('Set balance thresholds here >').click()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    emailSettings.getBalancetLowThresholdInput().should('have.value', '700')
    universal.getCancelButton().click()
    universal.getCancelButton().should('not.exist')
    cy.wait(400)
    //test toggles Notifications card
    emailSettings
      .getGiftEmailAcceptanceToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    emailSettings.getGiftEmailAcceptanceToggle().should('not.be.checked')
    emailSettings
      .getMagicLinkAcceptanceToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    emailSettings.getMagicLinkAcceptanceToggle().should('not.be.checked')
    emailSettings
      .getAutoReloadFailuresToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    emailSettings.getAutoReloadFailuresToggle().should('not.be.checked')
    emailSettings
      .getOrderIssuesToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    emailSettings.getOrderIssuesToggle().should('not.be.checked')
    emailSettings
      .getBalanceLowToggle()
      .should('not.be.checked')
      .and('not.be.disabled')
      .check({ force: true })
    emailSettings.getBalanceLowToggle().should('be.checked')
    emailSettings
      .getBudgetLowToggle()
      .should('not.be.checked')
      .and('not.be.disabled')
      .check({ force: true })
    emailSettings.getBudgetLowToggle().should('be.checked')
    emailSettings
      .getOrderDeliveredToggle()
      .should('not.be.checked')
      .and('not.be.disabled')
      .check({ force: true })
    emailSettings.getOrderDeliveredToggle().should('be.checked')

    // tests the tooltips
    cy.wait(4000)
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
    emailSettings.getOrderIssuesTooltip().realHover()
    emailSettings.getOrderIssuesTooltipText().should('be.visible')
    //test the Notification Summary Email card
    cy.contains('Notification Summary Email').click()
    cy.wait(500)
    cy.url().should('contain', '/notifications/summary')
    emailSettings.getFrequencySelect().select('NEVER')
    emailSettings.getProcessingErrorsToggle().should('be.checked')
    emailSettings.getMagicLinkApprovalsToggle().should('be.checked')
    emailSettings.getNewItemToggle().should('be.checked')
    emailSettings.getNewEventToggle().should('be.checked')
    emailSettings.getNewCollectionToggle().should('be.checked')
    emailSettings.getItemRemovedToggle().and('be.checked')
    emailSettings.getFrequencySelect().select('DAILY')
    emailSettings.getProcessingErrorsToggle().should('be.checked')
    emailSettings.getMagicLinkApprovalsToggle().should('be.checked')
    emailSettings.getNewItemToggle().should('be.checked')
    emailSettings.getNewEventToggle().should('be.checked')
    emailSettings.getNewCollectionToggle().should('be.checked')
    emailSettings.getItemRemovedToggle().and('be.checked')
    emailSettings.getFrequencySelect().select('NEVER')
    emailSettings.getProcessingErrorsToggle().should('be.checked')
    emailSettings.getMagicLinkApprovalsToggle().should('be.checked')
    emailSettings.getNewItemToggle().should('be.checked')
    emailSettings.getNewEventToggle().should('be.checked')
    emailSettings.getNewCollectionToggle().should('be.checked')
    emailSettings.getItemRemovedToggle().should('be.checked')
    emailSettings.getFrequencySelect().select('WEEKLY')
    emailSettings.getProcessingErrorsToggle().should('be.checked')
    emailSettings.getMagicLinkApprovalsToggle().should('be.checked')
    emailSettings.getItemRemovedToggle().and('be.checked')
    emailSettings.getNewItemToggle().should('be.checked')
    emailSettings.getNewEventToggle().should('be.checked')
    emailSettings.getNewCollectionToggle().should('be.checked')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'me') {
        req.alias = 'me'
      }
      if (req.body.operationName === 'updateSelf') {
        req.alias = 'updateSelf'
      }
    })
    cy.wait(400)
    emailSettings.getProcessingErrorsToggle().should('be.checked').and('not.be.disabled')
    emailSettings.getProcessingErrorsToggle().uncheck({ force: true })
    cy.wait('@updateSelf')
    cy.wait(1000)
    emailSettings.getProcessingErrorsToggle().should('not.be.checked')

    emailSettings
      .getMagicLinkApprovalsToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    cy.wait('@updateSelf')
    cy.wait(1000)
    emailSettings.getMagicLinkApprovalsToggle().should('not.be.checked')

    cy.contains('New Approvals').should('exist')
    cy.wait(1000)
    emailSettings
      .getNewItemToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    cy.wait('@updateSelf')
    cy.wait(1000)
    emailSettings.getNewItemToggle().should('not.be.checked')
    emailSettings
      .getNewEventToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    cy.wait('@updateSelf')
    emailSettings.getNewEventToggle().should('not.be.checked')
    emailSettings
      .getNewCollectionToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    cy.wait('@updateSelf')
    emailSettings.getNewCollectionToggle().should('not.be.checked')
    emailSettings
      .getItemRemovedToggle()
      .should('be.checked')
      .and('not.be.disabled')
      .uncheck({ force: true })
    cy.wait('@updateSelf')
    emailSettings.getItemRemovedToggle().and('not.be.checked')
  })
})
