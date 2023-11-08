export default class SendItem {
  getSelectContactsDrawer() {
    return cy.findByRole('dialog', { name: 'Select Contacts' })
  }
  getSelectItemDrawer() {
    cy.wait(1000)
    return cy.contains('[role="dialog"]', 'Select an Item')
    //return cy.findByRole('dialog', { name: 'Select an Item' })
  }
  getSelectAnOptionDrawer() {
    return cy.findByRole('dialog', { name: 'Select an Option' })
  }
  getCustomizeDrawer() {
    return cy.findByRole('dialog', { name: 'Configure your Item' })
  }
  getReviewButton() {
    return cy.findByRole('button', { name: 'Review' })
  }
  getReviewDrawer() {
    return cy.findByRole('dialog', { name: 'Review' })
  }
  getAddFundsDrawer() {
    return cy.findByRole('dialog', { name: 'Add Funds' })
  }
  getAddFundsModal() {
    return cy.contains('section', 'Add Funds')
  }
  getConfirmSendModal() {
    return cy.contains('section', RegExp('Confirm Send' + '|' + 'Confirm Duplicate'))
  }
  getConfirmDuplicateModal() {
    return cy.findByRole('alertdialog', { name: 'Confirm Duplicate' })
  }
  // generalizing this because the test it is used in is not meant to test backend processing
  // which is what determines the heading text of this modal
  // because backend processing can be finicky in the test env this might be a better approach
  getConfirmSendDuplicateModal() {
    return cy.contains('section', 'Confirm')
  }
  getCustomizeHeader() {
    return cy.contains('Configure your Item').should('exist')
  }
  getOldSubjectLineInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input')
  }
  getSubjectLineInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_SubjectLine_Input').find('.ProseMirror')
  }
  getSubjectLineFormHelper() {
    return cy.findByText(
      'Please keep in mind that the optimal length of an email subject line is 60 characters or less.'
    )
  }
  subjectLinePlaceholderText() {
    return /.* from .* has sent you something/
  }
  getGiftEmailMessageHeader() {
    return cy.findByText('Send a Personalized Email')
  }
  getGiftEmailMessageInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').find('.ProseMirror')
  }
  getOldGiftEmailMessageInput() {
    return cy.findByPlaceholderText(
      'This message will be included in the gift email sent to your contacts'
    )
  }
  getViewGiftEmailLink() {
    return cy.contains('button', 'Preview')
  }
  getViewedGiftEmailPopoverHeader() {
    return cy.contains('section', 'Gift Email')
  }
  getUserMessageHeader() {
    return cy.findByText('Message on User')
  }
  getUserMessageInput() {
    return cy
      .findByTestId('PostalCustomizeGiftEmail_textarea_physical_message')
      .find('.ProseMirror')
  }
  getVariantByText(type: string) {
    return cy.findByText(type)
  }
  getNextButton() {
    return cy.findByTestId('UiNavbarWizard_button_next')
  }
  clickNextButton() {
    this.getNextButton().click({ force: true })
    // the page transition seems to cause flake
    return cy.wait(600)
  }
  getHeaderNextButton() {
    return cy.contains('button', 'Next')
  }
  getExtensionNextButton() {
    return cy.contains('button', 'Review')
  }
  checkForBackButton() {
    //used this to assert the back button does not exist where it shouldn't
    return cy.findByRole('button', { name: 'Back' })
  }
  getOldBackButton() {
    return cy.findByRole('button', { name: 'Back' })
  }
  getBackButton() {
    return cy.findAllByTestId('atomic-subnavbar-left').find('button')
  }
  clickBackButton() {
    this.getBackButton().click({ force: true, multiple: true })
    // the page transition seems to cause flake
    return cy.wait(600)
  }
  getReviewItemSection() {
    return cy.findByTestId('PostalReview_item')
  }
  getReviewSubjectLineSection() {
    return cy.findByTestId('PostalReview_emailSubjectLine')
  }
  getReviewGiftMessageSection() {
    return cy.findByTestId('PostalReview_giftMessage')
  }
  getReviewLandingPageTitle() {
    return cy.findByTestId('PostalReview_landingPage_title')
  }
  getReviewLandingPageMessage() {
    return cy.findByTestId('PostalReview_landingPage_body')
  }
  getReviewLandingPageSection() {
    return cy.findByTestId('PostalReview_')
  }
  getReviewPhysicalMessageSection() {
    return cy.findByTestId('PostalReview_physicalMessage')
  }
  getReviewCampaignSection() {
    return cy.findByTestId('PostalReview_campaign')
  }
  getReviewPlaybookSection() {
    return cy.findByTestId('PostalReview_playbook')
  }
  getReviewMagicLinkSection() {
    return cy.contains('[data-testid="ui-card"]', 'MagicLink Details')
  }
  getReviewContactsSection() {
    return cy.findByTestId('PostalReview_contacts')
  }
  getReviewCostSection() {
    return cy.findByTestId('PostalReview_cost')
  }
  getReviewSendAsSection() {
    return cy.contains('div', 'Send As')
  }
  getReviewHeader() {
    return cy.findByRole('banner').should('contain', 'Review')
  }
  getReviewSubjectLine() {
    return cy.contains('div', 'Subject')
  }
  getReviewGiftEmailMessage() {
    return cy.contains('div', 'Gift Email')
  }
  getReviewEventMessage() {
    return cy.contains('h6', 'Event').parents('div')
  }
  getReviewPhysicalCard() {
    return cy.contains('div', 'Physical Card')
  }
  getReviewItem() {
    return cy.contains('div', 'Item Name').parent('div')
  }
  getSelectAnOptionHeading() {
    return cy.contains('Sending Options')
  }
  getReviewOption() {
    return cy.contains('div', 'Selected Option').parent('div')
  }
  getCustomizeMeetingRequestSelect() {
    return cy.contains('div', 'Meeting Request').find('select')
  }
  getReviewMeetingRequest() {
    return cy.contains('li', 'Meeting Request')
  }
  getOldReviewMeetingRequest() {
    return cy.contains('[data-testid="PostalReview_meetingRequest"]', 'Meeting Request')
  }
  getReviewContacts() {
    return cy.findByTestId('PostalReview_contacts')
  }
  getReviewContactsTableHeaderText() {
    return 'NameEmailTitleCompany'
  }
  getReviewItemCosts() {
    return cy.findByTestId('orderReviewCost').contains('div', 'Item Costs')
  }
  getReviewEstimatedVendorSalesTax() {
    return cy.findByTestId('orderReviewCost').contains('div', 'Sales Tax')
  }
  getReviewTransactionFee() {
    return cy.findByTestId('orderReviewCost').contains('div', 'Postal Transaction Fee')
  }
  getReviewShippingAndPostage() {
    return cy.findByTestId('orderReviewShipping')
  }
  getReviewEventNotifications() {
    return cy.contains('Email Notifications')
  }
  getReviewEventNotificationTagByName(name: string) {
    return cy.contains('[data-testid="ui-tag"]', name)
  }
  getReviewTotal() {
    return cy.contains('div', 'Total')
  }
  waitForReviewToLoad() {
    cy.findByText(/Add funds to (send Item|confirm Send)/).should('be.visible')
  }
  getAddFundsToSendItemButton() {
    return cy.findByText(/Add funds to send Item/)
  }
  getInsufficientFundsText() {
    return cy.contains('Insufficient Balance! Choose a way forward:')
  }
  getSwitchTeamsButton() {
    return cy.findAllByRole('button', { name: 'Switch Teams' })
  }
  getSaveAsDraftButton() {
    return cy.findAllByRole('button', { name: 'Save as Draft' })
  }
  getAddFundsToConfirmSendButton() {
    return cy.findByText(/Add Funds to confirm and Send/)
  }
  getAddFundsToSendItemButtonById() {
    return cy.findByTestId('PostalSend_button_review')
  }
  getAddFundsAmountInput() {
    return cy.findByLabelText('Add Funds')
  }
  getAddFundsButton() {
    return cy.findByRole('button', { name: 'Add Funds' })
  }
  getSendItemButton() {
    return cy.findByRole('button', { name: /Send Item/, timeout: 45000 })
  }
  getConfirmSendButton() {
    return cy.findByRole('button', { name: /Confirm Send/ })
  }
  getSendButton() {
    return cy.findByRole('button', { name: 'Send' })
  }
  getSendAgainButton() {
    return cy.findByRole('button', { name: 'Send Again' })
  }
  // generalizing this because the test it is used in is not meant to test backend processing
  // which is what determines the text of this button
  // because backend processing can be finicky in the test env this might be a better approach
  getSendNAgainButton() {
    return cy.contains('button', 'Send')
  }
  getSaveAndSendButton() {
    return cy.findByRole('button', { name: 'Confirm and Send', timeout: 80000 })
  }
  getConfirmSendModalText() {
    return cy.contains(
      'By clicking Send, I acknowledge that I have reviewed all of the information and I am ready to send.'
    )
  }
  getAdminShouldAddFundsText() {
    return cy.contains('Please contact your administrator to add funds.')
  }
  getSendAsSelect() {
    return cy.contains('div', 'Send As').find('select')
  }
  getDifferentItemLink() {
    return cy.contains('a', 'Select a different item')
  }
  getLandingPageFormFieldsSection() {
    return cy.contains('div', 'Form Fields').parent('div')
  }
  getLandingPageBodySection() {
    return cy.contains('h3', 'Landing Page').parent('div')
  }
  getCustomizeFieldsButton() {
    return cy.findByRole('button', { name: 'Customize Fields' })
  }
  getCustomizeFieldsTagByName(name: string) {
    return cy.contains('[data-testid="ui-tag"]', name)
  }
  //buttons
  getTeamButton() {
    return cy.findByRole('button')
  }

  getConfigureYourItemButton() {
    return cy.findByRole('button', { name: 'Configure your Item' })
  }
  getPersonalizedEmailButton() {
    return cy.findByRole('button', { name: 'Personalized Email' })
  }
  getDirectButton() {
    return cy.findByRole('button', { name: 'Direct' })
  }
  //cards
  getSendAsCard() {
    return cy.contains('div', 'Send As')
  }
  getSpendAsCard() {
    return cy.contains('div', 'Spend As')
  }
  getSpendFromCard() {
    return cy.contains('div', 'Spend From')
  }
  getRecipientNotifications() {
    return cy.contains('div', 'Recipient Notifications')
  }
  //tooltips and text
  getSendAsTooltip() {
    return cy.contains('label', 'Send As').find('svg')
  }
  getSendAsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'If sending as another user, the budget/balance will come from your account, but the from address and notifications will go to the specified user',
    })
  }
  getMeetingRequestTooltip() {
    return cy.contains('header', 'Meeting Request').find('svg')
  }
  getMeetingRequestTooltipText() {
    return cy.findByRole('tooltip').should('contain', 'The default setting for meeting requests,')
  }
  getSpendAsTooltip() {
    return cy.contains('div', 'Spend As').find('svg')
  }
  getSpendAsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'This order will live on the budget of the team and user selected.',
    })
  }
  //Info
  getSendAsInfo() {
    return cy.contains('li', 'Send As')
  }
  //Tabs
  getGiftEmailMessageTab() {
    return cy.findByRole('tab', { name: 'Gift Email Message' })
  }
  getPhysicalCardMessageTab() {
    return cy.findByRole('tab', { name: 'Physical Card Message' })
  }
  //Checkboxes
  getIncludeGiftEmailMessageCheckbox() {
    return cy.findByRole('checkbox', { name: 'Send Gift Email' })
  }
  getIncludePhysicalCardMessageCheckbox() {
    return cy.contains('div', 'Include a Physical Card').findAllByRole('checkbox')
  }
  getMirrorGiftEmailMessageCheckbox() {
    return cy.contains('div', 'Use Gift Email Message').findByRole('checkbox')
  }
  getSendShippedEmailCheckbox() {
    return cy.contains('[role="group"]', 'Send Shipped Email').find('input')
  }
  getSendDeliveredEmailCheckbox() {
    return cy.contains('[role="group"]', 'Send Delivered Email').find('input')
  }
  //Inputs
  getPhysicalMessageInput() {
    return cy
      .findByTestId('PostalCustomizeGiftEmail_textarea_physical_message')
      .find('.ProseMirror')
    //return cy.findByPlaceholderText('This message will be included in a card when your gift is delivered')
  }
  getEventEmailInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_textarea_message').find('.ProseMirror')
  }
  getEventMessageInput() {
    return cy.findByPlaceholderText(
      'This message will be included in the event invitation email sent to your contacts'
    )
  }
  getLandingPageHeaderInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_HeaderText_Input').find('.ProseMirror')
  }
  getOldLandingPageHeaderInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_HeaderText_Input')
  }
  // getMagicLinkLandingPageBodyInput() {
  //   return cy.get('.ProseMirror')
  // }
  getLandingPageMessageInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_BodyText_Input').find('.ProseMirror')
  }
  getOldLandingPageMessageInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_BodyText_Input')
  }
  getEventLandingPageMessageInput() {
    return cy.findByTestId('PostalCustomizeGiftEmail_BodyText_Input').find('.ProseMirror')
  }
  //Alerts
  getAddGiftEmailMessageAlert() {
    cy.getAlert({ message: 'Please add a Gift Email Message', close: 'close' })
  }
}
