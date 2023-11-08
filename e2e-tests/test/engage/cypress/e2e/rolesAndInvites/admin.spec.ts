import { onlyOn } from '@cypress/skip-test'
import { addDays, format } from 'date-fns'
import { FakeUser, userFactory } from '../../support/factories'
import {
  Billing,
  Marketplace,
  Navbar,
  Profile,
  Reporting,
  SavedMessages,
  Subscriptions,
  Universal,
  Users,
} from '../../support/pageObjects'
import { SeedingUAMResponse } from '../../support/rolesAndInvites/uam'

describe('Roles & Invites - ADMIN testing', function () {
  //used pageObject models
  const billing = new Billing()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const profile = new Profile()
  const reporting = new Reporting()
  const savedMessages = new SavedMessages()
  const subscriptions = new Subscriptions()
  const users = new Users()
  const universal = new Universal()

  const userUAM = userFactory()
  let accountId: string
  let firstName: string
  let company: string
  let newUser: FakeUser

  //uam sent invites ids
  let admin: SeedingUAMResponse['admin']
  let user: SeedingUAMResponse['user']
  let userAdmin: SeedingUAMResponse['userAdmin']
  let manager: SeedingUAMResponse['manager']
  let managerAdmin: SeedingUAMResponse['managerAdmin']
  let userManager: SeedingUAMResponse['userManager']

  //UAM Postal Variables
  let approvedPostalId: string
  let approvedVariantId: string

  before(function () {
    cy.rolesSetupA(userUAM)
      .then((res) => {
        accountId = res.accountId
        firstName = res.firstName
        company = res.company
      })
      .then(() => {
        cy.seedingUAM(accountId)
          .then((res) => {
            admin = res.admin
            user = res.user
            userAdmin = res.userAdmin
            manager = res.manager
            managerAdmin = res.managerAdmin
            userManager = res.userManager
            approvedPostalId = res.approvedPostalId
            approvedVariantId = res.approvedVariantId
          })
          .then(() => {
            cy.seedingUser({
              userName: user.email,
              inviteId: user.userId,
              approvedPostalId,
              approvedVariantId,
            })
            cy.seedingUserAdmin({
              inviteId: userAdmin.userAdminId,
              userName: userAdmin.email,
              accountId,
              approvedPostalId,
              approvedVariantId,
            })
            cy.seedingManager({
              inviteId: manager.managerId,
              userName: manager.email,
            })
            cy.seedingUserManager({
              inviteId: userManager.userManagerId,
              userName: userManager.email,
              approvedPostalId,
              approvedVariantId,
            })
            cy.seedingManagerAdmin({
              inviteId: managerAdmin.managerAdminId,
              userName: managerAdmin.email,
              accountId,
            })
          })
          .then(() => {
            newUser = userFactory({
              userName: admin.email,
              firstName: 'Ora',
              lastName: 'Admina',
              company: 'OraAdmina',
            })
            cy.completeInvitation({
              id: admin.adminId,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              password: newUser.password,
            })
            cy.login(newUser)
          })
      })
  })

  beforeEach(() => {
    cy.login(newUser)
    cy.filterLocalStorage('postal:filters:contacts')
    cy.filterLocalStorage('postal:items:tabs')
    cy.filterLocalStorage('postal:items:marketplace:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'searchApprovedPostals') {
        req.alias = 'searchApprovedPostals'
      }
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
    })
  })

  it(`tests that admin can see what it should in the navbar and profile sidebar`, function () {
    profile.visitProfile()
    cy.url().should('include', '/profile')
    universal.getSpinner().should('not.exist')
    profile.getYouLink().should('exist')
    profile.getUsersLink().should('exist')
    profile.getTeamsLink().should('exist')
    profile.getBrandingLink().should('exist')
    profile.getIntegrationsLink().should('exist')
    cy.contains('Ora Admina').should('exist')
    profile.getBillingLink().click({ force: true })
    cy.wait(500)
    cy.url().should('include', '/billing/accounts')
    profile.getFundsLink().should('exist')
    profile.getAccountsLink().should('exist')
    profile.getTransfersLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    profile.getAccountSettingsLink().click({ force: true })
    cy.wait(500)
    cy.url().should('include', '/account/info')
    profile.getAccountSettingsLink().should('exist')
    profile.getSavedMessagesLink().should('exist')
    profile.getEmailSettingsLink().click({ force: true })
    cy.wait(500)
    cy.url().should('include', '/account/email-settings')
    profile.getNotificationsLink().should('exist')
    profile.getGiftEmailsLink().should('exist')
    profile.getEmailTemplatesLink().should('exist')
    profile.getMeetingSettingsLink().should('exist')
    profile.getWarehousingLink().should('exist')
    navbar.getNavbarLeft().within(() => {
      navbar.getMarketplaceLink().should('be.visible')
      navbar.getEventsLink().should('be.visible')
      navbar.getReportingLink().should('be.visible')
      universal.getMoreMenu().should('be.visible').trigger('click', { force: true })
    })
    navbar.getSubscriptionsMenuItem().should('exist')
    navbar.getTriggersMenuItem().should('exist')
    navbar.getCollectionsMenuItem().should('exist')
    navbar.getConciergeMenuItem().should('exist')
  })

  it(`tests that an admin cannot see what it shouldn't in the navbar and profile sidebar`, function () {
    profile.visitProfile()
    cy.url().should('include', '/profile')
    universal.getSpinner().should('not.exist')
    navbar.getNavbarLeft().within(() => {
      navbar.getOrdersLink().should('not.exist')
      navbar.getCampaignsLink().should('not.exist')
      navbar.getContactsLink().should('not.exist')
      universal.getMoreMenu().should('be.visible')
      universal.getMoreMenu().should('be.visible').trigger('click', { force: true })
    })
    navbar.getMagicLinkMenuItem().should('not.exist')
  })

  it(`tests that the admin can see the Saved Message from before`, function () {
    profile.visitProfile()
    cy.url().should('include', '/profile')
    universal.getSpinner().should('not.exist')
    profile.getAccountSettingsLink().click({ force: true })
    cy.url().should('include', '/account/info')
    profile.getSavedMessagesLink().click({ force: true })
    cy.url().should('include', '/saved-messages')
    savedMessages
      .getMessageCardByTitle('Welcome to Permissions Testing!!!')
      .should('contain', 'This was made with a manager/user/admin Role.')
  })

  it(`tests that an admin can create a Saved Message, edit, and delete it`, function () {
    profile.visitProfile()
    cy.url().should('include', '/profile')
    universal.getSpinner().should('not.exist')
    profile.getSavedMessagesLink().click({ force: true })
    cy.url().should('include', '/saved-messages')
    cy.crudMessages({
      header: 'Welcome to Permissions Testing',
      body: 'This was made with an admin role.',
    })
  })

  //it(`tests that the admin can see the marketplace templates from before`, function () {
  //todo: should this really be tested here, is anything here unique to admin?
  //navbar.getMarketplaceLink().click()
  //marketplace.getFeaturedTab().click()
  //universal.getSpinner().should('not.exist')
  // marketplace.getBooksCategory()
  // marketplace.getDirectMailCategory()
  // marketplace.getCategoryByName('Gift Cards')
  // marketplace.getCategoryByName('Drink')
  // marketplace.clickFeaturedDirectMailCard()
  // marketplace.getBrochureButton()
  // marketplace.getNotecardButton()
  // marketplace.getPostcardButton()
  //})
  it(`tests that the admin can see the approved postal from before`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      const newThings = ['User/Admin approved', 'U/A/M approved', 'Manager/Admin approved']
      if (!newThings.every((thing) => $body.text().includes(thing))) {
        cy.wait(3100)
        cy.reload()
      }
    })
    marketplace.getNewPostalByName('User/Admin approved')
    marketplace.getNewPostalByName('U/A/M approved')
    marketplace.getNewPostalByName('Manager/Admin approved')
    marketplace.getNewPostalByName('Postcard')
    marketplace.getNewPostalByName('Chipotle')
  })

  it(`tests that the admin cannot see the send postal and create magiclink options`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    marketplace.viewItemByName('U/A/M approved')
    cy.wait(1000)
    cy.contains('Ships on certain days').should('exist')
    marketplace.getEllipsesButton().eq(0).realClick()
    marketplace.getCloneActionItem().should('exist')
    marketplace.getAddToFavoritesActionItem().should('not.exist')
    marketplace.getEditButton().should('exist')
    marketplace.getDeleteActionItem().should('exist')
    marketplace.getMagicLinkActionItem().should('not.exist')
    marketplace.getSendActionItem().should('not.exist')
    marketplace.getSendButton().should('not.exist')
    marketplace.getMagicLinkButton().should('not.exist')
    cy.contains('U/A/M approved').should('exist')
  })

  it(`tests that the admin cannot not add /send to a approved items url`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'U/A/M approved').should('be.visible').click()
    cy.wait(800)
    cy.url().then((url) => {
      expect(url).to.include('postals/')
      const subUrl = url
      cy.visit(`${subUrl}/send`, { failOnStatusCode: false })
      cy.contains('403').should('exist')
    })
  })

  it(`tests that an admin can approve, edit, delete a postal`, function () {
    //uses cy.wait('@getgetBackgroundTaskById') and cy.wait('@searchApprovedPostals')
    cy.crudPostals({ postalName: 'AdminOnly', role: 'Admin Role', team: 'All Teams' })
  })

  it(`tests that the admin can see the users from before`, function () {
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 10)
    users.getSearchFirstName().fill(firstName)
    universal.getRowByText(firstName)
  })

  it(`tests that the admin can see the invites from before`, function () {
    users.visitInvitations()
    universal.progressBarZero()
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
      universal.getAllGridCellsByText(/Pending/i).should('have.length', 6)
      universal.getAllGridCellsByText(/Complete/i).should('have.length', 4)
    })
  })

  it(`tests that an admin can edit and delete users via bulk updating their roles`, function () {
    cy.crudUsers({ firstName: 'Aymeris', lastName: 'Arnold', company: company })
  })

  it(`tests that an admin can invite a user`, function () {
    users.visitInvitations()
    cy.url().should('include', '/users/invitations')
    cy.wait(500)
    users.getInviteUserButton().click({ force: true })
    cy.wait(800)
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('pizza@postal.dev')
      cy.selectAutoCompleteTeam(company)
      users.getInviteToTeamButton().should('not.be.disabled').click({ force: true })
    })
    users.getInviteUserModal().should('not.exist')
    users.getSearchForInvitations().fill('pizza')
    universal.getRowsInATableBody().should('have.length', '1')
    universal.getRowByText('pizza').should('be.visible')
  })

  it(`tests that an admin can invite a admin`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('pizzahut@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('User', 'Admin')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('pizza')
    universal.getRowsInATableBody().should('have.length', '2')
    universal.getRowByText('pizzahut').should('be.visible')
  })
  it(`tests that an admin can invite a user with both the user and admin role`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().fill('pizzaKing@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('Admin')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('pizza')
    universal.getRowsInATableBody().should('have.length', '3')
    universal.getRowByText('pizzaking').should('be.visible')
  })
  it(`tests that an admin can invite a user with the manager role`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().fill('pizzaPrince@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('User', 'Manager')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('pizza')
    universal.getRowsInATableBody().should('have.length', '4')
    universal.getRowByText('pizzaprince').should('be.visible')
  })
  it(`tests that admin should be able to add funds`, function () {
    billing.visitBillingAccounts()
    universal.getSpinner().should('not.exist')
    billing.getFundsAccount(company).within(() => {
      billing.getEditButton().should('be.visible').click()
    })
    cy.contains(`${company}'s Fund Management Billing Account`).should('exist')
    universal.getSpinner().should('not.exist')
    billing.getAddFunds().should('be.visible').type('300.00')
    billing.getAddFundsButton().scrollIntoView().click()
    universal.getConfirmButton().click()
  })
  it(`tests that admin cannot see the Campaigns, Stats, and Orders blocks in 'You' profile`, function () {
    profile.visitProfile()
    cy.wait(1000)
    universal.getSpinner().should('not.exist')
    profile.getYouDetailsCardByName('Ora Admina').should('exist')
    profile.getEmailIntegrationCard().should('exist')
    profile.getTeamsCard().should('exist')
    profile.getStatsCard().should('not.exist')
    profile.getCampaignsCard().should('not.exist')
    universal.getOrdersCard().should('not.exist')
  })
  it(`tests that admin can see the previous orders from other users in other roles`, function () {
    reporting.visitReporting()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    reporting.getAllGraphs().should('have.length', 3)
    // since admin cannot send anything, any orders that show up in activity/reports
    // will prove that admin can see previous orders generated by other users in other roles
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    universal.getRowsInATableBody().should('have.length.gte', 1)
    universal.getRowByText('Maria Lara').should('exist')
    //tests that the seeded accepted magicLink created in the U/A/M role is visible
    onlyOn(Cypress.env('testUrl'), () => {
      universal.getRowByText('MagicLink 0').should('exist')
    })
    reporting.getExportButton().click({ force: true }).should('not.have.attr', 'data-loading')
    universal.getThingSpinner().should('not.exist')
    reporting.getRecentExportsTab().click()
    universal.progressBarZero()
    //tomorrows date only included as flake fix for the occasional mismatch in UTC for remote runs
    const todaysOrderReport = `Order Report ${format(new Date(), 'MM-dd-yyyy')}`
    const tomorrowsOrderReport = `Order Report ${format(addDays(new Date(), 1), 'MM-dd-yyyy')}`
    universal.getRowByText(RegExp(todaysOrderReport + '|' + tomorrowsOrderReport))

    //tests that admin can see previous Playbooks
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().should('exist')
    subscriptions.getPlaybookByName('Subscription One')
  })
  //bug P2-5394
  it.skip(`tests that an admin can create a Subscription, edit, and delete it`, function () {
    cy.crudSubscriptions('AdminOnly', true)
  })

  it(`tests that admin can see a Playbook's profile and its edit buttons but cannot see the contacts card`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One').click({ force: true })
    universal.getSpinner().should('not.exist')
    subscriptions.getContactsCard().should('not.exist')
    subscriptions.getPlaybookStatusCard().within(() => {
      subscriptions.getEnablePlaybookButton().should('exist')
    })
    subscriptions.getEditPlaybookButton().should('exist')
    subscriptions.getEditStepsIconButton().should('exist')
  })
})
