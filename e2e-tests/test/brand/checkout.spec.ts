import { test } from '@playwright/test'
import { Checkout, StoreFrontDesign, Products, NewStore, SignUpIn } from './support/pageObjects'
import { faker } from '@faker-js/faker'
let newStoreName: string
// Feature: Store checkout process

test.use({
  ignoreHTTPSErrors: true,
})

test.beforeEach(async ({ page }) => {
  const checkout = new Checkout(page)
  const signupIn = new SignUpIn(page)
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`
  //Given
  await signupIn.a_new_user_is_generated_and_logged_into_the_Store_app(page)
  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await checkout.store_has_an_Active_status(page)
  await checkout.a_generated_gift_card_has_been_added_to_products(page, newStoreName)
  await checkout.store_has_Active_products(page, newStoreName)
  await checkout.two_new_giftcards_have_been_created(page)
  await storeFrontDesign.the_user_navigates_to_brand_store(page)
})

test('Purchase product using gift card - Enough gift card balance', async ({ page }) => {
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)

  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //When
  await checkout.user_enters_gift_card_code_into_Gift_Card_fields(page, '$30')
  await checkout.user_clicks_Apply(page)
  await checkout.user_will_see_a_toast_message(page, 'Gift Card Added')
  //Then
  await checkout.total_Remaining_balance_should_update_to_0(page)
  await checkout.user_clicks_Pay_Now(page)
  await checkout.user_will_see_order_confirmation_screen(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Purchase product using credit card', async ({ page }) => {
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)

  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //When
  await checkout.user_fills_out_the_creditCardNumber_expDate_cvc_and_zip_fields(page, 'valid')
  //Then
  await checkout.user_clicks_Pay_Now(page)
  await checkout.user_will_see_order_confirmation_screen(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Purchase product using gift card and credit card', async ({ page }) => {
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)

  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //When
  await checkout.user_enters_gift_card_code_into_Gift_Card_fields(page, '$5')
  await checkout.user_clicks_Apply(page)
  await checkout.user_will_see_a_toast_message(page, 'Gift Card Added')
  //Then
  await checkout.total_Remaining_balance_is_higher_than_0(page)
  await checkout.user_fills_out_the_creditCardNumber_expDate_cvc_and_zip_fields(page, 'valid')
  await checkout.user_clicks_Pay_Now(page)
  //flaky (sometimes doesn't show)
  //await checkout.user_will_see_a_toast_message(page, 'Order submitted')
  await checkout.user_will_see_order_confirmation_screen(page)
})

test('Purchase product with insufficient gift card funds', async ({ page }) => {
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)

  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //When
  await checkout.user_enters_gift_card_code_into_Gift_Card_fields(page, '$5')
  await checkout.user_clicks_Apply(page)
  await checkout.user_will_see_a_toast_message(page, 'Gift Card Added')
  //Then
  await checkout.user_clicks_Pay_Now(page, 'insufficient')
  await checkout.user_will_see_a_toast_message(page, 'Your card number is incomplete.')
  await checkout.user_will_be_unable_to_complete_order(page)
})

// Won't be able to automate this because can only select an expiration date in the future
// and because each run creates a new account that expiration date will never be met
//  Scenario: Purchase product with expired gift card
//  Given the user selects a product
//  And user clicks Add to Cart
//  And user clicks Checkout in cart modal
//  And user fills out contact information and address fields
//  When user enters gift card code into 'Gift Card' fields
//  And user clicks 'Apply'
//  Then user will see 'Warning! Gift Card is Expired' toast message
//  And user will be unable to complete order

test('Purchase product with gift card that has a zero balance', async ({ page }) => {
  const storeFrontDesign = new StoreFrontDesign(page)
  const products = new Products(page)
  const checkout = new Checkout(page)

  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //When
  await checkout.user_enters_gift_card_code_into_Gift_Card_fields(page, '$5')
  await checkout.user_clicks_Apply(page)
  await checkout.user_will_see_a_toast_message(page, 'Gift Card Added')
  await checkout.total_Remaining_balance_is_higher_than_0(page)
  await checkout.user_fills_out_the_creditCardNumber_expDate_cvc_and_zip_fields(page, 'valid')
  await checkout.user_clicks_Pay_Now(page)
  //flakey
  //await checkout.user_will_see_a_toast_message(page, 'Order submitted')
  await checkout.user_will_see_order_confirmation_screen(page)
  //The steps above will zero out the $5 card
  //Then
  await products.user_clicks_Back_to_Store(page)
  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  await checkout.user_enters_gift_card_code_into_Gift_Card_fields(page, '$5')
  await checkout.user_clicks_Apply(page)
  await checkout.user_will_see_a_toast_message(page, 'No Remaining Balance Available')
  await checkout.user_will_be_unable_to_complete_order(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Purchase product with invalid credit card', async ({ page }) => {
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)

  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //When
  await checkout.user_fills_out_the_creditCardNumber_expDate_cvc_and_zip_fields(page, 'invalid')
  //Then
  await checkout.user_will_see_values_in_Credit_Card_field_turn_red(page)
  await checkout.user_clicks_Pay_Now(page, 'invalid')
  await checkout.user_will_see_a_toast_message(page, 'Your card number is invalid.')
})
