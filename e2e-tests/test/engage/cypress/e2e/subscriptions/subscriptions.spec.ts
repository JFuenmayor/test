import addDays from 'date-fns/addDays'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  PaymentPartnerType,
  SearchContactsV2Document,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Contacts,
  CustomFormFields,
  Marketplace,
  SendItem,
  Subscriptions,
  Universal,
} from '../../support/pageObjects'

describe('Subscriptions Testing', function () {
  const contacts = new Contacts()
  const universal = new Universal()
  const marketplace = new Marketplace()
  const subscriptions = new Subscriptions()
  const sendItem = new SendItem()
  const customFormFields = new CustomFormFields()
  const user = userFactory()

  let contact1: string
  const todaysDate = new Date().toLocaleDateString('en-US')
  const tomorrowsDate = addDays(new Date(), 1).toLocaleDateString('en-US')

  before(() => {
    cy.signup(user)
    cy.createApprovedPostcard()
    cy.createChipotlePostal().then((res) => {
      cy.log(`Success: ${res.variants?.[0].variantName}`)
    })
    cy.contactsSeed(12)
    //puts $300 in the default account
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
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:filters:contacts')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'playbookAnalytics') {
        req.alias = 'playbookAnalytics'
      }
      if (req.body.operationName === 'searchContactsV2') {
        req.alias = 'searchContactsV2'
      }
    })
  })

  it(`tests creating a playbook`, function () {
    //tests empty playbooks page
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartedStat().should('be.visible').and('contain', '0')
    subscriptions.getCompletedStat().should('contain', '0')
    subscriptions.getCostPerTouchStat().should('contain', '$0.00')
    subscriptions.getTotalCostStat().should('contain', '$0.00')
    //creates a playbook
    subscriptions.getStartHereButton().trigger('click', { force: true })
    universal.getCloseButtonByLabelText().should('be.visible')
    subscriptions.getCreatePlaybookButton().should('be.disabled')
    //todo: try to get the tests to work with an entered name confirmed to work outside of tests
    // cy.wait(300)
    // subscriptions
    //   .getPlaybookNameInputByDisplayValue(`New Subscription - ${new Date().toLocaleDateString()}`)
    //   .clear()
    //   .type('First Subscription{enter}')
    // cy.wait(300)
    // Adds a step
    subscriptions.getAddAStepButton().click()
    universal.getUISpinner().should('not.exist')
    sendItem.getSelectItemDrawer().within(() => {
      marketplace.getAllItems().should('have.length', 2)
      cy.contains('a', 'Postcard').click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    cy.wait(500)
    cy.contains('Configure your Item').should('exist')
    cy.wait(100)
    universal.getBackToButton('subscription').click()
    cy.wait(100)
    subscriptions.getAddAStepButton().click()
    //selects Chipotle postal
    cy.wait(300)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Chipotle')) {
        cy.wait(300)
        cy.reload()
      }
    })
    sendItem.getSelectItemDrawer().within(() => {
      marketplace.getAllItems().should('have.length', 2)
      cy.contains('a', 'Chipotle').click()
    })
    subscriptions.getPlaybookStepDelayInput().should('have.value', '0')
    sendItem.getSubjectLineInput().fill('Gift Email Message Header')
    cy.wait(300)
    sendItem.getGiftEmailMessageInput().fill('Gift good. For you.')
    cy.wait(300)
    sendItem.getLandingPageHeaderInput().fill('I sent you something')
    sendItem.getLandingPageMessageInput().fill('chip lP message')
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
      customFormFields.getNewCustomFieldQuestion().type('Choice of sides:')
      customFormFields
        .getSingleChoiceAddAnswers()
        .click({ force: true })
        .get('.UiSelectTypeaheadCreatable__input')
        .type('Fries{enter}Salad{enter}Fruit Cup{enter}')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('Choice of sides:*').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('Choice of sides:').should('exist')
    })
    sendItem.getSendAsSelect().select('Contact Owner')
    sendItem.getSpendAsCard().within(() => {
      cy.findByRole('combobox').type(`${user.userName}`, { force: true })
    })
    sendItem.getReviewButton().click()
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    sendItem.getReviewSubjectLineSection().should('contain', 'Gift Email Message Header')
    sendItem
      .getReviewGiftMessageSection()
      .should('contain', 'Gift good. For you.')
      .and('contain', 'Body')
    sendItem.getReviewLandingPageTitle().should('contain', 'I sent you something')
    sendItem.getReviewLandingPageMessage().should('contain', 'chip lP message')
    sendItem.getReviewSendAsSection().should('contain', 'Contact Owner')
    cy.wait(1000)
    subscriptions.getSaveStepButton().trigger('click', { force: true })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        subscriptions.getSaveStepButton().trigger('click', { force: true })
      }
    })
    //tests that new step made it into the create playbook drawer with all info and buttons
    subscriptions
      .getPlaybookNameInputByDisplayValue(`New Subscription - ${new Date().toLocaleDateString()}`)
      .should('exist')
    cy.findAllByText('Chipotle').should('be.visible')
    subscriptions.getStepByNumber(1).within(() => {
      subscriptions.getEditStepIconButton().should('be.visible')
      subscriptions.getDeleteStepIconButton().should('exist')
      subscriptions.getDragStepIconButton().should('exist')
      cy.contains('Day 0').should('exist')
      cy.findAllByText('Chipotle').should('exist')
      subscriptions.getToggleStepIconButton().should('be.visible').click()
      subscriptions.getExpandedSendAs().should('contain', 'Contact Owner')
      subscriptions.getExpandedStepDaySent().should('contain', 'Day 0 from the start')
      subscriptions.getExpandedStepOption().should('contain', '$5')
    })
    //adds a second step (direct mail)
    subscriptions.getAddAStepButton().click()
    sendItem.getSelectItemDrawer().within(() => {
      cy.contains('a', 'Postcard').click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    subscriptions.getPlaybookStepDelayInput().clear().fill('1')
    //tests for the direct mail delay warning
    cy.contains('Please Note: Direct Mail items can take up to 7 days to deliver.').should('exist')
    sendItem.getReviewButton().click()
    subscriptions.getSaveStepButton().click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        subscriptions.getSaveStepButton().trigger('click', { force: true })
      }
    })
    //tests that the second step makes it into the create playbook drawer
    cy.findAllByText('Chipotle').should('be.visible')
    subscriptions.getStepByNumber(1).should('exist')
    subscriptions.getStepByNumber(2).within(() => {
      cy.findByText('Day 1')
      subscriptions.getToggleStepIconButton().should('be.visible').click()
      subscriptions.getExpandedStepOption().should('contain', 'Postcard 4"x6"')
      subscriptions.getEditStepIconButton().should('exist')
    })
    //creates a third step
    subscriptions.getAddAStepButton().click()
    sendItem.getSelectItemDrawer().within(() => {
      cy.contains('a', 'Chipotle').should('be.visible').click()
    })
    subscriptions
      .getPlaybookStepDelayInput()
      .scrollIntoView()
      .should('be.visible')
      .clear()
      .fill('9')
    cy.wait(300)
    sendItem.getGiftEmailMessageInput().fill('Gift good. For you.')
    cy.wait(300)
    sendItem.getLandingPageMessageInput().should('exist')
    cy.contains('Landing Page').should('exist')
    sendItem.getSendAsSelect().should('exist')
    sendItem.getReviewButton().click()
    subscriptions.getSaveStepButton().click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        subscriptions.getSaveStepButton().trigger('click', { force: true })
      }
    })
    //tests that the third step makes it into the create playbook drawer
    subscriptions.getStepByNumber(1).should('exist')
    subscriptions.getStepByNumber(2).should('be.visible')
    subscriptions.getStepByNumber(3).within(() => {
      cy.findByText('Day 10')
      //then deletes it
      subscriptions.getDeleteStepIconButton().should('be.visible').click()
    })
    subscriptions.getDeletePlaybookStepModal().within(() => {
      universal.getCancelButton()
      universal.getConfirmButton().click()
    })
    subscriptions.getStepByNumber(3).should('not.exist')
    subscriptions.getStepByNumber(1).should('be.visible')
    //Edits the second step
    subscriptions.getStepByNumber(2).within(() => {
      cy.findByText('Day 1')
      subscriptions.getEditStepIconButton().should('be.visible').click()
    })
    subscriptions.getPlaybookStepDelayInput().clear().type('2')
    sendItem.getReviewButton().click()
    subscriptions.getSaveStepButton().click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        subscriptions.getSaveStepButton().trigger('click', { force: true })
      }
    })
    // cy.getAlert({
    //   message: 'Step moved. Make sure to adjust the delays of your steps.',
    //   close: 'close',
    // })
    //Edits the first step, chipotle
    subscriptions.getStepByNumber(1).within(() => {
      subscriptions.getEditStepIconButton().should('be.visible').click()
    })
    cy.contains('Gift Email Message Header').should('exist')
    sendItem.getSubjectLineInput().clear().fill('Edited Gift Email Message Header')
    cy.contains('Gift good. For you.').should('exist')
    sendItem.getGiftEmailMessageInput().clear().fill('Edited Gift good. For you.')
    cy.contains('I sent you something').should('exist')
    sendItem.getLandingPageHeaderInput().clear().fill('Edited I sent you something')
    cy.contains('chip lP message').should('exist')
    sendItem
      .getLandingPageMessageInput()
      .should('contain', 'chip lP message')
      .clear()
      .wait(200)
      .fill('Edited chip lP message')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const fields = [
        'First Name',
        'Last Name',
        'Email Address',
        'Title',
        'Company',
        'Choice of sides:',
      ]
      fields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      customFormFields.getEditFieldButton('Choice of sides:').click({ force: true })
      customFormFields.getNewCustomFieldQuestion().clear().type('Edited: Choice of sides:')
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getApplyFormSettingsButton().click()
    })
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const editedFields1 = [
        'First Name',
        'Last Name',
        'Email Address',
        'Title',
        'Company',
        'Edited: Choice of sides:',
      ]
      editedFields1.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
    })
    sendItem
      .getSendAsSelect()
      .should('have.value', 'ContactOwner')
      .select('Myself', { force: true })
    sendItem.getReviewButton().click()

    subscriptions.getSaveStepButton().click()
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        subscriptions.getSaveStepButton().trigger('click', { force: true })
      }
    })
    subscriptions.getStepByNumber(1).within(() => {
      subscriptions.getEditStepIconButton().should('be.visible').click()
    })
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.contains('Landing Page').scrollIntoView()
    cy.contains('Edited I sent you something').should('exist')
    cy.contains('Edited chip lP message').should('exist')
    cy.contains('Email').scrollIntoView()
    cy.contains('Edited Gift Email Message Header').should('exist')
    cy.contains('Edited Gift good. For you.').should('exist')
    sendItem.getSendAsSelect().should('have.value', 'Self')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const editedFields = [
        'First Name',
        'Last Name',
        'Email Address',
        'Title',
        'Company',
        'Edited: Choice of sides:',
      ]
      editedFields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().should('exist')
    })
    universal.getBackToButton('subscription').click({ force: true })
    //added testids for the tooltips aren't showing up
    //so use name attr instead
    subscriptions.getStepByNumber(2).within(() => {
      //blue check tooltip exists and can be clicked
      //subscriptions.getAllWarningIcons().should('have.length', 1).trigger('click')
      cy.findByLabelText('Toggle Step').click()
      subscriptions
        .getExpandedStepDaySent()
        .should('be.visible')
        .and('contain', 'Day 2 from the start')
      subscriptions.getAllWarningIcons().should('not.exist')
    })
    cy.findByText('Day 1').should('not.exist')
    //drags day 2 above day 0
    subscriptions
      .getStepByNumber(2)
      .should('be.visible')
      .within(() => {
        cy.contains('Day 2').should('be.visible')
        subscriptions.getToggleStepIconButton().should('be.visible').click({ force: true })
        cy.wait(300)
      })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    subscriptions
      .getStepByNumber(2)
      .should('be.visible')
      .within(() => {
        cy.contains('Item').should('not.be.visible')
        subscriptions.getDragStepIconButton().parent('div').keyboardMoveBy(16, 'up')
      })
    cy.contains('Day 0', { timeout: 99000 }).should('not.exist')
    cy.findAllByText('Day 2', { timeout: 99000 }).should('have.length', 2)
    // tests tootips and warnings
    cy.findAllByText('Chipotle').should('be.visible')
    subscriptions
      .getStepByNumber(1)
      .scrollIntoView()
      .within(() => {
        //blue check tooltip exists
        subscriptions.getAllWarningIcons().should('have.length', 1)
      })
    subscriptions.getStepByNumber(2).within(() => {
      //red delay and blue check tooltips exist, clicks red tooltip
      subscriptions.getAllWarningIcons().should('have.length', 2).eq(0).trigger('click')
      subscriptions
        .getExpandedStepDaySent()
        .should('contain', 'Day 2 from the start')
        .and('be.visible')
      subscriptions.getAllWarningIcons().should('not.exist')
      //tests the warning inside the the step's expansion
      subscriptions.getAtLeast7DaysWarningText().should('exist')
      subscriptions.getExpandedStepDelayInput().clear().type('7{enter}')
    })
    //enter cause the step to re-render (detach from dom)
    subscriptions.getStepByNumber(2).within(() => {
      //tests that red delay tooltip and the warning inside the the step's expansion is gone
      subscriptions.getAllWarningIcons().should('have.length', 1)
      subscriptions.getToggleStepIconButton().should('be.visible').click()
      subscriptions.getAtLeast7DaysWarningText().should('not.exist')
    })
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'createPlaybookDefinition') {
        req.alias = 'createPlaybookDefinition'
      }
    })
    subscriptions.getCreatePlaybookButton().click()
    cy.url().should('contain', '/subscriptions/')
    cy.contains(`New Subscription - ${new Date().toLocaleDateString()}`).should('be.visible')
    cy.getAlert({ message: 'Subscription Created' })
  })
  it(`tests a subscription's profile: Steps Section `, function () {
    //tests that new step made it into the playbook profile with all info and buttons
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    cy.contains('[data-testid="ui-card"]', `New Subscription - ${new Date().toLocaleDateString()}`)
      .should('be.visible')
      .within(() => {
        cy.contains(`New Subscription - ${new Date().toLocaleDateString()}`)
          .eq(0)
          .trigger('mouseover', { force: true })
        subscriptions.getOpenPlaybookButton().click({ force: true })
      })
    cy.url().should('contain', '/subscriptions/')
    universal.waitForProgressBar()
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    subscriptions
      .getStepsCard()
      .should('be.visible')
      .within(() => {
        cy.contains('Day 2').should('be.visible')
        subscriptions.getEditStepsIconButton().should('exist')
        subscriptions.getStepByNumber(2).should('be.visible')
        cy.findAllByLabelText('Toggle Step').should('have.length', 2)
        subscriptions.getStepByNumber(1).within(() => {
          cy.contains('Day 2').should('exist')
          cy.findAllByText('Postcard').should('exist')
          subscriptions.getExpandedStepOption().should('not.be.visible')
          subscriptions.getToggleStepIconButton().trigger('click', { force: true })

          subscriptions
            .getExpandedStepOption()
            .should('contain', 'Postcard 4"x6"')
            .and('be.visible')
        })
        subscriptions.getStepByNumber(2).within(() => {
          cy.contains('Day 9').should('exist')
          cy.findAllByText('Chipotle').should('exist')
          subscriptions.getExpandedStepOption().should('not.be.visible')
          subscriptions.getToggleStepIconButton().trigger('click', { force: true })
          subscriptions.getExpandedStepOption().should('contain', '$5').and('be.visible')
        })
        //tests updating the playbook's title via steps section button
        subscriptions.getEditStepsIconButton().trigger('click', { force: true })
        cy.url().should('contain', '/edit')
      })
    subscriptions
      .getPlaybookNameInputByDisplayValue(`New Subscription - ${new Date().toLocaleDateString()}`)
      .clear()
      .fill('Updated First')
    subscriptions.getUpdatePlaybookButton().trigger('click', { force: true })
    cy.url().should('not.contain', '/edit')

    subscriptions.getPlaybookUpdatedAlert()
    cy.contains('Updated First').should('be.visible')
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()

    //tests updating the playbook's first step's delay via step's toggle button
    subscriptions.getEditStepsIconButton().click()
    cy.url().should('contain', '/edit')
    subscriptions.getStepByNumber(1).within(() => {
      subscriptions.getToggleStepIconButton().trigger('click', { force: true })
      cy.findByDisplayValue(2).as('input')
      cy.findByDisplayValue(2).clear()
      cy.get('[id="stepDelay-1"]').fill('0')
    })
    subscriptions.getUpdatePlaybookButton().click()
    cy.url().should('not.contain', '/edit')

    cy.contains('Day 2').should('not.exist')
    subscriptions.getPlaybookUpdatedAlert()
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()
    subscriptions.getEditStepsIconButton().click()
    cy.url().should('contain', '/edit')
    subscriptions
      .getStepByNumber(1)
      .scrollIntoView()
      .within(() => {
        cy.contains('Day 0', { timeout: 99000 }).should('exist')
      })
    //tests adding a step via steps section button
    subscriptions.getAddAStepButton().click()
    sendItem.getSelectItemDrawer().within(() => {
      cy.contains('a', 'Postcard').click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Postcard').click({ force: true })
      }
    })
    subscriptions.getPlaybookStepDelayInput().should('be.enabled').fill('1')
    sendItem.getReviewButton().click()
    sendItem.getReviewShippingAndPostage().should('be.visible')
    cy.contains('$').should('be.visible')
    cy.wait(300)
    subscriptions.getSaveStepButton().trigger('click', { force: true })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Funds')) {
        cy.contains('button', 'Cancel').click()
        subscriptions.getSaveStepButton().trigger('click', { force: true })
      }
    })
    cy.findByDisplayValue('Updated First', { timeout: 44000 }).should('exist')
    subscriptions.getUpdatePlaybookButton().click({ force: true })
    subscriptions.getPlaybookUpdatedAlert()
    cy.wait(300)
    subscriptions
      .getStepByNumber(3)
      .should('be.visible')
      .within(() => {
        cy.contains('Day 8').should('exist').and('be.visible')
      })
    //todo: try to get the following to work again
    //Tests the curlyarrow tooltips in the steps section
    subscriptions.getAllSortableStepsTooltips().should('have.length', '2')
    //.eq(0).realHover()
    // cy.contains('+7 Days').should('exist')
    // subscriptions.getAllSortableStepsTooltips().eq(1).realHover()
    // cy.findByText('+1 Day').should('exist')
  })

  it(`tests a playbook's profile: Contacts Section `, function () {
    contacts.visitContacts()
    universal.progressBarZero()
    //grabs name of first seeded contact
    cy.saveText({ rowNumber: 1, element: 'a' }).then((txt) => {
      contact1 = txt
    })
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    cy.contains('Subscriptions', { timeout: 60000 }).should('exist')
    universal.getUISpinner().should('not.exist')
    universal.getSpinner().should('not.exist')
    cy.contains('Subscriptions', { timeout: 60000 }).should('exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if ($body.text().includes('Chipotle')) {
        cy.findByText('Chipotle', { timeout: 60000 })
          .should('be.visible')
          .trigger('mouseover', { force: true })
      }
    })
    cy.contains('[data-testid="ui-card"]', 'Chipotle').within(() => {
      subscriptions.getOpenPlaybookButton().click({ force: true })
    })
    //adds a contact and tests assign playbook drawer
    subscriptions.getAddContactsButton().click({ force: true })
    subscriptions.getAssignPlaybookDrawer().within(() => {
      subscriptions.getAssignPlaybookButton().should('exist')
      cy.wait(500)
      contacts.getShowFiltersButton().click({ force: true })
    })
    cy.contains('section', 'Filter').within(() => {
      subscriptions.getAllAssignPlaybookContactFilters().should('have.length', 13)
      universal.getCloseButtonByLabelText().click({ force: true })
    })
    subscriptions.getAssignPlaybookDrawer().within(() => {
      subscriptions.getAllAssignPlaybookContactFilters().should('not.exist')
      universal.getTable().within(() => {
        universal.getAllGridCellsByText(contact1).should('exist')
        universal.getRowsInATableBody().should('have.length', 10)
      })
      contacts.getSearchContactsInput().fill(contact1)
      universal.waitForProgressBar()
      universal.getTable().within(() => {
        universal.getAllGridCellsByText(contact1).should('exist')
        universal.getRowsInATableBody().should('have.length.lte', 3)
      })

      contacts.getShowFiltersButton().click({ force: true })
    })
    cy.contains('section', 'Filter').within(() => {
      cy.contains('Clear Filters').click({ force: true })
    })
    subscriptions.getAssignPlaybookDrawer().within(() => {
      cy.findAllByTestId('ui-progress-bar').should('exist').should('have.css', 'opacity', '0')
      universal.getRowsInATableBody().should('have.length', '10')
      universal.getCheckboxForAllItems().click({ force: true })
      subscriptions.getAssignPlaybookButton().click({ force: true })
    })
    subscriptions.getAssignPlaybookDrawer().should('not.exist')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('0 of 3')) {
        cy.wait(35000)
        cy.reload()
        cy.wait(600)
      }
    })
    //universal.getThingSpinner().should('not.exist')
    universal.progressBarZero()
    subscriptions.getContactsCard().within(() => {
      //tests pagination
      universal.getAngleRightButton().click()
      universal.getRowsInATableBody().should('have.length', 2)
      universal.getAngleLeftButton().click()
      universal.getRowsInATableBody().should('have.length', 10)
      //tests searching for a contact via the contacts card's search bar
      cy.selectAutoCompleteContact(contact1)
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    subscriptions.getContactsCard().within(() => {
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowsInATableBody().should('have.length', 1)
      universal.getLinkByText(contact1).should('exist')
      cy.findByTestId('AutoCompleteContact').find('input').clear()
      universal.progressBarZero()
      universal.getRowsInATableBody().should('have.length', 10)
    })
    //tests a listed contact link
    cy.get('body').then(($body) => {
      if ($body.text().includes(contact1)) {
        universal.getLinkByText(contact1).click({ force: true })
      } else {
        subscriptions.getContactsCard().within(() => {
          universal.getAngleRightButton().click({ force: true })
        })
        universal.getLinkByText(contact1).click({ force: true })
      }
    })
    cy.url().should('contain', 'contacts/')
    universal.getSpinner().should('not.exist')
    cy.contains('@postal.dev').should('be.visible')
    cy.findAllByTestId('ui-card')
      .eq(0)
      .within(() => {
        cy.contains(contact1).should('exist')
      })
    contacts.getSubscriptionsTab().click({ force: true })
    universal.getAllGridCellsByText('Updated First').should('be.visible').click({ force: true })
    cy.url().should('contain', 'subscriptions/')
    cy.findAllByTestId('ui-progress-bar').should('exist').should('have.css', 'opacity', '0')
    //tests canceling an active contact
    cy.get('body').then(($body) => {
      if ($body.text().includes(contact1)) {
        subscriptions.getContactsCard().within(() => {
          universal.getRowByText(contact1).within(() => {
            universal.getActionsMenuButton().click()
          })
        })
      } else {
        subscriptions.getContactsCard().within(() => {
          universal.getAngleRightButton().click({ force: true })
          cy.wait(300)
          universal.getRowByText(contact1).within(() => {
            universal.getActionsMenuButton().click()
          })
        })
      }
    })
    subscriptions.getCancelPlaybookMenuItem().click({ force: true })
    subscriptions.getPlaybookInstanceUpdatedAlert()
    subscriptions.getContactsCard().within(() => {
      universal.getRowByText(contact1).within(() => {
        universal.getUITag().should('contain.text', 'CANCELLED')
      })
      //tests filtering by active contacts
      subscriptions.getStatusFilter().select('Active', { force: true })
      universal.getLinkByText(contact1).should('not.exist')
      universal.getRowsInATableBody().should('have.length', 10)
      //tests filtering by cancelled contacts
      subscriptions.getStatusFilter().select('Cancelled', { force: true })
      universal.getLinkByText(contact1).should('exist')
      universal.getRowsInATableBody().should('have.length', 1)
      //tests reactivating the cancelled contact
      subscriptions.getStatusFilter().select('Select a status', { force: true })
    })
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes(contact1)) {
        subscriptions.getContactsCard().within(() => {
          universal.getRowByText(contact1).within(() => {
            universal.getActionsMenuButton().click()
          })
        })
      } else {
        subscriptions.getContactsCard().within(() => {
          universal.getAngleRightButton().click({ force: true })
          universal.getRowByText(contact1).within(() => {
            universal.getActionsMenuButton().click()
          })
        })
      }
    })
    subscriptions.getActivatePlaybookMenuItem().trigger('click', { force: true })
    subscriptions.getPlaybookInstanceUpdatedAlert()
    cy.findAllByTestId('ui-progress-bar').should('exist').and('have.css', 'opacity', '0')
    subscriptions.getContactsCard().within(() => {
      universal.getRowByText(contact1).within(() => {
        universal.getUITag().should('contain.text', 'ACTIVE')
      })
      //tests canceling all the contacts
      subscriptions.getCancelAllButton().click()
    })
    subscriptions.getCancelAllInstancesModal().within(() => {
      universal.getCancelButton()
      universal.getConfirmButton().click()
    })
    cy.getAlert({ message: 'All instances will be cancelled in the background.', close: 'close' })
    subscriptions.getContactsCard().within(() => {
      cy.findAllByText('CANCELLED').should('have.length.gt', 1)
    })
    //then activates just one in order to later test the active contact profile's playbooks card
    subscriptions.getContactsCard().within(() => {
      universal.getRowByText(contact1).within(() => {
        universal.getActionsMenuButton().click()
      })
    })
    subscriptions.getActivatePlaybookMenuItem().trigger('click', { force: true })
    subscriptions.getPlaybookInstanceUpdatedAlert()
    //tests the remaining status filters using mocked api calls
    subscriptions.visitSubscriptions()
    cy.graphqlMockSet({
      operationName: 'searchPlaybookInstances',
      fixture: 'searchPlaybookInstancesMock.json',
      count: 2,
    })
    cy.graphqlMockStart()
    subscriptions.getOpenPlaybookButton().click()
    subscriptions.getStatsCard().should('be.visible')
    cy.findAllByText('CANCELLED').should('have.length', 1)
    cy.findAllByText('Active').should('have.length', 1)
    cy.findAllByText('QUEUED').should('have.length', 1)
    cy.findAllByText('COMPLETED').should('have.length', 1)
    cy.findAllByText('PROCESSING').should('have.length', 1)
    cy.findAllByText('FAILED').should('have.length', 1)
    cy.graphqlMockSet({
      operationName: 'searchPlaybookInstances',
      count: 2,
      fixture: 'searchPlaybookInstancesQUEUEDMock.json',
    })
    subscriptions.getContactsCard().within(() => {
      subscriptions.getStatusFilter().select('QUEUED', { force: true })
      universal.waitForProgressBar()
      universal.getUITag().should('contain.text', 'QUEUED')
      universal.getRowsInATableBody().should('have.length', 1)
    })
    cy.graphqlMockSet({
      operationName: 'searchPlaybookInstances',
      count: 1,
      fixture: 'searchPlaybookInstancesPROCESSINGMock.json',
    })
    subscriptions.getContactsCard().within(() => {
      subscriptions.getStatusFilter().select('PROCESSING', { force: true })
      universal.waitForProgressBar()
      universal.getUITag().should('contain.text', 'PROCESSING')
      universal.getRowsInATableBody().should('have.length', 1)
    })
    cy.graphqlMockSet({
      operationName: 'searchPlaybookInstances',
      count: 1,
      fixture: 'searchPlaybookInstancesCOMPLETEDMock.json',
    })
    subscriptions.getContactsCard().within(() => {
      subscriptions.getStatusFilter().select('COMPLETED', { force: true })
      universal.waitForProgressBar()
      universal.getUITag().should('contain.text', 'COMPLETED')
      universal.getRowsInATableBody().should('have.length', 1)
    })
    cy.graphqlMockSet({
      operationName: 'searchPlaybookInstances',
      count: 1,
      fixture: 'searchPlaybookInstancesFAILEDMock.json',
    })
    subscriptions.getContactsCard().within(() => {
      subscriptions.getStatusFilter().select('FAILED', { force: true })
      universal.waitForProgressBar()
      universal.getUITag().should('contain.text', 'FAILED')
      universal.getRowsInATableBody().should('have.length', 1)
    })
    cy.graphqlMockClear()
  })
  it(`tests a playbook's profile: Edit Button and Actions Menu`, function () {
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    cy.contains('[data-testid="ui-card"]', `Updated First`)
      .should('be.visible')
      .within(() => {
        cy.contains(`Updated First`).eq(0).trigger('mouseover', { force: true })
        subscriptions.getOpenPlaybookButton().click({ force: true })
      })
    universal.waitForProgressBar()
    //tests edit playbook menu item opens edit playbook drawer
    subscriptions.getEditPlaybookButton().trigger('click', { force: true })
    universal.getCancelButton().click()
    //tests Clone Playbook menu item copies the playbook
    marketplace.getEllipsesButton().click()
    subscriptions.getClonePlaybookMenuItem().trigger('click', { force: true })
    subscriptions.getClonePlaybookModal().within(() => {
      universal.getCancelButton()
      subscriptions.getCloneButton().click()
    })
    cy.getAlert({ message: 'Subscription cloned', close: 'close' })
    cy.contains('Copy of Updated First').should('be.visible')
    //tests that contacts were not copied
    subscriptions.getContactsCard().within(() => {
      cy.findAllByTestId('ui-progress-bar').should('exist').and('have.css', 'opacity', '0')
      universal.getNoItemsMessage().should('exist')
      //test that the Add Contacts button does not exist since the clone is orginally disabled
      subscriptions.getAddContactsButton().should('not.exist')
    })
    //tests that the correct number of steps were copied
    subscriptions.getStepsCard().within(() => {
      subscriptions.getStepByNumber(3).should('exist')
      subscriptions.getStepByNumber(4).should('not.exist')
    })
    //changes cloned name for better testing of the playbooks card on the contact's profile
    subscriptions.getEditPlaybookButton().click()
    subscriptions.getPlaybookNameInputByDisplayValue('Copy of Updated First').clear()
    cy.get('[id="name"]').fill('Cloned')
    subscriptions.getUpdatePlaybookButton().click()
    subscriptions.getPlaybookUpdatedAlert()
  })
  it(`tests enabling, disabling, and then deleting the cloned playbook`, function () {
    subscriptions.visitSubscriptions()
    cy.contains('[data-testid="ui-card"]', 'Cloned')
      .should('be.visible')
      .within(() => {
        cy.contains('Cloned').eq(0).trigger('mouseover', { force: true })
        subscriptions.getOpenPlaybookButton().click({ force: true })
      })
    subscriptions.getStepByNumber(3).should('be.visible')
    subscriptions
      .getPlaybookStatusTooltip()
      .scrollIntoView()
      .realHover({ position: 'center', scrollBehavior: 'bottom' })
    subscriptions.getPlaybookStatusTooltipText().should('be.visible')
    //reloads to get rid of tooltip
    cy.reload()
    universal.waitForProgressBar()
    subscriptions
      .getPlaybookStatusCard()
      .as('statusCard')
      .within(() => {
        //tests that the playbook clone is originally disabled
        subscriptions.getEnablePlaybookButton().should('not.be.checked').check({ force: true })
        //tests that the buttons re-render differently
        subscriptions.getEnablePlaybookButton().should('be.checked')
      })
    //adds a contact to the clone in order to test sum of started stats on p page
    subscriptions.getAddContactsButton().should('exist').click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    subscriptions.getAssignPlaybookDrawer().within(() => {
      universal.getCheckboxForAllItems().click({ force: true })
      subscriptions.getAssignPlaybookButton().click({ force: true })
    })
    cy.get('@statusCard').within(() => {
      subscriptions.getEnablePlaybookButton().click({ force: true })
    })
    subscriptions.getDisablePlaybookModal().within(() => {
      universal.getCancelButton()
      subscriptions.getDisablePlaybookModalButton().click()
    })
    cy.get('@statusCard').within(() => {
      //tests that the playbook clone is disabled
      subscriptions.getEnablePlaybookButton().should('not.be.checked')
    })
    cy.url().then((url) => {
      //tests that both the clone and original playbook are displayed on the /playbooks page
      universal.getBackToButton('subscriptions').click()
      subscriptions.getPlaybookByName('Updated First').should('exist')
      subscriptions.getPlaybookByName('Cloned').should('exist')
      //deletes the cloned playbook
      cy.visit(url)
      universal.waitForProgressBar()
    })
    cy.contains('Cloned').should('exist')
    marketplace.getEllipsesButton().click()
    subscriptions.getDeletePlaybookMenuItem().trigger('click', { force: true })
    subscriptions.getDeletePlaybookModal().within(() => {
      universal.getCancelButton()
      universal.getDeleteButton().trigger('click', { force: true })
    })
    subscriptions.getDeletePlaybookModal().should('not.exist')
    subscriptions.visitSubscriptions()
    subscriptions.getPlaybookByName('Updated First').should('exist')
    subscriptions.getPlaybookByName('Cloned').should('not.exist')
  })
  it(`tests /subscriptions homepage and an active contact's profile`, function () {
    // cy.queryForUpdateRecurse({
    //   request: PlaybookAnalyticsDocument,
    //   options: { granularity: Granularity.All },
    //   operationName: 'playbookAnalytics',
    //   key: '0',
    //   value: 24,
    //   key2: 'started',
    // })
    cy.wait(13000)
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartHereButton().click()
    universal.getCancelButton().click()
    //tests that the started stat should have the sum of contacts from both playbooks (existing 12 + deleted 12 = 24)
    subscriptions.getStartedStat().contains(/24/g)
    subscriptions.getCompletedStat().should('contain', '0')
    subscriptions.getCostPerTouchStat().should('contain', '$0.00')
    subscriptions.getTotalCostStat().should('contain', '$0.00')
    //tests the playbook card info
    subscriptions.getPlaybookByName('Updated First').within(() => {
      cy.contains('Postcard').should('exist')
      cy.contains('Chipotle').should('exist')
      subscriptions.getItemsInfo().should('contain', '3')
      subscriptions.getCostInfo().should('not.contain', '$0')
      subscriptions.getDurationInfo().should('contain', '7')
    })
    //mocks and tests the rendering of the remaining stats
    cy.graphqlMockSet({
      operationName: 'playbookAnalytics',
      fixture: 'playbookAnalyticsMock.json',
      count: 2,
    })
    cy.graphqlMockStart()
    subscriptions.visitSubscriptions()
    universal.getSpinner().should('not.exist')
    subscriptions.getStartedStat().contains(/24|17/g)
    subscriptions.getCompletedStat().should('contain', '2')
    subscriptions.getCostPerTouchStat().should('contain', '$0.50')
    subscriptions.getTotalCostStat().should('contain', '$0.99')
    cy.graphqlMockClear()
    //tests the playbooks card on an active contact's profile
    cy.findByText('Chipotle').should('be.visible').trigger('mouseover', { force: true })
    subscriptions.getOpenPlaybookButton().click({ force: true })
    cy.findAllByText('Chipotle').should('be.visible')
    universal.getRowByText('ACTIVE').within(() => {
      cy.findByRole('link').click()
    })
    cy.url().should('contain', 'contacts/')
    universal.waitForProgressBar()
    contacts.getSubscriptionsTab().click({ force: true })
    //tests that it has the correct info
    cy.wait(300)
    universal.getRowByText('Updated First').within(() => {
      cy.findByText('0 of 3').should('exist').scrollIntoView()
      cy.findByText('7').should('exist')
      //tomorrows date only included as flake fix for the occasional mismatch in UTC for remote runs
      cy.findByText(RegExp(todaysDate + '|' + tomorrowsDate)).should('exist')
      cy.findByText('ACTIVE').should('exist')
      universal.getActionsMenuButton().should('exist')
    })
    universal.getRowByText('Cloned').within(() => {
      cy.findByText('0 of 3').scrollIntoView()
      cy.findByText('7')
      cy.findByText(RegExp(todaysDate + '|' + tomorrowsDate))
      cy.findByText('ACTIVE').should('exist')
      //tests cancelling from a row
      universal.getActionsMenuButton().click()
    })
    subscriptions.getCancelPlaybookMenuItem().click()
    universal.getRowByText('Cloned').within(() => {
      cy.findByText('ACTIVE').should('not.exist')
      cy.findByText('CANCELLED').should('exist')
    })
    cy.url().then((url) => {
      //tests the view all link
      contacts.getPlaybooksSection().within(() => {
        universal.getLinkByText('View All').click()
      })
      cy.url().should('contain', '/subscriptions')
      subscriptions.getPlaybookByName('Updated First').should('exist')
      //tests navigating to the deleted playbook via tr click
      cy.visit(url)
      universal.getSpinner().should('not.exist')
      contacts.getSubscriptionsTab().click({ force: true })
      universal.getAllGridCellsByText('Cloned').click({ force: true })
      cy.url().should('contain', 'subscriptions/')
      cy.findByText('This subscription was deleted').should('exist')
      //tests navigating to the active playbook via tr click
      cy.visit(url)
      universal.getSpinner().should('not.exist')
      contacts.getSubscriptionsTab().click({ force: true })
      universal.getAllGridCellsByText('Updated First').click({ force: true })
      cy.url().should('contain', 'subscriptions/')
      cy.contains('Updated First').should('exist')
    })
    //tests add playbook menutitem in a new contact's profile
    cy.createAContact({
      lastName: 'Handy',
      firstName: 'Horrace',
    })
      .its('type')
      .should('eq', 'CONTACT')
    cy.queryForUpdateRecurse({
      request: SearchContactsV2Document,
      operationName: 'searchContactsV2',
      key: 'resultsSummary',
      value: 13,
      key2: 'totalRecords',
    })
    contacts.visitContacts()
    universal.waitForProgressBar()
    universal.getLinkByText('Horrace Handy').click({ force: true })
    subscriptions.getAddPlaybookMenuItem().trigger('click', { force: true })
    subscriptions
      .getAddContactsToPlaybookDrawer()
      .should('be.visible')
      .within(() => {
        subscriptions.getAddToPlaybookButton().click()
      })
    cy.getAlert({ message: 'Please select a subscription', close: 'close' })
    subscriptions.getAddContactsToPlaybookDrawer().within(() => {
      subscriptions.getPlaybookByName('Updated First').trigger('mouseover', { force: true })
      subscriptions.getSelectPlaybookButton().should('be.visible').click({ force: true })
      subscriptions.getAddToPlaybookButton().click({ force: true })
    })
    subscriptions.getAddContactsToPlaybookDrawer().should('not.exist')
    cy.getAlert({ message: 'Contact was added to subscription', close: 'close' })
  })
  it(`testing rendering Orders info in a subscription's profile via mocks `, function () {
    //replace mocks with the new api call once that is done for better confidence.
    subscriptions.visitSubscriptions()
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsForPlaybooksMock.json',
      count: 3,
    })
    cy.graphqlMockSet({
      operationName: 'getApprovedPostal',
      response: [],
      count: 3,
    })
    cy.graphqlMockStart()
    subscriptions.getPlaybookByName('Updated First').trigger('mouseover', { force: true })
    subscriptions.getOpenPlaybookButton().click({ force: true })
    universal.waitForProgressBar()
    subscriptions
      .getOrdersCard()
      .as('ordersCard')
      .within(() => {
        cy.findAllByText('12/8/2020').should('have.length', 1)
        cy.findAllByText('Postcard').should('have.length', 4)
        cy.findAllByText('$0.53').should('have.length', 4)
        cy.findAllByText('Processing Error').should('have.length', 3)
        cy.findAllByText('Processing').should('have.length', 1).click()
        universal.getLinkByText('Wilby Willows').should('exist')
        //view order modals no longer work wit the mocks
        //cy.findAllByText('Processing').should('have.length', 1).click()
      })
    // universal.getViewOrderModal().within(() => {
    //   cy.findByText('Order Confirmed').should('exist')
    //   universal.getOrderAgainButton().should('exist')
    //   universal.getCloseButton().click()
    // })
    // cy.get('@ordersCard').within(() => {
    //   cy.findAllByText('Processing Error').eq(0).click()
    // })
    // universal.getViewOrderModal().within(() => {
    //   cy.contains(
    //     'An error occurred while trying to place your order: Billing Transaction Failed: Insufficient Funds - Please Contact Your Administrator'
    //   )
    //   universal.getCloseButton().click()
    // })
    // cy.get('@ordersCard').within(() => {
    //   cy.findAllByText('Processing Error').eq(2).click()
    // })
    // universal.getViewOrderModal().within(() => {
    //   cy.contains(
    //     'An error occurred while trying to place your order: The provided address has not been verified as a valid USPS address'
    //   )
    //   universal.getCloseButton().click()
    // })
    //sorts by date via a mocked response
    cy.graphqlMockDelete({ operationName: 'searchPostalFulfillments' })
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsForPlaybooksMockB.json',
      count: 2,
    })
    cy.get('@ordersCard').within(() => {
      cy.findByText('Date').click({ force: true })
      cy.findAllByTestId('ui-progress-bar').should('exist').and('have.css', 'opacity', '0')
      universal.getNoItemsMessage().should('not.exist')
      cy.findAllByRole('row').eq(1).should('contain', 'Ricky Bashirian').and('contain', '12/5/2020')
      cy.findAllByRole('row').eq(2).should('contain', 'Horrace Handy').and('contain', '12/6/2020')
      cy.graphqlMockDelete({ operationName: 'searchPostalFulfillments' })
      cy.graphqlMockSet({
        operationName: 'searchPostalFulfillments',
        fixture: 'searchPostalFulfillmentsForPlaybooksMock.json',
        count: 2,
      })
      cy.findByText('Date').click({ force: true })
    })
    cy.get('@ordersCard').within(() => {
      universal.getNoItemsMessage().should('not.exist')
      cy.findAllByRole('row').eq(1).should('contain', 'Wilby Willows').and('contain', '12/8/2020')
      cy.findAllByRole('row').eq(2).should('contain', 'Maria Lara').and('contain', '12/7/2020')
    })

    cy.graphqlMockClear()
  })
})
