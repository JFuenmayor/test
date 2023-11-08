import { userFactory } from '../../support/factories'
import { Marketplace, Navbar, SidePanel, SubNavbar, Universal } from '../../support/pageObjects'

describe('Marketplace test suite', () => {
  const user = userFactory()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const universal = new Universal()
  const sidePanel = new SidePanel()
  const subNavbar = new SubNavbar()

  before(() => {
    cy.signup(user)
    marketplace.visitFeaturedItems()
    cy.url().should('include', '/items')
    Cypress.on('uncaught:exception', () => {
      return false
    })
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:items:tabs')
    cy.filterLocalStorage('postal:marketplace:filter')
  })

  it('loads the marketplace categories landing page', () => {
    marketplace.visitFeaturedItems()
    navbar.getMarketplaceLink().should('exist')
    universal.getSpinner().should('not.exist')

    //find Featured Partner
    marketplace.getViewTheirProductsButton().should('be.visible')

    //find postal category cards
    universal.getSpinner().should('not.exist')
    marketplace.categories().forEach((i) => {
      marketplace.getCategoryByName(i).scrollIntoView()
    })

    //todo: test clicking the category cards
    //todo: tests best sellers and show all
    //todo: tests best sellers and prices
    //todo: tests international items text and links
    //todo: tests events tests, links and show all

    //tests opening the concierge dialogues through the marketplace search
    cy.contains(
      RegExp('Def Leppard T-Shirt' + '|' + 'Holiday Items' + '|' + 'Best Sellers')
    ).should('exist')
    sidePanel.getSearchBar().type('peonies')
    universal.getSpinner().should('not.exist')
    cy.findByRole('button', {
      name: `Don't see what you're looking for? Recommend a product`,
    }).should('exist')
    cy.findByRole('button', { name: 'Create a custom project with our team at Paper Plane Agency' })
      .should('be.visible')
      .parent('div')
      .find('[data-testid="ui-card"]')
      .click({
        force: true,
      })
    cy.url().should('include', '/paperplane')
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    sidePanel.waitForFilterHeader()
    subNavbar.clearFilter('peonies')

    universal.getSpinner().should('not.exist')
    sidePanel.getFilter('Categories').click()
    sidePanel.selectFilter('Categories', 'Books')
    universal.getSpinner().should('not.exist')
    cy.findByRole('button', {
      name: 'Create a custom project with our team at Paper Plane Agency',
    }).should('exist')
    marketplace.getNewPostalByName('Everybody Lies:').should('exist')
    cy.findByRole('button', {
      name: `Don't see what you're looking for? Recommend a product`,
    }).should('exist')
    //clisking the above page now opens a page outside of the postal app rather than a dialogue
    // cy.findByRole('dialog', { name: 'Recommend a Product' }).within(() => {
    //   cy.findAllByLabelText('Product Name*').fill('WESTERN BUTTERCUP SEEDS')
    //   cy.findAllByLabelText('Product URL*').fill(
    //     'https://www.everwilde.com/store/Ranunculus-occidentalis-WildFlower-Seed.html'
    //   )
    //   cy.findAllByLabelText('Your Message').fill('buttercups please')
    //   marketplace.getSendRequestButton().click()
    // })
    // cy.findByRole('dialog', { name: 'Recommend a Product' }).should('not.exist')

    //it('has an action menu item for downloading Design Templates in the subnavbar', () => {
    //cy.visit('/items/marketplace')
    //Find and open action menu item
    // marketplace.getDownloadDesignTemplateItem().click({ force: true })
    // marketplace
    //   .getDesignTemplatesDrawer()
    //   .should('be.visible')
    //   .within(() => {
    //     //collect and check UI items for accuracy
    //     marketplace
    //       .getDesignTemplatesGrid()
    //       .should('be.visible')
    //       .within(() => {
    //         marketplace.getNotecardTemplatesGroup()
    //         marketplace.getBrochureTemplatesGroup().within(() => {
    //           marketplace.getCombinedText().should('exist')
    //           marketplace.getInsideText().should('exist')
    //           marketplace.getOutsideText().should('exist')
    //         })
    //         marketplace.getPostcardTemplatesGroup().within(() => {
    //           marketplace.getCombinedText().should('exist')
    //           marketplace.getFrontText().should('exist')
    //           marketplace.getBackText().should('exist')
    //         })
    //       })
    //   })
    // marketplace.getCloseButton().click()
    // marketplace.getDesignTemplatesDrawer().should('not.exist')
    //})
  })
})
