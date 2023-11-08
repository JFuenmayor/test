import { test } from '@playwright/test'
import { Orders, SignUpIn } from './support/pageObjects'
// @ordersPage @orders
// Feature: Navigate to Orders tab
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.new_user_is_generated_and_logged_into_Vendor_app(page)
})

test('Navigate to Orders tab', async ({ page }) => {
  const orders = new Orders(page)
  //When
  await orders.user_clicks_Orders_tab()
  await orders.user_is_redirected_to_orders(page)
  //Then
  await orders.new_user_should_see_Orders_page_with_no_items_found(page)
})
