export default class Universal {
  getCancelButton() {
    return cy.findByRole('button', { name: 'Cancel' })
  }
  getDeleteButton() {
    return cy.findByRole('button', { name: 'Delete' })
  }
  getSpinner() {
    return cy.findAllByTestId('spinner', { timeout: 100000 })
  }
  getUISpinner() {
    return cy.findAllByTestId('ui-spinner', { timeout: 100000 })
  }
  getProgressBar() {
    return cy.findAllByTestId('ui-progress-bar', { timeout: 100000 })
  }
  getTable() {
    return cy.findByRole('table')
  }
  getThingSpinner() {
    return cy.findByLabelText('thing', { timeout: 305000 })
  }
  getSideBar() {
    return cy.findByTestId('UiSidebar_card')
  }
  getSideBarToggle() {
    return cy.findByTestId('UiSidebar_collapse')
  }
  getActionsMenuButton() {
    return cy.findByRole('button', { name: 'Actions', timeout: 34000 })
  }
  getConfirmButton() {
    return cy.findByRole('button', { name: 'Confirm' })
  }
  getSaveButton() {
    return cy.findByRole('button', { name: 'Save', timeout: 94000 })
  }
  getResetButton() {
    return cy.findByRole('button', { name: 'Reset' })
  }
  getRowByText(text: string | RegExp) {
    return cy.contains('tr', text, { timeout: 90000 })
  }
  getAllGridCellsByText(text: string | RegExp) {
    return cy.findAllByRole('cell', { name: text })
  }
  getRowByNumber(number: number) {
    return this.getRowsInATableBody().eq(number, { timeout: 94000 })
  }
  getCloseButton() {
    cy.get('footer').within(() => {
      cy.findByRole('button', { name: 'Close' }).as('footerClose')
    })
    return cy.get('@footerClose')
  }
  getNewCloseButton() {
    return cy.contains('button', 'Close')
  }
  clickCloseButtonInFooter() {
    cy.get('footer').within(() => {
      cy.findByRole('button', { name: 'Close' }).click()
    })
  }
  getModalCloseButton() {
    return cy.findByTestId('UiModal_CloseButton')
  }
  getCloseButtonByLabelText() {
    return cy.findAllByLabelText(/Close/i, { timeout: 99000 })
  }
  getCheckboxForAllItems() {
    return cy.findAllByTestId('th-checkbox', { timeout: 99000 })
  }
  allCheckboxesAreChecked() {
    cy.findAllByRole('checkbox').should('be.checked')
  }
  getRowsInATableBody() {
    return cy.get('tbody>tr', { timeout: 97000 })
  }
  getPaginationPages(name: string | RegExp) {
    return cy.contains('[data-testid="pages"]', name)
  }
  getDoubleLeftButton() {
    return cy.findByTestId('doubleLeft')
  }
  getDoubleRightButton() {
    return cy.findByTestId('doubleRight')
  }
  getLeftButton() {
    return cy.findByTestId('left')
  }
  getRightButton() {
    return cy.findByTestId('right')
  }
  getAngleLeftButton() {
    return cy.findByTestId('angleLeft')
  }
  getAngleRightButton() {
    return cy.findByTestId('angleRight')
  }
  getNoItemsMessage() {
    return cy.findByText('No items found', { timeout: 50000 })
  }
  getTableHeader() {
    return cy.get('thead')
  }
  getRemoveButton() {
    return cy.findByRole('button', { name: 'Remove' })
  }
  getOrdersCard() {
    return cy.contains('[data-testid="ui-card"]', 'Orders')
  }
  getStatsCard() {
    return cy.contains('div', 'Stats')
  }
  //ViewModalElements
  getViewOrderModal() {
    return cy.findByRole('dialog', { name: 'View Order' })
  }
  getOldViewOrderModal() {
    return cy.findByRole('alertdialog', { name: 'View Order' })
  }
  getOldViewOrderHeaderByText(text: string | RegExp) {
    return cy.contains('h5', text)
  }
  getViewOrderHeaderByText(text: string | RegExp) {
    return cy.contains('h2', text)
  }
  getViewOrderGiftEmailMessage() {
    return cy.contains('div', /Email Message/i)
  }
  getViewOrderEventMessage() {
    return cy.contains('div', /Email Message/i)
  }
  getViewOrderSubjectLine() {
    return cy.contains('div', /Email Subject Line/i)
  }
  getViewOrderPhysicalCard() {
    return cy.contains('div', /Physical Message/i)
  }
  getOrderAgainButton() {
    return cy.contains('a', 'Order Again')
  }
  getRetryOrderButton() {
    return cy.contains('a', 'Retry Order')
  }
  // generalizing this because the test it is used in is not meant to test backend processing
  // which is what determines the text of this button
  // because backend processing  can be finicky in the test env this might be a better approach
  getRetryOrderAgainButton() {
    return cy.contains('a', /Retry Order|Order Again/)
  }
  getLinkByText(text: string | RegExp) {
    return cy.contains('a', text, { timeout: 61000 })
  }
  getPostalCard() {
    return cy.findByTestId('PostalBlock_Card', { timeout: 34000 })
  }
  getCollectionCard() {
    return cy.contains('[data-testid="ui-card"]', 'Collection')
  }
  getPostalCardName() {
    return cy.contains('div', 'Name')
  }
  getPostalCardOption() {
    return cy.contains('div', 'Option')
  }
  getPostalCardDescription() {
    return cy.contains('div', 'Description')
  }
  getPostalCardRecipientChoice() {
    return cy.contains('div', 'Recipient Choice')
  }
  getPostalCardCategory() {
    return cy.contains('div', 'Category')
  }
  getPostalCardBrand() {
    return cy.contains('div', 'Brand')
  }
  getPostalCardPrice() {
    return cy.contains('div', 'Price')
  }
  getPostalCardImage() {
    return cy.findByTestId('PostalBlock_Card_Image', { timeout: 34000 })
  }
  getAllMenuItems() {
    return cy.findAllByRole('menuitem')
  }
  getPagesPaginationButton() {
    return cy.findByTestId('pages')
  }
  getPaginationButton() {
    return cy.findByTestId('pagination')
  }
  //Table header Texts
  teamsTableHeaderText() {
    return 'Team NameStatusActive SinceRoles'
  }
  campaignsTableHeaderText() {
    return 'NameStatusStart DateCreatedOwnerSentCostCPT'
  }
  ordersTableHeaderText() {
    return 'DateItemContactCostStatus'
  }
  getUITag() {
    return cy.findByTestId('ui-tag')
  }
  getUITagByText(text: string) {
    return cy.contains('[data-testid="ui-tag"]', text)
  }
  getAllUITags() {
    return cy.findAllByTestId('ui-tag')
  }

