import { onlyOn } from '@cypress/skip-test'
import { faker } from '@faker-js/faker'
import { addDays, format } from 'date-fns'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  CreateApprovedPostalDocument,
  CreateMagicLinkDocument,
  InviteDocument,
  MagicLinkStatus,
  MarketplaceProduct,
  PaymentPartnerType,
  SearchMarketplaceProductsDocument,
  Status,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Contacts,
  CustomFormFields,
  Delivery,
  MagicLinks,
  Marketplace,
  Reporting,
  SendItem,
  Universal,
} from '../../support/pageObjects'
const today = new Date()
const inTwoDays = addDays(today, 2)
const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
const dateFormatTable = (date: Date) => date.toLocaleDateString()

describe('MagicLinks Testing ', function () {
  const contacts = new Contacts()
  const customFormFields = new CustomFormFields()
  const delivery = new Delivery()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const reporting = new Reporting()
  const sendItem = new SendItem()
  const universal = new Universal()
  const user = userFactory()
  const deliveryPageContactGC = userFactory()
  const deliveryPageContactPC = userFactory()
  const deliveryPageContactPC2 = userFactory()

  function getDeliveryLink(text: string | RegExp) {
    let link = ''
    return universal
      .getRowByText(text)
      .within(() => {
        cy.get('button').then(($link: any) => {
          link = $link.attr('title')
        })
      })
      .then(() => link)
  }

  before(() => {
    cy.signup(user)
    cy.createChipotlePostal()
    cy.createApprovedPostcard()
    cy.createApprovedPostal({ name: 'Def Leppard T-Shirt' })
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 30000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    Cypress.on('uncaught:exception', () => {
      return false
    })
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests the magiclink teaser`, function () {
    magicLinks.visitMagicLinks()
    magicLinks.getTeaserHeader().should('be.visible')
    magicLinks.getTeaserSubHeader().should('be.visible')
    magicLinks.getTeaserCard().within(() => {
      cy.get('img').should('be.visible')
    })
  })

  it(`tests creating magiclinks`, function () {
    magicLinks.visitMagicLinks()
    //tests creating a magiclink with a giftcard
    magicLinks.getCreateAMagicLinkButton().click()
    universal.getUISpinner().should('not.exist')
    cy.wait(500)
    sendItem.getSelectItemDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      cy.contains('a', 'Chipotle').click({ force: true })
    })
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //tests landing page header
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().fill('${user.firstName')
    cy.contains(`We noticed an incomplete message variable:`).should('exist')
    cy.wait(300)
    sendItem
      .getLandingPageHeaderInput()
      .clear()
      .type('${user.firstName}', { parseSpecialCharSequences: false, delay: 400 })
    cy.contains(`We noticed an incomplete message variable:`).should('not.exist')
    cy.contains(300)
    sendItem.getLandingPageHeaderInput().clear().fill('New LP Header')
    //tests the landing Page message
    cy.wait(300)
    sendItem.getLandingPageMessageInput().fill('${user.firstName')
    cy.contains(`We noticed an incomplete message variable:`).should('exist')
    cy.wait(300)
    sendItem
      .getLandingPageMessageInput()
      .clear()
      .type('${user.firstName}', { parseSpecialCharSequences: false, delay: 400 })
    cy.contains(`We noticed an incomplete message variable:`).should('not.exist')
    sendItem.getLandingPageBodySection().within(() => {
      sendItem.getLandingPageMessageInput().clear()
      cy.findAllByRole('button').eq(3).click({ force: true })
      cy.wait(300)
      sendItem.getLandingPageMessageInput().fill('Chipotle LP Message')
    })
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click({ force: true })
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // add a text field and then save it
      customFormFields.getAddCustomFieldTextButton().click()
      customFormFields.getNewCustomFieldQuestion().type('ML field')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('ML field').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
      customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    })
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('ML field').should('exist')
    })
    magicLinks.getEnabledCheckbox().click({ force: true }).should('not.be.checked')
    magicLinks.getMagicLinkNameInput().clear().type('Giftcard MagicLink')
    magicLinks.getOrderLimitInput().should('have.value', '1')
    magicLinks.getExpiresOnInput().should('have.value', '')
    magicLinks
      .getRequiresApprovalCheckbox()
      .should('not.be.checked')
      .click({ force: true })
      .should('be.checked')
    magicLinks.getOrderSummary().should('contain', '$5')
    //tests the order limit and expires on tooltips
    // sendItem.getPersonalizedEmailButton().scrollIntoView()
    // magicLinks.getExpiresOnTooltip().trigger('mouseover', { force: true })
    // magicLinks.getExpiresOnTooltipText().should('exist')
    magicLinks.getOrderLimitTooltip().scrollIntoView().trigger('mouseover')
    magicLinks.getOrderLimitTooltipText().within(() => {
      cy.findByText('Help Center').should(
        'have.attr',
        'href',
        'https://help.postal.com/helpcenter/s/article/Managing-Your-MagicLinks'
      )
    })
    //todo switch Contact Owner to Specific User
    //sendItem.getSendAsSelect().select('Contact Owner')
    sendItem.getReviewButton().click()
    cy.contains('Review').should('exist')
    cy.contains('Chipotle')
    sendItem.getReviewOption().contains('$5')
    sendItem.getReviewMagicLinkSection().within(() => {
      magicLinks.getReviewStatus().contains('Disabled')
      magicLinks.getReviewMagicLinkName().contains('Giftcard MagicLink')
      magicLinks.getReviewOrderLimit().contains('1')
      magicLinks.getReviewExpiresOn().contains('Never')
    })
    sendItem.getCustomizeFieldsButton().should('not.exist')
    cy.contains('div', 'Landing Page').within(() => {
      sendItem.getReviewLandingPageTitle().should('contain', 'New LP Header')
      sendItem.getReviewLandingPageMessage().within(() => {
        cy.contains('Body')
        cy.contains(`Chipotle LP Message`)
      })
      cy.contains('button', 'Preview').click()
    })
    cy.findByRole('dialog').within(() => {
      cy.contains(/Landing Page/)
      cy.findByRole('button', { name: 'Close' }).click()
    })
    sendItem.getReviewItemCosts().should('be.visible')
    universal.stubClipboardPrompt()
    magicLinks.getSaveMagicLinkButton().click({ force: true })
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getSaveMagicLinkButton().click({ force: true })
    })
    cy.contains('Success! Your MagicLink has been created.')
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getRowByText('Giftcard MagicLink').within(() => {
      cy.contains('[data-testid="ui-tag"]', 'On')
    })

    //tests creating a magiclink with a postcard
    magicLinks.getCreateANewLinkButton().click()
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    sendItem.getSelectItemDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      cy.contains('a', 'Postcard').click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    cy.wait(300)
    sendItem.getLandingPageMessageInput().should('exist').fill('Insert Landing Page Message')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click({ force: true })
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // add a text field and then save it
      customFormFields.getAddCustomFieldTextButton().click()
      customFormFields.getNewCustomFieldQuestion().type('ML field 2')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('ML field 2').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    //cy.contains('Choose Method').should('exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('ML field 2').should('exist')
    })
    sendItem.getReviewButton().click()
    cy.contains('Review').should('exist')
    sendItem.getCustomizeFieldsButton().should('not.exist')
    sendItem.getBackButton().eq(0).click({ force: true })
    //cy.contains('Choose Method').should('exist')
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().fill('New Postcard LP Header')
    magicLinks.getEnabledCheckbox().should('be.checked')
    magicLinks.getMagicLinkNameInput().clear().type('Postcard MagicLink')
    magicLinks.getOrderLimitInput().clear().type('2')
    magicLinks.getExpiresOnInput().type(`${dateFormatInput(inTwoDays)}{enter}`)
    magicLinks.getMagicLinkNameInput().click()
    magicLinks.getRequiresApprovalCheckbox().should('not.be.checked').click({ force: true })
    magicLinks
      .getRequiresApprovalTooltip()
      .realHover({ position: 'center', scrollBehavior: 'bottom' })
    magicLinks.getRequiresApprovalTooltipText().should('exist')
    magicLinks.getOrderSummary().should('contain', `Postcard 4"x6"`)
    sendItem.getReviewButton().click()
    cy.contains('Review').should('exist')
    cy.contains('Postcard').should('exist')
    sendItem.getReviewOption().contains('div', 'Postcard 4"x6"')
    sendItem.getReviewMagicLinkSection().within(() => {
      magicLinks.getReviewStatus().contains('Enabled')
      magicLinks.getReviewMagicLinkName().contains('Postcard MagicLink')
      magicLinks.getReviewOrderLimit().contains('2')
      magicLinks.getReviewExpiresOn().contains(dateFormatTable(inTwoDays))
    })
    sendItem.getReviewLandingPageTitle().contains('New Postcard LP Header')
    sendItem.getReviewLandingPageMessage().contains('Insert Landing Page Message')
    sendItem.getReviewItemCosts().should('be.visible')
    universal.stubClipboardPrompt()
    magicLinks.getSaveMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getSaveMagicLinkButton().click({ force: true })
    })
    cy.contains('Success!').should('exist')
    //tests that the info from the create processes made it into the table
    magicLinks.visitMagicLinks()
    universal.getRowByText('Postcard MagicLink').within(() => {
      cy.findByText(`${user.firstName} ${user.lastName}`).should('exist')
      cy.contains(`${dateFormatTable(inTwoDays)}`).should('exist')
      cy.contains(`${dateFormatTable(today)}`).should('exist')
      cy.contains('Enabled').should('exist')
      cy.contains(/^0\/2$/).should('exist')
      universal.getLinkByText('Postcard MagicLink').should('exist')
      cy.get('svg').should('have.length', 3)
    })
    universal.getRowByText('Giftcard MagicLink').within(() => {
      cy.findByText(`${user.firstName} ${user.lastName}`)
      cy.contains(/^0\/1$/).should('exist')
      cy.contains('Never').should('exist')
      cy.contains(`${dateFormatTable(today)}`).should('exist')
      cy.contains('Disabled').should('exist')
      universal.stubClipboardPrompt()
      cy.findByTestId('copy-link').click({ force: true })
      universal.getClipboardPrompt().should('be.called')
    })
    //Tests link to a MagicLink's profile page
    universal.getLinkByText('Giftcard MagicLink').should('exist').click()
    cy.url().should('contain', '/links/')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.findByRole('img').should('be.visible')
    cy.contains('Giftcard MagicLink').should('be.visible')
    //Tests the name filter
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()
    magicLinks.getMagicLinkNameFilter().fill('giftc')
    universal.getRowsInATableBody().should('have.length', 1)
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByText('Postcard MagicLink').should('not.exist')
    universal.getRowByText('Giftcard MagicLink').should('exist')
    magicLinks.getMagicLinkNameFilter().clear()
    universal.getRowsInATableBody().should('have.length', 2)
    //Tests the status filter
    magicLinks.getFiltersButton().click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    magicLinks.getStatusSelectFilter().select('Active', { force: true })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.getRowByText('Postcard MagicLink').should('exist')
    universal.getRowByText('Giftcard MagicLink').should('not.exist')
    magicLinks.getStatusSelectFilter().select('Disabled', { force: true })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.getRowByText('Giftcard MagicLink').should('exist')
    universal.getRowByText('Postcard MagicLink').should('not.exist')
    magicLinks.getStatusSelectFilter().select('', { force: true })
    universal.getRowsInATableBody().should('have.length', 2)
    universal.getRowByText('Postcard MagicLink').should('exist')
    universal.getRowByText('Giftcard MagicLink').should('exist')
    //tests pagination
    cy.magiclinksSeed({ requiresApproval: 'random' })
    cy.wait(300)
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    cy.wait(800)
    cy.get('body').then(($body) => {
      if (!$body.text().includes(`Search`)) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getRowsInATableBody().should('have.length', 10)
    universal.getAngleLeftButton().should('be.disabled')
    universal.getAngleRightButton().click()
    cy.url().should('not.contain', '/links/')
    universal.getRowByText('Giftcard MagicLink').should('exist')
    universal.getRowByText('Postcard MagicLink').should('exist')
    universal.getAngleLeftButton().click()
    universal.getRowsInATableBody().should('have.length', 10)
    //tests owner email filter
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: [`${faker.string.uuid()}@postal.dev`],
        roles: ['USER'],
      },
    }).then((res) => {
      const invite = res.invite?.[0]
      const newUser = userFactory({
        userName: invite?.emailAddress ?? '',
        firstName: 'Owen',
        lastName: 'Erwin',
        company: 'Owen Erwin',
      })
      cy.wait(200)
      cy.completeInvitation({
        id: invite?.invite?.id ?? '',
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        password: newUser.password,
      })
      cy.login(newUser)
      cy.wait(200)
      magicLinks.visitMagicLinks()
      universal.getSpinner().should('not.exist')
      magicLinks.getTeaserCard().should('be.visible')
      cy.magiclinksSeed({ numberOfMagicLinks: 1, requiresApproval: false })
      cy.manageState()

      cy.login(user)
      universal.getSpinner().should('not.exist')
      magicLinks.visitMagicLinks()
      universal.getSpinner().should('not.exist')
      universal.getAllGridCellsByText('Owen Erwin').should('have.length', 1)
      universal.getAllGridCellsByText(`${user.firstName} ${user.lastName}`).should('have.length', 9)
      magicLinks.getFiltersButton().click({ force: true })
      cy.wait(400)
      cy.selectAutoCompleteUser(newUser.userName)
      universal
        .getRowsInATableBody()
        .should('have.length', 1)
        .and('contain', 'Owen Erwin')
        .and('not.contain', `${user.firstName} ${user.lastName}`)
      magicLinks.getMagicLinkOwnerFilter().clear()
      //tests item type filter
      cy.selectAutoCompleteItem('Chipotle')
      universal.progressBarZero()
      universal.getRowsInATableBody().should('have.length', 1)
      universal.getNoItemsMessage().should('not.exist')
      universal
        .getRowByText('Giftcard MagicLink')
        .should('exist')
        .and('contain', `${user.firstName} ${user.lastName}`)
        .and('not.contain', 'Owen Erwin')
      //mocks and checks the sort by created
      cy.graphqlMockSet({
        operationName: 'searchMagicLinks',
        fixture: 'magicLinksMock.json',
        count: 2,
      })
      cy.graphqlMockStart()
      magicLinks.visitMagicLinks()
      universal.getSpinner().should('not.exist')
      universal.getRowsInATableBody().should('have.length', 3).eq(2).should('contain', '12/14/2020')
      universal.getRowsInATableBody().eq(0).should('contain', '12/15/2020')
      cy.graphqlMockSet({
        operationName: 'searchMagicLinks',
        fixture: 'magicLinksMockB.json',
        count: 2,
      })
      magicLinks.getCreatedOnSort().click({ force: true })
      cy.wait(500)
      universal.progressBarZero()
      universal.getRowsInATableBody().should('have.length', 3).eq(0).and('contain', '12/14/2020')
      universal.getRowsInATableBody().eq(2).should('contain', '12/15/2020')
      cy.graphqlMockClear()
    })
  })
  it(`tests a magiclink profile page without any completed orders`, function () {
    magicLinks.visitMagicLinks()
    universal.getAngleRightButton().click({ force: true })
    universal.getLinkByText('Giftcard MagicLink').should('be.visible').click({ force: true })
    universal.getSpinner().should('not.exist')
    cy.url().should('contain', 'links/')
    cy.contains('Giftcard MagicLink', { timeout: 7600 }).should('be.visible')
    magicLinks.getCopyLinkButton().should('exist')
    magicLinks.getPreviewLinkButton().should('exist')
    magicLinks.getQRCodeDetail().should('exist')
    magicLinks.getDetailsCard().within(() => {
      magicLinks.getOrderLimitDetail().should('contain', `1`)
      magicLinks.getOwnerDetail().should('contain', `${user.firstName} ${user.lastName}`)
      magicLinks.getTeamDetail().should('contain', user.company)
      //todo switch Contact Owner to Specific User
      //magicLinks.getSendAsDetail().should('contain', 'Contact Owner')
      magicLinks.getStatusDetail().should('contain', `Disabled`)
      magicLinks.getCreatedOnDetail().should('contain', `${dateFormatTable(today)}`)
      magicLinks.getExpiresOnDetail().should('contain', `Never`)
      magicLinks.getLastOrderDetail().should('contain', `N/A`)
      magicLinks.getLastViewDetail().should('contain', `N/A`)
      magicLinks.getMeetingRequestDetail().should('contain', `No`)
      magicLinks.getSpentFromDetail().should('contain', user.company)
      universal.stubClipboardPrompt()
    })
    magicLinks.getCopyLinkButton().click({ force: true })
    universal.getClipboardPrompt().should('be.called')
    //universal.getPostalCardName().should('be.visible').and('contain', `Chipotle`)
    //universal.getPostalCardOption().should('be.visible').and('contain', `$5`)
    //universal.getPostalCardBrand().should('be.visible').and('contain', `Chipotle`)
    //universal.getPostalCardCategory().should('be.visible').and('contain', `Gift Cards`)
    //universal.getPostalCardPrice().should('be.visible').and('contain', `$5`)
    cy.findByRole('img').should('be.visible')
    magicLinks.getOrdersCard().within(() => {
      universal.getRowsInATableBody().should('have.length', 1).and('contain', 'No items found')
    })
  })
  it(`tests editing a magiclink`, function () {
    magicLinks.visitMagicLinks()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    universal.getAngleRightButton().click({ force: true })
    universal.getLinkByText('Postcard MagicLink').should('be.visible').click({ force: true })
    universal.getSpinner().should('not.exist')
    cy.get('img').should('be.visible')
    magicLinks.getEditMagicLinkLink().click()
    cy.contains('Configure your Item').should('exist')
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.wait(300)
    magicLinks
      .getMagicLinkNameInput()
      .should('have.value', 'Postcard MagicLink')
      .clear()
      .type('Updated Postcard MagicLink')
    sendItem.getLandingPageBodySection().should('contain', 'Insert Landing Page Message')
    //tests editing the Landing Page Header and Landing Page Message
    cy.wait(300)
    sendItem
      .getLandingPageHeaderInput()
      .should('contain', 'New Postcard LP Header')
      .clear()
      .fill('Edited Postcard LP Header')
    cy.wait(800)
    sendItem.getLandingPageMessageInput().clear().fill('Edited Postcard LP Message')
    magicLinks.getOrderLimitInput().should('have.value', '2').clear().type('3')
    magicLinks.getEnabledCheckbox().should('be.checked').click({ force: true })
    magicLinks.getOrderSummary().should('contain', `Postcard 4"x6"`)
    magicLinks
      .getExpiresOnInput()
      .should('have.value', `${dateFormatInput(inTwoDays)}`)
      .clear()
      .type(`${dateFormatInput(addDays(today, 3))}`)
    magicLinks.getMagicLinkNameInput().click()
    sendItem.getReviewButton().click()
    cy.contains('Review').should('exist')
    sendItem.getReviewLandingPageTitle().should('contain', 'Edited Postcard LP Header')
    sendItem.getReviewLandingPageMessage().within(() => {
      cy.contains('Body')
      cy.contains('Edited Postcard LP Message')
    })
    sendItem.getReviewItemCosts().should('be.visible')
    universal.stubClipboardPrompt()
    magicLinks.getUpdateMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getUpdateMagicLinkButton().click({ force: true })
    })
    cy.contains('Success! Your MagicLink has been created.')
    //tests that the edited info makes it into the profile page
    cy.contains('Updated Postcard MagicLink').should('be.visible')
    magicLinks.getOrderLimitDetail().should('contain', '3')
    magicLinks.getExpiresOnDetail().should('contain', `${dateFormatTable(inTwoDays)}`)
    magicLinks.getStatusDetail().should('contain', `Disabled`)

    sendItem.getBackButton().eq(0).click({ force: true })
    cy.url().should('not.contain', '/links/')

    //test that the edited info makes it into the links table
    universal.getAngleRightButton().click({ force: true })
    universal.getRowByText('Updated Postcard MagicLink').within(() => {
      cy.findByText(`${dateFormatTable(inTwoDays)}`)
      cy.findByText(`Disabled`)
      cy.findByText(/^0\/3$/)
    })
  })
  it(`testEnv: tests the delivery page of a non-direct mail magiclink`, function () {
    //tests the delivery page when its disabled.
    magicLinks.visitMagicLinks()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Giftcard MagicLink')) {
        universal.getRowByText('Giftcard MagicLink').should('contain', 'Disabled')
      } else {
        universal.getAngleRightButton().click({ force: true })
        universal.getRowByText('Giftcard MagicLink').should('contain', 'Disabled')
      }
    })

    onlyOn(Cypress.env('testUrl'), () => {
      getDeliveryLink('Giftcard MagicLink').then((link) => {
        delivery.session(null)
        delivery.visit(link)
        cy.url().should('contain', '/delivery/link/')
        delivery.getFeedbackFormHeader().should('contain', 'Disabled')
        cy.contains('Unfortunately, this link has been disabled').should('exist')
      })
    })

    cy.login(user)

    //tests editing the magic link so that its no longer disabled
    //and then navigating to the delivery page
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    universal.getAngleRightButton().click({ force: true })
    universal.getLinkByText('Giftcard MagicLink').click()
    cy.findByRole('img').should('be.visible')
    magicLinks.getEditMagicLinkLink().click()
    cy.contains('Configure your Item').should('exist')
    universal.getCloseButtonByLabelText().should('be.visible')
    magicLinks.getEnabledCheckbox().click({ force: true })
    sendItem.getReviewButton().click()
    cy.contains('Review').should('exist')
    sendItem.getReviewItemCosts().should('be.visible')
    universal.stubClipboardPrompt()
    magicLinks.getUpdateMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getUpdateMagicLinkButton().click({ force: true })
    })
    universal.getClipboardPrompt().should('be.called')
    magicLinks.getStatusDetail().should('contain', 'Enabled')
    magicLinks.visitMagicLinks()
    universal.getAngleRightButton().click()
    universal.getRowByText('Giftcard MagicLink').should('contain', 'Enabled')

    onlyOn(Cypress.env('testUrl'), () => {
      getDeliveryLink('Giftcard MagicLink').then((link) => {
        delivery.session('giftcard-1')
        delivery.visit(link)
        cy.url().should('contain', '/delivery/link/')
        cy.contains('New LP Header').should('exist')
        cy.contains('em', 'Chipotle LP Message').should('exist')
        //tests that the delivery page for non direct mail only renders the contact info field
        delivery.getShippingAddressButton().should('not.exist')
        cy.findAllByRole('img').should('exist')
        delivery.getConsentStatement().should('exist')
        //tests field validations
        delivery.getSubmitButton().as('saveButton')
        delivery
          .getFirstNameInput()
          .getInputValidation('Please fill out this field.')
          .fill(`${deliveryPageContactGC.firstName}`)
        cy.get('@saveButton').click({ force: true })
        delivery
          .getLastNameInput()
          .getInputValidation('Please fill out this field.')
          .fill(`${deliveryPageContactGC.lastName}`)
        cy.get('@saveButton').click({ force: true })
        // TODO: dusty
        // This validation isn't built into form fields, but perhaps we should find a way to hack it
        // delivery.getEmailInput().getInputValidation('Please fill out this field.').as('email').fill('not_an_email')
        // cy.get('@saveButton').click({ force: true })
        delivery
          .getEmailInput()
          .getInputValidation(`Please fill out this field.`)
          .fill(`${deliveryPageContactGC.userName}`)
        delivery.getTitleInput().fill(`${deliveryPageContactGC.title}`)
        delivery.getCompanyInput().fill(`${deliveryPageContactGC.company}`)
        delivery
          .getMLFieldInput()
          .getInputValidation(`Please fill out this field.`)
          .fill('Added Field')
        //tests editing the contact info
        delivery
          .getFirstNameInput()
          .should('have.value', deliveryPageContactGC.firstName)
          .clear()
          .fill(`${deliveryPageContactGC.firstName}Up`)
        delivery
          .getLastNameInput()
          .should('have.value', deliveryPageContactGC.lastName)
          .clear()
          .fill(`${deliveryPageContactGC.lastName}Up`)
        delivery
          .getEmailInput()
          .should('have.value', deliveryPageContactGC.userName)
          .clear()
          .fill(`up${deliveryPageContactGC.userName}`)
        delivery
          .getTitleInput()
          .should('have.value', deliveryPageContactGC.title)
          .clear()
          .fill(`${deliveryPageContactGC.title}Up`)
        delivery
          .getCompanyInput()
          .should('have.value', deliveryPageContactGC.company)
          .clear()
          .fill(`${deliveryPageContactGC.company}Up`)
        delivery
          .getMLFieldInput()
          .should('have.value', 'Added Field')
          .clear()
          .fill('Added Field Up')
        delivery.getSubmitButton().click()
        delivery.getSayThanksForm().should('exist')
        cy.url().then((url) => {
          expect(url).to.include('/delivery/acceptance/')
        })
      })
    })
  })

  it(`testEnv: tests the delivery page of a direct mail magiclink`, () => {
    magicLinks.visitMagicLinks()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
        cy.wait(400)
      }
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Updated Postcard MagicLink')) {
        universal.getLinkByText('Updated Postcard MagicLink').click()
      } else {
        universal.getAngleRightButton().click({ force: true })
        universal.getLinkByText('Updated Postcard MagicLink').click()
      }
    })
    cy.findAllByRole('img').should('be.visible')
    magicLinks.getEditMagicLinkLink().should('be.visible').click()
    cy.contains('Configure your Item').should('exist')
    cy.contains('div', 'Status: Disabled')
      .should('be.visible')
      .findByRole('checkbox')
      .check({ force: true })
    cy.contains('div', 'Status: Active').findByRole('checkbox').should('be.checked')
    sendItem.getReviewItemCosts().should('be.visible')
    sendItem.getReviewButton().click()
    cy.contains('Review').should('exist')
    universal.stubClipboardPrompt()
    magicLinks.getUpdateMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getUpdateMagicLinkButton().click({ force: true })
    })
    universal.getClipboardPrompt().should('be.called')
    magicLinks.visitMagicLinks()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    universal.getAngleRightButton().click()
    universal.getRowByText('Updated Postcard MagicLink').should('contain', 'Enabled')

    onlyOn(Cypress.env('testUrl'), () => {
      universal.getRowByText('Updated Postcard MagicLink').find('a').should('have.length', 2)

      getDeliveryLink('Updated Postcard MagicLink').then((link) => {
        delivery.session('postcard-1')
        delivery.visit(link)
        cy.findByText('Disabled').should('not.exist')
        cy.contains(`Edited Postcard LP Header`).should('exist')
        cy.contains('Edited Postcard LP Message').should('exist')
        delivery.getShippingAddressButton().should('exist')
        delivery.getFirstNameInput().fill(deliveryPageContactPC.firstName)
        delivery.getLastNameInput().should('be.visible').fill(deliveryPageContactPC.lastName)
        delivery.getEmailInput().clear().fill(deliveryPageContactPC.userName)
        delivery.getTitleInput().fill(`${deliveryPageContactPC.title}`)
        delivery.getCompanyInput().fill(`${deliveryPageContactPC.company}`)
        delivery.getMLField2Input().fill('Added Field 2')
        delivery.getShippingAddressButton().click()
        delivery.getAddDetailsButton().click({ force: true })
        delivery.getShippingDrawer().within(() => {
          universal.getCloseButtonByLabelText().should('be.visible')
          universal.getSaveButton().should('be.visible').click({ force: true })
          delivery
            .getStreetAddress1Input()
            .should('be.visible')
            .getInputValidation('Please fill out this field.')
            .fill('1250 Peach Street')
          universal.getSaveButton().click({ force: true })
          delivery.getCityInput().getInputValidation('Please fill out this field.')
          delivery.getStreetAddress2Input().should('be.visible').fill('Apt 1')
          delivery.getCityInput().fill('San Luis Obispo')
          universal.getSaveButton().click({ force: true })
          delivery.getStateInputRegEx('Arkansas')
          universal.getSaveButton().click({ force: true })
          cy.getAutoCompleteValue('AutoCompleteCountry').should('not.be.empty')
          universal.getSaveButton().click({ force: true })
          delivery
            .getPostalCodeInput()
            .getInputValidation('Please fill out this field.')
            .fill('93408')
          universal.getSaveButton().click({ force: true })
        })
        universal.getCloseButtonByLabelText().should('be.visible')
        delivery.getUnknownAddressHelper().should('be.visible')
        delivery.getFixItButton().click({ force: true })
        delivery.getPostalCodeInput().clear().fill('93401')
        delivery.getStateInputRegEx('California')
        cy.selectAutoCompleteCountry('New Zealand')
        universal.getSaveButton().click({ force: true })
        delivery.getOnlyUSShippingHelper().should('be.visible')
        delivery.getTryAgainButton().click({ force: true })
        cy.selectAutoCompleteCountry('United States')
        //remove later
        // delivery.getStateInputRegEx('California')
        universal.getSaveButton().click({ force: true })
        delivery.getMatchingAddressHelper().should('be.visible')
        delivery.getUseVerifiedButton().click({ force: true })
        delivery.getShippingCard().within(() => {
          cy.findByText(`1250 Peach St Apt 1`)
          cy.findByText(`San Luis Obispo, CA 93401`)
          cy.findByText(`USA`)
          delivery.getEditLink().click({ force: true })
        })
        //tests editing the address
        delivery.getShippingDrawer().within(() => {
          universal.getCloseButtonByLabelText().should('be.visible')
          delivery.getStreetAddress1Input().fill('89075 562 Ave')
          delivery.getStreetAddress2Input().clear()
          delivery.getCityInput().fill('Hartington')
          delivery.getStateInput().fill('NE')
          delivery.getPostalCodeInput().clear().fill('68739')
          delivery.getPhoneNumberInput().fill('7582345167')
          cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
          universal.getSaveButton().click({ force: true })
        })
        delivery.getUseVerifiedButton().click({ force: true })
        delivery.getShippingCard().within(() => {
          cy.findByText(`89075 562 Ave`)
          cy.findByText(`Hartington, NE 68739`)
          cy.findByText(`USA`)
          cy.findByText(`7582345167`)
        })
        delivery.getSubmitButton().click()
        delivery.getSayThanksForm().should('exist')
        cy.url().should('contain', '/delivery/acceptance/')
        Cypress.session.getCurrentSessionData().then((session) => {
          console.log('SESSION', session)
        })

        cy.login(user)
        //tests approving the Order
        magicLinks.visitMagicLinks()
        universal.getAngleRightButton().click({ force: true })
        universal.getRowByText('Updated Postcard MagicLink').within(() => {
          universal.getLinkByText('Updated Postcard MagicLink').click({ force: true })
        })
        cy.findAllByTestId('spinner').should('not.exist')
        cy.contains('No items found').should('not.exist')
        magicLinks.getOrdersCard().within(() => {
          universal
            .getRowByText(`${deliveryPageContactPC.firstName} ${deliveryPageContactPC.lastName}`)
            .should('contain', 'Postcard')
            .and('contain', 'Needs Approval')
            .and('contain', dateFormatTable(today))
            .findAllByRole('button')
            .eq(1)
            .click()
          cy.findByRole('menuitem', { name: 'Approve Order' }).click({ force: true })
          universal
            .getRowByText(`${deliveryPageContactPC.firstName} ${deliveryPageContactPC.lastName}`)
            .should('not.contain', 'Needs Approval')
            .and('contain', 'Processing')
        })

        delivery.session('postcard-1')
        delivery.visit(link)
        cy.url().should('contain', '/delivery/acceptance')
        Cypress.session.getCurrentSessionData().then((session) => {
          console.log('SESSION', session)
        })
        delivery.getOrderStatusHeading().should('exist')
        delivery.getMagicLinkStatusCheck().should('have.text', 'Processing')

        //tests another order
        delivery.session('postcard-2')
        delivery.visit(link)
        delivery.getFirstNameInput().fill(deliveryPageContactPC2.firstName)
        delivery.getLastNameInput().fill(deliveryPageContactPC2.lastName)
        delivery.getEmailInput().clear().fill(deliveryPageContactPC2.userName)
        delivery.getTitleInput().fill(`${deliveryPageContactPC2.title}`)
        delivery.getCompanyInput().fill(deliveryPageContactPC2.company)
        delivery.getMLField2Input().fill('Another order')
        delivery.getShippingAddressButton().click()
        delivery.getAddDetailsButton().click({ force: true })
        delivery.getAddressLabelInput().clear().fill('Work')
        delivery.getStreetAddress1Input().fill('783 Peppermint Way')
        delivery.getCityInput().fill('San Luis Obispo')
        // delivery.getStateInputRegEx('California')
        delivery.getPostalCodeInput().fill('93401')
        cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
        universal.getSaveButton().click({ force: true })
        delivery.getUseVerifiedButton().click({ force: true })
        delivery.getSubmitButton().click({ force: true })
        delivery.getSayThanksForm().should('exist')
      })
    })
  })

  it(`testEnv: tests the delivery page of a display name item's magiclink`, () => {
    //creates a approved book item with a display name
    cy.graphqlRequest(SearchMarketplaceProductsDocument, {
      filter: {
        name: {
          eq: 'Everybody Lies: Big Data, New Data, and What the Internet Can Tell Us About Who We Really Are',
        },
      },
    }).then((res: any) => {
      const product = res.searchMarketplaceProducts?.[0] as MarketplaceProduct
      cy.graphqlRequest(CreateApprovedPostalDocument, {
        marketplaceProductId: product.id,
        data: {
          name: 'Everybody Lies',
          description: 'Everybody Lies Description',
          displayName: 'Everybody Lies Display Name',
          status: Status.Active,
          items: [{ variant: product.variants?.[0].id ?? '', marketplaceProductId: product.id }],
          version: '2',
        },
      }).then((res: any) => {
        cy.graphqlRequest(CreateMagicLinkDocument, {
          data: {
            name: 'Book MagicLink',
            status: MagicLinkStatus.Active,
            message: 'MagicLink Message',
            maxExecutions: 8,
            approvedPostalId: res?.createApprovedPostal.postal.id,
            variantId: res?.createApprovedPostal.postal.variants?.[0].id,
          },
        })
        magicLinks.visitMagicLinks()
        onlyOn(Cypress.env('testUrl'), () => {
          universal.getRowByText('Book MagicLink').find('a').should('have.length', 2)

          getDeliveryLink('Book MagicLink').then((link) => {
            delivery.session('book-1')
            delivery.visit(link)
            //tests that the Display name renders on the delivery Page
            cy.findByText('Everybody Lies Display Name').should('exist')

            //test that the shipping renders
            delivery.getShippingAddressButton().should('exist')
            delivery.getFirstNameInput().fill('Display')
            delivery.getLastNameInput().fill('Name')
            delivery.getEmailInput().clear().fill('displayName@postal.dev')
            delivery.getShippingAddressButton().click()
            delivery.getAddDetailsButton().click({ force: true })
            delivery.getAddressLabelInput().clear().fill('Work')
            delivery.getStreetAddress1Input().fill('783 Peppermint Way')
            delivery.getCityInput().fill('San Luis Obispo')
            // delivery.getStateInputRegEx('California')
            delivery.getPostalCodeInput().fill('93401')
            cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
            universal.getSaveButton().click({ force: true })
            delivery.getUseVerifiedButton().click({ force: true })
            delivery.getSubmitButton().click({ force: true })
            //delivery.getOrderProcessingText().should('exist')
            //delivery.getOnTheWayText().should('exist')
            //delivery.getItemProcessingText().should('exist')
            const thankYouNote = faker.lorem.paragraph(1)
            delivery
              .getSayThanksForm()
              .should('exist')
              .within(() => {
                delivery.getThanksInput().type(thankYouNote, { force: true })
              })
            delivery.getSendMessageButton().click({ force: true })
            delivery.getHeresWhatYouSaidSection().should('contain', thankYouNote)
            delivery.getShareYourExperienceSection().within(() => {
              delivery.getLinkedInButton().should('exist')
              delivery.getTwitterButton().should('exist')
              delivery.getFacebookButton().should('exist')
            })
            //tests that the Variant name renders on the delivery Acceptance Page
            cy.findAllByText('Hardcover').should('exist')

            // back to app user session
            cy.login(user)

            //edits the DisplayName and tests the edit shows up on the delivery and acceptance Pages
            marketplace.visitMyItems()
            universal.getSpinner().should('not.exist')
            cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
            universal.getUISpinner().should('not.exist')
            cy.get('body').then(($body) => {
              if (!$body.text().includes('Everybody Lies')) {
                cy.wait(3100)
                cy.reload()
              }
            })
            cy.contains('Everybody Lies').should('be.visible')
            marketplace.getNewPostalByName('Everybody Lies').click()
            cy.wait(800)
            marketplace.getEditButton().click()
            marketplace.getDisplayNameInput().clear().type('Edited DisplayName', { force: true })
            marketplace.getUpdatePostalButton().click({ force: true })

            // back to the delivery session
            delivery.session('book-1')
            delivery.visit(link)
            cy.findByText('Contact details').should('not.exist')
            cy.findByText('You said:').should('exist')
            delivery.getLinkedInButton().should('be.visible')
            //cy.findByText('Edited DisplayName').should('exist')

            delivery.session('book-2')
            delivery.visit(link)
            cy.findByText('Contact details').should('exist')
            cy.findByText('You said:').should('not.exist')
            cy.findByText('Edited DisplayName').should('exist')
          })
        })
      })
    })
  })

  it(`testEnv: tests expired magiclinks - orderlimit and date after acceptance`, () => {
    onlyOn(Cypress.env('testUrl'), () => {
      //test expiration by reached order limit
      magicLinks.visitMagicLinks()
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
      universal.getAngleRightButton().click({ force: true })

      universal.getRowByText('Giftcard MagicLink').find('a').should('have.length', 2)

      getDeliveryLink('Giftcard MagicLink').then((link) => {
        // check pending approval status
        delivery.session('giftcard-1')
        delivery.visit(link)
        cy.url().then((url) => {
          expect(url).to.include('/delivery/acceptance/')
        })
        delivery.getSayThanksForm().should('exist')
        cy.findByTestId('Status_Form_Header').should('contain', 'Order Pending Approval')
      })

      cy.login(user)
      //checks that the waiting for your approval notification exists in recent activity
      reporting.visitRecentActivity()
      cy.contains('waiting for your approval').should('exist')
      //approves the order
      magicLinks.visitMagicLinks()
      universal.getSpinner().should('not.exist')
      magicLinks.getRequireApprovalBannerText(2).should('be.visible')
      magicLinks.getApproveNowButton().click({ force: true })
      //tests of the Approve Deny Modal
      cy.contains('Bulk Approval').should('exist')
      universal.getTableHeader().should('contain', magicLinks.approveDenyModalHeaderText())
      universal.getRowsInATableBody().should('have.length', 2)
      universal
        .getRowByText(`${deliveryPageContactPC2.firstName} ${deliveryPageContactPC2.lastName}`)
        .and('contain', 'Postcard')
        .and('contain', deliveryPageContactPC2.userName)
      universal
        .getRowByText(`${deliveryPageContactGC.firstName}Up ${deliveryPageContactGC.lastName}Up`)
        .should('contain', 'Chipotle')
        .and('contain', deliveryPageContactGC.userName)
      cy.contains('button', 'Deny 1 Orders').should('not.exist')
      cy.contains('button', 'Approve 1 Orders').should('not.exist')
      cy.clickCheckbox({ name: 'Chipotle' })
      cy.contains('button', 'Deny 1 Orders').should('exist')
      cy.contains('button', 'Approve 1 Orders').should('exist').click({ force: true })
      cy.contains('section', 'Approve Orders').within(() => {
        cy.contains('button', 'Approve').click()
      })
      universal.getRowByText('Chipotle').should('not.exist')
      universal.getBackToButton('links').click({ force: true })
      cy.contains('Bulk Approval').should('not.exist')
      // cy.graphqlRequest(SearchMagicLinksDocument, {
      //   filter: {
      //     name: { contains: 'Giftcard MagicLink' },
      //   },
      // }).then((res) => {
      //   cy.queryForUpdateRecurse({
      //     request: GetMagicLinkDocument,
      //     options: { id: res.searchMagicLinks?.[0].id },
      //     operationName: 'getMagicLink',
      //     key: 'metrics',
      //     value: 1,
      //     key2: 'accepted',
      //   })
      // })
      cy.wait(1000)
      magicLinks.visitMagicLinks()
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
      universal.getAngleRightButton().click({ force: true })

      getDeliveryLink('Giftcard MagicLink').then((link) => {
        universal.getRowByText('Giftcard MagicLink').then(($gm: any) => {
          if (/^1\/1$/.test($gm.text())) {
            delivery.session('giftcard-1')
            delivery.visit(link)
            delivery.getComingSoonToYourInboxText().should('exist')

            delivery.session(null)
            delivery.visit(link)
            delivery.getFeedbackFormHeader().contains('Maximum Redemptions Met')
            cy.contains(
              'Unfortunately, this link has reached its maximum number of redemptions'
            ).should('exist')
          } else if (/^0\/1$/.test($gm.text())) {
            delivery.session('giftcard-1')
            delivery.visit(link)
            delivery.getComingSoonToYourInboxText().should('exist')
          }
        })
      })

      //tests the recent activity for approved notification
      reporting.visitRecentActivity()
      cy.contains('approved for your team').should('exist')
      //tests expiration by date
      magicLinks.visitMagicLinks()
      universal.getSpinner().should('not.exist')
      universal.getRowByText(RegExp('1/12/2021', 'g')).find('a').should('have.length', 2)

      getDeliveryLink(RegExp('1/12/2021', 'g')).then((link) => {
        delivery.session(null)
        delivery.visit(link)
        delivery.getFeedbackFormHeader().contains(/Link Expired/)
        cy.contains(`Unfortunately this link has expired`).should('exist')
      })
    })
  })

  it(`testEnv: tests that updates made in into contacts, reporting, and magicLinks info`, function () {
    onlyOn(Cypress.env('testUrl'), () => {
      //tests that Delivery Page contacts info made it into contacts
      contacts.visitContacts()
      //tests that the entered giftcard contact info shows up in the contacts table
      universal.progressBarZero()
      cy.contains(`${deliveryPageContactGC.title}Up`, { timeout: 200000 }).should('be.visible')
      universal.getRowByText(`${deliveryPageContactGC.firstName}Up`).within(() => {
        cy.contains(`${deliveryPageContactGC.title}Up`).should('exist')
        cy.contains(`${deliveryPageContactGC.company}Up`).should('exist')
        universal
          .getLinkByText(`${deliveryPageContactGC.firstName}Up ${deliveryPageContactGC.lastName}Up`)
          .click({ force: true })
      })
      //tests that the entered giftcard contact info shows up in the contact profile
      universal.getSpinner().should('not.exist')
      universal.progressBarZero()
      cy.contains(`${deliveryPageContactGC.title}Up`, { timeout: 200000 }).should('be.visible')
      contacts
        .getContactInfoCard(
          `${deliveryPageContactGC.firstName}Up ${deliveryPageContactGC.lastName}Up`
        )
        .within(() => {
          cy.contains(`${deliveryPageContactGC.title}Up`).should('exist')
          cy.contains(`${deliveryPageContactGC.company}Up`).should('exist')
          cy.findByText(`up${deliveryPageContactGC.userName}`).should('exist')
          cy.findByText(`${deliveryPageContactGC.firstName}Up ${deliveryPageContactGC.lastName}Up`)
          cy.findByText(`Owner: ${user.firstName} ${user.lastName}`).should('exist')
        })
      //tests that the entered giftcard info shows up in the contact profile - orders section
      magicLinks.getOrdersCard().within(() => {
        universal.getRowByText(`Chipotle`)
      })
      contacts.visitContacts()
      //tests that the entered postcard contact info shows up in the contacts table
      universal.progressBarZero()
      cy.wait(300)
      universal.getRowByText(`${deliveryPageContactPC.firstName}`).within(() => {
        cy.contains(`${deliveryPageContactPC.title}`, { timeout: 200000 }).should('be.visible')
        cy.contains(`${deliveryPageContactPC.company}`).should('exist')
        universal
          .getLinkByText(`${deliveryPageContactPC.firstName} ${deliveryPageContactPC.lastName}`)
          .click({ force: true })
      })
      //tests that the entered postcard contact info shows up in the contact profile
      universal.getSpinner().should('not.exist')
      universal.progressBarZero()
      cy.contains(`${deliveryPageContactPC.title}`, { timeout: 200000 }).should('be.visible')
      contacts
        .getContactInfoCard(`${deliveryPageContactPC.firstName} ${deliveryPageContactPC.lastName}`)
        .within(() => {
          cy.contains(`${deliveryPageContactPC.title}`, { timeout: 200000 }).should('exist')
          cy.contains(`${deliveryPageContactPC.company}`).should('exist')
          cy.findByText(`${deliveryPageContactPC.userName}`).should('exist')
          cy.findByText(`${deliveryPageContactPC.company}`).should('exist')
          cy.findByText('7582345167').should('exist')
        })
      cy.findByText(`89075 562 Ave`)
      cy.findByText(`Hartington, NE 68739`)
      //tests that the entered postcard info shows up in the contact profile - orders section
      universal.getOrdersCard().within(() => {
        universal.getLinkByText(`Postcard`)
      })
      //tests that Delivery Page contacts info made it into reporting
      reporting.visitOrderReports()
      cy.url().should('include', 'reporting/orders')
      cy.contains('Order Report').should('exist')
      universal.getSpinner().should('not.exist')
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(600)
          cy.reload()
          cy.wait(600)
        }
      })
      reporting.getOrderReportTable().within(() => {
        universal.getNoItemsMessage().should('not.exist')
        universal.getRowsInATableBody().should('be.visible').and('have.length.gte', 2)
        universal
          .getRowByText(`${deliveryPageContactPC.firstName} ${deliveryPageContactPC.lastName}`)
          .should('contain', 'Postcard')
        universal
          .getRowByText(`${deliveryPageContactGC.firstName}Up ${deliveryPageContactGC.lastName}Up`)
          .should('contain', 'Chipotle')
      })
      //tests that updates were made to magic links info
      magicLinks.visitMagicLinks()
      universal.getAngleRightButton().click({ force: true })
      universal.getRowByText('Giftcard MagicLink').within(() => {
        cy.contains(RegExp('\\b' + '1/1' + '\\b' + '|' + '\\b' + '0/1' + '\\b')).should('exist')
        //tests rendering of the approval ui-tags
        cy.contains('[data-testid="ui-tag"]', 'On').should('exist')
      })

      cy.contains('[data-testid="ui-tag"]', 'Off').should('exist')
      universal.getRowByText('Updated Postcard MagicLink').within(() => {
        cy.contains(RegExp('\\b' + '1/3' + '\\b' + '|' + '\\b' + '0/3' + '\\b')).should('exist')
        universal.getLinkByText('Updated Postcard MagicLink').click({ force: true })
      })
      //tests on and off tags in the require acceptance column
      cy.findAllByTestId('spinner').should('not.exist')
      magicLinks.getOrdersStat().within(() => {
        cy.contains(RegExp('1' + '|' + '0'))
      })
      magicLinks.getOrderLimitDetail().should('contain', `3`)
      magicLinks.getDetailsCard().within(() => {
        magicLinks.getOwnerDetail().should('contain', `${user.firstName} ${user.lastName}`)
        magicLinks.getTeamDetail().should('contain', user.company)
        magicLinks.getSendAsDetail().should('not.exist')
        magicLinks.getStatusDetail().should('contain', `Enabled`)
        magicLinks.getCreatedOnDetail().should('contain', `${dateFormatTable(today)}`)
        magicLinks.getExpiresOnDetail().should('contain', `${dateFormatTable(inTwoDays)}`)
        magicLinks.getOrderLimitDetail().should('contain', `3`)
        magicLinks.getLastOrderDetail().should('contain', `${dateFormatTable(today)}`)
        magicLinks.getLastViewDetail().should('contain', `${dateFormatTable(today)}`)
        magicLinks.getMeetingRequestDetail().should('contain', `No`)
        magicLinks.getSpentFromDetail().should('contain', user.company)
      })
      magicLinks.getCopyLinkButton().should('exist')
      magicLinks.getPreviewLinkButton().should('exist')
      magicLinks.getQRCodeDetail().should('exist')
      magicLinks.getOrdersCard().scrollIntoView()
      magicLinks.getOrdersCard().within(() => {
        universal
          .getRowsInATableBody()
          .should('have.length', 2)
          .should('not.contain', 'No items found')
        universal
          .getRowByText(`${deliveryPageContactPC.firstName} ${deliveryPageContactPC.lastName}`)
          .should('contain', 'Postcard')
          .and('contain', 'Processing')
          .and('contain', dateFormatTable(today))
        universal
          .getRowByText(`${deliveryPageContactPC2.firstName} ${deliveryPageContactPC2.lastName}`)
          .should('contain', 'Postcard')
          .and('contain', 'Needs Approval')
          .and('contain', dateFormatTable(today))
          .findAllByRole('button')
          .eq(1)
          .click()
        //tests denying an Order
        cy.findByRole('menuitem', { name: 'Deny Order' }).click({ force: true })
        universal
          .getRowByText(`${deliveryPageContactPC2.firstName} ${deliveryPageContactPC2.lastName}`)
          .should('not.exist')
        //tests the Hide Denied Order checkbox
        cy.contains('div', 'Hide denied orders')
          .findByRole('checkbox')
          .should('be.checked')
          .uncheck({ force: true })
        universal
          .getRowByText(`${deliveryPageContactPC2.firstName} ${deliveryPageContactPC2.lastName}`)
          .should('exist')
          .and('contain', 'Order Denied')
        cy.contains('div', 'Hide denied orders')
          .findByRole('checkbox')
          .should('not.be.checked')
          .check({ force: true })
        universal
          .getRowByText(`${deliveryPageContactPC2.firstName} ${deliveryPageContactPC2.lastName}`)
          .should('not.exist')
      })
      //tests that the landing page is now invalid for the denied order
      //working in sandbox, not a bug might be that the session vs cookie thing stored in url thing
      //cy.visit(futureDeniedUrl)
      // cy.url().should('contain', '/delivery/link/')
      // universal.getSpinner().should('not.exist')
      // cy.contains(/Order invalid/i).should('exist')

      //tests the Details Modal
      //magicLinks.visitMagicLinks()
      // universal.getAngleRightButton().click({ force: true })
      // universal.getLinkByText('Updated Postcard MagicLink').click({ force: true })
      // cy.findAllByTestId('spinner').should('not.exist')
      cy.contains('div', 'Hide denied orders')
        .findByRole('checkbox')
        .should('be.checked')
        .uncheck({ force: true })
      universal.getUITagByText('Order Denied').click({ force: true })
      cy.contains('section', 'Details').within(() => {
        cy.contains('Order denied by').should('exist')
        cy.contains('Order requires sender approval').should('exist')
      })
      //tests the order info for the giftcard magiclink profile
      magicLinks.visitMagicLinks()
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(600)
          cy.reload()
          cy.wait(600)
        }
      })
      universal.getAngleRightButton().click({ force: true })
      universal.getLinkByText('Giftcard MagicLink').click({ force: true })
      cy.findAllByTestId('spinner').should('not.exist')
      magicLinks
        .getOrdersStat()
        .should('exist')
        .within(() => {
          cy.contains(RegExp('1' + '|' + '0'))
        })
      magicLinks.getDetailsCard().within(() => {
        magicLinks.getOwnerDetail().should('contain', `${user.firstName} ${user.lastName}`)
        magicLinks.getTeamDetail().should('contain', user.company)
        //todo switch Contact Owner to Specific User
        //magicLinks.getSendAsDetail().should('contain', 'Contact Owner')
        magicLinks.getStatusDetail().should('contain', `Enabled`)
        magicLinks.getCreatedOnDetail().should('contain', `${dateFormatTable(today)}`)
        magicLinks.getExpiresOnDetail().should('contain', `Never`)
        magicLinks.getOrderLimitDetail().should('contain', `1`)
        magicLinks.getLastOrderDetail().should('contain', `${dateFormatTable(today)}`)
        magicLinks.getLastViewDetail().should('contain', `${dateFormatTable(today)}`)
        magicLinks.getMeetingRequestDetail().should('contain', `No`)
        magicLinks.getSpentFromDetail().should('contain', user.company)
      })
      magicLinks.getCopyLinkButton().should('exist')
      magicLinks.getPreviewLinkButton().should('exist')
      magicLinks.getQRCodeDetail().should('exist')
      magicLinks.getOrdersCard().scrollIntoView()
      magicLinks.getOrdersCard().within(() => {
        universal
          .getRowsInATableBody()
          .should('have.length', 1)
          .and('not.contain', 'No items found')
        universal
          .getRowByText(`${deliveryPageContactGC.firstName}Up ${deliveryPageContactGC.lastName}Up`)
          .should('contain', 'Chipotle')
          .and('contain', 'Processing')
          .and('contain', dateFormatTable(today))
      })
      //tests bulk approving and denying
      magicLinks.visitMagicLinks()
      universal.getUISpinner().should('not.exist')
      universal.getLinkByText('Book MagicLink').click({ force: true })
      universal.getUISpinner().should('not.exist')
      universal.getNoItemsMessage().should('not.exist')
      universal.progressBarZero()
      magicLinks.getEditMagicLinkLink().click({ force: true })
      cy.wait(300)
      magicLinks.getRequiresApprovalCheckbox().scrollIntoView().check({ force: true })
      sendItem.getReviewButton().click()
      cy.contains('Review').should('exist')
      universal.stubClipboardPrompt()
      cy.wait(1000)
      magicLinks.getUpdateMagicLinkButton().click()
      cy.get('body').then(($body) => {
        if ($body.text().includes('Add Funds')) {
          cy.contains('button', 'Cancel').click()
          magicLinks.getUpdateMagicLinkButton().click()
        }
      })
      sendItem.getConfirmSendModal().within(() => {
        magicLinks.getUpdateMagicLinkButton().click({ force: true })
      })
      cy.contains('Review').should('not.exist')
      magicLinks.visitMagicLinks()
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
      universal.getSpinner().should('not.exist')
      universal.getRowByText('Book MagicLink').should('contain', 'On')
      for (let index = 0; index < 7; index++) {
        const acceptee = userFactory()
        magicLinks.visitMagicLinks()
        cy.wait(300)
        cy.get('body').then(($body) => {
          if ($body.text().includes('Back to Home')) {
            cy.wait(300)
            cy.reload()
            cy.wait(600)
          }
        })
        universal.stubClipboardPrompt()
        universal.getRowByText('Book MagicLink').find('a').should('have.length', 2)
        getDeliveryLink('Book MagicLink').then((link) => {
          cy.clearCookie('__postal_delivery_session_test')
          delivery.visit(link)
          cy.acceptingMagicLink({
            needAddress: true,
            firstName: acceptee.firstName,
            lastName: acceptee.lastName,
            email: acceptee.userName,
          })
          delivery.getSubmitButton().click({ force: true })
          delivery.getSayThanksForm().should('exist')
          cy.findAllByRole('img').should('exist')
        })
      }
      cy.login(user)
      magicLinks.visitMagicLinks()
      magicLinks.getRequireApprovalBannerText(7).should('be.visible')
      magicLinks.getApproveNowButton().click({ force: true })
      universal.getRowsInATableBody().should('have.length', 7)
      cy.clickCheckboxByRowNumber({ num: 0 })
      cy.clickCheckboxByRowNumber({ num: 1 })
      cy.contains('button', 'Approve 2 Orders').should('not.be.disabled').click({ force: true })
      cy.contains('section', 'Approve Orders').within(() => {
        cy.contains('button', 'Approve').click()
      })
      universal.getRowsInATableBody().should('have.length', 5)
      cy.clickCheckboxByRowNumber({ num: 0 })
      cy.clickCheckboxByRowNumber({ num: 1 })
      cy.contains('button', 'Deny 2 Orders').should('not.be.disabled').click()
      cy.contains('section', 'Reject Orders').within(() => {
        cy.contains('button', 'Reject').should('exist').click({ force: true })
      })
      universal.getBackToButton('links').click({ force: true })
      //tests that when edited to off denied orders do not change, needs approval orders also do not change
      universal.getLinkByText('Book MagicLink').click({ force: true })
      magicLinks.getOrdersCard().within(() => {
        cy.contains('div', 'Hide denied orders')
          .findByRole('checkbox')
          .should('be.checked')
          .uncheck({ force: true })
        universal.getRowsInATableBody().should('have.length', 8)
        cy.findAllByText('Processing').should('have.length', 3)
        cy.findAllByText('Order Denied').should('have.length', 2)
        cy.findAllByText('Needs Approval').should('have.length', 3)
      })
      magicLinks.getEditMagicLinkLink().click({ force: true })
      magicLinks.getRequiresApprovalCheckbox().scrollIntoView().uncheck({ force: true })
      sendItem.getReviewButton().click()
      cy.contains('Review').should('exist')
      universal.stubClipboardPrompt()
      cy.wait(1000)
      magicLinks.getUpdateMagicLinkButton().click()
      sendItem.getConfirmSendModal().within(() => {
        magicLinks.getUpdateMagicLinkButton().click({ force: true })
      })
      cy.wait(300)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
      cy.contains('Review').should('not.exist')
      magicLinks.getOrdersCard().within(() => {
        universal.getRowsInATableBody().should('have.length', 6)
        cy.findAllByText('Processing').should('have.length', 3)
        //cy.findAllByText('Order Denied').should('have.length', 2)
        cy.findAllByText('Needs Approval').should('have.length', 3)
      })
    })
  })
})
