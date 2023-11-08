import { test } from '@playwright/test'
import { userFactory } from './support/factories/user-factory'
import { SignUpIn } from './support/pageObjects'
const newUser: any = userFactory()
// @generateUser @login
// Feature: Login dynamically generated user
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.user_navigates_to_vendor_login_page_after_signup_api_action(page, newUser)
})

test('Vendor user is generated via signup api action and logged into test.postal.dev environment', async ({
  page,
}) => {
  const signupIn = new SignUpIn(page)
  //When
  await signupIn.generated_user_logs_into_vendor_app(page, newUser)
  //Then
  await signupIn.the_user_should_see_the_vendor_dashboard(page, newUser)
})
