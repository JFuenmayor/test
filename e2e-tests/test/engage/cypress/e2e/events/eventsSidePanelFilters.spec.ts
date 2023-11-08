import { addDays, addWeeks, format } from 'date-fns'
import { Status, UpdateApprovedPostalDocument } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Events, Marketplace, SidePanel, SubNavbar, Universal } from '../../support/pageObjects'

describe(`Events SidePanel Filters Testing`, function () {
  const user = userFactory()
  const marketplace = new Marketplace()
  const universal = new Universal()
  const sidePanel = new SidePanel()
  const subNavbar = new SubNavbar()
  //const teams = new Teams()
  const events = new Events()
  const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')

  const weekN2DaysFromToday = dateFormatInput(addWeeks(addDays(new Date(), 2), 1))
  const weekN3DaysFromToday = dateFormatInput(addWeeks(addDays(new Date(), 3), 1))

  before(function () {
    cy.signup(user)
    cy.teamsSeed(1)
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:marketplace:filter')
    cy.filterLocalStorage('postal:reporting:tab')
    cy.filterLocalStorage('postal:events:approved:filter')
    cy.filterLocalStorage('postal:events:contacts:filter')
    cy.filterLocalStorage('postal:events:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'createApprovedPostal') {
        req.alias = 'createApprovedPostal'
      }
    })
  })

  it('tests the All Events and My Events SidePanels', () => {
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getMarketplaceFilters') {
        req.alias = 'getMarketplaceFilters'
      }
    })
    marketplace.visitEvents()
    universal.getSpinner().should('not.exist')
    //tests certain filters don't show up here
    sidePanel.getFilterHeader('Price').should('exist').and('be.visible')
    sidePanel.getFilter('Status').should('not.exist')
    sidePanel.getFilter('Categories').should('not.exist')
    sidePanel.getFilter('Teams').should('not.exist')
    sidePanel.getFilter('Card Included').should('not.exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.getFilter('Ship To').should('not.exist')
    sidePanel.getFilter('Size').should('not.exist')
    //sidePanel.getFilter('Type').should('exist')
    sidePanel.getFilter('Orientation').should('not.exist')
    sidePanel.getFilter('Fulfillment Type').should('not.exist')
    //tests the sidepanel Search Bar
    //must type complete words, do not use - 'chip', 'every'
    events.getEventByName('Super-duper Fun Event').should('exist')
    cy.findByPlaceholderText('Search').type('everybody')
    events.getNoEventsText().should('exist')
    cy.findByPlaceholderText('Search').clear()
    events.getEventByName('Super-duper Fun Event').should('exist')
    cy.findByPlaceholderText('Search').type('super-duper')
    events.getNoEventsText().should('not.exist')
    events.getEventByName('Super-duper Fun Event').should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 1)
          .and('contain', 'super-duper')
          .find('button')
          .click()
      })
    //tests filtering by price
    marketplace.visitEvents()
    universal.getSpinner().should('not.exist')
    events.getEventByName('Super-duper Fun Event').should('exist')
    cy.wait(500)
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
    cy.wait(400)
    events.getEventByName('Super-duper Fun Event').should('exist')
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
    events.getNoEventsText().should('exist')
    cy.wait(200)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '$').eq(0).click()
      })
    //creates and approves an event
    cy.wait(400)
    cy.contains('Not Found').should('not.exist')
    events
      .getSuperDuperFunEvent()
      .should('exist')
      .within(() => {
        cy.get('img').should('be.visible')
        cy.get('a').click({ force: true })
      })
    universal.getSpinner().should('not.exist')
    events.getPhoneInput().type('753-736-5346')
    events.getMessageInput().fill('teamAdmin requesting')
    events.getPreferredDate1Input().type(`${weekN2DaysFromToday} 9:00 AM{enter}`, { force: true })
    events.getPreferredDate2Input().scrollIntoView()
    events.getPreferredDate2Input().type(`${weekN3DaysFromToday} 9:00 AM{enter}`, { force: true })
    // eslint-disable-next-line
    cy.getAllUnselectedVariants().should('have.length.gte', 2)
    // eslint-disable-next-line
    cy.getAllUnselectedVariants().eq(0).click({ force: true })
    events.getAgreeToTermsCheckbox().check({ force: true }).should('be.checked')
    events.getBookYourEventButton().click({ force: true })
    events.getBookedEventModal().within(() => {
      universal.getLinkByText('temporary event').should('be.visible')
      events.getBookedEventModalText().should('be.visible')
      universal.getCloseButton().click()
    })
    cy.wait('@createApprovedPostal').then((res) => {
      cy.url().should('include', '/events/postals')
      universal.getSpinner().should('not.exist')
      cy.approveEvent(res.response?.body.data.createApprovedPostal.postal.id).then((res) => {
        expect(res.event.status).to.eq('ACCEPTING_INVITES')
        cy.graphqlRequest(UpdateApprovedPostalDocument, {
          id: res.id,
          data: { status: Status.Active },
        })
      })
    })
    //tests the My Events SidePanel
    marketplace.visitMyEvents()
    universal.getSpinner().should('not.exist')
    //tests certain filters don't show up here
    cy.wait(300)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Super-duper Fun Event')) {
        cy.wait(46000)
        cy.reload()
      }
    })
    events.getEventByName('Super-duper Fun Event').should('exist')
    sidePanel.getFilterHeader('Price').should('exist').and('be.visible')
    sidePanel.getFilter('Status').should('not.exist')
    sidePanel.getFilter('Categories').should('not.exist')
    sidePanel.getFilter('Card Included').should('not.exist')
    sidePanel.getFilter('Fulfillment Type').should('not.exist')
    //sidePanel.getFilter('Type').should('exist')
    sidePanel.getFilter('Ship To').should('not.exist')
    sidePanel.getFilter('Size').should('not.exist')
    sidePanel.getFilter('Teams').should('exist')
    sidePanel.getFilter('Orientation').should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Super-duper Fun Event')) {
        cy.wait(10500)
        cy.reload()
      }
    })
    events.getEventByName('Super-duper Fun Event').should('exist')
    //tests the sidepanel Search Bar
    //must type complete words, do not use - 'chip', 'every'
    cy.contains('button', 'Clear filters').click()
    cy.wait(300)
    cy.findByPlaceholderText('Search').type('everybody')
    events.getNoEventsText().should('exist')
    cy.findByPlaceholderText('Search').clear()
    events.getEventByName('Super-duper Fun Event').should('exist')
    cy.findByPlaceholderText('Search').type('super-duper')
    events.getEventByName('Super-duper Fun Event').should('exist')
    events.getNoEventsText().should('not.exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar
          .getAllFilterTags()
          .should('have.length', 1)
          .and('contain', 'super-duper')
          .find('button')
          .click()
      })
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
    cy.wait(400)
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '<$25')
      })
    events.getEventByName('Super-duper Fun Event').should('exist')
    marketplace.getClearPriceRange().click({ force: true })
    sidePanel.getFilter('Min Cost').click()
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText(`$50-100`, { timeout: 65000, exact: true })
        .should('exist')
        .first()
        .click({ force: true })
    })
    events.getNoEventsText().should('exist')
    subNavbar
      .getLeft()
      .eq(1)
      .within(() => {
        subNavbar.getAllFilterTags().should('have.length', 1).and('contain', '$').eq(0).click()
      })
    cy.contains('Super-duper Fun Event').should('exist')
  })
})
