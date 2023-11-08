import { faker } from '@faker-js/faker'
export default class Delivery {
  public uuid
  constructor() {
    this.uuid = faker.string.nanoid()
  }
  getFeedbackFormHeader() {
    return cy.findByTestId('Status_Form_Header')
  }
  getYourContactInfoHeading() {
    return cy.findByRole('heading', { name: 'Your contact info' })
  }
  getYourPhoneHeading() {
    return cy.findByRole('heading', { name: `Your phone number` })
  }
  getConsentStatement() {
    return cy.findByTestId('ConsentStatement')
  }
  getAddContactInfoButton() {
    return cy.findByText('Add contact info')
  }
  getContactInfoDrawer() {
    return cy.findByRole('dialog', { name: 'Contact Info' })
  }
  getFirstNameInput() {
    return cy.findByLabelText('First Name*')
  }
  getLastNameInput() {
    return cy.findByLabelText('Last Name*')
  }
  getEmailInput() {
    return cy.findByLabelText('Email Address*')
  }
  getMLFieldInput() {
    return cy.findByLabelText('ML field*')
  }
  getMLField2Input() {
    return cy.findByLabelText('ML field 2*')
  }
  getTitleInput() {
    return cy.findByLabelText(/Title/)
  }
  getCompanyInput() {
    return cy.findByLabelText(/Company/)
  }
  getContactInfoCardByName(name: string) {
    return cy.contains('[data-testid="ui-card"]', name)
  }
  getDetailsCard() {
    return cy.findByTestId('FormFieldsCard')
  }
  getEditLink() {
    return cy.contains('a', 'Edit')
  }
  getEditButton() {
    return cy.contains('button', 'Edit')
  }
  getOnTheWayText() {
    return cy.contains(/YOUR ORDER IS ON THE WAY!/i, { timeout: 65000 }).should('exist')
  }
  getComingYourWayText() {
    return cy.findByRole('heading', { name: 'COMING YOUR WAY!', timeout: 55000 })
  }
  getOrderProcessingText() {
    return cy.findByRole('heading', { name: 'Order Processing', timeout: 55000 })
  }
  getComingSoonToYourInboxText() {
    return cy.contains('Your item will be delivered via email', { timeout: 55000 })
  }
  getItemProcessingText() {
    return cy.findByText(
      'Your item is processing and will soon be on its way! Keep an eye on your inbox or check this page for updates.'
    )
  }
  getGiftcardProcessingText() {
    return cy.findByText('Your gift card is processing. It will be on its way to your inbox soon!')
  }

