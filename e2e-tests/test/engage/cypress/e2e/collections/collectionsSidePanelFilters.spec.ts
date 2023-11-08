import {
  CreateApprovedPostalDocument,
  MarketplaceProduct,
  SearchMarketplaceProductsDocument,
  Status,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Collections,
  Marketplace,
  SidePanel,
  SubNavbar,
  Universal,
} from '../../support/pageObjects'

describe(`Collection SidePanel Filters Testing`, function () {
  const user = userFactory()
  let products: MarketplaceProduct[]
  const marketplace = new Marketplace()
  const universal = new Universal()
  const subNavbar = new SubNavbar()
  const collections = new Collections()
  const sidePanel = new SidePanel()

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
                items: [
                  { variant: product.variants[0].id ?? '', marketplaceProductId: product.id },
                ],
                version: '2',
              },
            })
        })
      })
    cy.wait(1000)
    cy.createACollection({ numOfItems: 3 })
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:collections:filter')
  })

  it('tests the Collections SidePanel', () => {
    collections.visitCollections()
    cy.wait(300)
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    //tests Status filtering and menu options for My Collections
    //clears the active default
    sidePanel
      .getFilterHeader('Show Draft Items')
      .parent('div')
      .find('input')
      .should('be.visible')
      .and('not.be.checked')
      .check({ force: true })
    cy.wait(500)

    //Default is Active
    collections.getNoCollectionsFoundText().should('not.exist')
    universal.getUITagByText('Draft').should('not.exist')
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
      .uncheck({ force: true })
    cy.wait(500)

    subNavbar.getLeft().within(() => {
      subNavbar.getAllFilterTags().should('have.length', 0)
      cy.contains('Show Draft Items').should('not.exist')
    })
    collections.getCollectionByName('Seeded Collection').should('exist')
    //tests the sidepanel Search Bar
    //must type complete words, do not use - 'chip', 'every'
    cy.findByPlaceholderText('Search').should('be.visible').type('brochure')
    collections.getNoCollectionsFoundText().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'brochure')
      })
    cy.findByPlaceholderText('Search').clear()
    cy.findByPlaceholderText('Search').type('seeded')
    collections.getNoCollectionsFoundText().should('not.exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', 'seeded')
      })
    collections.getCollectionByName('Seeded Collection').should('exist')
    universal.getAllUiCards().should('have.length', 1)
    subNavbar.getAllFilterTags().eq(0).click()
    //tests filtering by price range
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
    collections.getCollectionByName('Seeded Collection').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '<$25')
      })
    marketplace.getClearPriceRange().click()
    sidePanel.getFilter('Min Cost').click()
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText(`$50-100`, { timeout: 65000, exact: true })
        .should('exist')
        .first()
        .click({ force: true })
    })
    collections.getNoCollectionsFoundText().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '$50-100')
      })
    cy.contains('a', 'clear').click()
    subNavbar.getLeft().within(() => {
      subNavbar.getAllFilterTags().should('not.exist')
    })
  })
})
