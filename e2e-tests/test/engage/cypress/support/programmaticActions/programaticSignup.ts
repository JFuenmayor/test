import {
  BillingAccountsDocument,
  BillingAccountType,
  MeDocument,
  ModulesDocument,
  PaymentPartnerType,
  SetDefaultPaymentMethodDocument,
  SignupDocument,
  StartTrialDocument,
} from '../api'
import { Universal } from '../pageObjects'
Cypress.Commands.add(
  'programaticSignup',
  ({ userName, password, firstName = 'autotesting', lastName = 'autotester', company }) => {
    const universal = new Universal()
    const log = Cypress.log({
      name: 'Signup',
      displayName: 'Signup',
      message: [`🔐 Authenticating | ${firstName} ${lastName}`],
      autoEnd: false,
    })
    cy.signupNewApi({ userName, firstName, lastName, password })
    cy.signupVerifyApi(userName)
    cy.sessionAccessTokenApi()
    cy.graphqlRequest(SignupDocument, {
      data: {
        accountName: company,
        country: 'USA',
        state: 'CA',
        collectedData: { aboutCompany: {}, terms: true, aboutTechnology: {} },
      },
    })
    cy.sessionAccessTokenApi()
    cy.graphqlRequest(StartTrialDocument)
    cy.sessionAccessTokenApi()
    cy.visit('/')
    cy.wait(200)
    // cy.findByRole('checkbox', { name: 'Agree toTerms & Conditions/Privacy Policy' })
    //   .should('be.visible')
    //   .check({ force: true })
    // cy.findByRole('button', { name: 'Start using Postal' }).should('not.be.disabled').click()
    cy.sessionAccessTokenApi()
    cy.graphqlRequest(ModulesDocument)
    cy.contains(`We're creating your Postal account.`, { timeout: 240000 }).should('not.exist')
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.sessionAccessTokenApi().then(() => {
      cy.graphqlRequest(BillingAccountsDocument).then((res) => {
        const funds = res.billingAccounts?.find((acct) => acct.type === BillingAccountType.Funds)
        //const subs = res.billingAccounts?.find((acct) => acct.type === BillingAccountType.Subscription)
        if (funds) {
          cy.graphqlRequest(SetDefaultPaymentMethodDocument, {
            id: funds.id,
            input: {
              partnerPaymentMethodId:
                funds?.paymentPartners?.[0].paymentMethods?.[0].partnerId ?? '',
              paymentPartnerType: PaymentPartnerType.Mock,
            },
          })
        }
        // if (subs) {
        //   // cy.graphqlRequest(SetDefaultPaymentMethodDocument, {
        //   //   id: subs.id,
        //   //   input: {
        //   //     partnerPaymentMethodId: subs.paymentPartners[0].paymentMethods[0].partnerId,
        //   //     paymentPartnerType: PaymentPartnerType.Mock,
        //   //   },
        //   // })
        //   cy.graphqlRequest(NotifyPaymentMethodCreatedDocument, { billingAccountId: subs?.id }).then((response) => {
        //     expect(response.notifyPaymentMethodCreated.status).to.eq('SUCCESS')
        //   })
        // }
      })
    })
    cy.graphqlRequest(MeDocument).then((res) => {
      log.set({
        consoleProps() {
          return {
            userName,
            password,
            name: `${res.me.firstName} ${res.me.lastName}`,
            userId: res.me.id,
          }
        },
      })
      log.end()
      return res.me
    })
  }
)
