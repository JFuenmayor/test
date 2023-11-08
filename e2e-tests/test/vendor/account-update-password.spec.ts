import { test } from '@playwright/test'
import { Account, SignUpIn } from './support/pageObjects'
let newUser: any
// @accountPassword @account
// Feature: Update Account password
// Background: Navigation
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.new_user_is_generated_and_logged_into_Vendor_app(page).then((user) => {
    newUser = user
  })
})

test('Update and validate new password', async ({ page }) => {
  const account = new Account(page)
  const signupIn = new SignUpIn(page)
  await account.user_clicks_actions_tab_to_change_password()
  //When
  await account.user_updates_password(newUser)
  //Then
  await signupIn.user_should_be_able_to_log_back_in_with_new_password(page, newUser)
})
