export default class Users {
  visitUsers() {
    return cy.visit('/users/active')
  }
  visitInactiveUsers() {
    return cy.visit('/users/disabled')
  }
  visitInvitations() {
    return cy.visit('/users/invitations', { retryOnNetworkFailure: true })
  }
  //Buttons
  getBackToUsersButton() {
    return cy.contains('a', 'Back to Users')
  }
  getUpdateRolesButton() {
    return cy.findByRole('button', { name: 'Update Roles' })
  }
  getTeamUpdateButton() {
    return cy.findByLabelText('UserTable TEAM_UPDATE button')
  }
  getRemoveTeamButton() {
    return cy.findByRole('button', { name: 'Remove Team' })
  }
  getEditUserButton() {
    return cy.findByLabelText('edit button')
  }
  getUpdateUserButton() {
    return cy.contains('button', 'Update User')
  }
  getUpdateRolesIconButton() {
    return cy.findByTitle('Update Roles/Teams')
  }
  getAddToTeamIconButton() {
    return cy.findByTitle('Add to Team')
  }
  getRemoveInvitationIconButton() {
    return cy.findByTitle('Remove Invitation')
  }
  getInviteUserButton() {
    return cy.findByRole('button', { name: 'Invite User' })
  }
  getInviteToTeamButton() {
    return cy.findByRole('button', { name: 'Invite to Team' })
  }
  getSwitchAccountButtonByName(name: string) {
    return cy.findByRole('button', { name: name })
  }
  getDisableUserButton() {
    return cy.findByRole('button', { name: 'Disable User' })
  }
  getTeamsAddButton() {
    return cy.findByRole('button', { name: 'Add Team' })
  }
  getEllipsesButton() {
    return cy.findByTestId('UserV2_actionMenu')
  }
  //Tabs
  getActiveUsersTab() {
    return cy.findByRole('tab', { name: 'Active Users' })
  }
  getInactiveUsersTab() {
    return cy.findByRole('tab', { name: 'Inactive Users' })
  }
  getInvitationsTab() {
    return cy.findByRole('tab', { name: 'Invitations' })
  }
  //TabPanels
  getInvitationsTabpanel() {
    // return cy.findByRole('tabpanel', { name: 'Invitations' })
    return cy.findByTestId('InvitationsTab')
  }
  getActiveUsersTabpanel() {
    // return cy.findByRole('tabpanel', { name: 'Active Users' })
    return cy.findByTestId('ActiveUsersTab')
  }
  getInactiveUsersTabpanel() {
    // return cy.findByRole('tabpanel', { name: 'Inactive Users' })
    return cy.findByTestId('InactiveUsersTab')
  }
  //Roles Menu
  getRolesMenu() {
    return cy.findByTestId('MenuUserRole_button')
  }
  getRolesMenuByRole(role: string) {
    return cy.contains('[data-testid="MenuUserRole_button"]', role)
  }
  getSelectRoleMenuItemCheckbox(role: string) {
    return cy.findByRole('menuitemcheckbox', { name: RegExp(role, 'i') })
  }

