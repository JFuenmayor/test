import { faker } from '@faker-js/faker'
import { Marketplace, Orders, SendItem, Universal } from '../../pageObjects'

export interface crudDraftOrderProps {
  itemName: string
  justCreate?: boolean
  draftName?: string
}
const marketplace = new Marketplace()
const orders = new Orders()
const sendItem = new SendItem()
const universal = new Universal()
let itemName: string
let draftName: string

Cypress.Commands.add('crudDraftOrder', (args: crudDraftOrderProps) => {
  itemName = args.itemName
  draftName = args.draftName ? args.draftName : faker.commerce.productName()
  if (args.justCreate) {
    createdraftOrder(itemName, draftName)
  } else {
    createdraftOrder(itemName, draftName)
    cy.url().should('include', 'orders')
    orders.getDraftsCard().within(() => {
      cy.contains('a', draftName).click()
    })
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains(itemName).should('exist')
    cy.clickCheckboxByRowNumber({ num: 0 })
    orders.getUpdateDraft().click()
    orders.getUpdateDraftSection().within(() => {
      orders.getDraftNameInput().should('have.value', draftName)
      orders.getSaveDraftText().should('exist')
      orders.getGoToOrdersPageInput().should('be.checked')
      universal.getCancelButton().should('exist')
      orders.getUpdateAndExitButton().click()
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.url().should('include', 'orders')
    orders.getDraftsCard().within(() => {
      cy.contains('a', draftName).click()
    })
    sendItem.getGiftEmailMessageHeader().should('exist')
    cy.contains(itemName).should('exist')
    universal.getRowByNumber(0).within(() => {
      cy.findByRole('checkbox').should('be.checked')
    })
    sendItem.getConfigureYourItemButton().click()
    cy.contains(itemName).should('exist')
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
    cy.contains(itemName).should('exist')
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
      cy.contains(itemName).should('exist')
    })
  }
})

const createdraftOrder = (itemName2: string, draftName2: string) => {
  marketplace.visitMyItems()
  cy.wait(400)
  cy.get('body').then(($body) => {
    if ($body.text().includes('unexpected error')) {
      cy.reload()
    }
    if ($body.text().includes('we could not load ')) {
      cy.reload()
    }
  })
  cy.url().should('include', 'items/postals')
  universal.getSpinner().should('not.exist')
  cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
  universal.getUISpinner().should('not.exist')
  cy.wait(300)
  marketplace.getNewPostalByName(itemName2).realHover()
  marketplace
    .getNewPostalByName(itemName2)
    .parent('div')
    .within(() => {
      marketplace.getSendItemIconButton().click()
    })
  sendItem.getGiftEmailMessageHeader().should('exist')
  cy.contains(itemName2).should('exist')
  orders.getSaveDraft().click()
  orders.getSaveDraftSection().within(() => {
    orders.getDraftNameInput().type(draftName2)
    orders.getSaveDraftText().should('exist')
    orders.getGoToOrdersPageInput().should('be.checked')
    universal.getCancelButton().should('exist')
    cy.wait(200)
    orders.getSaveAndExitButton().click({ force: true })
  })
  cy.wait(300)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Back to Home')) {
      cy.wait(300)
      cy.reload()
      cy.wait(300)
    }
  })
}
