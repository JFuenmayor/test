import { onlyOn } from '@cypress/skip-test'
import { addDays, format } from 'date-fns'
import { FakeUser, userFactory } from '../../support/factories'
import {
  Billing,
  //Campaigns,
  Contacts,
  MagicLinks,
  Marketplace,
  Navbar,
  Orders,
  Profile,
  Reporting,
  SavedMessages,
  SidePanel,
  Subscriptions,
  Universal,
  Users,
} from '../../support/pageObjects'
import { SeedingUAMResponse } from '../../support/rolesAndInvites/uam'

describe('Roles & InvitesMANAGER/ADMIN testing', () => {
  const billing = new Billing()
  //const campaigns = new Campaigns()
  const contacts = new Contacts()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const orders = new Orders()
  const profile = new Profile()
  const reporting = new Reporting()
  const universal = new Universal()
  const savedMessages = new SavedMessages()
  const sidePanel = new SidePanel()
  const subscriptions = new Subscriptions()
  const users = new Users()

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
  let userManager: SeedingUAMResponse['userManager']
  let managerAdmin: SeedingUAMResponse['managerAdmin']

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
            userManager = res.userManager
            managerAdmin = res.managerAdmin
            approvedPostalId = res.approvedPostalId
            approvedVariantId = res.approvedVariantId
            //creates a draft order to test later
            cy.crudDraftOrder({ itemName: 'Chipotle', draftName: 'U/A/M draft', justCreate: true })
            cy.url().should('include', 'orders')
            orders.getDraftsCard().within(() => {
              cy.contains('a', 'U/A/M draft')
            })
          })
          .then(() => {
            cy.seedingUserManager({
              inviteId: userManager.userManagerId,
              userName: userManager.email,
              approvedPostalId,
              approvedVariantId,
            })
            cy.seedingAdmin({
              inviteId: admin.adminId,
              userName: admin.email,
              accountId: accountId,
            })
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
          })
          .then(() => {
            newUser = userFactory({
              userName: managerAdmin.email,
              firstName: 'Manager',
              lastName: 'Admin',
              company: 'ManagerAdmin',
            })
            cy.completeInvitation({
              id: managerAdmin.managerAdminId,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              password: newUser.password,
            })
            cy.login(newUser)
          })
      })
    Cypress.on('uncaught:exception', () => {
      return false
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

  it(`tests manager/admin permissions`, function () {
    //tests that manager/admin can see everything
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getYouLink().should('exist')
    profile.getUsersLink().should('exist')
    profile.getTeamsLink().should('exist')
    profile.getTeamLink().should('not.exist')
    profile.getBrandingLink().should('exist')
    profile.getIntegrationsLink().should('exist')
    profile.getBillingLink().should('exist').click({ force: true })
    cy.url().should('contain', '/billing/accounts')
    profile.getFundsLink().should('exist')
    profile.getAccountsLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    profile.getAccountSettingsLink().should('exist').click({ force: true })
    cy.url().should('contain', '/account/info')
    profile.getAccountSettingsLink().should('exist')
    profile.getSavedMessagesLink().should('exist')
    profile.getEmailSettingsLink().should('exist').click()
    cy.url().should('contain', '/email-settings')
    profile.getNotificationsLink().should('exist')
    profile.getGiftEmailsLink().should('exist')
    profile.getEmailTemplatesLink().should('exist')
    profile.getMeetingSettingsLink().should('exist')
    navbar.getNavbarLeft().within(() => {
      navbar.getMarketplaceLink().should('be.visible')
      navbar.getEventsLink().should('be.visible')
      navbar.getOrdersLink().should('be.visible')
      navbar.getContactsLink().should('be.visible')
      navbar.getReportingLink().should('be.visible')
      universal.getMoreMenu().should('be.visible').trigger('click', { force: true })
    })
    navbar.getMagicLinkMenuItem().should('exist')
    navbar.getSubscriptionsMenuItem().should('exist')
    navbar.getTriggersMenuItem().should('exist')
    navbar.getCollectionsMenuItem().should('exist')
    navbar.getConciergeMenuItem().should('exist')
  })
  it(`tests that a manager/admin can approve, clone, edit and delete a postal`, function () {
    //tests that the manager/admin can see the approved postal from before
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('User/Admin approved')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    marketplace.getNewPostalByName('User/Admin approved')
    marketplace.getNewPostalByName('U/A/M approved')
    marketplace.getNewPostalByName('Postcard')
    marketplace.getNewPostalByName('Chipotle')
    marketplace.getNewPostalByName('AdminOnly')
    //tests that a manager/admin can approve, clone, edit and delete a postal
    //uses cy.wait('@getgetBackgroundTaskById') and cy.wait('@searchApprovedPostals')
    cy.crudPostals({
      postalName: 'Manager/Admin approved',
      role: 'Manager/Admin Role',
      team: 'All Teams',
    })
  })
  it(`tests that a manager/admin can create, edit and delete saved messages`, function () {
    //tests that the manager/admin can see the Saved Messages from before
    savedMessages.visitMessages()
    savedMessages
      .getMessageCardByTitle('Welcome to Permissions Testing!!!')
      .should('contain', 'This was made with a manager/user/admin Role.')

    //tests that a manager/admin create, edit and delete saved message
    cy.crudMessages({
      header: 'Welcome to Permissions Testing$',
      body: 'This was made with a manager/admin role.',
    })
  })
  // it(`tests that the manager/admin can see the Campaigns from before`, function () {
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   universal.getRowByText('U/A/M Campaign').should('be.visible')
  //   universal.getRowByText('userAdminMade').should('be.visible')
  //   universal.getRowByText('UserManagerMade').should('be.visible')
  //   universal.getRowByText('UserMade').should('be.visible')
  //   campaigns.getMyCampaignsLink().should('not.exist')
  //   campaigns.getAllCampaignsLink().should('exist')
  // })
  it(`tests that the manager/admin can see the marketplace templates from before`, function () {
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    sidePanel.selectFilter('Categories', 'Direct Mail')
    cy.contains('a', 'Def Leppard T-Shirt', { timeout: 99000 }).should('not.exist')
    marketplace.getBrochureButton().should('exist')
    marketplace.getNotecardButton().should('exist')
    marketplace.getPostcardButton().should('exist')
  })
  it(`tests that the manager/admin can see the users from before`, function () {
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 10)
    users.getSearchFirstName().fill(firstName)
    universal.getRowByText(firstName)
  })
  it(`tests that the manager/admin can see the invites from before`, function () {
    users.visitInvitations()
    universal.getSpinner().should('not.exist')
    users.getInvitationsTabpanel().within(() => {
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowsInATableBody().should('have.length', 10)
      universal.getAllGridCellsByText(/Pending/i).should('have.length', 7)
      universal.getAllGridCellsByText(/Complete/i).should('have.length', 3)
    })
  })
  it(`tests that an manager/admin can invite a user`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('plantMom@postal.dev')
      cy.selectAutoCompleteTeam(company)
      users.getInviteToTeamButton().should('not.be.disabled').click({ force: true })
    })
    users.getInviteUserModal().should('not.exist')
    users.getSearchForInvitations().fill('Mom')
    universal.getRowsInATableBody().should('have.length', '1')
    universal.getRowByText('mom').should('be.visible')
  })
  it(`tests that an manager/admin can invite a admin`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('dogMom@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('User', 'Admin')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('Mom')
    universal.getRowsInATableBody().should('have.length', '2')
    universal.getRowByText('dogmom').should('be.visible')
  })
  it(`tests that an manager/admin can invite a user with both the user and admin role`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('catMom@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('Admin')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('Mom')
    universal.getRowsInATableBody().should('have.length', '3')
    universal.getRowByText('catmom').should('be.visible')
  })
  it(`tests that an manager/admin can edit and delete users via bulk updating their roles`, function () {
    cy.crudUsers({ firstName: 'Elio', lastName: 'Emmerick', company: company })
  })
  it(`tests that the manager/admin can see the Contacts made before`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.getRowByText('Maria Lara').scrollIntoView().should('be.visible')
    universal.getRowByText('VivianUp LeeUp').should('exist')
    universal.getRowByText('VelmaUP AndrewsUP').should('exist')
    universal.getRowByText('TonyUP FauciUP').should('exist')
    universal.getRowByText('HannahUP').should('exist')
  })
  it(`tests that the Contacts Table Page renders as it should for a manager/admin`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getImportContactsButton().should('exist')
    contacts.getCreateContactLink().should('exist')
    cy.clickCheckboxByRowNumber({ num: 1 })
    contacts.getSendPlaybookIconButton().should('exist')
    //tests that the manager/admin cannot send a postal
    contacts.getSendItemButton().should('not.exist')
    contacts.getAddListIconButton().should('exist')
  })
  it(`tests that the manager/admin can see the Contact's profile page`, function () {
    contacts.visitContacts()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(200)
        cy.reload()
        cy.wait(200)
      }
    })
    universal.getSpinner().should('not.exist')
    contacts.getContactLinkByName('Maria Lara').click()
    universal.getSpinner().should('not.exist')
    //universal.getStatsCard().should('exist')
    contacts.getPlaybooksSection().should('exist')
  })
  it(`tests that a manager/admin role can import, create, edit and delete a contact`, function () {
    cy.crudContacts({
      filename: 'managerAdmin',
      firstName: 'Wilby',
      lastName: 'Willows',
      company: 'Willows Wands',
      title: 'Manager Admin Role',
      email: 'wwilliows@postal.com',
      tags: 'willow',
      deleting: 'Jonah',
    })
  })
  it(`tests that a manager/admin should be able to add funds`, function () {
    billing.visitBillingAccounts()
    universal.getSpinner().should('not.exist')
    billing.getFundsAccount(company).within(() => {
      billing.getEditButton().should('be.visible').click()
    })
    cy.contains(`${company}'s Fund Management Billing Account`)
    universal.getSpinner().should('not.exist')
    billing.getAddFunds().scrollIntoView().type('300.00', { force: true })
    billing.getAddFundsButton().scrollIntoView().should('not.be.disabled').click()
    universal.getConfirmButton().click()
  })
  // it(`tests editing a campaign, and adding and removing contacts from a campaign `, function () {
  //   //tests that create a campaign is not an option
  //   campaigns.visitOrders()
  //   campaigns.getCreateCampaignButton().should('not.exist')

  //   //tests that a manager/admin can edit a campaign
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   universal.getRowByText('U/A/M Campaign').click()
  //   campaigns.getEditCampaignButton().should('exist').click()
  //   const tomorrow = addDays(new Date(), 1)
  //   const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
  //   campaigns.getUpdateCampaignDrawer().within(() => {
  //     campaigns.getEditNameInput().clear().fill(`U/A/M CampaignUP2`)
  //     campaigns
  //       .getStartDatePickerInput()
  //       .clear()
  //       .type(`${dateFormatInput(tomorrow)}`)
  //     campaigns.getEditStatusSelect().focus().select('SCHEDULED')
  //     campaigns.getUpdateCampaignButton().click()
  //   })
  //   campaigns.getUpdateCampaignDrawer().should('not.exist')
  //   navbar.getNavbarCenter().should('contain', 'U/A/M CampaignUP2')
  //   campaigns.getCampaignDetailsCard().within(() => {
  //     campaigns.getStatus().should('contain', 'SCHEDULED')
  //   })
  //   //tests that a manager/admin can add/remove a contact in a campaign
  //   //uses cy.wait('@getgetBackgroundTaskById')
  //   cy.contactsAndCampaigns({ contact: 'Maria Lara', campaign: 'U/A/M CampaignUP2' })
  //   //})
  //   //it(`tests that a manager/admin cannot see the Stats and  Campaigns blocks in 'You' profile`, function () {
  //   profile.visitProfile()
  //   universal.getSpinner().should('not.exist')
  //   profile.getYouDetailsCardByName('Manager Admin').should('exist')
  //   profile.getEmailIntegrationCard().should('exist')
  //   profile.getTeamsCard().should('exist')
  //   profile.getStatsCard().should('not.exist')
  //   profile.getCampaignsCard().should('exist')
  //   universal.getOrdersCard().should('not.exist')
  //   })

  it(`tests that a manager/admin can see the previous orders from other users in other roles`, function () {
    // since manager cannot send anything, any orders that show up in activity/reports
    // will prove that manager can see previous orders generated by other users in other roles
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    universal.getRowsInATableBody().should('have.length.gte', 1)
    universal.getRowByText('Maria Lara').should('exist')
    onlyOn(Cypress.env('testUrl'), () => {
      //tests that the seeded accepted magicLink created in the U/A/M role is visible
      universal.getRowByText('MagicLink 0')
    })
    reporting.getExportButton().click().should('not.have.attr', 'data-loading')
    universal.getThingSpinner().should('not.exist')
    reporting.getRecentExportsTab().click()
    universal.getSpinner().should('not.exist')
    //tomorrows date only included as flake fix for the occasional mismatch in UTC for remote runs
    const todaysOrderReport = `Order Report ${format(new Date(), 'MM-dd-yyyy')}`
    const tomorrowsOrderReport = `Order Report ${format(addDays(new Date(), 1), 'MM-dd-yyyy')}`
    universal.getRowByText(RegExp(todaysOrderReport + '|' + tomorrowsOrderReport))
    //tests that manager/admin can see previous MagicLinks but cannot create new ones
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    universal.getRowByText('MagicLink 0').should('exist')
    magicLinks.getCreateAMagicLinkButton().should('not.exist')
    //tests that manager/admin can see previous Subscription
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().should('exist')
    subscriptions.getPlaybookByName('Subscription One')
    //tests that an manager/admin can create a Playbook, edit, and delete it
    cy.crudSubscriptions('AdminOnly')
  })

  it(`tests that manager/admin can see a Playbook's profile and its edit buttons but cannot add contacts`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One').click({ force: true })
    universal.getSpinner().should('not.exist')
    subscriptions.getContactsCard().within(() => {
      subscriptions.getAddContactsButton().should('not.exist')
      subscriptions.getCancelAllButton().should('not.exist')
    })
    subscriptions.getPlaybookStatusCard().within(() => {
      subscriptions.getEnablePlaybookButton().should('exist')
    })
    subscriptions.getEditPlaybookButton().should('exist')
    subscriptions.getEditStepsIconButton().should('exist')
  })
  it(`tests that manager/admin can view a draft order created in the U/A/M role and click into it`, function () {
    orders.visitOrdersOverview()
    orders.getDraftsCard().within(() => {
      cy.contains('a', 'U/A/M draft').should('exist')
      cy.contains('a', 'U/A/M draft').click()
    })
    cy.contains('Only those with the User role can send items - you will not be able to send.')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('500').should('not.exist')
    //todo: edit draft again?
  })
  it(`checks that a manager/admin can view and click into a email order created in the U/A/M role`, function () {
    //Log outs
    cy.login(userUAM)
    cy.visit('/')
    universal.getSpinner().should('not.exist')

    //creates and sends an email order to test later
    cy.createEmailOrder({ itemName: 'Chipotle' })

    //log back in to manager
    cy.login(newUser, true)
    orders.visitOrdersOverview()
    orders.getEmailsCard().within(() => {
      cy.contains('a', 'Chipotle').click()
    })
    cy.contains('Recipient').should('exist')
    cy.contains('Chipotle').should('exist')
    cy.contains('404').should('not.exist')
  })
  onlyOn(Cypress.env('testUrl'), () => {
    it.skip(`checks that a manager/admin can view and click into a magiclink order created in the U/A/M role`, function () {
      orders.visitOrdersOverview()
      orders.getMagicLinksCard().within(() => {
        cy.contains('a', 'Postcard').click()
      })
      universal.getRetryOrderAgainButton().should('not.exist')
      cy.contains('a', 'View MagicLink').should('exist')
      cy.contains('Postcard').should('exist')
      cy.wait(300)
      cy.contains('404').should('not.exist')
      cy.contains('500').should('not.exist')
    })
  })
  it(`checks that a Manager/Admin can view and click into a direct order created in the U/A/M role`, function () {
    orders.visitOrdersOverview()
    orders.getDirectsCard().within(() => {
      //checks that it sees the orders made in other roles too
      cy.findAllByText('U/A/M approved').should('have.length.gte', 3)
      universal.getRowByText('Maria Lara').within(() => {
        cy.contains('a', 'U/A/M approved').click()
      })
    })
    cy.contains('U/A/M approved').should('exist')
    cy.contains('Maria Lara').should('exist')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('500').should('not.exist')
  })
})
