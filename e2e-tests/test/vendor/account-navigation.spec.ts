import { test } from '@playwright/test'
import { Account, SignUpIn } from './support/pageObjects'
//@accountPage @account
// Feature: Navigate to Account page
// Background: Navigation
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.new_user_is_generated_and_logged_into_Vendor_app(page)
})

test('Navigate and validate user is in Account page', async ({ page }) => {
  const account = new Account(page)
  //When
  await account.user_clicks_Account_tab(page)
  await account.user_is_redirected_to_account(page)
  //Then
  await account.new_user_should_see_Account_page(page)
})
