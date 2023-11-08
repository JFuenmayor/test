import { faker } from '@faker-js/faker'
import {
  AddressSource,
  ContactType,
  CreateTagDocument,
  PhoneType,
  UpsertContactDocument,
} from '../api'

export interface nonRandomContactsSeedProps {
  numOfNonRandomContacts?: number
}

Cypress.Commands.add('nonRandomContactsSeed', (args: nonRandomContactsSeedProps) => {
  let numLoops: number
  !args.numOfNonRandomContacts ? (numLoops = 21) : (numLoops = args.numOfNonRandomContacts)
  const contacts: string[] = []
  const tags = ['coffee', 'arrowhead']

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

  const firstNames = [
    'Roxanne',
    'Elinore',
    'Amir',
    'Anthony',
    'Frederico',
    'Prince',
    'Carissa',
    'Jettie',
    'Gillian',
    'Angelica',
  ]
  const lastNames = [
    'Medherst',
    'Von',
    'Murphy',
    'Hane',
    'Bogisich',
    'Schroeder',
    'Kertzmann',
    'Legros',
    'Breitenberg',
    'Leuschke',
  ]

  for (let i = 0; i < numLoops; i++) {
    const first: string = firstNames[i]
    const last: string = lastNames[i]

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
