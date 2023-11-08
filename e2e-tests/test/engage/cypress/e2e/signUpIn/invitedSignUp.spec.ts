import { faker } from '@faker-js/faker'
import { InviteDocument } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Navbar, SignUpIn, Universal } from '../../support/pageObjects'

describe(`Invites Signup Clickthrough Testing (user invite)`, function () {
  const navbar = new Navbar()
  const universal = new Universal()
  const signup = new SignUpIn()
  const user = userFactory()
  //used for invite
  const email = `${faker.string.uuid()}@postal.dev`

  before(() => {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests the whole of invites signup`, function () {
    cy.visit('/')
    universal.getSpinner().should('not.exist')
    navbar.getProfileMenuButton().should('be.visible').click()
    cy.findByRole('menu').should('contain', user.firstName)
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: [email], roles: ['USER', 'MANAGER'] },
    }).then((res) => {
      const invite = res.invite?.[0]?.invite
      signup.visitWelcomePage(invite?.id ?? '')
      //Asserts that the url is correct
      cy.url().should('contain', 'welcome')
      //tests that the invite signup page renders as it should
      cy.findByText(`${user.firstName} ${user.lastName}`)
      //Tests that the form fields can be invalid

      signup.getContinueButton().click()
      signup.getFirstNameInput().getInputValidation('Please fill out this field.')

      signup.getFirstNameInput().as('firstName').fill('Elizabeth')
      cy.get('@firstName').should('have.value', 'Elizabeth')

      signup.getContinueButton().click()

      signup.getLastNameInput().getInputValidation('Please fill out this field.')

      signup.getLastNameInput().as('lastName').fill('Quail')

      signup.getPasswordInputByPH().as('password')

      cy.get('@lastName').should('have.value', 'Quail')
      cy.get('@firstName').clear()
      cy.get('@firstName').should('have.attr', 'aria-required', 'true')
      cy.get('@lastName').clear()
      cy.get('@lastName').should('have.attr', 'aria-required', 'true')
      cy.get('@password').clear()
      cy.get('@password').should('have.attr', 'aria-required', 'true')

      //Tests that the form fields are required
      cy.get('@firstName').fill('Elizabeth')
      cy.get('@lastName').fill('Quail')
      cy.get('@password').fill('Password123!')

      //tests toggling the agree too button
      signup
        .getAgreeToLabel()
        .should('contain', 'Terms & Conditions')
        .and('contain', 'Privacy Policy')
        .find('input')
        .click({ force: true })

      signup.getContinueButton().click()

      signup
        .getAgreeToLabel()
        .find('input')
        .getInputValidation('Please check this box if you want to proceed.')
      signup.getAgreeToLabel().find('input').click({ force: true })

      //tests the other fields
      cy.get('@lastName').clear()
      cy.get('@lastName').fill('Quail')
      cy.get('@firstName').clear()
      cy.get('@firstName').fill('Elizabeth')

      //tests when password is less than six character
      signup.getPasswordInputByPH().as('passwordOne').fill(`Df)4v`)
      signup.get12LongHelper().should('be.visible')

      //tests when password does not have upper case letters
      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`cf8&b$cf8&b$`)
      signup.getOneUpperHelper().should('be.visible')

      //tests when password does not have lower case letters
      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`KS6#!UTKS6#!UT`)
      signup.getOneLowerHelper().should('be.visible')

      //tests when the password does not contain one number
      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`lcvBDR@lcvBDR@`)
      signup.getOneNumberHelper().should('be.visible')

      //tests when the password does not contain one symbol Password should contain at least one special character
      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`7Ho7vbD77Ho7vbD7`)
      signup.getOneSpecialCharacterHelper().should('be.visible')

      //tests when the password has three repeating consecutive characters'
      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`&&&Huffington34nshHuffington34`)
      signup.getNoRepeatedText().should('be.visible')

      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`Password123!`)

      // // signup.getContinueButton().click()

      // // //tests that the invite signup page renders as it should
      // // signup.getContinueButton().should('be.visible').and('be.disabled')
      // // cy.contains('Sign In With Google').should('not.exist')

      // //tests the password checks
      // cy.passwordChecks(email)

      // //tests that a good new password combo can be submitted
      // signup.getPasswordInputByPH().clear().fill(`#Oe%xzY3~#Oe%xzY3~`)
      // signup.getReenterPasswordInput().clear().fill(`#Oe%xzY3~#Oe%xzY3~`)
      // signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
      // signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
      // signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
      // signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
      // signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
      // signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
      // signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
      // signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')

      signup.getContinueButton().should('not.be.disabled').click({ force: true })
      //flakey (does not always show up)
      //signup.getAccountCreatedAlert()
      cy.url().should('contain', '/items')
      navbar.getProfileMenuButton().should('be.visible').click()
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(600)
          cy.reload()
          cy.wait(600)
        }
      })
      cy.findByRole('menu').should('contain', `Elizabeth Quail`)
    })
  })
})
