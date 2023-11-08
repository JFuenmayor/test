import { MeDocument, ModulesDocument } from '../api'

export interface inviteSignUpProps {
  id: string
  firstName: string
  lastName: string
  password?: string
}
Cypress.Commands.add('inviteSignUp', (args: inviteSignUpProps) => {
  const id = args.id
  const firstName = args.firstName
  const lastName = args.lastName
  // allow custom password for seed process; default to env
  const password = args.password || Cypress.env('basePassword')

  const log = Cypress.log({
    name: 'contactsSeed',
    displayName: 'Invites',
    message: [`🔏 Authenticating | Invited: ${firstName} ${lastName}`],
    autoEnd: false,
  })

  cy.sessionLogoutApi()
  cy.manageState()
  cy.inviteInfoApi(id)
  cy.inviteCompleteApi(id, firstName, lastName)
  cy.signupPasswordApi(id, password)
  cy.sessionAccessTokenApi()
  cy.graphqlRequest(ModulesDocument)
  cy.graphqlRequest(MeDocument).then((res) => res.me.id)
  log.end()
})
