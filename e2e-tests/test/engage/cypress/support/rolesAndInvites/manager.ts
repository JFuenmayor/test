import { userFactory } from '../factories'

export interface seedingManagerProps {
  inviteId: string
  userName: string
}

Cypress.Commands.add('seedingManager', ({ inviteId, userName }: seedingManagerProps) => {
  const log = Cypress.log({
    name: 'seedingManager',
    displayName: 'Seeds',
    message: [`🌱 Seeding | Manager`],
    autoEnd: false,
  })

  const newUser = userFactory({
    userName,
    firstName: 'Ave',
    lastName: 'Manageria',
    company: 'AveManageria',
  })
  cy.completeInvitation({
    id: inviteId,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    password: newUser.password,
  })
  cy.login(newUser)
  cy.createAContact({
    emailAddress: 'hlawry@postal.com',
    title: 'Manager Role',
    lastName: 'LawryUP',
    firstName: 'HannahUP',
  })
  log.end()
})
