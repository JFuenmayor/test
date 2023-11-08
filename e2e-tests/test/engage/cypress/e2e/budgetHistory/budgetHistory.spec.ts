import { userFactory } from '../../support/factories'
import { Universal } from '../../support/pageObjects'

describe('Budget History test suite', () => {
  const user = userFactory()
  const universal = new Universal()

  before(() => {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
  })

  it('tests budget history page', () => {
    cy.graphqlMockSet({
      operationName: 'searchBudgetHistory',
      count: 2,
      fixture: 'searchBudgetHistoryMockA.json',
    })
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      count: 2,
      fixture: 'searchBudgetHistoryMockB.json',
    })
    cy.graphqlMockStart()
    visitBudgetHistory()
    universal.progressBarZero()
    universal.getRowsInATableBody().should('have.length', 10)
    universal.getPagesPaginationButton().should('contain', '1 / 2')
    cy.fixture('searchBudgetHistoryMockA.json').then((json) => {
      cy.graphqlMockSet({
        operationName: 'searchBudgetHistory',
        count: 2,
        response: filterIt('CHANGED', json),
      })
      getFilterSelect().select('Changed')
      universal.waitForProgressBar()
      universal.getNoItemsMessage().should('not.exist')
      universal
        .getRowsInATableBody()
        .should('have.length', 1)
        .within(() => {
          universal.getUITag().should('contain', 'Changed')
          getBudgetCell()
            .should('contain.text', '$500.00MonthlyPooled')
            .and('contain', '$500.00MonthlyUnlimited')
        })

      cy.graphqlMockSet({
        operationName: 'searchBudgetHistory',
        count: 1,
        response: filterIt('REMAINING_INCREASED', json),
      })
      cy.graphqlMockSet({
        operationName: 'searchPostalFulfillments',
        count: 1,
        fixture: 'searchBudgetHistoryMockB.json',
      })
      getFilterSelect().select('Refund')
      universal.waitForProgressBar()
      universal
        .getRowsInATableBody()
        .should('have.length', 1)
        .within(() => {
          universal.getUITag().should('contain', 'Refund')
          getRemainingCell().should('contain', '∞').and('contain', '∞')
          cy.findByText('$82.50')
          getBudgetCell().should('contain', '$500.00MonthlyUnlimited')
          universal.getLinkByText('dmddmdm').click()
        })
      universal.getViewOrderModal().within(() => {
        universal.getCloseButtonByLabelText().click()
      })
      universal.getLinkByText('fred frank').click()
      cy.url().should('include', '/contacts/')
      visitBudgetHistory()
      cy.graphqlMockSet({
        operationName: 'searchBudgetHistory',
        count: 3,
        response: filterIt('REMAINING_REDUCED', json),
      })
      cy.graphqlMockSet({
        operationName: 'searchPostalFulfillments',
        count: 3,
        fixture: 'searchBudgetHistoryMockB.json',
      })
      getFilterSelect().select('Drawdown')
      universal.waitForProgressBar()
      universal
        .getRowsInATableBody()
        .should('have.length', 8)
        .eq(0)
        .within(() => {
          universal.getUITag().should('contain', 'Drawdown')
          getRemainingCell().should('contain', '∞').and('contain', '∞')
          cy.findByText('$0.77')
          getBudgetCell().should('contain', '$500.00MonthlyUnlimited')
          universal.getLinkByText('Postcard - 6x9').should('exist')
          universal.getLinkByText('Mark Mallady').should('exist')
        })

      cy.graphqlMockSet({
        operationName: 'searchBudgetHistory',
        count: 2,
        response: filterIt('RESET', json),
      })
      cy.graphqlMockSet({
        operationName: 'searchPostalFulfillments',
        count: 2,
        fixture: 'searchBudgetHistoryMockB.json',
      })
      getFilterSelect().select('Reset')
      universal.waitForProgressBar()
      universal
        .getRowsInATableBody()
        .should('have.length', 1)
        .within(() => {
          universal.getUITag().should('contain', 'Reset')
          cy.contains('$500.00')
          getBudgetCell().should('have.text', '$500.00MonthlyPooled')
        })
      cy.graphqlMockSet({
        operationName: 'searchBudgetHistory',
        count: 2,
        fixture: 'searchBudgetHistoryMockA.json',
      })
      cy.graphqlMockSet({
        operationName: 'searchPostalFulfillments',
        count: 2,
        fixture: 'searchBudgetHistoryMockB.json',
      })
      getFilterSelect().select('Select a Type')
      universal.waitForProgressBar()
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowsInATableBody().should('have.length', 10)
      //tests the time sort
      universal.getRowByNumber(0).should('contain', '8/24/21')
      cy.graphqlMockSet({
        operationName: 'searchBudgetHistory',
        count: 2,
        response: sortIt(json),
      })
      getTimeSort().click()
      cy.wait(300)
      universal.progressBarZero()
      universal.getRowsInATableBody().should('have.length.gt', 2)
      universal.getRowByNumber(0).should('not.contain', '8/24/21')
      universal.getRowByNumber(0).should('contain', '3/31/21')
    })
  })
})

function visitBudgetHistory() {
  return cy.visit('v2/budget/history')
}
function getBudgetCell() {
  return cy.contains('td', 'Monthly')
}
function getRemainingCell() {
  return cy.contains('div', '∞')
}
function getFilterSelect() {
  return cy.findByRole('combobox')
}
function getTimeSort() {
  return cy.contains('a', 'Time')
}

function filterIt(logType: string, json: any) {
  const data = json.data.searchBudgetHistory.data.filter(
    (log: { type: string }) => log.type == logType
  )
  const filtered = {
    data: {
      searchBudgetHistory: {
        data,
        resultsSummary: {
          hasMore: false,
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
        },
      },
    },
  }
  return filtered
}

function sortIt(json: any) {
  const data = json.data.searchBudgetHistory.data.reverse()
  const filtered = {
    data: {
      searchBudgetHistory: {
        data,
        resultsSummary: {
          hasMore: false,
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
        },
      },
    },
  }
  return filtered
}
