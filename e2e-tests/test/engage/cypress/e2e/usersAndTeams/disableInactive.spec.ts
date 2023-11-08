import { faker } from '@faker-js/faker'
import { InviteDocument } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Navbar, SignUpIn, Universal, Users } from '../../support/pageObjects'

const navbar = new Navbar()
const universal = new Universal()
const signUpIn = new SignUpIn()
const users = new Users()
const user = userFactory()
const userToTest = userFactory()
const fullname = `${userToTest.firstName} ${userToTest.lastName}`

describe(`Tests disabling and inactivating a user `, function () {
  before(function () {
    cy.signup(user)
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: [userToTest.userName],
        roles: ['USER'],
      },
    }).then((res) => {
      cy.completeInvitation({
        ...userToTest,
        id: res.invite?.[0]?.invite?.id ?? '',
      })
      cy.login(userToTest)
    })
    cy.visit('/')
    universal.getSpinner().should('not.exist')
    navbar.getProfileMenuButton().should('be.visible').click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(200)
        cy.reload()
        cy.wait(200)
      }
    })
    cy.findByRole('menu').should('contain', userToTest.firstName)
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests disabling/enabling and inactivating/activating a user`, function () {
    //tests disabling and enabling a user
    users.visitUsers()
    universal.getSpinner().should('not.exist')
    universal.waitForProgressBar()
    universal.getRowByText('User / Manager / Admin').within(() => {
      universal.getLinkByText(user.firstName).should('be.visible').click()
    })
    users.getEllipsesButton().should('be.visible').click({ force: true })
    users.getDisableUserMenuItem().should('not.exist')
    users.visitUsers()
    universal.progressBarZero()
    universal.getRowByText(fullname).within(() => {
      cy.findByText('User')
      cy.findByText('Enabled')
      universal.getLinkByText(fullname).click()
    })
    universal.getSpinner().should('not.exist')
    users.getUserStatus().should('contain', 'Enabled')
    users.getEllipsesButton().should('be.visible').click({ force: true })
    users.getDisableUserMenuItem().should('exist').click({ force: true })
    users.getDisableUserModal().within(() => {
      cy.findByText(`Please confirm that you'd like to disable this user.`)
      universal.getCancelButton().should('exist')
      users.getDisableUserButton().click()
    })
    users.getUserStatus().should('contain', 'Disabled')
    users.visitUsers()
    universal.waitForProgressBar()
    universal.getRowByText(fullname).should('contain', 'Disabled')

    cy.session(`${userToTest.userName}-${faker.string.nanoid()}`, () => {
      cy.visit('/login')
      signUpIn.getEmailAddressInput().type(userToTest.userName)
      signUpIn.getPasswordInputByPH().type(user.password)
      signUpIn.getLogInButton().click()
      signUpIn.getBadUserNamePasswordAlert()
    })

    cy.login(user)
    users.visitUsers()
    universal.waitForProgressBar()
    universal.getLinkByText(fullname).click()
    universal.getSpinner().should('not.exist')
    users.getUserStatus().should('contain', 'Disabled')
    users.getEllipsesButton().should('be.visible').click({ force: true })
    users.getEnableUserMenuItem().should('exist').click({ force: true })
    users.getUserStatus().should('contain', 'Enabled')

    cy.session(`${userToTest.userName}-${faker.string.nanoid()}`, () => {
      cy.visit('/login')
      signUpIn.getEmailAddressInput().type(userToTest.userName)
      signUpIn.getPasswordInputByPH().type(user.password)
      signUpIn.getLogInButton().click()
      signUpIn.getPasswordInputByPH().should('not.exist')
      universal.getSpinner().should('not.exist')
      navbar.getProfileMenuButton().should('be.visible').click({ force: true })
      cy.findByRole('menu').should('contain', userToTest.firstName)
    })

    //tests inactivating and activating a user
    cy.login(user)
    users.visitUsers()
    users.getActiveUsersTab().should('have.attr', 'aria-selected', 'true')
    universal.getLinkByText(fullname).click()
    universal.getSpinner().should('not.exist')
    users.getTeamsCard().within(() => {
      universal.getRowByText(user.company)
    })
    users.getBackToUsersButton().click()
    universal.progressBarZero()
    cy.clickCheckbox({ name: fullname })
    users.getUpdateRolesIconButton().click()
    users.getUpdatingRolesModal('1').within(() => {
      cy.selectAutoCompleteTeam(user.company)
      cy.selectUserRoles('User')
      users.getUpdateRolesButton().click()
    })
    users.getConfirmRemoveAccessModal().within(() => {
      universal.getConfirmButton().click()
    })
    users.getConfirmRemoveAccessModal().should('not.exist')
    universal.getRowByText(fullname).should('not.exist')
    users.getInactiveUsersTab().should('have.attr', 'aria-selected', 'false').click()
    universal.progressBarZero()
    users.getInactiveUsersTab().should('have.attr', 'aria-selected', 'true')
    universal.getRowByText(fullname).should('exist')

    cy.session(`${userToTest.userName}-${faker.string.nanoid()}`, () => {
      cy.visit('/login')
      signUpIn.getEmailAddressInput().type(userToTest.userName)
      signUpIn.getPasswordInputByPH().type(user.password)
      signUpIn.getLogInButton().click()
      cy.getAlert({ message: /has no roles/, close: 'close' })
    })

    cy.login(user)
    users.visitUsers()
    users.getInactiveUsersTab().click()
    universal.getLinkByText(fullname).click()
    universal.getSpinner().should('not.exist')
    users.getTeamsCard().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    users.getBackToUsersButton().click()
    universal.progressBarZero()
    cy.clickCheckbox({ name: fullname })
    users.getAddToTeamIconButton().click()
    users.getUpdatingRolesModal('1').within(() => {
      cy.selectAutoCompleteTeam(user.company)
      users.getUpdateRolesButton().click()
    })
    users.getUpdatingRolesModal('1').should('not.exist')
    users.getInactiveUsersTab()
    universal.getNoItemsMessage()
    users.getActiveUsersTab().click()
    universal.getLinkByText(fullname).click()
    universal.getSpinner().should('not.exist')
    users.getTeamsCard().within(() => {
      universal.getRowByText(user.company)
    })

    cy.session(`${userToTest.userName}-${faker.string.nanoid()}`, () => {
      cy.visit('/login')
      signUpIn.getEmailAddressInput().type(userToTest.userName)
      signUpIn.getPasswordInputByPH().type(user.password)
      signUpIn.getLogInButton().click()
      signUpIn.getPasswordInputByPH().should('not.exist')
      universal.getSpinner().should('not.exist')
      cy.contains('Shop by category').should('be.visible')
      navbar.getProfileMenuButton().should('be.visible').click()
      cy.findByRole('menu').should('contain', userToTest.firstName)
    })
  })
})
