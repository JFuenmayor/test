//This can be a long test to run but because of the beforeEach hook,
//each of these it blocks can be run independently
//so when troubleshooting use .only
import { faker } from '@faker-js/faker'
import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  //Campaigns,
  Contacts,
  EmailSettings,
  Reporting,
  SendItem,
  Universal,
} from '../../support/pageObjects'

describe('Postal Send Machine Testing', function () {
  let postalId: string
  let variantId: string
  const contacts = new Contacts()
  const sendItem = new SendItem()
  //const campaigns = new Campaigns()
  const emailSettings = new EmailSettings()
  const universal = new Universal()
  const reporting = new Reporting()

  beforeEach(() => {
    const user = userFactory()
    cy.signup(user)
    //creates contacts and postcard(direct mail) with only 1 variant and no user message
    cy.createApprovedPostcard().then((postcard) => {
      postalId = postcard.id
      variantId = postcard.variants?.[0].id ?? ''
    })
    //creates a giftcard(non-direct mail) with only 1 variants
    cy.createChipotlePostal()
    cy.createApprovedPostal({ name: 'Def Leppard T-Shirt' })
    cy.contactsSeed(5)
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 10000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    Cypress.on('uncaught:exception', () => {
      return false
    })
  })

  it(`electronic fulfillmentType should not see direct send option`, function () {
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear already in the Send a Personalized Email type
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send a Personalized Email').should('exist')
  })

  it(`physical fulfillmentType should see direct send option`, function () {
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Def Leppard T-Shirt').should('be.visible')
    cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
      }
    })
    //Configure your Item should appear already in the Send a Personalized Email type
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send a Personalized Email').should('exist')
  })

  it(`direct mail, single contact send - if the postal contains a user message, go to the customize screen`, function () {
    //Adds a user message via api
    cy.addApprovedPostalUserMessage({ postalId, variantId })
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Postcard').should('be.visible')
    cy.contains('a', 'Postcard').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('not.exist')
    sendItem.getDirectButton().should('exist')
    sendItem.getCustomizeHeader().should('exist')
    sendItem.getUserMessageHeader().should('exist')
    const userMessage = faker.lorem.paragraph(1)
    sendItem.getUserMessageInput().fill(userMessage)
    cy.contains('Send As').should('not.exist')
    cy.wait(800)
    sendItem.getSpendAsCard().within(() => {
      cy.contains('@postal.dev').should('exist')
    })
    universal.getSpinner().should('not.exist')
    //tests that the following are hidden
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
    sendItem.getGiftEmailMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
    sendItem.getReviewButton().click()
    //tests that the user message should appear on the review page
    cy.contains('Review').should('exist')
    sendItem
      .getReviewPhysicalMessageSection()
      .should('be.visible')
      .and('contain', userMessage)
      .and('contain', 'Message')
    cy.wait(800)
    sendItem.getSaveAndSendButton().should('be.visible').click({ force: true })
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    //tests the order success view
    cy.contains('Postcard')
    cy.contains('Postcard 4"x6"')
    cy.contains('Direct Order')
    reporting.visitOrderReports()
    universal.getLinkByText('Postcard').click()
    // the Physical message is not what I expected to be displayed here but
    // The message on direct mail is saved as a physical message, so this is the appropriate title on the fulfillment page.
    universal.getViewOrderModal().within(() => {
      cy.contains('div', 'Physical Message', { matchCase: false }).should('contain', userMessage)
    })
  })

  it(`direct mail, single contact send - if the postal contains more than 1 variant, go to the customize screen`, function () {
    //Adds new variant
    cy.addVariant({ postalName: 'Postcard', variantName: 'Satin, 100# stock' })
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Postcard').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getCustomizeHeader()
    sendItem.getPersonalizedEmailButton().should('not.exist')
    sendItem.getDirectButton().should('exist')
    //tests that the two variants exist
    //sendItem.getVariantByText('Satin, 100# stock').should('exist')
    //sendItem.getVariantByText('Satin, 80# stock').should('exist')
    cy.contains('Send As').should('not.exist')
    universal.getSpinner().should('not.exist')
    //tests that the following are hidden
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
    sendItem.getGiftEmailMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
    sendItem.getReviewButton().click()
    //tests that the user message should not appear on the review page
    cy.contains('Send As').should('not.exist')
    cy.contains('Review').should('exist')
    sendItem.getSaveAndSendButton().should('be.visible')
    sendItem.getReviewPhysicalMessageSection().should('not.exist')
    cy.wait(1200)
    sendItem.getSaveAndSendButton().click({ force: true })
    //tests that the user message - physical message? does not on the View Order
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    //tests the order success view
    cy.contains('Postcard')
    cy.contains('Postcard 4"x6"')
    cy.contains('Direct Order')
    reporting.visitOrderReports()
    universal.getLinkByText('Postcard').click()
    universal.getViewOrderModal().within(() => {
      cy.contains('div', 'Physical Message', { matchCase: false }).should('not.exist')
    })
  })

  it(`direct mail, multiple contact send - if the postal contains a user message, go to the customize screen`, function () {
    //Adds a user message via api
    cy.addApprovedPostalUserMessage({ postalId, variantId })
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCheckboxForAllContacts().scrollIntoView().click({ force: true })
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Postcard').should('be.visible')
    cy.contains('a', 'Postcard').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('not.exist')
    sendItem.getDirectButton().should('exist')
    sendItem.getCustomizeHeader()
    sendItem.getUserMessageHeader().should('exist')
    const userMessage = faker.lorem.paragraph(1)
    sendItem.getUserMessageInput().fill(userMessage)
    cy.contains('Send As').should('not.exist')
    //tests that scheduling is visible
    cy.contains('Scheduling').should('exist')
    cy.contains('This order will be queued up and sent').should('exist')
    //tests that the following are hidden
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
    sendItem.getGiftEmailMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
    //checks number of contacts
    sendItem.getReviewButton().click()
    sendItem.getSaveAndSendButton().should('be.visible')
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('exist').and('have.length.gt', 1)
    })
    sendItem.getReviewCampaignSection().should('exist')
    universal.getSpinner().should('not.exist')
    //tests that the following are hidden
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
    sendItem.getGiftEmailMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
    //tests that the user message should appear on the review page
    sendItem
      .getReviewPhysicalMessageSection()
      .should('contain', userMessage)
      .and('contain', 'Message')
    //can't test the view order modal on a campaign because the order have not been made yet just scheduled
  })

  it(`direct mail, multiple contact send - if the postal contains more than 1 variant, go to the customize screen`, function () {
    //Adds new variant
    cy.addVariant({ postalName: 'Postcard', variantName: 'Satin, 100# stock' })
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCheckboxForAllContacts().scrollIntoView().click({ force: true })
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Postcard').should('be.visible')
    cy.contains('a', 'Postcard').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('not.exist')
    sendItem.getDirectButton().should('exist')
    sendItem.getCustomizeHeader()
    //tests that the two variants are visible\
    sendItem.getVariantByText('Satin, 100# stock')
    sendItem.getVariantByText('Satin, 80# stock')
    universal.getSpinner().should('not.exist')
    //tests that scheduling is visible
    cy.contains('Scheduling').should('exist')
    cy.contains('This order will be queued up and sent').should('exist')
    //tests that the following are hidden
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
    sendItem.getGiftEmailMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
    //checks number of contacts
    sendItem.getReviewButton().click()
    sendItem.getSaveAndSendButton().should('be.visible')
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('exist').and('have.length.gt', 1)
    })
    sendItem.getReviewCampaignSection().should('exist')
    //can't test the view order modal on a campaign because the order have not been made yet just scheduled
  })

  // it.skip('direct mail, campaign - only 1 variant and no user message in postal, goes straight to customize screen', function () {
  //   campaigns.visitOrders()
  //   campaigns.getCreateCampaignButton().click()
  //   sendItem.getSelectContactsDrawer().within(() => {
  //     universal.waitForProgressBar()
  //     contacts.checkContactCheckboxByRowNumber(1)
  //     campaigns.getNextButton().click()
  //   })
  //   marketplace.chooseItemByName('Postcard')
  //   //Configure your Item should appear
  //   sendItem.getCustomizeHeader().should('exist')
  //   //tests that the following are hidden
  //   sendItem.getSubjectLineInput().should('not.exist')
  //   sendItem.getUserMessageHeader().should('not.exist')
  //   sendItem.getUserMessageInput().should('not.exist')
  //   sendItem.getGiftEmailMessageHeader().should('not.exist')
  //   sendItem.getGiftEmailMessageInput().should('not.exist')
  //   sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
  // })

  // it.skip('direct mail, campaign - if the postal contains two variants, go to the customize screen', function () {
  //   //Adds new variant
  //   cy.addVariant({ postalName: 'Postcard', variantName: 'Satin, 100# stock' })
  //   //goes to the campaigns screen
  //   campaigns.visitOrders()
  //   campaigns.getCreateCampaignButton().click()
  //   sendItem.getSelectContactsDrawer().within(() => {
  //     universal.waitForProgressBar()
  //     contacts.checkContactCheckboxByRowNumber(1)
  //     campaigns.getNextButton().click()
  //   })
  //   marketplace.chooseItemByName('Postcard')
  //   //Configure your Item should appear
  //   sendItem.getCustomizeHeader()
  //   //tests that the two variants are visible
  //   sendItem.getVariantByText('Satin, 100# stock').should('exist')
  //   sendItem.getVariantByText('Satin, 80# stock').should('exist')
  //   universal.getSpinner().should('not.exist')
  //   //tests that the following are hidden
  //   sendItem.getSubjectLineInput().should('not.exist')
  //   sendItem.getUserMessageHeader().should('not.exist')
  //   sendItem.getUserMessageInput().should('not.exist')
  //   sendItem.getGiftEmailMessageHeader().should('not.exist')
  //   sendItem.getGiftEmailMessageInput().should('not.exist')
  //   sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
  // })

  // it.skip('direct mail, campaign - if the postal contains a user message, go to the customize screen', function () {
  //   //Adds user message via api
  //   cy.addApprovedPostalUserMessage({ postalId, variantId })
  //   //goes to the campaigns screen
  //   campaigns.visitOrders()
  //   universal.waitForProgressBar()
  //   campaigns.getCreateCampaignButton().click()
  //   sendItem.getSelectContactsDrawer().within(() => {
  //     universal.waitForProgressBar()
  //     contacts.checkContactCheckboxByRowNumber(1)
  //     campaigns.getNextButton().click()
  //   })
  //   marketplace.chooseItemByName('Postcard')
  //   //Configure your Item should appear
  //   sendItem.getCustomizeHeader()
  //   sendItem.getUserMessageHeader()
  //   sendItem.getUserMessageInput().fill('Some Text')
  //   universal.getSpinner().should('not.exist')
  //   //tests that the following are hidden
  //   sendItem.getSubjectLineInput().should('not.exist')
  //   sendItem.getGiftEmailMessageHeader().should('not.exist')
  //   sendItem.getGiftEmailMessageInput().should('not.exist')
  //   sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
  // })

  // it.skip('non direct mail, campaign - goes to the customize screen', function () {
  //   campaigns.visitOrders()
  //   campaigns.getCreateCampaignButton().click()
  //   sendItem.getSelectContactsDrawer().within(() => {
  //     universal.waitForProgressBar()
  //     contacts.checkContactCheckboxByRowNumber(1)
  //     campaigns.getNextButton().click()
  //   })
  //   marketplace.chooseItemByName('Chipotle')
  //   //Configure your Item should appear
  //   sendItem.getCustomizeHeader().should('exist')
  //   sendItem.getIncludeGiftEmailMessageCheckbox().should('exist')
  //   sendItem.getSubjectLineInput().should('exist')
  //   sendItem.getGiftEmailMessageHeader().should('exist')
  //   sendItem.getGiftEmailMessageInput().should('exist')
  //   //tests that the following are hidden
  //   sendItem.getUserMessageHeader().should('not.exist')
  //   sendItem.getUserMessageInput().should('not.exist')
  // })

  it(`non direct mail, multi contact send - goes straight to customize screen`, function () {
    //Sends a postal to a two contacts via 'Send Item'
    cy.wait(200)
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCheckboxForAllContacts().scrollIntoView().click({ force: true })
    contacts.getSendItemButton().click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist')
    //tests that scheduling exists
    cy.contains('Scheduling').should('exist')
    cy.contains('This order will be queued up and sent').should('exist')
    sendItem.getSubjectLineInput().should('exist')
    sendItem.getGiftEmailMessageHeader().should('exist')
    const giftMessage = faker.lorem.paragraph(1)
    sendItem.getGiftEmailMessageInput().fill(giftMessage)
    universal.getSpinner().should('not.exist')
    //tests that the following are hidden
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
    //checks number of contacts
    sendItem.getReviewButton().click()
    sendItem.getSaveAndSendButton().should('be.visible')
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('exist').and('have.length.gt', 1)
    })
    sendItem.getReviewGiftMessageSection().should('contain', giftMessage).and('contain', 'Body')
  })

  it(`non direct mail, single contact send - account has DEFAULT_ON, go to the customize screen`, function () {
    //DEFAULT_ON is the default
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send a Personalized Email').should('exist')
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('exist')
    sendItem.getGiftEmailMessageHeader().should('exist')
    const giftMessage = faker.lorem.paragraph(1)
    sendItem.getGiftEmailMessageInput().fill(giftMessage)
    universal.getSpinner().should('not.exist')
    //tests that the following are hidden
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
    sendItem.getReviewButton().click()
    sendItem.getSaveAndSendButton().should('be.visible')
    sendItem.getReviewGiftMessageSection().should('contain', giftMessage).and('contain', 'Body')
    cy.wait(1000)
    sendItem.getSaveAndSendButton().click({ force: true })
    //tests that the user message - physical message? does not on the View Order
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    cy.contains('Chipotle')
    cy.contains('$5')
    cy.contains('Personalized Email')
    reporting.visitOrderReports()
    universal.getLinkByText('Chipotle').click()
    universal.getViewOrderModal().within(() => {
      universal.getViewOrderGiftEmailMessage().should('contain', giftMessage)
    })
  })

  it(`non direct mail, single contact send - account has DEFAULT_OFF, go to the customize screen`, function () {
    emailSettings.visitGiftEmails()
    cy.wait(3000)
    emailSettings.getGiftEmailTooltip().should('be.visible')
    emailSettings.getDefaultOffButton().click({ force: true })
    emailSettings.getSettingsUpdatedAlert()
    cy.wait(2000)
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear already in the Send Directly type
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist').and('be.visible')
    //weirdly flakly but can't reproduce when manually
    //toggles send git email
    // sendItem.getPersonalizedEmailButton().click({ force: true })
    // cy.wait(300)
    // sendItem.getSubjectLineInput().should('exist')
    // sendItem.getGiftEmailMessageHeader().should('exist')
    // sendItem.getGiftEmailMessageInput().should('exist')
    // sendItem.getDirectButton().click({ force: true })
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input')
      .should('not.exist')
      .should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    //tests that the following are hidden
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
  })

  it(`non direct mail, single contact send - account has ALWAYS, go to the customize screen`, function () {
    emailSettings.visitGiftEmails()
    cy.wait(2000)
    emailSettings.getAlwaysButton().should('be.visible').click({ force: true })
    emailSettings.getSettingsUpdatedAlert()
    cy.wait(2000)
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear already in the Send a Personalized Email type
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send a Personalized Email').should('exist')
    sendItem.getSubjectLineInput().should('exist')
    sendItem.getGiftEmailMessageHeader().should('exist')
    sendItem.getGiftEmailMessageInput().should('exist')
    //tests that the following are hidden
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
  })

  it(`non direct mail, single contact send - account has NEVER and only 1 variant, go to the configure screen`, function () {
    emailSettings.visitGiftEmails()
    cy.wait(2000)
    emailSettings.getNeverButton().should('be.visible').click({ force: true })
    emailSettings.getSettingsUpdatedAlert()
    cy.wait(2000)
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send Directly').should('exist')
  })

  it(`non direct mail, single contact send - postal has two variants, go to the customize screen`, function () {
    //Adds new variant
    cy.addVariant({ postalName: 'Chipotle', variantName: '$10' })
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('exist')
    sendItem.getDirectButton().should('not.exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send a Personalized Email').should('exist')
    sendItem.getSubjectLineInput().should('exist')
    sendItem.getGiftEmailMessageHeader().should('exist')
    sendItem.getGiftEmailMessageInput().should('exist')
    sendItem.getVariantByText('$5 Gift Card').should('exist')
    sendItem.getVariantByText('$10 Gift Card').should('exist')
    //tests that the following are hidden
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
  })

  it(`direct mail, single contact send - if only 1 variant and no user message in postal, go straight to configure screen`, function () {
    //Sends a postal to a single contact via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.checkContactCheckboxByRowNumber(1)
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Postcard').should('be.visible')
    cy.contains('a', 'Postcard').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Chipotle').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getPersonalizedEmailButton().should('not.exist')
    sendItem.getDirectButton().should('exist')
    sendItem.getCustomizeHeader().should('exist')
    cy.contains('Send Directly').should('exist')
  })

  it(`direct mail, multi contact send - only 1 variant and no user message in postal, goes straight to customize screen`, function () {
    //Sends a postal to all contacts via 'Send Item'
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCheckboxForAllContacts().click({ force: true })
    contacts.getSendItemButton().should('be.visible').click()
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Postcard').should('be.visible')
    cy.contains('a', 'Postcard').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    //Configure your Item should appear
    sendItem.getCustomizeHeader()
    sendItem.getPersonalizedEmailButton().should('not.exist')
    sendItem.getDirectButton().should('exist')
    //tests that the following are hidden
    cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
    sendItem.getGiftEmailMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
    sendItem.getUserMessageHeader().should('not.exist')
    cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
    //test number of contacts
    sendItem.getReviewButton().click()
    sendItem.getSaveAndSendButton().should('be.visible')
    sendItem.getReviewContacts().within(() => {
      universal.getAllUITags().should('exist').and('have.length.gt', 1)
    })
  })

  // it('direct mail, campaign - multiple contacts, goes to the customize screen', function () {
  //   campaigns.visitOrders()
  //   campaigns.getCreateCampaignButton().click()
  //   sendItem.getSelectContactsDrawer().within(() => {
  //     universal.waitForProgressBar()
  //     contacts.getCheckboxForAllContacts().scrollIntoView().click({ force: true })
  //     sendItem.clickNextButton()
  //   })
  //   marketplace.chooseItemByName('Postcard')
  //   //Configure your Item should appear
  //   sendItem.getCustomizeHeader()
  //   //tests that the following are hidden
  //   sendItem.getSubjectLineInput().should('not.exist')
  //   sendItem.getGiftEmailMessageHeader().should('not.exist')
  //   sendItem.getGiftEmailMessageInput().should('not.exist')
  //   sendItem.getIncludeGiftEmailMessageCheckbox().should('not.exist')
  //   sendItem.getUserMessageHeader().should('not.exist')
  //   cy.findByTestId('PostalCustomizeGiftEmail_textarea_physical_message').should('not.exist')
  //   //test number of contacts
  //   sendItem.getReviewButton().click()
  //     sendItem.getSaveAndSendButton().should('be.visible')
  //     sendItem.getReviewContacts().within(() => {
  //       universal.getAllUITags().should('exist').and('have.length.gt', 1)
  //     })
  //})
})