  //Filters
  getSelectRolesFilter() {
    return cy.contains('[data-testid="MenuUserRole_button"]', 'Select Roles')
  }
  getSelectAStatusFilter() {
    return cy.contains('select', 'Select a Status')
  }
  //Modals
  getSwitchAccountModal() {
    return cy.contains('section', `Switch Account`)
  }
  getAddTeamMembershipModal() {
    return cy.findByRole('dialog', { name: `Add Team Membership` })
  }
  getRemoveTeamMembershipModal() {
    return cy.findByRole('dialog', { name: `Remove Team Membership` })
  }
  getRemoveInvitationsModal() {
    return cy.findByRole('dialog', { name: `Remove Invitations` })
  }
  getUpdatingRolesModal(amount: string) {
    if (amount === '1') {
      return cy.findByRole('dialog', { name: `Updating Roles for ${amount} User` })
    }
    return cy.findByRole('dialog', { name: `Updating Roles for ${amount} Users` })
  }
  getUpdatingRolesModaltext() {
    return cy.contains('Please select the team and roles you would like set for each user')
  }
  getConfirmRemoveAccessModal() {
    return cy.findByRole('dialog', { name: `Confirm Remove Access` })
  }
  getInviteUserModal() {
    return cy.findByRole('alertdialog', { name: 'Invite User' })
  }
  getDisableUserModal() {
    return cy.findByRole('alertdialog', { name: 'Disable User' })
  }
  //ModalText
  getTeamMembershipModalText() {
    return cy.contains('Please select the team and roles you would like granted to this user.')
  }
  getSendUserEmailLabel() {
    return cy.contains('label', 'Send User Email')
  }
  getUpdatingRolesModalText() {
    return cy.contains('Please select the team and roles you would like set for each user.')
  }
  //Searches
  getSearchUsers() {
    return cy.findByPlaceholderText('Search Users')
  }
  getSearchLastName() {
    return cy.findByPlaceholderText('Search Last Name')
  }
  getSearchFirstName() {
    return cy.findByPlaceholderText('Search First Name')
  }
  getSearchEmail() {
    return cy.findByPlaceholderText('Search Email')
  }
  getSearchForInvitations() {
    return cy.findByPlaceholderText('Search for Invitations', { timeout: 44000 })
  }
  //Tooltips
  getSendEmailTooltip() {
    return cy.contains('label', `Send User Email`).parent('div').find('svg')
  }
  getBudgetModeTooltip() {
    return cy.contains('Budget Mode').find('svg')
  }
  getBillingAccountsTootltip() {
    return cy.contains('Billing Account(s)').find('svg')
  }
  //Tooltip Text
  getSendEmailTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Send an email notification to the User notifying them that they have been added to the team.',
    })
  }
  //Alerts
  getUsersUpdatedAlert(amount: string) {
    cy.getAlert({ message: `Updated ${amount} Users`, close: 'close' })
  }
  getInviteSentAlert() {
    cy.getAlert({ message: 'Invitation sent', close: 'close' })
  }
  getRolesUpdatedAlert() {
    cy.getAlert({ message: 'Roles Updated', close: 'close' })
  }
  //MenuItems
  getDeleteTeamMenuItem() {
    return cy.findByRole('button', { name: 'Delete Team' })
  }
  getRolesFilterMenuItem(role: string) {
    return cy.findByRole('menuitemcheckbox', { name: role })
  }
  getDisableUserMenuItem() {
    return cy.findByRole('menuitem', { name: 'Disable User' })
  }
  getEnableUserMenuItem() {
    return cy.findByRole('menuitem', { name: 'Enable User' })
  }
  getEditUserMenuItem() {
    return cy.findByRole('menuitem', { name: 'Edit User' })
  }
  //Links
  getUserLinkByName(name: string) {
    return cy.contains('a', name)
  }
  //Inputs
  getFirstNameInput() {
    return cy.contains('[role="group"]', 'First Name').find('input')
  }
  getLastNameInput() {
    return cy.contains('[role="group"]', 'Last Name').find('input')
  }
  getEmailInput() {
    return cy.contains('[role="group"]', 'Email').find('input')
  }
  getTitleInput() {
    return cy.contains('[role="group"]', 'Title').find('input')
  }
  getPhoneInput() {
    return cy.contains('[role="group"]', 'Phone').find('input')
  }
  getMeetingLinkInput() {
    return cy.contains('[role="group"]', 'Meeting Link').find('input')
  }
  getEmailAddressInput() {
    return cy.findByPlaceholderText('Email Address')
  }
  getTeamNameInput() {
    return cy.findByRole('textbox', { name: 'Name' })
  }
  getTeamBillingAccount() {
    return cy.findByRole('combobox', { name: 'Billing Account' })
  }
  getTeamDepartment() {
    return cy.findByRole('combobox', { name: 'Department' })
  }
  //Info
  getUserStatus() {
    return cy.contains('div', 'Status')
  }
  getCurrentBalanceInfo() {
    return cy.contains('div', 'Current Balance')
  }
  getUserNameInfo() {
    return cy.contains('div', 'User Name')
  }
  getUserEmailInfo() {
    return cy.contains('div', 'Email')
  }
  getUserStatusInfo() {
    return cy.contains('div', 'Status')
  }
  getCopyLink() {
    return cy.contains('a', 'Share URL')
  }
  getUserTitleInfo() {
    return cy.contains('div', 'Title')
  }
  getUserPhoneInfo() {
    return cy.contains('div', 'Phone')
  }
  //Cards
  getTeamsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Teams')
  }
  getUserProfileCard(name: string) {
    return cy.contains('h6', name).parents('[data-testid="ui-card"]')
  }
  //Table header Text
  userTableHeaderText() {
    return 'NameUser NameTeamsRolesStatus'
  }
  invitationsTableHeaderText() {
    return 'EmailTeamInvited ByRolesInvite SentStatus'
  }
  //Drawers
  getEditUserProfileDrawer(txt: string) {
    return cy.findAllByDisplayValue(txt).parents('form')
  }
  getCopyMeetingLink() {
    cy.contains('div', 'Meeting Link').within(() => {
      cy.contains('a', 'Copy Link').as('meetingLink')
    })
    return cy.get('@meetingLink')
  }
  //Sorts
  getInviteSentSort() {
    return cy.contains('th', 'Invite Sent')
  }
  getMainAccountLink() {
    return cy.findByTestId('main-account')
  }
  getAccountSwitchHeader() {
    return cy.findByTestId('account-header')
  }
  getAccountTeamLink(text: string) {
    return cy.contains('span', text)
  }
  clickToInvite() {
    this.getInviteUserButton().click()
    return this.getInviteUserModal().should('be.visible')
  }
}
