import { faker } from '@faker-js/faker'
import { userFactory } from '../../support/factories'
import { Billing, Profile, Universal } from '../../support/pageObjects'

describe('Billing: Accounts Testing', function () {
  const user = userFactory()
  const contactOwnerEmail: string = user.userName
  const dept = faker.commerce.department()
  const billing = new Billing()
  const profile = new Profile()
  const universal = new Universal()

  beforeEach(() => {
    cy.signup(user)
    //cy.login(user)
  })

  it(`tests accounts and adding a billing account `, function () {
    billing.visitBillingAccounts()
    profile.getBillingLink().should('have.attr', 'aria-current', 'page')
    profile.getAccountsLink().should('be.visible')
    billing.getFundsAccount(user.company).should('be.visible')
    //billing.getSubcriptionAccount(user.company)
    billing.visitBillingAccounts()
    billing.getAddBillingAccountButton().should('be.visible').click()
    billing.getCreateBillingAccountDrawer().within(() => {
      cy.findByTestId('AutoCompleteCurrency').click()
      cy.findByText('EUR').should('exist')
      cy.findByText('USD').should('exist')
      cy.findByText('AUD').should('exist')
      cy.findByText('CAD').should('exist')
      cy.findByText('GBP').should('exist')
      cy.findByText('MXN').should('exist')
      cy.findByText('SGD').should('exist')
      cy.findByText('MXN').click()
      cy.findByTestId('AutoCompleteCurrency').click()
      cy.findByText('USD').click()
      cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
      universal.getSaveButton().click()
      billing.getAccountNameInput().as('accountName').should('have.attr', 'aria-required', 'true')
      billing
        .getFirstNameInput()
        .as('firstName')
        .should('not.have.attr', 'aria-invalid', 'true')
        .and('have.value', `${user.firstName}`)
      billing
        .getLastNameInput()
        .as('lastName')
        .should('not.have.attr', 'aria-invalid', 'true')
        .and('have.value', `${user.lastName}`)
      billing
        .getWorkEmailInput()
        .as('workEmail')
        .should('not.have.attr', 'aria-invalid', 'true')
        .and('have.value', `${contactOwnerEmail}`)
      billing
        .getPhoneNumberInput()
        .should('not.have.attr', 'aria-invalid', 'true')
        .fill('7603432244')
      cy.get('@accountName').fill(dept)
      cy.get('@accountName').should('not.have.attr', 'aria-invalid', 'true')
      billing.getCountryInput().scrollIntoView()
      cy.selectAutoCompleteCountry('France')
      cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'France')
      cy.contains('[role="group"]', 'State').scrollIntoView()
      cy.contains('[role="group"]', 'State').within(() => {
        cy.get('input').clear()
        cy.get('input').type('California')
      })
      billing.getAddressInput().should('not.have.attr', 'aria-invalid', 'true').fill('3133 Johnson')
      billing
        .getCityInput()
        .should('not.have.attr', 'aria-invalid', 'true')
        .fill('3133 Johnson Avenue')
      billing.getPostalCodeInput2().should('not.have.attr', 'aria-invalid', 'true').fill('93401')
      cy.contains('[role="group"]', 'Country').scrollIntoView()
      cy.contains('[role="group"]', 'Country').within(() => {
        cy.get('input').clear()
        cy.get('input').type('United States')
        cy.contains('div', /^United States$/).click()
      })
      universal.getSaveButton().click({ force: true })
    })
    billing.getCreateBillingAccountDrawer().should('not.exist')
    universal.getSpinner().should('not.exist')
    cy.contains(`${dept} Fund Management`)
    billing.getCurrentBalance().should('contain', 'You currently have no funds available.')
    billing.getAddFundsButton().should('be.disabled')
    //tests that the new account is listed amongst the other billing accounts
    billing.getBackToAccountsButton().click({ force: true })
    universal.getSpinner().should('not.exist')
    billing.getNewlyListedFundAccount(dept)
    //billing.getNewAccountCreatedAlert()
    billing.visitBillingAccounts()
    universal.getSpinner().should('not.exist')
    billing.getFundsAccount(user.company).within(() => {
      billing.getEditButton().click()
    })
    universal.getSpinner().should('not.exist')
    cy.contains(`${user.company}'s Fund Management Billing Account`)
    universal.getCloseButtonByLabelText().should('be.visible')
    billing.getReloadAmountInput().should('be.disabled')
    billing.getWhenBalanceFallsBelowInput().should('be.disabled')
    billing.getAutoReloadTooltip().realHover()
    //tests the tooltip
    billing.getTooltipOffText()
    billing.getAutoReloadToggle().click({ force: true })
    billing.getTooltipOnText()
    universal.getSpinner().should('not.exist')
    //todo: revisit in case editing account names comes back
    //billing.getBillingAccountNameInput().clear().fill(`${user.company}'s Fund Management UP`)
    //billing.getSaveBillingAccountNameButton().click()
    //cy.contains(`${user.company}'s Fund Management UP`)
    billing.getReloadAmountInput().should('not.be.disabled').fill('100')
    billing.getWhenBalanceFallsBelowInput().should('not.be.disabled').fill('20')
    //default is off now
    billing.getAutoReloadToggle().click({ force: true })
    billing.getReloadAmountInput().should('be.disabled')
    billing.getWhenBalanceFallsBelowInput().should('be.disabled')
    //todo: revisit in case editing account names comes back
    //finds update in accounts list
    // billing.getBackToAccountsButton().click()
    // universal.getSpinner().should('not.exist')
    // billing.getUpdatedFundsAccount(user.company).within(() => {
    //   billing.getEditButton().click()
    // })
    //checks new updates made it into the page after navigating away
    // universal.getSpinner().should('not.exist')
    // navbar.getNavbarCenter().should('contain', `${user.company}'s Fund Management UP`)
    // billing.getAutoReloadToggle().should('be.checked')
    // cy.findAllByRole('slider').should('have.length', 2).and('not.have.attr', 'aria-disabled', 'true')
    //adds funds
    billing.getAddFunds().should('be.visible').fill('300')
    billing.getAddFundsButton().click({ force: true })
    billing.getConfirmFundsModal().within(() => {
      universal.getConfirmButton().click({ force: true })
    })
    billing.getConfirmFundsModal().should('not.exist')
    universal.getSpinner().should('not.exist')
    universal.getThingSpinner().should('not.exist')
    cy.contains('Funds are being added').should('not.exist')
    //checks that addded funds made it into the drawer and then adds more funds
    //clears any remaining alerts
    billing.visitBillingAccounts()
    //checks that added funds made it into the drawer
    billing.getFundsAccount(user.company).within(() => {
      billing.getEditButton().click()
    })
    cy.contains(`${user.company}'s Fund Management Billing Account`)
    universal.getSpinner().should('not.exist')
    billing.getCurrentBalance().within(() => {
      billing.getNoFundsText().should('not.exist')
      cy.findByText('$300.00').should('exist')
    })
    //adds more funds
    billing.getAddFunds().should('be.visible').type('200')
    billing.getAddFundsButton().click({ force: true })
    billing.getConfirmFundsModal().within(() => {
      universal.getConfirmButton().trigger('click', { force: true })
    })
    billing.getConfirmFundsModal().should('not.exist')
    universal.getThingSpinner().should('not.exist')
    billing.getBackToAccountsButton().click()
    //checks that added funds sum is correct in the drawer
    billing.getFundsAccount(user.company).within(() => {
      billing.getEditButton().click()
    })
    cy.contains(`${user.company}'s Fund Management Billing Account`)
    universal.getSpinner().should('not.exist')
    cy.findByText('$300.00').should('not.exist')
    billing.getCurrentBalance().within(() => {
      cy.findByText('$500.00').should('exist')
    })
    //tests editing a Subscription Management billing account
    // billing.visitBillingAccounts()
    // billing.getSubcriptionAccount(user.company).within(() => {
    //   billing.getEditButton().click()
    // })
    //cy.contains(`${user.company}'s Subscription Billing Account`)
    //universal.getSpinner().should('not.exist')
    //todo: revisit in case editing account names comes back
    // billing.getEditBillingAccountButton().click()
    // billing.getBillingAccountNameInput().clear().fill(`${user.company}'s Subscription Management Billing Account`)
    // billing.getSaveBillingAccountNameButton().click()
    // cy.findByText('Auto Reload').should('not.exist')
    // billing.getReloadAmountInput().should('not.exist')
    // billing.getWhenBalanceFallsBelowInput().should('not.exist')
    // cy.findAllByRole('slider').should('not.exist')
    // billing.getCurrentBalance().should('not.exist')
    // billing.getPaymentMethodText().should('exist')
    //the following no longer exists for test
    // billing.getVisaText().should('exist')
    // billing.getChangePaymentMethodButton().click()
    // billing.getChangePaymentModal().within(() => {
    //   universal.getCancelButton().click({ force: true })
    // })
    //billing.getBackToAccountsButton().click()
    //universal.getSpinner().should('not.exist')
    //tests that the edits make it into the accounts list
    // cy.contains(`${user.company}'s Subscription Management Billing Account`)

    //`tests deleting an account`
    billing.visitBillingAccounts()
    billing.getNewlyListedFundAccount(dept).within(() => {
      billing.getEditButton().click()
    })
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains(`${dept} Fund Management`)
    billing.getDeleteButton().click()
    billing.getDeleteBillingAccountModal().within(() => {
      billing.getDeleteModalText()
      universal.getDeleteButton().should('be.visible')
      universal.getDeleteButton().click({ force: true })
    })
    billing.getDeletedAccountAlert()
    billing.getNewlyListedFundAccount(dept).should('not.exist')
    //tests Request to Fund by Invoice
    billing.getFundsAccount(user.company).within(() => {
      billing.getEditButton().click()
    })
    universal.getSpinner().should('not.exist')
    billing
      .getRequestToFundByInvoiceCard()
      .should('be.visible')
      .within(() => {
        billing.getRequestButton().should('be.disabled')
        cy.findByPlaceholderText('Enter Amount').type('1000')
        billing.getRequestButton().should('not.be.disabled').click({ force: true })
      })
    billing.getFundByInvoiceModal().within(() => {
      cy.contains(`Confirm the amount you'd like to pay:`).should('exist')
      cy.contains(`$1,000.00`).should('exist')
      cy.contains(`We will email you an invoice.`).should('exist')
      universal.getConfirmButton().click({ force: true })
      cy.contains(
        `Your request to pay via invoice has been sent. We will email you an invoice.`
      ).should('exist')
      universal.getNewCloseButton().click()
    })
    billing.getFundByInvoiceModal().should('not.exist')
    billing.getRequestToFundByInvoiceCard().should('exist')
  })
  //todo: active teams testing
})