  getSayThanksForm() {
    return cy.contains('form', 'Say Thanks!')
  }
  getThanksInput() {
    return cy.findByPlaceholderText('Leave your message here....')
  }
  getSendMessageButton() {
    return cy.findByRole('button', { name: 'Send Message' })
  }
  getHeresWhatYouSaidSection() {
    return cy.contains('div', `You said:`)
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
  getOrderStatusHeading() {
    return cy.findByRole('heading', { name: 'Order Status', timeout: 40000 })
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
  getContactInfoRequiredAlert() {
    cy.getAlert({ message: 'Contact information is required', close: 'close' })
  }
  getDetailsRequiredAlert() {
    cy.getAlert({ message: 'Please complete the details page.' })
  }
  getSetShippingAlert() {
    cy.getAlert({ message: 'Please update your shipping address.' })
  }
  getAddAnAddressButton() {
    return cy.contains('a', 'Add an address')
  }
  getAddAPhoneButton() {
    return cy.contains('a', 'Add a Phone')
  }
  getAddDetailsButton() {
    return cy.contains('button', 'Add details')
  }
  getDetailsDrawer() {
    return cy.findByRole('dialog', { name: 'Details' })
  }
  getShippingDrawer() {
    return cy.contains('section', 'Shipping Address', { timeout: 99000 })
  }
  getVerifyAddressModal() {
    return cy.contains('section', 'Verify Address')
  }
  getShippingAddressButton() {
    return cy.findByRole('button', { name: 'Review Shipping Address' })
  }
  getShippingCard() {
    return cy.findByTestId('ShippingCard')
  }
  getNewAddressDrawer() {
    return cy.findByRole('dialog', { name: 'New Address' })
  }
  getStreetAddress1Input() {
    return cy.findByLabelText('Street Address 1*')
  }
  getStreetAddress2Input() {
    return cy.findByLabelText('Street Address 2')
  }
  getCityInput() {
    return cy.findByLabelText('City*')
  }
  getStateInput() {
    return cy.contains('div', 'State*')
  }
  getStateInputRegEx(state: string) {
    cy.contains('div', 'State*').within(() => {
      cy.get('.UiSelectTypeahead__control')
        .should('be.visible')
        .within(() => {
          cy.get('input:not([type="hidden"])').clear()
          cy.get('input:not([type="hidden"])').click({ force: true })
          cy.get('input:not([type="hidden"])').type(state, { force: true })
        })
    })
    cy.get('.UiSelectTypeahead__menu-list').within(() => {
      cy.findByText('Loading...').should('not.exist')
      cy.contains('Found', { timeout: 25000 }).should('not.exist')
      cy.contains(RegExp(`^` + state + `$`), { timeout: 65000 })
        .should('exist')
        .first()
        .click({ force: true })
    })
  }
  getPostalCodeInput() {
    return cy.findByLabelText('Postal Code*')
  }
  getPhoneNumberInput() {
    return cy.findByLabelText('Phone number')
  }
  getRequiredPhoneNumberInput() {
    return cy.findByLabelText('Phone number*')
  }
  getPhoneTypeSelect() {
    return cy.findByLabelText('Phone Type')
  }
  getRequiredPhoneTypeInput() {
    return cy.findByLabelText('Phone Type*')
  }
  getAddressLabelInput() {
    return cy.findByLabelText('Address Label*')
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
    return cy.findByRole('dialog', { name: 'Shipping Address' })
  }
  getUnknownAddressHelper() {
    return cy.contains('[role="alert"]', 'You entered an unknown address.')
  }
  getOnlyUSShippingHelper() {
    return cy.contains(
      'At this time, this product is only available to be shipped to the United States.'
    )
  }
  getMatchingAddressHelper() {
    return cy.contains('[role="alert"]', 'We found a matching address!')
  }
  getAddressCardByPartialAddress(partialAddress: string) {
    return cy.contains('[data-testid="ui-card"]', partialAddress)
  }
  getRemoveLink() {
    return cy.contains('a', 'Remove')
  }
  getEditAddressDrawer() {
    return cy.findByRole('dialog', { name: 'Edit Address' })
  }
  getRemoveAddressModal() {
    return cy.findByRole('alertdialog', { name: 'Remove Address' })
  }
  getRemovePhoneModal() {
    return cy.findByRole('alertdialog', { name: 'Remove Phone' })
  }
  getNewPhoneDrawer() {
    return cy.findByRole('dialog', { name: 'New Phone' })
  }
  getPhoneCardByPhoneType(type: string) {
    return cy.contains('[data-testid="ui-card"]', type)
  }
  getEditPhoneDrawer() {
    return cy.findByRole('dialog', { name: 'Edit Phone' })
  }
  getJustSentYouHeader(firstName: string, company: string) {
    return cy.contains(`${firstName} from ${company} just sent you something!`)
  }
  getItemToSelectByName(name: string) {
    if (name.length > 20) {
      return cy.contains('[data-testid="ui-card"]', name.slice(0, 18))
    }
    return cy.contains('[data-testid="ui-card"]', name.slice(0, 18))
  }
  // getSelectedOptions() {
  //   return cy.findAllByTestId('isSelected')
  // }
  getSelectADifferentItem() {
    return cy.findByRole('button', { name: 'Select a different item' })
  }
  getSelectOptionModal() {
    return cy.contains('div', /Please select an option/i)
  }
  getOptionToSelectByName(name: string) {
    if (name.length > 20) {
      return cy.contains('div', name.slice(0, 18))
    }
    return cy.contains('div', name)
  }
  getOptionSelectedContainer() {
    return cy.contains('div', 'Option Selected')
  }
  getAllUnSelectedOptions() {
    return cy.findAllByTestId('isNotSelected')
  }
  getMeetingLinkButtonLink() {
    return cy.findByRole('link', { name: 'Meeting Link' })
  }
  getDetailsFirstNameInput() {
    return cy.findByLabelText('First Name*')
  }
  getDetailsLastNameInput() {
    return cy.findByLabelText('Last Name*')
  }
  getDetailsEmailInput() {
    return cy.findByLabelText('Email Address*')
  }
  getDetailsWhatDayInput() {
    return cy.findByLabelText('What day?*')
  }
  getDetailsBestTacoSelect() {
    return cy.findByLabelText('Best taco*')
  }
  getDetailsCheeseCheckbox() {
    return cy.findByRole('checkbox', { name: 'Taco toppings * Cheese' })
  }
  getDetailsTitleInput() {
    return cy.findByLabelText('Title')
  }
  getDetailsCompanyInput() {
    return cy.findByLabelText('Company')
  }
  getCannotDeliverToStateText() {
    return cy.contains('Due to state/local laws we cannot deliver alcohol to this address.')
  }
  getDetailsAThingInput() {
    return cy.findByLabelText('A Thing?*')
  }
  getSubmitButton() {
    return cy.findByRole('button', { name: 'Submit', timeout: 58000 })
  }
  visit(copiedLink: string) {
    cy.url().then((url) => {
      // if we are currently on the test.postal.dev domain, just pass through
      if (url.includes('test.postal.dev')) {
        cy.visit(copiedLink, {
          timeout: 380000,
          retryOnNetworkFailure: true,
          headers: {
            'Accept-Encoding': 'gzip, deflate',
          },
        })
      } else {
        // otherwise we are going to convert any links with test.postal.dev to
        // whatever is set to baseUrl domain.  but, we first need to get the
        // redirect `/l/` and then convert it.
        cy.request({
          url: new URL(
            new URL(copiedLink).pathname,
            Cypress.config().baseUrl ?? undefined
          ).toString(),
          followRedirect: false,
        }).then((resp) => {
          cy.visit(
            new URL(
              new URL(resp.redirectedToUrl as string).pathname,
              Cypress.config().baseUrl ?? undefined
            ).toString(),
            { failOnStatusCode: false, retryOnNetworkFailure: true, timeout: 360000 }
          )
        })
      }
    })
  }
  session(id: string | null) {
    const sessionId = id ? `${id}:${this.uuid}` : `random:${faker.string.nanoid()}`
    // we are calling this API in order to set the cookie that we will need in future sessions
    cy.session(sessionId, () => cy.request(`${Cypress.config().baseUrl}/delivery/api/test`))
  }
}
