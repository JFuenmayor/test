import { CreateMessageTemplateDocument, LinkType } from '../../api'

export interface createAMessageProps {
  accountId: string
  obj: objProps
}

interface objProps {
  name: string
  templateText: string
}

Cypress.Commands.add('createAMessage', (args: createAMessageProps) => {
  const accountId = args.accountId
  const obj = args.obj
  return cy
    .graphqlRequest(CreateMessageTemplateDocument, {
      data: {
        name: obj.name,
        templateText: obj.templateText,
        sharedWith: { type: LinkType.Account, target: accountId },
      },
    })
    .then((res) => res.createMessageTemplate)
})
