//only used in the postalSendMachine right now since all it really
//does is update an approved Postal so that it will contain a
//user message
//
// NOTE: Maybe we can simplify this to just call the updateApprovedPostalApi call

import { ApprovedPostal, Status, UpdateApprovedPostalDocument } from '../api'

export interface addApprovedPostalUserMessageProps {
  postalId: string
  variantId: string
}

// and merge the existing postal with an updated userMessage
Cypress.Commands.add('addApprovedPostalUserMessage', (args: addApprovedPostalUserMessageProps) => {
  const postalId = args.postalId
  const variantId = args.variantId

  const log = Cypress.log({
    name: 'addApprovedPostalUserMessage',
    displayName: 'Postal',
    message: [`📬 Creating | Postcard with User Message`],
    autoEnd: false,
  })
  return cy
    .graphqlRequest(UpdateApprovedPostalDocument, {
      id: postalId,
      data: {
        name: 'Postcard',
        description: 'Provide your own design on this 4"x6" Postcard',
        status: Status.Active,
        designTemplate: {
          front: [
            {
              name: 'Text',
              description: null,
              hidden: null,
              locked: null,
              location: { x: 102, y: 75, width: 200, height: 200 },
              resize: null,
              boundary: null,
              settings: {
                randomLeftOffset: true,
                handwritingName: '${user.handwritingName}',
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'CENTER',
                color: '#000000',
                fontSize: 20,
                spacingModifier: -8,
                sizeToFit: false,
                text: 'Testing!!',
              },
              customizable: null,
            },
            {
              name: 'ReservedArea',
              description: null,
              hidden: null,
              locked: true,
              location: { x: 0, y: 338, width: 625, height: 87 },
              resize: null,
              boundary: { minX: 0, minY: 338, maxX: 0, maxY: 338 },
              settings: null,
              customizable: null,
            },
            {
              name: 'ReservedArea',
              description: null,
              hidden: null,
              locked: true,
              location: { x: 238, y: 113, width: 387, height: 300 },
              resize: null,
              boundary: { minX: 238, minY: 113, maxX: 238, maxY: 113 },
              settings: null,
              customizable: null,
            },
            {
              name: 'AddressLabel',
              description: null,
              hidden: null,
              locked: true,
              location: { x: 325, y: 275, width: 225, height: 50 },
              resize: null,
              boundary: { minX: 325, minY: 275, maxX: 325, maxY: 275 },
              settings: { fontSize: 12.1 },
              customizable: null,
            },
            {
              name: 'UspsImb',
              description: null,
              hidden: null,
              locked: true,
              location: { x: 208, y: 366, width: 325, height: 24 },
              resize: null,
              boundary: { minX: 208, minY: 366, maxX: 208, maxY: 366 },
              settings: null,
              customizable: null,
            },
            {
              name: 'Postage',
              description: null,
              hidden: null,
              locked: true,
              location: { x: 524, y: 37, width: 64, height: 56 },
              resize: null,
              boundary: { minX: 524, minY: 37, maxX: 524, maxY: 400 },
              settings: null,
              customizable: null,
            },
          ],
          back: [
            {
              name: 'Text',
              description: null,
              hidden: null,
              locked: null,
              location: { x: 13, y: 12, width: 597, height: 397 },
              resize: null,
              boundary: null,
              settings: {
                randomLeftOffset: true,
                handwritingName: '${user.handwritingName}',
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'CENTER',
                color: '#000000',
                fontSize: 39.01,
                spacingModifier: -8,
                sizeToFit: false,
                text: 'Testing!!!',
              },
              customizable: null,
            },
            {
              name: 'UserMessage',
              location: { x: 396, y: 200, width: 200, height: 200 },
              settings: {
                randomLeftOffset: true,
                handwritingName: '${user.handwritingName}',
                horizontalAlignment: 'LEFT',
                verticalAlignment: 'TOP',
                color: '#000000',
                fontSize: 20,
                spacingModifier: -8,
                sizeToFit: true,
                text: '${userMessage}',
              },
            },
          ],
          dpi: 400,
          outputSize: { width: 2500, height: 1700 },
        },
        variants: [variantId],
      },
    })
    .then((res) => {
      log.end()
      return res.updateApprovedPostal as unknown as ApprovedPostal
    })
})
