import invitesData from '../../fixtures/invitesData'
import { userFactory } from '../../support/factories'
import { Profile, Teams, Universal, Users } from '../../support/pageObjects'

describe(`Teams Table and the default team's Table and Tabs testing`, function () {
  const profile = new Profile()
  const universal = new Universal()
  const users = new Users()
  const teams = new Teams()
  const user = userFactory()
  const company: string = user.company
  const today = new Date().toLocaleDateString('en-US')
  let aymerisEmail: string

  before(function () {
    cy.signup(user)
    cy.contactsSeed()
    cy.teamsSeed()
    cy.usersSeed({})
    cy.invitesSeed()
  })

  beforeEach(() => {
    cy.login(user)
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'invites') {
        req.alias = 'invites'
      }
    })
  })

  it(`tests the default Team's Member's tab`, function () {
    // Team Members Table testing
    // Team Members Table renders as it should
    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    universal.waitForProgressBar()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    //tests that a team's page has a members tab and that it is active
    teams.getMembersTab().should('have.attr', 'aria-selected', 'true')
    //tests that a team's page has a invitations tab and that it is inactive
    teams.getInvitationsTab().should('have.attr', 'aria-selected', 'false')
    //tests that a team's page has a settings tab and that it is inactive
    teams.getSettingsTab().should('have.attr', 'aria-selected', 'false')
    //tests table header text
    universal.getTableHeader().should('contain', teams.membersTableHeaderText())

    cy.findByRole('tablist').within(() => {
      teams.getMembersTab().should('exist')
      teams.getInvitationsTab().should('exist')
      teams.getSettingsTab().should('exist')
    })
    users.getSearchLastName().should('exist')
    users.getSearchFirstName().should('exist')
    users.getSearchEmail().should('exist')
    cy.findByTestId('AutoCompleteTeam').should('not.exist')
    users.getUpdateRolesIconButton().should('exist')
    users.getSelectRolesFilter().should('exist')
    teams.getAddUserButton().should('exist')
    //tests a Team's Members table filtering
    //a Team's Members Table - tests filtering by First Name
    users.getSearchFirstName().should('be.visible').fill('Aymeris')
    universal.waitForProgressBar()
    universal.getRowByText('Aymeris Arnold').should('be.visible')

    //a Team's Members Table - tests filtering by Last Name
    users.getSearchFirstName().clear()
    users.getSearchLastName().fill('Emmerick')
    universal.waitForProgressBar()
    universal.getRowByText('Elio Emmerick').should('be.visible')

    //a Team's Members Table - tests filtering by Email
    users.getSearchLastName().clear()
    users.getSearchEmail().fill('peter.harper')
    universal.waitForProgressBar()
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByText('Peter Harper').should('be.visible')
    universal.getRowsInATableBody().should('have.length', '1')

    //a Team's Members Table - tests filtering by Role
    users.getSearchEmail().clear()
    universal.getRowsInATableBody().should('have.length.gt', 1)
    //tests filtering by Manager Role
    users.getSelectRolesFilter().click({ force: true })
    users.getSelectRoleMenuItemCheckbox('Manager').click({ force: true })
    universal.getRowsInATableBody().should('not.have.length', 10)
    universal.getRowByText(`${user.firstName} ${user.lastName}`).within(() => {
      users.getRolesMenu().should('have.text', 'User, Manager, Admin')
    })
    //clears it
    //cy.contains('button', 'Manager').click({ force: true })
    users.getSelectRoleMenuItemCheckbox('Manager').click({ force: true })
    universal.getRowsInATableBody().should('have.length', 10)
    //tests filtering by User Role
    //users.getSelectRolesFilter().click({ force: true })
    universal.progressBarZero()
    users.getSelectRoleMenuItemCheckbox('User').click({ force: true })
    universal.getRowsInATableBody().should('have.length', 10)
    //clears it
    //cy.contains('button', 'User').click({ force: true })
    users.getSelectRoleMenuItemCheckbox('User').click({ force: true })
    universal.getRowsInATableBody().should('have.length', 10)
    //tests filtering by Admin Role
    //users.getSelectRolesFilter().click({ force: true })
    users.getSelectRoleMenuItemCheckbox('Admin').click({ force: true })
    universal.getRowsInATableBody().should('not.have.length', 10)
    universal.getRowByText(`${user.firstName} ${user.lastName}`).within(() => {
      users.getRolesMenu().should('have.text', 'User, Manager, Admin')
    })
    //clears it
    //cy.contains('button', 'User').click({ force: true })
    //cy.contains('[data-testid="MenuUserRole_button"]', 'Admin').click({ force: true })
    users.getSelectRoleMenuItemCheckbox('Admin').click({ force: true })
    universal.getRowsInATableBody().should('have.length', 10)
    //})

    //it(`tests a Team's Members table pagination`, function () {
    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    universal.progressBarZero()
    //a Team's Members Table - table pagination
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    // 1
    universal.getRowsInATableBody().should('have.length', 10)
    universal.getPagesPaginationButton().should('contain', '1')
    universal.getAngleRightButton().click()
    // 2
    universal.progressBarZero()
    universal.getRowsInATableBody().should('have.length', 6)
    universal.getPagesPaginationButton().should('contain', '2')
    universal.getAngleRightButton().should('be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click()
    // 1
    universal.getPagesPaginationButton().should('contain', '1')
    universal.getAngleLeftButton().should('be.disabled')
    //})
    //it(`tests removing access from the Team for two team members`, function () {
    //tests a Team's Members table - tests selecting all filter results
    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    users.getSearchFirstName().fill('a')
    users.getSearchLastName().fill('ar')
    universal.waitForProgressBar()
    universal.getRowsInATableBody().should('have.length.lte', 6)
    cy.clickCheckbox({ name: 'Aymeris Arnold' })
    cy.clickCheckbox({ name: 'Sandra Parker' })
    //Member's Delete testing
    //tests delete member modal renders as it should
    users.getUpdateRolesIconButton().click()
    users.getUpdatingRolesModal('2').within(() => {
      users.getUpdatingRolesModalText().should('be.visible')
      cy.findByTestId('AutoCompleteTeam').should('not.exist')
      cy.selectUserRoles('Manager')
      users.getSendEmailTooltip().realHover()
    })
    users.getSendEmailTooltipText().should('be.visible')
    users.getUpdatingRolesModal('2').within(() => {
      users
        .getSendUserEmailLabel()
        .should('be.visible')
        .find('input')
        .check({ force: true })
        .should('be.checked')
      //tests delete user modal's cancel button
      universal.getCancelButton().click()
    })
    universal.getRowByText('Sandra Parker').should('be.visible')
    universal.getRowByText('Aymeris Arnold').should('be.visible')
    users.getUpdateRolesIconButton().click()
    users.getUpdatingRolesModal('2').within(() => {
      cy.selectUserRoles('User')
      users.getUpdateRolesButton().click()
    })
    users.getConfirmRemoveAccessModal().within(() => {
      universal.getRemoveButton().click()
    })
    universal.getRowByText('Sandra Parker').should('not.exist')
    universal.getRowByText('Aymeris Arnold').should('not.exist')
    //tests the users removed show up in inactive users
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    users.getInactiveUsersTab().click()
    universal.progressBarZero()
    cy.clickCheckbox({ name: 'Aymeris Arnold' })
    cy.clickCheckbox({ name: 'Sandra Parker' })
    //adds the back to the team
    users.getAddToTeamIconButton().click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    users.getUpdatingRolesModal('2').within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getUpdateRolesButton().click()
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    users.getUpdatingRolesModal('2').should('not.exist')
    users.getInactiveUsersTabpanel().within(() => {
      universal.getRowByText('Sandra Parker').should('not.exist')
      universal.getRowByText('Aymeris Arnold').should('not.exist')
      universal.getNoItemsMessage().should('be.visible')
    })
    //tests that the show back up as team members
    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    users.getSearchFirstName().fill('a')
    users.getSearchLastName().fill('ar')
    universal.waitForProgressBar()
    universal.getRowsInATableBody().should('have.length.lte', 6)
    universal.getRowByText('Sandra Parker').should('exist')
    universal.getRowByText('Aymeris Arnold').should('exist')
  })
  it(`tests the default Teams Invitations Tab`, function () {
    //Invite New User to the Team testing
    //Invite New User to the Team - tests submitting the form without filling anything out
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().should('be.visible')
      cy.findByTestId('AutoCompleteTeam').should('exist')
      cy.findByTestId('MenuUserRole_button').should('be.visible')
      users.getInviteToTeamButton().should('be.disabled')
      universal.getCancelButton().click()
    })
    // tests that the submit button will remain disabled if no role, team or email address
    users.clickToInvite().within(() => {
      users.getInviteToTeamButton().should('be.disabled')
      // add email
      users.getEmailAddressInput().fill('fakeemail@postal.dev')
      // add default team
      cy.selectAutoCompleteTeam(user.company)
      // we have a email, and team, and role is defaulted to user
      users.getInviteToTeamButton().should('not.be.disabled')
      // remove user role
      cy.selectUserRoles('User')
      // we have email and team but no role
      users.getInviteToTeamButton().should('be.disabled')
      // add back user role
      cy.wait(300)
      cy.selectUserRoles('User')
      // we have email and role again
      users.getInviteToTeamButton().should('not.be.disabled')
      users.getEmailAddressInput().fill('')
      // we now have a role, and team but no email
      users.getInviteToTeamButton().should('be.disabled')
      //adds the team back and tests the close button won't submit the invite
      users.getEmailAddressInput().fill('fakeemail@postal.dev')
      universal.getCancelButton().click()
    })
    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.waitForProgressBar()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    teams.getInvitationsTab().click()
    users.getSearchForInvitations().fill('fakeemail@postal.dev')
    universal.progressBarZero()
    universal.getRowByText('fakeemail@postal.dev').should('not.exist')

    //Invite New User to the Team - tests corporate email error
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    users.clickToInvite().within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getEmailAddressInput().fill('tjames@gmail.com')
      users.getInviteToTeamButton().click()
    })

    cy.getAlert({ message: 'Corporate Email Address Required', close: 'close' })

    //Invite New User to the Team - tests that a successful invite will show up in the Team's invites table
    users.clickToInvite().within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getEmailAddressInput().fill('magic@postal.dev')
      users.getInviteToTeamButton().click()
    })
    users.getInviteSentAlert()
    users.visitInvitations()
    universal.getSpinner().should('not.exist')
    users.getSearchForInvitations().fill('magic')
    universal.getRowByText('magic@postal.dev').should('be.visible')

    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.progressBarZero()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    teams.getInvitationsTab().click()
    users.getSearchForInvitations().fill('magic@postal.dev')
    universal.progressBarZero()
    universal.getRowByText('magic@postal.dev').should('exist')

    //Invite New User to the Team - tests that a successful invite will not show up in the users table if the invite is pending
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()
    users.getSearchEmail().fill('magic')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    universal.progressBarZero()
    universal.getNoItemsMessage().should('exist')

    //Invite New User to the Team - tests that inviting a user that is already pending will throw an alert
    users.clickToInvite().within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getEmailAddressInput().fill('magic@postal.dev')
      users.getInviteToTeamButton().click()
    })
    cy.getAlert({ message: 'Pending Invitation Exists', close: 'close' })

    //Invite New User to the Team  - tests inviting a user with a user role
    users.clickToInvite().within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getEmailAddressInput().fill('unicorn@postal.dev')
      users.getInviteToTeamButton().click()
    })
    users.getInviteSentAlert()
    users.visitInvitations()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    users.getSearchForInvitations().fill('unicorn')
    universal.getRowByText('unicorn@postal.dev').should('be.visible')

    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    teams.getInvitationsTab().click()
    users.getSearchForInvitations().fill('unicorn@postal.dev')
    universal.progressBarZero()
    universal.getRowByText('unicorn@postal.dev').should('exist')

    //Invite New User - tests inviting a user with an admin role
    users.visitUsers()
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    users.clickToInvite().within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getEmailAddressInput().fill('cobcorn@postal.dev')
      cy.selectUserRoles('User', 'Admin')
      users.getInviteToTeamButton().should('not.be.disabled').click()
    })
    users.getInviteSentAlert()

    users.visitInvitations()
    universal.getSpinner().should('not.exist')
    users.getSearchForInvitations().fill('cobcorn')
    universal.getRowByText('cobcorn@postal.dev').should('be.visible')

    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    universal.progressBarZero()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    teams.getInvitationsTab().click()
    users.getSearchForInvitations().fill('cobcorn')
    universal.progressBarZero()
    universal.getRowByText('cobcorn@postal.dev').should('exist')

    //Invite New User - tests inviting a user with both the user and admin role
    users.visitUsers()
    users.clickToInvite().within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getEmailAddressInput().fill('popcorn@postal.dev')
      cy.selectUserRoles('Admin')
      users.getInviteToTeamButton().click()
    })
    users.getInviteSentAlert()
    users.visitInvitations()
    universal.getSpinner().should('not.exist')
    cy.wait(400)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Search for Invitations')) {
        cy.reload()
        cy.wait(400)
      }
    })
    users.getSearchForInvitations().fill('popcorn')
    universal.getRowByText('popcorn@postal.dev').should('be.visible')

    teams.visitTeams()
    universal.getSpinner().should('not.exist')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    universal.progressBarZero()
    universal.getAllGridCellsByText(user.company).click()
    universal.progressBarZero()
    teams.getInvitationsTab().click()
    users.getSearchForInvitations().fill('popcorn')
    universal.progressBarZero()
    universal.getRowByText('popcorn@postal.dev').should('exist')

    //Invites Table testing
    //^
    teams.visitTeams()
    universal.waitForProgressBar()
    universal.getAllGridCellsByText(user.company).click({ force: true })
    universal.progressBarZero()
    users.getInvitationsTab().click({ force: true })
    teams.getInvitationsTab().should('have.attr', 'aria-selected', 'true')
    cy.url().should('contain', '/teams/default/invites')
    universal.getRowsInATableBody().should('have.length', 10)
    universal.getRowByNumber(0).should('contain', 'Pending')
    universal.getTableHeader().should('contain.text', users.invitationsTableHeaderText())

    //tests invites table pagination

    // page 1
    universal.getRowsInATableBody().should('have.length', 10)

    universal.getPagesPaginationButton().should('have.text', '1')
    universal.getAngleRightButton().click({ force: true })

    // page 2
    universal.getRowsInATableBody().should('have.length', 10)

    universal.getPagesPaginationButton().should('have.text', '2')
    universal.getAngleLeftButton().should('not.be.disabled')
    universal.getAngleRightButton().should('not.be.disabled').click({ force: true })

    // page 3
    universal.getRowsInATableBody().should('have.length', 9)

    universal.getPagesPaginationButton().should('have.text', '3')
    universal.getAngleRightButton().should('be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click({ force: true })

    universal.getRowsInATableBody().should('have.length', 10)

    universal.getPagesPaginationButton().should('have.text', '2')
    universal.getAngleRightButton().should('not.be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click({ force: true })

    // back to page 1
    universal.getRowsInATableBody().should('have.length', 10)

    users.getSelectAStatusFilter().select('Pending')
    universal.getRowsInATableBody().should('have.length', 10)

    universal.getPagesPaginationButton().should('have.text', '1')
    universal.getAngleRightButton().should('be.disabled')
    universal.getAngleLeftButton().should('be.disabled')

    //Delete Invitations testing
    //tests delete invitation modal renders as it should
    let emailFour: string
    cy.wait('@invites').its('response.body.data.invites').should('have.length.gte', 13)
    universal.progressBarZero()
    universal
      .getRowByNumber(4)
      .within(() => {
        cy.contains('td', '@').then(($four) => {
          emailFour = $four.text()
        })
        cy.findByRole('checkbox').scrollIntoView()
        cy.findByRole('checkbox').click({ force: true })
        cy.findByRole('checkbox').should('be.checked')
      })
      .then(() => {
        users.getRemoveInvitationIconButton().click()
        users.getRemoveInvitationsModal().within(() => {
          cy.contains('Are you sure you want to remove this invitation?').should('be.visible')
        })

        //tests delete invitation modal's cancel button
        universal.getCancelButton().click()
        universal.getRowByText(`${emailFour}`).should('be.visible')

        //tests delete invitation modal's Remove Invitation Access button
        users.getRemoveInvitationIconButton().click()
        users.getRemoveInvitationsModal().within(() => {
          universal.getRemoveButton().click()
        })
        cy.getAlert({ message: 'Invitations removed', close: 'close' })
        users.getSearchForInvitations().clear().fill(emailFour)
        universal.getNoItemsMessage().should('exist')
      })

    //tests invitation's table - sort By Invite Sent via mocking
    const invitesDesc = { data: { invites: invitesData } }
    const invitesAsc = { data: { invites: invitesData.slice().reverse() } }

    cy.graphqlMockSet({ operationName: 'invites', response: invitesDesc, count: 2 })
    cy.graphqlMockStart()
    cy.visit('/teams/default/invites')
    universal.progressBarZero()
    // initial desc
    universal.getRowByNumber(0).should('contain', '1/2/2020')

    // switch to asc
    cy.graphqlMockSet({ operationName: 'invites', response: invitesAsc, count: 1 })
    users.getInviteSentSort().click()
    cy.wait(500)
    universal.progressBarZero()
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByNumber(0).contains('1/1/2020')

    // switch back to desc
    cy.graphqlMockSet({ operationName: 'invites', response: invitesDesc, count: 2 })
    users.getInviteSentSort().click()
    cy.wait(500)
    universal.progressBarZero()
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByNumber(0).contains('1/2/2020')

    cy.graphqlMockClear()
  })
  it(`tests the Teams table and creating a team`, function () {
    //Teams Table Testing
    //Teams Table - tests pagination
    teams.visitTeams()
    universal.waitForProgressBar()
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByNumber(1).should('contain', today)
    universal.getRowsInATableBody().should('have.length', 11)
    cy.scrollTo('bottom')
    universal.waitForProgressBar()
    universal.getRowsInATableBody().should('have.length.gte', 16)
    //Creating a Team Testing
    //tests that the create team form renders as it should
    teams.getCreateTeamButton().click()
    teams
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        users.getTeamNameInput().should('be.visible')
        users.getTeamBillingAccount().should('be.visible')
        users.getBudgetModeTooltip().should('be.visible')
        universal.getCloseButtonByLabelText().should('be.visible').click()
      })
    //tests submitting the create form without filling anything out
    teams.getCreateTeamButton().click()
    teams
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        teams.getCreateTeamButton().should('be.visible').click()
        universal.getCancelButton().should('be.visible').click()
      })

    //tests the close button won't submit the invite
    teams.getCreateTeamButton().click()
    teams
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        users.getTeamNameInput().fill('fakeNAme')
        universal.getCloseButtonByLabelText().click()
      })
    universal.getRowByText('fakeNAme').should('not.exist')

    //tests closing the create team form with the cancel button
    teams.getCreateTeamButton().click()
    teams
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        users.getTeamNameInput().fill('fakery')
        universal.getCancelButton().should('be.visible').click()
      })
    universal.getRowByText('fakery').should('not.exist')

    //tests that a successful team creation will show up in the teams table
    teams.getCreateTeamButton().click()
    teams
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        teams.getCreateTeamButton().should('be.visible').click()
        users.getTeamNameInput().fill('New Team')
        users.getTeamBillingAccount().select(`${user.company}'s Fund Management Billing Account`)
        users.getTeamDepartment().select('Sales')
        teams.getCreateTeamButton().click()
      })
    teams.getCreateTeamDrawer().should('not.exist')
    teams.getSearchTeams().fill('New Team')
    cy.getAlert({ message: 'Team Created', close: 'close' })
    universal.getRowByText('New Team').should('be.visible')
  })
  it(`tests the Settings Tab and Editing a Team`, function () {
    //Editing a Team Testing
    //tests that the edit team form renders as it should
    users.visitUsers()
    profile.getTeamsLink().click()
    universal.getAllGridCellsByText('New Team').click({ force: true })
    cy.url().should('include', '/members')
    cy.contains('New Team').should('be.visible')
    teams.getSettingsTab().click()
    teams.getTeamCardByName('New Team').should('be.visible')
    users.getBillingAccountsTootltip().should('be.visible')
    universal.getLinkByText('Edit')
    teams.getSelectedBillingAccountCard(company).within(() => {
      users.getCurrentBalanceInfo().should('contain', '$0')
    })
    users.getBudgetModeTooltip().should('exist')
    cy.findAllByRole('radio').should('have.length', 3)
    teams.getDisabledModeButton().should('be.checked')
    teams.getPooledModeButton().should('be.not.checked')
    teams.getPerUserModeButton().should('be.not.checked')

    //tests that the edit team form updates sucessfully
    users.visitUsers()
    users.getSearchFirstName().clear().fill('Aymeris')
    universal.waitForProgressBar()
    users.getActiveUsersTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 1)
    })
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByNumber(0).within(() => {
      cy.contains('@').then(($td: any) => {
        aymerisEmail = $td.text()
      })
    })
    profile.getTeamsLink().click()
    universal.getAllGridCellsByText('New Team').click({ force: true })
    teams.getSettingsTab().click()
    teams.getTeamCardByName('New Team').within(() => {
      teams.getTeamNameEditInput().clear().fill('New Team Updated')
      universal.getSaveButton().should('be.visible').click()
    })
    teams.getTeamCardByName('New Team Updated').should('exist')
    cy.contains('New Team Updated').should('be.visible')
    teams.getBackToTeamsButton().click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    //tests that the edit team members form renders and updates sucessfully
    universal.getAllGridCellsByText('New Team Updated').click({ force: true })
    teams.getMembersTab().click()
    teams.getAddUserButton().click()
    users.getAddTeamMembershipModal().within(() => {
      cy.selectAutoCompleteUser(aymerisEmail)
      users.getUpdateRolesButton().click()
    })
    //cy.getAlert({ message: 'New Team Updated Updated', close: 'close' })
    users.getAddTeamMembershipModal().should('not.exist')
    universal.getRowByText('Aymeris Arnold').should('exist')
  })
  it(`tests deleting a team`, function () {
    teams.visitTeams()
    universal.waitForProgressBar()
    universal.getAllGridCellsByText(user.company).click({ force: true })
    universal.progressBarZero()
    universal.getActionsMenuButton().should('not.exist')
    teams.visitTeams()
    universal.waitForProgressBar()
    universal.getAllGridCellsByText('New Team Updated').click({ force: true })
    teams.getDeleteTeamButton().click()
    teams.getConfirmTeamDeletionModal().within(() => {
      teams.getReassignUsersText().should('be.visible')
      teams.getRemoveTeamButton().should('be.disabled')
      universal.getCancelButton().click()
    })
    teams.getBackToTeamsButton().click()
    teams.getSearchTeams().fill('Jersey')
    universal.getAllGridCellsByText('Jersey').click()
    universal.getNoItemsMessage().should('be.visible')
    teams.getDeleteTeamButton().click()
    teams.getConfirmTeamDeletionModal().within(() => {
      teams.getRemoveTeamText().should('be.visible')
      teams.getReassignUsersText().should('not.exist')
      universal.getCancelButton().should('be.visible')
      teams.getRemoveTeamButton().should('not.be.disabled').click()
    })
    cy.url().should('not.contain', '/members')
    universal.getRowByText('Jerrsey').should('not.exist')
  })
})
