import { test } from '@playwright/test'
import { GiftCards, NewStore, SignUpIn } from './support/pageObjects'
// Feature: Managing Store Gift Cards
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  const newStore = new NewStore(page)
  const giftcards = new GiftCards(page)
  //Given
  await signupIn.user_is_associated_to_an_Engage_account(page)
  await signupIn.user_has_been_granted_Brand_product_access(page)
  await signupIn.nagivates_to_the_postal_store_login_page(page)
  await signupIn.user_logs_in(page)
  await newStore.storefront_has_been_created(page)
  await newStore.storefront_has_Active_status(page)
  await giftcards.user_clicks_Gift_Cards_tab(page)
  await giftcards.user_clicks_Create_a_gift_card(page)
  await giftcards.user_selects_a_currency_from_the_currency_drop_down(page)
  await giftcards.user_enters_a_positive_integer_in_Amount_field(page)
})

test('Generate a gift card - No Expiration Date', async ({ page }) => {
  const giftcards = new GiftCards(page)
  //When
  await giftcards.user_does_not_enter_an_expiration_date(page)
  await giftcards.user_clicks_Save(page)
  await giftcards.user_will_see_a_toast_message(page, 'Gift card created')
  //Then
  await giftcards.gift_card_code_amount_remaining_and_created_columns_will_be_populated(page)
  await giftcards.gift_card_status_will_be_set_to_Active(page)
})

test('Generate a gift card - Expiration Date', async ({ page }) => {
  const giftcards = new GiftCards(page)
  //When
  await giftcards.user_enters_an_expiration_date_that_is_in_the_future(page)
  await giftcards.user_clicks_Save(page)
  await giftcards.user_will_see_a_toast_message(page, 'Gift card created')
  //Then
  await giftcards.the_code_amount_remaining_created_and_expires_columns_will_be_populated(page)
  await giftcards.gift_card_status_will_be_set_to_Active(page)
})
