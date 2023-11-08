import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode, OperationDefinitionNode, print, visit } from 'graphql'
import jwtDecode from 'jwt-decode'
export * from '../../../../../../engage-app/app/graphql'

const TOKEN_KEY = 'postal:token'
const REFRESH_TOKEN_KEY = 'postal:refreshToken'
const PRODUCT = 'POSTAL_IO_APP'
const SITE_VERIFY = 'CLOONEY'

const getSiteVerify = (id: string) => `${SITE_VERIFY}-${id}`

Cypress.Commands.add('logToken', () => {
  cy.getToken().then((token) => {
    const decoded = (token ? jwtDecode(token) : {}) as any
    Cypress.log({ name: 'logToken', message: token, consoleProps: () => decoded })
  })
})

Cypress.Commands.add('logRefreshToken', () => {
  cy.getToken().then((token) => {
    const decoded = (token ? jwtDecode(token) : {}) as any
    Cypress.log({ name: 'logRefreshToken', message: token, consoleProps: () => decoded })
  })
})

Cypress.Commands.add('saveSession', ({ token, refreshToken } = {}) => {
  return cy.window({ log: false }).then((window) => {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token)
    if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    return cy.saveLocalStorageCache().then(() => ({ token, refreshToken }))
  })
})

Cypress.Commands.add('getRefreshToken', () => {
  return cy.window({ log: false }).then((window) => {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? ''
  })
})

Cypress.Commands.add('getToken', () => {
  return cy.window({ log: false }).then((window) => {
    return window.sessionStorage.getItem(TOKEN_KEY) ?? ''
  })
})

Cypress.Commands.add('sessionLogoutApi', () => {
  cy.getToken().then({ timeout: 60000 }, (token) =>
    cy.request({
      log: false,
      method: 'POST',
      url: '/api/session/logout',
      headers: { Authorization: `Bearer ${token}` },
      body: {},
    })
  )
})

Cypress.Commands.add('signupNewApi', ({ firstName, lastName, userName, password }) => {
  const options = {
    log: false,
    method: 'POST',
    url: '/api/signup/new',
    body: {
      firstName,
      lastName,
      userName,
      emailAddress: userName,
      siteVerify: getSiteVerify(userName),
      password,
      password2: password,
      product: PRODUCT,
    },
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true,
    timeout: 200000,
  }
  return cy.request(options).then((res) => res.body)
})

Cypress.Commands.add('signupVerifyApi', (id) => {
  const options = {
    log: false,
    method: 'POST',
    url: '/api/signup/verify',
    body: { requestId: getSiteVerify(id), siteVerify: getSiteVerify(id) },
  }
  return cy.request(options).then((res) => cy.saveSession(res.body).then(() => res.body))
})

Cypress.Commands.add('inviteInfoApi', (id: string) => {
  const options = {
    log: false,
    method: 'GET',
    url: `/api/invite/${id}`,
  }
  return cy.request(options).then((res) => res.body)
})

export interface CompleteInvitationProps {
  id: string
  firstName: string
  lastName: string
  password: string
}
Cypress.Commands.add(
  'completeInvitation',
  ({ id, firstName, lastName, password }: CompleteInvitationProps, skipPassword = false) => {
    const siteVerify = getSiteVerify(id)

    const options = {
      method: 'POST',
      url: `https://test.postal.dev/api/invite/complete`,
      body: { id, firstName, lastName, siteVerify },
    }
    return cy.request(options).then((res) => {
      if (skipPassword) return res.body

      const token = res.body.token
      const options = {
        method: 'POST',
        url: `https://test.postal.dev/api/signup/password`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          password: password,
          password2: password,
          product: PRODUCT,
          siteVerify,
        },
      }
      return cy.request(options).then((res) => res.body)
    })
  }
)

Cypress.Commands.add('inviteCompleteApi', (id: string, firstName: string, lastName: string) => {
  const options = {
    log: false,
    method: 'POST',
    url: '/api/invite/complete',
    body: { id, firstName, lastName },
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true,
    timeout: 200000,
  }
  return cy.request(options).then((res) => cy.saveSession(res.body).then(() => res.body))
})

Cypress.Commands.add('signupPasswordApi', (id, password) => {
  return cy.getToken().then((token) => {
    const options = {
      method: 'POST',
      url: '/api/signup/password',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        password: password,
        password2: password,
        product: PRODUCT,
        siteVerify: getSiteVerify(id),
      },
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
    }
    return cy.request(options).then((res) => cy.saveSession(res.body).then(() => res.body))
  })
})

Cypress.Commands.add(
  'authPasswordApi',
  ({ userName, password }: { userName: string; password: string }) => {
    const options = {
      log: false,
      method: 'POST',
      url: '/api/auth/password',
      body: { userName, password, product: PRODUCT },
    }
    return cy.request(options).then((res) => cy.saveSession(res.body).then(() => res.body))
  }
)

Cypress.Commands.add('sessionAccessTokenApi', () => {
  return cy.getRefreshToken().then((token) => {
    const options = {
      log: false,
      method: 'POST',
      url: '/api/session/accesstoken',
      headers: { Authorization: `Bearer ${token}` },
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
      timeout: 200000,
    }
    return cy.request(options).then((res) => cy.saveSession(res.body).then(() => res.body))
  })
})

const getOperationName = (query: DocumentNode) => {
  let operationName
  visit(query, {
    OperationDefinition(node: OperationDefinitionNode) {
      operationName = node.name?.value
    },
  })
  return operationName
}

function getGraphqlUrl() {
  return cy.url().then((url) => {
    return url.match(/\/extension\//) ? '/extension/api/graphql' : '/engage/api/graphql'
  })
}

Cypress.Commands.add(
  'graphqlRequest',
  <TData = any, TVariables = Record<string, any>>(
    operation: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    options?: Partial<Cypress.RequestOptions>
  ) => {
    const operationName = getOperationName(operation) || ''
    const query = print(operation)
    const defaultOptions = {
      failOnStatusCode: true,
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
      method: 'POST',
      ...options,
    }
    // return cy.getToken().then((token) => {
    return cy.window().then((win) => {
      const csrfToken = win.localStorage.getItem('csrfToken')
      return getGraphqlUrl().then((url) => {
        return cy
          .request({
            ...defaultOptions,
            ...options,
            url,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ operationName, query, variables }),
          })
          .then((res) => {
            return new Cypress.Promise((resolve, reject) => {
              if (res.body.errors) reject(res.body.errors)
              resolve(res.body.data as TData)
            })
          })
      })
    })
  }
)

Cypress.Commands.add(
  'fetchGqlAdmin',
  <TData = any, TVariables = Record<string, any>>(
    operation: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    options?: Partial<Cypress.RequestOptions>
  ) => {
    const operationName = getOperationName(operation) || ''
    const query = print(operation)
    const defaultOptions = {
      failOnStatusCode: true,
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
      method: 'POST',
      ...options,
    }
    const url = new URL('/e2e-api/admin/graphql', Cypress.env('testUrl'))
    return cy
      .request({
        ...defaultOptions,
        ...options,
        url: url.toString(),
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${Cypress.env('auth_param')}`,
        },
        body: JSON.stringify({ operationName, query, variables }),
      })
      .then((res) => {
        return new Cypress.Promise((resolve, reject) => {
          if (res.body.errors) reject(res.body.errors)
          resolve(res.body.data as TData)
        })
      })
  }
)
