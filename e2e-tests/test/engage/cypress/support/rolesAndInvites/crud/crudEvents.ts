import { addDays, addWeeks, format } from 'date-fns'
import { Events, Marketplace, Universal } from '../../pageObjects'

export interface crudEventsProps {
  team: string
}
const events = new Events()
const universal = new Universal()
const marketplace = new Marketplace()

const weekFromToday = format(addWeeks(new Date(), 1), 'MMMM d, yyyy')
const weekNADayFromToday = format(addWeeks(addDays(new Date(), 1), 1), 'MMMM d, yyyy')

Cypress.Commands.add('crudEvents', (args: crudEventsProps) => {
  const team = args.team
  cy.intercept('/engage/api/graphql', (req) => {
    if (req.body.operationName === 'getApprovedPostal') {
      req.alias = 'getApprovedPostal'
    }
    if (req.body.operationName === 'getApprovedPostalFilters') {
      req.alias = 'getApprovedPostalFilters'
    }
    if (req.body.operationName === 'searchApprovedPostals') {
      req.alias = 'searchApprovedPostals'
    }
  })
  //Requests an event
  events.visitEvents()
  universal.waitForSpinner()
  events.getSuperDuperFunEvent().click()
  universal.getSpinner().should('not.exist')
  events.getPhoneInput().type('753-736-5346')
  events.getMessageInput().fill('teamAdmin requesting')
  events.getPreferredDate1Input().type(`${weekFromToday} 9:00 AM{enter}`, { force: true })
  // eslint-disable-next-line
  cy.getAllUnselectedVariants().should('have.length.gte', 2)
  // eslint-disable-next-line
  cy.getAllUnselectedVariants().eq(0).click({ force: true })
  events.getPreferredDate2Input().type(`${weekNADayFromToday} 9:00 AM{enter}`, { force: true })
  events.getAgreeToTermsCheckbox().check({ force: true }).should('be.checked')
  events.getBookYourEventButton().click({ force: true })
  events.getBookedEventModal().within(() => {
    universal.getLinkByText('temporary event').should('be.visible')
    events.getBookedEventModalText().should('be.visible')
    universal.getCloseButton().click()
  })
  cy.wait('@getApprovedPostal').then((res) => {
    cy.url().should('include', '/events/postals')
    universal.getSpinner().should('not.exist')
    cy.approveEvent(res.response?.body.data.getApprovedPostal.id)
  })
  cy.reload()
  events.getBackToMyEventsButton().click()
  cy.wait('@getApprovedPostalFilters')
  cy.wait('@searchApprovedPostals')
  universal.getSpinner().should('not.exist')
  events.getSuperDuperFunEvent().click()
  universal.getSpinner().should('not.exist')
  universal.getNoItemsMessage().should('be.visible')
  marketplace.getAvailableTeams().should('contain', team)

  //Edits an Event
  events.getEditThisEventButton().click()
  events.getNameEditInput().clear().type('teamAdminEdited')
  events.getMaxAttendeesEditInput().clear().type('20')
  events.getSaveThisEventButton().click()
  cy.findByText('teamAdminEdited').should('exist')
  cy.findByText('0 of 20').should('exist')
})
