import { onlyOn } from '@cypress/skip-test'
import { faker } from '@faker-js/faker'
import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Contacts,
  Delivery,
  MagicLinks,
  Marketplace,
  Orders,
  SendItem,
  Universal,
} from '../../support/pageObjects'

describe('Tests the Orders page', function () {
  const contacts = new Contacts()
  const delivery = new Delivery()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const orders = new Orders()
  const sendItem = new SendItem()
  const universal = new Universal()
  const user = userFactory()

  const todaysDate = new Date().toLocaleDateString()

  before(() => {
    cy.signup(user)
    cy.log(user.userName)
    cy.log(user.password)
    cy.createAContact({
      country: 'United States',
      postalCode: '93401',
      state: 'California',
      city: 'San Luis Obispo',
      address1: '1021 Leff Street',
      phoneNumber: '780-432-6767',
      phoneType: 'WORK',
      emailAddress: 'ggibson@postal.com',
      title: 'User/Manager Role',
      lastName: 'Gibson',
      firstName: 'Gilly',
    })
    cy.contactsSeed(3)
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
    //cy.magiclinksSeed({ numberOfMagicLinks: 1, requiresApproval: false })
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests creating, updating and sending a draft of an order and clicking on the draft in the orders page`, function () {
    const draftName: string = faker.commerce.productName()
    marketplace.visitMyItems()
    cy.url().should('include', 'items/postals')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(500)
    marketplace.getNewPostalByName('Def Leppard T-Shirt').realHover()
    marketplace
      .getNewPostalByName('Def Leppard T-Shirt')
      .parent('div')
      .within(() => {
        marketplace.getSendItemIconButton().click()
      })
    cy.wait(300)
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains('Def Leppard T-Shirt').should('exist')
    orders.getSaveDraft().click()
    orders.getSaveDraftSection().within(() => {
      orders.getDraftNameInput().type(draftName)
      orders.getSaveDraftText().should('exist')
      orders.getGoToOrdersPageInput().should('be.checked')
      universal.getCancelButton().should('exist')
      orders.getSaveAndExitButton().click()
    })
    cy.url().should('include', 'orders')
    orders.getDraftsCard().within(() => {
      cy.contains('a', draftName).click()
    })
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains('Def Leppard T-Shirt').should('exist')
    cy.clickCheckbox({ name: 'Gilly Gibson' })
    orders.getUpdateDraft().click()
    orders.getUpdateDraftSection().within(() => {
      orders.getDraftNameInput().should('have.value', draftName)
      orders.getSaveDraftText().should('exist')
      orders.getGoToOrdersPageInput().should('be.checked')
      universal.getCancelButton().should('exist')
      orders.getUpdateAndExitButton().click()
    })
    cy.url().should('include', 'orders')
    orders.getDraftsCard().within(() => {
      cy.contains('a', draftName).click()
    })
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains('Def Leppard T-Shirt').should('exist')
    universal.getRowByText('Gilly Gibson').within(() => {
      cy.findByRole('checkbox').should('be.checked')
    })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('Def Leppard T-Shirt').should('exist')
    cy.contains('1 Recipient').should('exist')
    const giftHeader = faker.lorem.words(3)
    const giftMessage = faker.lorem.paragraph(1)
    const lpHeader = faker.lorem.words(3)
    const lpMessage = faker.lorem.paragraph(1)
    sendItem.getSubjectLineInput().fill(giftHeader)
    cy.wait(300)
    sendItem.getGiftEmailMessageInput().fill(giftMessage)
    sendItem.getLandingPageHeaderInput().fill(lpHeader)
    sendItem.getLandingPageMessageInput().fill(lpMessage)
    orders.getUpdateDraft().click()
    orders.getUpdateDraftSection().within(() => {
      orders.getDraftNameInput().should('have.value', draftName)
      orders.getSaveDraftText().should('exist')
      orders.getGoToOrdersPageInput().should('be.checked')
      universal.getCancelButton().should('exist')
      orders.getUpdateAndExitButton().click()
    })
    cy.url().should('include', 'orders')
    orders.getDraftsCard().within(() => {
      cy.contains('a', draftName).click()
    })
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains('Def Leppard T-Shirt').should('exist')
    cy.contains('1 Recipient').should('exist')
    sendItem.getReviewButton().click()
    sendItem.getReviewSubjectLine().should('contain', giftHeader)
    sendItem.getReviewGiftMessageSection().should('contain', giftMessage)
    sendItem.getReviewLandingPageTitle().should('contain', lpHeader)
    sendItem.getReviewLandingPageMessage().should('contain', lpMessage)
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    cy.contains('Success! Your email is on the way!')
    orders.visitOrdersOverview()
    orders.getDraftsCard().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    orders.getEmailsCard().within(() => {
      cy.contains('Def Leppard T-Shirt').should('exist')
    })
  })

  it(`tests that the newly created email order exists in the orders page and then clicks it`, function () {
    orders.visitOrdersOverview()
    orders.getEmailsCard().within(() => {
      cy.contains('Def Leppard T-Shirt').click()
    })
    cy.contains('[data-testid="ui-card"]', 'Personalized Email').within(() => {
      cy.contains('Def Leppard T-Shirt').should('exist')
      cy.contains('[data-testid="ui-tag"]', /Processing Error|Processing/).should('exist')
      cy.contains('li', 'Type').should('contain', `80's`)
      cy.contains('li', 'Selected Option').should('contain', 'XS')
      cy.contains('li', 'Quantity').should('contain', '1')
      cy.contains('li', 'Total').should('contain', '$')
      cy.contains('div', 'Recipient').within(() => {
        cy.contains('Gilly Gibson')
        cy.contains('1021 Leff Street')
        cy.contains('San Luis Obispo, California 93401')
      })
      cy.contains('div', 'History').within(() => {
        cy.contains(todaysDate).should('exist')
        universal.getUITagByText('Processing Error').should('exist')
        cy.contains('No Email Content').should('exist')
      })
    })
    universal.getRetryOrderButton().should('exist')
  })
  onlyOn(Cypress.env('testUrl'), () => {
    it(`tests that the magicLink order exists in the orders page and then clicks it`, function () {
      cy.visit('/')
      const acceptee = userFactory()
      cy.magiclinksSeed({ numberOfMagicLinks: 1, requiresApproval: false })
      magicLinks.visitMagicLinks()
      universal.stubClipboardPrompt()
      universal
        .getRowByText('MagicLink 0')
        .find('button')
        .then(($link: any) => {
          delivery.visit($link.attr('title'))
        })
      cy.acceptingMagicLink({
        needAddress: true,
        firstName: acceptee.firstName,
        lastName: acceptee.lastName,
        email: acceptee.userName,
      })
      delivery.getSubmitButton().click({ force: true })
      delivery.getSayThanksForm().should('exist')
      cy.findAllByRole('img').should('exist')
      orders.visitOrdersOverview()
      orders.getMagicLinksCard().within(() => {
        cy.contains('Def Leppard T-Shirt').click()
      })
      cy.contains('[data-testid="ui-card"]', 'MagicLink Redemption').within(() => {
        cy.contains('Def Leppard T-Shirt').should('exist')
        universal.getUITagByText('Processing').should('exist')
        cy.contains('li', 'Type').should('contain', `80's`)
        cy.contains('li', 'Selected Option').should('contain', 'XS')
        cy.contains('li', 'Quantity').should('contain', '1')
        cy.contains('li', 'Total').should('contain', '$')
        cy.contains('div', 'Recipient').should('not.exist')
        cy.contains('div', 'History').within(() => {
          cy.contains(todaysDate).should('exist')
          universal.getUITagByText('Processing').should('exist')
          cy.contains(`${acceptee.userName} has Accepted!`).should('exist')
        })
      })
      universal.getOrderAgainButton().should('exist')
      cy.contains('a', 'View MagicLink').should('exist')
    })
  })
  it(`tests that a direct order exists in the orders page and then clicks it`, function () {
    contacts.visitContacts()
    cy.clickCheckbox({ name: 'Gilly Gibson' })
    contacts.getSendItemButton().click()
    cy.wait(300)
    cy.contains('a', 'Def Leppard T-Shirt').click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
      }
    })
    sendItem.getDirectButton().click()
    sendItem.getReviewButton().click()
    sendItem.getSaveAndSendButton().click()
    sendItem.getSendButton().click()
    cy.contains('Success! Your item is on the way!').should('exist')
    orders.visitOrdersOverview()
    orders.getDirectsCard().within(() => {
      cy.contains('Def Leppard T-Shirt').click()
    })
    cy.contains('[data-testid="ui-card"]', 'Direct Send').within(() => {
      cy.contains('Def Leppard T-Shirt').should('exist')
      universal.getUITagByText('Processing').should('exist')
      cy.contains('li', 'Type').should('contain', `80's`)
      cy.contains('li', 'Selected Option').should('contain', 'XS')
      cy.contains('li', 'Quantity').should('contain', '1')
      cy.contains('li', 'Total').should('contain', '$')
      cy.contains('div', 'Recipient').within(() => {
        cy.contains('Gilly Gibson')
        cy.contains('1021 Leff Street')
        cy.contains('San Luis Obispo, California 93401')
      })
    })
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No items found')) {
        cy.contains('div', 'History').within(() => {
          cy.contains(todaysDate).should('exist')
          universal.getUITagByText('Processing').should('exist')
        })
      } else {
        cy.contains('div', 'History').within(() => {
          cy.contains('No items found').should('exist')
        })
      }
    })
    universal.getOrderAgainButton().should('exist')
  })
})
