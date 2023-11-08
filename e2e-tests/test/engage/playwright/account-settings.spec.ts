import { test } from '@playwright/test'
import { Accounts, SignUpIn } from './support/pageObjects'
let user: any

test.beforeEach(async ({ page }) => {
  const signupin = new SignUpIn(page)
  await signupin.a_new_user_is_generated_and_logged_into_the_Enagage_app(page).then((res) => {
    user = res
  })
})

test.describe('Account Settings Page Functionality', async () => {
  test('Verifies Display Account Name', async ({ page }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //Then
    await accounts.the_user_should_see_the_account_name_displayed_correctly(page, user)
  })
  test('Edits the Company Info Settings', async ({ page }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    await accounts.the_Accounts_Settings_Link_in_the_sidebar_should_be_active(page)
    await accounts.the_Display_Name_should_not_be_set(page)
    await accounts.the_Company_Address_should_not_be_set()
    //When
    await accounts.the_user_clicks_the_Edit_Company_Info_button()
    //And
    await accounts.fills_the_Display_Name_field_with_a_new_value()
    await accounts.fills_the_Street_Address_1_field_with_a_new_value()
    await accounts.fills_the_Street_Address_2_field_with_a_new_value()
    await accounts.fills_the_City_field_with_a_new_value()
    await accounts.fills_the_State_field_with_a_value()
    await accounts.fills_the_Country_field_with_a_value()
    await accounts.fills_the_Postal_Code_field_with_a_new_value()
    await accounts.the_user_clicks_the_Save_button(page)
    //Then
    await accounts.the_user_should_see_that_the_company_info_has_been_updated()
    await accounts.the_user_should_see_that_the_updated_info_made_it_into_the_edit_drawer(page)
  })
  test("Verifies that the a 'Item Request Email Recipients' selection and unselection renders correctly", async ({
    page,
  }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //When
    await accounts.the_user_selects_an_Admin_for_Item_Request_Email_Recipients(page, user)
    //Then
    await accounts.the_user_should_see_that_one_Admin_was_saved_for_Item_Request_Email_Recipients(
      page
    )
    //When
    await accounts.the_user_selects_All_Admins_for_Item_Request_Email_Recipients(page, user)
    //Then
    await accounts.the_user_should_see_that_All_Admins_was_saved_for_Item_Request_Email_Recipients(
      page
    )
  })
  test("Verifies the 'Users can view all items' on/off toggle renders correctly", async ({
    page,
  }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //When
    await accounts.the_user_turns_off_Users_can_view_all_items()
    //Then
    await accounts.the_user_should_see_that_Off_was_saved_for_Users_can_view_all_items(page)
    //When
    await accounts.the_user_turns_On_Users_can_view_all_items()
    //Then
    await accounts.the_user_should_see_that_On_was_saved_for_Users_can_view_all_items(page)
  })
  test.skip("Verifies that the a 'Event Request Email Recipients' selection and unselection renders correctly", async ({
    page,
  }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //When
    await accounts.the_user_selects_an_Admin_for_Event_Request_Email_Recipients(page, user)
    //Then
    await accounts.the_user_should_see_that_one_Admin_was_saved_for_Event_Request_Email_Recipients(
      page
    )
    //When
    await accounts.the_user_selects_All_Admins_for_Event_Request_Email_Recipients(page, user)
    //Then
    await accounts.the_user_should_see_that_All_Admins_was_saved_for_Event_Request_Email_Recipients(
      page
    )
  })
  test("Verifies the 'Users can view all events' on/off toggle renders correctly", async ({
    page,
  }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //When
    await accounts.the_user_turns_off_Users_can_view_all_events()
    //Then
    await accounts.the_user_should_see_that_Off_was_saved_for_Users_can_view_all_events(page)
    //When
    await accounts.the_user_turns_On_Users_can_view_all_events()
    //Then
    await accounts.the_user_should_see_that_On_was_saved_for_Users_can_view_all_events(page)
  })
  test("Verifies the 'Users can Bulk Send Items' on/off toggle renders correctly", async ({
    page,
  }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //When
    await accounts.the_user_turns_On_Users_can_bulk_send_items()
    //Then
    await accounts.the_user_should_see_that_On_was_saved_for_Users_can_bulk_send_items(page)
    //When
    await accounts.the_user_turns_off_Users_can_bulk_send_items()
    //Then
    await accounts.the_user_should_see_that_Off_was_saved_for_Users_can_bulk_send_items(page)
  })
  test("Verifies the 'Account Configurations' card renders correctly", async ({ page }) => {
    const accounts = new Accounts(page)
    //Given
    await accounts.the_user_is_on_the_Account_Settings_page(page)
    //When
    await accounts.the_user_selects_a_MagicLink_Auto_Approve_Setting(page)
    //Then
    await accounts.the_user_should_see_that_the_MagicLink_Auto_Approve_Setting_has_been_set()
  })
})
