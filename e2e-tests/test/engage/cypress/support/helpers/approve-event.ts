export type ApproveEventResponse = {
  id: string
  accountId: string
  status: string
  event: {
    status: string
    [key: string]: any
  }
  [key: string]: any
}

function approveEvent(eventId: string, status = 'ACCEPTING_INVITES') {
  return cy
    .request({
      log: false,
      method: 'POST',
      url: '/engage/api/test-helpers',
      body: { intent: 'event-status', eventId, status },
    })
    .then((res) => {
      const postal = res.body.postal
      return {
        id: postal._id.$oid,
        accountId: postal.accountId.$oid,
        status: postal.status,
        event: {
          status: postal.event.status,
        },
      }
    })
}

Cypress.Commands.add('approveEvent', approveEvent)
