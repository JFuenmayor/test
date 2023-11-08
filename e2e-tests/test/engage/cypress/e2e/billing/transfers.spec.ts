import { faker } from '@faker-js/faker'
import { addDays, format } from 'date-fns'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  CreateBillingAccountDocument,
  Currency,
  PaymentPartnerType,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import { Billing, Profile, Universal } from '../../support/pageObjects'

describe('Billing: Transfers Testing', function () {
  const user = userFactory()
  const billing = new Billing()
  const profile = new Profile()
  const universal = new Universal()
  const accountNames: string[] = ['Alpha', 'Omega']
  const dateFormatReview = (date: Date) => format(date, 'M/d/yy')
  const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
  const todaysDate = dateFormatReview(new Date())

  beforeEach(() => {
    cy.signup(user)
    //puts $300 in the default account
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 30000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    cy.queryForUpdateRecurse({
      request: BillingAccountsDocument,
      options: { filter: { type: { eq: 'FUNDS' } } },
      operationName: 'billingAccounts',
      key: '0',
      value: 30000,
      key2: 'balance',
    })
    //adds multiple new accounts with $0 in them
    accountNames.forEach((name) => {
      cy.graphqlRequest(CreateBillingAccountDocument, {
        data: {
          name: name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.userName,
          country: 'USA',
          state: 'CA',
        },
      })
    })
    //adda an account using euros
    cy.graphqlRequest(CreateBillingAccountDocument, {
      data: {
        name: `Barry's`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userName,
        country: 'DEU',
        state: 'Bavaria',
        currency: Currency.Eur,
      },
    })
    cy.login(user)
  })

  it(`tests transfering money to different accounts`, function () {
    //tests domestic transfers
    billing.visitTransfers()
    cy.contains('Transfers').should('exist')
    profile.getTransfersLink().should('be.visible')
    billing.getSetUpAForeignCurrencyTransfer().should('have.attr', 'aria-selected', 'false')
    billing.getSetUpADomesticTransfer().should('have.attr', 'aria-selected', 'true')
    billing.getForeignCurrencyTransferInfoCard().should('not.be.visible')
    billing.getDomesticTransferInfoCard().should('be.visible')
    //tests the blank Transfer History card
    billing.getTransferHistoryCard().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    //tests validation, options, and transferring money from the default account to Omega
    billing.getSetUpATransferCard().within(() => {
      // click to show dropdown, then default + three new accounts = 4
      billing.getTransferFromSelect().click().find('.select-account-row').should('have.length', 4)
      cy.findByText('$300.00').should('exist')
      cy.selectAutoCompleteTransferFromAccount(`${user.company}'s Fund Management`)

      // 3 from above - the selected transfer from account
      cy.selectAutoCompleteTransferToAccount(`${accountNames[1]} Fund Management`)
      billing.getTransferToSelect().click().find('.select-account-row').should('have.length', 2)
      billing.getAmountInput().getInputValidation('Please fill out this field.').type('100')
      billing
        .getNotesInput()
        .getInputValidation('Please fill out this field.')
        .fill(faker.lorem.paragraph(1))
      billing.getSetUpTransferButton().click()
    })
    //tests the review and confirm modal render
    billing.getReviewandConfirmModal().within(() => {
      billing
        .getTransferFrom()
        .should('contain', `${user.company}'s Fund Management Billing Account`)
      billing.getTransferTo().should('contain', `${accountNames[1]} Fund Management`)
      billing.getAmount().should('contain', `$100.00`)
      billing.getDate().should('contain', todaysDate)
      billing.getConfirmTransferText(
        '$100.00',
        `${user.company}'s Fund Management Billing Account`,
        `${accountNames[1]} Fund Management`,
        todaysDate
      )
      universal.getConfirmButton().click({ force: true })
    })
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      } else if (!$body.text().includes('Back to Home')) {
        billing.getReviewandConfirmModal().should('not.exist')
        cy.getAlert({ message: 'Transfer confirmed', close: 'close' })
      }
    })
    //tests that the transfer history table is now populated
    billing.getTransferHistoryCard().within(() => {
      universal.getRowsInATableBody().should('have.length', 1)
      universal.getTableHeader().should('contain', billing.tranfersTableHeaderText())
      universal.getRowByNumber(0).within(() => {
        cy.contains(new Date().toLocaleDateString())
        cy.findByText('$100.00')
        cy.contains(truncateIt(`${user.company}'s Fund Management Billing Account`))
        cy.contains(`${accountNames[1]} Fund Management`)
        billing.getTagByText('COMPLETE').should('exist')
      })
    })

    //tests transferring money from the Omega account to the Alpha Account
    billing.getSetUpATransferCard().within(() => {
      cy.selectAutoCompleteTransferFromAccount(`${accountNames[1]} Fund Management`)
      cy.findByText('$100.00').should('exist')
      cy.selectAutoCompleteTransferToAccount(`${accountNames[0]} Fund Management`)
      billing.getAmountInput().type('25')
      billing.getNotesInput().fill(faker.lorem.paragraph(1))
      billing.getSetUpTransferButton().click({ force: true })
    })
    billing.getReviewandConfirmModal().within(() => {
      billing.getTransferFrom().should('contain', `${accountNames[1]} Fund Management`)
      billing.getTransferTo().should('contain', `${accountNames[0]} Fund Management`)
      billing.getAmount().should('contain', `$25.00`)
      billing.getDate().should('contain', todaysDate)
      billing.getConfirmTransferText(
        '$25.00',
        `${accountNames[1]} Fund Management`,
        `${accountNames[0]} Fund Management`,
        todaysDate
      )
      universal.getConfirmButton().click()
    })
    billing.getReviewandConfirmModal().should('not.exist')
    billing.getTransferHistoryCard().within(() => {
      universal.getRowsInATableBody().should('have.length', 2)
      universal.getRowByNumber(0).within(() => {
        cy.contains(new Date().toLocaleDateString())
        universal.getUITag().should('contain', 'COMPLETE')
        cy.findByText('$25.00')
      })

      universal.getRowByNumber(1).within(() => {
        cy.contains(new Date().toLocaleDateString())
        universal.getUITag().should('contain', 'COMPLETE')
        cy.findByText('$100.00')
      })
    })
    //tests transferring money from the Alpha account to the Default Account
    billing.getSetUpATransferCard().within(() => {
      cy.selectAutoCompleteTransferFromAccount(`${accountNames[0]} Fund Management`)
      cy.findByText('$25.00').should('exist')
      cy.selectAutoCompleteTransferToAccount(`${user.company}'s Fund Management Billing Account`)
      billing.getAmountInput().type('5.55')
      billing.getNotesInput().fill(faker.lorem.paragraph(1))
      billing.getSetUpTransferButton().click()
    })
    billing.getReviewandConfirmModal().within(() => {
      billing.getTransferFrom().should('contain', `${accountNames[0]} Fund Management`)
      billing.getTransferTo().should('contain', `${user.company}'s Fund Management Billing Account`)
      billing.getAmount().should('contain', `$5.55`)
      billing.getDate().should('contain', todaysDate)
      billing.getConfirmTransferText(
        '$5.55',
        `${accountNames[0]} Fund Management`,
        `${user.company}'s Fund Management Billing Account`,
        todaysDate
      )
      universal.getConfirmButton().click()
    })
    billing.getReviewandConfirmModal().should('not.exist')
    billing.getTransferHistoryCard().within(() => {
      universal.getRowsInATableBody().should('have.length', 3)
      universal.getRowByNumber(0).within(() => {
        cy.contains(new Date().toLocaleDateString())
        billing.getTagByText(RegExp('COMPLETE' + '|' + 'CREATED'))
        cy.findByText('$5.55')
        cy.contains(accountNames[0])
        cy.contains(truncateIt(user.company))
      })
    })

    billing.getSetUpATransferCard().within(() => {
      cy.selectAutoCompleteTransferFromAccount(`${user.company}'s Fund Management Billing Account`)
      cy.findByText('$205.55').should('exist')
    })
    //tests clicking a link in the Transfer History table
    billing.getTransferHistoryCard().within(() => {
      cy.findAllByRole('link', { name: `${accountNames[0]} Fund Management` })
        .eq(1)
        .click({ force: true })
    })
    //tests transfer money via the Setup Transfer Link in an account's profile page
    billing.getCurrentBalance().should('contain', '$19.45')
    billing.getSetupTransferLink().click()
    billing.getSetUpATransferModal().within(() => {
      cy.findByDisplayValue(`${accountNames[0]} Fund Management`).should('be.visible')
      cy.findByText('$19.45').should('be.visible')
      billing.getModalTransferToSelect().select(`${user.company}'s Fund Management Billing Account`)
      billing.getAmountInput().type('2.00')
      billing.getNotesInput().fill(faker.lorem.paragraph(1))
      billing.getSetUpTransferButton().click()
    })
    billing.getReviewandConfirmModal().within(() => {
      billing.getTransferFrom().should('contain', `${accountNames[0]} Fund Management`)
      billing.getTransferTo().should('contain', `${user.company}'s Fund Management Billing Account`)
      billing.getAmount().should('contain', `$2.00`)
      billing.getDate().should('contain', todaysDate)
      billing.getConfirmTransferText(
        '$2.00',
        `${accountNames[0]} Fund Management`,
        `${user.company}'s Fund Management Billing Account`,
        todaysDate
      )
      universal.getConfirmButton().click()
    })
    billing.getSetUpATransferCard().within(() => {
      cy.selectAutoCompleteTransferFromAccount(`${accountNames[0]} Fund Management`)
      cy.findByText('$17.45').should('exist')
    })
    billing.getTransferHistoryCard().within(() => {
      cy.findAllByRole('link', { name: `${accountNames[0]} Fund Management` })
        .eq(1)
        .click({ force: true })
    })
    billing.getCurrentBalance().should('contain', '$17.45')
    //tests the Transfer History Cards filters
    billing.visitTransfers()
    billing.getTransferHistoryCard().within(() => {
      //tests From Account filter
      universal.getRowsInATableBody().should('have.length', 4)
      cy.get('.UiSelectTypeahead__input').eq(0).scrollIntoView()
      cy.get('.UiSelectTypeahead__input').eq(0).should('be.visible').click({ force: true })
      cy.get('.UiSelectTypeahead__menu').within(() => {
        cy.contains(truncateIt(`${user.company}'s Fund Management Billing Account`)).click({
          force: true,
        })
      })
      universal.getRowsInATableBody().should('have.length', 1)
      //tests Clear All link
      billing.getClearAllLink().click()
      universal.getRowsInATableBody().should('have.length', 4)
      //tests the To Account filter
      cy.get('.UiSelectTypeahead__input').eq(1).click({ force: true })
      cy.get('.UiSelectTypeahead__menu').within(() => {
        cy.contains(truncateIt(`${accountNames[1]} Fund Management`)).click()
      })
      universal.getRowsInATableBody().should('have.length', 1)
      billing.getClearAllLink().click()
      universal.getRowsInATableBody().should('have.length', 4)
      //test the date range filter
      universal.progressBarZero()
      cy.findAllByPlaceholderText('Date Range')
        .eq(1)
        .type(
          `${dateFormatInput(addDays(new Date(), 1))} to ${dateFormatInput(
            addDays(new Date(), 2)
          )}{enter}`,
          {
            force: true,
          }
        )
      universal.getNoItemsMessage().should('exist')
      billing.getClearAllLink().click({ force: true })
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowsInATableBody().should('have.length', 4)
    })
    //tests the Set up a foreign currency transfer form
    billing
      .getSetUpAForeignCurrencyTransfer()
      .click({ force: true })
      .should('have.attr', 'aria-selected', 'true')
    billing.getSetUpADomesticTransfer().should('have.attr', 'aria-selected', 'false')
    billing.getDomesticTransferInfoCard().should('not.be.visible')
    billing.getForeignCurrencyTransferInfoCard().should('be.visible')
    cy.contains(
      'Foreign currency transfers will execute at the exchange rate evaluated on the time of the transfer request.'
    ).should('be.visible')
    //tests transferring money from Omega account to Barry's Account
    billing.getSetUpATransferCard().within(() => {
      cy.selectAutoCompleteTransferFromAccount(`${accountNames[1]} Fund Management`)
      cy.findByText('$75.00').should('exist')
      //just barry's account should be selected-able because it is the only with foreign currency
      billing.getTransferToSelect().click().find('.select-account-row').should('have.length', 1)
      cy.findByText('No other valid Accounts found').should('exist')
      billing.getTransferToSelect().should('contain', `Barry's Fund Management`)
      billing.getAmountInput().type('35')
      billing.getNotesInput().fill(faker.lorem.paragraph(1))
      billing.getSetUpTransferButton().click()
    })
    billing.getConfirmForeignTransferModal().within(() => {
      billing.getConfirmForeignTransferFrom().within(() => {
        cy.contains(`${accountNames[1]} Fund Management`)
        cy.contains('BALANCE: $75.00')
        cy.contains('Rate provided on')
        cy.contains('by Mock Postal FX Rate Provider')
        cy.wait(300)
        cy.contains('FX rate').find('svg').should('be.visible').realHover()
      })
    })
    cy.contains('Foreign Exchange Rate: $', { timeout: 99000 })
      .should('contain', '= €')
      .and('be.visible')
    billing.getConfirmForeignTransferModal().within(() => {
      billing.getConfirmForeignTransferTo().within(() => {
        cy.contains(`Barry's Fund Management`)
        cy.contains('BALANCE: €0.00')
        cy.contains('Transfer/convenience Fees')
      })
      cy.contains(
        'By clicking confirm you acknowledge the transfer of funds in the amount of $35.00 (€'
      )
      cy.contains(
        `from ${accountNames[1]} Fund Management to Barry's Fund Management effective ${todaysDate}`
      )
      universal.getSaveButton().click()
    })
    billing.getTransferHistoryCard().within(() => {
      universal.getRowsInATableBody().should('have.length', 5)
      universal.getTableHeader().should('not.contain', billing.tranfersTableHeaderText())
      universal.getTableHeader().should('contain', billing.newTranfersTableHeaderText())
      universal.getRowByNumber(0).within(() => {
        cy.contains(new Date().toLocaleDateString())
        cy.contains('td', '$35.00').should('contain', '€')
        cy.contains(`${accountNames[1]} Fund Management`)
        cy.contains(`Barry's Fund Management`)
        billing.getTagByText('COMPLETE').should('exist')
      })
    })
    //tests transferring money from Barry's Account to Omega account
    billing.getSetUpATransferCard().within(() => {
      cy.wait(300)
      cy.selectAutoCompleteTransferFromAccount(`Barry's Fund Management`)
      cy.selectAutoCompleteTransferToAccount(`${accountNames[1]} Fund Management`)
      billing.getAmountInput().type('3')
      billing.getNotesInput().fill(faker.lorem.paragraph(1))
      billing.getSetUpTransferButton().click()
    })
    billing.getConfirmForeignTransferModal().within(() => {
      billing.getConfirmForeignTransferFrom().within(() => {
        cy.contains(`Barry's Fund Management`)
        cy.contains('BALANCE: €')
      })
    })
    billing.getConfirmForeignTransferModal().within(() => {
      billing.getConfirmForeignTransferTo().within(() => {
        cy.contains(`${accountNames[1]} Fund Management`)
        cy.contains('BALANCE: $40.00')
      })
      cy.contains(
        'By clicking confirm you acknowledge the transfer of funds in the amount of €3.00 ($'
      )
      cy.contains(
        `from Barry's Fund Management to ${accountNames[1]} Fund Management effective ${todaysDate}`
      )
      universal.getSaveButton().click()
    })
    billing.getTransferHistoryCard().within(() => {
      universal.getRowsInATableBody().should('have.length', 6)
      universal.getTableHeader().should('contain', billing.newTranfersTableHeaderText())
      universal.getRowByNumber(0).within(() => {
        cy.contains(new Date().toLocaleDateString())
        cy.contains('td', '€3.00').should('contain', '$')
        cy.contains(`Barry's Fund Management`)
        cy.contains(`${accountNames[1]} Fund Management`)
        billing.getTagByText('COMPLETE').should('exist')
      })
    })
  })
})

const truncateIt = (account: string) => {
  return account.slice(0, 22)
}

//todo: revoke access button?
