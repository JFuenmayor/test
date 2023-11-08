import {
  CreateApprovedPostalDocument,
  ItemType,
  MarketplaceProduct,
  MarketplaceSearchDocument,
  SearchMarketplaceProductsDocument,
  Status,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import { Marketplace, SidePanel, SubNavbar, Universal } from '../../support/pageObjects'

describe(`Marketplace SidePanel Filters Testing`, function () {
  const user = userFactory()
  let products: MarketplaceProduct[]
  let totalItems: number | null | undefined
  let id: string
  let accountId: string
  const marketplace = new Marketplace()
  const universal = new Universal()
  const sidePanel = new SidePanel()
  const subNavbar = new SubNavbar()

  before(function () {
    cy.signup(user)
    cy.teamsSeed(1)
    cy.graphqlRequest(SearchMarketplaceProductsDocument)
      .then((res) => {
        products = res.searchMarketplaceProducts || []
      })
      .then(() => {
        products.map((product) => {
          product?.variants?.[0]?.status === 'ACTIVE' &&
            product?.name !== 'Super-duper Fun Event' &&
            cy.graphqlRequest(CreateApprovedPostalDocument, {
              marketplaceProductId: product.id,
              data: {
                name: product.name,
                description: product.description,
                status: Status.Active,
                items: [{ variant: product.variants[0].id, marketplaceProductId: product.id }],
                version: '2',
              },
            })
        })
      })
    cy.wait(1000)
    cy.createACollection({ numOfItems: 3 })
    cy.currentUser().then((me) => {
      id = me.userId
      accountId = me.accountId
    })
    cy.graphqlRequest(MarketplaceSearchDocument, {
      query: {
        filters: [{ name: 'status', values: ['ACTIVE'] }],
        searchContext: {
          itemTypes: [ItemType.MarketplaceProduct, ItemType.MarketplaceProductPrivate],
        },
      },
    }).then((res) => {
      totalItems = res.marketplaceSearch.summary.totalRecords
    })
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:items:tabs')
    cy.filterLocalStorage('postal:items:approved:filter')
    cy.filterLocalStorage('postal:marketplace:filter')
  })

  it('tests the All Items SidePanel', () => {
    marketplace.visitAllItems()
    cy.url().should('contain', '/items/marketplace')
    universal.getSpinner().should('not.exist')
    marketplace.getNotecardButton().should('be.visible')
    //tests the sidepanel Search Bar
    //must type complete words, do not use - 'chip', 'every'
    cy.findByPlaceholderText('Search').fill('everybody')
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getBookButton().should('exist')
    marketplace.getAllItems().should('have.length', 3)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'everybody')
      })
    //tests that certain filters don't show up
    sidePanel.getFilterHeader('Show Draft Items').should('not.exist')
    sidePanel.getFilterHeader('Teams').should('not.exist')
    //test Ships To filtering
    marketplace.getClearAllFilters().click({ force: true })
    marketplace.getAllItems().should('have.length.gte', 3)
    cy.wait(1000)
    sidePanel.getFilter('Ship To Countries').realClick()
    sidePanel.getOpenFilterMenu().should('contain', `United States (${totalItems})`)
    sidePanel.selectFilter('Ship To Countries', `United States (${totalItems})`)
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    //@ts-ignore
    marketplace.getAllItems().should('have.length', totalItems + 1)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'USA')
      })
    marketplace.getClearAllFilters().click({ force: true })
    subNavbar.getLeft().eq(1).should('not.exist')

    sidePanel.getFilter('Ship To States').click()
    sidePanel
      .getOpenFilterMenu()
      .should('contain', `AK (${totalItems})`)
      //why totalItems - 1, because AL does not ship liquor so the Tolosa item will always be removed
      //@ts-ignore
      .and('contain', `AL (${totalItems - 1})`)
    //@ts-ignore
    sidePanel.selectFilter('Ship To States', `AL (${totalItems - 1})`)
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    //@ts-ignore
    marketplace.getAllItems().should('have.length', totalItems - 1 + 1)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'AL')
      })
    cy.contains('Tolosa').should('not.exist')
    marketplace.getClearAllFilters().click({ force: true })
    subNavbar.getLeft().eq(1).should('not.exist')
    cy.contains('Tolosa').should('exist')
    //why totalItems + 1, because there will always be an extra card for custom projects
    //@ts-ignore
    marketplace.getAllItems().should('have.length', totalItems + 1)
    //test Currency filtering
    sidePanel.getFilterHeader('Currency')
    cy.contains('div', 'USD').should('exist')
    cy.contains('div', 'GBP').should('exist')
    cy.contains('div', 'EUR').should('exist').click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getAllItems().should('have.length', 3)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'EUR')
      })
    marketplace.getNewPostalByName('Chipotle EU').should('exist')
    marketplace.getClearAllFilters().click({ force: true })
    sidePanel.getFilterHeader('Currency')
    cy.contains('div', 'USD').should('exist')
    cy.contains('div', 'EUR').should('exist')
    cy.contains('div', 'GBP').should('exist').click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getNewPostalByName('Chipotle EU').should('not.exist')
    marketplace.getAllItems().should('have.length', 3)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'GBP')
      })
    marketplace.getNewPostalByName('Chipotle UK').should('exist')
    marketplace.getClearAllFilters().click({ force: true })
    sidePanel.getFilterHeader('Currency')
    cy.contains('div', 'GBP').should('exist')
    cy.contains('div', 'EUR').should('exist')
    cy.contains('div', 'USD').should('exist').click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getAllItems().should('have.length.gt', 2)
    marketplace.getNewPostalByName('Chipotle UK').should('not.exist')
    marketplace.getNewPostalByName('Chipotle EU').should('not.exist')
    marketplace.getNewPostalByName('Chipotle').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getFilterTag().should('contain', 'USD')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //tests filtering by price range
    //marketplace.visitAllItems()
    cy.url().should('contain', '/items/marketplace')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Create a custom project with our team at Paper Plane Agency').should('be.visible')
    marketplace.getNewPostalByName('Chipotle').should('be.visible')
    cy.wait(400)
    sidePanel.getFilter('Min Cost').click()
    sidePanel.getOpenFilterMenu().within(() => {
      cy.findByText('$100-200', { exact: true })
      cy.findByText('$200-500', { exact: true })
      cy.findByText('$25-50', { exact: true })
      cy.findByText('$50-100', { exact: true })
      cy.findByText('<$25', { exact: true })
      cy.findByText('>$500', { exact: true })
    })
    //@ts-ignore
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText(`<$25`, { timeout: 65000, exact: true })
        .should('exist')
        .first()
        .click({ force: true })
    })
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    marketplace.getNewPostalByName('Tolosa Winery').should('not.exist')
    marketplace.getNewPostalByName('Everybody Lies: Big Data').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '<$25')
      })
    cy.wait(300)
    marketplace.getClearPriceRange().click()
    sidePanel.getFilter('Min Cost').click()
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText(`$50-100`, { timeout: 65000, exact: true })
        .should('exist')
        .first()
        .click({ force: true })
    })
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('Everybody Lies: Big Data').should('not.exist')
    marketplace.getNewPostalByName('Tolosa Winery').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '$50-100')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //tests category filtering
    marketplace.visitAllItems()
    cy.url().should('contain', '/items/marketplace')
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('Chipotle').should('be.visible')
    sidePanel.getFilter('Categories').click()
    cy.wait(500)
    sidePanel
      .getOpenFilterMenu()
      .should('contain', 'Books')
      .and('contain', 'Direct Mail')
      .and('contain', 'Drink')
      .and('contain', 'Gift Cards')
    //tests filtering by Direct Mail
    sidePanel.selectFilter('Categories', 'Direct Mail')
    universal.getSpinner().should('not.exist')
    //tests that the correct filters render
    cy.findByPlaceholderText('Search').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilter('Ship To').should('not.exist')
    cy.wait(1500)
    sidePanel.getFilter('Size').should('be.visible')
    sidePanel.getFilter('Size').scrollIntoView()
    sidePanel.getFilter('Size').realClick()
    sidePanel
      .getOpenFilterMenu()
      .should('contain', '4x6')
      .and('contain', '7x15')
      .and('contain', '8x6')
    sidePanel.getFilter('Type').should('exist').click()
    sidePanel
      .getOpenFilterMenu()
      .should('contain', 'Brochures')
      .and('contain', 'Notecards')
      .and('contain', 'Postcards')
    // sidePanel.getFilter('Orientation').should('exist').click({ force: true }).click()
    sidePanel.getFilter('Orientation').realClick()
    sidePanel.getOpenFilterMenu().should('contain', 'Landscape').and('contain', 'Portrait')
    marketplace.getPostcardButton().should('be.visible')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.text', 'Direct Mail')
      })
    marketplace.getNotecardButton().should('exist')
    marketplace.getBrochureButton().should('exist')
    //tests filtering with Direct Mail's Type filter
    sidePanel.selectFilter('Type', 'Notecard')
    universal.getSpinner().should('not.exist')
    marketplace.getBrochureButton().should('not.exist')
    marketplace.getNotecardButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 2)
          .and('contain', 'Direct Mail')
          .and('contain', 'Notecard')
      })
    sidePanel.getClearFilter('Type').click()
    //tests filtering with Direct Mail's Orientation filter
    sidePanel.selectFilter('Orientation', 'Portrait')
    universal.getSpinner().should('not.exist')
    marketplace.getNotecardButton().should('not.exist')
    marketplace.getBrochureButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 2)
          .and('contain', 'Direct Mail')
          .and('contain', 'Portrait')
      })
    sidePanel.getClearFilter('Orientation').click()
    //tests filtering with Direct Mail's Size filter
    sidePanel.selectFilter('Size', '4x6')
    universal.getSpinner().should('not.exist')
    marketplace.getBrochureButton().should('not.exist')
    marketplace.getPostcardButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 2)
          .and('contain', 'Direct Mail')
          .and('contain', '4x6')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //test filtering by Gift Cards
    sidePanel.selectFilter('Categories', 'Gift Cards')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.findByPlaceholderText('Search').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    sidePanel.getFilterHeader('Type').should('exist')

    //doesn't render any new filters so not gonna test any combinations right now
    marketplace.getNewPostalByName('Chipotle').should('exist')
    marketplace.getNewPostalByName('Chipotle EU').should('exist')
    marketplace.getNewPostalByName('Chipotle UK').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'Gift Cards')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //test filtering by Books

    sidePanel.selectFilter('Categories', 'Books')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.findByPlaceholderText('Search').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    sidePanel.getFilterHeader('Type').should('exist')
    marketplace.getBookButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'Books')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //test filtering by Drink
    sidePanel.selectFilter('Categories', 'Drink')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.findByPlaceholderText('Search').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    sidePanel.getFilterHeader('Type').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'Drink')
      })
    marketplace.getNewPostalByName('Tolosa Winery')
  })

  it('tests the My Items SidePanel', () => {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    //tests Status filtering and menu options for My Items
    marketplace.getNewPostalByName('Tolosa').should('exist')
    sidePanel
      .getFilterHeader('Show Draft Items')
      .parent('div')
      .find('input')
      .should('be.visible')
      .and('not.be.checked')
      .check({ force: true })
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1)
        cy.contains('Show Draft Items').should('exist')
      })
    sidePanel
      .getFilterHeader('Show Draft Items')
      .parent('div')
      .find('input')
      .should('be.visible')
      .and('be.checked')
      .uncheck({ force: true })
    subNavbar.getLeft().eq(1).should('not.exist')
    marketplace.getAllItems().should('have.length.gt', 1)
    sidePanel
      .getFilterHeader('Show Draft Items')
      .parent('div')
      .find('input')
      .should('be.visible')
      .and('not.be.checked')
      .check({ force: true })
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1)
        cy.contains('Show Draft Items').should('exist')
      })
    //tests the sidepanel Search Bar
    //must type complete words, do not use - 'chip', 'every'
    cy.findByPlaceholderText('Search').type('everybody')
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getBookButton().should('exist')
    marketplace.getAllItems().should('have.length', 3)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 2).and('contain', 'everybody')
      })
    //test Ships To filtering
    marketplace.getClearAllFilters().click({ force: true })
    marketplace.getAllItems().should('have.length.gte', 3)
    cy.wait(900)
    sidePanel.getFilter('Ship To Countries').click()
    sidePanel.getOpenFilterMenu().should('contain', `United States (${totalItems})`)
    sidePanel.selectFilter('Ship To Countries', `United States (${totalItems})`)
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    //@ts-ignore
    marketplace.getAllItems().should('have.length', totalItems + 1)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'USA')
      })
    marketplace.getClearAllFilters().click({ force: true })
    subNavbar.getLeft().eq(1).should('not.exist')
    sidePanel.getFilter('Ship To States').click()
    sidePanel
      .getOpenFilterMenu()
      .should('contain', `AK (${totalItems})`)
      //@ts-ignore
      .and('contain', `AL (${totalItems - 1})`)
    //@ts-ignore
    sidePanel.selectFilter('Ship To States', `AL (${totalItems - 1})`)
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    //@ts-ignore
    marketplace.getAllItems().should('have.length', totalItems + 1)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'AL')
      })
    cy.contains('Tolosa').should('not.exist')
    marketplace.getClearAllFilters().click({ force: true })
    subNavbar.getLeft().eq(1).should('not.exist')
    cy.contains('Tolosa').should('exist')
    //@ts-ignore
    marketplace.getAllItems().should('have.length', totalItems + 1)
    //test Currency filtering
    marketplace.getAllItems().should('have.length.gte', 2)
    sidePanel.getFilterHeader('Currency').should('exist')
    cy.contains('div', 'USD').should('exist')
    cy.contains('div', 'GBP').should('exist')
    cy.contains('div', 'EUR').should('exist').click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getAllItems().should('have.length', 3)
    marketplace.getNewPostalByName('Chipotle EU').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'EUR')
      })
    marketplace.getClearAllFilters().should('exist').click({ force: true })
    cy.contains('div', 'EUR').should('exist')
    cy.contains('div', 'USD').should('exist')
    cy.contains('div', 'GBP').should('exist').click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getAllItems().should('have.length', 3)
    marketplace.getNewPostalByName('Chipotle UK').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'GBP')
      })
    marketplace.getClearAllFilters().click({ force: true })
    cy.contains('div', 'EUR').should('exist')
    cy.contains('div', 'GBP').should('exist')
    cy.contains('div', 'USD').should('exist').click({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getNotFoundItem().should('not.exist')
    marketplace.getAllItems().should('have.length.gt', 2)
    marketplace.getNewPostalByName('Chipotle').should('exist')
    marketplace.getNewPostalByName('Chipotle UK').should('not.exist')
    marketplace.getNewPostalByName('Chipotle EU').should('not.exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'USD')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //tests filtering by price range
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('Tolosa').should('be.visible')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Create a custom project with our team at Paper Plane Agency').should('be.visible')
    marketplace.getNewPostalByName('Chipotle').should('be.visible')
    sidePanel.getFilter('Min Cost').click()
    sidePanel.getOpenFilterMenu().within(() => {
      cy.findByText('$100-200', { exact: true })
      cy.findByText('$200-500', { exact: true })
      cy.findByText('$25-50', { exact: true })
      cy.findByText('$50-100', { exact: true })
      cy.findByText('<$25', { exact: true })
      cy.findByText('>$500', { exact: true })
    })
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText(`<$25`, { timeout: 65000, exact: true })
        .should('exist')
        .first()
        .click({ force: true })
    })
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    marketplace.getNewPostalByName('Tolosa Winery').should('not.exist')
    marketplace.getNewPostalByName('Brochure').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '<$25')
      })
    marketplace.getClearPriceRange().click()
    // cy.graphqlRequest(MarketplaceSearchDocument, {
    //   query: {
    //     filters: [
    //       { name: 'status', values: ['ACTIVE'] },
    //       { name: 'minCost', values: ['$$'] },
    //     ],
    //     searchContext: {
    //       accountId: accountId,
    //       itemTypes: [ItemType.AccountProduct],
    //       userId: id,
    //     },
    //   },
    // }).then((res) => {
    //const $$ = res.marketplaceSearch.summary.totalRecords
    sidePanel.getFilter('Min Cost').click()
    cy.get('input:not([type="hidden"])').fill(`$50-100`)
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText('Loading...').should('not.exist')
      cy.contains('Found', { timeout: 25000 }).should('not.exist')
      cy.findByText(`$50-100`, { timeout: 65000, exact: true })
        .should('exist')
        .first()
        .click({ force: true })
    })
    //})
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('Brochure').should('not.exist')
    marketplace.getNewPostalByName('Everybody Lies').should('not.exist')
    marketplace.getNewPostalByName('Tolosa Winery').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '$50-100')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //tests category filtering
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    marketplace.getNewPostalByName('Chipotle').should('be.visible')
    sidePanel.getFilter('Categories').click()
    sidePanel
      .getOpenFilterMenu()
      .should('contain', 'Books')
      .and('contain', 'Direct Mail')
      //.and('contain', 'Drink')
      .and('contain', 'Gift Cards')
    //tests filtering by Direct Mail
    sidePanel.selectFilter('Categories', 'Direct Mail')
    universal.getSpinner().should('not.exist')
    //tests that the correct filters render
    sidePanel.getFilterHeader('Show Draft Items').should('exist')
    cy.findByPlaceholderText('Search').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    cy.wait(1100)
    sidePanel.getFilter('Size').should('be.visible')
    sidePanel.getFilter('Size').click()
    cy.wait(400)
    sidePanel
      .getOpenFilterMenu()
      .should('contain', '4x6')
      .and('contain', '7x15')
      .and('contain', '8x6')
    sidePanel.getFilter('Type').should('exist').click()
    sidePanel
      .getOpenFilterMenu()
      .should('contain', 'Brochures')
      .and('contain', 'Notecards')
      .and('contain', 'Postcards')
    sidePanel.getFilter('Orientation').should('exist').click({ force: true }).click()
    sidePanel.getOpenFilterMenu().should('contain', 'Landscape').and('contain', 'Portrait')
    marketplace.getPostcardButton().should('be.visible')
    marketplace.getNewPostalByName('Chipotle').should('not.exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).should('contain', 'Direct Mail')
      })
    marketplace.getNotecardButton().should('exist')
    marketplace.getBrochureButton().should('exist')
    //tests filtering with Direct Mail's Type filter
    sidePanel.selectFilter('Type', 'Brochure')
    universal.getSpinner().should('not.exist')
    marketplace.getNotecardButton().should('not.exist')
    marketplace.getBrochureButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 2)
          .and('contain', 'Direct Mail')
          .and('contain', 'Brochure')
      })
    sidePanel.clearFilter('Type')
    //tests filtering with Direct Mail's Orientation filter
    sidePanel.selectFilter('Orientation', 'Landscape')
    universal.getSpinner().should('not.exist')
    marketplace.getNotecardButton().should('exist')
    marketplace.getPostcardButton().should('exist')
    marketplace.getBrochureButton().should('not.exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 2)
          .and('contain', 'Direct Mail')
          .and('contain', 'Landscape')
      })
    sidePanel.clearFilter('Orientation')
    //tests filtering with Direct Mail's Size filter
    sidePanel.selectFilter('Size', '7x15')
    universal.getSpinner().should('not.exist')
    marketplace.getPostcardButton().should('not.exist')
    marketplace.getBrochureButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 2)
          .and('contain', 'Direct Mail')
          .and('contain', '7x15')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //test filtering by Gift Cards
    sidePanel.selectFilter('Categories', 'Gift Cards')
    marketplace.getBrochureButton().should('not.exist')
    sidePanel.getFilterHeader('Show Draft Items').should('be.visible').should('exist')
    cy.findByPlaceholderText('Search').should('be.visible').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    sidePanel.getFilter('Size').should('not.exist')
    sidePanel.getFilter('Type').should('exist')
    sidePanel.getFilter('Orientation').should('not.exist')
    //doesn't render any new filters so not gonna test any combinations right now
    marketplace.getNewPostalByName('Chipotle').should('be.visible')
    marketplace.getNewPostalByName('Chipotle EU').should('exist')
    marketplace.getNewPostalByName('Chipotle UK').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'Gift Cards')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //test filtering by Books
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getApprovedPostalFilters') {
        req.alias = 'getApprovedPostalFilters'
      }
    })
    sidePanel.selectFilter('Categories', 'Books')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    sidePanel.getFilterHeader('Show Draft Items').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    sidePanel.getFilter('Size').should('not.exist')
    sidePanel.getFilter('Type').should('exist')
    sidePanel.getFilter('Orientation').should('not.exist')
    marketplace.getBookButton().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'Books')
      })
    marketplace.getClearAllFilters().click({ force: true })
    //test filtering by Drink
    sidePanel.selectFilter('Categories', 'Drink')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    sidePanel.getFilterHeader('Show Draft Items').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Ships To (USA)').should('exist')
    sidePanel.getFilter('Size').should('not.exist')
    sidePanel.getFilter('Type').should('exist')
    sidePanel.getFilter('Orientation').should('not.exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'Drink')
      })
    marketplace.getNewPostalByName('Tolosa Winery')
  })
})
