import {
  ApprovedPostal,
  CreateMagicLinkDocument,
  MagicLinkStatus,
  SearchApprovedPostalsDocument,
} from '../api'

export interface magiclinksSeedProps {
  requiresApproval: 'random' | boolean
  numberOfMagicLinks?: number
}

Cypress.Commands.add('magiclinksSeed', (args: magiclinksSeedProps) => {
  const requiresApproval = args.requiresApproval
  const numberOfMagicLinks = args.numberOfMagicLinks
  let numLoops: number
  !numberOfMagicLinks ? (numLoops = 12) : (numLoops = numberOfMagicLinks)

  const log = Cypress.log({
    name: 'magicLinksSeed',
    displayName: 'MagicLinks',
    message: [`🧑🏿‍🤝‍🧑🏾 Creating | ${numLoops} magiclinks`],
    autoEnd: false,
  })

  const assignDate = (i: any) => {
    if (i % 2 == 0) {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    } else {
      return '2021-01-12T08:00:00.000Z'
    }
  }

  const assignApproval = (i: any) => {
    if (requiresApproval === 'random') {
      if (i % 2 == 0) {
        return true
      } else {
        return false
      }
    } else {
      return requiresApproval
    }
  }

  cy.graphqlRequest(SearchApprovedPostalsDocument, {
    filter: { status: { eq: 'ACTIVE' }, name: { ne: 'Chipotle' } },
    limit: 20,
  }).then((response) => {
    const postal = response.searchApprovedPostals?.[0] as ApprovedPostal

    const approvedPostalId: string = postal?.id
    const variantId: string = postal?.variants?.[0]?.id ?? ''

    for (let i = 0; i < numLoops; i++) {
      cy.graphqlRequest(CreateMagicLinkDocument, {
        data: {
          name: `MagicLink ${i}`,
          status: MagicLinkStatus.Active,
          maxExecutions: i + 1,
          message: '',
          approvedPostalId: approvedPostalId,
          variantId: variantId,
          expirationDate: assignDate(i),
          requiresApproval: assignApproval(i),
        },
      })
    }
  })
  log.end()
})
