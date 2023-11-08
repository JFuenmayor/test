import { test } from '@playwright/test'
import { Products, SignUpIn } from './support/pageObjects'
// @productsPage @products
// Feature: Navigate to Products tab
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.new_user_is_generated_and_logged_into_Vendor_app(page)
})

test('Navigate and validate user is in Products page', async ({ page }) => {
  const products = new Products(page)
  //When
  await products.user_clicks_on_Products_tab()
  await products.user_is_redirected_to_products(page)
  //Then
  await products.new_user_should_see_Products_page(page)
})
