import { faker } from '@faker-js/faker'
import {
  AddressSource,
  ContactType,
  CreateTagDocument,
  PhoneType,
  UpsertContactDocument,
} from '../api'

Cypress.Commands.add('contactsSeed', (numberOfContacts = 21) => {
  let numLoops: number
  !numberOfContacts ? (numLoops = 21) : (numLoops = numberOfContacts)
  const contacts: string[] = []
  const tags = ['grapes', 'berries']

  const phoneType = (): PhoneType => {
    const types = ['WORK', 'HOME', 'OTHER', 'CELL']
    const ind = Math.floor(Math.random() * (1 - 4) + 4)
    return types[ind] as PhoneType
  }

  const log = Cypress.log({
    name: 'contactsSeed',
    displayName: 'Contacts',
    message: [`📇 Creating | ${numLoops} contacts`],
    autoEnd: false,
  })

  for (let i = 0; i < numLoops; i++) {
    const first: string = faker.person.firstName()
    const last: string = faker.person.lastName()

    const generateData = (i: number, fakerfunc: any, arr: any[]) => {
      const generated = i >= 2 ? fakerfunc : arr[i]
      return generated
    }

    const tag = generateData(i, faker.string.alphanumeric(5), tags)

    cy.graphqlRequest(CreateTagDocument, { data: { name: tag } })
    cy.graphqlRequest(UpsertContactDocument, {
      data: {
        type: ContactType.Contact,
        tags: [tag],
        addresses: [
          {
            preferred: true,
            source: AddressSource.Manual,
            country: 'USA',
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
            city: faker.location.city(),
            address2: faker.location.secondaryAddress(),
            address1: faker.location.streetAddress(),
            entryName: 'Work',
          },
        ],
        phones: [{ phoneNumber: faker.phone.number(), type: phoneType() }],
        emailAddress: `${first}${last}${faker.string.alphanumeric(4)}@postal.dev`,
        companyName: faker.company.name(),
        title: faker.person.jobTitle(),
        lastName: last,
        firstName: first,
      },
    }).then((res) => {
      contacts.push(res.upsertContact.firstName)
      return res.upsertContact
    })
  }
  // wait for elasticsearch to sync
  cy.wait(2500)
  // TODO: remove this when the backend is fixed
  log.set({
    consoleProps() {
      return {
        contacts,
      }
    },
  })
  log.end()
})
