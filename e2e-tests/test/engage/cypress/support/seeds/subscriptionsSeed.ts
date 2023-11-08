import { faker } from '@faker-js/faker'
import { ChronoUnit, CreatePlaybookDefinitionDocument, PlaybookStepType, Status } from '../api'
export interface subscriptionsSeedProps {
  approvedPostalId: string
  variantId: string
  numberOfSubscriptions?: number
}
Cypress.Commands.add('subscriptionsSeed', (args: subscriptionsSeedProps) => {
  const approvedPostalId = args.approvedPostalId
  const variantId = args.variantId
  const numberOfSubscriptions = args.numberOfSubscriptions
  const names = ['Subscription One', 'Subscription Two']
  const playbooks: string[] = []
  let numLoops
  !numberOfSubscriptions ? (numLoops = 21) : (numLoops = numberOfSubscriptions)

  const log = Cypress.log({
    name: 'SubscriptionsSeed',
    displayName: 'Playbooks',
    message: [`🏕️ Creating | ${numLoops} subcriptions`],
    autoEnd: false,
  })

  for (let i = 0; i < numLoops; i++) {
    const generateData = (i: number, fakerfunc: any, arr: any[]) => {
      const generated = i >= 2 ? fakerfunc : arr[i]
      return generated
    }
    cy.graphqlRequest(CreatePlaybookDefinitionDocument, {
      data: {
        name: generateData(i, faker.commerce.productName(), names),
        status: Status.Active,
        steps: [
          {
            type: PlaybookStepType.Order,
            delay: 0,
            delayUnit: ChronoUnit.Days,
            approvedPostalId: approvedPostalId,
            variantId: variantId,
            deliveryEmail: true,
            giftMessage: 'm,mm',
            displayPrice: 500,
            displaySubscriberPrice: 500,
          },
        ],
      },
    }).then((res) => {
      playbooks.push(res.createPlaybookDefinition.name || 'N/A')
    })
  }
  log.set({
    consoleProps() {
      return {
        playbooks,
      }
    },
  })
  log.end()
})
