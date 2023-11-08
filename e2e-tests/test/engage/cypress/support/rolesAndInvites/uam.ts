import { onlyOn } from '@cypress/skip-test'
import { faker } from '@faker-js/faker'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  BulkContactAddToPlaybookDocument,
  InviteDocument,
  PaymentPartnerType,
} from '../api'
import { Delivery, MagicLinks, Universal } from '../pageObjects'

Cypress.Commands.add('seedingUAM', seedingUAM)

export interface SeedingUAMResponse {
  user: { email: string; userId: string }
  userManager: { email: string; userManagerId: string }
  admin: { email: string; adminId: string }
  userAdmin: { email: string; userAdminId: string }
  manager: { email: string; managerId: string }
  managerAdmin: { email: string; managerAdminId: string }
  approvedPostalId: string
  approvedVariantId: string
}
function seedingUAM(accountId: string) {
  const delivery = new Delivery()
  const magiclinks = new MagicLinks()
  const universal = new Universal()
  //User Variable
  const user = {} as SeedingUAMResponse['user']
  //userManager Variable
  const userManager = {} as SeedingUAMResponse['userManager']
  //Invited Admin Variable
  const admin = {} as SeedingUAMResponse['admin']
  //Invited User/Admin Variable
  const userAdmin = {} as SeedingUAMResponse['userAdmin']
  //Invited Manager Variable
  const manager = {} as SeedingUAMResponse['manager']
  //Invited Manager Variable
  const managerAdmin = {} as SeedingUAMResponse['managerAdmin']

  //UAM Variables
  //let contactId: string
  let approvedPostalId: string
  let approvedVariantId: string

  const log = Cypress.log({
    name: 'seedingUAM',
    displayName: 'Seeds',
    message: [`🌱 Seeding | UAM`],
    autoEnd: false,
  })
  cy.wait(300)
  cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then((res) => {
    cy.graphqlRequest(AddFundsV2Document, {
      input: {
        billingAccountId: res.billingAccounts?.[0]?.id ?? '',
        amount: 990,
        partnerPaymentMethodId:
          res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
        paymentPartnerType: PaymentPartnerType.Mock,
      },
    })
  })
  cy.createChipotlePostal(1)
  //U/A/M made
  cy.createApprovedPostcard({
    name: 'U/A/M approved',
    description: 'Manager/User/Admin',
  })
    .then((postal) => {
      approvedPostalId = postal.id
      approvedVariantId = postal.variants?.[0].id ?? ''
    })
    .then(() => {
      cy.createAContact({
        tags1: 'cat',
        tags2: 'cat cat',
        country: 'United States',
        postalCode: '93401',
        state: 'California',
        city: 'San Luis Obispo',
        address1: '75 South Higuera St',
        address2: 'Suite 240',
        phoneNumber: '780-432-6754',
        phoneType: 'WORK',
        emailAddress: 'maria@postal.dev',
        title: 'Manager/Admin/User',
        lastName: 'Lara',
        firstName: 'Maria',
      }).then((contact) => {
        cy.sendAPostal({
          contactId: contact.id,
          approvedPostalId,
          approvedPostalVariantId: approvedVariantId,
        })
        cy.wait(300)
        //todo: change to group send
        //cy.createCampaignB('U/A/M Campaign')
        cy.visit('orders/all')
        universal.getSpinner().should('not.exist')
        cy.wait(500)
        cy.get('body').then(($body) => {
          if ($body.text().includes('Back to Home')) {
            cy.wait(300)
            cy.reload()
            cy.wait(600)
          }
        })
        universal.getRowByText('Maria Lara').should('exist')
        cy.magiclinksSeed({ numberOfMagicLinks: 1, requiresApproval: false })
        cy.subscriptionsSeed({
          approvedPostalId: approvedPostalId,
          variantId: approvedVariantId,
          numberOfSubscriptions: 1,
        }).then((resp) => {
          cy.graphqlRequest(BulkContactAddToPlaybookDocument, {
            playbookDefinitionId: resp.createPlaybookDefinition.id,
            ids: [contact.id],
          })
        })
      })
      onlyOn(Cypress.env('testUrl'), () => {
        magiclinks.visitMagicLinks()
        cy.wait(300)
        cy.get('body').then(($body) => {
          if ($body.text().includes('Back to Home')) {
            cy.wait(300)
            cy.reload()
            cy.wait(600)
          }
        })
        universal
          .getRowByNumber(0)
          .find('button')
          .then(($link: any) => {
            delivery.visit($link.attr('title'))
          })
        cy.acceptingMagicLink({ needAddress: true })
        delivery.getSubmitButton().click()
        delivery.getOnTheWayText().should('exist')
      })
      cy.visit('/')
      cy.createAMessage({
        accountId,
        obj: {
          name: 'Welcome to Permissions Testing!!!',
          templateText: 'This was made with a manager/user/admin Role.',
        },
      })
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          roles: ['USER'],
        },
      }).then((res) => {
        user['email'] = res.invite?.[0]?.invite?.emailAddress ?? ''
        user['userId'] = res.invite?.[0]?.invite?.id ?? ''
      })
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          roles: ['USER', 'MANAGER'],
        },
      }).then((res) => {
        userManager['email'] = res.invite?.[0]?.invite?.emailAddress ?? ''
        userManager['userManagerId'] = res.invite?.[0]?.invite?.id ?? ''
      })
      // admin Invite
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          roles: ['ADMIN'],
        },
      }).then((res) => {
        admin['email'] = res.invite?.[0]?.invite?.emailAddress ?? ''
        admin['adminId'] = res.invite?.[0]?.invite?.id ?? ''
      })
      // user/admin Invite
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          roles: ['ADMIN', 'USER'],
        },
      }).then((res) => {
        userAdmin['email'] = res.invite?.[0]?.invite?.emailAddress ?? ''
        userAdmin['userAdminId'] = res.invite?.[0]?.invite?.id ?? ''
      })
      // manager Invite
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          roles: ['MANAGER'],
        },
      }).then((res) => {
        manager['email'] = res.invite?.[0]?.invite?.emailAddress ?? ''
        manager['managerId'] = res.invite?.[0]?.invite?.id ?? ''
      })
      // managerAdmin Invite
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          roles: ['MANAGER', 'ADMIN'],
        },
      })
        .then((res) => {
          managerAdmin['email'] = res.invite?.[0]?.invite?.emailAddress ?? ''
          managerAdmin['managerAdminId'] = res.invite?.[0]?.invite?.id ?? ''
        })
        .then(() => {
          return {
            user,
            userManager,
            admin,
            userAdmin,
            manager,
            managerAdmin,
            approvedPostalId,
            approvedVariantId,
          }
        })
    })
  log.end()
}
