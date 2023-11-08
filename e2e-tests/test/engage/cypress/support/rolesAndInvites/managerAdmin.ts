import { InviteDocument } from '../api'
import { userFactory } from '../factories'

export interface seedingManagerAdminProps {
  inviteId: string
  userName: string
  accountId: string
}
Cypress.Commands.add(
  'seedingManagerAdmin',
  ({ inviteId, userName, accountId }: seedingManagerAdminProps) => {
    const log = Cypress.log({
      name: 'seedingManagerAdmin',
      displayName: 'Seeds',
      message: [`🌱 Seeding | Manager/Admin`],
      autoEnd: false,
    })
    const newUser = userFactory({
      userName,
      firstName: 'Manager',
      lastName: 'Admin',
      company: 'ManagerAdmin',
    })
    cy.completeInvitation({
      id: inviteId,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password: newUser.password,
    })
    cy.login(newUser)

    //Manager Admin Made/Manipulated
    //does not include adding funds
    cy.createAMessage({
      accountId,
      obj: {
        name: 'Welcome to Permissions Testing$',
        templateText: 'This was made with a manager/admin role.',
      },
    })
    cy.createApprovedPostcard({
      name: 'Manager/Admin approved',
      description: 'Manager/Admin Role',
    })
    cy.createAContact({
      emailAddress: 'wwilliows@postal.com',
      title: 'Manager Admin Role',
      lastName: 'WilbyUP',
      firstName: 'WillowsUP',
    })
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: ['plantMom@postal.dev'], roles: ['USER'] },
    })
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: ['dogMom@postal.dev'], roles: ['ADMIN'] },
    })
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: ['catMom@postal.dev'], roles: ['USER', 'ADMIN'] },
    })
    log.end()
  }
)
