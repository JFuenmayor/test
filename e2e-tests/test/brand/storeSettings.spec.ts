import { test } from '@playwright/test'
import {
  Checkout,
  NewStore,
  SignUpIn,
  StoreFrontDesign,
  StoreSettings,
} from './support/pageObjects'
import { faker } from '@faker-js/faker'
let newStoreName: string
// Feature: Store Settings

test.use({
  ignoreHTTPSErrors: true,
})

test.beforeEach(async ({ page }) => {
  const checkout = new Checkout(page)
  const signupIn = new SignUpIn(page)
  const newStore = new NewStore(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`
  //Given
  await signupIn.a_new_user_is_generated_and_logged_into_the_Store_app(page)
  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await checkout.store_has_an_Active_status(page)
  await checkout.a_generated_gift_card_has_been_added_to_products(page, newStoreName)
  await checkout.store_has_Active_products(page, newStoreName)
})

test('Disable Credit Card use from checkout', async ({ page }) => {
  const storeSettings = new StoreSettings(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)

  await storeSettings.the_user_has_navigated_to_the_store_settings_tab(page)
  //When
  await storeSettings.the_user_turns_off_the_Accept_Credit_Cards_setting(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Store Updated')
  await storeFrontDesign.the_user_navigates_to_brand_store(page)
  await checkout.the_user_selects_a_product(page, newStoreName)
  await checkout.user_clicks_Add_to_Cart(page)
  await checkout.user_clicks_Checkout_in_cart_modal(page)
  await checkout.the_user_fills_out_the_contact_information_and_address_fields(page)
  await storeFrontDesign.user_clicks_Use_Verified(page)
  //Then
  await storeSettings.the_user_will_not_see_the_credit_card_input(page)
})
