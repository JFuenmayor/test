import { CreateMessageTemplateDocument } from '../api'

Cypress.Commands.add('messagesSeed', () => {
  const names = ['ALERT ALERT', 'Welcome to TESTING']
  const messages = [
    'BIG SALE TODAY! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'TEST! TEST! TEST! TEST! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  ]
  const savedMessages: string[] = []
  const log = Cypress.log({
    name: 'messagesSeed',
    displayName: 'Messages',
    message: [`📟 Creating | ${names.length} messages`],
    autoEnd: false,
  })
  for (let i = 0; i < names.length; i++) {
    cy.graphqlRequest(CreateMessageTemplateDocument, {
      data: {
        name: names[i],
        templateText: messages[i],
      },
    }).then((res) => {
      savedMessages.push(res.createMessageTemplate.id)
    })
  }
  log.set({
    consoleProps() {
      return {
        savedMessages,
      }
    },
  })
  log.end()
})
