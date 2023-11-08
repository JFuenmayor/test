import { test } from '@playwright/test'
import { NewStore, SignUpIn, StoreSettings } from './support/pageObjects'
// Feature: If storefront is password protected, a user needs to login with a 12 character or greater
// password if it is their first time visting the storefront or their store session has expired.

test.use({
  ignoreHTTPSErrors: true,
})
let hostname: string
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const newStore = new NewStore(page)
  const storeSettings = new StoreSettings(page)
  //Given
  await signupIn.user_is_associated_to_an_Engage_account(page)
  await signupIn.user_has_been_granted_Brand_product_access(page)
  await signupIn.nagivates_to_the_postal_store_login_page(page)
  await signupIn.user_logs_in(page)
  await newStore.storefront_has_been_created(page).then((store) => {
    hostname = store.uniqueSubDomain
  })
  await newStore.storefront_has_Active_status(page)
  await storeSettings.password_protect_is_toggled_on(page)
  await storeSettings.a_password_is_provided(page)
  await storeSettings.selecting_Save_Changes_displays_a_toast(page, 'Store Updated')
})

test('Logging in a first time user', async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const storeSettings = new StoreSettings(page)
  //this will be the first time the user visits the storefront because each scenario generates a new user
  //When
  await storeSettings.the_user_navigates_to_brand_storeA(page)
  //Then
  await signupIn.user_will_be_directed_to_the_login_route(page)
  await signupIn.user_will_see_a_password_input_field_and_a_Login_button(page)
  await signupIn.user_inputs_correct_password_with_12_chars_or_more_into_password_field(page)
  await signupIn.user_clicks_the_Login_button(page)
  await signupIn.the_user_will_be_navigated_to_the_storefront_homepage(page)
})

test('Logging in a user with an expired store session @excludeFromLocalRuns', async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const storeSettings = new StoreSettings(page)
  await storeSettings.the_user_navigates_to_brand_storeA(page)
  await signupIn.user_will_be_directed_to_the_login_route(page)
  await signupIn.user_will_see_a_password_input_field_and_a_Login_button(page)
  await signupIn.user_inputs_correct_password_with_12_chars_or_more_into_password_field(page)
  await signupIn.user_clicks_the_Login_button(page)
  await signupIn.the_user_will_be_navigated_to_the_storefront_homepage(page)
  //now that the user is logged into the storefront the test will clear the session cookie
  //When
  await signupIn.the_test_clears_the_session_cookie_to_mimic_a_users_expired_store_session(page)
  await signupIn.reloads_the_storefront_page(page)
  //Then
  await signupIn.user_will_be_directed_to_the_login_route_A(page, hostname)
  await signupIn.user_will_see_a_password_input_field_and_a_Login_button(page)
  await signupIn.user_inputs_correct_password_with_12_chars_or_more_into_password_field(page)
  await signupIn.user_clicks_the_Login_button(page)
  await signupIn.the_user_will_be_navigated_to_the_storefront_homepage(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Entering the incorrect password', async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const storeSettings = new StoreSettings(page)
  await storeSettings.the_user_navigates_to_brand_storeA(page)
  await signupIn.user_will_be_directed_to_the_login_route(page)
  //When
  await signupIn.user_inputs_an_invalid_password_into_the_password_field(page)
  //Then
  await signupIn.user_clicks_the_Login_button(page)
  await signupIn.user_will_see_an_error_message(page, 'Please provide a valid password.')
})
