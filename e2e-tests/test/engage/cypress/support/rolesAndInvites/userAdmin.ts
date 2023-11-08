import { CampaignStatus, CreateCampaignDocument, InviteDocument } from '../api'
import { userFactory } from '../factories'
export interface seedingUserAdminProps {
  inviteId: string
  userName: string
  accountId: string
  approvedPostalId: string
  approvedVariantId: string
}
Cypress.Commands.add(
  'seedingUserAdmin',
  ({
    inviteId,
    userName,
    accountId,
    approvedPostalId,
    approvedVariantId,
  }: seedingUserAdminProps) => {
    const log = Cypress.log({
      name: 'seedingUserAdmin',
      displayName: 'Seeds',
      message: [`🌱 Seeding | User/Admin`],
      autoEnd: false,
    })
    const newUser = userFactory({
      userName,
      firstName: 'User',
      lastName: 'Admin',
      company: 'UserAdmin',
    })
    cy.completeInvitation({
      id: inviteId,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password: newUser.password,
    })
    cy.login(newUser)

    //User/Admin Made
    cy.createAMessage({
      accountId,
      obj: {
        name: 'Welcome to Permissions Testing^',
        templateText: 'This was made with a user/admin role.',
      },
    })
    cy.createApprovedPostcard({
      name: 'User/Admin approved',
      description: 'User/Admin Role',
    })
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: ['plantDad@postal.dev'], roles: ['USER'] },
    })
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: ['dogDad@postal.dev'], roles: ['ADMIN'] },
    })
    cy.graphqlRequest(InviteDocument, {
      data: { emailAddresses: ['catDad@postal.dev'], roles: ['USER', 'ADMIN'] },
    })
    cy.createAContact({
      tags1: 'cold',
      tags2: 'curtains',
      country: 'United States',
      postalCode: '93401',
      state: 'California',
      city: 'San Luis Obispo',
      address1: '1020 Leff Street',
      address2: '',
      phoneNumber: '780-432-6754',
      phoneType: 'WORK',
      emailAddress: 'velan@postal.com',
      title: 'User/Admin Role',
      lastName: 'AndrewsUP',
      firstName: 'VelmaUP',
    }).then((contact) => {
      const contactId = contact.id
      return cy
        .sendAPostal({ contactId, approvedPostalId, approvedPostalVariantId: approvedVariantId })
        .then(() =>
          cy.graphqlRequest(CreateCampaignDocument, {
            data: {
              name: 'userAdminMade',
              status: CampaignStatus.Scheduled,
              approvedPostalId: approvedPostalId,
              variantId: approvedVariantId,
              giftMessage: '',
              scheduleDate: new Date().toISOString(),
            },
          })
        )
    })
    log.end()
  }
)
