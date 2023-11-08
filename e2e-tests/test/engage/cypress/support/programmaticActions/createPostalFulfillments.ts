import { faker } from '@faker-js/faker'
import {
  CreateApprovedPostalDocument,
  OrderPostalDocument,
  SearchMarketplaceProductsDocument,
  Status,
} from '../api'

let products: any[]
let contact: any
const approvedPostals: any[] = []
const postalFulfillments: any[] = []
const first = faker.person.firstName()
const last = faker.helpers.slugify(faker.person.lastName())

//only enter a name or a number of Postals, not both
export interface createPostalFulfillmentsProps {
  numberOf?: number
  name?: string
}

Cypress.Commands.add('createPostalFulfillments', (args: createPostalFulfillmentsProps) => {
  const name = args.name
  const numApprovedPostals = args.numberOf
  return (
    cy
      //creates a contact with a valid address
      .createAContact({
        tags1: 'york',
        tags2: 'whale',
        country: 'United States',
        postalCode: '93401',
        state: 'California',
        city: 'San Luis Obispo',
        address1: '3963 Kilbern Way',
        phoneNumber: '780-432-6754',
        phoneType: 'WORK',
        emailAddress: `${first}${last}${faker.string.alphanumeric(4)}@postal.dev`,
        title: 'whale of a tale',
        lastName: last,
        firstName: first,
      })
      .then((_contact) => (contact = _contact))

      // get and save products
      .then(() =>
        //grabs products by the category. swag is currently returning three products,
        //and all below 100 dollars so they should not blow through the default budget/balance of 500
        cy
          .graphqlRequest(SearchMarketplaceProductsDocument, {
            filter: { category: { eq: 'Direct Mail' } },
          })
          .then((res) => (products = res.searchMarketplaceProducts || []))
      )

      // create approved postals
      .then(() => {
        if (name) {
          const productsB = products.filter((product) => product.name === name)
          Cypress.Promise.all(
            productsB.map((product) => {
              return cy
                .graphqlRequest(CreateApprovedPostalDocument, {
                  marketplaceProductId: product.id,
                  data: {
                    name: product.name,
                    description: product.description,
                    status: Status.Active,
                    items: [{ variant: product.variants[0].id, marketplaceProductId: product.id }],
                    version: '2',
                  },
                })
                .then((res) => approvedPostals.push(res.createApprovedPostal.postal))
            })
          )
        } else if (numApprovedPostals) {
          const productsB = products.filter((product) => product.name !== 'thing2')
          Cypress.Promise.all(
            productsB.slice(0, numApprovedPostals).map((product) => {
              return cy
                .graphqlRequest(CreateApprovedPostalDocument, {
                  marketplaceProductId: product.id,
                  data: {
                    name: product.name,
                    description: product.description,
                    status: Status.Active,
                    items: [{ variant: product.variants[0].id, marketplaceProductId: product.id }],
                    version: '2',
                  },
                })
                .then((res) => approvedPostals.push(res.createApprovedPostal.postal))
            })
          )
        }
      })
      // create postal fulfillments
      .then(() => {
        approvedPostals.map((postal) => {
          const variant = postal.variants[Math.floor(Math.random() * postal.variants.length || 0)]
          cy.graphqlRequest(OrderPostalDocument, {
            data: {
              approvedPostalId: postal.id,
              approvedPostalVariantId: variant.id,
              contactId: contact.id,
              giftMessage: 'fake gift message',
              skipDuplicateOrderCheck: true,
              deliveryEmail: true,
            },
          }).then((res) => {
            postalFulfillments.push(res.orderPostal)
          })
        })
      })
      // return array of postal fulfillments
      .then(() => {
        return { postalFulfillments, first, last }
      })
  )
})
