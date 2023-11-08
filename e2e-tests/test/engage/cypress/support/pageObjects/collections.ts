export default class Collections {
  visitCollections() {
    return cy.visit('/collections')
  }
  //buttons
  getCreateCollectionButton() {
    return cy.contains('button', 'Create a Collection')
  }
  getCreateCollectionCardButton() {
    return cy.findByRole('button', { name: 'Create a collection' })
  }
  getSelectAnItemsButton() {
    return cy.contains('button', 'Select an Item(s)')
  }
  getSelectOptionsButton() {
    return cy.contains('button', 'Select Options')
  }
  getHeaderSaveButton() {
    return cy.contains('button', 'Save Collection')
  }
  getViewCollectionButton() {
    return cy.findByRole('button', { name: 'View this Collection' })
  }
  getBackToCollectionsButton() {
    return cy.findByRole('button', { name: 'back_to_collections' })
  }
  getEditCollectionItemButton() {
    return cy.findByLabelText('Edit Item')
  }
  getSaveThisCollectionButton() {
    return cy.findByRole('button', { name: /Save this Collection/i })
  }
  getSaveCollectionOptionButton() {
    return cy.findByRole('button', { name: 'Save Options' })
  }
  getEditCollectionCancelButton() {
    return cy.findByRole('button', { name: 'Cancel' })
  }
  getEditCollectionButton() {
    return cy.findByLabelText('SubNavbar Title')
  }
  getEditThisCollectionButton() {
    return cy.findByRole('button', { name: 'Edit Settings' })
  }
  getSendThisCollectionButton() {
    return cy.findByRole('button', { name: 'Send this Collection' })
  }
  getCreateMagicLinkButton() {
    return cy.findByRole('button', { name: /Create A MagicLink/i, timeout: 34000 })
  }
  getCopyMagicLinkButton() {
    return cy.findByRole('button', { name: /Copy MagicLink/i })
  }
  getEnableThisCollectionButton() {
    return cy.findByRole('button', { name: RegExp('Enabled' + '|' + 'Draft') })
  }
  getDeleteCollectionItemButton() {
    return cy.findByLabelText('Delete Item')
  }
  getSaveCollectionItemButton() {
    return cy.findByRole('button', { name: 'Add Items to Collection' })
  }
  getSendItemIconButton() {
    return cy.findByLabelText('Send Item')
  }
  getCreateMagicLinkIconButton() {
    return cy.findByLabelText('Link Item')
  }
  getCloneCollectionButton() {
    return cy.findByRole('button', { name: 'Clone Collection' })
  }
  //drawers

  getCollectionEditDrawerByName(name: string) {
    return cy.contains('section', name)
  }
  //variants
  getSelectedVariantByName(name: string) {
    return cy.contains('[data-testid="PostalVariantCard_card_selected"]', name)
  }
  getUnselectedVariantOptionByName(name: string) {
    return cy.contains('[data-testid="PostalVariantOption_card_unselected"]', name)
  }
  getSelectedVariantOptionByName(name: string) {
    return cy.contains('[data-testid="PostalVariantOption_card_selected"]', name)
  }
  //cards
  getCollectionByName(name: string) {
    return cy.contains('[data-testid="ui-card"]', name, { timeout: 40000 })
  }
  selectCollectionByName(name: string) {
    this.getCollectionByName(name)
      .realHover()
      .within(() => {
        this.getViewCollectionButton().should('be.visible').click()
      })
  }
  getAddAnItemCard() {
    return cy.contains('button', 'Add an Item(s)')
  }
  //info
  getCollectionNavCenterByName(name: string) {
    return cy.contains('[data-testid="atomic-subnavbar-left"]', name, { timeout: 34000 })
  }
  getCollectionItems() {
    return cy.contains('div', /Items/i)
  }
  getCollectionPrice() {
    return cy.contains('div', /Price/i)
  }
  getCollectionSent() {
    return cy.contains('div', /Sent/i)
  }
  //line items
  getCollectionItemByName(name: string | RegExp) {
    return cy.contains('[data-testid="ui-card"]', name)
  }

  getCollectionVariantListItem(name: string | RegExp) {
    return cy.contains('[data-testid="ui-card"]', name)
  }
  //modals and modal text
  getRemoveItemModal() {
    return cy.contains('section', 'Are you sure?')
  }
  getRemoveItemButton() {
    return cy.contains('button', 'Confirm')
  }
  getRemoveItemModalText() {
    return cy.contains('and its variants from this collection?')
  }
  getDeleteCollectionModal() {
    return cy.contains('section', /Delete Collection/i)
  }
  getCloneCollectionModal() {
    return cy.contains('section', 'Clone Collection')
  }
  //alerts
  getCollectionUpdatedAlert() {
    return cy.getAlert({ message: 'Collection Updated' })
  }
  getSelectOptionAlert() {
    return cy.getAlert({ message: 'Please select at least one option' })
  }
  getCollectionDisabledAlert() {
    cy.getAlert({ message: 'Collection Disabled', close: 'close' })
  }
  getCollectionEnabledAlert() {
    cy.getAlert({ message: 'Collection Enabled', close: 'close' })
  }
  getCollectionCreatedAlert() {
    return cy.getAlert({ message: 'Collection Created', close: 'close' })
  }
  getCollectionClonedAlert() {
    return cy.getAlert({ message: 'Collection Cloned', close: 'close' })
  }
  //input
  getEditCollectionNameInput() {
    return cy.findByLabelText('Collection Name*')
  }
  getEditCollectionDisplayNameInput() {
    return cy.findByLabelText('Display Name*')
  }
  getNameCollectionInput() {
    return cy.findByPlaceholderText('This is only visible within your organization')
  }
  getDisplayNameCollectionInput() {
    return cy.findByPlaceholderText('This is the name your recipients will see')
  }
  //tooltips and tooltips text
  getOptionsAvailableToRecipientTooltip() {
    return cy.contains('h3', 'Options Available to Recipient').find('svg')
  }
  getOptionsAvailableToRecipientTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Recipients will choose from available options when accepting the order.',
    })
  }
  getDisplayNameTooltip() {
    return cy.contains('div', 'Display Name').find('svg')
  }
  getDisplayNameTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'This name will be shown externally to your contacts, in gift emails and landing pages',
    })
  }
  getTeamsTooltip() {
    return cy.contains('label', 'Teams').find('svg')
  }
  getTeamsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'You can restrict this collection to certain teams',
    })
  }
  //menuitems
  getEditCollectionMenuItem() {
    return cy.findByRole('menuitem', { name: /Edit Collection/i })
  }
  getEnableCollectionMenuItem() {
    return cy.findByRole('menuitem', { name: /Enable Collection/i })
  }
  getDisableCollectionMenuItem() {
    return cy.findByRole('menuitem', { name: /Disable Collection/i })
  }
  getSendCollectionMenuItem() {
    return cy.findByRole('menuitem', { name: /Send Collection/i })
  }
  getCreateMagicLinkMenuItem() {
    return cy.findByRole('menuitem', { name: /Create MagicLink/i })
  }
  getDeleteCollectionMenuItem() {
    return cy.findByRole('menuitem', { name: /Delete Collection/i })
  }
  getCloneCollectionMenuItem() {
    return cy.findByRole('menuitem', { name: /Clone Collection/i })
  }
  //tags
  getDraftTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Draft')
  }
  getEnabledTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Enabled')
  }
  getCollectionTag() {
    return cy.contains(/collection/i)
  }
  //text
  getNoCollectionsFoundText() {
    return cy.contains('collections were found matching this search criteria')
  }
  getNoCollectionsText() {
    return cy.findByText('No Collections available', { timeout: 90000 })
  }
  getNoActiveTeamsCollectionsText() {
    return cy.contains('No active team collections were found matching this search criteria')
  }
  getNoActivePrivateCollectionsText() {
    return cy.contains('No active private collections were found matching this search criteria.')
  }
  //checkboxes
  getShowTeamCollectionsCheckbox() {
    return cy.get('[name="Show My Collections"]')
  }
  getShareCollectionCheckbox() {
    return cy.findByRole('checkbox', { name: 'Visibility Share Collection' })
  }
}
