import { addDays, format, subDays } from 'date-fns'
import { userFactory } from '../../support/factories'
import {
  Billing,
  Contacts,
  Marketplace,
  Navbar,
  Orders,
  SendItem,
  SidePanel,
  Universal,
} from '../../support/pageObjects'

const today = new Date()
const tomorrow = addDays(today, 1)
const inTwoDays = addDays(today, 2)
const twoDaysAgo = subDays(today, 2)

const dateFormatTable = (date: Date) => date.toLocaleDateString()
const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')

//let createdId: string

describe('Group Orders Testing', function () {
  const user = userFactory()
  const marketplace = new Marketplace()
  const universal = new Universal()
  const navbar = new Navbar()
  const orders = new Orders()
  const sendItem = new SendItem()
  const contacts = new Contacts()
  const billing = new Billing()
  const sidePanel = new SidePanel()

  let id: string
  //const firstName: string = user.firstName
  const email: string = user.userName
  const company: string = user.company
  let approvedPostalId: string
  let variantId: string

  before(() => {
    cy.signup(user)
    cy.currentUser().then((res) => {
      id = res.userId
    })
    cy.createApprovedPostcard().then((postcard) => {
      approvedPostalId = postcard.id
      variantId = postcard.variants?.[0].id ?? ''
    })
    cy.createChipotlePostal()
    cy.wait(200)
    cy.contactsSeed()
    //old campaigns api still works, might need to replace in the future
    cy.campaignsSeed({
      approvedPostalId,
      variantId,
    })
  })

  beforeEach(() => {
    cy.login(user)
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'searchContactsV2') {
        req.alias = 'searchContactsV2'
      }
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
      if (req.body.operationName === 'searchCampaigns') {
        req.alias = 'searchCampaigns'
      }
    })
  })

  it(`tests that the sidebar and Group Orders page renders appropriately`, function () {
    orders.visitOrders()
    universal.getSpinner().should('not.exist')
    orders.getGroupOrdersButton().click()
    cy.addToFavorites(id).then((res) => {
      cy.log(`bulkContactAddToList Status:${res.status}`)
    })
    //tests that the group orders side bar renders appropriately
    cy.url().should('contain', '/orders/all')
    universal.getRowByText('Error').should('be.visible')
    universal.getLinkByText('Overview').should('be.visible')
    universal.getLinkByText('All Orders').should('be.visible')
    universal.getLinkByText('Drafts').should('be.visible')
    universal.getLinkByText('Emails').should('be.visible')
    cy.contains('li', 'MagicLinks').should('be.visible')
    universal.getLinkByText('Direct').should('be.visible')
    cy.contains('li', 'Subscriptions').should('be.visible')
    cy.contains('li', 'Triggers').should('be.visible')
    orders
      .getGroupOrdersButton()
      .should('be.visible')
      .parents('header')
      .within(() => {
        cy.contains('button', 'Orders').should('be.visible')
        cy.findAllByPlaceholderText('Search...').should('be.visible')
        // finds the scheduled filter link
        cy.get('a').should('have.length', 1)
      })
    navbar.getOrdersLink().should('have.attr', 'aria-current', 'page')
  })

  it(`tests the group orders table sorting, pagination, and searching for a group order`, function () {
    orders.visitOrders()
    orders.getGroupOrdersButton().click()
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByText('Pending').should('exist')
    universal.getRowByText('Error').should('exist')
    universal.getRowByText('Cancelled').should('exist')
    universal.getRowByText('Processing').should('exist')
    universal.getRowByText('Scheduled').should('exist')
    //tests Sort By Status
    orders
      .getGroupOrdersButton()
      .should('be.visible')
      .parents('header')
      .within(() => {
        //clicks the scheduled filter link
        cy.get('a').as('scheduledFilter').click()
      })
    universal.getRowsInATableBody().eq(0).should('contain', 'Scheduled')
    universal.getRowByText('Pending').should('not.exist')
    universal.getRowByText('Error').should('not.exist')
    universal.getRowByText('Cancelled').should('not.exist')
    universal.getRowByText('Processing').should('not.exist')
    //reset filter
    cy.get('@scheduledFilter').click()
    //tests the group orders' table's pagination
    //1
    universal.getPaginationPages('1')
    universal.getRowsInATableBody().should('have.length', '10')
    universal.getAngleLeftButton().should('be.disabled')
    universal.getAngleRightButton().should('not.be.disabled').click()
    // >  -  2
    universal.getPaginationPages('2')
    universal.getRowsInATableBody().should('have.length', '10')
    universal.getAngleLeftButton().should('not.be.disabled')
    universal.getAngleRightButton().should('not.be.disabled').click()
    // <<  -  3
    universal.getPaginationPages('3')
    universal.getRowsInATableBody().should('not.have.length', '10')
    universal.getAngleRightButton().should('be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click()
    // >  -  2
    universal.getPaginationPages('2')
    universal.getRowsInATableBody().should('have.length', '10')
    universal.getAngleRightButton().should('not.be.disabled')
    universal.getAngleLeftButton().should('not.be.disabled').click()
    // <  -  1
    universal.getPaginationPages('1')
    universal.getRowsInATableBody().should('have.length', '10')
    //tests searching for a group order
    orders.getSearchInput().fill('sec')
    universal.getRowByText('Second Campaign').should('be.visible')
  })

  it(`tests creating a group order and adding funds`, function () {
    //Create a Group Order - tests select contacts
    //the filter here is the same component on the Contacts table - so no need to repeat testing
    //The data table is also the same component with a few different attributes and less columns
    //tests that filter renders
    //doesn't test pagination
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Postcard')) {
        cy.wait(34000)
        cy.reload()
      }
    })
    cy.contains('a', 'Postcard').click()
    cy.url().should('contain', '/items/postals/')
    cy.wait(300)
    marketplace.getSendButton().click({ force: true })
    cy.contains('Select Contacts').should('be.visible')
    universal.getTableHeader().should('contain', contacts.contactsTableHeaderText2())
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', '10')
    contacts.getShowFiltersButton().should('be.visible').click({ force: true })
    contacts.getCreateDateFilter().should('be.visible').should('exist')
    contacts.getFirstNameFilter().should('exist')
    contacts.getCompanyFilter().should('exist')
    contacts.getLastSendFilter().should('exist')
    contacts.getLastNameFilter().should('exist')
    contacts.getTitleFilter().should('exist')
    contacts.getEmailAddressFilter().should('exist')
    contacts.getCityFilter().should('exist')
    contacts.getStateFilter().should('exist')
    contacts.getPostalCodeFilter().should('exist')
    contacts.getContactOwnerFilter().should('exist')
    contacts.getTagsFilter().should('exist')
    cy.clickCheckboxByRowNumber({ num: 1 })
    cy.clickCheckboxByRowNumber({ num: 2 })
    sendItem.getConfigureYourItemButton().click()
    sendItem.getReviewButton().should('exist')
    //seperating it like this peserves testing of contacts and select items pages in the send workflow
    //not sure if testing is this detailed in other places since campaigns was the first test to be written
    contacts.visitContacts()
    cy.url().should('contain', '/contacts')
    cy.clickCheckboxByRowNumber({ num: 1 })
    cy.clickCheckboxByRowNumber({ num: 2 })
    contacts.getSendItemButton().click()
    marketplace.getPostcardButton().should('be.visible')
    // test the filter sidebar - this might be the same component from market place
    sidePanel.getFilterHeader('Search').should('exist')
    sidePanel.getFilterHeader('Categories').should('exist')
    sidePanel.getFilterHeader('Price').should('exist')
    sidePanel.getFilterHeader('Ships To').should('exist')
    sidePanel.getFilterHeader('Currency').should('exist')
    sidePanel.selectFilter('Categories', 'Direct Mail')
    universal.waitForSpinner()
    sidePanel.getFilterHeader('Orientation').should('exist')
    sidePanel.selectFilter('Orientation', 'Portrait')
    cy.contains('Chipotle').should('not.exist')
    marketplace.getPostcardButton().scrollIntoView()
    marketplace.getPostcardButton().should('be.visible')
    cy.contains('a', 'clear').click({ multiple: true })
    cy.wait(400)
    cy.contains('Chipotle').should('exist')
    cy.contains('a', 'Postcard').scrollIntoView()
    cy.contains('a', 'Postcard').should('be.visible')
    cy.contains('a', 'Postcard').click({ force: true })
    //Create Group Order - tests customizing your Postal
    cy.contains('Configure your Item').should('exist')
    sendItem.getReviewButton().scrollIntoView()
    sendItem.getReviewButton().should('be.visible')
    sendItem.getRecipientNotifications().should('exist')
    orders.getGroupOrderNameInput().clear().fill('Create Group Order AutoTest')
    orders.getNowButton().should('not.exist')
    orders.getTomorrowMorningButton().should('not.exist')
    orders.getDatePickerInput().fill(dateFormatInput(tomorrow))
    orders.getGroupOrderNameInput().click({ force: true })
    cy.contains('Send As').should('not.exist')
    sendItem.getSpendAsCard().within(() => {
      cy.contains(`${user.userName}`).should('exist')
    })
    sendItem.getReviewButton().scrollIntoView()
    sendItem.getReviewButton().should('be.visible')
    sendItem.getReviewButton().click()
    //Create group Order - tests Review and Send
    cy.contains('Postcard').should('be.visible')
    sendItem.getReviewOption().contains('Postcard 4"x6"')
    sendItem.getReviewCampaignSection().within(() => {
      orders.getReviewCampaignName().contains('Create Group Order AutoTest')
      const sendon = RegExp(dateFormatTable(tomorrow) + '|' + dateFormatTable(inTwoDays))
      orders.getReviewSendOn().contains(sendon)
    })
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('have.length', 2)
    })
    sendItem.getReviewItemCosts().should('contain', '$0.44')
    sendItem.getReviewEstimatedVendorSalesTax().should('not.contain', '$0.00')
    sendItem.getReviewTransactionFee().should('not.exist')
    sendItem.getReviewShippingAndPostage().should('contain', '$0.58')
    sendItem.getReviewTotal().should('not.contain', '$0.00')
    sendItem.getAddFundsToConfirmSendButton().click()
    sendItem.getAddFundsModal().within(() => {
      billing.getChangePaymentMethodButton().click()
    })
    billing.getChangePaymentModal().within(() => {
      billing.getCardNumberInput().should('exist')
      billing.getExpirationDateInput().should('be.visible')
      billing.getSecurityCodeInput().should('exist')
      billing.getPostalCodeInput().should('not.exist')
      billing.getAddCardButton().should('be.visible')
      universal.getCancelButton().should('be.visible').click({ force: true })
    })
    sendItem.getAddFundsModal().within(() => {
      billing.getCurrentBalance().should('be.visible')
      billing.getPaymentMethodText().should('be.visible')
      billing.getVisaText().should('not.exist')
      billing.getCardNumberHint().should('be.visible')
      billing.getAddFundsButton().should('be.disabled')
      //Tests provide an amount less alert
      billing.getAddFundsInput().type('10101010')
      billing.getAddFundsButton().should('be.enabled').click({ force: true })
    })
    billing.getAmountLessAlert()
    billing.getAddFundsInput().clear().fill('60.00')
    billing.getAddFundsButton().click()
    billing.getConfirmFundsModal().within(() => {
      cy.contains(`$60.00 will be added to your ${company}'s Fund Management Billing Account.`)
      cy.contains(`A confirmation email will be sent to: ${email}`)
      cy.contains(
        'By clicking confirm, you acknowledge that you will be charged $60.00 to your card ending in 4242.'
      )
      universal.getCancelButton().click()
    })
    billing.getAddFundsButton().click()
    billing
      .getConfirmFundsModal()
      .should('be.visible')
      .within(() => {
        universal.getConfirmButton().should('be.visible').click({ force: true })
      })
    billing.getConfirmFundsModal().should('not.exist')
    cy.findAllByText('$60.00').should('exist')
    billing.getAccountUpdatedAlert()
    cy.contains('Save and Send').should('not.be.disabled').click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getConfirmSendModalText()
      universal.getCancelButton().click()
    })
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    sendItem.getConfirmSendModal().should('not.exist')
    cy.contains('Success! Your items are on their way!').should('exist')
    // cy.catchCallsRecurse({
    //   operationName: 'getBackgroundTaskById',
    //   key: 'successCount',
    //   value: 2,
    // })
    // cy.graphqlRequest(SearchCampaignsDocument, { filter: { name: { eq: 'Create Group Order AutoTest' } } }).then(
    //   (res) => {
    //     console.log(res)
    //     createdId = res.searchCampaigns?.[0].id ?? ''
    //   }
    // )
  })
  it(`tests the new Group Order page and edits a group order`, function () {
    //Review Group Order profiles - tests a new Group Order page
    orders.visitOrders()
    cy.url().should('contain', '/orders/all')

    orders.getGroupOrdersButton().click()
    universal.getNoItemsMessage().should('not.exist')
    // cy.queryForUpdateRecurse({
    //   request: SearchContactsV2Document,
    //   options: { filter: { campaigns: { eq: createdId } } },
    //   operationName: 'searchContactsV2',
    //   key: 'resultsSummary',
    //   value: 2,
    //   key2: 'totalRecords',
    // })
    orders.getSearchInput().should('be.visible').clear().fill('Create')
    universal.getRowsInATableBody().should('have.length.lt', 9)
    universal.getLinkByText('Create Group Order AutoTest').should('be.visible').click()
    cy.url().should('include', '/orders/group/')
    universal.getSpinner().should('not.exist')
    cy.contains('div', 'Orders').should('contain', '0')
    orders.getCostStats().should('contain', '0.00')
    cy.contains('Direct Send').should('exist')
    cy.contains('Postcard').should('exist')
    universal.getUITagByText('Scheduled').should('exist')
    cy.contains('div', '2 Recipients').should('exist')
    orders.getScheduledForInfo().within(() => {
      cy.findByText(RegExp(dateFormatTable(tomorrow) + '|' + dateFormatTable(inTwoDays))).should(
        'exist'
      )
    })
    //Review Campaign profiles - tests editing a new Campaign profile
    orders.getEditGroupOrderButton().click()
    orders
      .getUpdateGroupOrderSection()
      .should('be.visible')
      .within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        orders.getStartDateText().should('be.visible')
        orders.getEditStatusSelect().should('have.value', 'SCHEDULED')
        orders
          .getEditNameInput()
          .and('have.value', 'Create Group Order AutoTest')
          .clear({ force: true })
          .fill('Create Group Order AutoTest Up')
        orders.getUpdateGroupOrderButton().should('exist')
        universal.getCancelButton().click()
      })
    orders.getUpdateGroupOrderSection().should('not.exist')
    orders.getEditGroupOrderButton().click({ force: true })
    orders.getUpdateGroupOrderSection().within(() => {
      orders
        .getEditNameInput()
        .and('have.value', 'Create Group Order AutoTest')
        .clear({ force: true })
        .fill('Create Group Order AutoTest Up')
        .and('have.value', 'Create Group Order AutoTest Up')
      orders
        .getStartDatePickerInput()
        .clear()
        .type(`${dateFormatInput(twoDaysAgo)}`)
      orders.getEditNameInput().click()
    })
    orders.getUpdateGroupOrderSection().within(() => {
      orders
        .getStartDatePickerInput()
        .clear()
        .type(`${dateFormatInput(inTwoDays)}`)
      orders.getEditStatusSelect().focus().should('have.value', 'SCHEDULED')
      orders
        .getEditStatusSelect()
        .select('Canceled', { force: true })
        .should('have.value', 'CANCELLED')
      orders
        .getEditStatusSelect()
        .select('Pending', { force: true })
        .should('have.value', 'PENDING')
      orders.getUpdateGroupOrderButton().click()
    })
    orders.getUpdateGroupOrderSection().should('not.exist')
    cy.getAlert({ message: 'Group order data updated', close: 'close' })
    universal.getUITagByText('Pending').should('exist')
    orders.getScheduledForInfo().should('contain', dateFormatTable(inTwoDays))
    cy.findByRole('button', { name: 'back_to_directs' }).click()
    orders.getGroupDirectsButton().click()
    cy.contains('Create Group Order AutoTest Up').should('exist')
  })
  it(`Review Group Order profiles - tests a MOCKED completed Group Order profile`, function () {
    orders.visitOrders()
    cy.url().should('contain', '/orders/all')

    orders.getGroupOrdersButton().click()
    universal.getNoItemsMessage().should('not.exist')
    orders.getSearchInput().fill('sec')
    universal.getRowsInATableBody().should('have.length.lt', 9)
    //Monitors and Mocks the following requests
    cy.graphqlMockSet({ operationName: 'getCampaign', fixture: 'getCampaignMock.json' })
    cy.graphqlMockSet({
      operationName: 'searchCampaignStatusContacts',
      fixture: 'searchCampaignStatusContactsMock.json',
    })
    cy.graphqlMockSet({
      operationName: 'getApprovedPostal',
      fixture: 'getApprovedPostalMock.json',
    })
    cy.graphqlMockSet({
      operationName: 'searchContactsV2',
      fixture: 'searchContactsMock.json',
      count: 4,
    })
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsMockD.json',
      count: 4,
    })
    cy.graphqlMockStart()

    cy.contains('Second Campaign').click()
    //tests Contacts card
    cy.contains('div', 'Recipients')
      .should('be.visible')
      .within(() => {
        //Harcoded via mocks
        cy.contains('Sent 10/7/2020,').should('exist')
        const contacts = 'Postcard10/7/2020Erwin SchneiderDelivered'
        universal.getRowsInATableBody().should('have.length', 1).and('contain.text', contacts)
        universal.getPaginationPages('1').should('be.visible')
        universal.getAngleLeftButton().should('be.disabled')
        universal.getAngleRightButton().should('be.disabled')
      })
    universal.getUITagByText('Complete').should('exist')
    orders.getRemoveFromCampaignButton().should('not.exist')
    orders.getEditGroupOrderButton().should('not.exist')
    cy.contains('a', 'Re-send failed orders').should('exist')
    cy.contains('a', 'Re-send expired gifts').should('exist')
    cy.contains('a', 'Re-send successful orders').should('exist')
    cy.contains('a', 'Re-send Group Order').should('exist')
    cy.graphqlMockClear()
  })
  // it(`Re-send a Group Order`, function () {
  //   visitOrders()
  //   getGroupOrdersButton().click()
  //   universal.getNoItemsMessage().should('not.exist')
  //   universal.getRowByText('Error').find('a').eq(0).should('be.visible').click()
  //   cy.contains('a', 'Re-send Group Order').should('exist').click()
  //   universal
  //     .getItemUnavailableModal()
  //     .should('be.visible')
  //     .within(() => {
  //       universal.getItemUnavailableModalText().should('exist')
  //       universal.getCloseButtonByLabelText().click()
  //     })
  //   marketplace.chooseItemByName('Postcard')
  //   sendItem.getCustomizeDrawer().within(() => {
  //     campaigns
  //       .getCampaignNameInput()
  //       .should('be.visible')
  //       .then(($name: any) => {
  //         expect($name.attr('value')).to.contain('- COPY')
  //       })
  //     sendItem.getNextButton().should('be.visible').click()
  //   })
  //   sendItem.getSendItemButton().click()
  //   sendItem.getSendButton().click()
  //   sendItem.getReviewDrawer().should('not.exist')
  //   universal.getThingSpinner().should('not.exist')
  //   cy.catchCallsRecurse({
  //     operationName: 'searchCampaigns',
  //     key: '0',
  //     value: 'SCHEDULED',
  //     key2: 'status',
  //   })
  //   universal.getRowByText('- COPY').should('be.visible').and('contain', 'Scheduled').click()
  //   universal.waitForProgressBar()
  //   campaigns
  //     .getContactsCard()
  //     .should('be.visible')
  //     .within(() => {
  //       universal.getNoItemsMessage().should('not.exist')
  //       universal.getRowByText(dateFormatTable(today)).should('be.visible')
  //     })
  //   campaigns.getStatus().should('contain', 'SCHEDULED')
  //   campaigns.getScheduledDate().should('contain', dateFormatTable(tomorrow))
  // })
})
