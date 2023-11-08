let accountId: string
let id: string

Cypress.Commands.add('rolesSetupA', (user) => {
  const company: string = user.company
  const firstName: string = user.firstName
  const log = Cypress.log({
    name: 'programaticLogin',
    displayName: 'Login',
    message: [`🌱 Seeding | Prep For Roles Testing`],
    autoEnd: false,
  })
  cy.signup(user)
  cy.currentUser().then((me) => {
    id = me.userId
    accountId = me.accountId
  })
  cy.createApprovedPostcard()
  cy.contactsSeed(2)
  cy.usersSeed({})
  cy.saveLocalStorageCache().then(() => {
    log.end()
    return { id, accountId, company, firstName }
  })
})
