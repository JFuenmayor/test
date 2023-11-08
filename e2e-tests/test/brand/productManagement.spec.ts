import { test } from '@playwright/test'
import { NewStore, Products, SignUpIn } from './support/pageObjects'
// Feature: Managing Storefront Products
// Adding and editing products
let newStoreName: string

test.use({
  ignoreHTTPSErrors: true,
})

test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const newStore = new NewStore(page)
  //Given
  await signupIn.user_is_associated_to_an_Engage_account(page)
  await signupIn.user_has_been_granted_Brand_product_access(page)
  await signupIn.nagivates_to_the_postal_store_login_page(page)
  await signupIn.user_logs_in(page)
  await newStore.storefront_has_been_created(page).then((store) => {
    newStoreName = store.storeName
  })
  await newStore.storefront_has_Active_status(page)
})

test('Adding a product', async ({ page }) => {
  const products = new Products(page)

  await products.the_user_clicks_the_Products_button(page)
  //When
  await products.the_user_adds_a_product_to_the_storefront(page, newStoreName)
  //Then
  await products.the_user_will_see_Product_Added_toast_message(page)
  await products.the_product_will_be_visible_on_the_Store_Products_table_with_a_Pending_status(
    page,
    newStoreName
  )
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Setting a Product Status to Active', async ({ page }) => {
  const products = new Products(page)
  //Given user has added a product to storefront - the following steps will take care of this
  await products.the_user_clicks_the_Products_button(page)
  await products.the_user_adds_a_product_to_the_storefront(page, newStoreName)
  await products.the_user_will_see_Product_Added_toast_message(page)
  await products.the_product_will_be_visible_on_the_Store_Products_table_with_a_Pending_status(
    page,
    newStoreName
  )
  //When
  await products.the_user_edits_the_product(page, newStoreName)
  await products.the_user_selects_Active_from_the_Status_drop_down(page)
  //Then
  await products.the_item_status_will_change_to_Active(page)
  await products.the_product_will_be_visible_on_the_users_store(page)
})

test('Deleting a product', async ({ page }) => {
  const products = new Products(page)
  await products.the_user_has_added_a_product_and_it_is_visible_in_the_users_store(
    page,
    newStoreName
  )
  //When
  await products.the_user_goes_back_to_the_Store_Products_page(page)
  await products.the_user_edits_the_product(page, newStoreName)
  await products.the_user_removes_the_product_from_the_storefront(page, newStoreName)
  await products.the_user_clicks_the_confirm_button(page)
  //Then
  await products.the_user_refreshs_the_page(page)
  await products.the_user_will_see_that_the_product_was_removed_from_Brand(page)
  await products.the_user_will_see_that_the_product_was_removed_from_the_storefront(page)
})
