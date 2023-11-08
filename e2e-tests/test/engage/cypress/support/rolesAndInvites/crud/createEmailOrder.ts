import { faker } from '@faker-js/faker'
import { Marketplace, Orders, SendItem, Universal } from '../../pageObjects'

export interface crudEmailOrderProps {
  itemName: string
}
const marketplace = new Marketplace()
const orders = new Orders()
const sendItem = new SendItem()
const universal = new Universal()
let itemName: string

Cypress.Commands.add('createEmailOrder', (args: crudEmailOrderProps) => {
  itemName = args.itemName
  marketplace.visitMyItems()
  cy.url().should('include', 'items/postals')
  universal.getSpinner().should('not.exist')
  cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
  universal.getUISpinner().should('not.exist')
  cy.wait(300)
  marketplace.getNewPostalByName(itemName).realHover()
  marketplace
    .getNewPostalByName(itemName)
    .parent('div')
    .within(() => {
      marketplace.getSendItemIconButton().click()
    })
  sendItem.getGiftEmailMessageHeader().should('exist')
  cy.contains(itemName).should('exist')
  cy.clickCheckboxByRowNumber({ num: 0 })
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
  orders.getEmailsCard().within(() => {
    cy.contains(itemName).should('exist')
  })
})
