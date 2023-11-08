import { signup } from '../helpers'
const BASE_API_URL = 'https://test.postal.dev'

export interface signUpProps {
  user: any
  page: any
}

export const signUpViaApi = async (args: signUpProps) => {
  const page = args.page

  await signup(args.user, page)
  const me = await page.request.post(`${BASE_API_URL}/engage/api/test-helpers`, {
    data: { intent: 'current-user' },
  })
  const meText = await me.text()
  const meData = await JSON.parse(meText)
  const userId = await meData.userId
  const param = process.env.AUTH_PARAM
  await page.request.post(`${BASE_API_URL}/api/accounts/test/roles/assign?auth_param=${param}`, {
    headers: {
      'content-type': 'application/json',
    },
    data: {
      product: 'POSTAL_IO_VENDOR',
      partnerId: '000000000000000000000004',
      accountId: null,
      teamId: null,
      userId: await userId,
      actor: 'TEST',
      roles: ['USER', 'ADMIN', 'MANAGER'],
      removeProductAccess: false,
      sendNotifications: true,
    },
  })
}
