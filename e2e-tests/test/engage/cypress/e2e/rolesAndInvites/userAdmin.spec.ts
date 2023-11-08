import { onlyOn } from '@cypress/skip-test'
import { addDays, format } from 'date-fns'
import { FakeUser, userFactory } from '../../support/factories'
import {
  Billing,
  Contacts,
  Delivery,
  MagicLinks,
  Marketplace,
  Navbar,
  Orders,
  Profile,
  Reporting,
  SavedMessages,
  SendItem,
  SidePanel,
  Subscriptions,
  Universal,
  Users,
} from '../../support/pageObjects'
import { SeedingUAMResponse } from '../../support/rolesAndInvites/uam'

describe('Roles & Invites - USER/ADMIN testing', function () {
  const billing = new Billing()
  const contacts = new Contacts()
  const delivery = new Delivery()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const orders = new Orders()
  const profile = new Profile()
  const reporting = new Reporting()
  const savedMessages = new SavedMessages()
  const sendItem = new SendItem()
  const sidePanel = new SidePanel()
  const subscriptions = new Subscriptions()
  const universal = new Universal()
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
            //creates a draft order to test later
            cy.crudDraftOrder({ itemName: 'Chipotle', draftName: 'U/A/M draft', justCreate: true })
            cy.url().should('include', 'orders')
            orders.getDraftsCard().within(() => {
              cy.contains('a', 'U/A/M draft')
            })
          })
          .then(() => {
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
              userName: userAdmin.email,
              firstName: 'User',
              lastName: 'Admin',
              company: 'UserAdmin',
            })
            cy.completeInvitation({
              id: userAdmin.userAdminId,
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

  it(`tests that user/admin can see everything`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getYouLink().should('exist')
    profile.getUsersLink().should('exist')
    profile.getTeamsLink().should('exist')
    profile.getTeamLink().should('not.exist')
    profile.getBrandingLink().should('exist')
    profile.getIntegrationsLink().should('exist')
    profile.getBillingLink().should('exist').click()
    cy.url().should('contain', '/billing/accounts')
    profile.getFundsLink().should('exist')
    profile.getAccountsLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    profile.getAccountSettingsLink().should('exist').click()
    cy.url().should('contain', '/account/info')
    profile.getAccountSettingsLink().should('exist')
    profile.getSavedMessagesLink().should('exist')
    profile.getEmailSettingsLink().should('exist').click()
    cy.url().should('contain', '/account/email-settings')
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
      universal.getMoreMenu().trigger('click', { force: true })
    })
    navbar.getMagicLinkMenuItem().should('exist')
    navbar.getSubscriptionsMenuItem().should('exist')
    navbar.getTriggersMenuItem().should('exist')
    navbar.getCollectionsMenuItem().should('exist')
    navbar.getConciergeMenuItem().should('exist')
  })

  it(`tests that a user/admin can approve, clone, edit and delete a postal`, function () {
    //tests that user/admin can see approved postals from before
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')

    cy.get('body').then(($body) => {
      const newThings = ['AdminOnly', 'U/A/M approved', 'Manager/Admin approved']
      if (!newThings.every((thing) => $body.text().includes(thing))) {
        cy.wait(3100)
        cy.reload()
      }
    })

    marketplace.getNewPostalByName('Manager/Admin approved')
    marketplace.getNewPostalByName('U/A/M approved')
    marketplace.getNewPostalByName('Postcard')
    marketplace.getNewPostalByName('Chipotle')
    marketplace.getNewPostalByName('AdminOnly')
    //tests that user/admin role can approve, clone, edit and delete a postal
    //uses cy.wait('@getgetBackgroundTaskById') and cy.wait('@searchApprovedPostals')
    cy.crudPostals({
      postalName: 'User/Admin approved',
      role: 'User/Admin Role',
      team: 'All Teams',
    })
  })

  it(`tests that a user/admin can create, edit and delete saved messages`, function () {
    //tests that the user/admin can see the Saved Messages from before
    savedMessages.visitMessages()
    savedMessages
      .getMessageCardByTitle('Welcome to Permissions Testing!!!')
      .should('contain', 'This was made with a manager/user/admin Role.')
    //tests that a user/admin can create, edit and delete saved messages
    cy.crudMessages({
      header: 'Welcome to Permissions Testing^',
      body: 'This was made with a user/admin role.',
    })
    //tests that the user/admin cannot see the Campaigns from before
    // user/admin cannot see a campaign previously created by the user role. Campaigns essentially acts like a user role
    //(only can see stuff it owns) because admin has no access at all.
    // campaigns.visitOrders()
    // universal.getSpinner().should('not.exist')
    // universal.getNoItemsMessage().should('be.visible')
  })

  it(`tests that the user/admin can see the marketplace templates from before`, function () {
    cy.filterLocalStorage('postal:items:marketplace:filter')
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    sidePanel.selectFilter('Categories', 'Direct Mail')
    marketplace.getBrochureButton().should('exist')
    marketplace.getNotecardButton().should('exist')
    marketplace.getPostcardButton().should('exist')
  })

  it(`tests that the user/admin can see the users from before`, function () {
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 10)
    users.getSearchFirstName().fill(firstName)
    universal.getRowByText(firstName)
  })

  it(`tests that the user/admin can see the invites from before`, function () {
    users.visitInvitations()
    universal.waitForProgressBar()
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
      universal.getAllGridCellsByText(/Pending/i).should('have.length', 7)
      universal.getAllGridCellsByText(/Complete/i).should('have.length', 3)
    })
  })

  it(`tests that a user/admin can invite a user`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('plantDad@postal.dev')
      cy.selectAutoCompleteTeam(company)
      users.getInviteToTeamButton().should('not.be.disabled').click({ force: true })
    })
    users.getInviteUserModal().should('not.exist')
    users.getSearchForInvitations().fill('Dad@')
    universal.getRowsInATableBody().should('have.length', '1')
    universal.getRowByText('dad').should('be.visible')
  })

  it(`tests that a user/admin can invite a admin`, function () {
    users.visitInvitations()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('dogDad@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('User', 'Admin')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('Dad@')
    universal.getRowsInATableBody().should('have.length', '2')
    universal.getRowByText('dogdad').should('be.visible')
  })

  it(`tests that a user/admin can invite a user with both the user and admin role`, function () {
    users.visitInvitations()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()
    users.getInviteUserButton().click({ force: true })
    users.getInviteUserModal().within(() => {
      users.getEmailAddressInput().should('be.visible').fill('catDad@postal.dev')
      cy.selectAutoCompleteTeam(company)
      cy.selectUserRoles('Admin')
      users.getInviteToTeamButton().click()
    })
    users.getSearchForInvitations().fill('dad@')
    universal.getRowsInATableBody().should('have.length', '3')
    universal.getRowByText('catdad').should('be.visible')
  })

  it(`tests that a user/admin can edit and delete users`, function () {
    cy.crudUsers({ firstName: 'Peter', lastName: 'Harper', company: company })
  })

  it(`tests that the user/admin cannot see the Contacts made before`, function () {
    // user/admin cannot see a contact previously created by the user role. Contacts essentially acts like a user role
    // (only can see stuff it owns) because admin has no access at all.
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('be.visible')
  })

  it(`tests that a user/admin role can import, create, edit and delete a contact`, function () {
    cy.crudContacts({
      filename: 'userAdmin',
      firstName: 'Velma',
      lastName: 'Andrews',
      company: 'Vel Co',
      title: 'User/Admin Role',
      email: 'velan@postal.com',
      tags: 'cold',
      deleting: 'Bran',
    })
  })

  it(`tests that a user/admin should be able to add funds`, function () {
    billing.visitBillingAccounts()
    universal.getSpinner().should('not.exist')
    billing.getFundsAccount(company).within(() => {
      billing.getEditButton().should('be.visible').click()
    })
    cy.contains(`${company}'s Fund Management Billing Account`).should('exist')
    universal.getSpinner().should('not.exist')
    billing.getAddFunds().type('300.00', { force: true })
    billing.getAddFundsButton().scrollIntoView().should('not.be.disabled').click()
    universal.getConfirmButton().click()
  })

  it(`tests that the user/admin can send a postal`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.waitForProgressBar()
    cy.findByPlaceholderText('Search Contacts').clear()
    cy.findByPlaceholderText('Search Contacts').fill('VelmaUP')
    universal.waitForProgressBar()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: 'VelmaUP AndrewsUP' })
    contacts.getSendItemButton().should('not.be.disabled').click()
    sendItem.getSelectItemDrawer().within(() => {
      cy.contains('a', 'U/A/M approved').click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'U/A/M approved').click({ force: true })
      }
    })
    sendItem.getReviewButton().should('be.visible').click()
    cy.wait(1000)
    sendItem.getSaveAndSendButton().should('be.visible').click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        sendItem.getSaveAndSendButton().click()
      }
    })
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getConfirmSendModal().should('not.exist')
    cy.contains('Success! Your item is on the way!').should('be.visible')
  })

  it(`tests that the Contacts Table Page renders as it should for a user/admin`, function () {
    contacts.visitContacts()
    universal.progressBarZero()
    universal.getSpinner().should('not.exist')
    contacts.getImportContactsButton().should('exist')
    contacts.getCreateContactLink().should('exist')
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendPlaybookIconButton().should('exist')
    contacts.getSendItemButton().should('exist')
    contacts.getAddListIconButton().should('exist')
  })

  it(`tests that the user/admin can see the Contact Page`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    contacts.getContactLinkByName('VelmaUP AndrewsUP').click({ force: true })
    universal.getSpinner().should('not.exist')
    //universal.getStatsCard().should('exist')
    contacts.getSubscriptionsTab().should('exist')
  })

  // it(`tests creating and editing a campaign, and adding and removing contacts from a campaign `, function () {
  //   //creates and edits a campaign
  //   navbar.getCampaignsLink().click({ force: true })
  //   universal.getSpinner().should('not.exist')
  //   cy.crudCampaigns({ name: 'userAdminMade', postalName: 'User/Admin approved' })
  //   //adds and removes contacts from a campaign and uses cy.wait('@getgetBackgroundTaskById')
  //   cy.contactsAndCampaigns({ contact: 'Sansa', campaign: 'userAdminMadeUP' })
  // })

  it(`tests that a user/admin can see Stats, Orders, and Campaigns blocks in 'You' profile`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getEmailIntegrationCard().should('exist')
    profile.getTeamsCard().should('exist')
    profile.getStatsCard().should('exist')
    cy.contains('User Admin').should('exist')
    //profile.getCampaignsCard().should('exist')
    //universal.getOrdersCard().should('exist')
  })

  it(`tests that a user/admin can see the previous orders from other users in other roles`, function () {
    // the user/admin sent one postal in this test suite with the Velma Andrews contact
    // searching for a report containing Maria Lara will confirm
    // user/admin can see a previous order from other users in other roles
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
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
  })

  it(`tests that user/admin cannot see previous MagicLinks and can create, edit, and delete new ones`, function () {
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    magicLinks.getCreateAMagicLinkButton().should('exist')
    universal.getRowByText('MagicLink 0').should('not.exist')
    cy.crudMagicLinks({})
  })

  it(`tests that user/admin can see previous subscriptions`, function () {
    cy.wait(300)
    subscriptions.visitSubscriptions()
    cy.url().should('contain', 'subscriptions')
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().should('exist')
    subscriptions.getPlaybookByName('Subscription One')
  })

  it(`tests that an user/admin can create a subscription, edit, and delete it`, function () {
    cy.crudSubscriptions('AdminOnly')
  })

  it(`tests that user/admin can see a subscription's profile and its edit buttons, and can add contacts`, function () {
    cy.wait(400)
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One').click({ force: true })
    subscriptions.getStatsCard().should('be.visible')
    cy.catchCallsRecurse({
      operationName: 'searchApprovedPostals',
      key: '0',
      value: 'U/A/M approved',
      key2: 'name',
    })
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookStatusCard().within(() => {
      subscriptions.getEnablePlaybookButton().should('exist')
    })
    subscriptions.getEditPlaybookButton().should('exist')
    subscriptions.getEditStepsIconButton().should('exist')
    subscriptions.getCancelAllButton().should('exist')
    subscriptions.getAddContactsButton().click()
    subscriptions.getAssignPlaybookDrawer().within(() => {
      cy.clickCheckbox({ name: 'John Snow' })
      subscriptions.getAssignPlaybookButton().click()
    })
    subscriptions.getAssignPlaybookDrawer().should('not.exist')
    subscriptions.getContactsCard()
    // .within(() => {
    //   universal.getNoItemsMessage().should('not.exist')
    // })
    //universal.getRowByText('John Snow').within(() => {
    //universal.getActionsMenuButton().click()
    //})
    //subscriptions.getCancelPlaybookMenuItem().should('exist')
  })
  it(`tests that user/admin cannot view a draft order created in the U/A/M role`, function () {
    orders.visitOrdersOverview()
    orders.getDraftsCard().within(() => {
      cy.contains('a', 'U/A/M draft').should('not.exist')
      universal.getNoItemsMessage().should('exist')
    })
  })
  it(`tests user/admin role creating, updating and sending a draft of an order and clicking on the draft in the orders page`, function () {
    cy.crudDraftOrder({ itemName: 'Chipotle' })
  })
  it(`checks that a user/admin can view and click into the newly created email order`, function () {
    orders.visitOrdersOverview()
    orders.getEmailsCard().within(() => {
      cy.contains('a', 'Chipotle').click()
    })
    universal.getRetryOrderAgainButton().should('exist')
    cy.contains('Chipotle').should('exist')
    cy.contains('404').should('not.exist')
  })
  onlyOn(Cypress.env('testUrl'), () => {
    it.skip(`checks that a user/admin can view and click into a magiclink order created in the U/A/M role`, function () {
      orders.visitOrdersOverview()
      orders.getMagicLinksCard().within(() => {
        cy.contains('a', 'Postcard').click()
      })
      universal.getRetryOrderAgainButton().should('not.exist')
      cy.contains('a', 'View MagicLink').should('exist')
      cy.contains('Postcard').should('exist')
      cy.wait(300)
      cy.contains('404').should('not.exist')
      cy.contains('unexpected error').should('not.exist')
    })

    it(`checks that a user/admin can view and click into a magiclink order it created`, function () {
      magicLinks.visitMagicLinks()
      cy.crudMagicLinks({ justCreate: true })
      magicLinks.visitMagicLinks()
      universal
        .getRowByNumber(0)
        .find('button')
        .then(($link: any) => {
          delivery.visit($link.attr('title'))
        })
      const acceptee = userFactory()
      cy.acceptingMagicLink({
        needAddress: true,
        firstName: acceptee.firstName,
        lastName: acceptee.lastName,
        email: acceptee.userName,
      })
      delivery.getSubmitButton().click({ force: true })
      delivery.getSayThanksForm().should('exist')
      orders.visitOrdersOverview()
      orders.getMagicLinksCard().within(() => {
        cy.contains('a', 'U/A/M approved').click()
      })
      universal.getRetryOrderAgainButton().should('exist')
      cy.contains('U/A/M approved').should('exist')
      cy.contains('404').should('not.exist')
    })
  })
  it(`checks that a user/admin can view and click into a direct order created in the U/A/M role`, function () {
    orders.visitOrdersOverview()
    orders.getDirectsCard().within(() => {
      //checks that it sees the orders made in other roles too
      cy.findAllByText('U/A/M approved').should('have.length.gte', 3)
      universal.getRowByText('Maria Lara').within(() => {
        cy.contains('a', 'U/A/M approved').click()
      })
    })
    universal.getOrderAgainButton().should('exist')
    cy.contains('U/A/M approved').should('exist')
    cy.contains('Maria Lara').should('exist')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('unexpected error').should('not.exist')
  })
  it(`checks that a user/admin can view and click into a direct order it created`, function () {
    orders.visitOrdersOverview()
    orders.getDirectsCard().within(() => {
      cy.wait(300)
      universal.getRowByText('VelmaUP AndrewsUP').within(() => {
        cy.contains('a', 'U/A/M approved').click()
      })
    })
    universal.getOrderAgainButton().should('exist')
    cy.contains('U/A/M approved').should('exist')
    cy.contains('VelmaUP AndrewsUP').should('exist')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('unexpected error').should('not.exist')
  })
})
