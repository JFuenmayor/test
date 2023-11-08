import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Marketplace, Reporting, SendItem, Universal } from '../../support/pageObjects'
//skipped because tolosa is the item with a physical card included, since its not avaible for approval anymore these tests aren't possible
describe('Postals Testing: Physical Messages', function () {
  const marketplace = new Marketplace()
  const universal = new Universal()
  const sendItem = new SendItem()
  const reporting = new Reporting()
  const user = userFactory()

  before(() => {
    cy.signup(user)
    cy.log(user.userName)
    cy.log(user.password)
    cy.createApprovedPostal({ name: 'Tolosa Winery 1772 Chardonnay 2018' })
    seedsThreeContactsWithMailableAddresses()
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
    cy.messagesSeed()
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`sends an order with the 'Mirror the Gift Email Message' option selected`, function () {
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    cy.wait(800)
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Tolosa') && !$body.text().includes('Send Item')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('a', 'Tolosa Winery 1772').click()
    marketplace.getSendButton().click()
    //personalized Email
    sendItem.getPersonalizedEmailButton().click()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: 'Melanie' })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('Configure your Item').should('be.visible')
    cy.wait(300)
    sendItem.getSubjectLineInput().fill('This is a gift email message:')
    cy.wait(500)
    sendItem
      .getGiftEmailMessageInput()
      .fill(
        `Dragée jelly-o brownie marshmallow caramels. Jelly caramels sweet roll jujubes pie jelly beans. Brownie sesame snaps macaroon pudding./nGummi bears topping pudding tiramisu cake lemon drops icing bonbon. Pie chocolate bar cheesecake wafer. Soufflé wafer donut croissant macaroon chocolate bar toffee. Marshmallow sugar plum muffin gummies oat cake biscuit cotton candy danish jelly beans.`
      )
    cy.wait(1000)
    cy.contains('[data-testid="ui-card"]', 'Physical Card').within(() => {
      sendItem.getIncludePhysicalCardMessageCheckbox().should('be.visible')
      sendItem.getIncludePhysicalCardMessageCheckbox().should('not.be.checked')
      sendItem.getIncludePhysicalCardMessageCheckbox().click({ force: true })
      sendItem.getIncludePhysicalCardMessageCheckbox().should('be.checked')
      cy.wait(1000)
      //the below would test toggling back and forth but produces flake and seems maybe unnecessary in light of that
      // sendItem
      //   .getPhysicalMessageInput()
      //   .fill(
      //     `Dragée jelly-o brownie marshmallow caramels. Jelly caramels sweet roll jujubes pie jelly beans. Brownie sesame snaps macaroon pudding./nGummi bears topping pudding tiramisu cake lemon drops icing bonbon. Pie chocolate bar cheesecake wafer. Soufflé wafer donut croissant macaroon chocolate bar toffee. Marshmallow sugar plum muffin gummies oat cake biscuit cotton candy danish jelly beans.`
      //   )
      //sendItem.getMirrorGiftEmailMessageCheckbox().should('be.visible').and('be.checked')
      // sendItem
      //   .getPhysicalMessageInput()
      //   .should('be.visible')
      //   .and('contain', 'Dragée jelly-o brownie marshmallow caramels.')
      // sendItem.getMirrorGiftEmailMessageCheckbox().click({ force: true }).should('not.be.checked')
      // sendItem.getPhysicalMessageInput().clear()
      // sendItem.getMirrorGiftEmailMessageCheckbox().should('be.checked')
      // sendItem.getPhysicalMessageInput().fill(`This is a physical message: Cheesecake jujubes sweet.`)
      // cy.wait(200)
      // sendItem.getMirrorGiftEmailMessageCheckbox().check({ force: true })
      // cy.wait(300)
      // sendItem
      //   .getPhysicalMessageInput()
      //   .should('not.contain', 'This is a physical message:')
      //   .and('contain', 'Dragée jelly-o brownie marshmallow caramels.')
    })
    cy.wait(400)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Message on Physical Card')) {
        cy.wait(300)
        sendItem.getIncludePhysicalCardMessageCheckbox().should('not.be.checked')
        sendItem.getIncludePhysicalCardMessageCheckbox().click({ force: true })
        sendItem.getIncludePhysicalCardMessageCheckbox().should('be.checked')
        cy.wait(1000)
      }
    })
    sendItem.getReviewButton().click()
    universal.getSpinner().should('not.exist')
    sendItem.getSaveAndSendButton().should('not.have.attr', 'data-loading')
    sendItem
      .getReviewGiftEmailMessage()
      .should('contain', 'Dragée jelly-o brownie marshmallow caramels.')
    sendItem
      .getReviewPhysicalCard()
      .scrollIntoView()
      .should('contain', 'Dragée jelly-o brownie marshmallow caramels.')
    cy.contains('Shipping', { timeout: 75000 }).should('be.visible')
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getReviewGiftEmailMessage().should('not.exist')
  })
  it(`sends an order with both a unique Gift Email and Physical Card message`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.contains('a', 'Tolosa Winery 1772').click()
    marketplace.getSendButton().click()
    //personalized Email
    sendItem.getPersonalizedEmailButton().click()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: 'Jensen' })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('Configure your Item').should('be.visible')
    sendItem
      .getIncludePhysicalCardMessageCheckbox()
      .should('not.be.checked')
      .click({ force: true })
      .should('be.checked')
    sendItem.getMirrorGiftEmailMessageCheckbox().should('be.checked')
    cy.wait(300)
    sendItem
      .getPhysicalMessageInput()
      .scrollIntoView()
      .fill(
        `This is a physical message: Cheesecake jujubes sweet. Croissant tootsie roll wafer. Oat cake donut marshmallow dessert pastry gummies cheesecake candy cake. Donut candy muffin tootsie roll.`
      )
    sendItem.getMirrorGiftEmailMessageCheckbox().should('not.be.checked')
    cy.contains('button', 'Add a Gift Email Message to continue').should('exist')
    cy.wait(300)
    sendItem.getSubjectLineInput().fill('This is a gift email message:')
    cy.wait(300)
    sendItem
      .getGiftEmailMessageInput()
      .fill(
        `Dragée jelly-o brownie marshmallow caramels. Jelly caramels sweet roll jujubes pie jelly beans. Brownie sesame snaps macaroon pudding./nGummi bears topping pudding tiramisu cake lemon drops icing bonbon. Pie chocolate bar cheesecake wafer. Soufflé wafer donut croissant macaroon chocolate bar toffee. Marshmallow sugar plum muffin gummies oat cake biscuit cotton candy danish jelly beans.`
      )
    cy.wait(400)
    sendItem
      .getPhysicalMessageInput()
      .scrollIntoView()
      .fill(
        `This is a physical message: Cheesecake jujubes sweet. Croissant tootsie roll wafer. Oat cake donut marshmallow dessert pastry gummies cheesecake candy cake. Donut candy muffin tootsie roll.`
      )
    cy.wait(200)
    sendItem.getReviewButton().click()
    universal.getSpinner().should('not.exist')
    sendItem
      .getReviewGiftEmailMessage()
      .should('contain', 'Dragée jelly-o brownie marshmallow caramels.')
    sendItem
      .getReviewPhysicalCard()
      .should('contain', 'This is a physical message: Cheesecake jujubes sweet.')
    cy.contains('Shipping', { timeout: 75000 }).should('be.visible')
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getReviewGiftEmailMessage().should('not.exist')
  })
  it(`sends an order with just the physical card message`, function () {
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.contains('a', 'Tolosa Winery 1772').click()
    marketplace.getSendButton().click()
    //direct Email
    //cy.contains('Choose Method').should('be.visible')
    cy.findByRole('button', { name: 'Direct' }).should('be.visible').click()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: 'Lance' })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('Configure your Item').should('be.visible')
    sendItem
      .getIncludePhysicalCardMessageCheckbox()
      .should('not.be.checked')
      .click({ force: true })
      .should('be.checked')
    sendItem
      .getPhysicalMessageInput()
      .fill(
        `This is a physical message: Cheesecake jujubes sweet. Croissant tootsie roll wafer. Oat cake donut marshmallow dessert pastry gummies cheesecake candy cake. Donut candy muffin tootsie roll.`
      )
    cy.wait(300)
    sendItem.getReviewButton().click()
    cy.contains('Gift Email Message').should('not.exist')
    sendItem
      .getReviewPhysicalCard()
      .should('contain', 'This is a physical message: Cheesecake jujubes sweet.')
    cy.contains('Shipping', { timeout: 75000 }).should('be.visible')
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getReviewPhysicalCard().should('not.exist')
  })
  it(`tests that the info made it into the view order modals`, function () {
    reporting.visitOrderReports()
    //tests the order with just the physical card message
    cy.wait(200)
    universal.getRowByText('Lance').within(() => {
      reporting.getLinkByName('Tolosa Winery 1772 Chardonnay 20...').click()
    })
    universal.getViewOrderModal().within(() => {
      universal.getViewOrderGiftEmailMessage().should('not.exist')
      universal
        .getViewOrderPhysicalCard()
        .should('contain.text', 'This is a physical message: Cheesecake jujubes sweet.')
      universal.getCloseButton().click()
    })
    //tests the order with the 'Mirror the Gift Email Message' option selected
    universal.getRowByText('Melanie').within(() => {
      reporting.getLinkByName('Tolosa Winery 1772 Chardonnay 20...').click()
    })
    universal.getViewOrderModal().within(() => {
      universal.getNoItemsMessage
      universal
        .getViewOrderGiftEmailMessage()
        .should('contain', 'Dragée jelly-o brownie marshmallow caramels.')
      universal
        .getViewOrderPhysicalCard()
        .should('contain', 'Dragée jelly-o brownie marshmallow caramels.')
      universal.getCloseButton().click()
    })
    universal.getViewOrderModal().should('not.exist')
    //tests the order with both a unique Gift Email and Physical Card message
    universal.getRowByText('Jensen').within(() => {
      reporting.getLinkByName('Tolosa Winery 1772 Chardonnay 20...').click()
    })
    universal.getViewOrderModal().within(() => {
      universal
        .getViewOrderGiftEmailMessage()
        .should('contain.text', 'Dragée jelly-o brownie marshmallow caramels.')
      universal
        .getViewOrderPhysicalCard()
        .should('contain.text', 'This is a physical message: Cheesecake jujubes sweet.')
      universal.getCloseButton().click()
    })
    universal.getViewOrderModal().should('not.exist')
  })
})

function seedsThreeContactsWithMailableAddresses() {
  cy.createAContact({
    postalCode: '90211',
    city: 'Beverly Hills',
    address1: '384 South Hamel Drive',
    lastName: 'Kemmer',
    firstName: 'Melanie',
  })
  cy.createAContact({
    postalCode: '23704',
    state: 'Virginia',
    city: 'Portsmouth',
    address1: '3567 Elm Avenue',
    lastName: 'Mosciski',
    firstName: 'Jensen',
  })
  cy.createAContact({
    postalCode: '85022',
    state: 'Arizona',
    city: 'Phoenix',
    address1: '342 East Voltaire Avenue',
    lastName: 'Hermiston',
    firstName: 'Lance',
  })
}
