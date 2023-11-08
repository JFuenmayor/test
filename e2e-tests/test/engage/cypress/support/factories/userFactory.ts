import { faker } from '@faker-js/faker'

export interface FakeUser {
  firstName: string
  lastName: string
  userName: string
  password: string
  company: string
  title: string
  phoneNumber: string
}

type UserFactoryProps = Partial<FakeUser>

export function userFactory(user?: UserFactoryProps) {
  return {
    firstName: user?.firstName || faker.person.firstName(),
    lastName: user?.lastName || faker.person.lastName(),
    userName: user?.userName || `${faker.string.uuid()}@postal.dev`,
    password: user?.password || Cypress.env('basePassword'),
    company: user?.company || faker.company.name(),
    title: user?.title || faker.person.jobTitle(),
    phoneNumber: user?.phoneNumber || faker.phone.number(),
  }
}
