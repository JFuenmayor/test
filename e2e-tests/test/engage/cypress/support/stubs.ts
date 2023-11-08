/*
  Examples:

  // load the mocks you want to run
  cy.graphqlMockSet({ operationName: 'me', count: 5, fixture: 'meMock.json' })
  cy.graphqlMockSet({ operationName: 'modules', count: 1, response: { data: { modules: [] } } })

  // this starts the route2 listener
  cy.graphqlMockStart()

  ...do some things

  // remove meQuery entirely
  cy.graphqlMockDelete({ operationName: 'me })

  ...do some more things

  // add another one
  cy.graphqlMockSet({ operationName: 'getAccount', count: 1, fixture: 'myAccount.json' })

  // clear all of them
  cy.graphqlMockClear()
*/
interface MockRecord {
  cur: number
  max: number
  fixture?: string
  response?: any
}
const Mocks = new Map<string, MockRecord>()
export interface MockGraphqlProps {
  operationName: string
  count?: number
  fixture?: string
  response?: any
}

Cypress.Commands.add(
  'graphqlMockSet',
  ({ operationName, count = 1, fixture, response }: MockGraphqlProps) => {
    Mocks.set(operationName, { cur: 0, max: count, fixture, response })
  }
)

Cypress.Commands.add('graphqlMockDelete', ({ operationName }: { operationName: string }) => {
  Mocks.delete(operationName)
})

Cypress.Commands.add('graphqlMockClear', () => {
  Mocks.clear()
})

Cypress.Commands.add('graphqlMockStart', () => {
  cy.intercept('/engage/api/graphql', (req) => {
    // test if this is a graphql call, bail if not found
    //const matches = req.body.match(/"operationName":"([\w]+)"/i)
    //if (!matches) return req.reply()

    // find the operationName from the req.body, bail if not found
    const operationName = req.body.operationName
    if (!operationName) return req.reply()

    // check for a registered mock, bail if not found
    const mock = Mocks.get(operationName)
    if (!mock) return req.reply()

    // if too many mocks have run, bail
    if (mock.cur >= mock.max) {
      console.group('skip mock:', operationName)
      console.log(mock)
      console.groupEnd()
      Mocks.delete(operationName)
      return req.reply()
    }

    // mock the response
    Mocks.set(operationName, { ...mock, cur: mock.cur + 1 })
    console.log('mock:', operationName)
    console.log(mock)
    console.groupEnd()
    return req.reply(mock.fixture ? { fixture: mock.fixture } : mock.response)
  })
})
