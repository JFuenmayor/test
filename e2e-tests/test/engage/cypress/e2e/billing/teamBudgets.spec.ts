import { faker } from '@faker-js/faker'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  CreateBillingAccountDocument,
  PaymentPartnerType,
  SearchUsersDocument,
  TeamsDocument,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import { Billing, Navbar, Teams, Universal, Users } from '../../support/pageObjects'

describe('Billing: Team Budgets Testing', function () {
  const user = userFactory()
  const newTeamName: string = faker.commerce.productName()
  const newTeamNameB: string = faker.commerce.productName()
  const billing = new Billing()
  const universal = new Universal()
  const navbar = new Navbar()
  const users = new Users()
  const teams = new Teams()

  const truncatedCompany = user.company.slice(0, 12)

  before(() => {
    cy.signup(user)
    cy.usersSeed({ numberOfUsers: 10 })
  })

  // beforeEach(() => {
  //   cy.login(user)
  // })

  it(`tests default Funds account rendering and add a Team `, function () {
    billing.visitBillingFunds()
    universal.getSpinner().should('not.exist')
    billing.getCurrentBalance().should('contain', '$0')
    billing
      .getCurrentAccountCard(`${user.company}'s Fund Management Billing Account`)
      .should('be.visible')
    cy.wait(500)
    billing.getDisabledButton().should('contain.html', 'svg')
    billing.getPooledButton().should('not.contain.html', 'svg')
    billing.getPerUserButton().should('not.contain.html', 'svg')
    //adds a team from the funds page
    billing.getAddATeamButton().click()
    billing
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        billing.getNewTeamNameInput().should('be.visible').fill(newTeamName)
        billing
          .getNewTeamBillingAccountSelect()
          .select(`${user.company}'s Fund Management Billing Account`)
        billing.getNewTeamDepartmentSelect().select('Marketing')
        billing.getDisabledButton().should('contain.html', 'svg')
        billing
          .getPooledButton()
          .should('not.contain.html', 'svg')
          .find('input')
          .click({ force: true })
        billing.getPerUserButton().should('not.contain.html', 'svg')
        billing.getBudgetDurationText()
        billing.getMonthlyButton().should('not.contain.html', 'svg').click()
        billing.getQuarterlyButton().should('not.contain.html', 'svg')
        billing.getYearlyButton().should('not.contain.html', 'svg')
        billing.getBudgetAmountInput().type('500')
        billing.getBudgetModeTooltip().click()
      })
    billing.getBudgetModesModal().within(() => {
      universal.getCloseButton().click()
    })
    billing.getCreateTeamDrawer().within(() => {
      billing.getCreateTeamButton().click({ force: true })
    })
    billing.getCreateTeamDrawer().should('not.exist')
    //tests newly listed team
    cy.queryForUpdateRecurse({
      request: TeamsDocument,
      options: { filter: { status: { eq: 'ACTIVE' } } },
      operationName: 'teams',
      key: '0',
      value: newTeamName,
      key2: 'name',
    })
    universal.progressBarZero()
    universal
      .getRowByText(newTeamName)
      .contains(new Date().toLocaleDateString('en-US'))
      .click({ force: true })
    cy.contains(newTeamName).should('be.visible')
    teams.getMembersTab().should('have.attr', 'aria-selected', 'true')
    teams.getSettingsTab().click({ force: true })
    billing.getCurrentBalance().should('contain', '$0')
    billing
      .getCurrentAccountCard(`${user.company}'s Fund Management Billing Account`)
      .should('be.visible')
    billing.getDisabledButton().should('not.contain.html', 'svg')
    billing.getPooledButton().should('contain.html', 'svg')
    billing.getPerUserButton().should('not.contain.html', 'svg')
    billing.getMonthlyButton().should('contain.html', 'svg')
    billing.getQuarterlyButton().should('not.contain.html', 'svg')
    billing.getYearlyButton().should('not.contain.html', 'svg')
    billing.getListedBudgetAmountInput().should('have.value', '500')
    cy.get('body').then(($body) => {
      if ($body.text().includes('Success!')) {
        cy.findByLabelText('Close', { timeout: 99000 }).click({
          force: true,
          multiple: true,
        })
      }
    })
    billing.getRemainingBudget().scrollIntoView()
    billing.getRemainingBudget().within(() => {
      cy.findByText('$500.00')
      cy.wait(300)
      billing.getRemainingBudgetTooltip().realHover()
    })
    billing.getRemainingBudgetTooltipText().should('be.visible')
    billing.getBudgetModeTooltip().click()
    billing.getBudgetModesModalV2().within(() => {
      billing.getBudgetModalText()
      universal.getCloseButtonByLabelText().click()
    })
    //add a team from the users/teams tab
    //adds one hundred dollars to the balance
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            amount: 10000,
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    teams.visitTeams()
    cy.url().should('contain', '/teams')
    cy.reload()
    universal.progressBarZero()
    navbar.getProfileData(`${user.company}`).should('contain', '$100.00')
    //checks that the teams are listed here
    universal.getRowByText(user.company).should('be.visible')
    universal.getRowByText(newTeamName)
    teams.getCreateTeamButton().click({ force: true })
    billing
      .getCreateTeamDrawer()
      .should('be.visible')
      .within(() => {
        billing.getNewTeamNameInput().should('be.visible').fill(newTeamNameB)
        billing
          .getNewTeamBillingAccountSelect()
          .select(`${user.company}'s Fund Management Billing Account`)
        billing.getNewTeamDepartmentSelect().select('Marketing')
        billing.getPerUserButton().find('input').should('not.be.disabled').click({ force: true })
        billing.getPerUserButton().should('contain.html', 'svg')
        billing.getBudgetAmountInput().type('300')
        cy.intercept('/engage/api/graphql', (req) => {
          if (req.body.operationName === 'teams') {
            req.alias = 'teams'
          }
        })
        billing.getCreateTeamButton().click()
      })
    cy.wait('@teams').then((resp) => {
      const newTeamBId: string = resp.response?.body.data.teams[0].id
      billing.getCreateTeamDrawer().should('not.exist')
      universal.getRowByText(newTeamNameB)
      //clicks into teams from the users-team tab and checks the settings are the same as funds
      //tests the stuff done on account creation or from the accounts page is correctly displayed here
      teams.visitTeams()
      universal.progressBarZero()
      universal.getSpinner().should('not.exist')
      //checks that the teams are listed here
      universal.getRowByText(user.company).click()
      cy.url().should('include', '/teams/default/members')
      cy.contains(user.company)
      universal.getRowsInATableBody().should('have.length', 10)
      teams.getSettingsTab().click()
      universal.getSpinner().should('not.exist')
      billing.getCurrentBalance().should('contain', '$100')
      billing.getDisabledButton().should('contain.html', 'svg')
      teams.getBackToTeamsButton().click()
      universal.getRowByText(newTeamName).click()
      teams.getMembersTab().click()
      universal.getRowsInATableBody().should('have.length', 1).should('contain', 'No items found')
      teams.getSettingsTab().should('be.visible').click()
      billing.getCurrentBalance().should('be.visible').and('contain', '$100')
      billing.getPooledButton().should('contain.html', 'svg')
      billing.getMonthlyButton().should('contain.html', 'svg')
      billing.getListedBudgetAmountInput().should('have.value', '500')
      cy.wait(200)
      billing.getRemainingBudget().within(() => {
        cy.findByText('$500.00')
        billing.getRemainingBudgetTooltip().scrollIntoView().realHover()
      })
      billing.getRemainingBudgetTooltipText()
      //checks that the new team created in teams shows up in funds
      billing.visitBillingFunds()
      cy.wait(400)
      cy.get('body').then(($body) => {
        if ($body.text().includes('unexpected error')) {
          cy.reload()
        }
      })
      universal.getSpinner().should('not.exist')
      //one for each team card and one for each current account card within the team card
      billing.getAllTeamsCards().should('have.length', 6)
      cy.findAllByText(`${user.company}'s Fund Management Billing Account`).should('be.visible')
      teams.getTeamCardByName(newTeamNameB).within(() => {
        billing.getCurrentBalance().should('contain', '$100')
        billing.getPerUserButton().should('contain.html', 'svg')
        billing.getMonthlyButton().should('contain.html', 'svg')
        billing.getListedBudgetAmountInput().should('have.value', '300')
      })
      //tests editing a listed team and the default Team`
      //adds a new account to test multiple account in the billing account select
      cy.graphqlRequest(CreateBillingAccountDocument, {
        data: {
          name: 'New Account',
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.userName,
          country: 'USA',
          state: 'CA',
        },
      }).then(() => {
        cy.wait(300)
        billing.visitBillingFunds()
        universal.getSpinner().should('not.exist')
        billing.getAddATeamButton().click()
        billing
          .getCreateTeamDrawer()
          .should('be.visible')
          .within(() => {
            billing.getNewTeamNameInput().should('be.visible').fill(`New Account Fund Management`)
            billing.getNewTeamBillingAccountSelect().select(`New Account Fund Management`)
            billing.getNewTeamDepartmentSelect().select('Marketing')
            billing.getCreateTeamButton().click({ force: true })
          })
        cy.wait(300)
        billing.visitBillingFunds()
        teams.getTeamCardByName(newTeamNameB).within(() => {
          //tests editing and saving
          billing.getTeamNameInput().clear().fill(`${newTeamNameB}Up`)
          billing.getCurrentBalance().should('contain', '$100')
          billing.getRemainingBudget().should('not.exist')
          billing.getPooledButton().find('input').click({ force: true })
          billing.getRemainingBudget().should('contain', '$300.00')
          billing.getQuarterlyButton().find('input').click({ force: true })
          billing.getListedBudgetAmountInput().clear().type('200')
          universal.getSaveButton().click()
        })
        universal.getSpinner().should('not.exist')
        teams.getTeamCardByName(`${newTeamNameB}Up`).within(() => {
          billing.getEditLink().should('be.visible').click()
        })
        //ToDo: add a testid for selected tags and test default selected is correct
        billing.getEditBillingAccountsModal().within(() => {
          cy.findByText('EUR').should('exist')
          cy.findByText('USD').should('exist')
          cy.findByText('AUD').should('exist')
          cy.findByText('CAD').should('exist')
          cy.findByText('GBP').should('exist')
          cy.findByText('MXN').should('exist')
          cy.findByText('SGD').should('exist')
          cy.findByRole('tab', { name: 'USD' }).scrollIntoView()
          cy.findByRole('tab', { name: 'USD' }).click()
          universal
            .getRowByText(`${user.company}'s Fund Management Billing Account`)
            .scrollIntoView()
            .should('be.visible')
          universal.getRowByText('New Account Fund Management').click()
          universal.getSaveButton().click()
        })
        billing.getEditBillingAccountsModal().should('not.exist')
        teams.getTeamCardByName(`${newTeamNameB}Up`).within(() => {
          billing.getTeamNameInput().should('be.visible').and('have.value', `${newTeamNameB}Up`)

          billing.getCurrentAccountCard('New Account Fund Management')
          billing.getCurrentBalance().should('contain', '$0')
          billing.getPooledButton().should('contain.html', 'svg')
          billing.getQuarterlyButton().should('contain.html', 'svg')
          billing.getRemainingBudget().scrollIntoView()
          billing.getListedBudgetAmountInput().should('have.value', '200')
          billing.getRemainingBudget().should('contain', '$200.00')
          //tests editing and reseting
          teams.getTeamCardByName(`${newTeamNameB}Up`).within(() => {
            billing.getTeamNameInput().clear().fill(`${newTeamNameB}Ed`)
            billing.getDisabledButton().find('input').click({ force: true })
            billing.getMonthlyButton().should('not.exist')
            universal.getResetButton().click()
          })
          teams.getTeamCardByName(`${newTeamNameB}Up`).within(() => {
            billing.getTeamNameInput().should('be.visible').and('have.value', `${newTeamNameB}Up`)
            billing.getCurrentBalance().should('contain', '$0')
            billing.getPooledButton().should('contain.html', 'svg')
            billing.getQuarterlyButton().should('contain.html', 'svg')
            billing.getListedBudgetAmountInput().should('have.value', '200')
            billing.getRemainingBudget().should('contain', '$200.00')
          })
        })
      })
      //tests disabled toggling on default team and rendering disable in the switch account menu element
      navbar.getProfileData(`${user.company}`).should('contain', '$100.00').click()
      cy.findByRole('menu')
        .should('be.visible')
        .within(() => {
          cy.contains('[role="menuitem"]', truncatedCompany).within(() => {
            cy.contains('Budget').should('exist')
            cy.contains('Disabled').should('exist')
            cy.contains('Balance').should('exist')
            cy.contains('$100.00').should('exist')
          })
        })
      billing
        .getCurrentAccountCard(RegExp(`${user.company}`, 'g'))
        .scrollIntoView()
        .within(() => {
          billing.getDisabledButton().should('contain.html', 'svg')
          billing.getMonthlyButton().should('not.exist')
          billing.getPooledButton().find('input').click({ force: true })
          billing.getMonthlyButton().should('exist').and('contain.html', 'svg')
          billing.getListedBudgetAmountInput().should('have.value', '500')
          billing.getRemainingBudget().should('contain', '$0.00')
          universal.getSaveButton().click()
        })
      navbar.getProfileData(`${user.company}`).should('contain', '$500.00')
      //tests opening the 'Edit Account' link
      billing.visitBillingFunds()
      universal.getSpinner().should('not.exist')
      teams
        .getTeamCardByName(`${newTeamNameB}Up`)
        .should('be.visible')
        .within(() => {
          billing.getCurrentAccountCard('New Account Fund Management').realHover()
          cy.wait(500)
          billing.getEditAccountLink().click()
        })
      universal.getSpinner().should('not.exist')
      universal.getUISpinner().should('not.exist')
      cy.wait(300)
      cy.contains('New Account Fund Management')
      billing.getActiveTeams().should('contain', `${newTeamNameB}Up`)
      billing.getDeleteButton().click()

      billing.getDeleteBillingAccountModal().within(() => {
        universal.getDeleteButton().click()
      })
      billing.getUnabletoDeleteAlert()
      //tests adding users and updating their roles through the 'Manage Users' link
      billing.visitBillingFunds()
      universal.getSpinner().should('not.exist')
      teams.getTeamCardByName(`${newTeamNameB}Up`).within(() => {
        billing.getManageUsersLink().click()
      })
      billing
        .getTeamMembersDrawer(`${newTeamNameB}Up`)
        .should('be.visible')
        .within(() => {
          teams.getAddUserButton().click()
        })
      //tests the Add team Membership modal
      users.getAddTeamMembershipModal().within(() => {
        users.getTeamMembershipModalText()
        users
          .getSendUserEmailLabel()
          .should('be.visible')
          .find('input')
          .check({ force: true })
          .should('be.checked')
        cy.selectAutoCompleteUser('Aymeris')
        users.getRolesMenu().should('contain', 'User')
        cy.selectUserRoles('Manager')
        users.getRolesMenu().should('contain', 'User, Manager')
        cy.findByTestId('MenuUserRole_menu').should('not.be.visible')
        users.getSendEmailTooltip().eq(1).realHover()
      })
      users.getSendEmailTooltipText().should('be.visible')
      billing.getupdateRolesButton().click({ force: true })
      users.getAddTeamMembershipModal().should('not.exist')
      billing.getTeamMembersDrawer(`${newTeamNameB}Up`).within(() => {
        universal.progressBarZero()
        universal.getRowByText('Aymeris')
        universal.clickCloseButtonInFooter()
      })
      //adds another user
      teams.getTeamCardByName(`${newTeamNameB}Up`).within(() => {
        billing.getManageUsersLink().click()
      })
      billing
        .getTeamMembersDrawer(`${newTeamNameB}Up`)
        .should('be.visible')
        .within(() => {
          teams.getAddUserButton().should('be.visible').click()
        })
      users.getAddTeamMembershipModal().within(() => {
        cy.selectAutoCompleteUser('Elio')
        billing.getupdateRolesButton().click({ force: true })
      })
      users.getAddTeamMembershipModal().should('not.exist')
      billing.getTeamMembersDrawer(`${newTeamNameB}Up`).within(() => {
        universal.progressBarZero()
        universal.getRowByText('Elio')
        universal.getRowsInATableBody().should('have.length', '2')
        users.getSearchLastName().type('emmerick')
        universal.getRowsInATableBody().should('have.length', '1')
        universal.getRowByText('Elio')
        users.getSearchLastName().clear()
        universal.getRowsInATableBody().should('have.length', '2')
        users.getSearchFirstName().type('aymeris')
        universal.getRowsInATableBody().should('have.length', '1')
        universal.getRowByText('Aymeris')
        users.getSearchFirstName().clear()
        universal.getRowsInATableBody().should('have.length', '2')
        users.getSearchEmail().type('arnold')
        universal.getRowsInATableBody().should('have.length', '1')
        universal.getRowByText('Aymeris')
        users.getSearchEmail().clear()
        universal.getRowsInATableBody().should('have.length', '2')
        users.getSelectRolesFilter().click()
        users.getRolesFilterMenuItem('Manager').click()
        universal.getRowsInATableBody().should('have.length', '1')
        universal.getRowByText('Aymeris')
        users.getRolesMenuByRole('Manager')
        users.getRolesFilterMenuItem('User').click()
        universal.getRowsInATableBody().should('have.length', '2')
        users.getTeamUpdateButton().should('be.disabled')
        universal.getCheckboxForAllItems().click()
        universal.getRowByText('Elio').should('not.contain', 'User, Manager')
        users.getTeamUpdateButton().should('not.be.disabled').click()
      })
      users.getUpdatingRolesModal('2').within(() => {
        users.getUpdatingRolesModalText()
        cy.selectUserRoles('Manager')
        users.getUpdateRolesButton().click({ force: true })
      })
      users.getUpdatingRolesModal('2').should('not.exist')
      users.getUsersUpdatedAlert('2')
      users.getSearchEmail().type('postal')
      universal.getRowByText('Elio').should('be.visible').and('contain', 'User, Manager')
      universal.getRowByText('Aymeris').should('contain', 'User, Manager')
      cy.queryForUpdateRecurse({
        request: SearchUsersDocument,
        options: { filter: { productAccess: { teamId: { eq: newTeamBId } } } },
        operationName: 'searchUsers',
        key: 'resultsSummary',
        value: 2,
        key2: 'totalRecords',
      })
      universal.progressBarZero()
      universal.getCheckboxForAllItems().should('not.be.checked')
      cy.wait(200)
      universal.getCheckboxForAllItems().click()
      universal.progressBarZero()
      users.getTeamUpdateButton().should('not.be.disabled').click()
      users.getUpdatingRolesModal('2').within(() => {
        //just User pre-selected
        users.getUpdateRolesButton().click()
      })
      users.getUpdatingRolesModal('2').should('not.exist')
      users.getUsersUpdatedAlert('2')
      universal.getRowByText('Elio').should('not.contain', 'User, Manager')
      universal.getRowByText('Aymeris').should('not.contain', 'User, Manager')
      //removes a user from the team by removing access
      universal.getCheckboxForAllItems().click()
      cy.clickCheckbox({ name: 'Elio' })
      users.getTeamUpdateButton().should('not.be.disabled').click()
      users.getUpdatingRolesModal('1').within(() => {
        //just User pre-selected
        cy.selectUserRoles('User')
        users.getUpdateRolesButton().click()
      })
      users.getConfirmRemoveAccessModal().within(() => {
        universal.getRemoveButton().click()
      })
      universal.getRowByText('Elio').should('not.exist')
      universal.getRowByText('Aymeris').should('exist')
      //tests that deleting a team from the users-Teams page will be refelected in the funds page
      teams.visitTeams()
      universal.progressBarZero()
      universal.getRowByText(newTeamName).click()
      teams.getDeleteTeamButton().click()
      users.getRemoveTeamButton().click()
      universal.getRowByText(newTeamName).should('not.exist')
      billing.visitBillingFunds()
      universal.getSpinner().should('not.exist')
      teams.getTeamCardByName(`${newTeamNameB}Up`).should('exist')
      cy.findByDisplayValue(newTeamName, { timeout: 99000 }).should('not.exist')
    })
  })
})
