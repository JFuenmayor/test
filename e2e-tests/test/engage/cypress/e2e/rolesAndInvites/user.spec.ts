import { onlyOn } from '@cypress/skip-test'
import { addDays, format } from 'date-fns'
import { FakeUser, userFactory } from '../../support/factories'
import {
  AccountInfo,
  Billing,
  BulkSelect,
  Collections,
  Contacts,
  Delivery,
  Events,
  MagicLinks,
  Marketplace,
  Navbar,
  Orders,
  Profile,
  Reporting,
  SendItem,
  Subscriptions,
  Universal,
} from '../../support/pageObjects'
import { SeedingUAMResponse } from '../../support/rolesAndInvites/uam'

describe('Roles & Invites - USER testing', function () {
  const accountInfo = new AccountInfo()
  const billing = new Billing()
  //const campaigns = new Campaigns()
  const collections = new Collections()
  const contacts = new Contacts()
  const delivery = new Delivery()
  const events = new Events()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const bulkSelect = new BulkSelect()
  const navbar = new Navbar()
  const profile = new Profile()
  const orders = new Orders()
  const reporting = new Reporting()
  const sendItem = new SendItem()
  const subscriptions = new Subscriptions()
  const universal = new Universal()

  const userUAM = userFactory()

  let newUser: FakeUser
  let accountId: string

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
      })
      .then(() => {
        cy.seedingUAM(accountId).then((res) => {
          user = res.user
          userAdmin = res.userAdmin
          manager = res.manager
          managerAdmin = res.managerAdmin
          userManager = res.userManager
          admin = res.admin
          approvedPostalId = res.approvedPostalId
          approvedVariantId = res.approvedVariantId
        })
        cy.teamsSeed(1)
          .then(() => {
            cy.seedingAdmin({
              inviteId: admin.adminId,
              userName: admin.email,
              accountId: accountId,
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
              userName: user.email,
              firstName: 'Hannah',
              lastName: 'Huser',
              company: 'HannahHuser',
            })
            cy.completeInvitation({
              id: user.userId,
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
    cy.filterLocalStorage('postal:contacts:filters')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBalanceRemaining') {
        req.alias = 'getBalanceRemaining'
      }
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
      if (req.body.operationName === 'getAccount') {
        req.alias = 'getAccount'
      }
    })
  })

  it(`tests that user can see what it should in the navbar and profile sidebar`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getTeamsCard().within(() => {
      cy.contains('Active').should('be.visible')
    })
    cy.url().should('contain', 'profile')
    profile.getYouLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    cy.contains('Hannah Huser').should('exist')
    profile.getEmailSettingsLink().should('exist').click()
    profile.getNotificationsLink().should('exist')
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

  it(`tests that a user can't see what it shouldn't in the navbar and profile sidebar`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getUsersLink().should('not.exist')
    profile.getTeamsLink().should('not.exist')
    profile.getTeamLink().should('not.exist')
    profile.getBrandingLink().should('not.exist')
    profile.getIntegrationsLink().should('not.exist')
    profile.getBillingLink().should('not.exist')
    profile.getFundsLink().should('not.exist')
    profile.getAccountsLink().should('not.exist')
    profile.getAccountSettingsLink().should('not.exist')
    profile.getAccountSettingsLink().should('not.exist')
    profile.getSavedMessagesLink().should('not.exist')
    profile.getEmailSettingsLink().should('exist').click()
    profile.getGiftEmailsLink().should('not.exist')
    profile.getEmailTemplatesLink().should('not.exist')
  })

  it(`tests that a user can see the postals from before and the 'send postal' button but can't edit/clone/delete them`, function () {
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
    marketplace.getNewPostalByName('AdminOnly')

    cy.wait(200)
    cy.contains('a', 'U/A/M approved').click()
    cy.wait(1500)
    marketplace
      .getEllipsesButton()
      .eq(0)
      .should('not.be.disabled')
      .trigger('click', { force: true })
    marketplace.getSendItemMenuItem().should('exist')
    marketplace.getAddToFavoritesActionItem().should('exist')
    marketplace.getMagicLinkActionItem().should('not.exist')
    marketplace.getCloneActionItem().should('not.exist')
    marketplace.getEditActionItem().should('not.exist')
    marketplace.getDeleteActionItem().should('not.exist')
    marketplace.getEditButton().should('not.exist')
    marketplace.getSendButton().should('exist')
  })

  it(`tests that user role can import, create, edit and delete a contact`, function () {
    //tests that the user cannot see the Contacts made before (not shared between users)
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.getRowByText('Maria Lara').should('not.exist')
    universal.getNoItemsMessage().should('exist')

    //tests that the Contacts Table Page renders as it should for a user
    contacts.getImportContactsButton().should('exist')
    contacts.getCreateContactLink().should('exist')

    //tests that user role can import, create, edit and delete a contact
    cy.crudContacts({
      filename: 'user',
      firstName: 'Vivian',
      lastName: 'Lee',
      company: 'Viv Industries',
      title: 'User Role',
      email: 'vlee@postal.com',
      tags: 'cat',
      deleting: 'Marsha Mullins',
    })
    //tests that the user can see everything on the Contact Page
    contacts.getSearchContactsInput().should('be.visible').clear().fill('VivianUP')
    contacts.getContactLinkByName('VivianUP LeeUP').click()
    universal.getSpinner().should('not.exist')
    //universal.getStatsCard().should('exist')
    contacts.getSubscriptionsTab().should('exist')
  })

  it(`tests that user will surface an 'ask admin to add funds' prompt when a user tries to send an item and goes over balance`, function () {
    //uses the $10 approved postal seeded in UAM to go over the balance
    //in order to test the 'Add Funds' workflow
    //a user should not be able to add funds
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getSearchContactsInput().clear().fill('VivianUP')
    universal.getRowsInATableBody().should('have.length', 1)
    cy.clickCheckbox({ name: 'VivianUP LeeUP' })
    contacts.getSendItemButton().click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    universal.getUISpinner().should('not.exist')
    sendItem.getGiftEmailMessageInput().fill('Hi')
    sendItem.getReviewButton().click()
    sendItem.getAddFundsToConfirmSendButton().click()
    sendItem.getAdminShouldAddFundsText().should('be.visible')
  })

  it(`tests that the user can send a postal`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    contacts.getSearchContactsInput().clear()
    cy.clickCheckbox({ name: 'Frederick Marks' })
    contacts.getSendItemButton().click()
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
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getConfirmSendModal().should('not.exist')
    cy.contains('Success! Your item is on the way!').should('be.visible')
  })

  // it(`tests that a user role can create and edit campaigns and add and remove contacts in a campaign `, function () {
  //   //tests that the user cannot see the Campaigns from before
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   universal.getRowByText('U/A/M Campaign').should('not.exist')
  //   campaigns.getMyCampaignsLink().should('exist')
  //   campaigns.getAllCampaignsLink().should('not.exist')
  //   //tests that a user role can create and edit campaigns and add and remove contacts in a campaign
  //   cy.crudCampaigns({ name: 'UserMade', postalName: 'Postcard' })
  //   //uses cy.wait('@getgetBackgroundTaskById')
  //   cy.contactsAndCampaigns({ contact: 'Erica', campaign: 'UserMadeUP' })
  //   //})
  //   //it(`tests that a user can see Stats/Campaigns/Teams/Postals in 'You' profile`, function () {
  //   profile.visitProfile()
  //   universal.getSpinner().should('not.exist')
  //   profile.getYouDetailsCardByName('Hannah Huser').should('exist')
  //   profile.getEmailIntegrationCard().should('exist')
  //   profile.getStatsCard().should('exist')
  //   profile.getCampaignsCard().should('exist')
  //   profile.getTeamsCard().should('exist')
  //   universal.getOrdersCard().should('exist')
  // })

  it(`tests that user cannot see the previous orders from other users in other roles`, function () {
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    //Marks is a contact imported while in the user role.
    //if a user could see all orders the length would be longer than just this one
    universal.getRowsInATableBody().should('have.length', 1).and('contain', 'Frederick Marks')
    onlyOn(Cypress.env('testUrl'), () => {
      //tests that the seeded accepted magicLink created in the U/A/M role is not visible
      universal.getRowByText('MagicLink 0').should('not.exist')
    })
    reporting.getExportButton().click().should('not.have.attr', 'data-loading')
    universal.getThingSpinner().should('not.exist')
    reporting.getRecentExportsTab().click()
    universal.getSpinner().should('not.exist')
    //tomorrows date only included as flake fix for the occasional mismatch in UTC for remote runs
    const todaysOrderReport = `Order Report ${format(new Date(), 'MM-dd-yyyy')}`
    const tomorrowsOrderReport = `Order Report ${format(addDays(new Date(), 1), 'MM-dd-yyyy')}`
    universal.getRowByText(RegExp(todaysOrderReport + '|' + tomorrowsOrderReport))
    //test that the user cannnot see group by filters
    reporting.visitOverview()
    universal.getSpinner().should('not.exist')
    reporting.getDisplayByDiv().should('not.exist')
    reporting.getUserRadio().should('not.exist')
    reporting.getTeamRadio().should('not.exist')
    reporting.getThisMonthButton().should('exist')
  })

  it(`tests that a user role can see all items in marketplace when enabled but can only request new items`, function () {
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    marketplace.getApprovedItemsCheckbox().should('not.be.checked')
    cy.wait(1800)
    cy.contains('a', 'Def Leppard T-Shirt').should('be.visible').scrollIntoView()
    cy.contains('a', 'Def Leppard T-Shirt').click()
    cy.findAllByText('Def Leppard T-Shirt')
    marketplace.getApproveThisButton().should('not.exist')
    marketplace.getRequestItemButton().click()
    marketplace
      .getRequestSentModal()
      .should('be.visible')
      .within(() => {
        cy.findAllByPlaceholderText('(Optional) Include a note to your Admin(s)')
          .should('exist')
          .fill('This is a thing I want.')
        marketplace.getSendRequestButton().click()
      })
    cy.contains('button', 'Item requested!').should('be.disabled')
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('div', 'USD').click()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle UK').should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click()
    marketplace.getApproveThisButton().should('not.exist')
    marketplace.getRequestItemButton().click()
    marketplace.getItemAlreadyAvailableModal().within(() => {
      cy.findAllByPlaceholderText('(Optional) Include a note to your Admin(s)').should('not.exist')
      marketplace.getSendRequestButton().click()
    })
    cy.contains('button', 'Item requested!').should('be.disabled')
  })

  it(`tests that a user role can see all events when enabled`, function () {
    //TODO: once events are seeded, tests should include requesting a event as well
    marketplace.visitEvents()
    events.getMyEventsTab().should('be.visible').and('not.be.checked')
  })

  it(`tests that user cannot see previous MagicLinks but can create, edit, and delete new ones`, function () {
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    magicLinks.getCreateANewLinkButton().should('exist')
    universal.getRowByText('MagicLink 0').should('not.exist')
    cy.crudMagicLinks({})
  })

  it(`tests that a user role can see previous Subscriptions but cannot create new ones`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One')
  })

  it(`tests that a user role can see a Playbook's profile and add contacts but cannot edit`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One').click({ force: true })
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookStatusCard().within(() => {
      subscriptions.getPlaybooksEnabledText().should('exist')
      cy.findAllByRole('input').should('not.exist')
    })
    subscriptions.getEditPlaybookButton().should('not.exist')
    subscriptions.getEditStepsIconButton().should('not.exist')
    subscriptions.getEditStepIconButton().should('not.exist')
    subscriptions.getCancelAllButton().should('exist')

    subscriptions.getAddContactsButton().click()
    subscriptions.getAssignPlaybookDrawer().within(() => {
      cy.clickCheckbox({ name: 'Erica Vail' })
      subscriptions.getAssignPlaybookButton().click()
    })
    subscriptions.getAssignPlaybookDrawer().should('not.exist')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Erica Vail')) {
        cy.wait(55000)
        cy.reload()
        cy.wait(600)
      }
    })
    //universal.getThingSpinner().should('not.exist')
    universal.getRowByText('Erica Vail').within(() => {
      universal.getActionsMenuButton().click()
    })
    subscriptions.getCancelPlaybookMenuItem().should('exist')
  })

  it(`tests that a user can create a collection but cannot share it`, function () {
    cy.filterLocalStorage('postal:items:tabs')
    cy.filterLocalStorage('postal:items:marketplace:filter')
    cy.filterLocalStorage('postal:items:approved:filter')
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    collections.getNoCollectionsText().should('exist')
    //collections.getNoActiveTeamsCollectionsText().should('exist')
    //collections.getNoActivePrivateCollectionsText().should('not.exist')
    //collections.getShowTeamCollectionsCheckbox().should('not.be.checked').check({ force: true })
    //collections.getNoActiveTeamsCollectionsText().should('not.exist')
    //collections.getNoActivePrivateCollectionsText().should('exist')
    collections.getCreateCollectionButton().click()
    //tests that the teams drop down  and the share checkbox does not exist
    collections.getShareCollectionCheckbox().should('not.exist')
    cy.contains('Teams').should('not.exist')
    cy.crudCollections({ collectionName: 'First User Collection', userRole: 'user' })
    collections.getBackToCollectionsButton().click()
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(600)
    collections.getShowTeamCollectionsCheckbox().check({ force: true })
    collections.getCollectionByName('First User CollectionEdited').should('exist')
    collections.getShowTeamCollectionsCheckbox().uncheck({ force: true })
    collections.getCollectionByName('First User CollectionEdited').should('not.exist')
    cy.contains('No active collections ').should('exist')
  })

  it(`tests that all items and all events are now hidden for a user when those settings are disabled`, function () {
    //Log outs and change settings to test
    cy.login(userUAM)
    cy.createApprovedPostal({ name: 'Def Leppard T-Shirt' })
    accountInfo.visitAccountInfo()
    universal.getSpinner().should('not.exist')
    accountInfo.getEditCompanyInfoButton().should('be.visible')
    accountInfo.getViewAllItemsCheckbox().as('itemsToggle').should('be.checked')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'updateAccount') {
        req.alias = 'updateAccount'
      }
    })
    cy.wait(1000)
    cy.get('@itemsToggle').uncheck({ force: true })
    cy.get('@itemsToggle').should('not.be.checked')
    cy.wait('@updateAccount')
      .its('response.body.data.updateAccount.userCanViewMarketplace')
      .should('eq', false)
    accountInfo.getViewAllEventsCheckbox().as('eventsToggle').should('be.checked')
    cy.get('@eventsToggle').uncheck({ force: true })
    cy.get('@eventsToggle').should('not.be.checked')
    cy.wait('@updateAccount')
      .its('response.body.data.updateAccount.userCanViewEvents')
      .should('eq', false)
    billing.visitBillingFunds()
    universal.waitForSpinner()
    billing.getPooledButton().should('be.visible').find('input').click({ force: true })
    billing.getRemainingBudget().should('contain', '$0.00')
    universal.getSaveButton().click({ force: true })
    universal.getSaveButton().should('not.exist')
    //creates a team collection
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    collections.getCreateCollectionButton().click()
    collections.getNameCollectionInput().should('be.visible').fill('Team Collection')
    cy.contains('div', 'USD').click()

    cy.selectAutoCompleteTeam('Jersey')
    cy.contains('Teams').should('exist')
    collections.getSelectAnItemsButton().click()
    marketplace.getAllItemsTab().should('not.exist')
    universal.getSpinner().should('not.exist')
    bulkSelect.getItemByName('Def Leppard T-Shirt')
    collections.getSelectOptionsButton().click()
    universal.getSpinner().should('not.exist')
    cy.contains('button', 'Create Collection').should('not.be.disabled')
    collections.getSelectedVariantOptionByName('XS').should('be.visible')
    cy.contains('button', 'Create Collection').should('not.be.disabled').click({ force: true })
    universal.getSpinner().should('not.exist')
    cy.contains('Enabled').should('exist')
    cy.wait(300)
    collections.getBackToCollectionsButton().click()
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('No Collections available')) {
        cy.wait(3500)
        cy.reload()
        cy.wait(600)
      }
    })
    collections.getShowTeamCollectionsCheckbox().should('not.be.checked')
    collections.getCollectionByName('Team Collection').should('exist')
    collections.getNoActiveTeamsCollectionsText().should('not.exist')
    collections.getShowTeamCollectionsCheckbox().check({ force: true })
    collections.getCollectionByName('Team Collection').should('not.exist')
    cy.contains('No active collections ').should('exist')

    cy.login(newUser, true)
    cy.visit('/')
    //pollForEqual()
    cy.wait(500)
    universal.getSpinner().should('not.exist')
    navbar.getMarketplaceLink().click()
    universal.getSpinner().should('not.exist')
    cy.wait(2000)
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    marketplace.getApprovedItemsCheckbox().should('exist').and('be.checked').and('be.disabled')
    navbar.getEventsLink().click()
    universal.getSpinner().should('not.exist')
    marketplace.getApprovedItemsCheckbox
    events.getMyEventsTab().should('exist').and('be.checked').and('be.disabled')
    //tests that the new team collection can be seen
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    collections.getShowTeamCollectionsCheckbox().check({ force: true })
    cy.wait(500)
    collections.getCollectionByName('First User Collection').should('exist')
    collections.getShowTeamCollectionsCheckbox().uncheck({ force: true })
    cy.wait(500)
    collections.getNoActiveTeamsCollectionsText().should('not.exist')
    collections.getCollectionByName('Team Collection').should('exist')
  })
  it(`tests user role creating, updating and sending a draft of an order and clicking on the draft in the orders page`, function () {
    cy.crudDraftOrder({ itemName: 'Def Leppard T-Shirt' })
  })
  it(`checks that a user can view and click into the newly created email order`, function () {
    orders.visitOrdersOverview()
    orders.getEmailsCard().within(() => {
      cy.contains('a', 'Def Leppard T-Shirt').click()
    })
    universal.getRetryOrderAgainButton().should('exist')
    cy.contains('Def Leppard T-Shirt').should('exist')
    cy.contains('404').should('not.exist')
  })
  onlyOn(Cypress.env('testUrl'), () => {
    it(`checks that a user can view and click into a magiclink order it created`, function () {
      magicLinks.visitMagicLinks()
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
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
      cy.wait(300)
      cy.contains('404').should('not.exist')
      cy.contains('500').should('not.exist')
    })
  })
  it(`checks that a user can view and click into a direct order it created`, function () {
    orders.visitOrdersOverview()
    orders.getDirectsCard().within(() => {
      cy.wait(300)
      //checks that it cannot see orders from previous roles
      cy.contains('Maria Lara').should('not.exist')
      cy.contains('a', 'U/A/M approved').click()
    })
    universal.getOrderAgainButton().should('exist')
    cy.contains('U/A/M approved').should('exist')
    cy.contains('Frederick Marks').should('exist')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('unexpected error').should('not.exist')
  })
})

// const pollForEqual = () => {
//   cy.wait(`@getAccount`).then((response) => {
//     if (
//       response.response?.body?.data?.getAccount === undefined ||
//       response.response?.body?.data?.getAccount.settings.budget.mode !== 'POOLED'
//     ) {
//       pollForEqual()
//     } else {
//       cy.wrap(response.response?.body?.data?.getAccount.settings.budget.mode).should('eq', 'POOLED')
//     }
//   })
// }
