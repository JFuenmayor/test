export default class Warehousing {
  visitWarehousing() {
    return cy.visit('/account/warehousing')
  }
  getWarehousingSendSelect() {
    return cy.findByLabelText(
      'Is this a one time send or would you like to send these items over time?*'
    )
  }
  getWarehousingDateInput() {
    return cy.contains('div', 'When would you like to warehouse these items?').find('input').eq(1)
  }
  getWarehousingHowManyInput() {
    return cy.findByLabelText('How many items are you planning to warehouse?*')
  }
  getWarehousingServicesOptions() {
    return cy.findByLabelText('Please select which services you will need for your items:*')
  }
  getWarehousingTellUsMoreInput() {
    return cy.findByLabelText(
      'Tell us more about the details of your project and what you’re trying to achieve. Please provide any examples or links.*'
    )
  }

  getWarehousingPackagingOption() {
    return cy.findByText('Packaging')
  }
  getSendRequestButton() {
    return cy.findByRole('button', { name: 'Send Request' })
  }
  getRequestSentModal() {
    return cy.findByRole('alertdialog', { name: 'Request Sent' })
  }
}
