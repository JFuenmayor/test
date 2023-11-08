import { userFactory } from '../../support/factories'
import { Form, Navbar, SignUpIn, Universal } from '../../support/pageObjects'

describe('SignIn Clickthrough Testing', function () {
  const signIn = new SignUpIn()
  const user = userFactory()
  const form = new Form()
  const universal = new Universal()
  const navbar = new Navbar()

  before(() => {
    cy.signup(user)
    cy.visit('/')
    cy.contains('Shop by category').should('be.visible')
    cy.wait(1000)
    navbar.getProfileMenuButton().click({ force: true })
    navbar.getLogoutMenuItem().trigger('click', { force: true })
    universal.getSpinner().should('not.exist')
  })

  beforeEach(() => {
    cy.visit('/')
    signIn.getEmailAddressInput().as('email')
    signIn.getPasswordInputByPH().as('password')
  })

  describe('Signing in manually', function () {
    //test start
    it('tests that the signin page renders as it should', function () {
      cy.url().should('contain', 'login')
      signIn.getSignInButtons()
      signIn.getForgotPasswordLink()
    })

    it(`tests the 'Sign up' / 'Sign in' links`, function () {
      signIn.getDontHaveAccountText().within(() => {
        signIn.getSignUpLink().click()
      })
      signIn.getFirstNameInputPH()
      signIn.getAlreadyHaveAccountText().within(() => {
        signIn.getSignInLink().click()
      })
    })
    it(`tests bad userName (email) pattern validation`, function () {
      cy.get('@email').fill('jdfkjsdfkjs')
      cy.get('@email').then(form.checkValidity).should('be.false')
      cy.get('@email').clear()
      cy.get('@email').fill('sdhsh@^^^^^')
      cy.get('@email').then(form.checkValidity).should('be.false')
      cy.get('@email').fill('example@postal.io')
      cy.get('@email').then(form.checkValidity).should('be.true')
      cy.get('@email').clear()
    })
    it(`tests a bad Password`, function () {
      cy.get('@email').fill(user.userName)
      cy.get('@password').then(form.checkValidity).should('be.false')
      cy.get('@password').type('hjshsdhqqwh')
      cy.get('@password').then(form.checkValidity).should('be.true')
      signIn.getLogInButton().should('be.enabled').click({ force: true })
      cy.getAlert({ message: 'Bad Username/Password', close: 'close' })
    })
    it(`tests a non-existant username`, function () {
      cy.get('@email').clear()
      cy.get('@email').fill('gibbereish@DTG.999')
      cy.get('@password').clear()
      cy.get('@password').fill(user.password)
      signIn.getLogInButton().click({ force: true })
      signIn.getBadUserNamePasswordAlert()
    })
    it(`tests a good sign in`, function () {
      cy.get('@email').clear()
      cy.get('@email').fill(user.userName)
      cy.get('@password').clear()
      cy.get('@password').type(user.password)
      signIn.getLogInButton().click({ force: true })
      cy.url().should('include', '/items')
      cy.contains(user.firstName)
    })
  })
})
