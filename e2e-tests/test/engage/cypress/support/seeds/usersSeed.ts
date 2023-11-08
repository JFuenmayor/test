import { faker } from '@faker-js/faker'
import { InviteDocument } from '../api'
export interface usersSeedProps {
  numberOfUsers?: number
}

Cypress.Commands.add('usersSeed', (args: usersSeedProps) => {
  const numberOfUsers = args.numberOfUsers

  let numLoops
  !numberOfUsers ? (numLoops = 15) : (numLoops = numberOfUsers)

  const firstNames = ['Aymeris', 'Elio', 'Peter', 'Sandra']
  const lastNames = ['Arnold', 'Emmerick', 'Harper', 'Parker']
  const users: any[] = []

  const log = Cypress.log({
    name: 'usersSeed',
    displayName: 'Users',
    message: [`👤 Creating | ${numLoops} users`],
    autoEnd: false,
  })

  for (let i = 0; i < numLoops; i++) {
    const generateData = (i: number, fakerfunc: any, arr: any[]) => {
      const generated = i >= 4 ? fakerfunc : arr[i]
      return generated
    }
    const ranNum = faker.string.alphanumeric(4)
    const firstName = generateData(i, faker.helpers.slugify(faker.person.firstName()), firstNames)
    const lastName = faker.helpers.slugify(generateData(i, faker.person.lastName(), lastNames))
    const email = `${firstName}.${faker.helpers.slugify(lastName)}.${ranNum}@postal.dev`
    cy.graphqlRequest(InviteDocument, { data: { emailAddresses: [email], roles: ['USER'] } }).then(
      (res) => {
        cy.request({
          log: false,
          method: 'POST',
          url: '/api/invite/complete',
          body: { id: res.invite?.[0]?.invite?.id, firstName, lastName },
        })
        users.push(res.invite?.[0]?.invite?.emailAddress)
      }
    )
  }
  log.set({
    consoleProps() {
      return {
        users,
      }
    },
  })
  log.end()
})
