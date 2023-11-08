import invitesData from '../../fixtures/invitesData'
import { UpdateRolesV2Document } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Profile, Universal, Users } from '../../support/pageObjects'

describe(`Users Tables, Tabs, and Profile Page Testing`, function () {
  const profile = new Profile()
  const universal = new Universal()
  const users = new Users()
  const user = userFactory()
  const company: string = user.company
  let txt1: string
  let txt2: string
  let teamID: string
  let teamName: string
  let userID: string

  before(function () {
    cy.signup(user)
    cy.currentUser().then((res) => {
      userID = res.userId
    })
    cy.contactsSeed()
    cy.teamsSeed().then((resp) => {
      teamID = resp.id
      teamName = resp.name
    })
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

  it(`tests that the Active Users tab`, function () {
    // Active Users Table testing
    // tests that the Users Page's Active Users tab renders as it should
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    profile.getUsersLink().should('be.visible').click({ force: true })
    universal.progressBarZero()
    users.getActiveUsersTabpanel().within(() => {
      universal.getTableHeader().should('contain', users.userTableHeaderText())
    })
    cy.findByRole('tablist').within(() => {
      users.getActiveUsersTab().should('exist')
      users.getInactiveUsersTab().should('exist')
      users.getInvitationsTab().should('exist')
    })
    users.getSearchLastName().should('exist')
    users.getSearchFirstName().should('exist')
    users.getSearchEmail().should('exist')
    cy.findByTestId('AutoCompleteTeam').should('exist')
    users.getUpdateRolesIconButton().should('exist')
    users.getSelectRolesFilter().should('exist')
    users.getInviteUserButton().should('exist')

    //Active Users Table - tests filtering by First Name
    users.getSearchFirstName().should('be.visible').fill('er')
    universal.progressBarZero()
    universal.getRowByText('Aymeris Arnold').should('be.visible')
    universal.getRowByText('Peter Harper').should('be.visible')

    //Active Users Table - tests filtering by Last Name
    users.getSearchFirstName().clear()
    users.getSearchLastName().fill('ar')
    universal.progressBarZero()
    universal.getRowByText('Peter Harper').should('be.visible')
    universal.getRowByText('Sandra Parker').should('be.visible')
    universal.getRowByText('Aymeris Arnold').should('be.visible')

    //Active Users Table - tests filtering by Email
    users.getSearchLastName().clear()
    users.getSearchEmail().fill('aymeris.arnold')
    universal.progressBarZero()
    users.getActiveUsersTabpanel().within(() => {
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowsInATableBody().should('have.length', '1')
    })
    //Active Users Table - tests filtering by Team
    users.getSearchEmail().clear()
    cy.selectAutoCompleteTeam(teamName)
    universal.progressBarZero()
    users.getActiveUsersTabpanel().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    //adds the logged in user to the searched team
    cy.graphqlRequest(UpdateRolesV2Document, { id: userID, teamId: teamID, roles: ['USER'] })
    cy.reload()
    //tests that teh logged in user is filterd via search teams
    cy.selectAutoCompleteTeam(teamName)
    universal.waitForProgressBar()
    users.getActiveUsersTabpanel().within(() => {
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowByText(`${user.firstName} ${user.lastName}`).should('exist')
    })
    //tests filtering by Role
    cy.findByTestId('AutoCompleteTeam').find('input').clear()
    universal.getRowsInATableBody().should('have.length.gt', 1)
    users.getSelectRolesFilter().click({ force: true })
    users.getSelectRoleMenuItemCheckbox('Manager').click({ force: true })
    universal.progressBarZero()
    users.getActiveUsersTabpanel().within(() => {
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowByText(`${user.firstName} ${user.lastName}`).should('exist')
    })
    //clears it
    // cy.contains('button', 'Manager').click({ force: true })
    users.getSelectRoleMenuItemCheckbox('Manager').click({ force: true })
    universal.getRowsInATableBody().should('have.length', 10)

    //Active Users Table - tests pagination
    // 1
    universal.getPagesPaginationButton().should('contain', '1 / 2')
    universal.getAngleRightButton().click()
    // 2
    users.getActiveUsersTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 6)
    })
    universal.getPagesPaginationButton().should('contain', '2 / 2')
    universal.getAngleRightButton().should('be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click()
    // 1
    universal.getPagesPaginationButton().should('contain', '1 / 2')
    universal.getAngleLeftButton().should('be.disabled')
  })

  it(`tests the Inactive Users tab`, function () {
    users.visitUsers()
    cy.url().should('contain', '/users/active')
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    //Active Users Table - tests selecting two of the filter results
    users.getSearchFirstName().should('be.visible').fill('a')
    users.getSearchLastName().fill('ar')
    universal.waitForProgressBar()
    universal.getRowsInATableBody().should('have.length.lte', 6)
    users.getActiveUsersTabpanel().within(() => {
      cy.clickCheckbox({ name: 'Aymeris Arnold' })
      cy.clickCheckbox({ name: 'Sandra Parker' })
    })
    //Active Users - Access Removal testing
    users.getUpdateRolesIconButton().click()
    users.getUpdatingRolesModal('2').within(() => {
      users.getUpdatingRolesModalText().should('be.visible')
      //tests cancel button
      universal.getCancelButton().click()
    })
    users.getActiveUsersTabpanel().within(() => {
      universal.getRowByText('Sandra Parker').should('be.visible')
      universal.getRowByText('Aymeris Arnold').should('be.visible')
    })
    users.getUpdateRolesIconButton().click()
    users.getUpdatingRolesModal('2').within(() => {
      cy.selectAutoCompleteTeam(user.company)
      cy.selectUserRoles('User')
      users.getUpdateRolesButton().click()
    })
    users.getConfirmRemoveAccessModal().within(() => {
      universal.getConfirmButton().click()
    })
    //check that the users now show up in inactive users
    users.getActiveUsersTabpanel().within(() => {
      universal.getRowByText('Sandra Parker').should('not.exist')
      universal.getRowByText('Aymeris Arnold').should('not.exist')
    })

    users.getInactiveUsersTab().click()
    cy.url().should('contain', '/users/disabled')

    universal.progressBarZero()
    users.getInactiveUsersTabpanel().within(() => {
      cy.clickCheckbox({ name: 'Aymeris Arnold' })
      cy.clickCheckbox({ name: 'Sandra Parker' })
    })
    //gives them access again
    users.getAddToTeamIconButton().click()
    users.getUpdatingRolesModal('2').within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getUpdateRolesButton().click()
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Update Roles')) {
        users.getUpdatingRolesModal('2').within(() => {
          users.getUpdateRolesButton().click()
        })
      }
    })
    users.getUpdatingRolesModal('2').should('not.exist')
    users.getInactiveUsersTabpanel().within(() => {
      universal.getRowByText('Sandra Parker').should('not.exist')
      universal.getRowByText('Aymeris Arnold').should('not.exist')
      universal.getNoItemsMessage().should('be.visible')
    })
  })

  it(`tests the Invitations tab`, function () {
    //Invite New User testing
    //tests that the invite user form renders as it should
    users.visitUsers()
    cy.url().should('contain', '/users/active')
    users.getInvitationsTab().click()
    cy.url().should('contain', '/users/invitations')

    users.clickToInvite().within(() => {
      users.getEmailAddressInput().should('be.visible')
      cy.findByTestId('AutoCompleteTeam').should('be.visible')
      cy.findByTestId('MenuUserRole_button').should('be.visible')
      universal.getCancelButton().click()
    })

    //Invite New User - tests submitting the form without filling anything out
    users.clickToInvite().within(() => {
      users.getInviteToTeamButton().should('be.disabled')
      universal.getCancelButton().click()
    })

    // tests that the submit button will remain disabled if no role, team or email address
    users.clickToInvite().within(() => {
      users.getInviteToTeamButton().should('be.disabled')
      // User role is default on
      users.getEmailAddressInput().fill('fakeemail@postal.dev')
      // we have user role and email, no team
      users.getInviteToTeamButton().should('be.disabled')
      cy.selectAutoCompleteTeam()
      // we have user, role, and team
      users.getInviteToTeamButton().should('not.be.disabled')
      // remove user role
      cy.selectUserRoles('User')
      // we have team and email, no role
      users.getInviteToTeamButton().should('be.disabled')
      // add back user role
      cy.wait(300)
      cy.selectUserRoles('User')
      // we have team, email, and role again
      users.getInviteToTeamButton().should('not.be.disabled')
      users.getEmailAddressInput().fill('')
      // we now have team and role, but no email
      users.getInviteToTeamButton().should('be.disabled')
      universal.getCancelButton().click()
    })

    //Invite New User - tests the close button won't submit the invite
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('fakeemail@postal.dev')
      cy.selectAutoCompleteTeam()
      universal.getCancelButton().click()
    })

    users.getSearchForInvitations().fill('fakeemail@postal.dev')
    universal.getNoItemsMessage().should('exist')

    //Invite New User - tests corporate email error
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('tjames@gmail.com')
      cy.selectAutoCompleteTeam()
      users.getInviteToTeamButton().click()
    })

    cy.getAlert({ message: 'Corporate Email Address Required', close: 'close' })

    //Invite New User - tests that a successful invite will show up in the invites table
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('magic@postal.dev')
      cy.findByTestId('AutoCompleteTeam').scrollIntoView()
      cy.selectAutoCompleteTeam('Jersey')
      users.getInviteToTeamButton().click()
    })

    users.getInviteSentAlert()
    users.getSearchForInvitations().fill('magic')
    universal.getRowByText('magic@postal.dev').should('be.visible')

    //Invite New User -tests that a successful invite will not show up in the users table if the invite is pending
    users.getActiveUsersTab().click()
    cy.url().should('contain', '/users/active')
    users.getSearchEmail().fill('magic')
    universal.waitForProgressBar()
    universal.getNoItemsMessage()

    //Invite New User -tests that inviting a user that is already pending will throw an alert
    users.getInvitationsTab().click()
    cy.url().should('contain', '/users/invitations')
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('magic@postal.dev')
      cy.findByTestId('AutoCompleteTeam').scrollIntoView()
      cy.selectAutoCompleteTeam('Jersey')
      users.getInviteToTeamButton().click()
    })

    cy.getAlert({ message: 'Pending Invitation Exists', close: 'close' })
    users.getInviteUserModal().should('not.exist')

    //Invite New User - tests inviting a user with a user role
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('unicorn@postal.dev')
      cy.selectAutoCompleteTeam()
      users.getInviteToTeamButton().click()
    })
    users.getInviteSentAlert()
    users.getSearchForInvitations().clear().fill('corn')
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 1)
    })

    //Invite New User - tests inviting a user with an admin role
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('cobcorn@postal.dev')
      cy.selectAutoCompleteTeam()
      cy.selectUserRoles('User', 'Admin')
      users.getInviteToTeamButton().should('not.be.disabled').click()
    })
    users.getInviteSentAlert()
    users.getSearchForInvitations().clear().fill('corn@')
    //saw cornell once, hence lte to 3 but most often should be two
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length.lte', 3)
    })
    //Invite New User - tests inviting a user with both the user and admin role
    users.clickToInvite().within(() => {
      users.getEmailAddressInput().fill('popcorn@postal.dev')
      cy.selectAutoCompleteTeam()
      cy.selectUserRoles('Admin')
      users.getInviteToTeamButton().click()
    })
    users.getInviteSentAlert()
    users.getSearchForInvitations().clear().fill('corn')
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 3)
    })
    //tests invites table pagination
    //^
    users.getActiveUsersTab().click()
    cy.url().should('contain', '/users/active')
    universal.getSpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Invite User')) {
        cy.wait(300)
        cy.reload()
      }
    })
    universal.getNoItemsMessage().should('not.exist')
    universal.progressBarZero()
    users.getInvitationsTab().click({ force: true })
    cy.url().should('contain', '/users/invitations')

    // page 1
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
    })
    universal.getPagesPaginationButton().should('have.text', '1')
    universal.getAngleRightButton().click({ force: true })

    // page 2
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
    })
    universal.getPagesPaginationButton().should('have.text', '2')
    universal.getAngleLeftButton().should('not.be.disabled')
    universal.getAngleRightButton().should('not.be.disabled').click({ force: true })

    // page 3
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 9)
    })
    universal.getPagesPaginationButton().should('have.text', '3')
    universal.getAngleRightButton().should('be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click({ force: true })

    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
    })
    universal.getPagesPaginationButton().should('have.text', '2')
    universal.getAngleRightButton().should('not.be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click({ force: true })

    // back to page 1
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
    })
    users.getSelectAStatusFilter().select('Pending')
    universal.waitForProgressBar()
    users.getInvitationsTabpanel().within(() => {
      universal.getRowsInATableBody().should('have.length', 10)
    })
    universal.getPagesPaginationButton().should('have.text', '1')
    universal.getAngleRightButton().should('not.be.disabled')
    universal.getAngleLeftButton().should('be.disabled')

    //Delete Invitations testing
    //tests delete invitation modal renders as it should
    let emailFour: string
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
    users.visitInvitations()
    universal.waitForProgressBar()
    users.getInvitationsTabpanel().within(() => {
      // initial desc
      universal.getRowByNumber(0).should('contain', '1/2/2020')

      // switch to asc
      cy.graphqlMockSet({ operationName: 'invites', response: invitesAsc, count: 3 })
      users.getInviteSentSort().click()
      cy.wait(500)
      universal.progressBarZero()
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowByNumber(0).should('not.contain', '1/2/2020')
      universal.getRowByNumber(0).contains('1/1/2020')

      // switch back to desc
      cy.graphqlMockSet({ operationName: 'invites', response: invitesDesc, count: 2 })
      users.getInviteSentSort().click()
      cy.wait(500)
      universal.progressBarZero()
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowByNumber(0).contains('1/2/2020')
    })
    cy.graphqlMockClear()
  })

  it(`tests adding a user to a team via the user profile page`, function () {
    //Users: Adding users to a Team & User profile teams testing
    //tests adding users to a team modal renders as it should
    users.visitUsers()
    users.getActiveUsersTab().click()
    cy.url().should('contain', '/users/active')
    users.getActiveUsersTabpanel().within(() => {
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowByNumber(0).within(() => {
        cy.contains('td', '@').then(($one) => {
          txt1 = $one.text()
        })
      })
      universal.getRowByNumber(1).within(() => {
        cy.contains('td', '@').then(($two) => {
          txt2 = $two.text()
        })
      })
      cy.clickCheckboxByRowNumber({ num: 0 })
      cy.clickCheckboxByRowNumber({ num: 1 })
    })
    users.getUpdateRolesIconButton().should('not.be.disabled').click()
    users.getUpdatingRolesModal('2').within(() => {
      users.getUpdatingRolesModalText().should('be.visible')
      cy.selectAutoCompleteTeam(teamName)
      // User is default, add Manager
      cy.selectUserRoles('Manager')
      users.getUpdateRolesButton().click({ force: true })
    })
    cy.getAlert({ message: 'Updated 2 Users', close: 'close' })
  })

  it(`tests the new teams and roles are reflected in the users table`, function () {
    //tests editing a user's profile
    users.visitUsers()
    universal.getRowByText(txt1).within(() => {
      cy.findByText(`${company} / ${teamName}`).should('be.visible')
      cy.findByText('User / Manager').should('be.visible')
    })
    universal.getRowByText(txt2).within(() => {
      cy.findByText(`${company} / ${teamName}`).should('be.visible')
      cy.findByText('User / Manager').should('be.visible')
    })

    //tests the new teams and roles are reflected in the user's profile
    universal.getRowByText(txt1).within(() => {
      cy.findAllByRole('link').eq(0).click({ force: true })
    })
    universal.waitForSpinner()
    users.getTeamsCard().within(() => {
      universal.getRowByText(teamName).within(() => {
        cy.findByText('Active')
        cy.findByText('User, Manager')
        cy.findByText(`${new Date().toLocaleDateString('en-US')}`)
      })
    })
  })
  it(`tests editing and removing team access via the user profile page`, function () {
    //tests editing the user's role on a team
    //tests editing a user's profile
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    users.getActiveUsersTabpanel().within(() => {
      universal.getRowByText(txt1).within(() => {
        cy.findAllByRole('link').eq(0).click({ force: true })
      })
    })
    users.getTeamsCard().within(() => {
      universal.getRowByText(teamName).within(() => {
        // remove manager
        cy.selectUserRoles('Manager')
      })
    })
    users.getRolesUpdatedAlert()
    users.getTeamsCard().within(() => {
      universal.getRowByText(teamName).within(() => {
        cy.findByText('User, Manager').should('not.exist')
        cy.selectUserRoles('User')
      })
    })
    users.getRemoveTeamMembershipModal().within(() => {
      cy.contains('Are you sure you want to Remove this user from this team?').should('be.visible')
      universal.getCancelButton().should('exist')
      universal.getRemoveButton().should('be.visible').click()
    })
    users.getRolesUpdatedAlert()
    users.getTeamsCard().within(() => {
      cy.contains(company).should('exist')
      universal.getRowsInATableBody().should('have.length', 1)
    })

    //tests adding an existing team to the user
    users.getTeamsCard().within(() => {
      users.getTeamsAddButton().click()
    })
    users.getAddTeamMembershipModal().within(() => {
      users.getTeamMembershipModalText()
      cy.findByTestId('AutoCompleteTeam').scrollIntoView()
      cy.selectAutoCompleteTeam('Jersey')
      users.getUpdateRolesButton().click()
    })
    cy.getAlert({ message: 'Team added to User', close: 'close' })
  })
  it(`tests editing a user's profile`, function () {
    //tests editing a user's profile
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.waitForProgressBar()
    universal.getRowByText(txt1).within(() => {
      cy.findAllByRole('link').eq(0).click({ force: true })
    })
    users.getEllipsesButton().should('be.visible').click({ force: true })
    cy.wait(600)
    users.getEditUserMenuItem().should('exist').click({ force: true })
    users.getEditUserProfileDrawer(txt1).within(() => {
      users
        .getFirstNameInput()
        .should('not.have.value', '')
        .clear({ force: true })
        .type('SebastionUP', { force: true })
      users.getLastNameInput().clear({ force: true }).type('SeleckUP', { force: true })
    })
    users.getEditUserProfileDrawer(`SeleckUP`).within(() => {
      users.getEmailInput().clear({ force: true }).type('sseleck@postal.devUP', { force: true })
      users.getTitleInput().fill('Influencer')
      users.getPhoneInput().fill('760-224-3567')
      users.getMeetingLinkInput().fill('www.meetingLink.gov')
      cy.contains('button', 'Cancel').should('exist')
      cy.contains('button', 'Update User').click({ force: true })
    })
    users.getUserProfileCard('SebastionUP SeleckUP').within(() => {
      //users.getUserNameInfo().should('contain', txt1)
      users.getUserEmailInfo().should('contain', 'sseleck@postal.devUP')
      users.getUserPhoneInfo().should('contain', '760-224-3567')
      users.getUserTitleInfo().should('contain', 'Influencer')
      users.getUserStatusInfo().should('contain', 'Enabled')
      users.getCopyLink().should('have.attr', 'title', 'www.meetingLink.gov')
    })
    users.getEllipsesButton().should('be.visible').click({ force: true })
    cy.wait(600)
    users.getDisableUserMenuItem().should('exist').click({ force: true })
    users.getDisableUserModal().within(() => {
      users.getDisableUserButton().click()
    })
    users.getDisableUserModal().should('not.exist')
    users.getTeamsCard().within(() => {
      universal.getRowByText('Disabled').within(() => {
        cy.contains(company)
        cy.findByRole('button', { name: 'User' })
      })
    })
  })
})
