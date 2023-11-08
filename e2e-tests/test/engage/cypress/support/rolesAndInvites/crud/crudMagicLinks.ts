import { Delivery, MagicLinks, SendItem, Universal } from '../../pageObjects'

//used PageObjects
const magicLinks = new MagicLinks()
const universal = new Universal()
const sendItem = new SendItem()
const delivery = new Delivery()

export interface acceptingMagicLinkProps {
  needAddress: boolean | any
  needPhone?: boolean | any
  firstName?: string
  lastName?: string
  email?: string
}
Cypress.Commands.add('acceptingMagicLink', (args: acceptingMagicLinkProps) => {
  const needAddress = args.needAddress
  const needPhone = args.needPhone
  const firstName = args.firstName ? args.firstName : 'Daniel'
  const lastName = args.lastName ? args.lastName : 'Davis'
  const email = args.email ? args.email : 'danielDavis@postal.dev'
  //must navigate to the delivery page before using
  delivery.getFirstNameInput().fill(firstName)
  delivery.getLastNameInput().fill(lastName)
  delivery.getEmailInput().fill(email)

  if (needAddress) {
    delivery.getShippingAddressButton().click({ force: true })
    delivery
      .getShippingDrawer()
      .should('be.visible')
      .within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        delivery.getStreetAddress1Input().type('3133 Upper Lopez Canyon Road')
        delivery.getCityInput().type('Arroyo Grande')
        // delivery.getStateInputRegEx('California')
        delivery.getPostalCodeInput().type('93420')
        cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
        if (needPhone) {
          delivery.getRequiredPhoneNumberInput().fill('7582345167')
        }
        universal.getSaveButton().click()
      })
    cy.contains('3133 Upper Lopez').should('be.visible')
    delivery.getUseVerifiedButton().click({ force: true })
    delivery.getUseVerifiedButton().should('not.exist')
  }
})
export interface crudMagicLinksProps {
  justCreate?: boolean
}

Cypress.Commands.add('crudMagicLinks', (args: crudMagicLinksProps) => {
  //Create
  if (args.justCreate) {
    createMagicLink()
  } else if (!args.justCreate || args.justCreate === false) {
    createMagicLink()
    //Edit
    cy.wait(600)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Order Limit')) {
        cy.wait(3100)
        cy.reload()
        cy.wait(600)
      }
    })
    magicLinks.getOrderLimitDetail().should('be.visible').and('contain', '1')
    magicLinks.getEditMagicLinkLink().click()
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.wait(300)
    sendItem
      .getLandingPageMessageInput()
      .should('contain', 'Wafer chupa chups danish gummi bears pudding.')
      .fill('Cake sweet roll cake jelly beans chocolate. Marshmallow bonbon muffin.')
    magicLinks
      .getMagicLinkInputByDisplayValue(`MagicLink ${new Date().toLocaleDateString()}`)
      .fill('Delete Me')
    sendItem.getReviewButton().click()
    magicLinks.getSelectADifferentItem().should('not.exist')
    universal.getSpinner().should('not.exist')
    magicLinks
      .getReviewLandingPageMessage()
      .scrollIntoView()
      .should('be.visible')
      .should('contain', 'Cake sweet roll cake jelly beans chocolate.')
    magicLinks
      .getReviewMagicLinkName()
      .should('contain', 'Delete Me')
      .and('contain', 'MagicLink Name')
    cy.wait(1300)
    magicLinks.getUpdateMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getUpdateMagicLinkButton().click()
    })
    magicLinks.getUpdateMagicLinkButton().should('not.have.attr', 'data-loading')
    cy.wait(300)
    //Delete
    cy.contains(`Delete Me`).should('exist')
    magicLinks.getDeleteMagicLinkLink().should('be.visible').click({ force: true })
    magicLinks.getDeleteMagicLinkModal().within(() => {
      cy.wait(300)
      universal.getDeleteButton().click({ force: true })
    })
    magicLinks.getDeleteMagicLinkModal().should('not.exist')
    universal.getAllGridCellsByText('Never').should('not.exist')
    cy.url().should('not.include', '/links/')
    magicLinks.getCreateANewLinkButton().should('exist')
  }
})

const createMagicLink = () => {
  magicLinks.getCreateANewLinkButton().click()
  sendItem.getSelectItemDrawer().within(() => {
    cy.contains('a', 'U/A/M approved').click()
  })
  universal.getCloseButtonByLabelText().should('be.visible')
  cy.wait(300)
  magicLinks.getMagicLinkNameInput().clear().fill(`MagicLink ${new Date().toLocaleDateString()}`)
  cy.wait(300)
  sendItem.getLandingPageMessageInput().fill('Wafer chupa chups danish gummi bears pudding.')
  sendItem.getReviewButton().click()
  cy.wait(1200)
  cy.window().then((win) => {
    cy.stub(win, 'prompt').returns(win.prompt)
  })
  magicLinks.getSaveMagicLinkButton().click()
  sendItem.getConfirmSendModal().within(() => {
    magicLinks.getSaveMagicLinkButton().click()
  })
  cy.contains('Success! Your MagicLink has been created.')
}
