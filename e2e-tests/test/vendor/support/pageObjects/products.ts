import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import baseURL from '../../../../playwright.config'

export default class Products {
  readonly page: Page
  readonly productsTab: Locator
  readonly addManuallyButton: Locator
  readonly uploadFromFileButton: Locator
  readonly connectShopifyButton: Locator
  readonly addProductsQuestionText: Locator
  readonly addProductHeader: Locator
  readonly saveAsDraftButton: Locator
  readonly cancelButton: Locator
  readonly addMediaButton: Locator
  readonly categoryDropdown: Locator
  readonly subCategoryDropdown: Locator
  readonly subCategoryFirstItem: Locator
  readonly getAlertAddVariants: Locator
  readonly getAlertProductCreated: Locator
  readonly getAlertSuccess: Locator
  readonly getAlertClose: Locator
  readonly addVariantButton: Locator
  readonly productBrandNameInput: Locator
  readonly productTitleInput: Locator
  readonly productDescriptionInput: Locator
  readonly saveAndSendForApprovalButton: Locator
  readonly goBackButton: Locator
  readonly actionsButton: Locator
  readonly filterProductsInput: Locator
  readonly productsList: Locator
  readonly deleteDrafts: Locator
  readonly modalConfirmButton: Locator
  readonly modalCancelButton: Locator
  readonly closeModalButton: Locator
  readonly bulkDeleteProducts: Locator
  readonly checkboxFirstRow: Locator
  readonly checkboxSelectAll: Locator
  readonly productTableBody: Locator

  constructor(page: Page) {
    this.page = page
    this.productsTab = page.locator('[data-testid="atomic-subnavbar-left"] >> text=Products')
    this.addManuallyButton = page.locator('[data-testid="ui-card"] >> button >> text=Add Manually')
    this.uploadFromFileButton = page.locator('text=UPLOAD FROM A FILE')
    this.connectShopifyButton = page.locator('text=CONNECT TO SHOPIFY')
    this.addProductsQuestionText = page.locator('h2 >> text=How would you like to add products?')
    this.addProductHeader = page.locator('h2 >> text=Add Product')
    this.saveAsDraftButton = page.locator('text=Save as Draft')
    this.cancelButton = page.locator('a:has-text("Cancel")')
    this.addMediaButton = page.locator('text=Add Media')
    this.categoryDropdown = page.locator('#category')
    this.subCategoryDropdown = page.locator('.UiSelectTypeahead__control')
    this.subCategoryFirstItem = page.locator('#react-select-3-option-0')
    this.getAlertAddVariants = page.locator(
      'role=alert >> text=Product variants can be added once the product draft is saved.'
    )
    this.getAlertProductCreated = page.locator('#chakra-toast-manager-top >> text=Product created')
    this.getAlertSuccess = page.locator('#chakra-toast-manager-top >> text=Success!')
    this.getAlertClose = page.locator('#chakra-toast-manager-top [aria-label="Close"]')
    this.addVariantButton = page.locator('button >> text=Add Variant')
    this.productBrandNameInput = page.locator('input[name="brandName"]')
    this.productTitleInput = page.locator('input[name="name"]')
    this.productDescriptionInput = page.locator('textarea[name="description"]')
    this.saveAndSendForApprovalButton = page.locator(
      'button:has-text("SAVE AND SEND FOR APPROVAL")'
    )
    this.goBackButton = page.locator('[aria-label="Go Back"]')
    this.actionsButton = page.locator('button >> text=Actions')
    this.filterProductsInput = page.locator('[placeholder="Filter Products"]')
    this.productsList = page.locator('[data-testid="ui-card"]')
    this.deleteDrafts = page.locator('[role="menu"] >> text=Delete Drafts')
    this.modalConfirmButton = page.locator('section button:has-text("Confirm")')
    this.modalCancelButton = page.locator('section button:has-text("Cancel")')
    this.closeModalButton = page.locator('[data-testid="UiModal_CloseButton"]')
    this.bulkDeleteProducts = page.locator('text=Bulk Delete Products')
    this.checkboxFirstRow = page.locator('[data-testid="tr-checkbox"] span >> nth=0')
    this.checkboxSelectAll = page.locator('[data-testid="th-checkbox"]')
    this.productTableBody = page.locator('table >> tbody')
  }
  async gotoProducts() {
    await this.page.goto(`${baseURL.use?.baseURL}/postal-vendor/products`)
  }
  async user_clicks_on_Products_tab() {
    await this.gotoProducts()
  }

  async user_is_redirected_to_products(page: Page) {
    await page.waitForURL('**/products')
  }

  async new_user_should_see_Products_page(page: Page) {
    await expect(page.url()).toContain('/products')
  }
}
