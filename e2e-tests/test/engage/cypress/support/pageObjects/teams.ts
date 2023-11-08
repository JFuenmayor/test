export default class Teams {
  visitTeams() {
    return cy.visit('/teams')
  }
  getMembersTab() {
    return cy.findByRole('tab', { name: 'Members' })
  }
  getInvitationsTab() {
    return cy.findByRole('tab', { name: 'Invitations' })
  }
  getMembersTabpanel() {
    return cy.findByRole('tabpanel', { name: 'Members' })
  }
  getInvitationsTable() {
    return cy.contains('[role="table"]', 'Invited By')
  }
  getCreateTeamButton() {
    return cy.findByRole('button', { name: 'Create Team' })
  }
  getCreateTeamDrawer() {
    return cy.findByRole('alertdialog', { name: 'Create Team' })
  }
  getBackToTeamsButton() {
    return cy.contains('a', 'Back to Teams')
  }
  getAddUserButton() {
    return cy.findByRole('button', { name: 'Add User' })
  }
  getSettingsTab() {
    return cy.findByRole('tab', { name: 'Settings' })
  }
  getTeamCardByName(name: string) {
    return cy.findByDisplayValue(name).should('be.visible').parents('[data-testid="ui-card"]')
  }
  getTeamNameEditInput() {
    return cy.findByLabelText('Team Name')
  }
  getSelectedBillingAccountCard(name: string) {
    return cy.contains('[data-testid="ui-card"]', name)
  }
  getDisabledModeButton() {
    return cy.contains('label', 'Disabled').find('input')
  }
  getPooledModeButton() {
    return cy.contains('label', 'Pooled').find('input')
  }
  getPerUserModeButton() {
    return cy.contains('label', 'Per User').find('input')
  }
  getMonthlyButton() {
    return cy.contains('label', 'Monthly').find('input')
  }
  getQuarterlyButton() {
    return cy.contains('label', 'Quarterly').find('input')
  }
  getYearlyButton() {
    return cy.contains('label', 'Yearly').find('input')
  }
  getBudgetAmountInput() {
    return cy.contains('div', 'Budget Amount').find('input')
  }
  getRemainingBudget() {
    return cy.contains('div', `Remaining Budget`)
  }
  getDeleteTeamButton() {
    return cy.findByRole('button', { name: 'Delete Team' })
  }
  getRemoveTeamButton() {
    return cy.findByRole('button', { name: 'Remove Team' })
  }
  membersTableHeaderText() {
    return 'NameUser NameRolesStatus'
  }
  getReassignUsersText() {
    return cy.findByText(
      'You need to remove or reassign all users in this team before you can delete it.'
    )
  }
  getConfirmTeamDeletionModal() {
    return cy.findByRole('alertdialog', { name: 'Confirm Team Deletion' })
  }
  getRemoveTeamText() {
    return cy.contains('Are you sure you want to Remove this team?')
  }
  getSearchTeams() {
    return cy.findByPlaceholderText('Search...')
  }
}
