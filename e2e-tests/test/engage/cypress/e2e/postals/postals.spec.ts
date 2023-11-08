import { SearchApprovedPostalsDocument } from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Billing,
  Contacts,
  CustomFormFields,
  EmailSettings,
  Form,
  Marketplace,
  Reporting,
  SendItem,
  SidePanel,
  Subscriptions,
  Universal,
} from '../../support/pageObjects'

describe('Approved Items Testing', function () {
  //grabs the user info global variables to be used in the signup
  const user = userFactory()
  const marketplace = new Marketplace()
  const contacts = new Contacts()
  const customFormFields = new CustomFormFields()
  const sendItem = new SendItem()
  //const designEditor = new DesignEditor()
  const reporting = new Reporting()
  const universal = new Universal()
  const billing = new Billing()
  const form = new Form()
  const subscriptions = new Subscriptions()
  const sidePanel = new SidePanel()
  const emailSettings = new EmailSettings()

  before(function () {
    cy.signup(user)
    //in order to assign a postal to a team you need more than one team
    cy.teamsSeed(5)
    //creates a contact with a valid address
    cy.createAContact({})
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:items:approved:filter')
    cy.filterLocalStorage('postal:marketplace:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'searchContactsV2') {
        req.alias = 'searchContactsV2'
      }
      if (req.body.operationName === 'searchApprovedPostals') {
        req.alias = 'searchApprovedPostals'
      }
    })
  })

  it(`tests creating an active approved postal from a postcard and assigning it to a team`, function () {
    marketplace.visitAllItems()
    cy.url().should('contain', '/items/marketplace')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    //tests the info in some postals overlays - a price and shipping
    cy.wait(500)
    cy.contains('Def Leppard T-Shirt').should('be.visible')
    marketplace
      .getNewPostalByName('Def Leppard T-Shirt')
      .should('be.visible')
      .should('contain', '$')
      .and('contain', '-')
      .parent('div')
      .realHover()
      .within(() => {
        cy.contains('View this Item').click()
      })
    marketplace.getChooseYourOptionsContainer().within(() => {
      cy.get('button').click()
    })
    cy.findByRole('menu').should('contain', 'FREE Shipping').and('contain', '$')
    universal.getBackToButton('marketplace').click()
    universal.getSpinner().should('not.exist')
    sidePanel.waitForFilterHeader()
    //an EU price range and shipping
    marketplace
      .getNewPostalByName('Chipotle EU')
      .should('contain', '€')
      .and('contain', '-')
      .parent('div')
      .realHover()
      .within(() => {
        cy.contains('View this Item').click()
      })
    marketplace.getChooseYourOptionsContainer().within(() => {
      cy.get('button').click()
    })
    cy.findByRole('menu').should('contain', 'FREE').and('contain', '€')
    universal.getBackToButton('marketplace').click()
    universal.getSpinner().should('not.exist')
    sidePanel.waitForFilterHeader()

    //navigate to direct mail, forcing a click protects against flake.
    sidePanel.selectFilter('Categories', 'Direct Mail')
    cy.wait(300)
    marketplace.getPostcardButton().should('be.visible').click({ force: true })
    cy.url().should('contain', '/items/marketplace/')
    marketplace.getChooseYourOptionsContainer().within(() => {
      cy.get('button').click()
    })
    cy.findByRole('menu').findAllByRole('menuitem').should('have.length', 3)
    marketplace.getApproveThisButton().click()
    cy.wait(1200)
    // toggles status
    marketplace.getSetStatusToggle().should('be.visible')
    marketplace.getSetStatusToggle().should('contain', 'Active')
    marketplace.getSetStatusToggle().findByRole('checkbox').should('be.checked')
    marketplace.getSetStatusToggle().findByRole('checkbox').click({ force: true })
    marketplace
      .getSetStatusToggle()
      .findByRole('checkbox')
      .should('not.be.checked')
      .click({ force: true })
    marketplace.getSetStatusToggle().findByRole('checkbox').should('be.checked')

    //tries to submit with empty fields, then fills them
    marketplace.getPostalNameInput().clear()
    marketplace.getPostalNameInput().then(form.checkValidity).should('be.false')
    marketplace.getPostalNameInput().fill('FirstPostal')
    marketplace
      .getDisplayNameInput()
      .should('have.value', 'Postcard')
      .clear()
      .getInputValidation('Please fill out this field.')
      .fill('My Display Name')
    marketplace.getPostalNameInput().then(form.checkValidity).should('be.true')
    marketplace.getPostalDescriptionInput().clear()
    marketplace.getPostalDescriptionInput().then(form.checkValidity).should('be.false')
    marketplace.getPostalDescriptionInput().fill('e2e testing')
    marketplace.getPostalDescriptionInput().then(form.checkValidity).should('be.true')
    cy.findAllByTestId('AutoCompleteTeam').scrollIntoView()
    cy.selectAutoCompleteTeam('Jersey')
    cy.getAutoCompleteValues('AutoCompleteTeam').should('contain', 'Jersey')

    // tests assigning it to a team
    //tests choosing one option out of the three
    marketplace.getChooseYourOptionsContainer().within(() => {
      cy.get('button').click()
    })
    cy.findAllByTestId('PostalVariantOption_card_selected').should('have.length', 3)
    cy.findAllByTestId('PostalVariantOption_card_selected').eq(0).click({ force: true })
    cy.findAllByTestId('PostalVariantOption_card_selected').eq(1).click({ force: true })
    cy.findAllByTestId('PostalVariantOption_card_selected').should('have.length', 1)
    cy.findAllByRole('img').eq(0).click()
    //tests the ToolTips and their text
    marketplace.getDisplayNameTooltip().parent('div').realHover()
    cy.get('body').then(($body) => {
      if (!$body.text().includes('This name will be shown externally')) {
        cy.wait(300)
        marketplace.getDisplayNameTooltip().parent('div').realHover()
      }
    })
    marketplace.getDisplayNameTooltipText().should('exist')
    marketplace.getDescriptionNameTooltip().parent('div').realHover()
    cy.get('body').then(($body) => {
      if (!$body.text().includes('The description will be shown externally')) {
        cy.wait(300)
        marketplace.getDescriptionNameTooltip().parent('div').realHover()
      }
    })
    marketplace.getDescriptionNameTooltipText().should('exist')
    cy.wait(300)
    marketplace.getTeamsTooltip().parent('div').realHover()
    cy.get('body').then(($body) => {
      if (!$body.text().includes('You can restrict')) {
        cy.wait(300)
        marketplace.getDescriptionNameTooltip().parent('div').realHover()
      }
    })
    marketplace.getTeamsTooltipText().should('exist')
    //check that an 'edit the design' button works
    marketplace.getEditDesignButton().click({ force: true })
    universal.getBackToButton('postcard').click()
    cy.wait(300)
    marketplace.getSavePostalButton().click()
    //marketplace.getItemCreatedMessage()
    //universal.getBackToButton('my_items').click({ force: true })
    cy.url().should('include', '/items/postals')
    //cy.wait(['@searchApprovedPostals', '@searchApprovedPostals'])
    cy.wait(500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('FirstPostal')) {
        cy.wait(3100)
        cy.reload()
        cy.wait(300)
      }
    })
    universal.getThingSpinner().should('exist')
    cy.contains('FirstPostal', { timeout: 600000 }).should('exist')
  })

  it(`edits and sends the new postal`, function () {
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    //test viewing the postal
    cy.get('body').then(($body) => {
      if (!$body.text().includes('FirstPostal')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('a', 'FirstPostal').click()
    cy.findByText('e2e testing').should('be.visible')
    //todo: test number of options in the selct option select
    marketplace.getSelectAnOptionContainer().within(() => {
      cy.contains('button', 'Postcard').should('exist')
    })
    cy.findAllByTestId('PostalVariantOption_card_selected').should('have.length', '1')
    cy.findByText('Jersey')
    //edits the new postal
    cy.wait(300)
    marketplace.getEditButton().click({ force: true })
    marketplace.getPostalNameInput().as('name').clear()
    cy.get('@name').fill(`FirstPostal Edited`)
    marketplace
      .getDisplayNameInput()
      .should('have.value', 'My Display Name')
      .clear()
      .getInputValidation('Please fill out this field.')
      .fill('Edited Display Name')
    marketplace
      .getPostalDescriptionInput()
      .as('description')
      .clear()
      .getInputValidation('Please fill out this field.')
      .fill(`e2e testing Edited`)
    cy.getAutoCompleteValues('AutoCompleteTeam').scrollIntoView()
    cy.getAutoCompleteValues('AutoCompleteTeam').should('contain', 'Jersey')
    cy.selectAutoComplete('zzzTeam', 'AutoCompleteTeam')
    cy.getAutoCompleteValues('AutoCompleteTeam').should('contain', 'zzzTeam')
    cy.findAllByTestId('PostalVariantOption_card_unselected').eq(1).click({ force: true })
    cy.wait(3500)
    marketplace.getDisplayNameTooltip().realHover()
    marketplace.getDisplayNameTooltipText().should('exist')
    marketplace.getDescriptionNameTooltip().realHover()
    marketplace.getDescriptionNameTooltipText().should('exist')
    marketplace.getTeamsTooltip().realHover()
    marketplace.getTeamsTooltipText().should('exist')
    marketplace.getUpdatePostalButton().click()
    marketplace.getItemUpdatedMessage()
    marketplace.getSendDirectlyButton().should('exist')
    cy.findByText('FirstPostal Edited')
    cy.findByText(`e2e testing Edited`)
    cy.findAllByTestId('PostalVariantOption_card_unselected').should('have.length', 1)
    cy.findAllByTestId('PostalVariantOption_card_selected').should('have.length', 1)
    cy.findByText('Jersey')
    cy.findByText(/Zzzteam/i)
    //setup for the following delete test - placing it here supports a flake fix
    //create a postal that has attached automations
    cy.createChipotlePostal().then((res) => {
      cy.subscriptionsSeed({
        approvedPostalId: res.id,
        variantId: res.variants?.[0]?.id ?? '',
        numberOfSubscriptions: 2,
      })
    })
    //sends the new postal
    marketplace.getSendDirectlyButton().realClick()
    cy.url().should('contain', '/send')
    cy.wait(300)
    contacts.checkContactCheckboxByRowNumber(0)
    sendItem.getReviewButton().click()
    cy.wait(['@searchContactsV2', '@searchContactsV2'])
    cy.contains('FirstPostal Edited').should('be.visible')
    sendItem.getReviewOption().should('contain', 'Postcard 4"x6"')
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('have.length', 1)
    })
    sendItem.getReviewItemCosts().should('not.contain', '$0.00')
    //P2-2818
    //sendItem.getReviewEstimatedVendorSalesTax().should('not.contain', '$0.00')
    sendItem.getReviewTransactionFee().should('not.exist')
    sendItem.getReviewShippingAndPostage().should('not.contain', '$0.00')
    sendItem.getReviewTotal().scrollIntoView().should('be.visible').and('not.contain', '$0.00')
    sendItem.getInsufficientFundsText().should('exist')
    cy.wait(1000)
    sendItem.getAddFundsToConfirmSendButton().click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    // Full Add Funds workflow tested in Campaigns
    // this should just confirm it appears, funds can be added
    // and then continue on w/ testing
    sendItem.getAddFundsModal().within(() => {
      billing.getChangePaymentMethodButton().should('exist')
      sendItem
        .getAddFundsAmountInput()
        .should('have.have.attr', 'placeholder', '1000.00')
        .and('be.visible')
        .type('300.00')
      billing.getAddFundsButton().should('not.be.disabled').click({ force: true })
    })
    billing.getConfirmFundsModal().within(() => {
      universal.getConfirmButton().click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    billing.getConfirmFundsModal().should('not.exist')
    cy.wait(300)
    cy.findAllByText('$300.00', { timeout: 54000 }).should('be.visible')
    universal.getCancelButton().click()
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    cy.wait(300)
    reporting.visitReporting()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    reporting.getOrderReportTab().click({ force: true })
    cy.get('tbody').children().should('have.length', 1)
  })

  it(`deletes a postal with attached automations`, function () {
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Chipotle')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.wait(200)
    cy.contains('a', 'Chipotle', { timeout: 300000 }).click()
    cy.wait(3500)
    marketplace.getEllipsesButton().parent('div').should('be.visible')
    marketplace.getEllipsesButton().click({ force: true })
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Delete Item')) {
        cy.wait(8000)
        marketplace.getEllipsesButton().parent('div').realClick()
        cy.wait(300)
      }
    })
    marketplace.getDeleteActionItem().should('be.visible')
    cy.wait(200)
    marketplace.getDeleteActionItem().click({ force: true })
    cy.findByRole('alertdialog', { name: 'Delete Item & Related Integrations', timeout: 10000 })
      .as('deleteAutomationModal')
      .within(() => {
        cy.findByTestId('automationList').within(() => {
          cy.findByText('Subscription Two').should('be.visible')
          cy.findByText('Subscription One').invoke('removeAttr', 'target').click({ force: true })
        })
      })
    cy.url().should('contain', 'subscriptions')
    universal.progressBarZero()
    cy.contains('Subscription One').should('exist')
    marketplace.getEllipsesButton().parent('div').realClick()
    cy.wait(300)
    subscriptions.getDeletePlaybookMenuItem().realClick()
    universal.getDeleteButton().should('be.visible').click({ force: true })
    cy.url().should('not.contain', 'subscriptions/')
    marketplace.visitMyItems()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('a', 'Chipotle').click()
    cy.wait(20000)
    marketplace.getEllipsesButton().eq(0).should('be.visible')
    marketplace.getEllipsesButton().parent('div').realClick()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Delete Item')) {
        cy.wait(20000)
        marketplace.getEllipsesButton().parent('div').realClick()
        cy.wait(300)
      }
    })
    marketplace.getDeleteActionItem().should('be.visible').realClick()
    cy.findByRole('alertdialog', {
      name: 'Delete Item & Related Integrations',
    }).within(() => {
      cy.findByText('Subscription One').should('not.exist')
      cy.findByText('Subscription Two')
      universal.getDeleteButton().click({ force: true })
    })
    cy.findByRole('alertdialog', {
      name: 'Delete Item & Related Integrations',
    }).should('not.exist')
    //flakey and seemingly no longer needed
    // cy.queryForUpdateRecurse({
    //   request: SearchApprovedPostalsDocument,
    //   options: { filter: { status: { eq: 'ACTIVE' } } },
    //   operationName: 'searchApprovedPostals',
    //   key: '0',
    //   value: 'FirstPostal Edited',
    //   key2: 'name',
    // })
    cy.wait(300)
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('FirstPostal Edited').should('be.visible')
    cy.get('body').then(($body) => {
      if ($body.text().includes('Chipotle')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('Chipotle').should('not.exist')
  })

  it(`deletes the new postal`, function () {
    marketplace.visitMyItems()
    cy.contains('a', `FirstPostal Edited`).click()
    cy.url().should('contain', '/items/postals/')
    cy.wait(500)
    cy.findByText('FirstPostal Edited')
    cy.wait(2500)
    marketplace.getEllipsesButton().click({ force: true })
    cy.wait(300)
    marketplace.getDeleteActionItem().realClick()
    marketplace.getDeleteItemModal().within(() => {
      universal.getCancelButton()
      marketplace.getDeleteButton().click()
    })
    universal.getThingSpinner().should('exist')
    universal.getThingSpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if ($body.text().includes('FirstPostal Edited')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('a', 'FirstPostal Edited', { timeout: 500000 }).should('not.exist')
    //tests that when an Item is Removed from my items a nottification is added to Activity Stream
    //bug P2-5312
    // reporting.visitRecentActivity()
    // universal.getSpinner().should('not.exist')
    // cy.contains('has been removed from My Items').should('exist')
  })
  it(`creates a draft of a new Chipotle postal`, function () {
    marketplace.visitAllItems()
    cy.url().should('contain', '/items/marketplace')
    cy.wait(1000)
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('Tolosa').should('be.visible')
    sidePanel.selectFilter('Categories', 'Gift Cards')
    marketplace.getNewPostalByName('Tolosa').should('not.to.exist')
    marketplace.getAllItems().should('have.length.lte', 5).and('have.length.gte', 2)
    marketplace.getNewPostalByName('Chipotle EU').should('be.visible')
    cy.contains('a', '$').click()
    cy.contains('Product Information').should('be.visible')
    marketplace.getApproveThisButton().should('exist').and('not.have.attr', 'data-loading')
    cy.findAllByText(/^Chipotle$/).should('be.visible')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getSetStatusToggle().findByRole('checkbox').click({ force: true })
    marketplace
      .getSetStatusToggle()
      .should('contain', 'Active')
      .and('be.visible')
      .findByRole('checkbox')
      .uncheck({ force: true })
    marketplace.getSavePostalButton().click({ force: true })
    //tests that the Duplicate Item warning modal does not appear when it shouldn't
    //cy.contains('section', 'Duplicate Item').should('not.exist')
    //bug P2-5312 next two lines should not be needed and the above uncommented
    cy.contains('section', 'Duplicate Item').within(() => {
      cy.contains('button', 'Approve Anyway').click()
    })
    marketplace.getItemCreatedMessage()
    cy.url().should('contain', 'items/postals')
    cy.wait(3500)
    universal.getSpinner().should('not.exist')
    cy.findAllByText('Chipotle').should('be.visible')
    marketplace.getMyItemsHeaderButton().click({ force: true })
    cy.wait(1000)
    cy.contains('div', 'Show Draft Items', { timeout: 43000 })
      .should('be.visible')
      .findByRole('checkbox')
      .check({ force: true })
    cy.wait(2500)
    universal.getUITagByText('Draft').should('exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    universal.getAllUiCards().should('have.length.lte', 4)
  })
  it(`tests that the Duplicate Item Modal shows up when it should`, function () {
    marketplace.visitAllItems()
    cy.url().should('contain', '/items/marketplace')
    cy.wait(1000)
    universal.getSpinner().should('not.exist')
    marketplace.getNewPostalByName('Tolosa').should('be.visible')
    sidePanel.selectFilter('Categories', 'Gift Cards')
    marketplace.getAllItems().should('have.length.lte', 5).and('have.length.gte', 2)
    marketplace.getNewPostalByName('Chipotle EU').should('be.visible')
    cy.contains('a', '$').click()
    cy.contains('Product Information').should('be.visible')
    marketplace.getApproveThisButton().should('exist').and('not.have.attr', 'data-loading')
    cy.findAllByText(/^Chipotle$/).should('be.visible')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getSetStatusToggle().findByRole('checkbox').click({ force: true })
    marketplace
      .getSetStatusToggle()
      .should('contain', 'Active')
      .and('be.visible')
      .findByRole('checkbox')
      .uncheck({ force: true })
    marketplace.getSavePostalButton().click({ force: true })
    //tests that the Duplicate Item warning modal appears
    cy.contains('section', 'Duplicate Item').within(() => {
      cy.contains('This item is already approved for these users.').should('exist')
      cy.contains('Are you sure you want to approve it?').should('exist')
      cy.contains('Chipotle').should('exist')
      cy.contains('$5 - $25').should('exist')
      cy.contains('button', 'Go back').should('exist')
      cy.contains('button', 'Approve Anyway').click()
    })
  })
  it(`clones the new draft Chipotle postal`, function () {
    marketplace.visitMyItems()
    cy.wait(1500)
    cy.contains('div', 'Show Draft Items', { timeout: 50000 })
      .should('be.visible')
      .findByRole('checkbox')
      .check({ force: true })
    marketplace.getNewPostalByName('Chipotle').should('be.visible')
    universal.getUITagByText('Draft').should('exist')
    universal.getSpinner().should('not.exist')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(2500)
    marketplace.getEllipsesButton().eq(0).should('be.visible')
    marketplace.getEllipsesButton().parent('div').realClick()
    cy.wait(300)
    marketplace.getCloneActionItem().should('be.visible')
    cy.wait(200)
    marketplace.getCloneActionItem().realClick()
    marketplace.getCloneItemModal().within(() => {
      universal.getCancelButton()
      marketplace.getCloneItemButton().click()
    })
    marketplace.getItemClonedMessage()
    cy.wait(200)
    marketplace.getEditButton().click({ force: true })
    marketplace
      .getDisplayNameInput()
      .should('have.value', 'Chipotle')
      .clear()
      .getInputValidation('Please fill out this field.')
      .fill('Chipotle-CLONE')
    marketplace.getUpdatePostalButton().click()
    marketplace.getMyItemsHeaderButton().click({ force: true })
    cy.wait(800)
    universal.getSpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Chipotle-CLONE')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('Chipotle-CLONE', { timeout: 300000 }).should('be.visible')
  })
  it(`tests remaining view postal buttons and actions to make sure they navigate where they should`, function () {
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    universal.getSpinner().should('not.exist')
    cy.wait(800)
    cy.contains('div', 'Show Draft Items', { timeout: 43000 })
      .should('be.visible')
      .findByRole('checkbox')
      .check({ force: true })
    cy.wait(1000)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Chipotle-CLONE')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('Chipotle-CLONE').should('be.visible')
    universal.getUITagByText('Draft').should('exist')
    cy.wait(1000)
    universal.getAllUITags().should('have.length.gte', 3)
    cy.contains('Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle-CLONE').should('be.visible').click()
    cy.wait(1000)
    //tests that draft will not show magiclinks and send item buttons
    marketplace.getEllipsesButton().eq(0).should('be.visible')
    marketplace.getEllipsesButton().parent('div').realClick()
    cy.wait(300)
    marketplace.getMagicLinkActionItem().should('not.exist')
    marketplace.getSendActionItem().should('not.exist')
    cy.findAllByText('Chipotle-CLONE').should('exist')
    //changes from draft status to active
    marketplace.getEditButton().click({ force: true })
    marketplace
      .getSetStatusToggle()
      .should('contain', 'Active')
      .findByRole('checkbox')
      .click({ force: true })
    marketplace.getUpdatePostalButton().click()
    marketplace.getSendButton().click({ force: true })
    cy.contains('MagicLink').should('be.visible')
    sendItem.getLandingPageBodySection().should('be.visible')

    //tests edit postal action option
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(500)
    cy.contains('Chipotle', { timeout: 45000 }).should('be.visible')
    universal.getUITagByText('Draft').should('exist')
    cy.contains('a', 'Chipotle-CLONE').click()
    cy.findAllByText('Chipotle-CLONE').should('exist')
    marketplace.getEditButton().should('be.visible').click({ force: true })
    marketplace
      .getSetStatusToggle()
      .should('contain', 'Active')
      .findByRole('checkbox')
      .click({ force: true })
    marketplace.getPostalNameInput().clear()
    marketplace.getPostalNameInput().clear().type('Chipotle-CLONE-ED')
    marketplace.getDisplayNameInput().clear()
    marketplace.getDisplayNameInput().clear().type('Chipotle-CLONE-ED')
    marketplace.getUpdatePostalButton().click()

    //tests the shipping price visibility in all items, my items, and in send flow
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    //a range of prices and shipping
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Everybody Lies:')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('div', 'Everybody Lies:')
      .should('be.visible')
      .within(() => {
        cy.contains('$')
      })
    cy.contains('div', 'Everybody Lies:').find('a').click({ force: true })
    cy.findAllByTestId('PostalVariantOption_card_selected')
      .eq(0)
      .should('contain', 'FREE')
      .and('contain', '$')
    cy.findAllByTestId('PostalVariantOption_card_selected')
      .eq(1)
      .should('contain', 'FREE')
      .and('contain', '$')
    marketplace.getApproveThisButton().click({ force: true })
    cy.wait(300)
    Cypress.on('uncaught:exception', () => {
      return false
    })
    marketplace.getSavePostalButton().click({ force: true })
    marketplace.getMyItemsHeaderButton().click({ force: true })
    cy.wait(800)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Everybody Lies')) {
        cy.wait(4100)
        cy.reload()
      }
    })
    marketplace.getNewPostalByName('Everybody Lies:').should('be.visible')

    marketplace.getNewPostalByName('Everybody Lies:').parent('div').should('contain', '$')
    marketplace.getNewPostalByName('Everybody Lies:').parent('div').realHover()
    marketplace
      .getNewPostalByName('Everybody Lies:')
      .parent('div')
      .within(() => {
        cy.findByLabelText('Send Item').should('exist')
        cy.contains('View this Item').click()
      })
    cy.findAllByTestId('PostalVariantOption_card_selected')
      .eq(0)
      .should('contain', 'FREE')
      .and('contain', '$')
    cy.findAllByTestId('PostalVariantOption_card_selected')
      .should('contain', 'FREE')
      .and('contain', '$')
  })
  it(`tests send postal action option and the send gift message option`, function () {
    //tests send postal action option
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.wait(800)
    cy.contains('div', 'Show Draft Items', { timeout: 43000 })
      .should('be.visible')
      .findByRole('checkbox')
      .check({ force: true })
    cy.contains('a', 'Chipotle-CLONE-ED').click()
    cy.findAllByText('Chipotle-CLONE-ED').should('exist')
    marketplace.getEditButton().click({ force: true })
    universal.getCloseButtonByLabelText().should('be.visible')
    marketplace
      .getSetStatusToggle()
      .should('contain', 'Active')
      .findByRole('checkbox')
      .click({ force: true })
    marketplace.getUpdatePostalButton().click()
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Chipotle', { timeout: 45000 }).should('be.visible')
    cy.contains('a', 'Chipotle-CLONE-ED').click()
    cy.findAllByText('Chipotle-CLONE-ED').should('exist')
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    universal.getNoItemsMessage().should('not.exist')
    contacts.checkContactCheckboxByRowNumber(0)
    sendItem.getConfigureYourItemButton().click()
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.wait(300)
    sendItem.getSubjectLineInput().fill('Yahoo!')
    //tests that the Landing Page Header and message inputs
    cy.wait(300)
    sendItem.getGiftEmailMessageInput().fill('My First Gift Email Message.')
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().fill('New LP Header')
    sendItem.getLandingPageBodySection().within(() => {
      cy.findAllByRole('button').eq(2).click({ force: true })
      cy.wait(300)
      sendItem.getLandingPageMessageInput().fill('Chipotle LP Message')
    })
    const defaultFields = ['First Name', 'Last Name', 'Email Address', 'Title', 'Company']
    defaultFields.forEach((field) => {
      sendItem.getCustomizeFieldsTagByName(field).should('exist')
    })
    //tests recipient notifications
    sendItem
      .getRecipientNotifications()
      .scrollIntoView()
      .within(() => {
        sendItem
          .getSendShippedEmailCheckbox()
          .should('not.be.checked')
          .check({ force: true })
          .should('be.checked')
        sendItem
          .getSendDeliveredEmailCheckbox()
          .should('not.be.checked')
          .check({ force: true })
          .should('be.checked')
      })
    sendItem.getCustomizeFieldsButton().click()

    customFormFields.getCustomizeFormSettingsModal().within(() => {
      //default fields should exist
      customFormFields.getCustomFieldFirstName().should('exist')
      customFormFields.getCustomFieldLastName().should('exist')
      customFormFields.getCustomFieldEmailAddress().should('exist')
      customFormFields.getCustomFieldTitle().should('exist')
      customFormFields.getCustomFieldCompany().should('exist')
      //extensive testing of the Customize Form Settings Modal done on events.spec
      // add a text field and then save it
      customFormFields.getAddCustomFieldTextButton().click()
      customFormFields.getNewCustomFieldQuestion().type('N0tes:')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('N0tes:').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('N0tes:').should('exist')
    })
    sendItem.getSendAsSelect().should('exist')
    sendItem.getSpendAsCard().within(() => {
      cy.contains(`${user.userName}`).should('exist')
    })
    sendItem.getReviewButton().click()
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    sendItem.getReviewSubjectLine().should('contain', 'Yahoo')
    sendItem.getReviewGiftMessageSection().should('contain', 'My First Gift Email Message.')
    sendItem.getReviewLandingPageTitle().should('contain', 'New LP Header')
    sendItem.getReviewLandingPageMessage().within(() => {
      cy.contains('strong', 'Chipotle LP Message').should('exist')
    })
    sendItem.getReviewSendAsSection().should('not.exist')
    sendItem.getViewGiftEmailLink().click()
    sendItem.getViewedGiftEmailPopoverHeader().within(() => {
      cy.contains(/Gift Email/)
      cy.findByRole('button', { name: 'Close' }).click()
    })
    cy.contains('Review').should('exist')
    sendItem.getSaveAndSendButton().click()
    sendItem.getSendButton().click({ force: true })
    cy.contains('Loading').should('not.exist')
    contacts.visitContacts()
    universal.waitForProgressBar()
    universal.getRowByNumber(0).within(() => {
      cy.get('a').click()
    })
    universal.waitForProgressBar()
    universal.getLinkByText('Chipotle-CLONE-ED').click()
    cy.contains('Personalized Email Order').should('exist')
    cy.contains('Chipotle-CLONE-ED').should('exist')
    cy.contains('Chipotle').should('exist')
    universal.getRetryOrderAgainButton().click({ force: true })
    cy.contains('Yahoo!').should('exist')
    cy.wait(300)
    sendItem.getSubjectLineInput().clear().fill('Edited Yahoo!')
    cy.contains('My First Gift Email Message.').should('exist')
    cy.wait(300)
    sendItem.getGiftEmailMessageInput().clear().fill('Edited Gift Email Message')
    cy.contains('New LP Header').should('exist')
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().clear().fill('Edited LP Header')
    cy.contains('Chipotle LP Message').should('exist')
    cy.wait(300)
    sendItem.getLandingPageMessageInput().clear().fill('Edited Chipotle LP Message')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('N0tes:').should('exist')
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // adds just a yes/no field and then saves it
      customFormFields.getAddCustomFieldDateButton().should('exist').click()
      customFormFields.getNewCustomFieldQuestion().type('New?')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('New?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getCustomizeFieldsTagByName('N0tes:').should('exist')
    sendItem.getCustomizeFieldsTagByName('New?').should('exist')
    sendItem.getSendAsSelect().should('exist')
    cy.findAllByTestId('PostalVariantOption_card_selected').should('have.length', '1')
    cy.findAllByTestId('PostalVariantOption_card_unselected').should('have.length', '2')
    sendItem.getReviewButton().click()
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    sendItem.getReviewSubjectLine().should('contain', 'Edited Yahoo!')
    sendItem.getReviewGiftMessageSection().should('contain', 'Edited Gift Email Message')
    sendItem.getReviewLandingPageTitle().should('contain', 'Edited LP Header')
    sendItem.getReviewLandingPageMessage().within(() => {
      cy.contains('Edited Chipotle LP Message').should('exist')
    })
    sendItem.getReviewSendAsSection().should('not.exist')
    cy.wait(800)
    sendItem.getSaveAndSendButton().click({ force: true })
    sendItem.getConfirmSendModal().within(() => {
      cy.contains('button', RegExp('Send' + '|' + 'Send Again')).click({ force: true })
    })
    cy.contains('Success! Your email is on the way!')
    cy.contains('Personalized Email Order').should('exist')
    cy.contains('Chipotle-CLONE-ED').should('exist')
    cy.contains('Chipotle').should('exist')
    universal.getRetryOrderAgainButton().should('exist')
    //tests that when the always gift email setting is selected the send directly button will not show up
    emailSettings.visitGiftEmails()
    emailSettings.getAlwaysButton().should('be.visible').find('input').click({ force: true })
    emailSettings.getAlwaysButton().should('contain.html', 'svg')
    emailSettings.getSettingsUpdatedAlert()
    marketplace.visitMyItems()
    cy.contains('a', 'Chipotle-CLONE-ED').should('be.visible').click({ force: true })
    marketplace.getEditButton().should('be.visible')
    marketplace.getSendButton().click({ force: true })
    cy.contains('button', 'MagicLink').should('exist')
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
  })
})
