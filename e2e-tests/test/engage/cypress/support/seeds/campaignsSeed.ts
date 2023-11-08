import { faker } from '@faker-js/faker'
import {
  BulkContactAddToCampaignDocument,
  CampaignStatus,
  CreateCampaignDocument,
  SearchContactsV2Document,
} from '../api'
export interface campaignsSeedProps {
  approvedPostalId: string
  variantId: string
  numberOfCampaigns?: number
}
Cypress.Commands.add('campaignsSeed', (args: campaignsSeedProps) => {
  const approvedPostalId = args.approvedPostalId
  const variantId = args.variantId
  const numberOfCampaigns = args.numberOfCampaigns
  const todaysdate = new Date().toISOString()
  let contact: any
  let statusTracker: any
  const assignDate = (i: any) => {
    if (i % 2 == 0) {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    } else {
      return todaysdate
    }
  }
  const names = ['First Campaign', 'Second Campaign']
  const campaigns: string[] = []
  let numLoops
  !numberOfCampaigns ? (numLoops = 21) : (numLoops = numberOfCampaigns)

  const status = ['SCHEDULED', 'PENDING', 'PROCESSING', 'CANCELLED', 'ERROR']

  const log = Cypress.log({
    name: 'campaignsSeed',
    displayName: 'Campaigns',
    message: [`🏕️ Creating | ${numLoops} campaigns`],
    autoEnd: false,
  })

  for (let i = 0; i < numLoops; i++) {
    const generateStatus = () => {
      if (i % status.length === 0) {
        statusTracker = 0
      } else {
        statusTracker = statusTracker + 1
      }
      return status[statusTracker] as CampaignStatus
    }
    const generateData = (i: number, fakerfunc: any, arr: any[]) => {
      const generated = i >= 2 ? fakerfunc : arr[i]
      return generated
    }
    cy.graphqlRequest(SearchContactsV2Document, { limit: 1 }).then((res) => {
      contact = res.searchContactsV2?.searchableContacts?.[0]
    })
    cy.graphqlRequest(CreateCampaignDocument, {
      data: {
        name: generateData(i, faker.commerce.productName(), names),
        status: generateStatus(),
        approvedPostalId: approvedPostalId,
        variantId: variantId,
        scheduleDate: assignDate(i),
        deliveryEmail: true,
      },
    }).then((res) => {
      campaigns.push(res.createCampaign.name)
      cy.graphqlRequest(BulkContactAddToCampaignDocument, {
        campaignId: res.createCampaign.id,
        campaignName: res.createCampaign.name,
        v2filter: { id: { in: [contact?.id] } },
      })
    })
  }
  log.set({
    consoleProps() {
      return {
        campaigns,
      }
    },
  })
  log.end()
})
