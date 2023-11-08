import { CreateApprovedPostalDocument, SearchApprovedPostalsDocument, Status } from '../api'

export interface createACollectionProps {
  collectionName?: string
  numOfItems: number
  teamsIds?: any[]
}

Cypress.Commands.add('createACollection', (args: createACollectionProps) => {
  const collectionName = !args.collectionName ? 'Seeded Collection' : args.collectionName
  const numOfItems = args.numOfItems
  const teamsIds = !args.teamsIds ? [] : args.teamsIds
  cy.visit('/')
  return cy
    .graphqlRequest(SearchApprovedPostalsDocument, {
      limit: numOfItems,
      filter: {
        currency: { in: ['USD'] },
        category: { ne: 'Events' },
        name: {
          in: [
            'Chipotle',
            'Tolosa Winery 1772 Chardonnay 2018',
            'Everybody Lies: Big Data, New Data, and What the Internet Can Tell Us About Who We Really Are',
          ],
        },
      },
    })
    .then((res) => {
      const items: any[] = []
      res.searchApprovedPostals?.forEach((item) => {
        if (item.variants) {
          const neededInfo = {
            marketplaceProductId: item.marketplaceProductId,
            variant: item.variants?.[0].id,
            approvedPostalId: item.id,
          }
          items.push(neededInfo)
        }
      })
      if (items.length >= 4) {
        items.shift()
      }
      const log = Cypress.log({
        name: 'createApprovedPostal',
        displayName: 'Postal',
        message: [`🛍 Creating | Collection`],
      })
      cy.wait(300)
      return cy
        .graphqlRequest(CreateApprovedPostalDocument, {
          marketplaceProductId: items?.[0].marketplaceProductId,
          data: {
            displayName: collectionName,
            name: collectionName,
            status: Status.Active,
            collection: true,
            items: items,
            teamIds: teamsIds,
            version: '2',
          },
        })
        .then((res) => {
          log.set({
            consoleProps() {
              return {
                name: res.createApprovedPostal.postal.name,
                id: res.createApprovedPostal.postal.id,
              }
            },
          })
          log.end()
          return res.createApprovedPostal.postal
        })
    })
})
