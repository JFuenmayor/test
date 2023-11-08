import { SignUpIn } from '../../support/pageObjects'

describe('Session redirects testing', function () {
  const signup = new SignUpIn()

  it(`tests session redirects`, function () {
    //it(`tests email/error/corp`, function () {
    cy.visit('/email/error/corp')
    cy.url().should('include', '/sign-up')
    signup.getUseBusinessEmailAlert()
    //})
    //it(`tests email/error/domain`, function () {
    cy.visit('/email/error/domain')
    cy.url().should('include', '/sign-up')
    signup.getClosedBetatAlert()
    //})
    //it(`tests email/error/invalid`, function () {
    cy.visit('/email/error/invalid')
    cy.url().should('include', '/sign-up')
    signup.getValidEmailAlert()
    //})
    //it(`tests email/error/unknown`, function () {
    cy.visit('/email/error/unknown')
    cy.url().should('include', '/sign-up')
    signup.getErrorRegisteringAlert()
  })
})
