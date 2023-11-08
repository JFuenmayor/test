import '@4tw/cypress-drag-drop'
import { faker } from '@faker-js/faker'
import {
  AddressSource,
  ContactType,
  InviteDocument,
  InviteOrderByInput,
  InvitesDocument,
  PhoneType,
  SearchContactsV2Document,
  UpsertContactDocument,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  BulkSelect,
  Collections,
  Contacts,
  DesignEditor,
  Events,
  Marketplace,
  Navbar,
  Profile,
  SavedMessages,
  SendItem,
  SidePanel,
  Teams,
  Universal,
  Users,
} from '../../support/pageObjects'

describe('TeamAdmin Role Testing', function () {
  const userUAM = userFactory()
  const teamAdmin = userFactory()
  const userSec = userFactory()
  const teamAdminInvited = userFactory()

  const bulkSelect = new BulkSelect()
  const collections = new Collections()
  const contacts = new Contacts()
  const designEditor = new DesignEditor()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const profile = new Profile()
  const savedMessages = new SavedMessages()
  const sendItem = new SendItem()
  const sidePanel = new SidePanel()
  const teams = new Teams()
  const users = new Users()
  const universal = new Universal()
  const events = new Events()
  let teamsIds: any

  before(function () {
    cy.rolesSetupA(userUAM).then((res) => {
      cy.setupForTeamAdmin({ accountId: res.accountId, uamUser: userUAM }).then((resteamid) => {
        teamsIds = resteamid
      })
    })
  })

  beforeEach(() => {
    cy.login(userUAM)
    cy.filterLocalStorage('postal:items:tabs')
    cy.filterLocalStorage('postal:items:marketplace:filter')
    cy.filterLocalStorage('postal:items:approved:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'searchApprovedPostals') {
        req.alias = 'searchApprovedPostals'
      }
      if (req.body.operationName === 'getBudgetRemaining') {
        req.alias = 'getBudgetRemaining'
      }
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
    })
  })

  it(`tests the teamAdmin role `, function () {
    //invites a user with a team admin role via click-through
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()

    users.getInviteUserButton().click()
    users.getInviteUserModal().within(() => {
      cy.findByRole('button', { name: 'User' }).click()
      cy.findByRole('menuitemcheckbox', { name: 'Admin' }).should('exist')
      users.getInviteToTeamButton().should('be.disabled')
      users.getEmailAddressInput().type(teamAdmin.userName, { force: true })
      cy.selectAutoCompleteTeam('secondTeam')
      cy.findByRole('button', { name: 'User' }).click()
      cy.findByRole('menuitemcheckbox', { name: 'Admin' }).should('not.exist')
      cy.findByRole('menuitemcheckbox', { name: 'User' }).click()
      cy.contains('[role="menuitemcheckbox"]', 'Team Admin').click()
      users.getInviteToTeamButton().click({ force: true })
    })
    users.getInvitationsTab().click()
    universal.getRowByText(teamAdmin.userName).should('exist')
    cy.graphqlRequest(InvitesDocument, {
      filter: { emailAddress: { eq: teamAdmin.userName } },
      orderBy: InviteOrderByInput.CreatedDesc,
      limit: 100,
    }).then((resp) => {
      const invite = resp.invites?.[0]

      cy.completeInvitation({
        id: invite?.id ?? '',
        firstName: teamAdmin.firstName,
        lastName: teamAdmin.lastName,
        password: teamAdmin.password,
      })
      cy.login(teamAdmin)
    })

    //cy.visit('/')

    // tests that teamadmin can see what it should in the navbar and profile sidebar
    profile.visitProfile()
    cy.url().should('include', '/profile')
    universal.getSpinner().should('not.exist')
    profile.getYouLink().should('exist')
    profile.getTeamLink().should('exist')
    profile.getBudgetHistoryLink().should('exist')
    profile.getNotificationsLink().should('exist')
    profile.getSavedMessagesLink().should('exist')
    profile.getMeetingSettingsLink().should('exist')
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

    // tests that a teamadmin cannot see what it shouldn't in the navbar and profile sidebar
    universal.getSpinner().should('not.exist')
    profile.getUsersLink().should('not.exist')
    profile.getBrandingLink().should('not.exist')
    profile.getIntegrationsLink().should('not.exist')
    profile.getBillingLink().should('not.exist')
    profile.getFundsLink().should('not.exist')
    profile.getAccountsLink().should('not.exist')
    profile.getTransfersLink().should('not.exist')
    profile.getAccountSettingsLink().should('not.exist')
    profile.getEmailSettingsLink().should('not.exist')
    profile.getGiftEmailsLink().should('not.exist')
    profile.getEmailTemplatesLink().should('not.exist')
    profile.getWarehousingLink().should('not.exist')
    navbar.getNavbarLeft().within(() => {
      navbar.getOrdersLink().should('not.exist')
      navbar.getCampaignsLink().should('not.exist')
      navbar.getContactsLink().should('not.exist')
      universal.getMoreMenu().should('be.visible')
      universal.getMoreMenu().should('be.visible').trigger('click', { force: true })
    })
    navbar.getMagicLinkMenuItem().should('not.exist')

    //saved messages testing for team admin
    navbar.getMarketplaceLink().should('be.visible')
    cy.findAllByTestId('atomic-subnavbar-right')
      .eq(0)
      .within(() => {
        const truncatedName = teamAdmin.firstName.slice(0, 12)
        cy.contains(truncatedName)
      })

    //navbar.getProfileData().should('be.visible').and('contain', teamAdmin.firstName)
    //team admin can create/edit/delete a saved message
    cy.crudMessages({ header: 'Team Admin Made', body: 'Shared with Second Team' })
    //team admin can only view messages shared with that team in the saved messages page
    savedMessages.getMessageCardByTitle('Saved Message For Default Team').should('not.exist')
    cy.findAllByTestId('ui-card').should('have.length', 1)

    //items testing
    //team admin can create/clone/edit/delete a marketplace item
    //uses cy.wait('@getgetBackgroundTaskById') and cy.wait('@searchApprovedPostals')
    cy.crudPostals({ postalName: 'Second Team Shared', role: 'TeamAdmin Made', team: 'secondTeam' })
    marketplace.getAllItems().should('have.length', 6)
    universal.getUISpinner().should('not.exist')
    marketplace.getNewPostalByName('Second Team Shared').should('exist')
    //team admin can view cannot edit item assigned to no team
    marketplace.viewItemByName('Postcard')
    universal.getSpinner().should('not.exist')
    marketplace.getEditButton().should('not.exist')
    return cy.findByRole('button', { name: 'back_to_approved_items' }).click()
    cy.wait(800)

    //checks that an item shared with the team admins team and another team is not editable
    marketplace.viewItemByName('Notecard')
    marketplace.getAvailableTeams().should('not.exist')
    marketplace.getEditButton().should('not.exist')

    //tests that all account level messages appear in addition to the team admin shared message
    marketplace.visitAllItems()
    marketplace.getPostcardButton().click({ force: true })
    marketplace.getApproveThisButton().click()
    marketplace.getEditDesignButton().click()
    cy.get('canvas').eq(1).as('dropCanvas')
    // @ts-ignore
    designEditor.getTextElement().drag('@dropCanvas', { position: 'center' })
    savedMessages.getSavedMessageButton().click()
    savedMessages.getSavedMessagesDrawer().within(() => {
      cy.findAllByTestId('ui-card').should('have.length.gte', 8)
      savedMessages.getMessageCardByTitle('Team Admin Made').should('exist')
      savedMessages.getMessageCardByTitle('Saved Message For Default Team').should('exist')
      savedMessages.getMessageCardByTitle('Win Back')
    })

    //colections testing
    cy.filterLocalStorage('postal:items:tabs')
    cy.filterLocalStorage('postal:items:marketplace:filter')
    cy.filterLocalStorage('postal:items:approved:filter')
    cy.crudCollections({ collectionName: 'First TeamAdmin', userRole: 'teamAdmin' })
    collections.visitCollections()
    collections.getCollectionByName('First TeamAdminEdited')

    //checks that team admin cannot edit a collection assigned to no team
    collections
      .getCollectionByName(`Default Team's collection`)
      .realHover()
      .within(() => {
        collections.getViewCollectionButton().should('be.visible').click({ force: true })
      })
    collections.getEnableThisCollectionButton().should('not.exist')
    //checks that team admin cannot edit a collection assigned to multiple teams that includes itself
    collections.getBackToCollectionsButton().click()
    collections
      .getCollectionByName(`Multi teams collection`)
      .realHover()
      .within(() => {
        collections.getViewCollectionButton().should('be.visible').click({ force: true })
      })
    collections.getEnableThisCollectionButton().should('not.exist')

    //tests that the teamAdmin cannot create a new Team
    profile.visitProfile()
    profile.getTeamLink().click()
    navbar.getNavbarCenter().should('contain', 'secondTeam')
    teams.getCreateTeamButton().should('not.exist')
    teams.getSettingsTab().click()
    teams.getCreateTeamButton().should('not.exist')
    cy.findByText('thirdTeam').should('not.exist')
    cy.findByText(userUAM.company).should('not.exist')
    teams.getTeamCardByName('secondTeam').within(() => {
      teams.getTeamNameEditInput().clear().fill('secondTeamEdited')
      universal.getLinkByText('Edit').should('not.exist')
      teams.getSelectedBillingAccountCard(userUAM.company).should('exist')
      teams.getPooledModeButton().should('be.checked')
      teams.getPerUserModeButton().click({ force: true })
      teams.getMonthlyButton().should('be.checked')
      teams.getYearlyButton().click({ force: true })
      teams.getBudgetAmountInput().clear().type('400')
      universal.getSaveButton().click({ force: true })
    })
    teams.getTeamCardByName('secondTeamEdited').within(() => {
      teams.getPerUserModeButton().should('be.checked')
      teams.getYearlyButton().should('be.checked')
      teams.getBudgetAmountInput().should('have.value', '400')
    })
    //tests that the teamAdmin cannot edit the billing account
    profile.getBillingLink().should('not.exist')

    //team admin can invite user to its own team
    teams.getInvitationsTab().click()
    users.getInviteUserButton().should('be.visible').click()
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'invite') {
        req.alias = 'invite'
      }
    })
    users.getInviteUserModal().within(() => {
      cy.findByRole('button', { name: 'User' }).click()
      users.getInviteToTeamButton().should('be.disabled')
      users.getEmailAddressInput().type(teamAdminInvited.userName, { force: true })
      cy.selectUserRoles('User', 'Manager')
      users.getInviteToTeamButton().click()
    })
    cy.wait('@invite').then((res) => {
      users.getInviteUserModal().within(() => {
        universal.getCloseButton().click()
      })
      universal
        .getRowByText(teamAdminInvited.userName)
        .should('contain', 'secondTeamEdited')
        .and('contain', teamAdmin.userName)
        .and('contain', 'Manager')
        .and('contain', 'Pending')

      const newUser = {
        userName: teamAdminInvited.userName,
        firstName: 'Tallulah',
        lastName: 'Ward',
        password: teamAdmin.password,
        company: teamAdmin.company,
      }
      cy.completeInvitation({
        ...newUser,
        id: res.response?.body.data.invite?.[0]?.invite?.id as string,
      })
    })

    teams.getMembersTab().click()
    universal.waitForProgressBar()
    universal.getRowByText('Tallulah Ward').within(() => {
      cy.findByText(teamAdminInvited.userName).should('be.visible')
      cy.selectUserRoles('Manager')
    })
    //tests team admin can remove/edit roles of users on its team
    users.getRemoveTeamMembershipModal().within(() => {
      universal.getConfirmButton().click()
    })
    universal.getRowByText('Tallulah Ward').should('not.exist')
    //test that team admin can add user to its own team
    teams.getAddUserButton().click()
    users.getAddTeamMembershipModal().within(() => {
      cy.selectAutoCompleteUser(teamAdminInvited.userName)
      users.getUpdateRolesButton().click()
    })
    universal.getRowByText('Tallulah Ward').should('exist')
    //events testing
    //requests a event
    //tests that the approved event is assigned to that team
    cy.crudEvents({ team: 'secondTeam' })
    events.getBackToMyEventsButton().click()
    universal.getSpinner().should('not.exist')
    events.getEventByName('All Teams').click({ force: true })
    universal.getSpinner().should('not.exist')
    events.getEditThisEventButton().should('not.exist')
    events.getBackToMyEventsButton().click()
    universal.getSpinner().should('not.exist')
    events.getEventByName('Two Teams').click({ force: true })
    universal.getSpinner().should('not.exist')
    events.getEditThisEventButton().should('not.exist')

    //team admin can clone an approved event and it will also be assigned to that team
    events.visitMyEvents()
    universal.waitForSpinner()
    events.getEventByName('teamAdminEdited').should('be.visible').click({ force: true })
    universal.getSpinner().should('not.exist')
    universal.getActionsMenuButton().click({ force: true })
    events.getCloneEventMenuItem().click({ force: true })
    events.getCloneEventButton().should('be.visible').click()
    events.getEventByName('teamAdminEdited-CLONE').should('exist')

    //tests that a team admin cannot add to funds when in postal send flow
    profile.visitProfile()
    cy.selectUserRoles('User')
    cy.findByRole('menuitemcheckbox', { name: 'User' }).should('have.attr', 'aria-checked', 'true')
    //reloads so the role change can take
    cy.reload()
    navbar.getContactsLink().should('be.visible')
    cy.graphqlRequest(UpsertContactDocument, {
      data: {
        type: ContactType.Contact,
        addresses: [
          {
            preferred: true,
            source: AddressSource.Manual,
            country: 'USA',
            postalCode: '93405',
            state: 'CA',
            city: 'San Luis Obispo',
            address1: '147 Los Cerros Dr',
            entryName: 'Home',
          },
        ],
        phones: [{ phoneNumber: faker.phone.number(), type: PhoneType.Work }],
        emailAddress: `josephinepoirer${faker.string.alphanumeric(4)}@postal.dev`,
        companyName: faker.company.name(),
        title: faker.person.jobTitle(),
        lastName: 'Poirer',
        firstName: 'Josephine',
      },
    })
    cy.queryForUpdateRecurse({
      request: SearchContactsV2Document,
      operationName: 'searchContactsV2',
      key: 'resultsSummary',
      value: 1,
      key2: 'totalRecords',
    })
    contacts.visitContacts()
    universal.progressBarZero()
    universal.getRowsInATableBody().should('have.length', 1)
    cy.clickCheckbox({ name: 'Josephine Poirer' })
    contacts.getSendItemButton().click()
    marketplace.chooseItemByName(/^First TeamAdminEdited$/)
    sendItem.getGiftEmailMessageInput().fill('Sent via the Team Admin')
    sendItem.getNextButton().click()
    sendItem.getAddFundsToSendItemButton().should('be.visible').click()
    sendItem.getAdminShouldAddFundsText().should('be.visible')

    //team admin can multi-select an approved postal, but only if its assigned to only itself
    marketplace.visitMyItems()
    cy.wait('@getBudgetRemaining')
    cy.wait('@searchApprovedPostals')
    sidePanel.waitForFilterHeader()
    marketplace.getAllItems().should('have.length', 4)
    bulkSelect.getItemByName('Second Team Shared')
    //only two have the correct teams
    cy.findAllByTestId('ui-card').should('have.length', 2)
    marketplace.getNewPostalByName('Second Team Shared').should('exist')
    marketplace.getNewPostalByName('Everybody Lies:').should('exist')
    cy.contains('div', 'Everybody Lies:').click()
    bulkSelect.getBulkEditButton().click()
    bulkSelect.getConfirmBulkUpdateItemsModal().within(() => {
      cy.findByRole('combobox').select('Draft')
      marketplace.getUpdate2ItemsButton().click()
    })
    universal.getAllUiCards().should('have.length', 2)
    marketplace.getNewPostalByName('Notecard').should('exist')
    marketplace.getNewPostalByName('Postcard').should('exist')
    sidePanel.selectFilter('Status', 'Draft')
    universal.getAllUiCards().should('have.length', 2)
    marketplace.getNewPostalByName('Second Team Shared').should('exist')
    marketplace.getNewPostalByName('Everybody Lies:').should('exist')

    //Invites a new user with the Team Admin to the Second Team and tests that the appropriate account and team level things are shared with them
    cy.login(userUAM)
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: [userSec.userName],
        teamId: teamsIds.secondTeam,
        roles: ['TEAM_ADMIN'],
      },
    }).then((res) => {
      cy.completeInvitation({
        ...userSec,
        id: res.invite?.[0]?.invite?.id as string,
      })
      cy.login(userSec)
    })

    savedMessages.visitMessages()
    cy.url().should('not.include', 'saved-messages')
    cy.url().should('include', 'saved-messages')
    savedMessages.getMessageCardByTitle('Team Admin Made').should('exist')
    cy.findAllByTestId('ui-card').should('have.length', 1)
    //tests that the cloned event is shared
    events.visitMyEvents()
    universal.waitForSpinner()
    events.getEventByName('teamAdminEdited').should('be.visible')
  })
})
