import { test } from '@playwright/test'
import { Account, SignUpIn } from './support/pageObjects'
let newUser: any
// @accountUpdate @account
// Feature: Update User Info
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const account = new Account(page)
  //Given
  await signupIn.new_user_is_generated_and_logged_into_Vendor_app(page).then((user) => {
    newUser = user
  })
  await account.user_clicks_Account_tab(page)
})

test('Update user info', async ({ page }) => {
  const account = new Account(page)
  //When
  await account.user_updates_account_info_and_logs_out(page, newUser)
  //Then
  await account.user_should_see_updated_changes_after_login(page, newUser)
})
