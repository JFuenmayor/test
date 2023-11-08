import { test } from '@playwright/test'
import { NewStore, SignUpIn, StoreFrontDesign, StoreSettings } from './support/pageObjects'
import { faker } from '@faker-js/faker'
let user: any
let newStoreName: string
let uniqueSubdomain: string
// Feature: Creating a Brand Storefront
// Creating and publishing Storefront
test.beforeEach(async ({ page }) => {
  const signupIn = new SignUpIn(page)
  //Given
  await signupIn.user_is_associated_to_an_Engage_account(page).then((newUser) => {
    user = newUser
  })
  await signupIn.user_has_been_granted_Brand_product_access(page)
  await signupIn.nagivates_to_the_postal_store_login_page(page)
  await signupIn.user_logs_in(page)
})

test('Create a storefront', async ({ page }) => {
  const newStore = new NewStore(page)

  await newStore.user_clicks_Account_Menu_button(page)
  await newStore.user_clicks_Manage_Stores(page)
  //When
  await newStore.user_clicks_Create_a_Store(page)
  await newStore.user_selects_an_Engage_account_from_drop_down(page, 'Account', user)
  await newStore.user_enters_a_unique_store_name(page).then((storeName) => {
    newStoreName = storeName
  })
  await newStore.user_enters_a_unique_subdomain(page).then((subdomainName) => {
    uniqueSubdomain = subdomainName
  })
  await newStore.user_clicks_Save(page)
  //Then
  await newStore.user_will_see_a_success_toast(page)
  await newStore.store_will_be_visible_in_Stores_list(page, newStoreName, uniqueSubdomain)
})

test.use({
  ignoreHTTPSErrors: true,
})

test('Publishing store', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  const storeSettings = new StoreSettings(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.user_has_selected_a_theme_from_Storefront_Design(page)
  await storeSettings.user_selects_Storefront_Settings_link(page)
  //When
  await storeSettings.user_changes_status_from_Pending_to_Active(page)
  //Then
  await storeSettings.user_will_be_able_to_navigate_to_hostname_and_store_will_load_successfully(
    page
  )
})

test('Storefront Design - Adding Universal Logo and Favicon', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  await storeFrontDesign.user_lands_on_the_storefront_page(page)
  //When
  await storeFrontDesign.a_user_selects_the_Logo_edit_icon(page)
  await storeFrontDesign.uploads_a_new_image_for_a_Logo(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Branding settings updated.')
  await storeFrontDesign.a_user_selects_the_Favicon_edit_icon(page)
  await storeFrontDesign.user_will_be_able_to_upload_an_image_for_a_Favicon(page)
  //Then
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Branding settings updated.')
  //Then the store logo and favicon are updated
  //Cannot automate checking that the store preview is now showing the new logo and favicon
})

test('Storefront Design - FONT', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  await storeFrontDesign.user_lands_on_the_storefront_page(page)
  //When
  await storeFrontDesign.a_user_uses_the_Font_drop_to_select_a_Font(page)
  //Then
  await storeFrontDesign.the_Save_Changes_confirmation_banner_is_displayed(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Branding settings updated.')
  //And the store font is updated
  //Cannot automate checking that the store preview text is now in Arial
})

test('Storefront Design - SEO', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  await storeFrontDesign.user_lands_on_the_storefront_page(page)
  //When
  await storeFrontDesign.a_user_enters_an_SEO_title(page)
  await storeFrontDesign.a_user_enters_a_Description(page)
  await storeFrontDesign.the_Save_Changes_confirmation_banner_is_displayed(page)
  await storeFrontDesign.user_clicks_Save_Changes(page)
  //Then
  await storeFrontDesign.viewing_the_stores_page_source_displays_the_title_and_description(page)
})

test('Storefront Design - THEMES', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Storefront_tab(page)
  await storeFrontDesign.user_lands_on_the_storefront_page(page)
  //When
  await storeFrontDesign.a_user_selects_a_theme(page)
  await storeFrontDesign.the_Change_Theme_confirmation_appears(page)
  await storeFrontDesign.selecting_Confirm(page)
  //Then
  await storeFrontDesign.the_store_is_updated_to_the_selected_theme(page)
})

test('Storefront Design - Navbar', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  //When
  await storeFrontDesign.user_selects_Theme_Editor_Link(page)
  await storeFrontDesign.user_lands_on_Navbar(page)
  await storeFrontDesign.a_user_selects_replace_image(page)
  await storeFrontDesign.uploads_an_image_for_a_Logo(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_store_Navbar_will_contain_an_image(page, newStoreName)
  // //When
  // await storeFrontDesign.the_user_returns_to_the_storefront(page)
  // await storeFrontDesign.user_selects_Theme_Editor_Link(page)
  // await storeFrontDesign.deletes_the_previously_added_logo(page)
  // await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  // await storeFrontDesign.adds_a_Title(page)
  // await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  // //Then
  // await storeFrontDesign.the_store_Navbar_will_contain_a_title(page)
})

test('Storefront Design - Navbar Links', async ({ page }) => {
  const newStore = new NewStore(page)
  const storeFrontDesign = new StoreFrontDesign(page)
  newStoreName = `${faker.animal.rabbit()} ${faker.lorem.word()}`

  await newStore.a_brand_storefront_has_been_created(page, newStoreName)
  await storeFrontDesign.store_is_active(page)
  await storeFrontDesign.user_selects_Theme_Editor_Link(page)
  await storeFrontDesign.user_lands_on_Navbar(page)
  //When
  await storeFrontDesign.a_user_selects_the_Add_Link_button(page)
  await storeFrontDesign.adds_a_Link_Text_and_type(page)
  await storeFrontDesign.selecting_Save_Changes_displays_a_toast(page, 'Theme Updated')
  //Then
  await storeFrontDesign.the_store_Navbar_displays_the_Link_Text(page)
})
