import { onlyOn } from '@cypress/skip-test'
import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  BulkSelect,
  Collections,
  Contacts,
  CustomFormFields,
  Delivery,
  MagicLinks,
  Marketplace,
  Orders,
  Reporting,
  SendItem,
  SidePanel,
  Universal,
} from '../../support/pageObjects'

describe('Collections test suite', () => {
  const user = userFactory()
  const marketplace = new Marketplace()
  const universal = new Universal()
  const sendItem = new SendItem()
  const magicLinks = new MagicLinks()
  const contacts = new Contacts()
  const reporting = new Reporting()
  const orders = new Orders()
  const collections = new Collections()
  const bulkSelect = new BulkSelect()
  const sidePanel = new SidePanel()
  const delivery = new Delivery()
  const customFormFields = new CustomFormFields()

  let firstCollectionUrl: string
  let firstContactName: string
  const dateFormatTable = (date: Date) => date.toLocaleDateString()
  const WINE = 'Tolosa Winery 1772 Chardonn'
  const BOOK = 'Everybody Lies: Big Data, N'
  const GIFTCARD = 'Chipotle'

  before(() => {
    cy.signup(user)
    cy.teamsSeed(1)
    cy.contactsSeed(2)
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 500000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    contacts.visitContacts()
    cy.wait(500)
    universal.getSpinner().should('not.exist')
    universal.progressBarZero()
    universal.getNoItemsMessage().should('not.exist')
    cy.saveText({ rowNumber: 1, element: 'a' }).then((txt) => {
      firstContactName = txt
    })
  })

  beforeEach(() => {
    cy.login(user)
    // cy.restoreLocalStorageCache()
    // cy.filterLocalStorage('postal:collections:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'searchApprovedPostals') {
        req.alias = 'searchApprovedPostals'
      }
      // if (req.body.operationName === 'marketplaceSearch') {
      //   req.alias = 'marketplaceSearch'
      // }
      if (req.body.operationName === 'getMagicLink') {
        req.alias = 'getMagicLink'
      }
    })
  })

  it('tests creating a collection', () => {
    cy.createChipotlePostal()
    marketplace.visitCollections()
    cy.url().should('include', '/collections')
    //tests collections teaser
    collections.getNoCollectionsText().should('exist')
    //creates a collection
    collections.getCreateCollectionButton().should('be.visible').click({ force: true })
    cy.contains('Enable Collection').should('be.visible')
    collections.getNameCollectionInput().should('be.visible').fill('My First Collection')
    cy.wait(500)
    collections.getTeamsTooltip().should('exist')
    cy.contains('div', 'USD').click()
    collections.getSelectAnItemsButton().click()
    // marketplace.getAllItemsTab().should('exist').and('have.attr', 'aria-selected', 'true')
    // marketplace.getMyItemsTab().should('exist').and('have.attr', 'aria-selected', 'false').click()
    // marketplace.getNotFoundItem().should('exist')
    // marketplace.getAllItemsTab().click()
    // universal.getSpinner().should('not.exist')
    bulkSelect.getItemByName('Chipotle')
    cy.contains('1 selected').should('exist')
    collections.getSelectOptionsButton().click()
    universal.getSpinner().should('not.exist')
    universal.getAllSelectedVariantOptionCards().should('have.length', 3)
    collections.getSelectedVariantOptionByName('$10').click()
    collections.getSelectedVariantOptionByName('$25').click()
    cy.contains('button', 'Create Collection').should('not.be.disabled')
    collections.getSelectedVariantOptionByName('$5').should('exist')
    cy.contains('button', 'Create Collection').click({ force: true })
    collections.getCollectionCreatedAlert()
    // wait for the collection to propagate to the Searchable Products
    cy.wait(1500)
    collections.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(500)
    cy.contains('[data-testid="ui-card"]', 'My First Collection').within(() => {
      cy.contains('button', 'View this Collection').click()
    })
    universal.getSpinner().should('not.exist')
    cy.url().should('contain', '/collections/')
    cy.url().then((url) => {
      expect(url).to.include('/collections/')
      firstCollectionUrl = url
    })
  })

  it('tests the rendering of the new collection profile', () => {
    cy.visit(firstCollectionUrl)
    universal.waitForSpinner()
    collections.getBackToCollectionsButton().should('exist')
    collections.getCollectionNavCenterByName('My First Collection')
    marketplace.getEllipsesButton().should('exist')
    collections.getCollectionItems().should('contain', '1')
    collections.getCollectionPrice().should('contain', '$5')
    collections.getCollectionSent().should('contain', '0')
    collections.getEnableThisCollectionButton().should('exist')
    collections.getAddAnItemCard().should('exist')
    collections.getCollectionItemByName('Chipotle').should('exist')
  })

  it('tests editing an item in the collection', () => {
    cy.visit(firstCollectionUrl)
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    collections.getCollectionItemByName('Chipotle').within(() => {
      collections.getCollectionVariantListItem('$5').should('exist')
      collections.getCollectionVariantListItem('$10').should('not.exist')
      collections.getEditCollectionItemButton().click({ force: true })
    })
    cy.contains('Select Available Options').should('be.visible')
    collections.getUnselectedVariantOptionByName('$10').click()
    collections.getSelectedVariantOptionByName('$5').click()
    collections.getSaveCollectionOptionButton().click()
    universal.getSpinner().should('not.exist')
    collections.getCollectionItemByName('Chipotle').within(() => {
      collections.getCollectionVariantListItem('$10').should('exist')
      collections.getCollectionVariantListItem('$5').should('not.exist')
    })
  })

  it('tests disabling a collection', () => {
    cy.visit(firstCollectionUrl)
    universal.getSpinner().should('not.exist')
    cy.contains('Enabled').should('exist')
    collections.getEditThisCollectionButton().should('exist')
    collections.getSendThisCollectionButton().should('exist')
    collections.getEnableThisCollectionButton().click()
    cy.contains('[role="menuitem"]', 'Disable Collection').click({ force: true })
    cy.findByRole('button', { name: 'Disable' }).click({ force: true })
    cy.contains('Draft').should('exist')
    collections.getEditThisCollectionButton().should('exist')
    collections.getSendThisCollectionButton().should('not.exist')
    collections.getEnableThisCollectionButton().click()
    cy.contains('[role="menuitem"]', 'Enable Collection').click({ force: true })
    cy.findByRole('button', { name: 'Enable' }).click({ force: true })
    cy.contains('Enabled').should('exist')
  })

  it('tests deleting an item from collection', () => {
    cy.visit(firstCollectionUrl)
    universal.getSpinner().should('not.exist')
    cy.contains('Enabled').should('exist')
    collections.getCollectionItemByName('Chipotle').within(() => {
      collections.getDeleteCollectionItemButton().click()
    })
    collections.getRemoveItemModal().within(() => {
      collections.getRemoveItemModalText().should('exist')
      universal.getCancelButton().should('exist')
      collections.getRemoveItemButton().click()
    })
    universal.getSpinner().should('not.exist')
    collections.getCollectionItemByName('Chipotle').should('not.exist')
    cy.contains('Draft').should('exist')
  })

  it('tests adding two items to a collection', () => {
    cy.createApprovedPostal({ name: 'Tolosa Winery 1772 Chardonnay 2018' })
    cy.createApprovedPostal({
      name: 'Everybody Lies: Big Data, New Data, and What the Internet Can Tell Us About Who We Really Are',
    })
    cy.visit(firstCollectionUrl)
    cy.wait(1000)
    universal.getSpinner().should('not.exist')
    collections.getAddAnItemCard().click()
    cy.wait(1000)
    bulkSelect.getItemByName(WINE)
    collections.getSelectOptionsButton().click()
    collections.getSelectedVariantOptionByName('Merlot').click()
    collections.getSaveCollectionItemButton().click({ force: true })
    //collections.getCollectionUpdatedAlert()
    collections.getCollectionItemByName(WINE).should('exist')
    collections.getAddAnItemCard().click()
    cy.wait(800)
    bulkSelect.getItemByName(BOOK)
    collections.getSelectOptionsButton().click()
    collections.getSelectedVariantOptionByName('Paperback').click()
    collections.getSelectedVariantOptionByName('Hardcover').click()
    collections.getSaveCollectionItemButton().should('be.disabled')
    collections.getUnselectedVariantOptionByName('Hardcover').click()
    collections.getSaveCollectionItemButton().click()
    universal.getSpinner().should('not.exist')
    collections.getCollectionItemByName(WINE).should('exist')
    collections.getCollectionItemByName(BOOK).should('exist')
  })

  it('tests editing a collection', () => {
    cy.visit(firstCollectionUrl)
    cy.contains('My First Collection').should('be.visible')
    collections.getEnableThisCollectionButton().click()
    cy.contains('[role="menuitem"]', 'Enable Collection').click({ force: true })
    cy.findByRole('button', { name: 'Enable' }).click({ force: true })
    collections.getCollectionEnabledAlert()
    cy.contains('Enabled').should('exist')
    collections.getEditThisCollectionButton().click({ force: true })
    collections.getCollectionEditDrawerByName('Collection Settings').within(() => {
      collections
        .getEditCollectionNameInput()
        .should('have.value', 'My First Collection')
        .clear()
        .getInputValidation('Please fill out this field.')
        .fill('Marzipan icing gummies')
      collections
        .getEditCollectionDisplayNameInput()
        .should('have.value', 'My First Collection')
        .clear()
        .getInputValidation('Please fill out this field.')
        .fill('My Display Name')
      collections.getDisplayNameTooltip().realHover()
      collections.getShareCollectionCheckbox().should('not.exist')
      collections.getTeamsTooltip().realHover()
    })
    collections.getDisplayNameTooltipText().should('exist')
    collections.getTeamsTooltipText().should('exist')
    collections.getCollectionEditDrawerByName('Collection Settings').within(() => {
      universal.getCancelButton().should('exist')
      universal.getSaveButton().click()
    })
    collections.getCollectionEditDrawerByName('Collection Settings').should('not.exist')
    collections.getCollectionUpdatedAlert()
    collections.getCollectionNavCenterByName('Marzipan icing gummies')
    collections.getEditThisCollectionButton().click({ force: true })
    collections.getCollectionEditDrawerByName('Collection Settings').within(() => {
      collections.getEditCollectionNameInput().should('have.value', 'Marzipan icing gummies')
      collections.getEditCollectionDisplayNameInput().should('have.value', 'My Display Name')
      universal.getCancelButton().should('exist')
      universal.getSaveButton().click()
    })
    //might wanna come back change this to the Back To button just have one scenario tested where the
    //visit is straight to a collection's page rather than clicking through collections
    collections.getBackToCollectionsButton().click()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    collections.getCollectionByName('Marzipan icing gummies').should('exist')
  })

  it('tests sending a collection', () => {
    cy.visit(firstCollectionUrl)
    universal.getSpinner().should('not.exist')
    collections.getSendThisCollectionButton().click()
    sendItem.getPersonalizedEmailButton().click()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: firstContactName })
    sendItem.getConfigureYourItemButton().click()
    cy.wait(300)
    sendItem.getSubjectLineInput().fill('Oat cake candy jelly lemon drops chupa')
    cy.wait(300)
    sendItem
      .getGiftEmailMessageInput()
      .fill(
        'Apple pie bonbon oat cake sweet chocolate bar. Marzipan topping cotton candy muffin chocolate bar gummi bears lemon drops topping.'
      )
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().fill('New LP Header')
    //clicks bold
    sendItem.getLandingPageBodySection().within(() => {
      cy.findAllByRole('button').eq(2).click({ force: true })
      cy.wait(300)
      sendItem.getLandingPageMessageInput().fill('Tolosa LP Message')
    })
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      //default fields should exist
      customFormFields.getCustomFieldFirstName().should('exist')
      customFormFields.getCustomFieldLastName().should('exist')
      customFormFields.getCustomFieldEmailAddress().should('exist')
      customFormFields.getCustomFieldTitle().should('exist')
      customFormFields.getCustomFieldCompany().should('exist')
      //extensive testing of the Customize Form Settings Modal done on events.spec
      // adds just a yes/no field and then saves it
      customFormFields.getAddCustomFieldDateButton().should('exist').click()
      customFormFields.getNewCustomFieldQuestion().type('Date?')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('Date?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('Date?').should('exist')
    })
    sendItem.getSendAsSelect().should('exist')
    sendItem.getSpendAsCard().within(() => {
      cy.contains(`${user.userName}`).should('exist')
    })
    marketplace.getSendShippedEmailTooltip().realHover()
    marketplace.getSendShippedEmailTooltipText().should('be.visible')
    marketplace.getSendDeliveredEmailTooltip().realHover()
    marketplace.getSendDeliveredEmailTooltipText().should('be.visible')
    sendItem.getReviewButton().click()
    cy.contains('Marzipan icing gummies').should('exist')
    marketplace.getReviewRecipientChoice().should('contain', 'Tolosa').and('contain', 'Hardcover')
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    sendItem
      .getReviewSubjectLineSection()
      .should('contain', 'Oat cake candy jelly lemon drops chupa')
    sendItem
      .getReviewGiftMessageSection()
      .should(
        'contain',
        'Apple pie bonbon oat cake sweet chocolate bar. Marzipan topping cotton candy muffin chocolate bar gummi bears lemon drops topping.'
      )
    sendItem.getReviewLandingPageTitle().should('contain', 'New LP Header')
    sendItem.getReviewLandingPageMessage().within(() => {
      cy.contains('strong', 'Tolosa LP Message').should('exist')
    })
    sendItem.getReviewSendAsSection().should('not.exist')
    sendItem.getSaveAndSendButton().click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        sendItem.getSaveAndSendButton().click()
      }
    })
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getConfirmSendModal().should('not.exist')
    cy.contains('Success! Your email is on the way!').should('exist')
  })

  it('tests creating a magicLink with a collection', () => {
    cy.visit(firstCollectionUrl)
    universal.getSpinner().should('not.exist')
    cy.contains(WINE).should('be.visible')
    collections.getSendThisCollectionButton().click()
    cy.findByRole('button', { name: 'MagicLink' }).click()
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().fill('New Collection LP Header')
    cy.wait(300)
    sendItem
      .getLandingPageMessageInput()
      .fill('Fruitcake jujubes pudding danish. Cheesecake marzipan donut jujubes. ')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      //default fields should exist
      customFormFields.getCustomFieldFirstName().should('exist')
      customFormFields.getCustomFieldLastName().should('exist')
      customFormFields.getCustomFieldEmailAddress().should('exist')
      customFormFields.getCustomFieldTitle().should('exist')
      customFormFields.getCustomFieldCompany().should('exist')
      //extensive testing of the Customize Form Settings Modal done on events.spec
      // adds just a yes/no field and then saves it
      customFormFields.getAddCustomFieldYesNoButton().should('exist').click()
      customFormFields.getNewCustomFieldQuestion().type('For delivery?')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('For delivery?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('For delivery?').should('exist')
    })
    sendItem.getSendAsSelect().should('exist')
    sendItem.getReviewButton().click()
    cy.contains('Marzipan icing gummies')
    marketplace.getReviewRecipientChoice().should('contain', 'Tolosa').and('contain', 'Hardcover')
    sendItem.getReviewLandingPageTitle().should('contain', 'New Collection LP Header')
    sendItem
      .getReviewLandingPageMessage()
      .should('contain', 'Fruitcake jujubes pudding danish. Cheesecake marzipan donut jujubes.')
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(win.prompt)
    })
    cy.wait(1000)
    magicLinks.getSaveMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getSaveMagicLinkButton().click()
    })
    magicLinks.visitMagicLinks()
    universal.getSpinner().should('not.exist')
    universal.getLinkByText('Marzipan icing gummies').should('be.visible').click()
    universal.getSpinner().should('not.exist')
    cy.contains('Marzipan icing gummies').should('be.visible')
    //cy.findByText('2 items').should('exist')
    // universal
    //   .getPostalCardName()
    //   .should('exist')
    //   .then(($name) => {
    //     if ($name.text().includes('Def')) {
    //       cy.contains('Tolosa').should('exist')
    //     } else {
    //       cy.contains('Everybody Lies:').should('exist')
    //     }
    //   })
    // universal
    //   .getPostalCardDescription()
    //   .should('exist')
    //   .then(($description) => {
    //     if ($description.text().includes('Chardonna')) {
    //       cy.contains('Chardonnay from Edna Valley in San Luis Obispo, CA').should('exist')
    //     } else {
    //       cy.contains('Everybody Lies:').should('exist')
    //     }
    //   })
    // universal
    //   .getPostalCardPrice()
    //   .should('exist')
    //   .then(($price) => {
    //     if ($price.text().includes('$58')) {
    //       cy.contains('$58').should('exist')
    //     } else {
    //       cy.contains('18').should('exist')
    //     }
    //   })
  })

  it('tests disabling/enabling a collection via the action menu', () => {
    cy.visit(firstCollectionUrl)
    universal.getSpinner().should('not.exist')
    cy.contains('Enabled').should('exist')
    marketplace.getEllipsesButton().click()
    collections.getEnableCollectionMenuItem().should('not.exist')
    collections.getDisableCollectionMenuItem().click()
    cy.findByRole('button', { name: 'Disable' }).click({ force: true })
    collections.getCollectionDisabledAlert()
    cy.contains('Draft').should('be.visible')
    cy.wait(600)
    //tests that the hover icons aren't visible in a draft collection card
    collections.visitCollections()
    // cy.queryForUpdateRecurse({
    //   request: SearchApprovedPostalsDocument,
    //   operationName: 'searchApprovedPostals',
    //   key: '2',
    //   value: 'DISABLED',
    //   key2: 'status',
    // })
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    //cy.wait('@marketplaceSearch')
    sidePanel.getFilterHeader('Show Draft Items').parent('div').find('input').should('be.visible')
    sidePanel
      .getFilterHeader('Show Draft Items')
      .parent('div')
      .find('input')
      .should('not.be.checked')
    sidePanel.getFilterHeader('Show Draft Items').parent('div').find('input').check({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.wait(7000)
    collections.getCollectionByName('Marzipan icing gummies').should('be.visible')
    collections.getCollectionByName('Marzipan icing gummies').realHover()
    collections.getViewCollectionButton().should('be.visible')
    collections.getSendItemIconButton().should('not.exist')
    collections.getCreateMagicLinkIconButton().should('not.exist')
    collections.getDraftTag().should('be.visible')
    //enables again
    cy.wait(300)
    cy.visit(firstCollectionUrl)
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getSpinner().should('not.exist')
    cy.contains('Marzipan icing gummies').should('be.visible')
    marketplace.getEllipsesButton().click()
    collections.getDisableCollectionMenuItem().should('not.exist')
    collections.getEnableCollectionMenuItem().click()
    cy.findByRole('button', { name: 'Enable' }).click({ force: true })
    collections.getCollectionEnabledAlert()
    cy.contains('Enabled').should('exist')
  })

  it('tests that clicking the send hover button opens the correctly rendered drawer', () => {
    collections.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.wait(1500)
    collections.getCollectionByName('Marzipan icing gummies').realHover()
    collections.getViewCollectionButton().should('be.visible')
    collections.getSendItemIconButton().should('be.visible').click()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckboxByRowNumber({ num: 1 })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('Personalized Email').should('exist')
    marketplace.getSendShippedEmailTooltip().should('exist')
    marketplace.getSendDeliveredEmailTooltip().should('exist')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
  })

  it('tests that clicking magiclink hover button opens the correctly rendered drawer', () => {
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    collections.getCollectionByName('Marzipan icing gummies').realHover()
    collections.getCreateMagicLinkIconButton().click()
    cy.contains('h5', 'MagicLink').should('exist')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
  })

  it('tests that clicking the send action menu item opens the correctly rendered drawer', () => {
    //send item action menuitem
    cy.visit(firstCollectionUrl)
    collections.getCollectionNavCenterByName('Marzipan icing gummies')
    universal.getSpinner().should('not.exist')
    marketplace.getEllipsesButton().click()
    collections.getSendCollectionMenuItem().should('be.visible').click({ force: true })
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckboxByRowNumber({ num: 1 })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('Personalized Email').should('exist')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
  })

  it('tests that clicking the magiclink action menu item opens the correctly rendered drawer', () => {
    //magiclink action menuitem
    cy.visit(firstCollectionUrl)
    collections.getCollectionNavCenterByName('Marzipan icing gummies')
    universal.getSpinner().should('not.exist')
    marketplace.getEllipsesButton().click()
    collections.getCreateMagicLinkMenuItem().should('be.visible').click({ force: true })
    cy.contains('h5', 'MagicLink').should('exist')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
  })

  it(`tests that the collection's view order modal from the contact's profile`, () => {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getContactLinkByName(firstContactName).click()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 1)
    universal.getLinkByText('Marzipan icing gummies').click()
    universal
      .getViewOrderHeaderByText(/Marzipan icing gummies/i)
      .scrollIntoView()
      .should('be.visible')
    cy.contains('li', 'Recipient Choice').should('contain', 'Tolosa Winery 1772')
    universal.getRetryOrderAgainButton().click()
    cy.contains('Oat cake candy jelly lemon drops chupa').should('exist')
    cy.contains(
      'Apple pie bonbon oat cake sweet chocolate bar. Marzipan topping cotton candy muffin chocolate bar gummi bears lemon drops topping.'
    ).should('exist')
    cy.contains('New LP Header').should('exist')
    sendItem.getLandingPageBodySection().within(() => {
      cy.findAllByRole('button').eq(2).should('have.class', 'is-active')
      cy.contains('Tolosa LP Message').should('exist')
    })
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsButton().should('exist')
      sendItem.getCustomizeFieldsTagByName('Date?').should('exist')
    })
    marketplace.getSendShippedEmailTooltip().should('exist')
    marketplace.getSendDeliveredEmailTooltip().should('exist')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 2)
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
  })

  it('tests cloning and then deleting a collection', () => {
    cy.visit(firstCollectionUrl)
    marketplace.getEllipsesButton().click()
    //clones a collection
    collections.getCloneCollectionMenuItem().click({ force: true })
    collections.getCloneCollectionModal().within(() => {
      collections.getCloneCollectionButton().click()
    })
    collections.getCloneCollectionModal().should('not.exist')
    collections.getCollectionNavCenterByName('Copy - Marzipan icing gummies')
    cy.url().then((url) => {
      expect(url).to.include('/collections/')
      collections.getEnableThisCollectionButton().click()
      cy.contains('[role="menuitem"]', 'Enable Collection').click({ force: true })
      cy.findByRole('button', { name: 'Enable' }).click({ force: true })
      collections.getSendThisCollectionButton().should('exist').and('not.have.attr', 'data-loading')
      collections.getEnabledTag().should('be.visible')
      cy.wait(400)
      collections.visitCollections()
      universal.getSpinner().should('not.exist')
      // cy.catchCallsRecurse({
      //   operationName: 'searchApprovedPostals',
      //   key: '0',
      //   value: 'Copy - Marzipan icing gummies',
      //   key2: 'name',
      // })
      universal.getSpinner().should('not.exist')
      cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
      universal.getUISpinner().should('not.exist')
      collections.getCollectionByName('Copy - Marzipan icing gummies').should('exist')
      cy.visit(url)
      universal.getSpinner().should('not.exist')
      //deletes the cloned collection
      marketplace.getEllipsesButton().click()
      collections.getDeleteCollectionMenuItem().should('be.visible').click({ force: true })
      collections.getDeleteCollectionModal().within(() => {
        universal.getDeleteButton().click()
      })
      collections.getDeleteCollectionModal().should('not.exist')
      // cy.queryForUpdateRecurse({
      //   request: SearchApprovedPostalsDocument,
      //   operationName: 'searchApprovedPostals',
      //   key: '0',
      //   value: 'DELETE',
      //   key2: 'status',
      // })
      collections.visitCollections()
      cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
      universal.getUISpinner().should('not.exist')
      collections.getCollectionByName('Copy - Marzipan icing gummies').should('not.exist')
      collections.getCollectionByName('Marzipan icing gummies').should('exist')
    })
  })

  it('testEnv: tests sending a new collection to multiple contacts', () => {
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'searchMarketplaceProducts') {
        req.alias = 'searchMarketplaceProducts'
      }
    })
    //creates a collection of items, each only having one variant
    cy.createACollection({ numOfItems: 3 }).then(() => {
      cy.wait(1000)
    })
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    collections.getCollectionByName('Marzipan icing gummies').should('exist')
    cy.wait(1000)
    cy.contains('a', 'Seeded Collection').click()
    // cy.wait('@searchMarketplaceProducts').then((res) => {
    // const response = res.response?.body.data.searchMarketplaceProducts
    // const names = [WINE, BOOK, GIFTCARD]
    // const variants: any = {}
    // response.forEach((product: any) => {
    //   names.forEach((name: string) => {
    //     if (product.name === name) {
    //       variants[product.name] = product.variants[0].variantName
    //     }
    //   })
    // })
    collections.getCollectionItemByName(WINE)
    collections.getCollectionItemByName(BOOK)
    collections.getCollectionItemByName(GIFTCARD)
    collections.getEditThisCollectionButton().click({ force: true })
    collections.getCollectionEditDrawerByName('Collection Settings').within(() => {
      collections.getEditCollectionDisplayNameInput().clear().fill('Seeded Collection Display Name')
      universal.getSaveButton().click()
    })
    collections.getCollectionEditDrawerByName('Collection Settings').should('not.exist')
    collections.getSendThisCollectionButton().click()
    cy.findByRole('button', { name: 'MagicLink' }).click()
    sendItem.getPersonalizedEmailButton().click()
    universal.getNoItemsMessage().should('not.exist')
    universal.getCheckboxForAllItems().should('be.visible')
    universal.getCheckboxForAllItems().click({ force: true })
    sendItem.getConfigureYourItemButton().click()
    cy.wait(600)
    sendItem.getSubjectLineInput().fill('Cake sesame snaps')
    cy.wait(300)
    sendItem
      .getGiftEmailMessageInput()
      .fill('Toffee muffin candy. Biscuit dragée danish gummies croissant oat cake cupcake.')
    orders.getNowButton().click()
    marketplace.getSendShippedEmailTooltip().should('exist')
    marketplace.getSendDeliveredEmailTooltip().should('exist')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected').should('have.length', 3)
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // adds just a yes/no field and then saves it
      customFormFields.getAddCustomFieldYesNoButton().should('exist').click()
      customFormFields.getNewCustomFieldQuestion().type('Comeback Sauce?')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('Comeback Sauce?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('Comeback Sauce?').should('exist')
    })

    sendItem.getReviewButton().click()
    sendItem.getReviewSubjectLine().should('contain', 'Cake sesame snaps')
    sendItem
      .getReviewGiftEmailMessage()
      .should(
        'contain',
        'Toffee muffin candy. Biscuit dragée danish gummies croissant oat cake cupcake.'
      )
    //tests that when there is no entered Landing Page Message the preview button still renders
    cy.contains('header', 'Landing Page').within(() => {
      cy.contains('button', 'Preview').click()
    })
    cy.findByRole('dialog').within(() => {
      cy.contains(/Landing Page/)
      cy.findByRole('button', { name: 'Close' }).click()
    })
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('have.length', 2)
    })
    sendItem.getReviewCampaignSection().within(() => {
      orders.getReviewCampaignName().contains('Seeded Collection')
      orders.getReviewSendOn().contains(dateFormatTable(new Date()))
    })
    cy.contains('button', /Confirm and Send/i).click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    // tests Accepting a MagicLink with 3 items but all have just one variant
    marketplace.visitCollections()
    cy.wait(800)
    cy.contains('a', 'Seeded Collection').click()
    marketplace.getEllipsesButton().should('exist').click()
    collections.getCreateMagicLinkMenuItem().should('exist').click({ force: true })
    cy.wait(300)
    sendItem.getLandingPageMessageInput().fill('Many Items, One Variant Each')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected').should('have.length', 3)
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // adds just a yes/no field and then saves it
      customFormFields.getAddCustomFieldYesNoButton().should('exist').click()
      customFormFields.getNewCustomFieldQuestion().type('Food Allergies?')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('Food Allergies?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('Food Allergies?').should('exist')
    })
    sendItem.getReviewButton().click()
    cy.contains('Seeded Collection').should('exist')
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(win.prompt)
    })
    cy.wait(1400)
    magicLinks.getSaveMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      cy.contains('button', 'Create MagicLink').click({ force: true })
    })
    cy.contains('Success! Your MagicLink has been created.')
    onlyOn(Cypress.env('testUrl'), () => {
      cy.contains('a', 'Share URL', { timeout: 99000 }).click()
      cy.wait('@getMagicLink').then((res) => {
        delivery.visit(res.response?.body.data.getMagicLink.linkUrl)
      })
      cy.url().should('contain', '/delivery/link/')
      //tests accepting wine with a restricted address (should fail)
      delivery.getJustSentYouHeader(user.firstName, user.company).should('be.visible')
      cy.contains('Many Items, One Variant Each').should('exist')
      //tests that the varaint description exists(not visible unless hovered over)
      cy.contains('Chipotle Gift Card').should('exist')
      delivery.getItemToSelectByName(BOOK).should('exist')
      delivery.getItemToSelectByName(GIFTCARD).should('exist')
      delivery.getItemToSelectByName(WINE).click()
      cy.contains('Tolosa').should('exist')
      cy.acceptingMagicLink({ needAddress: false })
      //tests the added custom form field
      cy.findByText('Food Allergies?').should('exist')
      cy.findByRole('checkbox', { name: 'Food Allergies?' })
        .should('not.be.checked')
        .check({ force: true })
      cy.findByRole('checkbox', { name: 'Food Allergies?' }).should('be.checked')
      //tests adding the address with a restricted address
      delivery.getShippingAddressButton().click()
      //delivery.getAddDetailsButton().click()
      delivery.getShippingDrawer().within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        delivery.getStreetAddress1Input().fill('150 East Utah Avenue')
        delivery.getCityInput().fill('Tooele')
        // delivery.getStateInputRegEx('California')
        delivery.getPostalCodeInput().type('84074')
        delivery.getRequiredPhoneTypeInput().select('WORK')
        delivery.getRequiredPhoneNumberInput().fill('4671234789')
        cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
        universal.getSaveButton().click()
      })
      cy.contains('We found a matching address!').should('not.exist')
      delivery.getCannotDeliverToStateText().should('exist')
      delivery.getUseVerifiedButton().should('not.exist')
      //delivery.getTryAgainButton().should('exist')
      delivery.getVerifyAddressModal().within(() => {
        universal.getCloseButtonByLabelText().click({ force: true })
      })
      delivery.getTryAgainButton().should('not.exist')
      delivery.getSelectADifferentItem().click()
      delivery.getItemToSelectByName(WINE).should('exist')
      delivery.getItemToSelectByName(BOOK).should('exist')
      delivery.getItemToSelectByName(GIFTCARD).click()
      cy.contains(GIFTCARD).should('exist')
      cy.findAllByRole('img').should('exist')
      //tests that the variant is displayed
      cy.contains('$5').should('exist')
      delivery.getSelectADifferentItem().click()
      delivery.getItemToSelectByName(GIFTCARD).should('exist')
      delivery.getItemToSelectByName(WINE).should('exist')
      delivery.getItemToSelectByName(BOOK).click()
      cy.contains(BOOK).should('exist')
      cy.findAllByRole('img').should('exist')
      delivery.getShippingAddressButton().click()
      //testing a that same Utah address works with Book
      delivery.getShippingDrawer().within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        delivery.getStreetAddress1Input().fill('150 East Utah Avenue')
        delivery.getCityInput().fill('Tooele')
        delivery.getStateInputRegEx('Utah')
        delivery.getPostalCodeInput().fill('84074')
        delivery.getPhoneTypeSelect().should('exist')
        delivery.getPhoneNumberInput().should('exist')
        cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
        universal.getSaveButton().click()
      })
      delivery.getUseVerifiedButton().click({ force: true })
      delivery.getSubmitButton().click()
      delivery.getOnTheWayText().should('exist')
    })
    //tests collection shows up in campaigns
    // campaigns.visitOrders()
    // universal.getSpinner().should('not.exist')
    // universal.getRowByText('Seeded Collection').click()
    // universal.getSpinner().should('not.exist')
    // universal
    //   .getCollectionCard()
    //   .should('be.visible')
    //   .within(() => {
    //     universal.getPostalCardName().then(($name2) => {
    //       if ($name2.text().includes('Def')) {
    //         cy.contains('Tolosa').should('exist')
    //       } else if ($name2.text().includes('Chipotle')) {
    //         cy.contains('Chipotle').should('exist')
    //       } else {
    //         cy.contains('Everybody Lies:').should('exist')
    //       }
    //     })
    //     universal.getPostalCardDescription().then(($description2) => {
    //       if ($description2.text().includes('Tolosa')) {
    //         cy.contains('Chardonnay from Edna Valley in San Luis Obispo, CA').should('exist')
    //       } else if ($description2.text().includes('Chipotle Gift Card')) {
    //         cy.contains('Chipotle Gift Card').should('exist')
    //       } else {
    //         cy.contains('Everybody Lies:').should('exist')
    //       }
    //     })
    //     universal.getPostalCardPrice().then(($description2) => {
    //       if ($description2.text().includes('Tolosa')) {
    //         cy.contains('$2').should('exist')
    //       } else if ($description2.text().includes('Everbody Lies')) {
    //         cy.contains('$58').should('exist')
    //       } else {
    //         cy.contains('$5').should('exist')
    //       }
    //     })
    //   })
    //profile.visitProfile()
    //universal.getSpinner().should('not.exist')
    //universal.getRowByText('Seeded Collection')
    // contacts.visitContacts()
    // universal.getSpinner().should('not.exist')
    // contacts.getContactLinkByName(firstContactName).click()
    //contacts.getCampaignsSection().within(() => {
    //universal.getRowByText('Seeded Collection').should('be.visible')
    //})
    // })
  })

  it('testEnv: tests creating a new collection with an item with multiple variants', () => {
    cy.createChipotlePostal(3)
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    collections.getCreateCollectionCardButton().should('be.visible').click({ force: true })
    collections.getNameCollectionInput().should('be.visible').fill('All the Variants!')
    collections.getDisplayNameCollectionInput().should('be.visible').fill('All the Variants, Ya!')
    cy.contains('div', 'USD').click()
    collections.getSelectAnItemsButton().click()
    cy.wait(300)
    bulkSelect.getItemByName('Chipotle')
    collections.getSelectOptionsButton().click()
    universal.getSpinner().should('not.exist')
    collections.getSelectedVariantOptionByName('$5').should('exist')
    collections.getSelectedVariantOptionByName('$10').should('be.visible')
    collections.getSelectedVariantOptionByName('$25').should('be.visible')
    cy.contains('button', 'Create Collection').should('not.be.disabled').click()
    universal.getSpinner().should('not.exist')
    collections.getCollectionItemByName('Chipotle').within(() => {
      collections.getCollectionVariantListItem('$5').should('exist')
      //todo: test the three thingy at the corner?
      //collections.getCollectionVariantListItem('$10').should('exist')
      collections.getCollectionVariantListItem('$25').should('exist')
    })
    collections.getAddAnItemCard().click()
    bulkSelect.getItemByName(WINE)
    collections.getSelectOptionsButton().click()
    collections.getSelectedVariantOptionByName('Merlot').click()
    collections.getSaveCollectionItemButton().click()
    collections.getCollectionItemByName('Tolosa').should('exist')
    collections.getAddAnItemCard().should('be.visible').click()
    bulkSelect.getItemByName('Everybody Lies:')
    collections.getSelectOptionsButton().click()
    collections.getSelectedVariantOptionByName('Paperback').click()
    collections.getSelectedVariantOptionByName('Hardcover').should('be.visible')
    collections.getSaveCollectionItemButton().click()
    collections.getCollectionItemByName(WINE).should('exist')
    collections.getCollectionItemByName(BOOK).should('exist')
    collections.getEnableThisCollectionButton().click()
    marketplace.getEllipsesButton().click()
    collections.getCreateMagicLinkMenuItem().should('exist').click({ force: true })
    // tests Accpeting a MagicLink with many variants
    cy.wait(300)
    sendItem.getLandingPageMessageInput().fill('Many Variants: Sugar plum muffin brownie candy')
    cy.contains('Show Available Options').click()
    cy.findAllByTestId('PostalVariantOption_card_unselected')
      .should('have.length', 5)
      .and('contain', '$5')
      .and('contain', '$10')
      .and('contain', '$25')
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
      defaultFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // adds just a yes/no field and then saves it
      customFormFields.getAddCustomFieldYesNoButton().should('exist').click()
      customFormFields.getNewCustomFieldQuestion().type('Salt?')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('Salt?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('Salt?').should('exist')
    })
    sendItem.getReviewButton().click()
    cy.contains('All the Variants!').should('exist')
    marketplace
      .getReviewRecipientChoice()
      .should('contain', '$5')
      .and('contain', '$10')
      .and('contain', '$25')
      .and('contain', 'Tolosa')
      .and('contain', 'Hardcover')
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(win.prompt)
    })
    magicLinks.getSaveMagicLinkButton().click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        magicLinks.getSaveMagicLinkButton().click()
      }
    })
    sendItem.getConfirmSendModal().within(() => {
      cy.contains('button', 'Create MagicLink').click({ force: true })
    })
    cy.contains('Success! Your MagicLink has been created.')
    onlyOn(Cypress.env('testUrl'), () => {
      cy.contains('a', 'Share URL', { timeout: 99000 }).click()
      cy.wait('@getMagicLink').then((res) => {
        delivery.visit(res.response?.body.data.getMagicLink.linkUrl)
      })
      cy.url().should('contain', '/delivery/link/')
      delivery.getJustSentYouHeader(user.firstName, user.company).should('be.visible')
      cy.contains('Many Variants: Sugar plum muffin brownie candy').should('exist')
      delivery.getItemToSelectByName(WINE)
      delivery.getItemToSelectByName(BOOK)
      delivery.getItemToSelectByName('Chipotle').click()
      delivery.getSelectOptionModal().within(() => {
        delivery.getOptionToSelectByName('$5').should('exist')
        delivery.getOptionToSelectByName('$10').should('exist')
        delivery.getOptionToSelectByName('$25').should('exist').click()
      })
      cy.contains('$25 Gift Card').should('exist')
      cy.contains('$10').should('not.exist')
      cy.contains('$5').should('not.exist')
      cy.findAllByText('Chipotle').should('exist')
      cy.findAllByRole('img').should('exist')
      //tests switching chosen variant
      delivery.getSelectADifferentItem().click()
      delivery.getItemToSelectByName(WINE).click()
      cy.contains('Tolosa').should('exist')
      cy.findAllByRole('img').should('exist')
      delivery.getSelectADifferentItem().click()
      delivery.getItemToSelectByName(BOOK).click()
      cy.contains('Hardcover').should('exist')
      delivery.getJustSentYouHeader(user.firstName, user.company).should('be.visible')
      cy.contains('Many Variants: Sugar plum muffin brownie candy').should('exist')
      cy.contains(BOOK).should('exist')
      cy.findAllByRole('img').should('exist')
      cy.acceptingMagicLink({ needAddress: false })
      cy.findByText('Salt?').should('exist')
      cy.findByRole('checkbox', { name: 'Salt?' }).should('not.be.checked').check({ force: true })
      cy.findByRole('checkbox', { name: 'Salt?' }).should('be.checked')
      delivery.getShippingAddressButton().click({ force: true })
      delivery.getAddDetailsButton().click({ force: true })
      delivery.getShippingDrawer().within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        delivery.getStreetAddress1Input().fill('3133 Upper Lopez Canyon Road')
        delivery.getCityInput().fill('Arroyo Grande')
        // delivery.getStateInputRegEx('California')
        delivery.getPostalCodeInput().type('93420')
        cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
        universal.getSaveButton().click()
      })
      delivery.getUseVerifiedButton().click({ force: true })
      delivery.getSubmitButton().click({ force: true })
      delivery.getOnTheWayText().should('exist')
      //tests order report for a sent collection and accepted magiclinks using collections
      reporting.visitOrderReports()
      cy.wait(500)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
      universal.getRowsInATableBody().should('have.length', 3)
      // collections column
      cy.findAllByText('All the Variants!').eq(0).click()
      cy.url().should('include', '/collections/')
      // magiclink column
      reporting.visitOrderReports()
      universal.getSpinner().should('not.exist')
      cy.findAllByText('All the Variants!').eq(1).click()
      cy.url().should('include', '/links/')
      cy.wait(200)
      //magiclink accepted item
      reporting.visitOrderReports()
      universal.getLinkByText('Everybody Lies:').click()
      universal.getViewOrderModal().within(() => {
        cy.findByText('Form Values')
        universal.getRowByText('Question').should('contain', 'Answer')
        universal.getRowByText('Salt?').should('contain.html', `svg`)
        collections.getCollectionTag().should('be.visible')
        cy.contains(/Processing/i).should('exist')
        cy.contains(RegExp('danieldavis@postal.dev has Accepted!' + '|' + 'No items found'))
        cy.contains('button', 'Order Details').should('be.visible').click()
      })
      cy.contains('Direct Send').should('exist')
      universal.getRetryOrderAgainButton().click()
      cy.findAllByTestId('PostalVariantOption_card_unselected')
        .should('have.length', 4)
        .and('contain', 'Tolosa')
        .and('contain', '$25')
      cy.findAllByTestId('PostalVariantOption_card_selected')
        .should('have.length', 1)
        .and('contain', 'Hardcover')
      sendItem.getReviewButton().should('be.visible').click()
      cy.contains('All the Variants!').should('exist')
    })
  })
  it(`tests that a collection's info shows up in magiclinks profile and order reports`, () => {
    magicLinks.visitMagicLinks()
    universal.getLinkByText('Marzipan icing gummies').click()
    universal.getSpinner().should('not.exist')
    cy.contains('Marzipan icing gummies').should('be.visible')
    //testEnv: tests that the collection's order shows up in Order Reports and navigates to collections when clicked
    onlyOn(Cypress.env('testUrl'), () => {
      reporting.visitOrderReports()
      universal.getRowsInATableBody().should('have.length.gte', 3)
      cy.findAllByRole('link', { name: 'Seeded Collection' }).eq(0).click()
      collections.getCollectionNavCenterByName('Seeded Collection')
    })
  })

  it('tests creating a teams collection', () => {
    cy.createApprovedPostal({ name: 'Def Leppard T-Shirt' })
    marketplace.visitCollections()
    universal.getSpinner().should('not.exist')
    cy.url().should('include', '/collections')
    //tests creating a public collection
    collections.getCreateCollectionCardButton().click({ force: true })
    collections.getNameCollectionInput().should('be.visible').fill('Teams Collection')
    cy.contains('div', 'USD').click()
    cy.wait(200)
    cy.get('.UiSelectTypeahead__input').scrollIntoView()
    cy.get('.UiSelectTypeahead__input').should('be.visible').click({ force: true })
    cy.get('.UiSelectTypeahead__menu').within(() => {
      cy.contains('Jersey').click({ force: true })
    })
    collections.getSelectAnItemsButton().click()
    bulkSelect.getItemByName('Def Leppard T-Shirt')
    collections.getSelectOptionsButton().click()
    universal.getSpinner().should('not.exist')
    cy.contains('button', 'Create Collection').should('not.be.disabled').click({ force: true })
    collections.getCollectionCreatedAlert()
    universal.getSpinner().should('not.exist')
    cy.contains('Enabled').should('exist')
    collections.getBackToCollectionsButton().click({ force: true })
    cy.wait(400)
    cy.get('body').then(($body) => {
      if (!$body.text().includes(`Teams Collection`)) {
        cy.wait(600)
        cy.reload()
      }
    })
    collections.getCollectionByName('Teams Collection').should('exist')
    collections.getShowTeamCollectionsCheckbox().should('not.be.checked').check({ force: true })
    collections.getCollectionByName('Teams Collection').should('not.exist')
  })
})
