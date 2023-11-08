import { faker } from '@faker-js/faker'
import { userFactory } from '../../support/factories'
import {
  Contacts,
  EmailSettings,
  MeetingSettings,
  Profile,
  SendItem,
  Universal,
} from '../../support/pageObjects'

describe('Meeting Settings Testing', function () {
  const contacts = new Contacts()
  const emailSettings = new EmailSettings()
  const profile = new Profile()
  const meetingSettings = new MeetingSettings()
  const sendItem = new SendItem()
  const universal = new Universal()

  beforeEach(() => {
    const user = userFactory()
    cy.signup(user)
    cy.createApprovedPostal({ name: 'Def Leppard T-Shirt' })
    cy.createAContact({})
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBudgetRemaining') {
        req.alias = 'getBudgetRemaining'
      }
    })
    cy.login(user)
    cy.filterLocalStorage('postal:filters:contacts')
    cy.filterLocalStorage('postal:contacts:filter')
  })

  it(`tests the initial disabled state of meeting settings page`, function () {
    //tests the meeting settings sidebar link
    profile.visitProfile()
    cy.wait(800)
    meetingSettings.getMeetingSettingsLink().should('be.visible')
    meetingSettings.getMeetingSettingsLink().and('not.have.attr', 'aria-current', 'page')
    meetingSettings.getMeetingSettingsLink().click()
    meetingSettings
      .getMeetingSettingsLink()
      .should('be.visible')
      .and('have.attr', 'aria-current', 'page')

    //tests the Choose Your Scheduling Method Page
    cy.findByRole('heading', { name: 'Choose Your Scheduling Method' }).should('be.visible')
    universal.getUISpinner().should('not.exist')
    //tests the google button
    meetingSettings.getGoogleButton().click()
    cy.intercept(`/engage/api/oath-preconnect/google_email?*`, 'ok').as('google')
    meetingSettings
      .getConnnectToGoogleModal()
      .should('exist')
      .within(() => {
        meetingSettings.getAuthorizationIsRequiredText().should('exist')
        meetingSettings.getConnectLink().click()
      })
    cy.wait('@google').then((resp) => {
      expect(resp.response?.body).to.include('ok')
    })

    //tests the microsoft button
    cy.wait(300)
    meetingSettings.visitMeetingSettings()
    cy.wait('@getBudgetRemaining')
    cy.wait('@getBudgetRemaining')
    meetingSettings.getMicrosoftButton().click()
    cy.intercept(`/engage/api/oath-preconnect/microsoft_email?*`, 'ok').as('microsoft')
    meetingSettings
      .getConnnectToMicrosoftModal()
      .should('exist')
      .within(() => {
        meetingSettings.getAuthorizationIsRequiredText().should('exist')
        meetingSettings.getConnectLink().click()
      })
    cy.wait('@microsoft').then((resp) => {
      expect(resp.response?.body).to.include('ok')
    })

    //tests the calendly button
    cy.wait(300)
    meetingSettings.visitMeetingSettings()
    universal.getSpinner().should('not.exist')
    cy.wait(300)
    meetingSettings.getCalendlyButton().should('exist').click()
    cy.wait(500)
    //tests calendly link tooltip and text
    meetingSettings
      .getCalendlyLinkTooltip()
      .should('be.visible')
      .realHover({ position: 'center', scrollBehavior: 'bottom' })
    meetingSettings.getCalendlyLinkTooltipText().should('exist')
    //tests that the correct inputs for Calendly exist, have validation, and are fillable
    meetingSettings
      .getCalendlyLinkInput()
      .getInputValidation('Please fill out this field.')
      .fill(faker.internet.url())
    meetingSettings
      .getMeetingRequestSelect()
      .select('REQUIRE_BEFORE')
      .find('option')
      .then((options: any) => {
        const actual = [...options].map((option) => option.value)
        expect(actual).to.deep.eq(['NO', 'REQUIRE_BEFORE', 'ASK_AFTER'])
        universal.getResetButton().should('exist')
        universal.getSaveButton().click()
        meetingSettings.getMeetingSettingsSavedAlert()
      })

    //tests the ChiliPiper button
    meetingSettings.visitMeetingSettings()
    universal.getSpinner().should('not.exist')
    meetingSettings.getChiliPiperButton().should('be.visible').click()
    //tests ChiliPiper link tooltip and text
    cy.wait(500)
    universal.getSpinner().should('not.exist')
    cy.contains('Calendly Link').should('have.length', '0')
    meetingSettings
      .getChiliPiperLinkTooltip()
      .should('be.visible')
      .realHover({ position: 'center', scrollBehavior: 'bottom' })
    meetingSettings.getChiliPiperLinkTooltipText().should('exist')
    //tests that the correct inputs for ChiliPiper exist, have validation, and are fillable
    meetingSettings
      .getChiliPiperLinkInput()
      .clear()
      .getInputValidation('Please fill out this field.')
      .fill(faker.internet.url())
    meetingSettings.getMeetingRequestSelect().select('ASK_AFTER')
    universal.getResetButton().should('exist')
    universal.getSaveButton().click()
    meetingSettings.getMeetingSettingsSavedAlert()

    //tests that if the user saves chili piper seetings then navigates away from meeting setting when the user to
    //returns to meetings setting the chili piper menu will be open
    profile.getEmailSettingsLink().click()
    emailSettings.getRecipientInformationCard().should('be.visible')
    profile.getMeetingSettingsLink().click()
    meetingSettings.getChiliPiperLinkInput().should('be.visible')

    //tests tooltip and tooltip text on active test settings page
    meetingSettings.getPostalButton().click()
    //tests remaining tooltips
    meetingSettings.getMeetingRequestsTooltip().realHover()
    cy.wait(200)
    meetingSettings.getMeetingRequestsTooltipText().should('be.visible')
    cy.wait(200)
    meetingSettings.getMeetingNameTooltip().realHover()
    cy.wait(200)
    meetingSettings.getMeetingNameTooltipText().should('be.visible')
    meetingSettings.getMeetingLinkTooltip().realHover()
    cy.wait(200)
    meetingSettings.getMeetingLinkTooltipText().should('be.visible')
    meetingSettings.getMeetingDurationTooltip().realHover()
    cy.wait(200)
    meetingSettings.getMeetingDurationTooltipText().should('be.visible')
    meetingSettings.getMaxDaysInTheFutureTooltip().realHover()
    cy.wait(200)
    meetingSettings.getMaxDaysInTheFutureTooltipText().should('be.visible')
    meetingSettings.getDayLeadTimeTooltip().realHover()
    cy.wait(200)
    meetingSettings.getDayLeadTimeTooltipText().should('be.visible')
    meetingSettings.getHourLeadTimeTooltip().realHover()
    cy.wait(200)
    meetingSettings.getHourLeadTimeTooltipText().should('be.visible')
    meetingSettings.getMeetingBufferMinutesTooltip().realHover()
    cy.wait(200)
    meetingSettings.getMeetingBufferMinutesTooltipText().should('be.visible')
    //tests disabled / enabled toggle
    meetingSettings.visitMeetingSettings()
    universal.getSpinner().should('not.exist')
    meetingSettings.getPostalButton().should('be.visible').click()
    universal.getSaveButton().should('exist')
    universal.getResetButton().should('exist')
    meetingSettings.getDisabledToggle().should('not.exist')
    meetingSettings.getEnabledToggle().find('input').click({ force: true })
    meetingSettings.getEnabledToggle().should('not.exist')
    meetingSettings.getDisabledToggle().should('exist')
    universal.getSaveButton().should('exist')
    universal.getResetButton().should('exist')
    //tests validation
    meetingSettings
      .getMeetingNameInput()
      .getInputValidation('Please fill out this field.')
      .fill(faker.word.words(2))
    meetingSettings
      .getMeetingLinkInput()
      .getInputValidation('Please fill out this field.')
      .fill(faker.internet.url())
    meetingSettings
      .getFromInput()
      .getInputValidation('Please fill out this field.')
      .type('12:00:00')
    meetingSettings.getToInput().getInputValidation('Please fill out this field.').type('12:59:00')
    universal.getSaveButton().click()
    cy.getAlert({ message: 'Please select at least one available day', close: 'close' })

    //tests reset button
    universal.getResetButton().click()
    meetingSettings.visitMeetingSettings()
    meetingSettings.getPostalButton().click()
    meetingSettings.getMeetingNameInput().should('be.empty')
    meetingSettings.getMeetingLinkInput().should('be.empty')
    meetingSettings.getFromInput().should('be.empty')
    meetingSettings.getToInput().should('be.empty')
    universal.getSaveButton().should('exist')
    universal.getResetButton().should('exist')
    meetingSettings.getEnabledToggle().should('exist')
    meetingSettings.getDisabledToggle().should('not.exist')

    //tests Saving the available Meeting Settings in a disabled state
    meetingSettings.getEnabledToggle().find('input').click({ force: true })
    meetingSettings.getDisabledToggle().should('exist')
    meetingSettings.getMeetingNameInput().fill(faker.word.words(2))
    meetingSettings.getMeetingLinkInput().fill(faker.internet.url())
    meetingSettings.getFromInput().type('12:00:00')
    meetingSettings.getToInput().type('12:59:00')
    meetingSettings.getMonCheckbox().click({ force: true }).should('be.checked')
    //universal.getSaveButton().click()
    // cy.getAlert({
    //   message: 'Your settings are saved. Please enable them before requesting meeting bookings.',
    //   close: 'close',
    // })

    //tests the adding and removing of available time blocks
    meetingSettings.getAllDeleteButtons().should('have.length', '1')
    meetingSettings.getAddATimeBlock().scrollIntoView().click({ force: true })
    meetingSettings.getAllDeleteButtons().should('have.length', '2')
    meetingSettings.getAllDeleteButtons().eq(0).click({ force: true })
    meetingSettings.getRemoveDateSet().within(() => {
      universal.getCloseButtonByLabelText().should('exist')
      universal.getCancelButton().should('exist')
      universal.getConfirmButton().should('be.visible').click()
    })
    meetingSettings.getAllDeleteButtons().should('have.length', '1')

    //tests Saving the Settings in Enabled mode
    meetingSettings.getDisabledToggle().find('input').click({ force: true })
    meetingSettings.getFromInput().type('12:00:00')
    meetingSettings.getToInput().type('12:59:00')
    meetingSettings.getMonCheckbox().click({ force: true }).should('be.checked')
    universal.getSaveButton().click()
    meetingSettings.getMeetingSettingsSavedAlert()
    universal.getResetButton().should('not.exist')
    universal.getSaveButton().should('not.exist')

    //tests that editing ad field re-appears the save and reset buttons
    meetingSettings.getMeetingNameInput().clear()
    universal.getResetButton().should('exist')
    universal.getSaveButton().should('exist')

    //send postal workflows for all types of meeting requests (No, before acceptance, and after acceptance)
    //on customize and review page check that the meeting request select and review section displays correct setting
    //ASK_AFTER set as default
    contacts.visitContacts()
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Verified')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendItemButton().click()
    cy.contains('a', 'Def Leppard T-Shirt').click()
    cy.wait(1500)
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(2))
    // cy.wait(500)
    // cy.contains('header', 'Meeting Request').find('svg').realHover()
    // meetingSettings.getMeetingRequestsTooltipText().should('be.visible')
    sendItem.getCustomizeMeetingRequestSelect().should('have.value', 'ASK_AFTER')
    sendItem.getReviewButton().click()
    universal.getSpinner().should('not.exist')
    sendItem.getSelectAnOptionHeading().should('not.exist')
    sendItem.getReviewMeetingRequest().should('contain', 'Ask After')
    //REQUIRE_BEFORE set as default
    meetingSettings.visitMeetingSettings()
    meetingSettings.getMeetingRequestSelect().select('REQUIRE_BEFORE')
    universal.getSaveButton().click()
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendItemButton().click()
    cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
      }
    })
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(2))
    sendItem.getCustomizeMeetingRequestSelect().should('have.value', 'REQUIRE_BEFORE')
    cy.contains(
      RegExp(
        'Insufficient Budget! Choose a way forward:' +
          '|' +
          'Insufficient Balance! Choose a way forward:'
      )
    ).should('exist')
    sendItem.getReviewButton().click()
    sendItem
      .getReviewContacts()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        universal.getAllUITags().should('have.length', 1)
      })
    sendItem.getReviewMeetingRequest().scrollIntoView().should('contain', 'Require Before')
    //No set as default
    meetingSettings.visitMeetingSettings()
    meetingSettings.getMeetingRequestSelect().select('NO')
    universal.getSaveButton().click()
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    universal.progressBarZero()
    cy.clickCheckboxByRowNumber({ num: 0 })
    contacts.getSendItemButton().click()
    cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
      }
    })
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(2))
    sendItem.getCustomizeMeetingRequestSelect().should('have.value', 'NO')
    sendItem.getReviewButton().click()
    sendItem.getSelectAnOptionHeading().should('not.exist')
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    //tests changing the the meeting settings test while in the send item workflow
    sendItem.getBackButton().eq(0).click({ force: true, multiple: true })
    sendItem.getReviewItemSection().should('not.exist')
    sendItem.getCustomizeMeetingRequestSelect().select('ASK_AFTER')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.wait(300)
        cy.reload()
        sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(2))
        sendItem.getCustomizeMeetingRequestSelect().select('ASK_AFTER')
      }
    })
    sendItem.getReviewButton().click()
    sendItem.getSelectAnOptionHeading().should('not.exist')
    sendItem.getReviewContacts().scrollIntoView().should('be.visible')
    sendItem.getReviewMeetingRequest().scrollIntoView().should('contain', 'Ask After')
    sendItem.getBackButton().eq(0).click({ force: true, multiple: true })
    sendItem.getReviewItemSection().should('not.exist')
    sendItem.getCustomizeMeetingRequestSelect().select('NO')
    sendItem.getReviewButton().click()
    sendItem.getSelectAnOptionHeading().should('not.exist')
    sendItem.getReviewMeetingRequest().should('contain', 'No')
    sendItem.getBackButton().eq(0).click({ force: true, multiple: true })
    sendItem.getReviewItemSection().should('not.exist')
    sendItem.getCustomizeMeetingRequestSelect().select('REQUIRE_BEFORE')
    sendItem.getReviewButton().click()
    sendItem.getSelectAnOptionHeading().should('not.exist')
    sendItem.getReviewMeetingRequest().should('contain', 'Require Before')
    meetingSettings.visitMeetingSettings()
    meetingSettings.getMeetingRequestSelect().should('have.value', 'NO')
  })
})