  waitForProgressBar() {
    this.getProgressBar().should('exist').should('have.css', 'opacity', '1')
    this.getProgressBar().should('exist').and('have.css', 'opacity', '0')
  }
  progressBarZero() {
    this.getProgressBar().should('exist').and('have.css', 'opacity', '0')
  }
  waitForSpinner() {
    this.getSpinner().should('exist')
    this.getSpinner().should('not.exist')
  }
  getAllUiCards() {
    return cy.findAllByTestId('ui-card', { timeout: 55000 })
  }
  getItemUnavailableModal() {
    return cy.findByRole('alertdialog', { name: 'Item Unavailable' })
  }
  getItemUnavailableModalText() {
    return cy.contains(
      'The Item that you are attempting to resend has been removed, please choose a different Item.'
    )
  }
  getMoreMenu() {
    return cy.findAllByTestId('More_Menu', { timeout: 55000 })
  }
  getBackToButton(place: string) {
    return cy.findByRole('button', { name: `back_to_${place}` })
  }
  stubClipboardPrompt() {
    cy.window().then((win) => {
      //@ts-ignore
      cy.stub(win, 'prompt').returns(win.prompt).as('copyToClipboardPrompt')
    })
  }
  getClipboardPrompt() {
    return cy.get('@copyToClipboardPrompt')
  }
  getAllSelectedVariantOptionCards() {
    return cy.findAllByTestId('PostalVariantOption_card_selected')
  }
}
