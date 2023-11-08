import { CampaignStatus, CreateCampaignDocument } from '../api'
import { userFactory } from '../factories'
export interface seedingUserProps {
  inviteId: string
  userName: string
  approvedPostalId: string
  approvedVariantId: string
}
Cypress.Commands.add(
  'seedingUser',
  ({ inviteId, userName, approvedPostalId, approvedVariantId }: seedingUserProps) => {
    const log = Cypress.log({
      name: 'seedingUser',
      displayName: 'Seeds',
      message: [`🌱 Seeding | User`],
      autoEnd: false,
    })
    const newUser = userFactory({
      userName,
      firstName: 'Hannah',
      lastName: 'Huser',
      company: 'HannahHuser',
    })
    cy.completeInvitation({
      id: inviteId,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password: newUser.password,
    })
    cy.login(newUser)
    //User Made
    cy.createAContact({
      tags1: 'cat',
      tags2: 'kitten',
      country: 'United States',
      postalCode: '93401',
      state: 'California',
      city: 'San Luis Obispo',
      address1: '855 Humbert Ave',
      address2: '',
      phoneNumber: '780-432-6754',
      phoneType: 'WORK',
      emailAddress: 'vlee@postal.com',
      title: 'User Role',
      lastName: 'LeeUp',
      firstName: 'VivianUp',
    })
      .then((contact) => {
        const contactId: string = contact.id
        return cy.sendAPostal({
          contactId,
          approvedPostalId,
          approvedPostalVariantId: approvedVariantId,
        })
      })
      .then(() => {
        return cy.graphqlRequest(CreateCampaignDocument, {
          data: {
            name: 'UserMade',
            status: CampaignStatus.Scheduled,
            approvedPostalId: approvedPostalId,
            variantId: approvedVariantId,
            giftMessage: '',
            scheduleDate: new Date().toISOString(),
          },
        })
      })
      .then(() => {
        return newUser
      })
    log.end()
  }
)
