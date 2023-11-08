import { signup } from '../helpers'
const apiURL = 'https://test.postal.dev'
export interface signUpProps {
  user: any
  page: any
}

export const signUpViaApi = async (args: signUpProps) => {
  const page = args.page
  await signup(args.user, page)
  const me = await page.request.post(`${apiURL}/engage/api/test-helpers`, {
    data: { intent: 'current-user' },
  })
  const meText = await me.text()
  const meData = await JSON.parse(meText)
  const userId = await meData.userId
  const accountId = await meData.accountId
  const param = process.env.AUTH_PARAM
  await page.request.post(
    `${apiURL}/api/accounts/test/subscriptioninfo/${accountId}/update?auth_param=${param}`,
    {
      headers: {
        'content-type': 'application/json',
      },
      data: {
        postalPlan: 'POSTAL_ENTERPRISE',
      },
    }
  )
  await page.request.post(`${apiURL}/api/accounts/test/roles/assign?auth_param=${param}`, {
    headers: {
      'content-type': 'application/json',
    },
    data: {
      product: 'POSTAL_IO_STORE',
      //partnerId: '000000000000000000000004',
      accountId: accountId,
      // teamId: null,
      userId: userId,
      actor: 'TEST',
      roles: ['USER', 'ADMIN'],
      type: 'ACCOUNT',
      //removeProductAccess: false,
      //sendNotifications: true,
    },
  })
}
