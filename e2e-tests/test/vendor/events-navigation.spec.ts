import { test } from '@playwright/test'
import { Events, SignUpIn } from './support/pageObjects'
// @eventsPage @events
// Feature:  Navigate to Events tab
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.new_user_is_generated_and_logged_into_Vendor_app(page)
})

test('Navigate and validate user is in Events page', async ({ page }) => {
  const events = new Events(page)
  //When
  await events.user_clicks_on_Events_tab()
  await events.user_is_redirected_to_events(page)
  //Then
  await events.new_user_should_see_Events_page(page)
})
