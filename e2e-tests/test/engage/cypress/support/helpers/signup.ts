import { faker } from '@faker-js/faker'
import { FakeUser } from '../factories'
import { SignUpIn } from '../pageObjects'

function signup(user: FakeUser) {
  const sessionId = [user.userName, faker.string.nanoid()].join(':')
  const signup = new SignUpIn()
  cy.session(sessionId, () => {
    signup.visitSignUp()
    cy.wait(400)
    signup.getFirstNameInputPH().fill(user.firstName)
    signup.getLastNameInputPH().fill(user.lastName)
    signup.getEmailAddressInput().fill(user.userName)
    signup.getPasswordInputByPH().fill(user.password)
    signup.getSignUpNowButton().click({ force: true })
    cy.wait(5000)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign Up Now')) {
        cy.wait(400)
        signup.getFirstNameInputPH().fill(user.firstName)
        signup.getLastNameInputPH().fill(user.lastName)
        signup.getEmailAddressInput().fill(user.userName)
        signup.getPasswordInputByPH().fill(user.password)
        signup.getSignUpNowButton().click({ force: true })
      }
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.url().should('contain', '/register')
    signup.getCompanyInput().fill(user.company)
    signup.getPhoneInput().fill(user.phoneNumber)
    signup.getTermsInput().check({ force: true })
    signup.getStartUsingPostalButton().click({ force: true })
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.url().should('contain', '/items')
    cy.currentUser().then((u) => {
      cy.window().then((win) => {
        win.localStorage.setItem('csrfToken', u.csrfToken ?? '')
      })
    })
  })
}

Cypress.Commands.add('signup', signup)
