import type { Locator, Page } from '@playwright/test'
import { Hero, Navbar, StoreSettings } from '../pageObjects'
import { expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { gotoWithRetry } from '../helpers'
import baseURL from '../../../../playwright.config'
let heading: string
let buttonText: string

export default class StoreFrontDesign {
  readonly page: Page
  readonly theme1: Locator
  readonly theme2: Locator
  readonly confirmButton: Locator
  readonly themeEditorButton: Locator
  readonly editLogoButton: Locator
  readonly editFaviconButton: Locator
  readonly fontSelect: Locator
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly addLogoButton: Locator
  readonly replaceImageButton: Locator
  readonly addLink: Locator
  readonly linkTextInput: Locator
  readonly headingInput: Locator
  readonly buttonTextInput: Locator
  readonly activeToggle: Locator
  readonly linkType: Locator
  readonly targetInput: Locator

  constructor(page: Page) {
    this.page = page
    this.theme1 = page.locator('div[title="Theme1"]')
    this.theme2 = page.locator('div[title="Theme2"]')
    this.confirmButton = page.locator('text="Confirm"')
    this.themeEditorButton = page.locator('a:has-text("Theme Editor")').nth(0)
    this.editLogoButton = page.getByText('Replace Image').first()
    this.editFaviconButton = page.getByText('Replace Image').nth(1)
    this.fontSelect = page.locator('div:has-text("Font") >> select')
    this.titleInput = page.getByRole('textbox', { name: 'Title' })
    this.descriptionInput = page.locator('div[role="group"]:has-text("Description") >> textarea')
    this.addLogoButton = page.getByText('Add Media')
    this.replaceImageButton = page.getByText('Replace Image')
    this.addLink = page.locator('[aria-label="Add Link"]')
    this.linkTextInput = page.locator('div[role="group"]:has-text("Link Text") >> input')
    this.headingInput = page.locator('div[role="group"]:has-text("Heading") >> input')
    this.buttonTextInput = page.locator('div[role="group"]:has-text("Button Text") >> input')
    this.activeToggle = page.locator('div:has-text("Active") >> input[type="checkbox"]')
    this.linkType = page.locator('div:has-text("Link Type") >> select')
    this.targetInput = page.locator('div[role="group"]:has-text("Target") >> input')
  }

  async selecting_Save_Changes_displays_a_toast(page: Page, toastMessage: string) {
    //const navbar = new Navbar(page)
    await page.waitForTimeout(900)
    const saveButton = page.locator('button:text-is("Save Changes")')
    await saveButton.scrollIntoViewIfNeeded()
    await expect(saveButton).toBeVisible()
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('_data=routes%2Fbrand.store.storefront') &&
          resp.status() === 200 &&
          (await resp.json()).branding.navForeground.includes('#F'),
        {
          timeout: 120000,
        }
      ),
      await saveButton.click({ force: true }),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      } else if ((await page.$('text=Save Changes')) !== null) {
        await saveButton.click({ force: true })
      }
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
    await saveButton.waitFor({ state: 'detached' })
    if (toastMessage === 'Theme Updated') {
      await expect(saveButton).toHaveCount(0, { timeout: 199000 })
    }
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else if ((await page.$('text= ETIMEDOUT')) !== null) {
      return true
    } else if ((await page.$('text=Save Changes')) !== null) {
      await saveButton.click({ force: true })
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 199000 })
    }
    // else {
    //   await navbar.getAlert(toastMessage)
    // }
  }

  async selecting_Save_Changes_displays_a_toast_message(page: Page, toastMessage: string) {
    //const navbar = new Navbar(page)
    await page.waitForTimeout(900)
    const saveButton = page.locator('button:text-is("Save Changes")')
    await saveButton.scrollIntoViewIfNeeded()
    await expect(saveButton).toBeVisible()
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('_data=routes%2Fbrand.store.storefront') &&
          resp.status() === 200 &&
          (await resp.json()).data.page.components.includes('Addition'),
        {
          timeout: 120000,
        }
      ),
      await saveButton.click({ force: true }),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      } else if ((await page.$('text=Save Changes')) !== null) {
        await saveButton.click({ force: true })
      }
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
    await saveButton.waitFor({ state: 'detached' })
    //await page.waitForTimeout(1200)
    if (toastMessage === 'Theme Updated') {
      await expect(saveButton).toHaveCount(0, { timeout: 199000 })
    }
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else if ((await page.$('text= ETIMEDOUT')) !== null) {
      return true
    } else if ((await page.$('text=Save Changes')) !== null) {
      await saveButton.click({ force: true })
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 199000 })
    }
    // else {
    //   await navbar.getAlert(toastMessage)
    // }
  }

  async the_user_navigates_to_brand_store(page: Page) {
    const navbar = new Navbar(page)
    const storeSettings = new StoreSettings(page)
    await navbar.storeFrontButton.click()
    // await Promise.all([
    //   page.waitForResponse(
    //     async (resp) =>
    //       resp.url().includes('storefront%2Fsetting') &&
    //       resp.status() === 200 &&
    //       (await resp.text()).includes('categories'),
    //     {
    //       timeout: 8000,
    //       //timeout: 120000,
    //     }
    //   ),
    await page.waitForTimeout(500)
    await storeSettings.storeSettingsLink.click({ force: true })
    // ]).catch(async () => {
    //   await page.waitForTimeout(500)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload()
    //   } else if ((await page.$('text=Password Protect')) !== null) {
    //     /* empty */
    //   } else {
    //     await storeSettings.storeSettingsLink.click()
    //     await page.waitForTimeout(200)
    //     if ((await page.$('text=Error')) !== null) {
    //       await page.reload()
    //     }
    //   }
    // })
    await storeSettings.gotoHttpStore()
  }

  async user_clicks_Use_Verified(page: Page) {
    await page.waitForTimeout(1000)
    const button = await page.locator(`button:has-text("Use Verified")`)
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith('checkout?_data=routes%2F_storefront') && resp.status() === 200,
        {
          timeout: 120000,
        }
      ),
      await button.click({ force: true }),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=There are no items currently in your cart.')) !== null) {
        await page.reload()
      }
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 80000 })
    await expect(button).toHaveCount(0, { timeout: 80000 })
  }

  async user_has_selected_a_theme_from_Storefront_Design(page: Page) {
    const navbar = new Navbar(page)
    await page.waitForTimeout(200)
    await navbar.storeFrontButton.click({ force: true, timeout: 80000 })
    await page.locator('text=Themes').scrollIntoViewIfNeeded()
    await this.theme1.click({ timeout: 80000 })
    await this.confirmButton.click()
    await expect(this.confirmButton).toHaveCount(0, { timeout: 80000 })
    await page.waitForTimeout(200)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    const alert = page.locator('text=Updated Theme').nth(0)
    await expect(alert).toBeVisible({ timeout: 120000 })
    await page.reload()
  }

  async user_selects_Storefront_tab(page: Page) {
    await page.waitForTimeout(400)
    const text = /^Cancel$/
    if ((await page.$(`text="${text}"`)) !== null) {
      const cancelbutton = page.locator('text=Cancel')
      await cancelbutton.click()
      await expect(cancelbutton).toHaveCount(0, { timeout: 80000 })
    }
    const stringTab = await page
      .getByTestId('atomic-subnavbar-left')
      .getByRole('link', { name: 'Storefront' })
    await expect(stringTab).toBeVisible({ timeout: 80000 })
    await Promise.all([
      page.waitForResponse(
        (resp: any) => resp.url().includes('/storefront?_data=routes') && resp.status() === 200,
        {
          timeout: 120000,
        }
      ),
      await stringTab.click({ force: true }),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      }
    })
    await page.waitForTimeout(300)
    if ((await page.$('text=Featured')) == null) {
      await page.reload()
    }
  }
  async store_is_active(page: Page) {
    const navbar = new Navbar(page)
    const storeSettings = new StoreSettings(page)
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('storefront?_data=routes%2Fbrand.store.storefront._index') &&
          resp.status() === 200 &&
          (await resp.text()).includes('store'),
        {
          timeout: 120000,
        }
      ),
      await navbar.storeFrontButton.click({ timeout: 100000 }),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=Error')) !== null) {
        await page.reload({ timeout: 60000 })
      }
    })
    await this.theme2.waitFor({ timeout: 60000 })
    await page.waitForTimeout(300)
    await this.theme2.click({ timeout: 80000 })
    await page.waitForTimeout(500)
    // await Promise.all([
    //   page.waitForResponse(
    //     async (resp) =>
    //       resp.url().endsWith('storefront?index=&_data=routes%2Fbrand.store.storefront') &&
    //       resp.status() === 200 &&
    //       (await resp.text()).includes('branding'),
    //     {
    //       timeout: 120000,
    //     }
    //   ),
    await this.confirmButton.click({ timeout: 100000 })
    // ]).catch(async () => {
    //   await page.waitForTimeout(300)
    //   if ((await page.$('text=ETIMEDOUT')) !== null) {
    //     await this.theme2.click({ timeout: 80000 })
    //     await this.confirmButton.waitFor()
    //     await this.confirmButton.click({ timeout: 100000 })
    //   } else if ((await page.$('text=Error')) !== null) {
    //     await page.reload({ timeout: 60000 })
    //   }
    // })
    await page.waitForTimeout(3000)
    await storeSettings.storeSettingsLink.scrollIntoViewIfNeeded({ timeout: 40000 })
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('settings?_data=routes%2Fbrand.store.storefront.settings') &&
          resp.status() === 200 &&
          (await resp.text()).includes('categories'),
        {
          timeout: 120000,
        }
      ),
      await storeSettings.storeSettingsLink.click(),
    ]).catch(async () => {
      await page.waitForTimeout(300)
      if ((await page.$('text=Error')) !== null) {
        await page.reload({ timeout: 60000 })
      } else {
        await page.reload({ timeout: 60000 })
      }
    })
    await storeSettings.statusSelect.selectOption('ACTIVE')
    await expect(storeSettings.billingSelect).toHaveCount(1)
    await expect(page.getByText('Update Store Status')).toHaveCount(1)
    await page.getByRole('button', { name: 'Confirm' }).click()
    // await Promise.all([
    //   page.waitForResponse(
    //     (resp) =>
    //       resp.url().endsWith('settings?_data=routes%2Fbrand.store.storefront.settings') &&
    //       resp.status() === 200,
    //     {
    //       timeout: 120000,
    //     }
    //   ),
    //   await storeSettings.saveChangesButton.click(),
    // ]).catch(async () => {
    //   await page.waitForTimeout(500)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload({ timeout: 60000 })
    //   }
    // })
    // await page.waitForTimeout(1400)
    // if ((await page.$('text=ETIMEDOUT')) !== null) {
    //   await page.waitForTimeout(200)
    //   await storeSettings.saveChangesButton.click()
    // }
    // const loading = page.locator('text=Loading...')
    // await expect(loading).toHaveCount(0, { timeout: 80000 })
    // await storeSettings.saveChangesButton.waitFor({ state: 'detached' })
  }

  async user_lands_on_the_storefront_page(page: Page) {
    const url = await page.url()
    await expect(url).toContain('/storefront')
  }

  async a_user_selects_the_Logo_edit_icon(page: Page) {
    await this.editLogoButton.click()
  }

  async uploads_an_image_for_a_Logo(page: Page) {
    await page.waitForTimeout(200)
    await page.setInputFiles(
      'label:has-text("Add Media")',
      'test/brand/support/images/evening.png',
      {
        timeout: 99000,
      }
    )
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 80000 })
    await page.waitForTimeout(200)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    const addImageLabel = page.locator('text=Add Media')
    await expect(addImageLabel).toHaveCount(0, { timeout: 80000 })
  }

  async uploads_a_new_image_for_a_Logo(page: Page) {
    await page.waitForTimeout(200)
    await page.setInputFiles(
      'label:has-text("Replace Image") >> nth=0',
      'test/brand/support/images/evening.png',
      {
        timeout: 99000,
      }
    )
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 80000 })
    await page.waitForTimeout(200)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  async a_user_selects_the_Favicon_edit_icon(page: Page) {
    await this.editFaviconButton.click()
  }

  async user_will_be_able_to_upload_an_image_for_a_Favicon(page: Page) {
    await page.waitForTimeout(200)
    await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes('branding-image') && resp.status() === 200,
        {
          timeout: 130000,
        }
      ),
      await page.setInputFiles(
        'label:has-text("Replace Image") >> nth=1',
        'test/brand/support/images/favicon.ico'
      ),
    ]).catch(async () => {
      await Promise.all([
        page.waitForResponse((resp) => resp.url().includes('/branding/') && resp.status() === 200, {
          timeout: 120000,
        }),
        await page.setInputFiles(
          'label:has-text("Replace Image") >> nth=1',
          'test/brand/support/images/favicon.ico'
        ),
      ]).catch(async () => {
        await page.setInputFiles(
          'label:has-text("Replace Image") >> nth=1',
          'test/brand/support/images/favicon.ico'
        )
      })
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 99000 })
  }
  async a_user_uses_the_Font_drop_to_select_a_Font(page: Page) {
    await this.fontSelect.selectOption('Arial')
  }

  async the_Save_Changes_confirmation_banner_is_displayed(page: Page) {
    const saveButton = await page.locator('button:text-is("Save Changes")')
    await expect(saveButton).toBeVisible({ timeout: 199000 })
    const cancelButton = page.locator('button:text-is("Cancel")')
    await expect(cancelButton).toHaveCount(1, { timeout: 80000 })
  }

  async a_user_enters_an_SEO_title(page: Page) {
    const navbar = new Navbar(page)
    await page.waitForTimeout(2000)
    await this.titleInput.fill('Addition')
    await page.waitForTimeout(2000)
    await expect(this.titleInput).toHaveValue('Addition')
    await page.waitForTimeout(900)
    const saveButton = page.locator('button:text-is("Save Changes")')
    await saveButton.scrollIntoViewIfNeeded()
    await expect(saveButton).toBeVisible()
    await Promise.all([
      page.waitForResponse(
        async (resp) =>
          resp.url().endsWith('storefront?_data=routes%2Fbrand.store.storefront._index') &&
          resp.status() === 200 &&
          (await resp.text()).includes('Addition'),
        {
          timeout: 120000,
        }
      ),
      await saveButton.click({ force: true }),
    ]).catch(async () => {
      if ((await page.$('text=Save Changes')) !== null) {
        await saveButton.click({ force: true })
      }
    })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
    //await navbar.getAlert('Branding settings updated.')
    const value = await this.titleInput.inputValue()
    if ((await value) !== 'Addition') {
      await this.titleInput.fill('Addition')
      await page.waitForTimeout(2000)
      await expect(this.titleInput).toHaveValue('Addition')
      await page.waitForTimeout(900)
      const saveButton = page.locator('button:text-is("Save Changes")')
      await saveButton.scrollIntoViewIfNeeded()
      await expect(saveButton).toBeVisible()
      await saveButton.click({ force: true })
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 199000 })
      await page.waitForTimeout(1200)
      if ((await page.$('text=Error')) !== null) {
        await page.reload()
      } else if ((await page.$('text= ETIMEDOUT')) !== null) {
        return true
      } else if ((await page.$('text=Save Changes')) !== null) {
        await saveButton.click({ force: true })
        const loading = page.locator('text=Loading...')
        await expect(loading).toHaveCount(0, { timeout: 199000 })
      } else {
        await navbar.getAlert('Branding settings updated.')
      }
    }
  }
  async a_user_enters_a_Description(page: Page) {
    await page.waitForTimeout(200)
    await this.descriptionInput.fill(
      'Deleniti ad consectetur. Commodi corrupti fuga excepturi explicabo.'
    )
    await page.waitForTimeout(200)
    if ((await page.$('text=Oh no. An unexpected error has occurred')) !== null) {
      await page.reload()
    }
  }

  async viewing_the_stores_page_source_displays_the_title_and_description(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click({ force: true })
    await storeSettings.gotoHttpStore()
    const metaDescription = await page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute(
      'content',
      'Deleniti ad consectetur. Commodi corrupti fuga excepturi explicabo.',
      { timeout: 80000 }
    )
    const metaTitle = await page.title()
    await expect(metaTitle).toContain('Addition')
  }

  async user_clicks_Save_Changes(page: Page) {
    await page.waitForTimeout(1000)
    const saveButton = page.locator(`button:has-text("Save Changes")`)
    await saveButton.click({ force: true })
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 199000 })
  }

  async a_user_selects_a_theme(page: Page) {
    await this.theme2.click({ timeout: 90000 })
  }

  async the_Change_Theme_confirmation_appears(page: Page) {
    const switchingText = page.locator(
      'text=By switching to Theme2, all of your current theme changes will be lost.'
    )
    await expect(switchingText).toBeVisible({ timeout: 90000 })
  }

  async selecting_Confirm(page: Page) {
    await this.confirmButton.click()
  }

  async the_store_is_updated_to_the_selected_theme(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click()
    await storeSettings.gotoHttpStore()
    //theme 2 would have count 1, theme 1 would have count 2
    const cat = page.locator('img[src="/brand/themes/category.png"]')
    await expect(cat).toHaveCount(1)
  }

  async user_selects_Theme_Editor_Link(page: Page) {
    const storeSettings = new StoreSettings(page)
    await page.waitForTimeout(200)
    await storeSettings.themeEditorLink.click()
  }

  async user_lands_on_Navbar(page: Page) {
    const navbarHeader = page.locator(`h2:text-is('Navbar')`)
    await expect(navbarHeader).toBeVisible({ timeout: 90000 })
  }

  async a_user_selects_add_image(page: Page) {
    await this.addLogoButton.click()
  }

  async a_user_selects_replace_image(page: Page) {
    await this.replaceImageButton.click()
  }

  async the_store_Navbar_will_contain_an_image(page: Page, storeName: string) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click()
    await storeSettings.gotoHttpStore()
    const logo = page.getByRole('link', { name: storeName }).first()
    await expect(logo).toBeVisible()
    const title = page.locator('text=Addition')
    await expect(title).toHaveCount(0)
  }

  async the_store_Navbar_will_contain_a_title(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click()
    await storeSettings.gotoHttpStore()
    const logo = page.getByRole('link', { name: 'Logo' }).first()
    await expect(logo).toHaveCount(0)
    const title = page.locator('text=Addition')
    await expect(title).toBeVisible()
  }

  async the_user_returns_to_the_storefront(page: Page) {
    await gotoWithRetry(page, `${baseURL.use?.baseURL}/brand/store/storefront/`, 5)
    await page.waitForTimeout(600)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
  }

  async deletes_the_previously_added_logo(page: Page) {
    await page.waitForTimeout(200)
    const activeText = await page.locator('text=Active')
    await expect(activeText).toBeVisible({ timeout: 99000 })
    await page.getByRole('button', { name: 'Upload Image' }).click()
  }

  async adds_a_Title(page: Page) {
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Save Changes')).toHaveCount(0, { timeout: 99000 })
    await this.titleInput.fill('Addition')
    await page.waitForTimeout(2000)
    await expect(this.titleInput).toHaveValue('Addition')
  }

  async a_user_selects_the_Add_Link_button(page: Page) {
    const addLinkButton = await page.locator(`[aria-label="Add Link"]`)
    await addLinkButton.click()
  }

  async adds_a_Link_Text_and_type(page: Page) {
    await page.waitForTimeout(200)
    await expect(page.locator('text=Link Text')).toBeVisible({ timeout: 90000 })
    await this.linkTextInput.pressSequentially('linktexthere', { delay: 200 })
    await this.linkType.selectOption({ label: 'URL' })
    await this.targetInput.pressSequentially('http://www.google.com')
    const saveButton = page.locator(`button:text-is("Save")`)
    await saveButton.click({ force: true })
    await page.waitForTimeout(200)
  }

  async the_store_Navbar_displays_the_Link_Text(page: Page) {
    await expect(page.locator(`text=linktexthere`)).toBeVisible()
  }
  async user_lands_on_Hero(page: Page) {
    await page.waitForTimeout(600)
    if ((await page.$('text=Hero')) === null) {
      await page.reload()
      await page.waitForTimeout(300)
    }
    await page.locator('[data-testid="ZSidebar_grid"] >> text=Hero', {}).click()
    const activeText = page.locator('text=Active')
    await expect(activeText).toHaveCount(1, { timeout: 100000 })
  }

  async a_user_selects_to_upload_image(page: Page) {
    await this.replaceImageButton.click()
  }

  async adds_a_hero_image(page: Page) {
    await page.waitForTimeout(200)
    await page.setInputFiles(
      'label:has-text("Replace Image")',
      'test/brand/support/images/evening.png',
      {
        timeout: 99000,
      }
    )
    const loading = page.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await page.waitForTimeout(300)
    if ((await page.$('text=File Upload Error')) !== null) {
      await page.setInputFiles(
        'label:has-text("Replace Image")',
        'test/brand/support/images/evening.png',
        {
          timeout: 99000,
        }
      )
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 90000 })
    } else if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else if ((await page.$('img[src*="branding"]')) === null) {
      await page.setInputFiles(
        'label:has-text("Replace Image")',
        'test/brand/support/images/evening.png',
        {
          timeout: 99000,
        }
      )
      const loading = page.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 90000 })
    }
  }
  async selects_Save_Changes(page: Page) {
    const navbar = new Navbar(page)
    await navbar.saveChangesButton.click()
    await navbar.getAlert('Theme Updated')
  }

  async enters_a_Heading(page: Page) {
    const hero = new Hero(page)
    heading = faker.company.catchPhrase()
    await hero.headingInput.fill(heading)
  }

  async enters_a_Description(page: Page) {
    const hero = new Hero(page)
    await hero.descriptionInput.fill('Est cumque debitis et sequi aliquid dolores.')
  }

  async enters_a_Button_Text(page: Page) {
    await this.buttonTextInput.click({ clickCount: 3 })
    await this.buttonTextInput.press('Backspace')
    buttonText = faker.lorem.words(2)
    await this.buttonTextInput.pressSequentially(buttonText, { timeout: 99000 })
  }

  async store_displays_Heading_Description_Button_Text(page: Page) {
    const storeSettings = new StoreSettings(page)
    const hero = new Hero(page)
    const updatedButtonText = await hero.buttonTextInput.inputValue()
    // await Promise.all([
    //   page.waitForResponse(
    //     async (resp) =>
    //       resp.url().includes('settings?_data=routes') &&
    //       resp.status() === 200 &&
    //       (await resp.text()).includes('summary'),
    //     {
    //       timeout: 30000,
    //     }
    //   ),
    await storeSettings.storeSettingsLink.click()
    // ]).catch(async () => {
    //   await page.waitForTimeout(500)
    //   if ((await page.$('text=Error')) !== null) {
    //     await page.reload()
    //   }
    // })
    await storeSettings.gotoHttpStore()
    await page.waitForSelector('img')
    await expect(page.getByRole('heading', { name: heading })).toHaveCount(1, { timeout: 199999 })
    await expect(page.getByText('Est cumque debitis et sequi aliquid dolores.')).toHaveCount(1, {
      timeout: 199999,
    })
    await expect(page.getByRole('button', { name: updatedButtonText })).toHaveCount(1, {
      timeout: 199999,
    })
  }

  async user_selects_Categories(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.categoriesLink.nth(0).click()
    const activeText = page.locator('text=Active')
    await expect(activeText).toHaveCount(1)
  }

  async the_category_image_is_displayed(page: Page) {
    const img = page.locator('img')
    await expect(img).toHaveCount(2)
  }

  async a_user_selects_the_add_category_button(page: Page) {
    const img = page.locator('img')
    await expect(img).toHaveCount(1, { timeout: 199000 })
    await this.addLink.click()
  }

  async uploads_an_image_for_a_Category(page: Page) {
    const form = page.locator('[role="dialog"]:has-text("Category")')
    await expect(form).toHaveCount(1)
    await page.waitForTimeout(200)
    await page.setInputFiles(
      'label:has-text("Add Media")',
      'test/brand/support/images/evening.png',
      {
        timeout: 99000,
      }
    )
    const loading = form.locator('text=Loading...')
    await expect(loading).toHaveCount(0, { timeout: 90000 })
    await page.waitForTimeout(300)
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    } else if ((await page.$('img[src*="branding"]')) === null) {
      await page.setInputFiles(
        'label:has-text("Add Media")',
        'test/brand/support/images/evening.png',
        {
          timeout: 99000,
        }
      )
      const loading = form.locator('text=Loading...')
      await expect(loading).toHaveCount(0, { timeout: 90000 })
    }
    const previewImage = form.locator('img')
    await expect(previewImage).toHaveCount(1, { timeout: 99000 })
    await form.locator('select').selectOption({ label: 'All' })
    const saveButton = form.locator('text=Save')
    await saveButton.click()
  }

  async the_category_image_is_displayed_on_the_site(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click()
    await storeSettings.gotoHttpStore()
    const cat = page.locator('img[src="/brand/themes/category.png"]')
    await expect(cat).toHaveCount(1)
    //tests the new category image is added
    const newCat = page.locator('img[src*="branding"]')
    await expect(newCat).toHaveCount(2)
  }

  async user_selects_Featured(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.featuredLink.nth(0).click()
    const activeText = page.locator('text=Active')
    await expect(activeText).toHaveCount(1)
  }

  async checks_the_toggle_to_make_sure_it_is_active(page: Page) {
    await expect(this.activeToggle).toBeChecked({ checked: true })
  }

  async a_user_adds_a_Heading(page: Page) {
    const heading = faker.lorem.sentences(1)
    await this.headingInput.click({ clickCount: 3 })
    await this.headingInput.press('Backspace')
    await page.waitForTimeout(200)
    await this.headingInput.fill(heading)
  }

  async the_store_Featured_section_displays_the_Heading(page: Page) {
    const storeSettings = new StoreSettings(page)
    const heading = await page
      .locator(`div[role="group"]:has-text("Heading") >> input`)
      .inputValue()
    await storeSettings.storeSettingsLink.click()
    await storeSettings.gotoHttpStore()
    await page.locator('h2:text-is("All")').scrollIntoViewIfNeeded()
    const header = await page.locator(`h2:text-is("${heading}")`)
    await expect(header).toHaveCount(1)
    const newProducts = await page.locator(`h2:text-is("New Products")`)
    await expect(newProducts).toHaveCount(0)
  }

  async selects_Banner(page: Page) {
    const navbar = new Navbar(page)
    await navbar.bannerButton.click()
  }

  async the_store_displays_the_Description(page: Page) {
    const descr = await page.locator(
      `p:text-is("Deleniti ad consectetur. Commodi corrupti fuga excepturi explicabo.")`
    )
    await expect(descr).toHaveCount(1)
  }

  async the_store_displays_the_Button_Text(page: Page) {
    const buttonTxt = await page.locator(`button:text-is("${buttonText}")`)
    await expect(buttonTxt).toHaveCount(1)
  }

  async the_store_displays_the_Section_Heading(page: Page) {
    const storeSettings = new StoreSettings(page)
    const heading = await page
      .locator(`div[role="group"]:has-text("Heading") >> input`)
      .inputValue()
    await storeSettings.storeSettingsLink.click()
    await storeSettings.gotoHttpStore()
    const header = await page.locator(`p:text-is("${heading}")`)
    await expect(header).toHaveCount(1)
  }

  async user_selects_Footer(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.footerLink.click()
    const activeText = page.locator('text=Active')
    await expect(activeText).toHaveCount(1)
  }

  async the_store_displays_the_footer_image(page: Page, storeName: string) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click()
    if ((await page.$('text=Error')) !== null) {
      await page.reload()
    }
    await storeSettings.gotoHttpStore()
    const logo = page.getByRole('link', { name: storeName }).nth(1)
    await expect(logo).toBeVisible()
  }

  async user_selects_to_add_a_link(page: Page) {
    const storeFrontDesign = new StoreFrontDesign(page)
    await storeFrontDesign.addLink.click()
  }

  async the_store_displays_the_footer_title(page: Page) {
    const storeSettings = new StoreSettings(page)
    await storeSettings.storeSettingsLink.click()
    await page.waitForTimeout(80000)
    await storeSettings.gotoHttpStore()
    const title = page.locator('text=Addition')
    await expect(title).toHaveCount(1)
  }

  async the_store_displays_the_Link_Text(page: Page) {
    const newLink = await page.locator(`a:text-is("linktexthere")`)
    await expect(newLink).toHaveCount(1)
  }
}
