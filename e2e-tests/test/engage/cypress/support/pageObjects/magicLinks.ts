export default class MagicLinks {
  visitMagicLinks() {
    cy.visit('/links')
  }
  getSaveMagicLinkButton() {
    return cy.contains(
      'button',
      RegExp('Create MagicLink' + '|' + 'Send Again' + '|' + 'Add Funds to confirm and Send')
    )
  }
  getUpdateMagicLinkButton() {
    return cy.contains(
      'button',
      RegExp(
        'Update MagicLink' +
          '|' +
          'Send Again' +
          '|' +
          'Review' +
          '|' +
          'Add Funds to confirm and Send'
      )
    )
  }
  getCreateAMagicLinkButton() {
    return cy.findByRole('button', { name: 'Create a MagicLink', timeout: 94000 })
  }
  getCreateANewLinkButton() {
    return cy.findByRole('button', { name: 'Create a new link', timeout: 94000 })
  }
  getCreateMagicLinkActionMenuItem() {
    return cy.findByRole('menuitem', { name: 'Create MagicLink' })
  }
  getLinkByName(name: string) {
    return cy.findByRole('link', { name: name })
  }
  getCopyLink() {
    return cy.contains('a', 'Copy Link')
  }
  getCopyLinkButton() {
    return cy.contains('a', 'Share URL', { timeout: 99000 })
  }
  getPreviewLinkButton() {
    return cy.contains('a', 'Preview Landing Page')
  }
  getAddContactInfoButton() {
    return cy.findByText('Add contact info')
  }
  getContactInfoCardByName(name: string) {
    return cy.contains('[data-testid="ui-card"]', name)
  }
  getAddressCardByPartialAddress(partialAddress: string) {
    return cy.contains('[data-testid="ui-card"]', partialAddress)
  }
  getPhoneCardByPhoneType(type: string) {
    return cy.contains('[data-testid="ui-card"]', type)
  }
  getEditLink() {
    return cy.contains('a', 'Edit')
  }
  getRemoveLink() {
    return cy.contains('a', 'Remove')
  }
  getAddAnAddressButton() {
    return cy.contains('a', 'Add an Address')
  }
  getAddAPhoneButton() {
    return cy.contains('a', 'Add a Phone')
  }
  //same as in the extension but re-using here because I'm
  //pretty sure its not a shared component rather copy and pasted
  getNewAddressDrawer() {
    return cy.findByRole('dialog', { name: 'New Address' })
  }
  getEditAddressDrawer() {
    return cy.findByRole('dialog', { name: 'Edit Address' })
  }
  getNewPhoneDrawer() {
    return cy.findByRole('dialog', { name: 'New Phone' })
  }
  getEditPhoneDrawer() {
    return cy.findByRole('dialog', { name: 'Edit Phone' })
  }
  getContactInfoDrawer() {
    return cy.findByRole('dialog', { name: 'Contact Info' })
  }
  getFirstNameInput() {
    return cy.findByLabelText('First Name (required)')
  }
  getLastNameInput() {
    return cy.findByLabelText('Last Name (required)')
  }
  getEmailInput() {
    return cy.findByLabelText('Email Address (required)')
  }
  getTitleInput() {
    return cy.findByLabelText('Title')
  }
  getCompanyInput() {
    return cy.findByLabelText('Company Name')
  }
  getStreetAddress1Input() {
    return cy.findByLabelText('Street Address 1 (required)')
  }
  getStreetAddress2Input() {
    return cy.findByLabelText('Street Address 2')
  }
  getCityInput() {
    return cy.findByLabelText('City (required)')
  }
  getStateInput() {
    return cy.findByLabelText('State (required)')
  }
  getPostalCodeInput() {
    return cy.findByLabelText('Postal Code (required)')
  }
  getPhoneNumberInput() {
    return cy.findByLabelText('Phone number')
  }
  getPhoneTypeSelect() {
    return cy.findByLabelText('Phone Type')
  }
  getAddressLabelInput() {
    return cy.findByLabelText('Address Label (required)')
  }
  getUseVerifiedButton() {
    return cy.findByRole('button', { name: 'Use Verified' })
  }
  getFixItButton() {
    return cy.findByRole('button', { name: 'Fix It' })
  }
  getTryAgainButton() {
    return cy.findByRole('button', { name: 'Try Again' })
  }
  getVerifyAddressDrawer() {
    return cy.findByRole('dialog', { name: 'Verify Address' })
  }
  getUnknownAddressHelper() {
    return cy.contains('[role="alert"]', 'You entered an unknown address.')
  }
  getOnlyUSShippingHelper() {
    return cy.contains(
      '[role="alert"]',
      'At this time, this product is only available to be shipped to the United States.'
    )
  }
  getMatchingAddressHelper() {
    return cy.contains('[role="alert"]', 'We found a matching address!')
  }
  getReviewMagicLinkName() {
    return cy.contains('div', 'MagicLink Name').parent('div')
  }
  getReviewStatus() {
    return cy.contains('div', 'Status').parent('div')
  }
  getReviewOrderLimit() {
    return cy.contains('div', 'Order Limit').parent('div')
  }
  getReviewExpiresOn() {
    return cy.contains('div', 'Expires On').parent('div')
  }
  getEditMagicLinkButton() {
    return cy.findByLabelText('SubNavbar Title')
  }
  getMagicLinkInputByDisplayValue(value: string) {
    return cy.findByDisplayValue(value)
  }
  getReviewLandingPageMessage() {
    return cy.findByTestId('PostalReview_landingPage_body')
  }
  getOrderStatusHeading() {
    return cy.findByRole('heading', { name: 'Order Status', timeout: 40000 })
  }
  getSayThanksForm() {
    return cy.contains('form', 'Say Thanks!')
  }
  getThanksInput() {
    return cy.findByPlaceholderText('Leave a little note to say thank you')
  }
  getSendMessageButton() {
    return cy.findByRole('button', { name: 'Send Message' })
  }
  getHeresWhatYouSaidSection() {
    return cy.contains('div', `Here's what you said`)
  }
  getShareYourExperienceSection() {
    return cy.contains('div', 'Share Your Experience:')
  }
  getLinkedInButton() {
    return cy.findByLabelText('linkedin')
  }
  getTwitterButton() {
    return cy.findByLabelText('twitter')
  }
  getFacebookButton() {
    return cy.findByLabelText('facebook')
  }
  getDeleteMagicLinkActionMenuItem() {
    return cy.findByRole('menuitem', { name: 'Delete MagicLink' })
  }
  getDeleteMagicLinkModal() {
    return cy.contains('section', 'Delete MagicLink')
  }
  getRemoveAddressModal() {
    return cy.findByRole('alertdialog', { name: 'Remove Address' })
  }
  getRemovePhoneModal() {
    return cy.findByRole('alertdialog', { name: 'Remove Phone' })
  }
  getItemToSelectByName(name: string) {
    if (name.length > 20) {
      return cy.contains('[data-testid="CollectionItem"]', name.slice(0, 18))
    }
    return cy.contains('[data-testid="CollectionItem"]', name.slice(0, 18))
  }
  getJustSentYouHeader(firstName: string, company: string) {
    return cy.findAllByRole('heading', {
      name: `${firstName} from ${company} just sent you something!`,
    })
  }
  getLandingPageMessageByText(message: string) {
    return cy.findByText(message)
  }
  getOptionSelectedContainer() {
    return cy.contains('div', 'Option Selected')
  }
  getAllUnSelectedOptions() {
    return cy.findAllByTestId('isNotSelected')
  }
  getSelectedOptions() {
    return cy.findAllByTestId('isSelected')
  }
  getSelectADifferentItem() {
    return cy.findByRole('button', { name: 'Select a different item' })
  }
  getYourContactInfoHeading() {
    return cy.findByRole('heading', { name: 'Your contact info' })
  }

  getYourPhoneHeading() {
    return cy.findByRole('heading', { name: `Your phone number` })
  }
  getSelectOptionModal() {
    return cy.findByRole('dialog', { name: 'Please select an option' })
  }
  getOptionToSelectByName(name: string) {
    if (name.length > 20) {
      return cy.contains('div', name.slice(0, 18))
    }
    return cy.contains('div', name)
  }
  getTeaserHeader() {
    return cy.contains('h2', 'MagicLink')
  }
  getTeaserSubHeader() {
    return cy.findByText('The easiest way to send an Item.')
  }
  // getSidebarHeading() {
  //   return cy.findByRole('heading', { name: 'MagicLink' })
  // }
  getTeaserCard() {
    return cy.contains('[data-testid="ui-card"]', 'MagicLink')
  }
  // getLandingPageMessageTab() {
  //   return cy.findByRole('tab', { name: 'Landing Page Message' })
  // }
  getEnabledCheckbox() {
    return cy.get('#linkEnabled')
  }
  getRequiresApprovalCheckbox() {
    return cy
      .contains('[role="group"]', 'Require approval before processing')
      .findByRole('checkbox')
  }
  getMagicLinkNameInput() {
    return cy.get('#linkName')
  }
  getOrderLimitInput() {
    return cy.get('#linkMaxExecutions')
  }
  getExpiresOnInput() {
    cy.findByTestId('linkExpirationDate-label')
      .parent()
      .within(() => {
        cy.findByRole('textbox').as('expiresOnInput')
      })
    return cy.get('@expiresOnInput')
  }
  getOrderLimitDetail() {
    return cy.contains('div', 'Order Limit')
  }
  getExpiresOnDetail() {
    return cy.contains('div', 'Expires On')
  }
  getOwnerDetail() {
    return cy.contains('div', 'Owner')
  }
  getTeamDetail() {
    return cy.contains('div', 'Team')
  }
  getSendAsDetail() {
    return cy.contains('div', 'Send As')
  }
  getStatusDetail() {
    return cy.contains('div', 'Status')
  }
  getCreatedOnDetail() {
    return cy.contains('div', 'Created On')
  }
  getLastOrderDetail() {
    return cy.contains('div', 'Last Order')
  }
  getLastViewDetail() {
    return cy.contains('div', 'Last View')
  }
  getActionsDetail() {
    return cy.contains('div', 'Actions')
  }
  getMeetingRequestDetail() {
    return cy.contains('div', 'Meeting Request')
  }
  getQRCodeDetail() {
    return cy.contains('a', 'View QR Code')
  }
  getSpentFromDetail() {
    return cy.contains('div', 'Spent From')
  }
  getOrdersStat() {
    return cy.contains('div', 'Redemptions')
  }
  getTotalCostStat() {
    return cy.contains('div', 'Total Cost')
  }
  getCostPerOrderStat() {
    return cy.contains('div', 'Cost Per Order')
  }
  // getCopiedToClipboardAlert() {
  //   cy.getAlert({ message: 'Copied MagicLink to Clipboard', close: 'close' })
  // }
  // getCopiedToClipboard2Alert() {
  //   cy.getAlert({ message: 'MagicLink URL copied to Clipboard', close: 'close' })
  // }
  // getCopiedToClipboard3Alert() {
  //   cy.getAlert({ message: 'Copied MagicLink URL to Clipboard', close: 'close' })
  // }
  getContactInfoRequiredAlert() {
    cy.getAlert({ message: 'Contact information is required', close: 'close' })
  }
  getSetShippingAlert() {
    cy.getAlert({ message: 'Please set a shipping address', close: 'close' })
  }
  getAddLandingMessageAlert() {
    cy.getAlert({ message: 'Please add a Landing Page Message', close: 'close' })
  }
  getEditMagicLinkLink() {
    return cy.contains('a', 'Edit MagicLink')
  }
  getDeleteMagicLinkLink() {
    return cy.contains('a', 'Delete MagicLink')
  }
  getBackToMagicLinksButton() {
    return cy.findByRole('button', { name: 'back_to_magic_links' })
  }
  getMagicLinkNameFilter() {
    return cy.findByPlaceholderText('Search')
  }
  getMagicLinkOwnerFilter() {
    return cy.findByTestId('AutoCompleteUser').find('input')
  }
  getStatusSelectFilter() {
    return cy.contains('select', '-- Any Status --')
  }
  getCreatedOnSort() {
    //return cy.findByRole('link', { name: 'Created Date' })
    return cy.contains('a', 'Created Date')
  }
  getDetailsCard() {
    return cy.contains('div', 'Details')
  }
  getOrdersCard() {
    return cy.contains('[data-testid="ui-card"]', 'Orders')
  }
  getLearnMoreLink() {
    return cy.contains('a', 'Learn More About Postal')
  }
  getMagicLinkStatusCheck() {
    return cy.findByTestId('StatusCheck')
  }
  getInTransitText() {
    return cy.findByText('In Transit')
  }
  getDeliveredText() {
    return cy.findByText('Delivered')
  }
  getTrackingNumberInfo() {
    return cy.contains('p', 'Tracking Number')
  }
  getConsentStatement() {
    return cy.findByTestId('ConsentStatement')
  }
  //tooltips and tooltip text
  getExpiresOnTooltip() {
    return cy.contains('label', 'Expires On').find('svg')
  }
  getExpiresOnTooltipText() {
    return cy.findByRole('tooltip', { name: 'Link will expire on 11:59pm of the date you choose' })
  }
  getOrderLimitTooltip() {
    return cy.findByTestId('linkMaxExecutions-tooltip')
  }
  getOrderLimitTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The number of times a MagicLink can be redeemed in total. Learn more about MagicLinks in our Help Center.',
    })
  }
  getRequiresApprovalTooltip() {
    return cy.get('#linkNeedsApproval-label').find('svg')
  }
  getRequiresApprovalTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Toggling this box on will require all accepted MagicLinks to be approved by the sender',
    })
  }
  getRequireApprovalBannerText(num: number) {
    return cy.contains(`You have ${num} orders that require approval.`)
  }
  getApproveNowButton() {
    return cy.contains('a', 'Review Now')
  }
  getApproveDenyModal() {
    return cy.findByRole('dialog', { name: 'Approve / Deny MagicLink Orders' })
  }
  getApproveSelectedButton() {
    return cy.findByRole('button', { name: 'Approve Selected' })
  }
  getDenySelectedButton() {
    return cy.findByRole('button', { name: 'Deny Selected' })
  }
  approveDenyModalHeaderText() {
    return 'ContactItemRedemption DateItem CostCompany NameEmailTitleSpent From'
  }
  getOrderSummary() {
    return cy.contains('div', 'Order Summary')
  }
  getFiltersButton() {
    return cy.findByRole('button', { name: 'Filters' })
  }
}
