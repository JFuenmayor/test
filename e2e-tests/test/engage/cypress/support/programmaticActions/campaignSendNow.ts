import { subMinutes } from 'date-fns'
import {
  BulkContactAddToCampaignDocument,
  CampaignStatus,
  CreateCampaignDocument,
  SearchContactsV2Document,
} from '../api'
Cypress.Commands.add('campaignSendNow', () => {
  let campaignId: any
  cy.createChipotlePostal().then((res) => {
    cy.graphqlRequest(CreateCampaignDocument, {
      data: {
        name: 'Campaign 11/9/2020',
        status: CampaignStatus.Scheduled,
        approvedPostalId: res.id,
        variantId: res.variants?.[0].id,
        giftMessage: 'yum',
        scheduleDate: subMinutes(new Date(), 5).toISOString(),
      },
    }).then((res) => {
      campaignId = res.createCampaign.id
      cy.graphqlRequest(SearchContactsV2Document).then((res) => {
        const contactId = res.searchContactsV2.searchableContacts?.[0]?.id
        if (contactId) {
          cy.graphqlRequest(BulkContactAddToCampaignDocument, {
            campaignId: campaignId,
            campaignName: 'Campaign 11/9/2020',
            ids: [contactId],
          })
        }
      })
    })
  })
})
