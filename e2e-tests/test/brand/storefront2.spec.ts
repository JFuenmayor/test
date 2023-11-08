import { test } from '@playwright/test'
import { Checkout, NewStore, SignUpIn, StoreFrontDesign } from './support/pageObjects'
import { faker } from '@faker-js/faker'
//let user: any
let newStoreName: string
//let uniqueSubdomain: string
//Feature: testing store front settings
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.user_is_associated_to_an_Engage_account(page)
  // .then((newUser) => {
  //   user = newUser
  // })
  await signupIn.user_has_been_granted_Brand_product_access(page)
  await signupIn.nagivates_to_the_postal_store_login_page(page)
  await signupIn.user_logs_in(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Storefront Design - Hero', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  await storeFrontDesign.user_lands_on_Hero(page)
  //When
  await storeFrontDesign.a_user_selects_to_upload_image(page)
  await storeFrontDesign.adds_a_hero_image(page)
  await storeFrontDesign.selects_Save_Changes(page)
  await storeFrontDesign.enters_a_Heading(page)
  await storeFrontDesign.enters_a_Description(page)
  await storeFrontDesign.enters_a_Button_Text(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  //the store displays the hero image
  //Currently no way of asserting if uploaded hero image is showing, as its image attributes do not appear to be visible in the DOM
  await storeFrontDesign.store_displays_Heading_Description_Button_Text(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Storefront Design - Categories', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  //When
  await storeFrontDesign.user_selects_Categories(page)
  await storeFrontDesign.a_user_selects_the_add_category_button(page)
  await storeFrontDesign.uploads_an_image_for_a_Category(page)

  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_category_image_is_displayed(page)
  await storeFrontDesign.the_category_image_is_displayed_on_the_site(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Storefront Design - Featured', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  const checkout = new Checkout(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await checkout.a_generated_gift_card_has_been_added_to_products(page, newStoreName)
  await checkout.store_has_Active_products(page, newStoreName)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  //When
  await storeFrontDesign.user_selects_Featured(page)
  await storeFrontDesign.checks_the_toggle_to_make_sure_it_is_active(page)
  await storeFrontDesign.a_user_adds_a_Heading(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_store_Featured_section_displays_the_Heading(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Storefront Design - Banner', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  //When
  await storeFrontDesign.selects_Banner(page)
  await storeFrontDesign.a_user_adds_a_Heading(page)
  await storeFrontDesign.a_user_enters_a_Description(page)
  await storeFrontDesign.enters_a_Button_Text(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_store_displays_the_Section_Heading(page)
  await storeFrontDesign.the_store_displays_the_Description(page)
  await storeFrontDesign.the_store_displays_the_Button_Text(page)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Storefront Design - Footer', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  //When
  await storeFrontDesign.user_selects_Footer(page)
  await storeFrontDesign.a_user_selects_add_image(page)
  await storeFrontDesign.uploads_an_image_for_a_Logo(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_store_displays_the_footer_image(page, newStoreName)
  //When
  await storeFrontDesign.the_user_returns_to_the_storefront(page)
  await storeFrontDesign.user_selects_Footer(page)
  await storeFrontDesign.deletes_the_previously_added_logo(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  await storeFrontDesign.adds_a_Title(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast_message(page, 'Theme Updated')
  await storeFrontDesign.user_selects_to_add_a_link(page)
  await storeFrontDesign.adds_a_Link_Text_and_type(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_store_displays_the_footer_title(page)
  await storeFrontDesign.the_store_displays_the_Link_Text(page)
})
