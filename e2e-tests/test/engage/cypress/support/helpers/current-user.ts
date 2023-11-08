import { UserSession } from '../../../../../../engage-app/app/lib/session-types'

export type CurrentUserResponse = UserSession & { csrfToken: string | undefined }

function currentUser() {
  return cy
    .request({
      method: 'POST',
      url: '/engage/api/test-helpers',
      body: { intent: 'current-user' },
      retryOnNetworkFailure: true,
      retryOnStatusCodeFailure: true,
    })
    .then((res) => {
      return res.body
    })
}

Cypress.Commands.add('currentUser', currentUser)

function currentUserExtension() {
  return cy
    .request({
      method: 'POST',
      url: '/extension/api/test-helpers',
      body: { intent: 'current-user' },
    })
    .then((res) => {
      return res.body
    })
}

Cypress.Commands.add('currentUserExtension', currentUserExtension)
