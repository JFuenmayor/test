export default class CustomFormFields {
  getCustomizeFormSettingsModal() {
    return cy.contains('section', 'Customize Form Settings')
  }
  getCustomFieldFirstName() {
    return cy.findByLabelText('First Name*')
  }
  getCustomFieldLastName() {
    return cy.findByLabelText('Last Name*')
  }
  getCustomFieldEmailAddress() {
    return cy.findByLabelText('Email Address*')
  }
  getCustomFieldTitle() {
    return cy.findByLabelText('Title')
  }
  getCustomFieldCompany() {
    return cy.findByLabelText('Company')
  }
  getAddCustomFieldSingleChoiceButton() {
    return cy.findByText('Dropdown')
  }
  getAddCustomFieldYesNoButton() {
    return cy.contains('[data-testid="ui-card"]', 'Yes/No')
  }
  getAddCustomFieldDateButton() {
    return cy.contains('[data-testid="ui-card"]', 'Date')
  }
  getNewCustomFieldQuestion() {
    return cy.findByPlaceholderText('Question')
  }
  getSingleChoiceAddAnswers() {
    return cy.get('.UiSelectTypeaheadCreatable__control')
  }
  getNewCustomFieldIsRequiredSwitch() {
    return cy.contains('div', 'Require This Field').find('input')
  }
  getSaveCustomFieldButton() {
    return cy.findByRole('button', { name: 'Save Field' })
  }
  getApplyFormSettingsButton() {
    return cy.findByRole('button', { name: 'Save' })
  }
  getAddCustomFieldButton() {
    return cy.findByRole('button', { name: 'ADD A FIELD' })
  }
  getAddCustomFieldTextButton() {
    return cy.findByText('Short Answer')
  }
  getAddCustomFieldCheckBoxesButton() {
    return cy.findByText('Checkboxes')
  }
  getChangeCustomFieldTypeButton(name: string) {
    return cy.findByRole('button', { name })
  }
  getEditFieldButton(name: string) {
    return cy.findByTitle(`Edit field: ${name}`)
  }
  getDeleteFieldButton(name: string) {
    return cy.findByTitle(`Delete field: ${name}`)
  }
  getCustomFieldNewField() {
    return cy.findByLabelText('New Field')
  }
  getNewCustomFieldTextMinLength() {
    return cy.findByPlaceholderText('Min Length')
  }
  getNewCustomFieldTextMaxLength() {
    return cy.findByPlaceholderText('Max Length')
  }
  getNewCustomFieldMinDate() {
    return cy.findByLabelText('Min Date')
  }
  getNewCustomFieldMaxDate() {
    return cy.findByLabelText('Max Date')
  }
  getChangeCustomFieldTypeMenuItem(name: string) {
    return cy.findByRole('menuitem', { name })
  }
  getAddedTextFieldByLabel(name: string) {
    return cy.contains('div', name)
  }
  getMultipleChoiceAnswer(name: string) {
    return cy.findByRole('list').contains('li', name)
  }
  getRegistrationFormFieldsAdded() {
    return cy.contains('div', 'Custom Fields Added:')
  }
  getMultipleChoiceAddAnswers() {
    return cy.findByPlaceholderText('Option')
  }
}
