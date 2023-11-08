import { InviteDocument } from '../api'
import { userFactory } from '../factories'

export interface seedingAdminProps {
  inviteId: string
  userName: string
  accountId: string
}

Cypress.Commands.add('seedingAdmin', ({ inviteId, userName, accountId }: seedingAdminProps) => {
  const log = Cypress.log({
    name: 'seedingAdmin',
    displayName: 'Seeds',
    message: [`🌱 Seeding | ADMIN`],
    autoEnd: false,
  })

  const newUser = userFactory({
    userName,
    firstName: 'Ora',
    lastName: 'Admina',
    company: 'OraAdmina',
  })
  cy.completeInvitation({
    id: inviteId,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    password: newUser.password,
  })
  cy.login(newUser)

  //Admin Made/Manipulated
  //does not include adding funds
  cy.createAMessage({
    accountId,
    obj: {
      name: 'Welcome to Permissions Testing',
      templateText: 'This was made with an admin role.',
    },
  })
  cy.createApprovedPostcard({
    name: 'AdminOnly',
    description: 'Admin Role',
  })
  cy.graphqlRequest(InviteDocument, {
    data: {
      emailAddresses: ['pizza@postal.dev'],
      roles: ['USER'],
    },
  })
  cy.graphqlRequest(InviteDocument, {
    data: {
      emailAddresses: ['pizzahut@postal.dev'],
      roles: ['ADMIN'],
    },
  })
  cy.graphqlRequest(InviteDocument, {
    data: {
      emailAddresses: ['pizzaKing@postal.dev'],
      roles: ['USER', 'ADMIN'],
    },
  })
  cy.graphqlRequest(InviteDocument, {
    data: {
      emailAddresses: ['pizzaPrince@postal.dev'],
      roles: ['MANAGER'],
    },
  })
  log.end()
})
