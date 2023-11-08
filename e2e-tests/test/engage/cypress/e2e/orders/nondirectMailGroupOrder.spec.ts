import { addDays, format } from 'date-fns'
import { AddFundsV2Document, BillingAccountsDocument, PaymentPartnerType } from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Contacts,
  CustomFormFields,
  Marketplace,
  Orders,
  SavedMessages,
  SendItem,
  Universal,
} from '../../support/pageObjects'

describe('Group Orders Testing: Non-Direct Mail', function () {
  const contacts = new Contacts()
  const customFormFields = new CustomFormFields()
  const sendItem = new SendItem()
  const marketplace = new Marketplace()
  const orders = new Orders()
  const savedMessages = new SavedMessages()
  const universal = new Universal()
  const user = userFactory()
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const dateFormatTable = (date: Date) => date.toLocaleDateString()
  const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')

  before(() => {
    cy.signup(user)
    cy.log(user.userName)
    cy.log(user.password)
    cy.createChipotlePostal()
    cy.contactsSeed(3)
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

  it(`tests sending non-direct mail for group orders`, function () {
    contacts.visitContacts()
    cy.url().should('contain', '/contacts')

    universal.waitForProgressBar()
    contacts.getCheckboxForAllContacts().scrollIntoView().click({ force: true })
    cy.findAllByRole('checkbox').should('be.checked')
    universal
      .getRowByNumber(0)
      .find('a')
      .eq(0)
      .then(($name) => {
        const name = $name.text()
        contacts.getSendItemButton().click()
        cy.contains('a', 'Chipotle').click({ force: true })
        cy.wait(300)
        cy.get('body').then(($body) => {
          if ($body.text().includes('Select this Item')) {
            cy.contains('a', 'Chipotle').click({ force: true })
          }
        })
        sendItem.getPersonalizedEmailButton().should('exist')
        sendItem.getGiftEmailMessageInput().should('exist')
        // sendItem.getDirectButton().click()
        // cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').should('not.exist')
        // cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').should('not.exist')
        sendItem.getPersonalizedEmailButton().click()
        cy.wait(300)
        sendItem.getSubjectLineInput().fill('Camp Gift Email Message Header')
        sendItem.getLandingPageHeaderInput().fill('Camp sent you something')
        sendItem.getLandingPageMessageInput().fill('Camp chip lP message')
        cy.wait(200)
        sendItem
          .getRecipientNotifications()
          .scrollIntoView()
          .within(() => {
            sendItem
              .getSendShippedEmailCheckbox()
              .should('be.checked')
              .uncheck({ force: true })
              .should('not.be.checked')
              .check({ force: true })
              .should('be.checked')
            sendItem
              .getSendDeliveredEmailCheckbox()
              .should('be.checked')
              .uncheck({ force: true })
              .should('not.be.checked')
              .check({ force: true })
              .should('be.checked')
          })
        sendItem.getLandingPageFormFieldsSection().within(() => {
          sendItem.getCustomizeFieldsButton().should('exist')
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
          //will add just a single choice field
          customFormFields.getAddCustomFieldSingleChoiceButton().click()
          customFormFields.getNewCustomFieldQuestion().type('Choose a P@stry')
          customFormFields
            .getSingleChoiceAddAnswers()
            .click({ force: true })
            .get('.UiSelectTypeaheadCreatable__input')
            .type(`Pam's Bear Claw!{enter}Kanelbull@r{enter}Kouign (Amann){enter}`)
          customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
          customFormFields.getSaveCustomFieldButton().click()
          customFormFields.getAddedTextFieldByLabel('Choose a P@stry*').should('exist')
          customFormFields.getApplyFormSettingsButton().click()
        })
        customFormFields.getCustomizeFormSettingsModal().should('not.exist')
        sendItem.getLandingPageFormFieldsSection().within(() => {
          sendItem.getCustomizeFieldsTagByName('Choose a P@stry').should('exist')
        })
        sendItem.getSendAsSelect().should('have.value', 'Self')
        sendItem.getSendAsSelect().select('Contact Owner')
        sendItem.getSpendAsCard().within(() => {
          cy.contains(`${user.userName}`).should('exist')
        })
        //tests toggling Send On buttons
        orders.getSendOnText().scrollIntoView().should('exist')
        cy.contains('This order will be queued up and sent in a few minutes').should('not.exist')
        orders.getNowButton().click({ force: true })
        orders.getDatePickerInput().invoke('val').should('include', dateFormatInput(today))
        cy.contains('This order will be queued up and sent in a few minutes').should('exist')
        orders.getTomorrowMorningButton().click({ force: true })
        cy.contains('This order will be queued up and sent in a few minutes').should('not.exist')
        orders.getNowButton().click({ force: true })
        //completes create and tests that it is scheduled for today
        orders.getGroupOrderNameInput().clear({ force: true }).fill('Chipotle')
        cy.contains('a', '$5').should('exist')
        sendItem
          .getGiftEmailMessageInput()
          .fill('Hi ${contact.firstName}, I just wanted to drop a quick old fashioned note.')
        sendItem.getReviewButton().click({ force: true })
        sendItem.getSaveAndSendButton().should('be.visible')
        sendItem.getReviewMeetingRequest().should('contain', 'No')
        sendItem.getReviewSubjectLineSection().should('contain', 'Camp Gift Email Message Header')
        const nameArray = name.split(' ')
        sendItem
          .getReviewGiftMessageSection()
          .contains(`Hi ${nameArray[0]}, I just wanted to drop a quick old fashioned note.`)
        sendItem.getReviewLandingPageTitle().should('contain', 'Camp sent you something')
        sendItem.getReviewLandingPageMessage().should('contain', 'Camp chip lP message')
        sendItem.getReviewSendAsSection().should('contain', 'Contact Owner')
        orders.getSendOnText().should('exist')
        cy.contains(new Date().toLocaleDateString('en-US')).scrollIntoView()
        cy.contains(new Date().toLocaleDateString('en-US')).should('be.visible')
        sendItem.getReviewContacts().within(() => {
          cy.get('li').should('have.length', 3)
        })
        cy.wait(800)
        sendItem.getSaveAndSendButton().click({ force: true })
        sendItem.getConfirmSendModal().within(() => {
          sendItem.getSendButton().click()
        })
        cy.contains('Success! Your email is on the way!').should('exist')
        //Note: editing the Landing Page and Gift Email headers is tested in the postals.spec via the View Order modal
        cy.url().should('include', '/orders/group/')
        universal.getSpinner().should('not.exist')
        cy.contains('div', 'Orders').should('contain', '0')
        orders.getCostStats().should('contain', '0.00')
        cy.contains('Personalized Email').should('exist')
        cy.contains('Chipotle').should('exist')
        universal.getUITagByText('Scheduled').should('exist')
        cy.wait(600)
        cy.get('body').then(($body) => {
          if (!$body.text().includes('3 Recipients')) {
            cy.wait(40700)
            cy.reload()
          }
        })
        cy.contains('div', '3 Recipients').should('exist')
        orders.getScheduledForInfo().within(() => {
          cy.findByText(RegExp(dateFormatTable(today) + '|' + dateFormatTable(tomorrow))).should(
            'exist'
          )
        })
        orders.getEditGroupOrderButton().should('exist')
      })
  })
  //bug-P2-4899
  //LD-flag variable-replacement??
  it(`tests using a Saved Message`, function () {
    contacts.visitContacts()
    cy.url().should('contain', '/contacts')
    universal.waitForProgressBar()
    contacts.getCheckboxForAllContacts().scrollIntoView().click({ force: true })
    cy.findAllByRole('checkbox').should('be.checked')
    universal
      .getRowByNumber(0)
      .find('a')
      .eq(0)
      .then(($name2) => {
        const name2 = $name2.text()
        contacts.getSendItemButton().click()
        cy.contains('a', 'Chipotle').click({ force: true })
        cy.wait(300)
        cy.get('body').then(($body) => {
          if ($body.text().includes('Select this Item')) {
            cy.contains('a', 'Chipotle').click({ force: true })
          }
        })
        cy.url().should('contain', '/contacts/send/')
        cy.wait(200)
        savedMessages.getSavedMessagesButton().click({ force: true })
        savedMessages
          .getSavedMessagesDrawer()
          .should('be.visible')
          .within(() => {
            savedMessages.getNoMessagesHelper().should('not.exist')
            savedMessages
              .getWelcomeSavedMessage()
              .scrollIntoView()
              .should('be.visible')
              .click({ force: true })
          })
        sendItem.getGiftEmailMessageInput().should('contain', 'so glad to be working with you')
        sendItem.getGiftEmailMessageHeader().should('exist')
        sendItem.getReviewButton().click({ force: true })
        const nameArray = name2.split(' ')
        cy.contains(`Hi ${nameArray[0]}, We're so glad to be working with you.`).should('exist')
      })
  })
})
