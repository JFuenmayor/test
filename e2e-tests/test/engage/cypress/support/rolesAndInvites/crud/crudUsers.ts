import { Universal, Users } from '../../pageObjects'

export interface crudUsersProps {
  firstName: string
  lastName: string
  company: string
}

Cypress.Commands.add('crudUsers', (args: crudUsersProps) => {
  const users = new Users()
  const universal = new Universal()
  const firstName = args.firstName
  const lastName = args.lastName
  const company = args.company
  //users should be seeded seed in the main test file use those users here to test editing and deleting

  //Edit
  users.visitUsers()
  users.getActiveUsersTab().click({ force: true })
  users.getSearchFirstName().clear().fill(firstName)
  users.getSearchLastName().fill(lastName)
  universal.getRowsInATableBody().should('have.length', 1)
  universal.progressBarZero()
  users.getActiveUsersTabpanel().within(() => {
    users.getUserLinkByName(firstName).should('be.visible').click()
  })
  users.getEditUserButton().should('be.visible').click()
  cy.wait(300)
  cy.findAllByDisplayValue(firstName)
    .parents('form')
    .eq(0)
    .within(() => {
      users.getFirstNameInput().should('not.have.value', '').type(`Up`, { force: true })
    })
  cy.findAllByDisplayValue(`${firstName}Up`)
    .parents('form')
    .eq(0)
    .within(() => {
      cy.contains('button', 'Update User').scrollIntoView()
      cy.contains('button', 'Update User').click({ force: true })
    })

  //Bulk Remove from Team
  users.visitUsers()
  cy.wait(300)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Back to Home')) {
      cy.wait(300)
      cy.reload()
      cy.wait(600)
    }
  })
  //seeded user names - Ave Manageria and Hannah Huser
  //crudUsers is not used in manager or user testing so this is safe.
  cy.clickCheckbox({ name: 'Ave Manageria' })
  cy.clickCheckbox({ name: 'Hannah Huser' })
  users.getUpdateRolesIconButton().click({ force: true })
  users.getUpdatingRolesModal('2').within(() => {
    cy.selectAutoCompleteTeam(company)
    cy.selectUserRoles('User')
    users.getUpdateRolesButton().click()
  })
  universal.getConfirmButton().click()
  universal.getRowByText('Ave Manageria').should('not.exist')
  universal.getRowByText('Hannah Huser').should('not.exist')
  users.getInactiveUsersTab().click()
  universal.getRowByText('Ave Manageria').should('exist')
  universal.getRowByText('Hannah Huser').should('exist')
  universal.getAllGridCellsByText('No Access').should('have.length', 2)
})
