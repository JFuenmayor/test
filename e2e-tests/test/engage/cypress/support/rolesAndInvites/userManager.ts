import { CampaignStatus, CreateCampaignDocument } from '../api'
import { userFactory } from '../factories'

export interface seedingUserManagerProps {
  inviteId: string
  userName: string
  approvedPostalId: string
  approvedVariantId: string
}
Cypress.Commands.add(
  'seedingUserManager',
  ({ inviteId, userName, approvedPostalId, approvedVariantId }: seedingUserManagerProps) => {
    let contactId: string
    const log = Cypress.log({
      name: 'seedingUserManager',
      displayName: 'Seeds',
      message: [`🌱 Seeding | User/Manager`],
      autoEnd: false,
    })
    const newUser = userFactory({
      userName,
      firstName: 'User',
      lastName: 'Manager',
      password: Cypress.env('basePassword'),
      company: 'UserAdmin',
    })
    cy.completeInvitation({
      id: inviteId,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password: newUser.password,
    })
    cy.login(newUser)

    //UserManager Made
    cy.createAContact({
      tags1: 'haha',
      tags2: 'jk',
      country: 'United States',
      postalCode: '93401',
      state: 'California',
      city: 'San Luis Obispo',
      address1: '1021 Leff Street',
      address2: '',
      phoneNumber: '780-432-6767',
      phoneType: 'WORK',
      emailAddress: 'tfauci@postal.com',
      title: 'User/Manager Role',
      lastName: 'FauciUP',
      firstName: 'TonyUP ',
    })
      .then((contact) => (contactId = contact.id))
      .then(() =>
        cy.sendAPostal({ contactId, approvedPostalId, approvedPostalVariantId: approvedVariantId })
      )
      .then(() =>
        cy.graphqlRequest(CreateCampaignDocument, {
          data: {
            name: 'UserManagerMade',
            status: CampaignStatus.Scheduled,
            approvedPostalId: approvedPostalId,
            variantId: approvedVariantId,
            giftMessage: '',
            scheduleDate: new Date().toISOString(),
          },
        })
      )
    log.end()
  }
)
