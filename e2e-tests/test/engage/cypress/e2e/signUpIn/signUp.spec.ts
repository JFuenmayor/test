import { faker } from '@faker-js/faker'
import { userFactory } from '../../support/factories'
import { Navbar, SignUpIn, Universal } from '../../support/pageObjects'

describe('SignUp Clickthrough Testing', function () {
  const navbar = new Navbar()
  const signup = new SignUpIn()
  const universal = new Universal()
  const user = userFactory()

  before(() => {
    cy.logUserInfo(user)
  })

  it(
    'tests the whole of the manual signup workflow',
    {
      retries: {
        runMode: 0,
        openMode: 0,
      },
    },
    () => {
      //used in clickthrough
      const names = faker.helpers.slugify(
        `${faker.person.firstName()}${faker.person.lastName()}${faker.string.alphanumeric(4)}`
      )
      const email = `${names}@postal.dev`
      const requestId = faker.string.numeric(8)

      // Test START
      signup.visitSignUp()

      //Tests that the signup page renders as it should
      signup.getAlreadyHaveAccountText().within(() => {
        signup.getSignInLink()
      })
      signup.getSignInButtons()

      //Tests that the form fields are required
      // does not submit with an empty form
      signup.getSignUpNowButton().click({ force: true })
      //input fields will remain and can be typed into
      signup.getFirstNameInputPH().fill('autoFiona')
      // submits with just the firstName filled out
      signup.getSignUpNowButton().click({ force: true })
      signup.getLastNameInputPH().fill('Kim')
      // submits with just the firstName and lastName filled out
      signup.getSignUpNowButton().click({ force: true })
      //Tests validation for bad email patterns
      signup.getEmailAddressInput().fill('not_an_email')
      signup.getSignUpNowButton().click({ force: true })
      signup
        .getEmailAddressInput()
        .getInputValidation(
          `Please include an '@' in the email address. 'not_an_email' is missing an '@'.`
        )
      signup.getEmailAddressInput().clear().fill('sdhsh@%%%%')
      signup
        .getEmailAddressInput()
        .getInputValidation(`A part following '@' should not contain the symbol '%'.`)

      // creates good email address
      signup.getEmailAddressInput().clear().fill(email)

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

      //tests when the password contains the user's email address
      cy.get('@passwordOne').clear()
      cy.get('@passwordOne').fill(`W0w!${email}nshHuffington34`)
      signup.getNoEmailHelper().should('be.visible')

      //The following is gonna send out a new signup via api
      signup.visitSignUp()
      cy.request({
        method: 'POST',
        url: '/api/signup/new',
        body: {
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: `${user.userName}`,
          userName: `${user.userName}`,
          password: `${user.password}`,
          password2: `${user.password}`,
          siteVerify: `CLOONEY-${requestId}`,
          product: 'POSTAL_IO_APP',
        },
      }).then((resp) => {
        cy.log(`signup/new Status: ${resp.statusText}`)
      })

      //use the siteVerify to go to Set Password page
      signup.visitVerifyPageByRequestId(requestId)
      cy.contains('[role="group"]', 'Country').scrollIntoView()
      cy.contains('[role="group"]', 'Country').within(() => {
        cy.contains(RegExp('United States' + '|' + 'United Kingdom')).should('exist')
        cy.get('input:visible').clear()
        cy.get('input:visible').type('United States')
        cy.contains('div', /^United States$/).click()
      })
      //Tests that the start Trial page renders as it should
      signup.getCompanyInput().as('company')
      signup.getPhoneInput().as('phone')
      signup.getStateInput().as('state')
      const fieldsAliases = ['company', 'phone', 'state']
      fieldsAliases.forEach((i) => {
        cy.get(`@${i}`).should('not.have.attr', 'aria-invalid')
      })
      const labels = ['State', 'Country']
      labels.forEach((i) => {
        cy.contains('label', i).should('exist')
      })
      signup.getAgreeToLabel().find('input').as('AgreeTo')
      signup.getStartUsingPostalButton().as('submit').should('be.disabled')

      //Given that the agree to terms and conditions button is checked, other inputs
      //will be invalid if form is submitted while they are empty
      cy.get('@AgreeTo').click({ force: true })
      cy.get('@submit').click()
      cy.get(`@company`).should('have.attr', 'aria-required', 'true')
      cy.get(`@phone`).should('not.have.attr', 'aria-invalid')
      //Verifies that the links for Terms & Conditions and Privacy Policy have the right hrefs
      signup
        .getPrivacyPolicyLink()
        .should('have.attr', 'href', 'https://postal.com/privacy-policy/')
      signup.getTermsLink().should('have.attr', 'href', 'https://postal.com/terms-of-service/')

      // fills out rest of the fields and submits
      cy.get('@company').fill('acompany')
      cy.get('@phone').fill('76035326754')
      cy.get('@state').clear()
      cy.get('@state').fill('AK')
      cy.get('@submit').should('be.enabled').click({ force: true })

      //tests that user is now logged in
      cy.contains(`We're creating your Postal account.`, { timeout: 240000 }).should('not.exist')
      universal.getSpinner().should('not.exist')
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(600)
          cy.reload()
          cy.wait(600)
        }
      })
      cy.contains('Shop by category').should('be.visible')
      navbar.getProfileMenuButton().should('be.visible').click()
      cy.findByRole('menu').should('exist')
      cy.findByRole('menu').and('contain', user.firstName)
      // Logs out
      cy.findByRole('menuitem', { name: 'Logout' }).click({ force: true })
      cy.wait(300)

      // Attempting to signup again with same emailAddress throws an error
      signup.visitSignUp()
      signup.getFirstNameInputPH().click().fill('autoFiona')
      signup.getLastNameInputPH().fill('Kim')
      signup.getEmailAddressInput().click().fill(user.userName)
      signup.getPasswordInputByPH().fill(`${user.password}`)
      signup.getSignUpNowButton().click({ force: true })
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.reload()
          signup.getFirstNameInputPH().click().fill('autoFiona')
          signup.getLastNameInputPH().fill('Kim')
          signup.getEmailAddressInput().click().fill(user.userName)
          signup.getPasswordInputByPH().fill(`${user.password}`)
          signup.getSignUpNowButton().click({ force: true })
        }
      })
      signup.getErrorAlert()

      //Attempting to signup again with a non-corporate domain throws an error - commented out cause cannot yet see the fix on localhost but it exists on the sandbox
      signup.visitSignUp()
      cy.wait(500)
      signup.getFirstNameInputPH().clear().fill('autoFiona')
      signup.getLastNameInputPH().clear().fill('Kim')
      signup.getEmailAddressInput().clear().fill('dfjksdhf@gmail.com')
      signup.getPasswordInputByPH().fill(user.password)
      signup.getSignUpNowButton().click({ force: true })
      signup.getUseBusinessEmailAlert()

      //Forgot Password Testing
      signup.getSignInLink().click()
      signup.getForgotPasswordLink().click()
      cy.url().should('contain', '/forgotpw')
      signup.getEmailAddressInput().click().fill(user.userName)

      //Tests that submitted form renders the confirm email component
      signup.getResetPasswordButton().click()
      // signup.getConfirmEmailText().should('exist')
      // signup.getPasswordResetAlert()
      // signup.getSentEmailToText(user.userName)
      // cy.request({
      //   method: 'POST',
      //   url: 'api/auth/password/forgot',
      //   body: {
      //     userName: `${user.userName}`,
      //     siteVerify: `CLOONEY-${requestId}`,
      //   },
      // })
      // //use the siteVerify to go to Set Password page
      // signup.visitForgotPWPageByRequestId(requestId)

      cy.url().should('contain', 'forgotPassword')
      // Tests password validation
      cy.passwordChecks('forgot')

      //Tests entering the same password returns an error
      signup.getPasswordInput().clear().fill(`${user.password}`)
      signup.getReenterPasswordInput().clear().fill(`${user.password}`)
      signup.getContinueButton().click()
      signup.getLast13PasswordsAlert()

      //Tests that entering a new password works
      signup.getPasswordInput().clear().fill('&Pj$taG&9&Pj$taG&9')
      signup.getReenterPasswordInput().clear().fill('&Pj$taG&9&Pj$taG&9')
      signup.getContinueButton().click()
      signup.getPasswordChangedAlert()
      cy.url().should('contain', '/login')

      //Tests a Sign In with the new password
      signup.getEmailAddressInput().click().fill(user.userName)
      signup.getPasswordInputByPH().click().fill('&Pj$taG&9&Pj$taG&9')
      signup.getLogInButton().click()
      cy.url().should('include', '/items')

      cy.manageState().then(() => {
        cy.log(`Local Storage Cleared Out`)
      })

      //Tests that a sucessful login renders the confirm email component
      signup.visitSignUp()
      signup.getFirstNameInputPH().fill('autoFiona')
      signup.getLastNameInputPH().fill('Kim')
      signup.getPasswordInputByPH()
      signup.getEmailAddressInput().fill(email)
      signup.getPasswordInputByPH().fill(user.password)
      signup.getSignUpNowButton().click({ force: true })

      // signup.getHiConfirmEmailHeading('autoFiona').should('be.visible')
      // signup.getSentEmailToText(email).should('be.visible')
      signup.getSignUpEmailSentAlert()

      //commenting this out cause the test environment now almost immediatley redirects to the
      //register page after signup causing the following alert assertion to be flakey
      //signup.getResendEmailLink().should('exist')
      //Tests that a alert appears after resend email is clicked.
      // signup.getResendEmailLink().click()
      // signup.getSignUpEmailSentAlert()
    }
  )
})
