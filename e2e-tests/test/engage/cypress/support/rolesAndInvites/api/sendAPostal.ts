import { OrderPostalDocument } from '../../api'

export interface sendAPostalProps {
  contactId: string
  approvedPostalId: string
  approvedPostalVariantId: string
}
Cypress.Commands.add('sendAPostal', (args: sendAPostalProps) => {
  const contactId = args.contactId
  const approvedPostalId = args.approvedPostalId
  const approvedPostalVariantId = args.approvedPostalVariantId
  return cy
    .graphqlRequest(OrderPostalDocument, {
      data: {
        approvedPostalId: approvedPostalId,
        approvedPostalVariantId: approvedPostalVariantId,
        contactId: contactId,
        giftMessage: '',
        deliveryEmail: false,
      },
    })
    .then((res) => res.orderPostal)
})
