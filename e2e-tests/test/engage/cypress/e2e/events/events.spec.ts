/* eslint-disable cypress/unsafe-to-chain-command */
import { onlyOn } from '@cypress/skip-test'
import { faker } from '@faker-js/faker'
import { addDays, addWeeks, format } from 'date-fns'
import {
  AddFundsV2Document,
  AddressSource,
  BillingAccountsDocument,
  ContactType,
  PaymentPartnerType,
  PhoneType,
  SearchApprovedPostalsDocument,
  Status,
  UpdateApprovedPostalDocument,
  UpsertContactDocument,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  CustomFormFields,
  Delivery,
  EmailSettings,
  Events,
  MagicLinks,
  Marketplace,
  Navbar,
  Reporting,
  SendItem,
  Universal,
} from '../../support/pageObjects'

describe('Events test suite', () => {
  let user: any
  const universal = new Universal()
  const events = new Events()
  const magicLinks = new MagicLinks()
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const reporting = new Reporting()
  const sendItem = new SendItem()
  const delivery = new Delivery()
  const emailSettings = new EmailSettings()
  const customFormFields = new CustomFormFields()

  const dateFormatYearFirst = (date: Date) => format(date, 'yyyy-MM-dd')
  const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
  const weekFromToday = dateFormatInput(addWeeks(new Date(), 1))
  const weekNADayFromToday = dateFormatInput(addWeeks(addDays(new Date(), 1), 1))

  beforeEach(() => {
    user = userFactory()
    cy.signup(user)
    cy.teamsSeed(1)
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
    cy.graphqlRequest(UpsertContactDocument, {
      data: {
        type: ContactType.Contact,
        addresses: [
          {
            preferred: true,
            source: AddressSource.Manual,
            country: 'USA',
            postalCode: '93401',
            state: 'CA',
            city: 'San Luis Obispo',
            address1: '419 Junipero Way',
            entryName: 'Home',
          },
        ],
        phones: [{ phoneNumber: faker.phone.number(), type: PhoneType.Work }],
        emailAddress: `marillaplunk${faker.string.alphanumeric(4)}@postal.dev`,
        companyName: faker.company.name(),
        title: faker.person.jobTitle(),
        lastName: 'Plunk',
        firstName: 'Marilla',
      },
    })
    cy.intercept('POST', '/engage/api/upload-assets?*').as('uploadAssets')
    cy.login(user)
    cy.filterLocalStorage('postal:events:tab')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'createApprovedPostal') {
        req.alias = 'createApprovedPostal'
      }
      if (req.body.operationName === 'searchApprovedPostals') {
        req.alias = 'searchApprovedPostals'
      }
    })
  })

  it('Event Testing', () => {
    //tests events link in navbar
    cy.visit('/')
    universal.getSpinner().should('not.exist')
    navbar.getEventsLink().click()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    events.getMyEventsTab().should('not.be.checked')
    cy.url().should('include', '/events/marketplace')
    cy.wait(500)
    //checks the that Empty My Events has the empty intro banner
    events.getMyEventsTab().check({ force: true })
    cy.url().should('include', '/events/postals')
    cy.wait(500)
    universal.getSpinner().should('not.exist')
    cy.findByText('You currently have no scheduled Events').should('exist')
    events.getGoToTheMarketplaceButton().click()
    //requests an event
    events.getNoEventsText().should('not.exist')
    universal.getSpinner().should('not.exist')
    cy.contains('a', 'Super-duper Fun Event').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Super-duper Fun Event').click({ force: true })
      }
    })
    universal.getSpinner().should('not.exist')
    //test rendering of request marketplace product event page
    cy.findByText('Super-duper Fun Event').should('exist')
    events.getUneditedEventDescription().should('exist')
    events.getEventInformation().should('exist')
    events.getUneditedEventDuration().should('exist')
    cy.findByText('Up to 100 participantsminimum of 10').should('exist')
    events.getJoinInfo().should('exist')
    cy.findByText('I am interested in setting up an event with Super-duper Fun Event').should(
      'exist'
    )
    events.getSelectAnOptionButton().should('exist').click()
    // eslint-disable-next-line
    cy.getAllUnselectedVariants()
      .eq(0)
      .realHover()
      .within(() => {
        //checks that shipping price does not surface
        marketplace.getVariantShippingPrice().should('not.contain', 'FREE')
      })
    events.getVariantOneDescription().should('exist')
    // eslint-disable-next-line
    cy.getAllUnselectedVariants()
      .eq(1)
      .realHover()
      .within(() => {
        marketplace.getVariantShippingPrice().should('not.contain', 'FREE')
      })
    cy.findByText('This variant is just OKAY.').should('exist')
    //tests field validations
    events.getNameInput().should('have.value', `${user.firstName} ${user.lastName}`).clear()
    events.getEmailInput().should('have.value', user.userName).clear()
    cy.wait(200)
    events
      .getNameInput()
      .getInputValidation('Please fill out this field.')
      .fill(`${user.firstName} ${user.lastName}`)
    events
      .getEmailInput()
      .getInputValidation('Please fill out this field.')
      .fill(`fakery`)
      .getInputValidation(`Please include an '@' in the email address. 'fakery' is missing an '@'.`)
      .clear()
      .fill('newyui@&*%#')
      .getInputValidation(`A part following '@' should not contain the symbol '&'.`)
      .fill(user.userName)
    events.getPhoneInput().getInputValidation('Please fill out this field.').fill('805-234-2376')
    events
      .getMessageInput()
      .getInputValidation('Please fill out this field.')
      .fill(events.messageText())
    events.getAgreeToTermsCheckbox().should('not.be.checked')
    events
      .getPostalioEventsTermsConditionsLink()
      .should(
        'have.attr',
        'href',
        'https://help.postal.com/helpcenter/s/article/Events-Terms-Conditions'
      )
    events.getBookYourEventButton().should('be.disabled')
    events.getAgreeToTermsCheckbox().check({ force: true }).should('be.checked')
    events.getBookYourEventButton().should('not.be.disabled').click({ force: true })
    events
      .getPreferredDate1Input()
      .getInputValidation('Please fill out this field.')
      .type(`${weekFromToday} 9:00 AM{enter}`, { force: true })
    events
      .getPreferredDate2Input()
      .getInputValidation('Please fill out this field.')
      .type(`${weekNADayFromToday} 9:00 AM{enter}`, { force: true })
    events.getPreferredDate3Input().should('exist')
    events.getAgreeToTermsCheckbox().check({ force: true }).should('be.checked')
    events.getBookYourEventButton().click({ force: true })
    cy.getAlert({ message: 'Please choose one option for your event.' })
    // eslint-disable-next-line
    cy.getAllUnselectedVariants().should('have.length.gte', 2)
    // eslint-disable-next-line
    cy.getAllUnselectedVariants().eq(0).click({ force: true })
    events
      .getEstimatedCosts()
      .should('not.contain', '$0.00')
      .find('dd')
      .then(($estCosts) => {
        const prevCostText = $estCosts.text()
        events
          .getEstimatedAttendeesInput()
          .clear()
          .getInputValidation('Please fill out this field.')
          .type('15')
        events
          .getEstimatedCosts()
          .find('dd')
          .should('not.contain', prevCostText)
          .and('not.contain', '$0.00')
      })
    events.getDateAndTimeTooltip().realHover({ position: 'center', scrollBehavior: 'bottom' })
    events.getDateAndTimeTooltipText().should('exist')
    events.getEstimatedCostTooltip().realHover()
    events.getEstimatedCostTooltipText().should('exist')
    events.getEstimatedAttendeesTooltip().realHover()
    events.getEstimatedAttendeesTooltipText().should('exist')
    events.getAgreeToTermsCheckbox().check({ force: true }).should('be.checked')
    events.getBookYourEventButton().click({ force: true })
    events.getBookedEventModal().within(() => {
      universal.getLinkByText('temporary event').should('be.visible')
      events.getBookedEventModalText().should('be.visible')
      universal.getCloseButton().click()
    })
    events.visitMyEvents()
    cy.wait(500)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Super-duper Fun Event')) {
        cy.wait(55000)
        cy.reload()
        cy.wait(300)
      }
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Clear filters')) {
        cy.contains('button', 'Clear filters').click()
        cy.wait(300)
      }
    })
    cy.contains('a', 'Super-duper Fun Event').should('exist')
    // wait for changes to propagate to searchable products
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Pending Confirmation')) {
        cy.wait(30500)
        cy.reload()
      }
    })
    events.getTagByStatus('Pending Confirmation').should('be.visible')
    cy.contains('a', 'Super-duper Fun Event').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Super-duper Fun Event').click({ force: true })
      }
    })
    //tests rendering of the Pending Confirmation event page
    //needs the event-manager role to be able to view maybe?
    //marketplace.getEllipsesButton().eq(0).should('be.visible').click()
    //events.getRequestCancellationMenuItem().should('be.visible')
    cy.contains('[data-testid="ui-card"]', 'Super-duper Fun Event').within(() => {
      events.getUneditedEventDescription().should('exist')
      cy.contains(`${format(addWeeks(new Date(), 1), 'MMM d, yyyy')}, 9:00 AM`).should('exist')
      events.getUneditedEventDuration().should('exist')
      cy.contains('0 of 15 participantshave accepted')
      events.getJoinInfo().should('exist')
      cy.findByText('TBD').should('exist')
    })
    // events.getOptionInfo().within(() => {
    //   events.getVariantOneDescription().should('exist')
    //   marketplace.getVariantShippingPrice().should('not.contain', 'FREE')
    // })
    cy.contains('You will be able to add Attendees once the event has been approved.')
    events.getRequestInfo().within(() => {
      events.getRequestedAttendeesInfo().should('contain', '15')
      events
        .getRequestedDatesInfo()
        .should('contain', addWeeks(new Date(), 1).toLocaleDateString())
        .should('contain', addWeeks(addDays(new Date(), 1), 1).toLocaleDateString())
      events.getRequestedMessageInfo().should('contain', events.messageText())
    })
    //approves the requested event via api
    cy.wait('@createApprovedPostal').then((res) => {
      cy.url().should('include', '/events/postals')
      cy.approveEvent(res.response?.body.data.createApprovedPostal.postal.id).then((res) => {
        expect(res.event.status).to.eq('ACCEPTING_INVITES')
        cy.graphqlRequest(UpdateApprovedPostalDocument, {
          id: res.id,
          data: { status: Status.Active },
        })
      })
    })
    cy.queryForUpdateRecurse({
      request: SearchApprovedPostalsDocument,
      operationName: 'searchApprovedPostals',
      key: '0',
      value: 'ACTIVE',
      key2: 'status',
    })
    events.visitMyEvents()
    universal.getSpinner().should('not.exist')
    // wait for changes to propagate to searchable products
    cy.wait(300)
    cy.contains('button', 'Clear filters').click()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Accepting Invites')) {
        cy.wait(45500)
        cy.reload()
        cy.wait(300)
      }
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Clear filters')) {
        cy.contains('button', 'Clear filters').click()
        cy.wait(300)
      }
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    events.getTagByStatus('Accepting Invites').should('exist')
    cy.contains('a', 'Super-duper Fun Event').click({ force: true })
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.url().should('contain', '/events/postals/')
    universal.getSpinner().should('not.exist')
    //tests rendering the 'Accepting Invites' state of a events page
    cy.wait(800)
    universal.progressBarZero()
    events.getEllipsesButton().eq(0).click({ force: true })
    cy.wait(200)
    events.getSendEventMenuItem().should('be.visible')
    events.getCloneEventMenuItem().should('be.visible')
    events.getCreateMagicLinkMenuItem().should('be.visible')
    events.getEditEventButton().should('be.visible')

    //needs the event-manager role to be able to view maybe?
    //events.getRequestCancellationMenuItem().should('be.visible')
    cy.contains('[data-testid="ui-card"]', 'Super-duper Fun Event').within(() => {
      events.getUneditedEventDescription().should('exist')
      cy.contains(`${format(addWeeks(new Date(), 1), 'MMM d, yyyy')}, 9:00 AM`).should('exist')
      events.getUneditedEventDuration().should('exist')
      cy.contains('0 of 15 participantshave accepted')
      events.getJoinInfo().should('exist')
      cy.contains(
        `Invitations expire on ${format(addDays(addWeeks(new Date(), 1), 3), 'MMM d, yyyy')}`
      ).should('exist')
    })
    events.getMeetingLinkInfo().should('contain', 'http://www.google.com')
    //todo: testing for new varaint select
    // events.getOptionInfo().within(() => {
    //   events.getVariantOneDescription().should('exist')
    // })
    events.getAvailableTeamsInfo().should('contain', 'All Teams')
    events.getAttendeesCard().within(() => {
      events.getExportButton()
      cy.get('th').should('be.visible').and('contain.text', events.getContactsTableHeaderText())
      universal.getRowsInATableBody().should('have.length', 1)
      universal.getNoItemsMessage().should('exist')
    })
    events.getEditThisEventButton().should('exist')
    events.getSendThisEventButton().should('exist')
    universal.progressBarZero()
    //cy.wait(100)
    //marketplace.getEllipsesButton().eq(0).should('be.visible').click()
    //todo: test for other menuitem buttons existence too?
    events.getAddAttendeesButton().should('exist')
    //events.getEllipsesButton().click({ force: true })
    cy.wait(200)
    events.getCreateMagicLinkButton().should('exist')
    //Edits an Event
    cy.wait(500)
    events.getEditThisEventButton().click({ force: true })
    const eventdescription = faker.lorem.paragraph(2)
    events.getEditDrawerByName('Super-duper Fun Event').within(() => {
      //tests validation
      events
        .getNameEditInput()
        .clear()
        .getInputValidation('Please fill out this field.')
        .type('Super-duperEdited')
      events
        .getMeetingLinkEditInput()
        .clear()
        .getInputValidation('Please fill out this field.')
        .type('hsgsvfe3fg')
        .getInputValidation('Please enter a URL.')
        .clear()
        .type('http://www.microsoft.com')
      events
        .getMaxAttendeesEditInput()
        .scrollIntoView()
        .clear({ force: true })
        .getInputValidation('Please fill out this field.')
        .type('ahsghshew')
        .should('not.have.value', 'ahsghshew')
        .type('20')
      cy.findByTestId('AutoCompleteTeam').scrollIntoView()
      cy.selectAutoCompleteTeam('Jersey')
      cy.getAutoCompleteValues('AutoCompleteTeam').should('contain', 'Jersey')

      events
        .getDescriptionEditInput()
        .clear()
        .getInputValidation('Please fill out this field.')
        .fill(eventdescription)
    })
    //tests tooltips
    events.getMeetingLinkTooltip().realHover()
    events.getMeetingLinkTooltipText().should('be.visible')
    events.getMaximumAttendeesTooltip().realHover()
    events.getMaximumAttendeesTooltipText().should('be.visible')
    events.getTeamsTooltip().realHover()
    events.getTeamsTooltipText().should('be.visible')
    events.getDescriptionTooltip().realHover()
    events.getDescriptionTooltipText().should('be.visible')
    events.getEmailNotificationsTooltip().realHover()
    events.getEmailNotificationsTooltipText().should('be.visible')
    events.getEditDrawerByName('Super-duper Fun Event').within(() => {
      //tests email notification checkboxes
      cy.findAllByRole('checkbox').should('have.length', 9)
      events.getSendEmailConfirmationCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendReminderDayBeforeCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendReminderDayOfCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendInviteExpiringAlertCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendCancelledAlertCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendMeetingLinkChangedCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendDateTimeChangedCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendEventKitShippedAlertCheckbox().should('be.checked').uncheck({ force: true })
      events.getSendEventKitDeliveredAlertCheckbox().should('be.checked').uncheck({ force: true })
      events.getSaveThisEventButton().click()
    })
    events.getEditDrawerByName('Super-duper Fun Event').should('not.exist')
    universal.getSpinner().should('not.exist')
    // test custom form fields
    cy.wait(500)
    events.getEditThisEventButton().click({ force: true })
    events.getEditDrawerByName('Super-duperEdited').within(() => {
      events.getCustomizeFormFieldsButton().scrollIntoView().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // default fields should exist
      customFormFields.getCustomFieldFirstName().should('exist')
      customFormFields.getCustomFieldLastName().should('exist')
      customFormFields.getCustomFieldEmailAddress().should('exist')
      customFormFields.getCustomFieldTitle().should('exist')
      customFormFields.getCustomFieldCompany().should('exist')
      // add a text field and then save it
      customFormFields.getAddCustomFieldTextButton().click()
      customFormFields.getNewCustomFieldQuestion().fill('Some question')
      customFormFields.getCustomFieldNewField().should('not.exist')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()

      // add a dropdown field
      customFormFields.getAddCustomFieldSingleChoiceButton().click()
      customFormFields.getNewCustomFieldQuestion().type('Choose one')

      // change it to a yes/no field, change the name, then save it
      customFormFields
        .getChangeCustomFieldTypeButton('Dropdown')
        .scrollIntoView()
        .should('exist')
        .click()
      customFormFields.getChangeCustomFieldTypeMenuItem('Yes/No').should('exist').click()
      customFormFields.getNewCustomFieldQuestion().clear().type('Yes or no?')
      customFormFields.getSaveCustomFieldButton().click()

      // edit first text field added, change it to Date, then change name
      customFormFields
        .getAddedTextFieldByLabel('Some question*')
        .should('exist')
        .find('.editFormField')
        .invoke('show')
      customFormFields.getEditFieldButton('Some question').click()
      customFormFields
        .getAddedTextFieldByLabel('Some question*')
        .should('exist')
        .find('.editFormField')
        .invoke('hide')
      cy.wait(300)
      customFormFields.getChangeCustomFieldTypeButton('Short Answer').should('exist').click()
      cy.wait(300)
      customFormFields
        .getChangeCustomFieldTypeMenuItem('Date')
        .should('exist')
        .click({ force: true })
      customFormFields.getNewCustomFieldQuestion().clear().type('What day?')
      customFormFields
        .getNewCustomFieldMinDate()
        .type(format(new Date(weekFromToday), 'yyyy-MM-dd'), { force: true })
      customFormFields
        .getNewCustomFieldMaxDate()
        .type(format(new Date(weekNADayFromToday), 'yyyy-MM-dd'), { force: true })
      customFormFields.getSaveCustomFieldButton().click()
      // add a single choice field
      customFormFields.getAddCustomFieldSingleChoiceButton().click()
      customFormFields.getNewCustomFieldQuestion().type('Best taco')
      customFormFields
        .getSingleChoiceAddAnswers()
        .click({ force: true })
        .get('.UiSelectTypeaheadCreatable__input')
        .type('Carne asada{enter}Carnitas{enter}Al Pastor{enter}')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()

      // delete checkbox field
      customFormFields
        .getAddedTextFieldByLabel('Yes or no?')
        .should('exist')
        .parent()
        .find('.editFormField')
        .should('exist')
        .invoke('show')
      customFormFields.getDeleteFieldButton('Yes or no?').click()
      cy.get('.editFormField').invoke('hide')

      // add a multiple choice field
      customFormFields.getAddCustomFieldCheckBoxesButton().click()
      customFormFields.getNewCustomFieldQuestion().type('Taco toppings')
      customFormFields
        .getMultipleChoiceAddAnswers()
        .type('Cheese{enter}Sour Cream{enter}Bananas{enter}Cilantro{enter}Onions{enter}Guac{enter}')
      customFormFields
        .getMultipleChoiceAnswer('Bananas')
        .should('exist')
        .find('input')
        .click({ force: true })
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()

      // accidentally add another multiple choice field, but then click back
      customFormFields.getAddCustomFieldCheckBoxesButton().click()
      events.getBackButton().click()

      // drag multiple choice field
      customFormFields
        .getAddedTextFieldByLabel('Taco toppings*')
        .should('exist')
        .parent()
        .find('.editFormField')
        .should('exist')
        .invoke('show')

      events
        .getDragHandle('Taco toppings')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { pageX: 500, pageY: 260, force: true })
        .trigger('mouseup', { force: true })

      // save changes to form
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    events.getEditDrawerByName('Super-duperEdited').within(() => {
      // Best taco should be last
      customFormFields
        .getRegistrationFormFieldsAdded()
        .should('exist')
        .get('li')
        .last()
        .should('contain.text', 'Taco toppings')

      // Re-sort fields
      events.getCustomizeFormFieldsButton().scrollIntoView().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('exist')
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // drag best taco field
      customFormFields
        .getAddedTextFieldByLabel('Best taco*')
        .should('exist')
        .parent()
        .find('.editFormField')
        .should('exist')
        .invoke('show')
      events
        .getDragHandle('Best taco')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { pageX: 500, pageY: 210, force: true })
        .trigger('mouseup', { force: true })
      // save changes to form
      customFormFields.getApplyFormSettingsButton().click()
    })
    events.getEditDrawerByName('Super-duperEdited').within(() => {
      // Taco toppings should be last field
      customFormFields
        .getRegistrationFormFieldsAdded()
        .should('exist')
        .get('li')
        .should('have.length', 8)
        .last()
        .should('contain.text', 'Taco toppings')
      //tests Customize Email Messaging - email variables
      events.getCustomizeEmailMessagingButton().click()
    })
    events.getCustomizeEmailMessagingModal().within(() => {
      events.getEventConfirmationButton().should('have.attr', 'data-active')
      events.getEmailVariablesButton().click()
      events.getEmailVariablesModal().within(() => {
        cy.get('tr').should('have.length', 15)
        cy.window().then((win) => {
          cy.stub(win, 'prompt').returns(win.prompt)
        })
        universal.getRowByText('{{eventDate}}').click()
      })
    })
    events.getCopiedEventDateToClipboardAlert()
    //tests email subject line and email body inputs, edited previews, and set default buttons visibility
    const eventConfirmationDefault = `Confirmed for ${user.company}'s Super-duperEdited on ${weekFromToday}`
    const eventConfirmationDefaultValue = `Confirmed for {{accountName}}'s {{postalName}} on {{eventDate}}`
    events.getCustomizeEmailMessagingModal().within(() => {
      events.getSetDefaultButton().should('not.exist')
      events.getEmailPreviewDiv().should('contain', eventConfirmationDefault)
      //tests that inputs can't be cleared
      events.getEmailSubjectLineGroup().within(() => {
        cy.findByRole('textbox').clear()
        cy.findByRole('textbox').and('have.value', eventConfirmationDefaultValue).type('123')
        events.getSetDefaultButton().as('eSLineReset').should('exist')
      })
      events.getEmailPreviewDiv().should('contain', `${eventConfirmationDefault}123`)
      events.getEmailBodyGroup().within(() => {
        cy.findByRole('textbox').clear()
        cy.findByRole('textbox').type('ABC')
        events.getSetDefaultButton().as('ebodyReset').should('exist')
      })
      events.getIFrameBody().should('include.text', 'ABC')
      //testing clicking the Set Default buttons
      cy.get('@eSLineReset').click()
      events.getEmailPreviewDiv().should('not.contain', `${eventConfirmationDefault}123`)
      cy.get('@ebodyReset').click()
      events.getIFrameBody().should('not.include.text', 'ABC')
      events.getSetDefaultButton().should('not.exist')
      //tests an unclosed tag
      events.getEmailSubjectLineInput().should('not.be.disabled')
      events.getEmailSubjectLineInput().type(`{backspace}`)
      events
        .getEmailPreviewDiv()
        .should(
          'contain',
          `ERROR. Is there an unclosed tag such as \`{{recipientFirstName\`? Please go back and check your message.`
        )
      events.getEmailSubjectLineInput().type(`}456`)
      events.getEmailPreviewDiv().should('not.contain', `ERROR`)
      events.getEmailPreviewDiv().should('contain', `${eventConfirmationDefault}456`)
      events.getEmailBodyInput().type('{{}{{}senderLastName}')
      events
        .getIFrameBody()
        .should(
          'include.text',
          `ERROR. Is there an unclosed tag such as \`{{recipientFirstName\`? Please go back and check your message.`
        )
      events.getEmailBodyInput().type('}DEF')
      events.getIFrameBody().should('not.include.text', `ERROR`)
      events.getIFrameBody().should('include.text', `${user.lastName}DEF`)
      //saves these new edits and then naviagtes back into the edit drawer to make sure they take
      events.getApplyChangesButton().click()
    })
    events.getSaveThisEventButton().click()
    cy.contains('Event Updated', { timeout: 80000 }).should('exist')
    universal.progressBarZero()
    cy.wait(500)
    events.getEditThisEventButton().click({ force: true })
    cy.url().should('contain', '/edit')
    events.getCustomizeEmailMessagingButton().click()
    events.getCustomizeEmailMessagingModal().within(() => {
      events.getEmailSubjectLineInput().should('have.value', `${eventConfirmationDefaultValue}456`)
      events.getEmailBodyInput().invoke('val').should('include', '{{senderLastName}}DEF')
      events.getEmailPreviewDiv().should('contain', `${eventConfirmationDefault}456`)
      events.getIFrameBody().should('include.text', `${user.lastName}DEF`)
      //tests that each different email type renders the right subject line and email body
      events.getReminderDayBeforeButton().click()
      events
        .getEmailSubjectLineInput()
        .invoke('val')
        .should('include', `{{accountName}}'s {{postalName}} is tomorrow`)
      events
        .getEmailBodyInput()
        .invoke('val')
        .should('include', 'Looking forward to seeing you at the {{postalName}} tomorrow!')
      events
        .getEmailPreviewDiv()
        .should('contain', `${user.company}'s Super-duperEdited is tomorrow`)
      events
        .getIFrameBody()
        .should('include.text', `Looking forward to seeing you at the Super-duperEdited tomorrow!`)
      events.getReminderDayOfButton().click()
      events
        .getEmailSubjectLineInput()
        .invoke('val')
        .should('include', `{{accountName}}'s {{postalName}} is today!`)
      events.getEmailBodyInput().invoke('val').should('include', 'Today is the day!')
      events.getEmailPreviewDiv().should('contain', `${user.company}'s Super-duperEdited is today!`)
      events.getIFrameBody().should('include.text', `Today is the day!`)
      events.getCancellationAlertButton().click()
      events
        .getEmailSubjectLineInput()
        .invoke('val')
        .should('include', `Cancelled - {{accountName}}'s {{postalName}} on {{eventDate}}`)
      events.getEmailBodyInput().invoke('val').should('include', 'Event Cancelled')
      events
        .getEmailPreviewDiv()
        .should('contain', `Cancelled - ${user.company}'s Super-duperEdited on ${weekFromToday}`)
      events.getIFrameBody().should('include.text', `We regret to inform you`)
      events.getDateTimeChangeButton().click()
      events
        .getEmailSubjectLineInput()
        .invoke('val')
        .should('include', `Your Upcoming Event Has Changed`)
      events
        .getEmailBodyInput()
        .invoke('val')
        .should('include', 'Heads up! We had to make some changes')
      events.getEmailPreviewDiv().should('contain', `Your Upcoming Event Has Changed`)
      events.getIFrameBody().should('include.text', `Heads up! We had to make some changes`)
      events.getMeetingLinkChangeButton().click()
      events
        .getEmailSubjectLineInput()
        .invoke('val')
        .should(
          'include',
          `Meeting Link Changed - {{accountName}}'s {{postalName}} on {{eventDate}}`
        )
      events.getEmailBodyInput().invoke('val').should('include', 'Here is the new meeting')
      events
        .getEmailPreviewDiv()
        .should(
          'contain',
          `Meeting Link Changed - ${user.company}'s Super-duperEdited on ${weekFromToday}`
        )
      events.getIFrameBody().should('include.text', `Here is the new meeting`)
      cy.wait(300)
      universal.getCancelButton().click()
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Please Confirm')) {
        universal.getNewCloseButton().click()
      }
    })
    events.getEditDrawerByName('Super-duperEdited').within(() => {
      events.getSaveThisEventButton().click()
      cy.wait(1000)
    })
    events.getEditDrawerByName('Super-duper Fun Event').should('not.exist')
    universal.getSpinner().should('not.exist')
    //tests rendering of event page to make sure edits are displayed there
    cy.contains('[data-testid="ui-card"]', 'Super-duperEdited').within(() => {
      events.getUneditedEventDescription().should('not.exist')
      cy.contains(eventdescription).should('exist')
      events.getUneditedEventDuration().should('exist')
      cy.contains('0 of 15 participantshave accepted').should('not.exist')
      cy.contains('0 of 20 participantshave accepted').should('exist')
    })
    events.getMeetingLinkInfo().should('contain', 'http://www.microsoft.com')
    events.getAvailableTeamsInfo().scrollIntoView().should('contain', 'Jersey')

    // checks that edits make it back into the edit drawer
    cy.wait(500)
    events.getEditThisEventButton().click({ force: true })
    events.getEditDrawerByName('Super-duperEdited').within(() => {
      events.getNameEditInput().should('have.value', 'Super-duperEdited')
      events.getMeetingLinkEditInput().should('have.value', 'http://www.microsoft.com')
      events.getMaxAttendeesEditInput().should('have.value', '20')
      cy.getAutoCompleteValues('AutoCompleteTeam').should('contain', 'Jersey')
      events.getDescriptionEditInput().should('have.value', eventdescription)
      events.getSendEmailConfirmationCheckbox().should('not.be.checked')
      events.getSendReminderDayBeforeCheckbox().should('not.be.checked')
      events.getSendReminderDayOfCheckbox().should('not.be.checked')
      events.getSendInviteExpiringAlertCheckbox().should('not.be.checked')
      events.getSendCancelledAlertCheckbox().should('not.be.checked')
      events.getSendMeetingLinkChangedCheckbox().should('not.be.checked')
      events.getSendDateTimeChangedCheckbox().should('not.be.checked')
      events.getSendEventKitShippedAlertCheckbox().should('not.be.checked')
      events.getSendEventKitDeliveredAlertCheckbox().should('not.be.checked')
      universal.getCancelButton().click()
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Please Confirm')) {
        universal.getNewCloseButton().click()
      }
    })
    events.getEditDrawerByName('Super-duperEdited').should('not.exist')
    universal.getSpinner().should('not.exist')

    //Sends the event
    cy.wait(300)
    events.getSendThisEventButton().click({ force: true })
    cy.url().should('contain', '/send/configuration')
    //send event tab button
    events.getSendThisEventButton().click({ force: true })
    cy.url().should('contain', '/send/select_contacts')
    universal.progressBarZero()
    cy.clickCheckbox({ name: 'Marilla' })
    sendItem.getConfigureYourItemButton().click()
    cy.findByRole('button', { name: 'Add' }).should('not.exist')
    sendItem.getEventEmailInput().fill('Welcome to the Event!')
    cy.wait(300)
    sendItem.getEventLandingPageMessageInput().fill('Landing Page Message')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const fields = [
        'First Name',
        'Last Name',
        'Email Address',
        'Title',
        'Company',
        'What day?',
        'Best taco',
        'Taco toppings',
      ]
      fields.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().within(() => {
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
      sendItem.getCustomizeFieldsTagByName('Best taco').should('exist')
      sendItem.getCustomizeFieldsTagByName('N0tes:').should('exist')
    })
    sendItem.getSendAsSelect().select('Contact Owner')
    sendItem.getSpendAsCard().within(() => {
      cy.findByRole('combobox').type(`${user.userName}`, { force: true })
    })
    sendItem.getReviewButton().click()
    cy.contains('Message Variables').should('not.exist')
    cy.contains('Super-duperEdited').should('exist')
    cy.contains(events.variantOneText())
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    cy.contains('Welcome to the Event!').should('exist')
    sendItem.getReviewLandingPageMessage().should('contain', 'Landing Page Message')
    sendItem.getReviewContacts().should('contain', 'Marilla Plunk')
    sendItem.getReviewSendAsSection().should('contain', 'Contact Owner')
    sendItem.getReviewItemCosts().should('not.contain', '$0.00')
    //P2-2818
    //sendItem.getReviewEstimatedVendorSalesTax().should('not.contain', '$0.00')
    sendItem.getReviewTransactionFee().should('not.exist')
    sendItem.getReviewShippingAndPostage().should('not.exist')
    sendItem.getReviewTotal().scrollIntoView().should('be.visible').and('not.contain', '$0.00')
    sendItem.getReviewEventNotifications().should('not.exist')
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click()
    })
    sendItem.getConfirmSendModal().should('not.exist')
    cy.contains('Marilla Plunk').should('exist')
    cy.contains('Processing').should('exist')
    cy.contains('Super-duperEdited').should('exist')
    events.visitMyEvents()
    universal.getSpinner().should('not.exist')
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    events.getTagByStatus('Accepting Invites').should('exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Super-duperEdited')) {
        cy.wait(20500)
        cy.reload()
      }
    })
    cy.contains('a', 'Super-duperEdited').click()
    cy.wait(2800)
    cy.findAllByTestId('EventBannerImage').should('have.length', 2)
    events.getEditImagesButton().click({ force: true })
    cy.wait(400)
    cy.findByRole('dialog').within(() => {
      universal.getCloseButtonByLabelText()
      //tests the duplicate images in the  display header and images in the edit area (2+2=4)
      cy.findAllByRole('img').should('have.length', 4)
      events.getAllDeleteImages().should('have.length', 2)
      cy.findByTestId('EventImages_Dropzone').as('dropZone')
      cy.findByTestId('EventImages_Dropzone')
        .parent('div')
        .should('contain', 'Drag an image from your desktop here or click to select')
      cy.contains('Your event landing page will show the first five images.')
      cy.contains('Click and drag the images below to reorder them.')
      cy.findByRole('contentinfo').within(() => {
        universal.getCancelButton().should('exist')
        universal.getResetButton().should('exist')
        events.getSaveImagesButton().should('exist')
      })
    })
    //tests dropping a new image
    cy.fixture('postal-plane.svg', 'base64').then((content) => {
      cy.get('@dropZone').upload({
        file: content,
        fileName: 'postal-plane.svg',
        type: 'image/svg+xml',
        testId: 'EventImages_Dropzone',
      })
      universal.getSpinner().should('exist')
      cy.wait('@uploadAssets')
    })
    events.getAllDeleteImages().should('have.length', 3)
    //tests reset button
    universal.getResetButton().click()
    events.getAllDeleteImages().should('have.length', 2)
    //tests dropping the image again
    cy.fixture('postal-plane.svg', 'base64').then((content) => {
      cy.get('@dropZone').upload({
        file: content,
        fileName: 'postal-plane.svg',
        type: 'image/svg+xml',
        testId: 'EventImages_Dropzone',
      })
      universal.getSpinner().should('exist')
      cy.wait('@uploadAssets')
    })
    //tests deleting the old images
    events.getAllDeleteImages().eq(0).click({ force: true })
    events.getRemoveImageModal().within(() => {
      events.getRemoveImageModalText().should('exist')
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().click()
    })
    events.getAllDeleteImages().should('have.length', 2)
    events.getAllDeleteImages().eq(0).click()
    events.getRemoveImageModal().within(() => {
      events.getRemoveImageModalText().should('exist')
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().click()
    })
    events.getAllDeleteImages().should('have.length', 1)
    events.getSaveImagesButton().click({ force: true })
    cy.findByRole('dialog').should('not.exist')
    cy.wait(500)
    cy.findAllByTestId('EventBannerImage').should('have.length', 1)

    //tests cloning a event
    cy.wait(1000)
    events.getEllipsesButton().click({ force: true })
    events.getCloneEventMenuItem().click({ force: true })
    events.getCloneEventModal().within(() => {
      events.getCloneEventModalText().should('exist')
      universal.getCancelButton().should('exist')
      events.getCloneEventButton().click()
    })
    events.getCloneEventModal().should('not.exist')
    events.visitMyEvents()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    events.getTagByStatus('Accepting Invites').should('be.visible')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Super-duperEdited-CLONE')) {
        cy.wait(40200)
        cy.reload()
        universal.getSpinner().should('not.exist')
        events.getTagByStatus('Accepting Invites').should('be.visible')
        cy.wait(300)
      }
    })
    cy.contains('button', 'Clear filters').click()
    cy.wait(300)
    cy.contains('a', 'Super-duperEdited-CLONE').click()
    //tests that some of the edits made it into the cloned event request
    cy.contains('[data-testid="ui-card"]', 'Super-duperEdited-CLONE').within(() => {
      cy.findAllByRole('img').should('have.length', 1)
      cy.contains(eventdescription).should('exist')
      events.getUneditedEventDuration().should('exist')
      cy.contains('0 of 20 participantshave accepted').should('exist')
    })
    events.getRequestInfo().within(() => {
      events.getRequestedAttendeesInfo().should('contain', '20')
      events
        .getRequestedDatesInfo()
        .scrollIntoView()
        .within(() => {
          //multiple date only included as flake fix for the occasional mismatch in UTC for remote runs
          cy.contains(
            //
            RegExp(
              addWeeks(new Date(), 1).toLocaleDateString() +
                '|' +
                addWeeks(addDays(new Date(), 1), 1).toLocaleDateString()
            )
          ).should('exist')
          cy.contains(
            RegExp(
              addWeeks(addDays(new Date(), 1), 1).toLocaleDateString() +
                '|' +
                addWeeks(addDays(new Date(), 2), 1).toLocaleDateString()
            )
          ).should('exist')
        })
      events.getRequestedMessageInfo().should('contain', events.messageText())
    })
    cy.wait('@createApprovedPostal').then((res) => {
      cy.url().should('include', '/events/postals')
      cy.approveEvent(res.response?.body.data.createApprovedPostal.postal.id).then((res) => {
        expect(res.event.status).to.eq('ACCEPTING_INVITES')
        cy.graphqlRequest(UpdateApprovedPostalDocument, {
          id: res.id,
          data: { status: Status.Active },
        })
      })
    })
    cy.queryForUpdateRecurse({
      request: SearchApprovedPostalsDocument,
      operationName: 'searchApprovedPostals',
      key: '0',
      value: 'ACTIVE',
      key2: 'status',
    })
    events.visitMyEvents()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    events.getTagByStatus('Accepting Invites').should('exist')
    cy.contains('button', 'Clear filters').click()
    cy.wait(300)
    cy.contains('a', 'Super-duperEdited-CLONE').click()
    universal.getSpinner().should('not.exist')
    //tests that all of the edits made it into the approoved cloned even
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.findAllByTestId('EventBannerImage').should('have.length', 1)
    cy.contains('[data-testid="ui-card"]', 'Super-duperEdited-CLONE').within(() => {
      cy.contains(eventdescription).should('exist')
      cy.contains('0 of 20 participantshave accepted').should('exist')
    })
    events.getMeetingLinkInfo().should('contain', 'http://www.microsoft.com')
    events.getAvailableTeamsInfo().should('contain', 'Jersey')
    universal.getNoItemsMessage()
    //set up for testing that for when email Notifications are selected they show up in the review
    cy.wait(500)
    events.getEditThisEventButton().click({ force: true })
    events.getEditDrawerByName('Super-duperEdited-CLONE').within(() => {
      universal.getCloseButtonByLabelText().scrollIntoView()
      events.getSendEmailConfirmationCheckbox().scrollIntoView()
      events.getSendEmailConfirmationCheckbox().check({ force: true }).should('be.checked')
      events.getSendReminderDayOfCheckbox().check({ force: true }).should('be.checked')
      events.getSendCancelledAlertCheckbox().check({ force: true }).should('be.checked')
      events.getSendReminderDayBeforeCheckbox().check({ force: true }).should('be.checked')
      events.getSendEmailConfirmationCheckbox().check({ force: true }).should('be.checked')
      events.getSendInviteExpiringAlertCheckbox().check({ force: true }).should('be.checked')
      events.getSendMeetingLinkChangedCheckbox().check({ force: true }).should('be.checked')
      events.getSendDateTimeChangedCheckbox().check({ force: true }).should('be.checked')
      events.getSendEventKitShippedAlertCheckbox().check({ force: true }).should('be.checked')
      events.getSendEventKitDeliveredAlertCheckbox().check({ force: true }).should('be.checked')
      events.getSaveThisEventButton().click()
    })
    events.getEditDrawerByName('Super-duperEdited-CLONE').should('not.exist')
    //tests creating a magicLink with an event
    events.visitMyEvents()
    universal.waitForSpinner()
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    cy.contains(/^Super-duperEdited$/)
      .parents('a')
      .click({ force: true })
    universal.getSpinner().should('not.exist')
    cy.wait(800)
    universal.progressBarZero()
    events.getEllipsesButton().click({ force: true })
    cy.wait(200)
    events.getCreateMagicLinkButton().click({ force: true })
    const landingPageMessage = faker.lorem.paragraph(1)
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.wait(300)
    sendItem.getEventLandingPageMessageInput().fill(landingPageMessage)
    sendItem.getLandingPageFormFieldsSection().within(() => {
      const fields2 = [
        'First Name',
        'Last Name',
        'Email Address',
        'Title',
        'Company',
        'What day?',
        'Best taco',
        'Taco toppings',
      ]
      fields2.forEach((field) => {
        sendItem.getCustomizeFieldsTagByName(field).should('exist')
      })
      sendItem.getCustomizeFieldsButton().click()
    })
    cy.wait(300)
    customFormFields.getCustomizeFormSettingsModal().within(() => {
      // add a text field and then save it
      customFormFields.getAddCustomFieldTextButton().click()
      customFormFields.getNewCustomFieldQuestion().type('A Thing?')
      customFormFields.getNewCustomFieldIsRequiredSwitch().check({ force: true })
      customFormFields.getSaveCustomFieldButton().click()
      customFormFields.getAddedTextFieldByLabel('A Thing?').should('exist')
      customFormFields.getApplyFormSettingsButton().click()
    })
    customFormFields.getCustomizeFormSettingsModal().should('not.exist')
    sendItem.getLandingPageFormFieldsSection().within(() => {
      sendItem.getCustomizeFieldsTagByName('Taco toppings').should('exist')
      sendItem.getCustomizeFieldsTagByName('A Thing?').should('exist')
    })
    magicLinks.getEnabledCheckbox().should('be.checked')
    magicLinks.getMagicLinkNameInput().should('have.value', 'Super-duperEdited')
    magicLinks.getOrderLimitInput().should('have.value', '1')
    magicLinks.getExpiresOnInput().should('have.value', '')
    sendItem.getReviewSendAsSection().should('exist')
    sendItem.getSelectAnOptionHeading().should('exist')
    sendItem.getReviewButton().click()
    cy.contains('Super-duperEdited').should('exist')
    cy.contains(events.variantOneText())
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    cy.contains('Event Message').should('not.exist')
    sendItem.getReviewLandingPageMessage().should('contain', landingPageMessage)
    cy.contains('Number of Contacts').should('not.exist')
    sendItem.getReviewSendAsSection().should('not.exist')
    magicLinks.getReviewStatus().contains('Enabled')
    magicLinks.getReviewMagicLinkName().contains('Super-duperEdited')
    magicLinks.getReviewOrderLimit().contains('1')
    magicLinks.getReviewExpiresOn().contains('Never')
    sendItem.getReviewItemCosts().should('not.contain', '$0.00')
    sendItem.getReviewEstimatedVendorSalesTax().should('not.contain', '$0.00')
    sendItem.getReviewTransactionFee().should('not.exist')
    sendItem.getReviewShippingAndPostage().should('not.exist')
    cy.contains('div', 'Cost Per Item').parent('div').scrollIntoView()
    cy.contains('div', 'Cost Per Item')
      .parent('div')
      .should('be.visible')
      .and('not.contain', '$0.00')
    sendItem.getReviewEventNotifications().should('not.exist')
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(win.prompt)
    })
    magicLinks.getSaveMagicLinkButton().click()
    sendItem.getConfirmSendModal().within(() => {
      magicLinks.getSaveMagicLinkButton().click()
    })
    sendItem.getConfirmSendModal().should('not.exist')
    magicLinks.visitMagicLinks()
    cy.wait(600)
    cy.get('body').then(($body) => {
      if (!$body.text().includes(`Super-duperEdited`)) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.getRowByText('Super-duperEdited').should('exist')
    universal.getSpinner().should('not.exist')
    onlyOn(Cypress.env('testUrl'), () => {
      universal.getRowByNumber(0).find('a').should('have.length', 2)
      universal
        .getRowByNumber(0)
        .find('button')
        .then(($link: any) => {
          delivery.visit($link.attr('title'))
        })
      cy.url().should('contain', '/delivery/link/')
      //test rendering of the events magiclink landing page
      cy.findByText(`Super-duper Fun Event`, { timeout: 75000 }).should('be.visible')
      cy.contains(`${format(addWeeks(new Date(), 1), 'MMM d, yyyy')}`)
      //event description
      cy.contains(eventdescription)
      cy.findByText(landingPageMessage).should('exist')
      events.getUneditedEventDuration().should('exist')
      events.getJoinInfo().should('exist')
      cy.contains(`${format(addWeeks(new Date(), 1), 'MMM d, yyyy')}, 9:00 AM`)
      events.getLandingPageDeadlineInfo().within(() => {
        cy.contains(`${format(addDays(addWeeks(new Date(), 1), 3), 'MMM d, yyyy')}`)
      })
      events.getLandingPageIncludedInfo().within(() => {
        // cy.findByText(events.variantOneText())
        // events.getVariantOneDescription().should('exist')
      })
      //tests Your Details
      cy.findByText('Contact details').should('exist')
      delivery
        .getDetailsFirstNameInput()
        .getInputValidation('Please fill out this field.')
        .type('Daniel')
      delivery
        .getDetailsLastNameInput()
        .getInputValidation('Please fill out this field.')
        .type('Davis')
      delivery
        .getDetailsEmailInput()
        .getInputValidation('Please fill out this field.')
        .type('hey.now.1225ae@postal.dev')
      delivery
        .getDetailsWhatDayInput()
        .getInputValidation('Please fill out this field.')
        .type(dateFormatYearFirst(addWeeks(addDays(new Date(), 1), 1)))
      delivery
        .getDetailsBestTacoSelect()
        .getInputValidation('Please select an item in the list.')
        .select('Carne asada')
      delivery.getTitleInput().fill('Yoga Trainer')
      delivery.getDetailsCompanyInput().fill('Yoga Impact')
      delivery.getDetailsAThingInput().fill('Just This')
      delivery.getDetailsCheeseCheckbox().click({ force: true })
      delivery.getShippingAddressButton().click()
      delivery.getAddDetailsButton().click({ force: true })
      delivery.getShippingDrawer().within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        delivery.getStreetAddress1Input().fill('3133 Upper Lopez Canyon Road')
        delivery.getCityInput().fill('Arroyo Grande')
        //delivery.getStateInputRegEx('California')
        delivery.getPostalCodeInput().type('93420')
        cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
        universal.getSaveButton().click()
      })
      delivery.getUseVerifiedButton().click({ force: true })
      delivery.getVerifyAddressDrawer().should('not.exist')
      delivery.getSubmitButton().click()
      cy.contains(/YOU'RE REGISTERED!/i).should('exist')

      //tests the two attendees in reporting
      reporting.visitOrderReports()
      universal.getSpinner().should('not.exist')
      universal.progressBarZero()
      cy.wait(400)
      cy.get('body').then(($body) => {
        if ($body.text().includes('unexpected error')) {
          cy.reload()
          universal.getSpinner().should('not.exist')
          universal.progressBarZero()
        }
      })
      universal.getRowsInATableBody().should('have.length', 2)
      universal.getRowByText('Daniel Davis').should('contain', 'Super-duperEdited')
      universal.getRowByText('Marilla Plunk').should('exist')
      //tests the rendering of an Order Report with the Your Details form
      cy.findAllByText('Super-duperEdited - Variant 1').eq(0).click()
      universal.getViewOrderModal()
      cy.findByText('Form Values')
      universal.getRowByText('Question').should('contain', 'Answer')
      universal
        .getRowByText('What day?')
        .should('contain', `${dateFormatYearFirst(addWeeks(addDays(new Date(), 1), 1))}`)
      universal.getRowByText('Best taco').should('contain', 'Carne asada')
      universal.getRowByText('Taco toppings').should('contain', 'Cheese')
      universal.getRowByText('A Thing?').should('contain', 'Just This')
      //tests the two attendees in the event
      events.visitMyEvents()
      universal.waitForSpinner()
      cy.wait(300)
      cy.contains(/^Super-duperEdited$/i)
        .parents('a')
        .click({ force: true })
      universal.getSpinner().should('not.exist')
      universal.getRowsInATableBody().should('have.length', 2)
      universal.getRowByText('Daniel Davis').should('contain', 'MagicLink')
      universal.getRowByText('Marilla Plunk').within(() => {
        universal.getLinkByText('Email').should('exist')
      })
      universal.getLinkByText('Marilla Plunk').click()
      universal.progressBarZero()
      universal.getLinkByText('Super-duperEdited').click()
      //tests the view order modal for an event
      cy.contains(/^Super-duperEdited$/).should('exist')
      cy.contains('Processing').should('exist')
      cy.wait(500)

      //tests that when email Notifications are selected they show up in the review page
      events.visitMyEvents()
      universal.getSpinner().should('not.exist')
      cy.contains('a', 'Super-duperEdited-CLONE').click({ force: true })
      cy.wait(300)
      events.getSendThisEventButton().click({ force: true })
      cy.url().should('contain', '/send/configuration')
      //send event tab button
      events.getSendThisEventButton().click({ force: true })
      cy.url().should('contain', '/send/select_contacts')

      cy.clickCheckbox({ name: 'Marilla' })
      sendItem.getConfigureYourItemButton().click()
      sendItem.getEventEmailInput().fill(faker.lorem.paragraph(1))
      sendItem.getReviewButton().click()
      sendItem.getReviewEventNotifications().should('exist')
      sendItem.getReviewEventNotificationTagByName('Confirmation Email')
      sendItem.getReviewEventNotificationTagByName('Reminder - Day Before')
      sendItem.getReviewEventNotificationTagByName('Reminder - Day of')
      sendItem.getReviewEventNotificationTagByName('Event Cancelled Alert')
      sendItem.getReviewEventNotificationTagByName('Event Expiring Alert')
      sendItem.getReviewEventNotificationTagByName('Meeting Link Update Alert')
      sendItem.getReviewEventNotificationTagByName('Date/Time Update Alert')
      sendItem.getReviewEventNotificationTagByName('Event Kit Shipped Alert')
      sendItem.getReviewEventNotificationTagByName('Event Kit Delivered Alert')
    })
    //tests that when the always gift email setting is selected the add attendees button will not show up
    emailSettings.visitGiftEmails()
    cy.url().should('contain', '/account/personalized-emails')
    emailSettings.getEnableGiftEmailsGroup().should('be.visible')
    emailSettings.getAlwaysButton().find('input').click({ force: true })
    emailSettings.getAlwaysButton().should('contain.html', 'svg')
    cy.wait(300)
    //emailSettings.getSettingsUpdatedAlert()
    events.visitMyEvents()
    cy.contains('a', 'Super-duperEdited-CLONE').click()
    events.getEditThisEventButton().should('be.visible')
    events.getAddAttendeesButton().should('not.exist')
    //tests host fee rendering
    events.visitEvents()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('My Events')) {
        cy.wait(300)
        cy.reload()
      }
    })
    events.getSuperDuperFunEvent().should('exist')
    cy.contains('a', 'Super-duper Fun Event').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Super-duper Fun Event').click({ force: true })
      }
    })
    universal.getSpinner().should('not.exist')
    //tests rendering of host fee
    events.getPhoneInput().type('904-226-2462')
    events.getMessageInput().fill('flat-fee message')
    events
      .getPreferredDate1Input()
      .type(`${weekFromToday} 9:00 AM{enter}`, { force: true, delay: 100 })
    events
      .getPreferredDate2Input()
      .type(`${weekNADayFromToday} 9:00 AM{enter}`, { force: true, delay: 100 })
    events.getAgreeToTermsCheckbox().check({ force: true })
    events.getAgreeToTermsCheckbox().should('be.checked')
    events.getSelectAnOptionButton().should('exist').click()
    // eslint-disable-next-line
    cy.getAllUnselectedVariants()
      .eq(2)
      .realHover()
      .within(() => {
        cy.contains('host fee').should('exist')
      })
    cy.findByText('This variant has a fancy low flat-fee.').should('exist')
    cy.wait(1000)
    // eslint-disable-next-line
    cy.getAllUnselectedVariants().eq(0).click({ force: true })
    // eslint-disable-next-line
    cy.getAllUnselectedVariants().eq(1).click({ force: true })
    events.getBookYourEventButton().click({ force: true })
    events.getBookedEventModal().within(() => {
      universal.getLinkByText('temporary event').should('be.visible')
      events.getBookedEventModalText().should('be.visible')
      universal.getCloseButton().click()
    })
    //tests host fee does not render in the Pending Confirmation event page
    cy.contains('flat-fee message').should('exist')
    cy.contains('host fee').should('not.exist')
    events.getOptionInfo().within(() => {
      cy.contains('Selected Option').should('exist')
    })
    cy.contains('Variant 3').should('exist')
    cy.wait('@createApprovedPostal').then((res) => {
      cy.url().should('include', '/events/postals')
      cy.approveEvent(res.response?.body.data.createApprovedPostal.postal.id).then((res) => {
        expect(res.event.status).to.eq('ACCEPTING_INVITES')
        cy.graphqlRequest(UpdateApprovedPostalDocument, {
          id: res.id,
          data: { status: Status.Active },
        })
      })
    })
    cy.queryForUpdateRecurse({
      request: SearchApprovedPostalsDocument,
      operationName: 'searchApprovedPostals',
      key: '0',
      value: 'ACTIVE',
      key2: 'status',
    })
    events.visitMyEvents()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Super-duper Fun Event')) {
        cy.wait(44000)
        cy.reload()
      }
    })
    cy.wait(300)
    cy.contains('a', 'Super-duper Fun Event').should('be.visible')
    cy.contains('a', 'Super-duper Fun Event').click({ force: true })
    universal.getSpinner().should('not.exist')
    //tests the host fee does not render in the 'Accepting Invites' state of a events page
    cy.contains('host fee').should('not.exist')
    events.getOptionInfo().within(() => {
      cy.contains('Selected Option').should('exist')
    })
    cy.contains('Variant 3').should('exist')
    //tests the host fee does not render in the Send Invite workflow
    cy.wait(300)
    events.getSendThisEventButton().click({ force: true })
    cy.url().should('contain', '/send/configuration')
    //send event tab button
    events.getSendThisEventButton().click({ force: true })
    cy.url().should('contain', '/send/select_contacts')

    cy.clickCheckbox({ name: 'Marilla' })
    sendItem.getConfigureYourItemButton().click()
    cy.contains('1 Recipient').should('exist')
    sendItem.getEventEmailInput().fill('Welcome to the Host Fee Event!')
    cy.contains('Variant 3').should('exist')
    sendItem.getSendAsSelect().should('exist')
    // sendItem.getSpendAsCard().within(() => {
    //   cy.contains(`${user.userName}`).should('exist')
    // })
    sendItem.getReviewButton().click()
    sendItem.getReviewSendAsSection().should('not.exist')
    cy.contains('host fee').should('not.exist')
    //total: $0.00
  })
})
