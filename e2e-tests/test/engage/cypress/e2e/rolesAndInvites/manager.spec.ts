import { onlyOn } from '@cypress/skip-test'
import { addDays, format } from 'date-fns'
import { FakeUser, userFactory } from '../../support/factories'
import {
  AccountInfo,
  Contacts,
  MagicLinks,
  Marketplace,
  Navbar,
  Orders,
  Profile,
  Reporting,
  Subscriptions,
  Universal,
} from '../../support/pageObjects'
import { SeedingUAMResponse } from '../../support/rolesAndInvites/uam'
import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'

describe('Roles & Invites - MANAGER testing', function () {
  //used pageObject models
  const accountInfo = new AccountInfo()
  const contacts = new Contacts()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const orders = new Orders()
  const profile = new Profile()
  const reporting = new Reporting()
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
              userName: manager.email,
              firstName: 'Ave',
              lastName: 'Manageria',
              company: 'AveManageria',
            })
            cy.completeInvitation({
              id: manager.managerId,
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
  })

  it(`tests that manager can see what it should in the navbar and profile sidebar`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getYouLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    cy.contains('Ave Manageria').should('exist')
    profile.getEmailSettingsLink().should('exist')
    profile.getNotificationsLink().should('exist')
    profile.getMeetingSettingsLink().should('exist')
    navbar.getNavbarLeft().within(() => {
      navbar.getContactsLink().should('be.visible')
      navbar.getMarketplaceLink().should('be.visible')
      navbar.getEventsLink().should('be.visible')
      navbar.getReportingLink().should('be.visible')
      universal.getMoreMenu().should('be.visible').trigger('click', { force: true })
    })
    navbar.getMagicLinkMenuItem().should('exist')
    navbar.getSubscriptionsMenuItem().should('exist')
    navbar.getCollectionsMenuItem().should('exist')
    navbar.getConciergeMenuItem().should('exist')
    navbar.getTriggersMenuItem().should('not.exist')
    profile.visitProfile()
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
    navbar.getNavbarLeft().within(() => {
      universal.getMoreMenu().should('be.visible').trigger('click', { force: true })
    })
    navbar.getTriggersMenuItem().should('not.exist')
  })

  it(`tests that a manager can see approved postals from before`, function () {
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
    marketplace.getNewPostalByName('Chipotle')
    marketplace.getNewPostalByName('AdminOnly')
  })

  it(`tests that a manager cannot edit, remove, or send approved postals`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.wait(1200)
    cy.contains('a', 'U/A/M approved').click()
    universal.getSpinner().should('not.exist')
    marketplace.getEditButton().should('not.exist')
    marketplace.getSendButton().should('not.exist')
    marketplace.getCreateAMagicLinkButton().should('not.exist')
    cy.contains('U/A/M approved').should('exist')
  })

  it(`tests that the manager can see the Contacts made before`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.getRowByText('Maria Lara').should('be.visible')
    universal.getRowByText('VivianUp LeeUp').should('exist')
    universal.getRowByText('VelmaUP AndrewsUP').should('exist')
    universal.getRowByText('TonyUP FauciUP').should('exist')
    universal.getRowByText('WillowsUP WilbyUP').should('exist')
  })

  it(`tests that the Contacts Table Page renders as it should for a manager`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getImportContactsButton().should('exist')
    contacts.getCreateContactLink().should('exist')
    //contacts.getAddListIconButton().should('exist')
    //todo: revisit all contacts/ my contacts /favorites filter maybe?
    //todo: selecting a contact and adding to favorites and updating lists
    //todo: selecting a contact and then testing the following
    contacts.getSendPlaybookIconButton().should('not.exist')
    contacts.getSendItemButton().should('not.exist')
  })

  it(`tests that the manager can see the Contact's profile page`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getContactLinkByName('Maria Lara').click()
    universal.getSpinner().should('not.exist')
    cy.contains('Date Added').should('exist')
    contacts.getSubscriptionsTab().should('exist')
    contacts.getGroupOrdersTab().should('exist')
  })

  it(`tests contacts crud on a manager role`, function () {
    cy.crudContacts({
      filename: 'manager',
      firstName: 'Hannah',
      lastName: 'Lawry',
      company: 'Lawry Inc',
      title: 'manager Role',
      email: 'hlawry@postal.com',
      tags: 'pillow',
      deleting: 'Elon',
    })
  })
  //Todo: adapt the following if possible for group orders
  // it(`tests that the manager can see the Campaigns from before`, function () {
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   universal.getRowByText('U/A/M Campaign').should('be.visible')
  //   universal.getRowByText('userAdminMade').should('be.visible')
  //   universal.getRowByText('UserManagerMade').should('be.visible')
  //   universal.getRowByText('UserMade').should('be.visible')
  //   campaigns.getMyCampaignsLink().should('not.exist')
  //   campaigns.getAllCampaignsLink().should('exist')
  // })
  // it(`tests campaign edit on a manager role`, function () {
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   universal.getRowByText('U/A/M Campaign').click()
  //   campaigns.getEditCampaignButton().click()
  //   const tomorrow = addDays(new Date(), 1)
  //   const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
  //   campaigns.getUpdateCampaignDrawer().within(() => {
  //     universal.getCloseButtonByLabelText().should('be.visible')
  //     campaigns.getEditNameInput().clear().fill(`U/A/M CampaignUP3`)
  //     campaigns
  //       .getStartDatePickerInput()
  //       .clear()
  //       .type(`${dateFormatInput(tomorrow)}`)
  //     campaigns.getEditStatusSelect().focus().select('SCHEDULED')
  //     campaigns.getUpdateCampaignButton().click()
  //   })
  //   campaigns.getUpdateCampaignDrawer().should('not.exist')
  //   navbar.getNavbarCenter().should('contain', 'U/A/M CampaignUP3')
  //   campaigns.getCampaignDetailsCard().within(() => {
  //     campaigns.getStatus().should('contain', 'SCHEDULED')
  //   })
  // })
  // it(`tests that the manager can add and remove a contact to a campaign`, function () {
  //   campaigns.visitOrders()
  //   universal.getSpinner().should('not.exist')
  //   universal.getRowByText('U/A/M CampaignUP3').click()
  //   cy.contactsAndCampaigns({ contact: 'Maria Lara', campaign: 'U/A/M CampaignUP3' })
  // })
  it(`tests that the manager cannot send a postal`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getSendItemButton().should('not.exist')
  })

  it(`tests that manager cannot see the Campaigns, Stats, and Orders blocks in 'You' profile`, function () {
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getYouDetailsCardByName('Ave Manageria').should('exist')
    profile.getEmailIntegrationCard().should('exist')
    profile.getTeamsCard().should('exist')
    profile.getStatsCard().should('not.exist')
  })

  it(`tests that manager can see the previous orders from other users in other roles`, function () {
    // since manager cannot send anything, any orders that show up in activity/reports
    // will prove that manager can see previous orders generated by other users in other roles
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

    //tests that manager can see previous MagicLinks but cannot create new ones
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    universal.getRowByText('MagicLink 0').should('exist')
    magicLinks.getCreateAMagicLinkButton().should('not.exist')

    //tests that manager can see previous Playbooks but cannot create new ones
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One')
  })

  it(`tests that manager can see a Playbook's profile but cannot edit or add contacts`, function () {
    // cy.queryForUpdateRecurse({
    //   request: SearchPlaybookInstancesDocument,
    //   options: { name: { eq: 'Subscription One' } },
    //   operationName: 'searchPlaybookInstances',
    //   key: '0',
    //   value: 'Maria Lara',
    //   key2: 'contactName',
    // })
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getPlaybookByName('Subscription One').click({ force: true })
    universal.getSpinner().should('not.exist')
    subscriptions.getContactsCard().within(() => {
      subscriptions.getAddContactsButton().should('not.exist')
      subscriptions.getCancelAllButton().should('not.exist')
    })
    subscriptions.getPlaybookStatusCard().within(() => {
      subscriptions.getPlaybooksEnabledText().should('exist')
      cy.findAllByRole('input').should('not.exist')
    })
    subscriptions.getEditPlaybookButton().should('not.exist')
    subscriptions.getEditStepsIconButton().should('not.exist')
    subscriptions.getEditStepIconButton().should('not.exist')
    universal.progressBarZero()
    cy.contains('Day 0').should('be.visible')
    //universal.getRowByText('Maria Lara').should('exist')
  })

  it(`tests that a manager can see and click into a draft order created in another role`, function () {
    //Log outs
    cy.login(userUAM)
    accountInfo.visitAccountInfo()
    universal.getSpinner().should('not.exist')
    accountInfo.getEditCompanyInfoButton().should('be.visible')
    //needed to send the email order
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
    //creates and sends an email order to test later
    cy.createEmailOrder({ itemName: 'Chipotle' })

    //creates a draft order to test later
    cy.crudDraftOrder({ itemName: 'Chipotle', draftName: 'U/A/M draft', justCreate: true })
    cy.url().should('include', 'orders')
    orders.getDraftsCard().within(() => {
      cy.contains('a', 'U/A/M draft').should('exist')
    })
    //log back in to manager
    cy.login(newUser, true)
    profile.visitProfile()
    cy.contains('Ave Manageria')
    profile.getTeamsCard().within(() => {
      cy.contains('User').should('not.exist')
      cy.contains('Admin').should('not.exist')
      cy.contains('Manager').should('exist')
    })

    //checks that a Manager can view and click into a draft order created in the U/A/M role
    orders.visitOrdersOverview()
    orders.getDraftsCard().within(() => {
      cy.contains('a', 'U/A/M draft').click()
    })
    cy.contains('Only those with the User role can send items - you will not be able to send.')
    cy.wait(300)
    cy.contains('404').should('not.exist')
    cy.contains('500').should('not.exist')
    //todo: edit draft again?
  })
  it(`checks that a Manager can view and click into a email order created in the U/A/M role`, function () {
    orders.visitOrdersOverview()
    orders.getEmailsCard().within(() => {
      cy.contains('a', 'Chipotle').click()
    })
    cy.contains('Chipotle').should('exist')
    cy.contains('404').should('not.exist')
  })
  onlyOn(Cypress.env('testUrl'), () => {
    it(`checks that a Manager can view and click into a magiclink order created in the U/A/M role`, function () {
      orders.visitOrdersOverview()
      orders.getMagicLinksCard().scrollIntoView()
      orders.getMagicLinksCard().within(() => {
        cy.contains('a', RegExp('U/A/M approved' + '|' + 'Postcard')).click()
      })
      universal.getRetryOrderAgainButton().should('not.exist')
      cy.contains('a', 'View MagicLink').should('exist')
      cy.contains('Postcard').should('exist')
      cy.contains('404').should('not.exist')
    })
  })
  it(`checks that a Manager can view and click into a direct order created in the U/A/M role`, function () {
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
