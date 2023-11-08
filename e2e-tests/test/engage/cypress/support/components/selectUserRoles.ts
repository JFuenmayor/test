Cypress.Commands.add('selectUserRoles', (...roles: string[]) => {
  cy.findByTestId('MenuUserRole_button').focus()
  cy.findByTestId('MenuUserRole_button').click({ force: true })
  cy.findByTestId('MenuUserRole_menu').within(() => {
    roles.forEach((role) => {
      cy.findByRole('menuitemcheckbox', { name: role }).click({ force: true })
    })
  })
  cy.findByTestId('MenuUserRole_button').click({ force: true })
})
