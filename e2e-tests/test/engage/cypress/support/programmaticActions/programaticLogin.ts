Cypress.Commands.add('programaticLogin', ({ userName, password }) => {
  return cy.authPasswordApi({ userName, password }).then(() => cy.sessionAccessTokenApi())
})
