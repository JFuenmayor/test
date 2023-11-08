export default class Subscriptions {
  visitSubscriptions() {
    cy.visit('/subscriptions')
  }
  getStartHereButton() {
    return cy.findByRole('button', { name: 'Start Here' })
  }
  getOpenPlaybookButton() {
    return cy.findByRole('button', { name: 'Open Subscription' })
  }
  getMyPlaybooksLink() {
    return cy.findAllByRole('link', { name: 'My Subscription' })
  }
  getAllPlaybooksLink() {
    return cy.findAllByRole('link', { name: 'All Subscriptions', timeout: 56000 })
  }
  getPlaybookByName(name: string) {
    return cy.contains('div', name, { timeout: 56000 })
  }
  getSelectPlaybookButton() {
    return cy.findByRole('button', { name: 'Select Subscription' })
  }
  getSelectedIndicator() {
    return cy.findByRole('button', { name: 'Selected' }).should('be.disabled')
  }
  getAddContactsButton() {
    return cy.findByRole('button', { name: 'Add contact' })
  }
  getEditPlaybookButton() {
    return cy.findByRole('button', { name: 'Edit Subscription' })
  }
  getEditStepsIconButton() {
    return cy.findByLabelText('Edit steps button')
  }
  getEditStepIconButton() {
    return cy.findByLabelText('Edit step')
  }
  getDeleteStepIconButton() {
    return cy.findByLabelText('Delete step')
  }
  getDragStepIconButton() {
    return cy.findByLabelText('Drag step')
  }
  getToggleStepIconButton() {
    return cy.findByLabelText('Toggle Step')
  }
  getCancelAllButton() {
    return cy.findByLabelText('Cancel all button')
  }
  getEnablePlaybookButton() {
    return cy.contains('div', 'Enable Subscription').find('input')
  }
  getPlaybookEnabledButton() {
    return cy.contains('label', 'Subscription Enabled').find('input')
  }
  getPlaybookDisabledButton() {
    return cy.contains('label', 'Subscription Disabled').find('input')
  }
  getDisablePlaybookButton() {
    return cy.contains('label', 'Disable Subscription').find('input')
  }
  getDisablePlaybookModalButton() {
    return cy.contains('button', 'Disable')
  }
  getBackToButton() {
    return cy.findByRole('button', { name: 'Back to Subscriptions' })
  }
  getCloneButton() {
    return cy.findByRole('button', { name: 'Clone' })
  }
  getAssignPlaybookDrawer() {
    return cy.contains('section', 'Assign Subscription')
  }
  getAssignPlaybookButton() {
    return cy.findByRole('button', { name: 'Assign Subscription' })
  }
  getCancelPlaybookMenuItem() {
    return cy.findByRole('menuitem', { name: 'Cancel Subscription' })
  }
  getCreatePlaybookMenuItem() {
    return cy.findByRole('menuitem', { name: 'Create Subscription' })
  }
  getAddStepMenuItem() {
    return cy.findByRole('menuitem', { name: 'Add Step' })
  }
  getDeletePlaybookMenuItem() {
    return cy.findByRole('menuitem', { name: 'Delete Subscription' })
  }
  getActivatePlaybookMenuItem() {
    return cy.findByRole('menuitem', { name: 'Activate Subscription' })
  }
  getAddPlaybookStepMenuItem() {
    return cy.findByRole('menuitem', { name: 'Add Subscription Step' })
  }
  getAddPlaybookMenuItem() {
    return cy.contains('a', 'Add Subscription')
  }
  getClonePlaybookMenuItem() {
    return cy.findByRole('menuitem', { name: 'Clone Subscription' })
  }
  getEditPlaybookMenuItem() {
    return cy.findByRole('menuitem', { name: 'Edit Subscription' })
  }
  getPlaybooksEnabledText() {
    return cy.contains('Subscription Enabled')
  }
  getContactsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Contacts')
  }
  getAddAStepButton() {
    return cy.findByRole('button', { name: 'Add Step' })
  }
  getPlaybookStepDelayInput() {
    return cy.findByLabelText('Subscription Step Delay')
  }
  getSaveStepButton() {
    return cy.findByRole('button', { name: 'Update Subscription Step', timeout: 55000 })
  }
  getCreatePlaybookButton() {
    return cy.findByRole('button', { name: 'Create Subscription' })
  }
  getAddContactsToPlaybookDrawer() {
    return cy.findByRole('dialog', { name: 'Add Contacts To Subscription' })
  }
  getPlaybookNameInputByDisplayValue(value: string) {
    return cy.findByDisplayValue(value)
  }
  getUpdatePlaybookButton() {
    return cy.findByRole('button', { name: 'Update Subscription' })
  }
  getAddToPlaybookButton() {
    return cy.findByRole('button', { name: 'Add To Subscription' })
  }
  getDisablePlaybookModal() {
    return cy.contains('section', 'Disable Subscription')
  }
  getDeletePlaybookModal() {
    return cy.contains('section', 'Delete Subscription')
  }
  getDeletePlaybookStepModal() {
    return cy.contains('section', 'Delete Subscription Step')
  }
  getClonePlaybookModal() {
    return cy.contains('section', 'Clone Subscription')
  }
  getCancelAllInstancesModal() {
    return cy.contains('section', 'Remove all Instances')
  }
  getThisPlaybookDeletedText() {
    return cy.findByText('This subscription was deleted')
  }
  getStatsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Stats')
  }
  getOrdersCard() {
    return cy.contains('[data-testid="ui-card"]', 'Orders')
  }
  getStartedStat() {
    return cy.contains('div', /Started/i)
  }
  getCompletedStat() {
    return cy.contains('div', /Completed/i)
  }
  getCostPerTouchStat() {
    return cy.contains('div', /Cost Per Touch/i)
  }
  getTotalCostStat() {
    return cy.contains('div', /Total Cost/i)
  }
  getItemsInfo() {
    return cy.findByTestId('subscription-items')
    //return cy.contains('div', /Items/i)
  }
  getCostInfo() {
    return cy.findByTestId('subscription-cost')
    //return cy.contains('div', /Cost/i)
  }
  getDurationInfo() {
    return cy.findByTestId('subscription-duration')
    //return cy.contains('div', 'Duration (Days)')
  }
  getStepsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Steps')
  }
  getPlaybookStatusCard() {
    return cy.contains('[data-testid="ui-card"]', 'Settings')
  }
  getStepByNumber(num: number) {
    return cy.findByTestId(`PlaybookDefinitionStep_step${num}`, { timeout: 90000 })
  }
  getAllWarningIcons() {
    return cy.get('[name="warning"]')
  }
  getExpandedStepOption() {
    return cy.contains('div', 'Option')
  }
  getExpandedStepDaySent() {
    return cy.contains('div', 'Day Sent')
  }
  getExpandedStepDelayInput() {
    return cy.contains('div', 'Delay (days)').find('input')
  }
  getExpandedSendAs() {
    return cy.contains('div', 'Send As')
  }
  getAtLeast7DaysWarningText() {
    return cy.contains(
      'Warning: The previous step contains a Direct Mail item and may arrive after this current postal. Please set the Delay of this step to at least 7 days.'
    )
  }
  getPlaybookUpdatedAlert() {
    cy.getAlert({ message: 'Subscription updated', close: 'close' })
  }
  getPlaybookInstanceUpdatedAlert() {
    cy.getAlert({ message: 'Subscription instance updated', close: 'close' })
  }
  getAllSortableStepsTooltips() {
    return cy.findAllByTestId('PlaybooksSortableSteps_tooltipContainer')
  }
  getPlaybookStatusTooltip() {
    return cy.contains('label', 'Enable Subscription').find('svg')
  }
  getPlaybookStatusTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'When a subscription is disabled, users are prevented from adding new contacts, but existing contacts will continue to receive items',
    })
  }
  getAllAssignPlaybookContactFilters() {
    return cy.findAllByRole('group', { hidden: true })
  }
  getStatusFilter() {
    return cy.get('[name="status"]')
  }
  getNoSubscriptionsFoundText() {
    return cy.findByText('No Subscriptions Found')
  }
}
