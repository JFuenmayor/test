export default class SignUpIn {
  visitWelcomePage(id: string) {
    cy.visit(`/welcome/${id}`)
    return cy.url().should('contain', `/welcome/${id}`)
  }
  visitSignUp() {
    cy.visit('/sign-up', { retryOnNetworkFailure: true, retryOnStatusCodeFailure: true })
    return cy.url().should('contain', '/sign-up')
  }
  visitLogin() {
    cy.visit('/login')
    return cy.url().should('contain', '/login')
  }
  visitVerifyPageByRequestId(id: number | string) {
    cy.visit(`/verify/CLOONEY-${id}`)
    return cy.url().should('contain', `/verify/CLOONEY-${id}`)
  }
  visitForgotPWPageByRequestId(id: number | string) {
    cy.visit(`/forgotpw/CLOONEY-${id}`)
    return cy.url().should('contain', `/forgotpw/CLOONEY-${id}`)
  }
  //Invite Inputts
  getFirstNameInput() {
    return cy.findByPlaceholderText('First Name')
  }
  getLastNameInput() {
    return cy.findByPlaceholderText('Last Name')
  }
  getPasswordInput() {
    return cy.contains('div', 'Password').find('input')
  }
  getReenterPasswordInput() {
    return cy.contains('div', 'Re-enter Password').find('input')
  }
  //SignUp/SignIn Inputs
  getEmailAddressInput() {
    return cy.findByPlaceholderText('Email Address')
  }
  getPasswordInputByPH() {
    return cy.findByPlaceholderText('Password')
  }
  getFirstNameInputPH() {
    return cy.findByPlaceholderText('First Name')
  }
  getLastNameInputPH() {
    return cy.findByPlaceholderText('Last Name')
  }
  getInvalidInput() {
    return cy.get('input:invalid')
  }
  getCompanyInput() {
    return cy.contains('div', 'Company').find('input')
  }
  getPhoneInput() {
    return cy.contains('div', 'Phone').find('input')
  }
  getStateInput() {
    return cy.findByPlaceholderText('State / Province')
  }
  getTermsInput() {
    return cy.get('input[name="terms"]')
  }
  //Buttons
  getContinueButton() {
    return cy.findByRole('button', { name: 'Continue' })
  }
  getMicrosoftButton() {
    return cy.findByTestId('Button_Sso_MS365')
  }
  getGoogleButton() {
    return cy.findByTestId('Button_Sso_GOOGLE')
  }
  getSalesforceButton() {
    return cy.findByTestId('Button_Sso_SFDC')
  }
  getSignInButtons() {
    this.getMicrosoftButton()
    this.getGoogleButton()
    this.getSalesforceButton()
  }

  getLogInButton() {
    return cy.findByRole('button', { name: 'Login' })
  }
  getSignUpNowButton() {
    return cy.findByRole('button', { name: 'Sign Up Now' })
  }
  getStartUsingPostalButton() {
    return cy.findByRole('button', { name: 'Start using Postal' })
  }
  getResetPasswordButton() {
    return cy.findByRole('button', { name: 'Reset Password' })
  }
  //Alerts
  getAccountCreatedAlert() {
    cy.getAlert({ message: 'Your account is created!', close: 'close' })
  }
  getBadUserNamePasswordAlert() {
    cy.getAlert({ message: 'Bad Username/Password', close: 'close' })
  }
  getErrorAlert() {
    cy.getAlert({ message: 'Error During Signup', close: 'close' })
  }
  getUseBusinessEmailAlert() {
    cy.getAlert({
      message:
        'Please select a business email address. Non-corporate SSO connections are not allowed.',
      close: 'close',
    })
  }

  getPasswordResetAlert() {
    cy.getAlert({ message: 'Password reset is on the way', close: 'close' })
  }
  getLast13PasswordsAlert() {
    cy.getAlert({ message: 'You cannot use your last 13 passwords', close: 'close' })
  }
  getPasswordChangedAlert() {
    cy.getAlert({ message: 'Your password is changed!', close: 'close' })
  }
  getSignUpEmailSentAlert() {
    cy.getAlert({ message: 'Signup email is on the way', close: 'close' })
  }

  getClosedBetatAlert() {
    cy.getAlert({
      message:
        'We are currently in a closed beta. Please reach out to sales@postal.com to be put on the list.',
      close: 'close',
    })
  }
  getValidEmailAlert() {
    cy.getAlert({ message: 'Please enter a valid email address.', close: 'close' })
  }
  getErrorRegisteringAlert() {
    cy.getAlert({ message: /Error registering email address/, close: 'close' })
  }
  //Labels
  getAgreeToLabel() {
    return cy.contains('div', 'Agree to')
  }
  //Texts
  getDontHaveAccountText() {
    return cy.contains('div', `Don't have an account?`)
  }
  getAlreadyHaveAccountText() {
    return cy.contains('div', `Already have an account?`)
  }
  getConfirmEmailText() {
    return cy.findByText('Thank you, please confirm your email')
  }
  getSentEmailToText(userName: string) {
    return cy.contains(`We’ve sent an email to ${userName}`)
  }
  //Helpers
  get12LongHelper() {
    return cy.contains('Password should have 12 or more characters')
  }
  getOneUpperHelper() {
    return cy.contains('Password should contain at least one upper case letter')
  }
  getOneLowerHelper() {
    return cy.contains('Password should contain at least one lower case letter')
  }
  getOneNumberHelper() {
    return cy.contains('Password should contain at least one number')
  }
  getOneSpecialCharacterHelper() {
    return cy.contains('Password should contain at least one special character')
  }
  getNoRepeatedText() {
    return cy.contains('Password should not contain repeated characters')
  }
  getNoEmailHelper() {
    return cy.contains('Password cannot contain your email')
  }
  //Headings
  getHiConfirmEmailHeading(name: string) {
    return cy.findByRole('heading', {
      name: `Hi ${name}, please confirm your email`,
      timeout: 90000,
    })
  }
  //Links
  getSignUpLink() {
    return cy.findByRole('link', { name: 'Sign up' })
  }
  getSignInLink() {
    return cy.findByRole('link', { name: 'Sign in' })
  }
  getForgotPasswordLink() {
    return cy.contains('a', 'I forgot my password')
  }
  getPrivacyPolicyLink() {
    return cy.findByRole('link', { name: 'Privacy Policy' })
  }
  getTermsLink() {
    return cy.findByRole('link', { name: 'Terms & Conditions' })
  }
  getResendEmailLink() {
    return cy.contains('a', 'Resend Email')
  }
  //Invited Signup rule lines
  get12LongRule() {
    return cy.contains('li', 'At least 12 characters long')
  }
  getOneUpperRule() {
    return cy.contains('li', 'One uppercase character')
  }
  getOneLowerRule() {
    return cy.contains('li', 'One lowercase character')
  }
  getOneNumberRule() {
    return cy.contains('li', 'One number')
  }
  getOneSymbolRule() {
    return cy.contains('li', 'One symbol')
  }
  getNoRepeatingRule() {
    return cy.contains('li', 'No repeating characters')
  }
  getNoEmailRule() {
    return cy.contains('li', 'Does not contain your email address')
  }
  getPasswordsMatchRule() {
    return cy.contains('li', 'Password fields match')
  }
  //SSO tests
  testProvider(endpoint: string) {
    const url = `/api/auth/provider/${endpoint}`
    cy.intercept(url, 'ok')
    if (endpoint === 'google') {
      this.getGoogleButton().click()
    } else if (endpoint === 'sfdc') {
      this.getSalesforceButton().click()
    } else if (endpoint === 'azuread') {
      this.getMicrosoftButton().click()
    }
    cy.url().should('contain', url)
    cy.contains('ok').should('exist')
  }
}
