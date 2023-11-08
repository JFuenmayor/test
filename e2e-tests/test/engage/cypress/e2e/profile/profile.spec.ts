import { userFactory } from '../../support/factories'
import { Navbar, Profile, SignUpIn, Universal, Users } from '../../support/pageObjects'

describe('Profile: Edit testing', function () {
  const navbar = new Navbar()
  const universal = new Universal()
  const profile = new Profile()
  const signup = new SignUpIn()
  const users = new Users()
  const user = userFactory()
  const firstName: string = user.firstName
  const lastName: string = user.lastName
  const userName: string = user.userName
  const company: string = user.company
  const title: string | undefined = user.title ? user.title : 'aTitle'
  const password = Cypress.env('basePassword')

  before(function () {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getFunds') {
        req.alias = 'getFunds'
      }
    })
  })

  describe('My Profile testing', function () {
    it(`tests that clicking the edit button renders the edit drawer appropriately`, function () {
      profile.visitProfile()
      cy.wait('@getFunds')
      universal.getSpinner().should('not.exist')
      cy.get('body').then(($body) => {
        if ($body.text().includes('System Error')) {
          cy.contains('button', 'Reset Page').click()
        }
      })
      universal.getSpinner().should('not.exist')
      profile.getUsersLink().click()
      cy.wait(500)
      profile.getYouLink().click()
      profile.getEditProfileButton().should('be.visible').click({ force: true })
      profile.getUpdateProfileDrawer().within(() => {
        universal.getCancelButton().should('be.visible')
        profile.getMyProfileTab().scrollIntoView()
        profile.getMyProfileTab().should('be.visible')
        profile.getChangePasswordTab().should('be.visible')
      })
      //tests that the edit drawer renders My Profile by default
      profile.getUpdateProfileDrawer().within(() => {
        profile.getFirstNameInput().should('be.visible').and('have.value', firstName)
        profile.getLastNameInput().should('be.visible').and('have.value', lastName)
      })
      //tests that the form cannot submit without input
      profile.getUpdateProfileDrawer().within(() => {
        profile.getFirstNameInput().clear()
        profile.getLastNameInput().clear()
        profile.getUpdateProfileButton().click({ force: true })
        profile.getFirstNameInput().scrollIntoView()
        profile.getFirstNameInput().getInputValidation('Please fill out this field.')
      })
      //tests using the close button to close the Edit Contact Form
      profile.getUpdateProfileDrawer().within(() => {
        profile.getFirstNameInput().fill('new')
        universal.getCancelButton().click({ force: true })
      })
      cy.wait(300)
      profile.getYouDetailsCardByName(firstName).should('be.visible')
      //uses the cancel button to close the Edit Contact Form
      profile.getEditProfileButton().click()
      profile.getUpdateProfileDrawer().within(() => {
        profile.getFirstNameInput().scrollIntoView()
        profile.getFirstNameInput().clear().fill('Hallie')
        universal.getCancelButton().click()
      })
      profile.getYouDetailsCardByName(firstName).should('be.visible')
      //tests that the changed info show up in the profile and navbar
      profile.getEditProfileButton().click()
      profile.getUpdateProfileDrawer().within(() => {
        profile.getFirstNameInput().scrollIntoView()
        profile.getFirstNameInput().clear().fill('Billie')
        profile.getLastNameInput().clear().fill('Tester')
        profile.getEmailInput().clear().fill('theodoregray@postal.dev')
        profile.getTitleInput().clear().fill(title)
        profile.getPhoneNumberInput().clear().fill('7605576358')
        profile.getMeetingLinkInput().clear().fill('www.meetingLink.com')
        profile
          .getEmailSignatureInput()
          .clear()
          .fill(profile.htmlEmailSignatureExample(company, userName, title))
        profile.getUpdateProfileButton().click()
        universal.getSpinner().should('not.exist')
      })
      profile.getYouDetailsCardByName('Billie Tester').within(() => {
        profile.getYouEmail().should('contain', 'theodoregray@postal.dev')
        profile.getYouTitle().should('contain', title)
        profile.getYouPhone().should('contain', '7605576358')
        profile.getYouMeetingLink().should('contain', 'Share URL')
        profile.getEmailSignatureTable('Billie Tester').within(() => {
          cy.findByText(title)
          cy.findByText(company)
          cy.findByText('7605576358')
          cy.findAllByText(userName)
          cy.findAllByText('75 Higuera St #240 SLO, CA 93401')
          cy.findByRole('link', { name: 'Create Your Own Free Signature' }).should(
            'have.attr',
            'href',
            'https://www.hubspot.com/email-signature-generator?utm_source=create-signature'
          )
        })
      })
      navbar.getProfileData('Billie Tester').should('exist')
      //tests that these changes also make it into the user profile page
      users.visitUsers()
      universal.getSpinner().should('not.exist')
      universal.waitForProgressBar()
      universal
        .getRowByText('Billie Tester')
        .should('be.visible')
        .within(() => {
          universal.getLinkByText('Billie Tester').click()
        })
      universal.getSpinner().should('not.exist')
      users
        .getUserProfileCard('Billie Tester')
        .should('be.visible')
        .within(() => {
          users.getUserEmailInfo().should('contain', 'theodoregray@postal.dev')
          users.getUserPhoneInfo().should('contain', '7605576358')
          users.getUserTitleInfo().should('contain', title)
          users.getUserStatusInfo().should('not.exist')
          cy.contains('div', 'Meeting Link').within(() => {
            users.getCopyLink().should('have.attr', 'title', 'www.meetingLink.com')
          })
        })
    })
    it('tests that the change password form renders appropriately', function () {
      profile.visitProfile()
      universal.getSpinner().should('not.exist')
      cy.get('body').then(($body) => {
        if ($body.text().includes('System Error')) {
          cy.contains('button', 'Reset Page').click()
        }
      })
      universal.getSpinner().should('not.exist')
      profile.getEditProfileButton().should('be.visible').click()
      profile.getUpdateProfileDrawer().within(() => {
        profile.getChangePasswordTab().click()
        profile.getCurrentPasswordInput().should('exist')
        profile.getNewPasswordInput().should('exist')
        profile.getReenterPasswordInput().should('exist')
        signup.get12LongRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'notChecked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it('tests when password is less than six character', function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getCurrentPasswordInput().clear().fill(`${password}`)
        profile.getNewPasswordInput().fill(`Df)4v`)
        profile.getReenterPasswordInput().fill(`Df)4v`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it('tests when password does not have upper case letters', function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`cf8&b$cf8&b$`)
        profile.getReenterPasswordInput().clear().fill(`cf8&b$cf8&b$`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it('tests when password does not have lower case letters', function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`KS6!#UTKS6!#UT`)
        profile.getReenterPasswordInput().clear().fill(`KS6!#UTKS6!#UT`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it('tests when the password does not contain one number', function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`lcvBDR@lcvBDR@`)
        profile.getReenterPasswordInput().clear().fill(`lcvBDR@lcvBDR@`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it('tests when the password does not contain one symbol', function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`7Ho7vbD77Ho7vbD7`)
        profile.getReenterPasswordInput().clear().fill(`7Ho7vbD77Ho7vbD7`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it('tests when the password has three repeating consecutive characters', function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`&&&Huffington34Huffington34`)
        profile.getReenterPasswordInput().clear().fill(`&&&Huffington34Huffington34`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it(`tests when the password contains the user's email address`, function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`W0w!theodoregray@postal.devHuffington34`)
        profile.getReenterPasswordInput().clear().fill(`W0w!theodoregray@postal.devHuffington34`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        //because email is now generated as a random uuid the following might fail
        //signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'notChecked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it(`tests when the password fields don't match`, function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`#Oe%xzY3~#Oe%xzY3~`)
        profile.getReenterPasswordInput().clear().fill(`#Oe%xzY3+#Oe%xzY3+`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'notChecked')
        profile.getUpdatePasswordButton().should('be.disabled')
      })
      //})
      //it(`tests that a good new password combo can be submitted`, function () {
      profile.getUpdateProfileDrawer().within(() => {
        profile.getNewPasswordInput().clear().fill(`#Oe%xzY3+#Oe%xzY3+`)
        profile.getReenterPasswordInput().clear().fill(`#Oe%xzY3+#Oe%xzY3+`)
        signup.get12LongRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
        signup.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
        signup.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
        signup.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
        profile.getUpdatePasswordButton().should('not.be.disabled').click()
      })
      profile.getUpdateProfileDrawer().should('not.exist')
      profile.getUsersLink().click()
      cy.wait(500)
      profile.getYouLink().click()
      profile.getEditProfileButton().should('be.visible').click()
      cy.contains('div', 'First Name').scrollIntoView()
      cy.contains('div', 'First Name').should('be.visible')
    })
    //mock isn't really working anymore. it's extra flaky
    it.skip('Profile Info w/ mocked Campaign and Orders: test that it renders as it should', function () {
      //Monitors and Mocks the following requests
      //no need for a tracker here but only because these are at the end of the file
      //and would not interfere with tests that would require unmocked data
      cy.graphqlMockSet({ operationName: 'getUser', fixture: 'getUserMock.json' })
      cy.graphqlMockSet({ operationName: 'postalAnalytics', fixture: 'getUserAnalytics.json' })
      cy.graphqlMockSet({ operationName: 'searchCampaigns', fixture: 'searchCampaignsMock.json' })
      cy.graphqlMockSet({
        operationName: 'searchPostalFulfillments',
        count: 25,
        fixture: 'searchPostalFulfillmentsMockD.json',
      })
      cy.graphqlMockStart()
      cy.intercept('/engage/api/graphql', (req) => {
        if (req.body.operationName === 'getFunds') {
          req.alias = 'getFunds'
        }
      })
      profile.visitProfile()
      cy.wait('@getFunds')
      universal.getSpinner().should('not.exist')
      cy.get('body').then(($body) => {
        if ($body.text().includes('System Error')) {
          cy.contains('button', 'Reset Page').click()
        }
      })
      universal.getSpinner().should('not.exist')
      universal.getNoItemsMessage().should('not.exist')
      // hardcoded in mock
      profile.getCampaignsCard().should('not.exist')
      profile.getDateAddedStat().should('be.visible')
      profile
        .getStatsCard()
        .should('be.visible')
        .within(() => {
          profile.getDateAddedStat().should('contain', `10/8/2020`)
          profile.getItemsStat().should('contain', '2')
          profile.getCPTStat().should('not.exist')
        })
      cy.graphqlMockClear()
    })
    it(`Tests handwriting section of profile 'you' page`, function () {
      profile.visitProfile()
      cy.wait('@getFunds')
      universal.getSpinner().should('not.exist')
      cy.get('body').then(($body) => {
        if ($body.text().includes('System Error')) {
          cy.contains('button', 'Reset Page').click()
        }
      })
      universal.getSpinner().should('not.exist')
      profile.getTheBenCard().click({ force: true })
      profile.getUpdatedAlert()
      profile.getTheRichieCard().within(() => {
        cy.findByAltText('The Richie')
      })
      profile.getHandwritingStyleTooltip().realHover()
      profile.getHandwritingStyleTooltipText().should('be.visible')
    })
    //todo: update profile button, add team button
  })
})
