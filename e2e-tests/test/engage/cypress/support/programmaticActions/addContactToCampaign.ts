import {
  BulkContactAddToCampaignDocument,
  CampaignType,
  SearchCampaignsDocument,
  SearchContactsV2Document,
} from '../api'

Cypress.Commands.add('addContactToCampaignA', () => {
  let campaignId: string
  return cy
    .graphqlRequest(SearchCampaignsDocument, {
      filter: { name: { contains: 'Second' }, campaignType: { in: [CampaignType.Engage, null] } },
    })
    .then((res) => {
      campaignId = res.searchCampaigns?.[0].id as string
      return cy.graphqlRequest(SearchContactsV2Document, { limit: 1 }).then((res) => {
        const contact = res.searchContactsV2?.searchableContacts?.[0]
        return cy
          .graphqlRequest(BulkContactAddToCampaignDocument, {
            campaignId: `${campaignId}`,
            campaignName: 'Second Campaign',
            v2filter: { id: { in: [contact?.id as string] } },
          })
          .then((res) => res.bulkContactAddToCampaign)
      })
    })
})
