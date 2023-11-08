export default class Events {
  //visit
  visitEvents() {
    return cy.visit('/events/marketplace', {
      timeout: 380000,
      retryOnNetworkFailure: true,
      headers: {
        'Accept-Encoding': 'gzip, deflate',
      },
    })
  }
  visitMyEvents() {
    return cy.visit('/events/postals')
  }
  //tabs
  getMyEventsTab() {
    return cy.findByRole('checkbox', { name: 'My Events' })
  }
  getSuperDuperFunEvent() {
    return cy.contains('[data-testid="ui-card"]', 'Super-duper Fun Event', { timeout: 90000 })
  }

  getEventByName(name: string | RegExp) {
    return cy.contains('[data-testid="ui-card"]', name).find('img')
  }

  //inputs
  getNameInput() {
    return cy.findByLabelText('Name*')
  }
  getEmailInput() {
    return cy.findByLabelText('Email*')
  }
  getPhoneInput() {
    return cy.findByLabelText('Phone*')
  }
  getMessageInput() {
    return cy.findByLabelText('Message*')
  }
  getPreferredDate1Input() {
    return cy.findAllByPlaceholderText('First choice').eq(1)
  }
  getPreferredDate2Input() {
    return cy.findAllByPlaceholderText('Second choice').eq(1)
  }
  getPreferredDate3Input() {
    return cy.findAllByPlaceholderText('Third choice (optional)').eq(1)
  }
  getNameEditInput() {
    return cy.findByRole('textbox', { name: 'Name' })
  }
  getMeetingLinkEditInput() {
    return cy.findByRole('textbox', { name: 'Meeting/Event Access Link or Location' })
  }
  getMaxAttendeesEditInput() {
    return cy.findByRole('spinbutton', { name: 'Maximum Attendees' })
  }
  getDescriptionEditInput() {
    return cy.findByRole('textbox', { name: 'Description' })
  }
  getEstimatedAttendeesInput() {
    return cy.contains('div', 'Estimated Attendees').find('input')
  }
  getLandPageMessageInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_BodyText_Input')
  }
  getEmailSubjectLineInput() {
    this.getEmailSubjectLineGroup().within(() => {
      cy.findByRole('textbox').as('emailSubjectLineInput')
    })
    return cy.get('@emailSubjectLineInput')
  }
  getEmailBodyInput() {
    this.getEmailBodyGroup().within(() => {
      cy.findByRole('textbox').as('emailBodyInput')
    })
    return cy.get('@emailBodyInput')
  }

  //checkboxes
  getSendEmailConfirmationCheckbox() {
    return cy.contains('div', 'Send Email Confirmation').find('input')
  }
  getSendInviteExpiringAlertCheckbox() {
    return cy.contains('div', 'Send Invite Expiring Alert').find('input')
  }
  getSendReminderDayBeforeCheckbox() {
    return cy.contains('div', 'Send Reminder Day Before').find('input')
  }
  getSendCancelledAlertCheckbox() {
    return cy.contains('div', 'Send Cancellation Alert').find('input')
  }
  getSendReminderDayOfCheckbox() {
    return cy.contains('div', 'Send Reminder Day Of').find('input')
  }
  getSendMeetingLinkChangedCheckbox() {
    return cy.contains('div', 'Send Meeting Link Changed').find('input')
  }
  getSendDateTimeChangedCheckbox() {
    return cy.contains('div', 'Send Date/Time Changed').find('input')
  }
  getSendEventKitShippedAlertCheckbox() {
    return cy.contains('div', 'Send Event Kit Shipped Alert').find('input')
  }
  getSendEventKitDeliveredAlertCheckbox() {
    return cy.contains('div', 'Send Event Kit Delivered Alert').find('input')
  }
  getAgreeToTermsCheckbox() {
    return cy.findByRole('checkbox', { name: 'I agree to the Postal Events Terms & Conditions' })
  }
  //buttons
  getGoToTheMarketplaceButton() {
    return cy.findByRole('button', { name: 'Go to the Marketplace' })
  }
  getBookYourEventButton() {
    return cy.findByRole('button', { name: 'Book Your Event' })
  }
  getBackToMyEventsButton() {
    return cy.findByRole('button', { name: 'Back to My Events' })
  }
  getEditThisEventButton() {
    return cy.findByRole('button', { name: 'Edit Event' })
  }
  getSendThisEventButton() {
    return cy.findByRole('button', { name: 'Send Invitations' })
  }
  getCreateMagicLinkButton() {
    return cy.findByRole('menuitem', { name: 'Create a MagicLink' })
  }
  getEllipsesButton() {
    return cy.findByTestId('SecondaryNavbar_actionMenu')
  }
  getSaveThisEventButton() {
    return cy.findByRole('button', { name: 'Save This Event' })
  }
  getCloneEventButton() {
    return cy.findByRole('button', { name: 'Clone Event' })
  }
  getExportButton() {
    return cy.findByRole('button', { name: 'Export' })
  }
  getEditImagesButton() {
    return cy.findByRole('button', { name: 'Edit Images', timeout: 34000 })
  }
  getSaveImagesButton() {
    return cy.findByRole('button', { name: 'Save Images' })
  }
  getAllDeleteImages() {
    return cy.findAllByRole('button', { name: 'Delete Image' })
  }
  getAddToCalendarButton() {
    return cy.findByRole('button', { name: 'Add to your calendar' })
  }
  getCustomizeFormFieldsButton() {
    return cy.contains('a', 'Customize Form Fields')
  }

  getDragHandle(name: string) {
    return cy.findByTestId(`handle-${name}`)
  }
  getBackButton() {
    return cy.findByRole('button', { name: 'Back' })
  }
  getEmailVariablesButton() {
    return cy.findByRole('button', { name: 'Email Variables' })
  }
  getEventConfirmationButton() {
    return cy.findByRole('button', { name: 'Event Confirmation' })
  }
  getReminderDayBeforeButton() {
    return cy.findByRole('button', { name: 'Reminder Day Before' })
  }
  getReminderDayOfButton() {
    return cy.findByRole('button', { name: 'Reminder Day Of' })
  }
  getCancellationAlertButton() {
    return cy.findByRole('button', { name: 'Cancellation Alert' })
  }
  getDateTimeChangeButton() {
    return cy.findByRole('button', { name: 'Date/Time Change' })
  }
  getMeetingLinkChangeButton() {
    return cy.findByRole('button', { name: 'Meeting Link Change' })
  }
  getSetDefaultButton() {
    return cy.findByRole('button', { name: 'Set Default' })
  }
  getAddAttendeesButton() {
    return cy.findByRole('menuitem', { name: 'Add Attendees' })
  }
  getApplyChangesButton() {
    return cy.findByRole('button', { name: 'Apply Changes' })
  }
  getCustomizeEmailMessagingButton() {
    return cy.contains('a', 'Customize Email Messaging')
  }
  //modals
  getRemoveImageModal() {
    return cy.findByRole('alertdialog', { name: 'Remove Image' })
  }
  getCloneEventModal() {
    return cy.findByRole('alertdialog', { name: 'Clone Event' })
  }
  getBookedEventModal() {
    return cy.findByRole('dialog', { name: 'Thanks for reaching out!' })
  }
  getCustomizeEmailMessagingModal() {
    return cy.findByRole('dialog', { name: 'Customize Email Messaging' })
  }
  getBookedEventModalText() {
    return cy.findByText(
      'Once approved, we will activate the event and you are then free to add a meeting link and invite people.'
    )
  }
  getEmailVariablesModal() {
    return cy.findByRole('dialog', { name: 'Personalize Your Email with Variables' })
  }
  //menuItems
  getCloneEventMenuItem() {
    return cy.findByRole('menuitem', { name: 'Clone Event' })
  }
  getSendEventMenuItem() {
    return cy.findByRole('menuitem', { name: 'Send an Invite' })
  }
  getEditEventButton() {
    return cy.findByRole('button', { name: 'Edit Event' })
  }
  getCreateMagicLinkMenuItem() {
    return cy.findByRole('menuitem', { name: 'Create a MagicLink' })
  }
  getRequestCancellationMenuItem() {
    return cy.findByRole('menuitem', { name: 'Request Cancellation' })
  }
  getGoogleMenuItem() {
    return cy.findByRole('menuitem', { name: 'Google' })
  }
  getOutlookLiveMenuItem() {
    return cy.findByRole('menuitem', { name: /outlook live/i })
  }
  getOffic365MenuItem() {
    return cy.findByRole('menuitem', { name: 'Office 365' })
  }
  getCalendarFileMenuItem() {
    return cy.findByRole('menuitem', { name: /Download calendar file/i })
  }
  getSelectAnOptionButton() {
    return cy.findByRole('button', { name: 'Select an Option' })
  }
  //tags
  getTagByStatus(status: string) {
    return cy.contains('[data-testid="ui-tag"]', status)
  }
  //drawers
  getEditDrawerByName(name: string) {
    return cy.findByRole('alertdialog', { name: name })
  }
  //tooltips and tooltip text
  getNameTooltip() {
    return cy.findByTestId('event-name').find('svg')
    // return cy.contains('label', 'Name').find('svg')
  }
  getNameTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'This name is included in your event invites and in the calendar hold',
    })
  }
  getMeetingLinkTooltip() {
    return cy.contains('label', 'Meeting/Event Access Link or Location').find('svg')
  }
  getMeetingLinkTooltipText() {
    return cy.findByRole('tooltip', { name: /The link to your virtual meeting/ })
  }
  getMaximumAttendeesTooltip() {
    return cy.contains('label', 'Maximum Attendees').find('svg')
  }
  getMaximumAttendeesTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'You may limit the total number of attendees allowed',
    })
  }
  getTeamsTooltip() {
    return cy.contains('label', 'Teams').find('svg')
  }
  getTeamsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'You can restrict sending invitations to certain teams',
    })
  }
  getDescriptionTooltip() {
    return cy.contains('label', 'Description').find('svg')
  }
  getDescriptionTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'This description will be shown on the invitation landing page',
    })
  }
  getEmailNotificationsTooltip() {
    return cy.contains('Email Notifications').find('svg')
  }
  getEmailNotificationsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Enable or disable event notification emails',
    })
  }
  getDateAndTimeTooltip() {
    return cy.contains('Choose your preferred dates and time').find('svg')
  }
  getDateAndTimeTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'We will do our best to accommodate your preference. We will reach out to you within 2 business days to confirm the exact date and time of your event.',
    })
  }
  getEstimatedAttendeesTooltip() {
    return cy.contains('Estimated Attendees').find('svg')
  }
  getEstimatedAttendeesTooltipText() {
    return cy.findByRole('tooltip', {
      name: '10 minimum and 100 maximum attendees for this event.',
    })
  }
  getEstimatedCostTooltip() {
    return cy.contains('Estimated Cost').find('svg')
  }
  getEstimatedCostTooltipText() {
    return cy.contains('[role="tooltip"]', 'per attendee.')
  }
  //tables
  getContactsTable() {
    return cy.findByRole('table')
  }
  //Info
  getEstimatedCosts() {
    return cy.contains('div', 'Estimated Cost')
  }
  getEventInformation() {
    return cy.contains('div', /Event Information/i)
  }
  getOptionInfo() {
    return cy.contains('div', 'Option')
  }
  getMeetingLinkInfo() {
    return cy.contains('div', 'Meeting Link')
  }
  getAvailableTeamsInfo() {
    return cy.contains('div', 'Available Teams')
  }
  getRequestInfo() {
    return cy.contains('div', 'Request Info')
  }
  getRequestedAttendeesInfo() {
    return cy.contains('div', 'Requested Attendees')
  }
  getRequestedDatesInfo() {
    return cy.contains('div', 'Requested Dates')
  }
  getRequestedMessageInfo() {
    return cy.contains('div', 'Requested Message')
  }
  getAttendeesCard() {
    return cy.contains('[data-testid="ui-card"]', 'Attendees')
  }
  getEditImagesBanner() {
    return cy.findByRole('main')
  }
  //text elements and text
  messageText() {
    return 'Fish tacos with cabbage slaw and a side of chips and guac. Carne asada on corn tortillas. It’s raining tacos, from out of the sky, tacos, don’t even ask why. Carne asada on corn tortillas. Can you put some peppers and onions on that?'
  }
  getUneditedEventDescription() {
    return cy.findByText('This is the best event in town!')
  }
  getUneditedEventDuration() {
    return cy.findByText('90 minutes')
  }
  getJoinInfo() {
    return cy.findByText(/Join from your Computer, Phone, or Tablet/i)
  }
  getVariantOneDescription() {
    return cy.contains('This is the best variant. All the other variants')
  }
  getContactsTableHeaderText() {
    return 'CONTACTINVITE ACCEP.TYPESTATUS'
  }
  getRemoveImageModalText() {
    return cy.findByText('Are you sure you want to delete this image?')
  }
  getCloneEventModalText() {
    return cy.contains(
      'This action will make a DRAFT copy of Super-duperEdited with the same settings. Do you want to continue?'
    )
  }
  getLandingPageDurationInfo() {
    return cy.contains('div', /Duration/i)
  }
  getLandingPageRequirementsInfo() {
    return cy.contains('div', /requirements/i)
  }
  getLandingPageDateTimeInfo() {
    return cy.contains('div', /DATE & TIME/i)
  }
  getLandingPageDeadlineInfo() {
    return cy.contains('div', /Registration Deadline/i)
  }
  getLandingPageIncludedInfo() {
    return cy.contains('div', /what's included/i)
  }
  variantOneText() {
    return 'Variant 1'
  }
  getThankYouForRegistrationText() {
    return cy.findByText('Thank you for your registration!', { timeout: 34000 })
  }
  getConfirmationInfoText() {
    return cy.findByText(
      'Thanks for confirming. You can access the meeting link and the calendar invite below. You’ll receive a confirmation email with this information, as well as reminders leading up to the event.'
    )
  }
  getNoEventsText() {
    return cy.contains('No Events were found.', { timeout: 40000 })
  }
  getSetUpText() {
    return cy.contains(
      'You will be able to add Attendees once you add a meeting link, custom message, and approve the event.'
    )
  }
  //links
  getSetupEventLink() {
    return cy.contains('a', 'Setup Event')
  }
  getPostalioEventsTermsConditionsLink() {
    return cy.findByRole('link', { name: 'Postal Events Terms & Conditions' })
  }
  //alerts
  getCopiedEventDateToClipboardAlert() {
    return cy.getAlert({ message: 'Copied {{eventDate}} to clipboard', close: 'close' })
  }
  //groups
  getEmailSubjectLineGroup() {
    return cy.contains('[role="group"]', 'Email Subject Line')
  }
  getEmailBodyGroup() {
    return cy.contains('[role="group"]', 'Email Body')
  }
  //testids
  getEmailPreviewDiv() {
    return cy.findByTestId('CustomizeEmailMessaging_emailPreview')
  }
  //iframe
  getIFrameBody() {
    return cy.get('iframe').its('0.contentDocument').should('exist').its('body', { timeout: 38000 })
  }
}
