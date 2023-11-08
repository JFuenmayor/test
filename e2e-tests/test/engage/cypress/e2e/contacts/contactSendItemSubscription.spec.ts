import { addDays } from 'date-fns'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  BulkContactAddToPlaybookDocument,
  PaymentPartnerType,
  SearchContactsV2Document,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Contacts,
  Marketplace,
  Reporting,
  SendItem,
  Subscriptions,
  Universal,
} from '../../support/pageObjects'

describe('Contacts: Send A Item & Send A Subscription', function () {
  const contacts = new Contacts()
  const universal = new Universal()
  const marketplace = new Marketplace()
  const sendItem = new SendItem()
  const reporting = new Reporting()
  const subscriptions = new Subscriptions()
  const user = userFactory()
  const todaysDate = new Date().toLocaleDateString('en-US')
  const tomorrowsDate = addDays(new Date(), 1).toLocaleDateString('en-US')

  let contactId: string
  let approvedPostalId: string
  let approvedVariantId: string

  before(() => {
    cy.signup(user)
    //creates a contact with a valid address
    cy.createAContact({ firstName: 'Dax', lastName: 'Ratke' })
      .then((resp) => {
        contactId = resp.id
      })
      .its('type')
      .should('eq', 'CONTACT')
    cy.createApprovedPostcard({
      name: 'Postcard',
      description: 'Approved Postal',
    }).then((postal) => {
      approvedPostalId = postal.id
      approvedVariantId = postal.variants?.[0].id ?? ''
    })
    //puts $30 in the default account
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 3000,
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
    cy.filterLocalStorage('postal:contacts:filter')
    cy.filterLocalStorage('postal:contacts:table')
  })

  it('tests send an Item workflow', function () {
    cy.queryForUpdateRecurse({
      request: SearchContactsV2Document,
      operationName: 'searchContactsV2',
      key: 'resultsSummary',
      value: 1,
      key2: 'totalRecords',
    })
    contacts.visitContacts()
    universal.progressBarZero()
    cy.url().should('include', '/contacts')
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 1)
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendItemButton().click()
    universal.getUISpinner().should('not.exist')
    sendItem.getSelectItemDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      cy.contains('a', 'Postcard').click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    //todo: add more testing for this new page?
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBillingAccount') {
        req.alias = 'getBillingAccount'
      }
    })
    sendItem.getReviewButton().click({ force: true })
    cy.wait('@getBillingAccount')
    universal.getProgressBar().should('not.exist')
    sendItem.getSaveAndSendButton().should('not.be.disabled').click({ force: true })
    //tests that a potsal gets submitted sucessfully
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    //todo: test the sucess page more
    cy.contains('Success! Your item is on the way!')
    reporting.visitReporting()
    reporting.getOrderReportTab().should('be.visible').click({ force: true })
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 1)
  })
  it('tests send a Subscription workflow', function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    universal.getUISpinner().should('not.exist')
    cy.url().should('include', '/contacts')
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 1)
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendPlaybookIconButton().click()
    subscriptions.getAddContactsToPlaybookDrawer().within(() => {
      subscriptions.getNoSubscriptionsFoundText().should('exist')
      subscriptions.getAddToPlaybookButton().should('be.visible')
      universal.getCancelButton().click()
    })
    //creates a subscription
    cy.subscriptionsSeed({
      approvedPostalId: approvedPostalId,
      variantId: approvedVariantId,
      numberOfSubscriptions: 1,
    }).then((resp) => {
      cy.graphqlRequest(BulkContactAddToPlaybookDocument, {
        playbookDefinitionId: resp.createPlaybookDefinition.id,
        ids: [contactId],
      })
        .its('bulkContactAddToPlaybook.status')
        .should('eq', 'PENDING')
    })
    //reloads in order to allow created subscription to take
    cy.reload()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    universal.getUISpinner().should('not.exist')
    cy.url().should('include', '/contacts')
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 1)
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendPlaybookIconButton().click()
    subscriptions.getAddContactsToPlaybookDrawer().within(() => {
      subscriptions
        .getPlaybookByName('Subscription One')
        .within(() => {
          subscriptions.getItemsInfo().should('contain', '1')
          subscriptions.getCostInfo().should('contain', '$0.71')
          subscriptions.getDurationInfo().should('contain', '0')
          cy.contains('div', 'Step 1').should('contain', 'Postcard')
        })
        .trigger('mouseover', { force: true })
      subscriptions.getSelectPlaybookButton().should('be.visible').click()
      subscriptions.getSelectedIndicator().should('be.visible')
      cy.intercept('/engage/api/graphql', (req) => {
        if (req.body.operationName === 'getBackgroundTaskById') {
          req.alias = 'getBackgroundTaskById'
        }
      })
      subscriptions.getAddToPlaybookButton().should('be.visible').click()
    })
    // cy.wait('@getBackgroundTaskById')
    //   .its('response.body.data.getBackgroundTaskById.status')
    //   .should('eq', 'COMPLETED')
    subscriptions.getAddContactsToPlaybookDrawer().should('not.exist')
    cy.visit(`v2/contacts/${contactId}`)
    universal.getSpinner().should('not.exist')
    universal.getRowByText('Postcard').within(() => {
      cy.contains('Direct').should('exist')
      cy.contains(`Dax Ratke`).should('exist')
      cy.contains('[data-testid="ui-tag"]', /Processing/i).should('exist')
    })
    contacts.getSubscriptionsTab().click({ force: true })
    universal.progressBarZero()
    universal
      .getRowByText('Subscription One')
      .scrollIntoView()
      .within(() => {
        cy.contains('0 of 1').should('exist')
        cy.contains(/^0$/).should('exist')
        cy.contains(RegExp(todaysDate + '|' + tomorrowsDate)).should('exist')
        cy.contains('[data-testid="ui-tag"]', /Active/i).should('exist')
        universal.getActionsMenuButton().should('exist')
      })
  })
  //todo: click the postcard and subscription and test where they lead
})
