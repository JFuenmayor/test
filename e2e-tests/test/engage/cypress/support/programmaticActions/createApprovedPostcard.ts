import { CreateApprovedPostalDocument, SearchMarketplaceProductsDocument, Status } from '../api'

Cypress.Commands.add('createApprovedPostcard', (obj?: any) => {
  const name = obj ? obj.name : 'Postcard'
  const description = obj ? obj.description : 'Testing'

  return cy
    .graphqlRequest(SearchMarketplaceProductsDocument, { filter: { name: { eq: 'Postcard' } } })
    .then((res) => {
      const postcard = res.searchMarketplaceProducts?.[0]
      const log = Cypress.log({
        name: 'createApprovedPostcard',
        displayName: 'Postal',
        message: [`📬 Creating | Postcard`],
        autoEnd: false,
      })
      return cy
        .graphqlRequest(CreateApprovedPostalDocument, {
          marketplaceProductId: postcard?.id,
          data: {
            name,
            description,
            items: [
              {
                variant: postcard?.variants?.[0].id ?? '',
                marketplaceProductId: postcard?.id ?? '',
              },
            ],
            version: '2',
            status: Status.Active,
            designTemplate: {
              front: [
                {
                  name: 'Text',
                  location: { x: 102, y: 75, width: 200, height: 200 },
                  settings: {
                    randomLeftOffset: true,
                    handwritingName: '${user.handwritingName}',
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'CENTER',
                    color: '#000000',
                    fontSize: 20,
                    spacingModifier: -8,
                    sizeToFit: false,
                    text: 'Testing!!',
                  },
                },
                {
                  name: 'ReservedArea',
                  description: null,
                  hidden: null,
                  locked: true,
                  location: { x: 0, y: 338, width: 625, height: 87 },
                  resize: null,
                  boundary: { minX: 0, minY: 338, maxX: 0, maxY: 338 },
                  settings: null,
                  customizable: null,
                },
                {
                  name: 'ReservedArea',
                  description: null,
                  hidden: null,
                  locked: true,
                  location: { x: 238, y: 113, width: 387, height: 300 },
                  resize: null,
                  boundary: { minX: 238, minY: 113, maxX: 238, maxY: 113 },
                  settings: null,
                  customizable: null,
                },
                {
                  name: 'AddressLabel',
                  description: null,
                  hidden: null,
                  locked: true,
                  location: { x: 325, y: 275, width: 225, height: 50 },
                  resize: null,
                  boundary: { minX: 325, minY: 275, maxX: 325, maxY: 275 },
                  settings: { fontSize: 12.1 },
                  customizable: null,
                },
                {
                  name: 'UspsImb',
                  description: null,
                  hidden: null,
                  locked: true,
                  location: { x: 208, y: 366, width: 325, height: 24 },
                  resize: null,
                  boundary: { minX: 208, minY: 366, maxX: 208, maxY: 366 },
                  settings: null,
                  customizable: null,
                },
                {
                  name: 'Postage',
                  description: null,
                  hidden: null,
                  locked: true,
                  location: { x: 524, y: 37, width: 64, height: 56 },
                  resize: null,
                  boundary: { minX: 524, minY: 37, maxX: 524, maxY: 400 },
                  settings: null,
                  customizable: null,
                },
              ],
              back: [
                {
                  name: 'Text',
                  location: { x: 13, y: 12, width: 597, height: 397 },
                  settings: {
                    randomLeftOffset: true,
                    handwritingName: '${user.handwritingName}',
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'CENTER',
                    color: '#000000',
                    fontSize: 39.01,
                    spacingModifier: -8,
                    sizeToFit: false,
                    text: 'Testing!!!',
                  },
                },
              ],
              dpi: 400,
              outputSize: { width: 2500, height: 1700 },
            },
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
