import Universal from './universal'

export default class Marketplace {
  universal = new Universal()
  //helper functions
  getCollapseToggleByFilterName(filterName: string) {
    cy.contains('div', filterName).scrollIntoView()
    cy.contains('div', filterName)
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { timeout: 24000 }).as(`toggle${filterName}`)
      })
    return cy.get(`@toggle${filterName}`)
  }
  clickAMenuItem(menuItemName: string) {
    cy.findByRole('menuitemcheckbox', { name: menuItemName }).scrollIntoView()
    cy.findByRole('menuitemcheckbox', { name: menuItemName }).should('be.visible')
    cy.findByRole('menuitemcheckbox', { name: menuItemName }).trigger('click')
    cy.findByRole('menuitemcheckbox', { name: menuItemName }).should(
      'have.attr',
      'aria-checked',
      'true'
    )
  }
  waitForFilterToLoad() {
    this.getAllItems().should('have.length', 0)
    this.getAllItems().should('have.length.gte', 1)
  }
  //visit a marketplace url
  visitFeaturedItems() {
    return cy.visit('/items')
  }
  visitAllItems() {
    return cy.visit('/items/marketplace')
  }
  visitMyItems() {
    return cy.visit('/items/postals')
  }
  visitEvents() {
    return cy.visit('/events/marketplace')
  }
  visitMyEvents() {
    return cy.visit('/events/postals')
  }
  visitCollections() {
    return cy.visit('/collections')
  }
  //subnavbar elements
  getSubNavbarFilterTag() {
    return cy.get('li')
  }
  getAllSubNavbarFilterTags() {
    return cy.get('li', { timeout: 24000 })
  }
  getClearAllFilters() {
    return cy.contains('Clear filters', { timeout: 24000 })
  }
  getOldClearAllFilters() {
    return cy.contains('Clear all filters', { timeout: 24000 })
  }
  getSubNavbarBooksTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Books')
  }
  getSubNavbarDirectMailTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Direct Mail')
  }
  getSubNavbar$10Tag() {
    return cy.contains('[data-testid="ui-tag"]', '$10')
  }
  getSubNavbar$20Tag() {
    return cy.contains('[data-testid="ui-tag"]', '$20')
  }
  getSubNavbarGiftCardsTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Gift Cards')
  }
  getSubNavbarFeaturedProductTag() {
    return cy.contains('[data-testid="ui-tag"]', `Idlewild Floral Co.`)
  }
  getSubNavbarFeaturedCategoryTag() {
    return cy.contains('[data-testid="ui-tag"]', `Flowers`)
  }
  //tabs
  getMyItemsTab() {
    return cy.findByRole('tab', { name: /My Items/i, timeout: 34000 })
  }
  getAllItemsTab() {
    return cy.findByRole('tab', { name: /All Items/i, timeout: 34000 })
  }
  getFeaturedTab() {
    return cy.findByRole('tab', { name: 'Featured Items' })
  }
  getAllEventsTab() {
    return cy.findByRole('tab', { name: 'All Events', timeout: 34000 })
  }
  getMyEventsTab() {
    return cy.findByRole('tab', { name: 'My Events' })
  }
  //default sidebar elements
  getSideBarHeader() {
    return cy.findByRole('heading', { name: 'Filter', timeout: 24000 })
  }
  getSearchCollapseToggle() {
    return this.getCollapseToggleByFilterName('Search')
  }
  getStatusCollapseToggle() {
    return this.getCollapseToggleByFilterName('Status')
  }
  getActiveRadio() {
    return cy.findByRole('radio', { name: 'Active' })
  }
  getDraftRadio() {
    return cy.findByRole('radio', { name: 'Draft' })
  }
  getCategoryCollapseToggle() {
    return this.getCollapseToggleByFilterName('Category')
  }
  getDirectMailRadio() {
    return cy.findByRole('radio', { name: 'Direct Mail', timeout: 24000 })
  }
  getGiftCardsRadio() {
    return cy.findByRole('radio', { name: 'Gift Cards' })
  }
  getBooksRadio() {
    return cy.findByRole('radio', { name: 'Books' })
  }
  getDrinksRadio() {
    return cy.findByRole('radio', { name: 'Drink' })
  }
  getPriceRangeCollapseToggle() {
    return this.getCollapseToggleByFilterName('Price')
  }
  getMinInput() {
    return cy.findAllByPlaceholderText('Min', { timeout: 94000 })
  }
  getMaxInput() {
    return cy.findAllByPlaceholderText('Max', { timeout: 94000 })
  }
  getApprovedItemsCheckbox() {
    return cy.findByRole('checkbox', { name: /Approved Items/i, timeout: 34000 })
  }
  //direct mail sidebar elements
  getOrientationCollapseToggle() {
    return this.getCollapseToggleByFilterName('Orientation')
  }
  getPortraitCheckbox() {
    return cy.findByRole('checkbox', { name: 'Portrait(2)' })
  }
  getCheckboxByName(name: string) {
    return cy.findByRole('checkbox', { name: name })
  }
  getSizeCollapseToggle() {
    return this.getCollapseToggleByFilterName('Size')
  }
  getTypeCollapseToggle() {
    return this.getCollapseToggleByFilterName('Type')
  }
  get4x6Checkbox() {
    return cy.findByRole('checkbox', { name: '4x6(1)', timeout: 30000 })
  }
  //price range sidebar elements
  getClearPriceRange() {
    cy.contains('div', 'Price').within(() => {
      cy.contains('clear', { timeout: 60000 }).as(`clearPriceRange`)
    })
    return cy.get(`@clearPriceRange`)
  }
  //concierge cards, links, and price range and lead times divs
  getBasicCard() {
    return cy.contains('div', 'Postal Basics')
  }
  getPremiumCard() {
    return cy.contains('div', 'Postal Premium')
  }
  getConciergeCard() {
    return cy.findByText(/^Postal Concierge$/).parent('div')
  }
  getBasicLink() {
    return cy.contains('a', 'quick and personalized?')
  }
  getPremiumLink() {
    return cy.contains('a', 'branded with a fast turnaround?')
  }
  getConciergeLink() {
    return cy.contains('a', 'design the perfect experience.')
  }
  getPriceRange() {
    return cy.contains('div', 'Price', { matchCase: false })
  }
  getLeadTime() {
    return cy.contains('div', 'Lead Time')
  }

  //Concierge page elements
  getCustomizedandCuratedHeading() {
    return cy.findByRole('heading', { name: 'Customized and Curated' })
  }
  getTimetoDeliver() {
    return cy.contains('div', 'Time to Deliver', { matchCase: false })
  }
  getClosetInfoCard() {
    return cy.contains('div', 'bring your physical swag closet into Postal.')
  }
  getExamplesTextAndContainer() {
    return cy.findByText('Customized Postal Examples').next('div')
  }
  getConectInfoCard() {
    return cy.contains('div', 'Connect with our Postal Concierge ')
  }
  getLetsGetStartedButton() {
    return cy.findByRole('button', { name: `Let's Get Started` })
  }
  getPostalConciergeRequestModal() {
    return cy.findByRole('dialog', { name: 'Postal Concierge Request' })
  }
  getConciergeSendSelect() {
    return cy.findByRole('combobox', { name: 'Send Frequency' })
  }
  getConciergeDateInput() {
    return cy.contains('div', 'In-Hands Date').find('input').eq(1)
  }
  getConciergeHowManyInput() {
    return cy.findByRole('spinbutton', { name: 'Units' })
  }
  getConciergeBudgetInput() {
    return cy.findByRole('spinbutton', { name: 'Budget' })
  }
  getConciergeTellUsMoreInput() {
    return cy.findByRole('textbox', { name: 'Project Notes' })
  }

  //get Featured category cards
  getCategoryByName(name: string) {
    return cy.contains('div', name)
  }
  getBooksCategory() {
    return cy.contains('[data-testid=Marketplace_CategoryCard_Generic] << div', 'Books', {
      timeout: 24000,
    })
  }
  getDirectMailCategory() {
    return cy.contains('div:has([data-testid=Marketplace_CategoryCard_Generic]}', 'Direct Mail')
  }
  //listed items: most can be used on both all items and my items
  getAllItems() {
    return cy.findAllByTestId('ui-card', { timeout: 74000 })
  }
  getNotFoundItem() {
    return cy.findByTestId('PostalCard_NotFound', { timeout: 61000 })
  }
  getAllItemsByButtonIds() {
    return cy.findAllByTestId('PostalCard_button_name', { timeout: 34000 })
  }
  getPostcardFromScratchHeading() {
    return cy.findByRole('heading', { name: 'Create a Postcard from scratch' })
  }
  getChipotleButton() {
    return cy.contains(/^Chipotle$/).parents('a')
  }
  getPostcardButton() {
    return cy.contains('a', 'Postcard', { timeout: 94000 })
  }
  chooseItemByName(name: string | RegExp) {
    this.getNewPostalByName(name)
      .parent('div')
      .parent('div')
      .realHover()
      .within(() => {
        cy.findByRole('button', { name: ' Item' }).should('be.visible').click({ force: true })
      })
  }
  oldChooseItemByName(name: string | RegExp) {
    this.getNewPostalByName(name)
      .parent('div')
      .realHover()
      .within(() => {
        cy.findByRole('button', { name: 'Choose this Item' })
          .should('be.visible')
          .click({ force: true })
      })
  }
  viewItemByName(name: string | RegExp) {
    this.getNewPostalByName(name)
      .should('be.visible')
      .parents('[data-testid="ui-card"]')
      .realHover()
      .within(() => {
        cy.findByRole('button', { name: 'View this Item' })
          .should('be.visible')
          .click({ force: true })
      })
  }
  selectItemByName(name: string | RegExp) {
    this.getNewPostalByName(name)
      .parent('div')
      .realHover()
      .within(() => {
        cy.findByRole('button', { name: 'Select Item' }).should('be.visible').click({ force: true })
      })
  }
  getBrochureButton() {
    return cy.contains('a', 'Brochure', { timeout: 74000 })
  }
  getNotecardButton() {
    return cy.contains('a', 'Notecard')
  }
  getBookButton() {
    return cy.contains('a', 'Everybody Lies:')
  }
  getNewPostalByName(name: RegExp | string) {
    if (typeof name != 'string') {
      return cy.contains('div', name, { timeout: 80000 })
    } else if (!name.includes('-CLONE')) {
      if (name.length > 12) {
        return cy.contains('div', name.slice(0, 11), { timeout: 80000 })
      }
    }
    return cy.contains('div', name, { timeout: 61000 })
  }
  getUpdate2ItemsButton() {
    return cy.findByRole('button', { name: 'Update 2 Items' })
  }
  //Postal Approve/edit workflow elements
  getNewPostalDrawerByName(name: string) {
    return cy.findByRole('dialog', { name: name })
  }
  getProductView() {
    cy.findAllByTestId('spinner').should('not.exist')
    return cy.findByTestId('MarketplaceProductPage_content')
  }
  getPostcardDrawer() {
    return cy.findByRole('dialog', { name: 'Postcard' })
  }
  getChipotleDrawer() {
    return cy.findByRole('dialog', { name: 'Chipotle' })
  }
  getDesignTemplatesDrawer() {
    return cy.findByRole('dialog', { name: 'Design Templates' })
  }
  getActionsButton() {
    return cy.findByRole('button', { name: 'Actions' })
  }
  getCustomizeThisActionItem() {
    return cy.findByRole('menuitem', { name: /Approve this Item/i })
  }
  getEditDesignActionItem() {
    return cy.findByRole('menuitem', { name: 'Edit Design' })
  }
  getDeleteActionItem() {
    return cy.findByRole('menuitem', { name: 'Delete Item', timeout: 80000 })
  }
  getAddToFavoritesActionItem() {
    return cy.findByRole('menuitem', { name: /Add to Favorites/ })
  }
  getCloneActionItem() {
    return cy.findByRole('menuitem', { name: 'Clone Item' })
  }
  getEditActionItem() {
    return cy.findByRole('menuitem', { name: 'Edit Item' })
  }
  getSendDirectlyItem() {
    return cy.findByRole('menuitem', { name: 'Send Directly' })
  }
  getSendItemMenuItem() {
    return cy.findByRole('menuitem', { name: 'Send Item' })
  }
  getSendActionItem() {
    return cy.findByRole('menuitem', { name: 'Send a Gift Email' })
  }
  getMagicLinkActionItem() {
    return cy.findByRole('menuitem', { name: 'Create a MagicLink' })
  }
  getDownloadDesignTemplateItem() {
    return cy.findByRole('menuitem', { name: 'Download Design Templates' })
  }
  getEllipsesButton() {
    return cy.findAllByTestId('SecondaryNavbar_actionMenu')
  }
  getEditDesignButton() {
    return cy.findByRole('button', { name: /Edit The Design/i })
  }
  getEditButton() {
    return cy.findByRole('button', { name: /Edit Item/i })
  }
  getEditCollectionMenuitem() {
    return cy.findByRole('menuitem', { name: /Edit Collection/i })
  }
  getSendButton() {
    return cy.findByRole('button', { name: /Send this Item/i })
  }
  getApproveThisButton() {
    return cy.findByRole('button', { name: /Approve/i })
  }
  getApproveAnywayButton() {
    return cy.findByRole('button', { name: /Approve anyway/i })
  }
  getOldApproveThisButton() {
    return cy.findByRole('button', { name: /Approve this Item/i })
  }
  getRequestItemButton() {
    return cy.findByRole('button', { name: 'Request Item' })
  }
  getSendRequestButton() {
    return cy.findByRole('button', { name: 'Send Request' })
  }
  getPostalNameInput() {
    return cy.findByLabelText('Name')
  }
  getDisplayNameInput() {
    return cy.findByLabelText('Display Name')
  }
  getPostalDescriptionInput() {
    return cy.findByLabelText('Description')
  }
  getDefaultMenuItem() {
    return cy.findByRole('menuitemradio')
  }
  getMenuItemByName(name: string | RegExp) {
    return cy.findByRole('menuitemcheckbox', { name: name })
  }
  getUpdatePostalButton() {
    return cy.findByRole('button', { name: /Update/i })
  }
  getSavePostalButton() {
    return cy.findByRole('button', { name: /Approve/i })
  }
  getOldSavePostalButton() {
    return cy.findByRole('button', { name: /Save this Item/i })
  }
  getCreateAMagicLinkButton() {
    return cy.findByRole('button', { name: /Create A MagicLink/i })
  }
  getSetStatusToggle() {
    return cy.contains('div', 'Status')
  }
  getItemCreatedMessage() {
    cy.getAlert({ message: 'Approved Item Created', close: 'close' })
  }
  getItemUpdatedMessage() {
    cy.getAlert({ message: 'Approved Item Updated', close: 'close' })
  }
  getItemDeletedMessage() {
    cy.getAlert({ message: 'Approved Item Deleted' })
  }
  getItemClonedMessage() {
    cy.getAlert({ message: 'Item Cloned', close: 'close' })
  }
  getCloseButton() {
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.get('footer').within(() => {
          cy.findByRole('button', { name: 'Close' }).as('closeButton')
        })
      })
    return cy.get('@closeButton')
  }
  closeCurrentDrawer() {
    this.getCloseButton().click({ force: true })
  }
  getDeleteItemModal() {
    return cy.findByRole('alertdialog', { name: 'Delete Item', timeout: 24000 })
  }
  getCloneItemModal() {
    return cy.findByRole('alertdialog', { name: 'Clone Item' })
  }
  getRequestSentModal() {
    return cy.contains('section', 'Request Sent')
  }
  getItemAlreadyAvailableModal() {
    return cy.contains('section', 'Item Already Available')
  }
  getAllViewThisItemButtons() {
    return cy.findAllByRole('button', { name: 'View this Item' })
  }
  getApprovedTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Approved')
  }
  getDraftTag() {
    return cy.contains('[data-testid="ui-tag"]', 'Draft')
  }
  getDeleteButton() {
    return cy.findByRole('button', { name: 'Delete' })
  }
  getCloneItemButton() {
    return cy.findByRole('button', { name: 'Clone Item' })
  }
  getMagicLinkButton() {
    return cy.findByRole('button', { name: 'Create a MagicLink' })
  }
  getChangeSearchMessage() {
    return cy.findByText(
      'No items found matching the selected tags. Please try changing your search criteria.'
    )
  }
  getNoItemsMessage() {
    return cy.findByText('You currently have no approved Items')
  }
  clickFeaturedDirectMailCard() {
    cy.findAllByTestId('spinner').should('not.exist')
    cy.wait(400)
    cy.contains('div', 'Direct Mail').scrollIntoView()
    cy.contains('div', 'Direct Mail')
      .should('be.visible')
      .parent('div')
      .click({ force: true, multiple: true })
  }
  clickFeaturedGiftCardsCard() {
    cy.contains('div', 'Gift Cards').scrollIntoView()
    cy.contains('div', 'Gift Cards')
      .should('be.visible')
      .within(() => {
        cy.get('img').trigger('click', { force: true })
      })
  }
  getAllCategoryCards() {
    return cy.findAllByTestId('Marketplace_CategoryCard_Generic')
  }
  categories() {
    return ['Direct Mail', 'Flowers & Plants', 'Books', 'Swag']
  }
  getDesignTemplatesGrid() {
    return cy.findByTestId('Marketplace_DesignTemplate_Grid')
  }
  getNotecardTemplatesGroup() {
    return cy.contains('div', 'Notecard')
  }
  getBrochureTemplatesGroup() {
    return cy.contains('div', 'Brochure')
  }
  getPostcardTemplatesGroup() {
    return cy.contains('div', 'Postcard')
  }
  getCombinedText() {
    return cy.findByText('Combined')
  }
  getInsideText() {
    return cy.findByText('Inside')
  }
  getOutsideText() {
    return cy.findByText('Outside')
  }
  getBackText() {
    return cy.findByText('Back')
  }
  getFrontText() {
    return cy.findByText('Front')
  }
  getMarketplaceToggle() {
    return cy.findByTestId('Marketplace_Toggle')
  }
  getPopularItemsText() {
    return cy.contains('Popular Items')
  }
  getPrivacyPolicyLink() {
    return cy.contains('a', 'PRIVACY POLICY')
  }
  getFeaturedPartnerText() {
    return cy.findByText(/^Featured Vendor$/i)
  }
  getViewTheirProductsButton() {
    return cy.contains(
      'button',
      RegExp(
        'Browse Products' +
          '|' +
          'Shop Seasonal' +
          '|' +
          'Shop Holiday' +
          '|' +
          'Shop Wellness' +
          '|' +
          'Shop Now'
      ),
      {
        timeout: 90000,
      }
    )
  }
  getEverythingToHeader() {
    return cy.findByRole('heading', { name: 'Everything to suit your needs' })
  }
  getOptionByName(name: string) {
    return cy.contains('div', name)
  }
  getSendItemIconButton() {
    return cy.findByLabelText('Send Item')
  }
  getCreateMagicLinkIconButton() {
    return cy.findByLabelText('Create MagicLink')
  }
  getSendShippedEmailTooltip() {
    return cy.contains('div', 'Send Shipped Email').find('svg')
  }
  getSendShippedEmailTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Send an email to your recipient when the item has shipped.',
    })
  }
  getSendDeliveredEmailTooltip() {
    return cy.contains('div', 'Send Delivered Email').find('svg')
  }
  getSendDeliveredEmailTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Send an email to your recipient when the item has been marked delivered.',
    })
  }
  getDisplayNameTooltip() {
    return cy.contains('label', 'Display Name').find('svg')
  }
  getDisplayNameTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'This name will be shown externally to your contacts, in gift emails and landing pages',
    })
  }
  getDescriptionNameTooltip() {
    return cy.contains('label', 'Description').find('svg')
  }
  getDescriptionNameTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The description will be shown externally to your contacts, in gift emails and landing pages',
    })
  }
  getTeamsTooltip() {
    return cy.contains('label', 'Teams').find('svg')
  }
  getTeamsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'You can restrict this item to certain teams',
    })
  }
  getReviewRecipientChoice() {
    return cy.contains('div', 'Recipient Choice').parent('div')
  }
  getCollectionsTab() {
    return cy.findByRole('tab', { name: /Collections/i })
  }
  getMyItemsHeaderButton() {
    return cy.findByRole('button', { name: 'back_to_my_items' })
  }
  getMarketplaceHeaderButton() {
    return cy.findByRole('button', { name: 'Back to All Items' })
  }
  getAvailableTeams() {
    return cy.contains('div', 'Available Teams')
  }
  getSendDirectlyButton() {
    return cy.findByRole('button', { name: 'Send this Item' })
  }
  getSendGiftEmailButton() {
    return cy.findByRole('button', { name: /Send a Gift Email/i })
  }
  getVariantShippingPrice() {
    return cy.findByTestId('PostalVariantOption_priceWords_shipping')
  }
  getHoverviewShippingPrice() {
    return cy.findByTestId('PostalCard_HoverviewPricing')
  }
  getChooseYourOptionsContainer() {
    return cy.contains('div', 'Choose your options')
  }
  getSelectAnOptionContainer() {
    return cy.contains('h2', 'Select an Option').parent('div')
  }
}
