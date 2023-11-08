import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { userFactory } from '../../support/factories'
import { BulkSelect, Marketplace, SidePanel, Universal } from '../../support/pageObjects'
describe('Bulk Select test suite', () => {
  const user = userFactory()
  const bulkSelect = new BulkSelect()
  const marketplace = new Marketplace()
  const universal = new Universal()
  const sidePanel = new SidePanel()

  before(() => {
    cy.signup(user)
    cy.teamsSeed(1)
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 500000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:items:approved:filter')
    cy.filterLocalStorage('postal:marketplace:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
    })
  })

  it('Bulk Select testing', () => {
    //tests using bulk select to approve two postals
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Everybody Lies: Big Data').should('be.visible')
    cy.contains('div', 'USD').click()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Chipotle UK').should('not.exist')
    bulkSelect.getItemByName('Everybody Lies: Big Data')
    bulkSelect.getItemByName('Chipotle')
    cy.contains('2 selected').should('exist')
    cy.contains('Cancel (esc)').should('exist')
    bulkSelect.getBulkApproveButton().click()
    bulkSelect.getConfirmBulkApproveItemsModal().within(() => {
      cy.contains('You have selected the following 2 Items:').should('exist')
      cy.contains('Everybody Lies: Big Data').should('exist')
      cy.contains(/^Chipotle$/).should('exist')
      cy.contains('Enable or Draft these Items').should('exist')
      cy.findByTestId('bulkApprovedItemStatus').select('Enable')
      cy.findByTestId('bulkApprovedItemStatus')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['ACTIVE', 'DISABLED'])
        })
      cy.contains('Please specify any Team(s) that can use these Items')
      cy.findByTestId('AutoCompleteTeam').scrollIntoView()
      cy.selectAutoCompleteTeam('Jersey')
      universal.getCancelButton().should('exist')
      bulkSelect.getConfirmApproveButton(2).click({ force: true })
    })
    marketplace.getApprovedItemsCheckbox().should('be.checked')
    universal.getSpinner().should('not.exist')
    universal.getThingSpinner().should('not.exist')
    cy.wait(800)
    sidePanel.waitForFilterHeader()
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Everybody Lies')) {
        cy.wait(61000)
        cy.reload()
      }
    })
    marketplace.getAllItems().should('have.length', 4).should('be.visible')
    marketplace.getNewPostalByName('Everybody Lies: Big Data').should('be.visible')
    cy.contains('a', 'Chipotle').click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getSpinner().should('not.exist')
    marketplace.getAvailableTeams().scrollIntoView().should('contain', 'Jersey')

    //tests using bulk select to edit 2 postals
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Everybody Lies: Big Data').should('be.visible')
    bulkSelect.getItemByName('Everybody Lies: Big Data')
    cy.contains('1 selected').should('exist')
    bulkSelect.getItemByName('Chipotle')
    cy.contains('2 selected').should('exist')
    bulkSelect.getBulkEditButton().click()
    bulkSelect.getConfirmBulkUpdateItemsModal().within(() => {
      cy.contains('You have selected the following 2 Items:')
      cy.contains('Everybody Lies: Big Data')
      cy.contains(/^Chipotle$/)
      cy.contains('Enable or Draft these Items')
      cy.findByTestId('bulkApprovedItemStatus').select('Draft')
      cy.findByTestId('bulkApprovedItemStatus')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['', 'ACTIVE', 'DISABLED'])
        })
      cy.contains('Please specify any Team(s) that can use these Items')
      cy.selectAutoCompleteTeam('Jersey')

      cy.getAutoCompleteValues('AutoCompleteTeam')
        .should('contain', 'Jersey')
        .within(() => {
          cy.findByRole('button').click()
        })
      universal.getCancelButton().should('exist')

      universal.getCancelButton().should('exist')
      bulkSelect.getConfirmUpdateButton(2).click()
    })
    cy.catchCallsRecurse({
      operationName: 'getBackgroundTaskById',
      key: 'successCount',
      value: 2,
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Everybody Lies')) {
        cy.wait(61000)
        cy.reload()
      }
    })
    marketplace.getAllItems().should('have.length', 2).should('be.visible')
    cy.wait(200)
    sidePanel
      .getFilterHeader('Show Draft Items')
      .parent('div')
      .find('input')
      .should('be.visible')
      .and('not.be.checked')
      .check({ force: true })
    marketplace.getNewPostalByName('Everybody Lies: Big Data').should('exist')
    marketplace.getNewPostalByName('Chipotle').should('exist')
  })
})
//Todo: select all for aproval, select all for edit, bulk add items to a collection P2-3748
