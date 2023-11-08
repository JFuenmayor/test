import { AddProductAccessDocument } from '../../api'

export interface AddProductAccessArgs {
  id: string
  teamId?: string
  roles: string[]
}
//@ts-ignore
Cypress.Commands.add('addProductAccess', (args: AddProductAccessArgs) => {
  return cy.graphqlRequest(AddProductAccessDocument, args).then((res) => res.addProductAccess)
})
