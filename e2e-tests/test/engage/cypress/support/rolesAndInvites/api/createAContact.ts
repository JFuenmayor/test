import { faker } from '@faker-js/faker'
import { AddressSource, ContactType, PhoneType, UpsertContactDocument } from '../../api'

export interface createAContactProps {
  emailAddress?: string
  firstName?: string
  lastName?: string
  address1?: string
  address2?: string
  city?: string
  postalCode?: string
  state?: string
  country?: string
  phoneNumber?: string
  phoneType?: string | any
  company?: string
  title?: string
  tags1?: string | any
  tags2?: string | any
  tags?: string[]
}
// use this if you want to create a contact with a verified address
// note that some fields don't have to be passed and their defaults (SLO city, address, and zip for ex)
// a good strategy is to pass in specific rather than random info when you want to test that that info renders correctly
// else use the randomized and default info here

Cypress.Commands.add('createAContact', (args: createAContactProps) => {
  const email = args.emailAddress ? args.emailAddress : `${faker.string.uuid()}@postal.dev`
  const firstName = args.firstName ? args.firstName : faker.person.firstName()
  const lastName = args.lastName ? args.lastName : faker.person.lastName()
  const address1 = args.address1 ? args.address1 : '3963 Kilbern Way'
  const address2 = args.address2
  const city = args.city ? args.city : 'San Luis Obispo'
  const state = args.state ? args.state : 'CA'
  const zip = args.postalCode ? args.postalCode : '93401'
  const country = args.country ? args.country : 'US'
  const phoneNumber = args.phoneNumber ? args.phoneNumber : faker.phone.number()
  const phoneType = args.phoneType
    ? args.phoneType
    : faker.helpers.arrayElement([PhoneType.Cell, PhoneType.Home, PhoneType.Other, PhoneType.Work])
  const company = args.company ? args.company : faker.company.name()
  const title = args.title ? args.title : faker.person.jobTitle()

  const tags = args.tags1 ? args.tags1 : args.tags1 && args.tags2 ? [args.tags1, args.tags2] : []

  return cy
    .graphqlRequest(UpsertContactDocument, {
      data: {
        type: ContactType.Contact,
        tags,
        addresses: [
          {
            preferred: true,
            source: AddressSource.Manual,
            country: country,
            postalCode: zip,
            state: state,
            city: city,
            address2: address2,
            address1: address1,
            entryName: '',
          },
        ],
        phones: [{ phoneNumber: phoneNumber, type: phoneType }],
        emailAddress: email,
        companyName: company,
        title: title,
        lastName: lastName,
        firstName: firstName,
      },
    })
    .then((res) => res.upsertContact)
})
