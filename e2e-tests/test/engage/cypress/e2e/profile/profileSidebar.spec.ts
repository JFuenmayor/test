import { userFactory } from '../../support/factories'
import { Contacts, Navbar, Profile, Universal } from '../../support/pageObjects'

describe('Profile testing', function () {
  const contacts = new Contacts()
  const navbar = new Navbar()
  const universal = new Universal()
  const profile = new Profile()
  const user = userFactory()
  const today = new Date()
  const dateFormatTable = (date: Date) => date.toLocaleDateString()
  const truncatedCompany = user.company.slice(0, 20)

  before(function () {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`Profile Sidebar, empty You Page, and profile navbar element testing`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    //tests navigating to the user profile page
    navbar.getProfileMenuButton().should('be.visible').click()
    cy.findByRole('menu')
      .should('exist')
      .within(() => {
        cy.contains(`${user.firstName} ${user.lastName} (Admin)`)
        cy.contains(truncatedCompany).should('exist')
        navbar.getSwitchAccountMenuItem().should('not.exist')
        navbar.getHelpMenuItem().should('exist')
        navbar.getLogoutMenuItem().should('exist')
        navbar.getProfileMenuItem().click({ force: true })
      })
    cy.url().should('contain', 'profile')
    //tests that the profile side bar renders appropriately
    profile.getProfileSettingsHeading().should('be.visible')
    profile.getYouLink().should('exist')
    profile.getUsersLink().should('exist')
    profile.getTeamsLink().should('exist')
    profile.getTeamLink().should('not.exist')
    profile.getBrandingLink().should('exist')
    profile.getIntegrationsLink().should('exist')
    profile.getBillingLink().should('exist').click()
    universal.getSpinner().should('not.exist')
    profile.getFundsLink().should('exist')
    profile.getAccountsLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    profile.getAccountSettingsLink().should('exist').click()

    universal.getSpinner().should('not.exist')
    profile.getFundsLink().should('not.exist')
    profile.getAccountsLink().should('not.exist')
    profile.getAccountSettingsLink().should('exist')
    profile.getSavedMessagesLink().should('exist')
    profile.getEmailSettingsLink().should('exist').click()
    universal.getSpinner().should('not.exist')
    profile.getNotificationsLink().should('exist')
    profile.getGiftEmailsLink().should('exist')
    profile.getEmailTemplatesLink().should('exist')
    profile.getEmailBlocklistLink().should('exist')
    profile.getMeetingSettingsLink().should('exist')
    profile.getWarehousingLink().should('exist')

    //tests that the profile page renders appropriately
    profile.getYouLink().click()
    universal.getSpinner().should('not.exist')
    profile.getYouDetailsCardByName(`${user.firstName} ${user.lastName}`).within(() => {
      profile.getYouEmail().should('contain', user.userName)
      profile.getYouTitle().should('not.exist')
      profile.getYouPhone().should('not.exist')
      profile.getYouMeetingLink().should('not.exist')
    })
    profile.getTeamsCard().within(() => {
      universal.getTableHeader().should('have.text', universal.teamsTableHeaderText())
      universal.getRowByText(truncatedCompany).within(() => {
        cy.findByText('Active')
        cy.findByText(dateFormatTable(today))
        cy.findByText('User, Manager, Admin')
      })
    })
    profile.getCampaignsCard().should('not.exist')
    cy.intercept(`/engage/api/oath-preconnect/google_email?*`, 'ok').as('google')
    profile.getEmailIntegrationCard().within(() => {
      profile.getAllDisabledButtons().should('have.length', 2).eq(0).click()
    })
    cy.wait('@google').then((resp) => {
      expect(resp.response?.body).to.include('ok')
    })
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if ($body.text().includes('System Error')) {
        cy.contains('button', 'Reset Page').click()
      }
    })
    cy.intercept(`/engage/api/oath-preconnect/microsoft_email?*`, 'ok').as('microsoft')
    profile.getEmailIntegrationCard().within(() => {
      profile.getAllDisabledButtons().should('have.length', 2).eq(1).click()
    })
    cy.wait('@microsoft').then((resp) => {
      expect(resp.response?.body).to.include('ok')
    })
    // profile.visitProfile()
    // universal.getSpinner().should('not.exist')
    // cy.get('body').then(($body) => {
    //   if ($body.text().includes('System Error')) {
    //     cy.contains('button', 'Reset Page').click()
    //   }
    // })
    // universal.getSpinner().should('not.exist')
    cy.findByTestId('UserEmailIntegration_button_Microsoft')
      .should('exist')
      .and('not.have.attr', 'data-loading')
    profile
      .getEmailIntegrationCard()
      .should('be.visible')
      .within(() => {
        profile.getEmailIntegrationTooltip().realHover()
      })
    profile.getEmailIntegrationTooltipText().should('be.visible')
    profile.getStatsHeading().should('be.visible')
    profile.getStatsCard().within(() => {
      profile.getStatsHeading().should('be.visible')
      profile.getStatsRangeIndicator().should('not.exist')
      profile.getDateAddedStat().should('contain', dateFormatTable(today))
      profile.getItemsStat().should('contain', '0')
      profile.getCPTStat().should('not.exist')
    })

    //tests the sidebar toggle button
    universal.getSideBarToggle().should('not.exist')

    //tests Users & Teams Link
    profile.getYouLink().should('have.attr', 'aria-current', 'page')
    profile.getUsersLink().should('not.have.attr', 'aria-current')
    profile.getUsersLink().click({ force: true })
    profile.getUsersLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'users/active')

    //tests the sidebar's 'Branding/ link
    profile.getBrandingLink().should('not.have.attr', 'aria-current')
    profile.getBrandingLink().click()
    profile.getBrandingLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'account/branding')

    //tests the sidebar's 'Integration' link
    profile.getIntegrationsLink().should('not.have.attr', 'aria-current')
    profile.getIntegrationsLink().click({ force: true })
    profile.getIntegrationsLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'integrations')

    //tests the sidebar's 'Billing' link and its sublinks
    profile.getBillingLink().should('not.have.attr', 'aria-current')
    profile.getBillingLink().click()
    profile.getBillingLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'billing/accounts')
    profile.getAccountsLink().should('be.visible')

    profile.getFundsLink().should('not.have.attr', 'aria-current')
    profile.getFundsLink().click()
    profile.getFundsLink().should('be.visible')
    cy.url().should('contain', 'billing/funds')
    universal.getSpinner().should('not.exist')

    profile.getTransfersLink().should('be.visible').and('not.have.attr', 'aria-current')
    profile.getTransfersLink().click()
    profile.getTransfersLink().should('be.visible')
    cy.url().should('contain', 'billing/transfers')
    universal.getSpinner().should('not.exist')

    //tests Budget History Link
    profile.getBudgetHistoryLink().should('not.have.attr', 'aria-current')
    profile.getBudgetHistoryLink().click()
    profile.getBudgetHistoryLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'budget/history')

    //tests the sidebar's 'Account Setting' link and its sublinks
    profile.getAccountSettingsLink().should('not.have.attr', 'aria-current')
    profile.getAccountSettingsLink().click()
    profile.getAccountSettingsLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'account/info')
    profile.getAccountSettingsLink().should('have.attr', 'aria-current', 'page')
    profile.getSavedMessagesLink().should('not.have.attr', 'aria-current')
    profile.getSavedMessagesLink().click()
    profile.getSavedMessagesLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'saved-messages')
    profile.getAccountSettingsLink().should('not.have.attr', 'aria-current')
    profile.getAccountSettingsLink().click()
    profile.getAccountSettingsLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'account/info')

    //tests the sidebar's 'Email Settings' link and its sublinks
    profile.getEmailSettingsLink().should('not.have.attr', 'aria-current')
    profile.getEmailSettingsLink().click()
    profile.getEmailSettingsLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'account/email-settings')
    profile.getNotificationsLink().should('be.visible')
    profile.getGiftEmailsLink().should('not.have.attr', 'aria-current')
    profile.getGiftEmailsLink().click()
    cy.url().should('contain', 'account/personalized-emails')
    profile.getEmailTemplatesLink().should('not.have.attr', 'aria-current')
    profile.getEmailTemplatesLink().click()
    cy.url().should('contain', 'account/email-templates')
    profile.getNotificationsLink().should('not.have.attr', 'aria-current')
    profile.getNotificationsLink().click()
    cy.url().should('contain', 'notifications/general')

    //tests Email Blocklist Link
    profile.getEmailBlocklistLink().should('not.have.attr', 'aria-current')
    profile.getEmailBlocklistLink().click()
    profile.getEmailBlocklistLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', '/account/blocklist')

    //tests Message Settings Link
    profile.getMeetingSettingsLink().should('not.have.attr', 'aria-current')
    profile.getMeetingSettingsLink().click()
    profile.getMeetingSettingsLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'profile/meetings')

    //tests the sidebar's 'You' link
    profile.getYouLink().should('not.have.attr', 'aria-current')
    profile.getYouLink().click()
    profile.getYouLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'profile')

    //tests the sidebar's 'Warehousing' link
    profile.getWarehousingLink().should('not.have.attr', 'aria-current')
    profile.getWarehousingLink().click()
    profile.getWarehousingLink().should('have.attr', 'aria-current', 'page')
    cy.url().should('contain', 'account/warehousing')
    cy.contains(
      'Your organization does not currently have access to Postal Warehousing. To request more information and pricing for Postal Warehousing, please fill out this'
    ).should('exist')
  })
})
