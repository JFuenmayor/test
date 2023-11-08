import { faker } from '@faker-js/faker'
import { FakeUser } from '../factories'
import { Extension, SignUpIn } from '../pageObjects'

// pass in reload true if you want to create a new session for this user
function login(user: FakeUser, newSession?: boolean) {
  const sessionId = [user.userName, 'engage', newSession ? faker.string.nanoid() : null]
    .filter(Boolean)
    .join(':')
  const signIn = new SignUpIn()
  cy.session(sessionId, () => {
    signIn.visitLogin()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Single Sign-on:')) {
        cy.reload()
      }
    })
    signIn.getEmailAddressInput().fill(user.userName)
    signIn.getPasswordInputByPH().fill(user.password)
    signIn.getLogInButton().click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.wait(1500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Approved items')) {
        cy.wait(300)
        signIn.getEmailAddressInput().fill(user.userName)
        signIn.getPasswordInputByPH().fill(user.password)
        signIn.getLogInButton().click({ force: true })
        cy.wait(300)
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

Cypress.Commands.add('login', login)

// pass in reload true if you want to create a new session for this user
function loginExtension(user: FakeUser, newSession?: boolean) {
  const sessionId = [user.userName, 'extension', newSession ? faker.string.nanoid() : null]
    .filter(Boolean)
    .join(':')
  const extension = new Extension()
  cy.session(sessionId, () => {
    extension.visitLogin()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    extension.getEmailAddressInput().fill(user.userName)
    extension.getPasswordInput().fill(user.password)
    extension.getAuthLoginButton().click()
    cy.wait(300)
    extension.visitExtension()
    cy.currentUserExtension().then((u) => {
      cy.window().then((win) => {
        win.localStorage.setItem('csrfToken', u.csrfToken ?? '')
      })
    })
  })
}

Cypress.Commands.add('loginExtension', loginExtension)
