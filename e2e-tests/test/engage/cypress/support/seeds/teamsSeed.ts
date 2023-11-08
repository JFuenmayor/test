import { faker } from '@faker-js/faker'
import { BillingAccountsDocument, CreateTeamDocument, Currency, Status } from '../api'

Cypress.Commands.add('teamsSeed', (numberOfTeams = 15) => {
  // let numLoops
  // !numberOfTeams ? (numLoops = 15) : (numLoops = numberOfTeams)

  const teams = ['Jersey', '0(aaaTeam', 'zzzTeam', 'Zero']
  const allTeams: string[] = []

  const log = Cypress.log({
    name: 'teamsSeed',
    displayName: 'Teams',
    message: [`🧑🏿‍🤝‍🧑🏾 Creating | ${numberOfTeams} teams`],
    autoEnd: false,
  })

  // all teams need a billing account
  cy.graphqlRequest(BillingAccountsDocument, {
    filter: { type: { eq: 'FUNDS' }, status: { in: [Status.Active, null] } },
  }).then((data) => {
    const [account] = data.billingAccounts || []
    const billingAccount = {
      billingAccountId: account.id,
      currency: account.currency || Currency.Usd,
    }
    for (let i = 0; i < numberOfTeams; i++) {
      const generateData = (i: number, fakerfunc: any, arr: any[]) => {
        const generated = i >= 3 ? fakerfunc : arr[i]
        return generated
      }
      cy.graphqlRequest(CreateTeamDocument, {
        data: {
          name: generateData(i, faker.string.alphanumeric(8), teams),
          department: 'Other',
          // @ts-ignore
          settings: { billingAccountIds: [billingAccount] },
        },
      }).then((res) => {
        allTeams.push(res.createTeam.name)
        return res.createTeam
      })
    }
  })

  log.set({
    consoleProps() {
      return {
        allTeams,
      }
    },
  })
  log.end()
})
