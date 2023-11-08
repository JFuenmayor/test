import { onlyOn } from '@cypress/skip-test'
import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { FakeUser, userFactory } from '../../support/factories'
import {
  Contacts,
  Delivery,
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

describe('Roles & Invites - USER/MANAGER testing', function () {
  const contacts = new Contacts()
  const delivery = new Delivery()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const orders = new Orders()
  const profile = new Profile()
  const reporting = new Reporting()
  const sendItem = new SendItem()
  const subscriptions = new Subscriptions()
  const universal = new Universal()

  const userUAM = userFactory()
  let accountId: string
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
      })
      .then(() => {
        cy.seedingUAM(accountId)
          .then((res) => {
            user = res.user
            userAdmin = res.userAdmin
            manager = res.manager
            managerAdmin = res.managerAdmin
            userManager = res.userManager
            admin = res.admin
            approvedPostalId = res.approvedPostalId
            approvedVariantId = res.approvedVariantId
            //creates a draft order to test later
            cy.crudDraftOrder({ itemName: 'Chipotle', draftName: 'U/A/M draft', justCreate: true })
            cy.url().should('include', 'orders')
            cy.wait(400)
            cy.get('body').then(($body) => {
              if ($body.text().includes('unexpected error')) {
                cy.reload()
              }
            })
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
            cy.seedingManagerAdmin({
              inviteId: managerAdmin.managerAdminId,
              userName: managerAdmin.email,
              accountId,
            })
          })
          .then(() => {
            newUser = userFactory({
              userName: userManager.email,
              firstName: 'User',
              lastName: 'Manager',
              company: 'UserManager',
            })
            cy.completeInvitation({
              id: userManager.userManagerId,
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
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
    })
  })

  it(`tests that user/manager can see what it should in the navbar and profile sidebar`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    cy.url().should('contain', 'profile')
    profile.getYouLink().should('exist')
    profile.getBudgetHistoryLink()
    cy.contains('User Manager').should('exist')
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
    profile.getSavedMessagesLink().should('not.exist')
    profile.getEmailSettingsLink().should('exist').click()
    cy.url().should('contain', '/account/email-settings')
    profile.getGiftEmailsLink().should('not.exist')
    profile.getEmailTemplatesLink().should('not.exist')
    navbar.getNavbarLeft().within(() => {
      universal.getMoreMenu().trigger('click', { force: true })
    })
    navbar.getTriggersMenuItem().should('exist')
    navbar.getBudgetElement().should('not.exist')
  })

  it(`tests that a user/manager can see the postals from before and the 'send postal' button but can't edit/clone/delete them`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
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
    marketplace.getNewPostalByName('AdminOnly')
    marketplace.getNewPostalByName('Chipotle')
    cy.contains('a', 'U/A/M approved').click()
    cy.wait(1200)
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
    cy.contains('U/A/M approved').should('exist')
    marketplace.getEditButton().should('not.exist')
    marketplace.getSendButton().should('exist')
    marketplace.getMagicLinkButton().should('not.exist')
  })

  it(`tests that the user/manager can see the Contacts made before`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.getRowByText('Maria Lara').should('be.visible')
    universal.getRowByText('VivianUp LeeUp').should('exist')
    universal.getRowByText('VelmaUP AndrewsUP').should('exist')
    universal.getRowByText('WillowsUP WilbyUP').should('exist')
    universal.getRowByText('HannahUP LawryUP').should('exist')
  })

  it(`tests that the Contacts Table Page renders as it should for a user/manager`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getImportContactsButton().should('exist')
    contacts.getCreateContactLink().should('exist')
    cy.clickCheckboxByRowNumber({ num: 1 })
    contacts.getSendPlaybookIconButton().should('not.exist')
    contacts.getSendItemButton().should('exist')
    contacts.getAddListIconButton().should('exist')
  })

  it(`tests that user/manager role can import, create, edit and delete a contact`, function () {
    cy.crudContacts({
      filename: 'userManager',
      firstName: 'Tony',
      lastName: 'Fauci',
      company: 'Fauci Co',
      title: 'userManager Role',
      email: 'tfauci@postal.com',
      tags: 'dr',
      deleting: 'Sandra Birx',
    })
  })

  it(`tests that user/manager will surface an 'ask admin to add funds' prompt when a user tries to send an item and goes over balance`, function () {
    //uses the really expensive approved postal seeded in UAM
    //in order to test the 'Add Funds' workflow
    //a user/manager should not be able to add funds
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getSearchContactsInput().clear().fill('TonyUP FauciUP')
    universal.getRowsInATableBody().should('have.length', 1)
    cy.clickCheckbox({ name: 'TonyUP FauciUP' })
    contacts.getSendItemButton().should('be.enabled').click()
    Cypress.on('uncaught:exception', () => {
      return false
    })
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    sendItem.getGiftEmailMessageInput().fill('Hi')
    sendItem.getReviewButton().click()
    sendItem.getAddFundsToConfirmSendButton().click()
    sendItem.getAdminShouldAddFundsText().should('be.visible')
  })

  it(`tests that the user can send a postal`, function () {
    //the following line should not be necessary if itblock are re-instated
    cy.filterLocalStorage('postal:filters:contacts')
    //tests that the user/manager can send a postal
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.clickCheckbox({ name: 'TonyUP FauciUP' })
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
    cy.wait(3000)
    sendItem.getReviewShippingAndPostage().should('be.visible')
    cy.contains('$').should('be.visible')
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getConfirmSendModal().should('not.exist')
    sendItem.getReviewDrawer().should('not.exist')
  })

  it(`tests that the user/manager can see everything on the Contact Page`, function () {
    contacts.visitContacts()
    contacts.getSearchContactsInput().clear().fill('TonyUP FauciUP')
    contacts.getContactLinkByName('TonyUP FauciUP').click()
    universal.getSpinner().should('not.exist')
    //universal.getStatsCard().should('exist')
    contacts.getSubscriptionsTab().should('exist')
  })

  //it(`tests that the user/manager can see the Campaigns from before`, function () {
  // campaigns.visitOrders()
  // universal.getSpinner().should('not.exist')
  // universal.getRowByText('U/A/M Campaign').should('be.visible')
  // universal.getRowByText('userAdminMade').should('be.visible')
  // universal.getRowByText('UserMade').should('be.visible')
  // campaigns.getMyCampaignsLink().should('exist')
  // campaigns.getAllCampaignsLink().should('exist')
  //})

  // it(`tests that a user/manager role can create and edit campaigns and add and remove contacts in a campaign`, function () {
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   cy.crudCampaigns({ name: 'UserManagerMade', postalName: 'U/A/M approved' })
  //   //uses cy.wait('@getgetBackgroundTaskById')
  //   cy.contactsAndCampaigns({ contact: 'Julian', campaign: 'UserManagerMadeUP' })
  // })

  it(`tests that a user/manager can see Stats in 'You' profile`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getStatsCard().should('exist')
    //profile.getCampaignsCard().should('exist')
  })

  it(`tests that a user/manager can see the previous orders from other users in other roles`, function () {
    // the user/manager sent one postal in this test suite with the Tony Fausci contact
    // searching for a report containing Maria Lara will confirm
    // user/manager can see a previous order from other users in other roles
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
  })

  it(`tests that user/manager can see previous MagicLinks and can create new ones`, function () {
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    magicLinks.getCreateANewLinkButton().should('exist')
    universal.getRowByText('MagicLink 0').should('exist')
    cy.crudMagicLinks({})
  })

  it(`tests that user/manager can see previous Playbooks but cannot create`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One')
  })

  it(`tests that user/manager can see a Playbook's profile and add contacts but cannot edit`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One').click({ force: true })
    universal.getSpinner().should('not.exist')
    subscriptions.getAddContactsButton().should('exist')
    subscriptions.getPlaybookStatusCard().within(() => {
      subscriptions.getPlaybooksEnabledText().should('exist')
      cy.findAllByRole('input').should('not.exist')
    })
    subscriptions.getEditPlaybookButton().should('not.exist')
    subscriptions.getEditStepsIconButton().should('not.exist')
    subscriptions.getEditStepIconButton().should('not.exist')
    subscriptions.getCancelAllButton().should('exist')
    subscriptions.getAddContactsButton().click()
    universal.progressBarZero()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('TonyUP FauciUP')) {
        subscriptions.getAssignPlaybookDrawer().within(() => {
          cy.clickCheckbox({ name: 'TonyUP FauciUP' })
          subscriptions.getAssignPlaybookButton().click()
        })
      } else {
        universal.getAngleRightButton().click({ force: true })
        subscriptions.getAssignPlaybookDrawer().within(() => {
          cy.clickCheckbox({ name: 'TonyUP FauciUP' })
          subscriptions.getAssignPlaybookButton().click()
        })
      }
    })
    subscriptions.getAssignPlaybookDrawer().should('not.exist')
    //universal.getThingSpinner().should('not.exist')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('TonyUP FauciUP')) {
        cy.wait(35000)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getRowByText('TonyUP FauciUP').within(() => {
      universal.getActionsMenuButton().click()
    })
    subscriptions.getCancelPlaybookMenuItem().should('exist')
  })
  it(`tests that user/manager can view a draft order created in the U/A/M role and click into it`, function () {
    orders.visitOrdersOverview()
    orders.getDraftsCard().within(() => {
      cy.contains('a', 'U/A/M draft').should('exist')
      cy.contains('a', 'U/A/M draft').click()
    })
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains('Chipotle').should('exist')
    cy.contains('0 Recipients').should('exist')
  })
  it(`tests user/manager role creating, updating and sending a draft of an order and clicking on the draft in the orders page`, function () {
    cy.login(userUAM)
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 990,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    cy.login(newUser, true)
    cy.crudDraftOrder({ itemName: 'Chipotle', draftName: 'New Draft' })
  })
  it(`checks that a user/manager can view and click into the newly created email order`, function () {
    orders.visitOrdersOverview()
    orders.getEmailsCard().within(() => {
      cy.contains('a', 'Chipotle').click()
    })
    universal.getRetryOrderButton().should('exist')
    cy.contains('Chipotle').should('exist')
    cy.contains('Back to Home').should('not.exist')
  })
  onlyOn(Cypress.env('testUrl'), () => {
    it(`checks that a user/manager can view and click into a magiclink order created in the U/A/M role`, function () {
      cy.wait(1000)
      cy.visit('/orders/links')
      orders.getMagicLinksCard().within(() => {
        cy.contains('a', 'Postcard').click()
      })
      universal.getRetryOrderAgainButton().should('not.exist')
      cy.contains('a', 'View MagicLink').should('exist')
      cy.contains('Postcard').should('exist')
      cy.contains('404').should('not.exist')
    })

    it(`checks that a user/manager can view and click into a magiclink order it created`, function () {
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
  it(`checks that a user/manager can view and click into a direct order created in the U/A/M role`, function () {
    cy.visit('/orders/direct')
    orders.getDirectsCard().scrollIntoView()
    cy.wait(300)
    orders.getDirectsCard().within(() => {
      //checks that it sees the orders made in other roles too
      cy.findAllByText('U/A/M approved').eq(0).scrollIntoView()
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
  it(`checks that a user/manager can view and click into a direct order it created`, function () {
    orders.visitOrdersOverview()
    orders.getDirectsCard().scrollIntoView()
    cy.wait(300)
    orders.getDirectsCard().within(() => {
      universal.getRowByText('TonyUP FauciUP').within(() => {
        cy.contains('a', 'U/A/M approved').click()
      })
    })
    universal.getOrderAgainButton().should('exist')
    cy.contains('U/A/M approved').should('exist')
    cy.contains('TonyUP FauciUP').should('exist')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('unexpected error').should('not.exist')
  })
})
