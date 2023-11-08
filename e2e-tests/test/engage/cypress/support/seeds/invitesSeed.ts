import { faker } from '@faker-js/faker'
import { InviteDocument } from '../api'

Cypress.Commands.add('invitesSeed', (numberOfInvites = 10) => {
  let numLoops
  !numberOfInvites ? (numLoops = 14) : (numLoops = numberOfInvites)
  const emails = ['hhhh@postal.dev', 'zzzz@postal.dev', 'aaaa@postal.dev', 'aabb@postal.dev']
  const invited: any[] = []

  const varyRoles = (elem: any) => {
    if (elem % 3 === 1) {
      return ['ADMIN']
    } else if (elem % 3 === 2) {
      return ['USER']
    } else {
      return ['USER', 'ADMIN']
    }
  }

  const log = Cypress.log({
    name: 'invitesSeed',
    displayName: 'Invites',
    message: [`📤 Creating | ${numLoops} invites`],
    autoEnd: false,
  })

  for (let i = 0; i < numLoops; i++) {
    const generateData = (i: number, fakerfunc: any, arr: any[]) => {
      const generated = i >= 4 ? fakerfunc : arr[i]
      return generated
    }
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: generateData(
          i,
          `${faker.helpers.slugify(faker.person.firstName())}${i}@postal.dev`,
          emails
        ),
        roles: varyRoles(i),
      },
    }).then((res) => {
      invited.push(res.invite?.[0]?.invite?.emailAddress)
      return res.invite
    })
  }
  log.set({
    consoleProps() {
      return {
        invited,
      }
    },
  })
  log.end()
})
