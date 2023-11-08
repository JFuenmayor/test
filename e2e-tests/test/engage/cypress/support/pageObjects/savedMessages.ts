import { Universal } from '../../support/pageObjects'

export default class SavedMessages {
  universal = new Universal()
  visitMessages() {
    cy.visit('/saved-messages')
  }
  getSavedMessagessHeader() {
    return cy.contains('h5', 'Saved Messages')
  }
  getMessageTemplatesTooltip() {
    return cy.findByText('Message Templates').find('svg')
  }
  getMessageTemplatesTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Add frequently used message templates here. These will be available to all team members when sending an item.',
    })
  }
  getCreateMessageButton() {
    return cy.findByRole('button', { name: 'Create Message' })
  }
  getCreateANewTemplateDrawer() {
    return cy.findByRole('alertdialog', { name: 'Create a new Template' })
  }
  getEditMessageDrawerByName(name: string) {
    return cy.findByRole('alertdialog', { name: `Edit ${name}` })
  }
  getMessageCardByTitle(title: string) {
    return cy.contains('[data-testid="ui-card"]', title, { timeout: 34000 })
  }
  getCreateTemplateButton() {
    return cy.findByRole('button', { name: 'Create Template' })
  }
  getUpdateTemplateButton() {
    return cy.findByRole('button', { name: 'Update Template' })
  }
  getExpandLink() {
    return cy.contains('a', 'Expand')
  }
  getCollapseLink() {
    return cy.contains('a', 'Collapse')
  }
  getMessageTitleInput() {
    return cy.findByLabelText(/Message Title/)
  }
  getMessageTemplateInput() {
    return cy.findByLabelText(/Message Template/)
  }
  getSavedMessageButton() {
    return cy.contains('a', 'Saved Message')
  }
  getSavedMessagesButton() {
    return cy.contains('button', 'Saved Messages')
  }
  getEditMessageButton() {
    return cy.findByRole('button', { name: 'Edit message template' })
  }
  getDeleteMessageButton() {
    return cy.findByRole('button', { name: 'delete message template' })
  }
  getDeleteModal() {
    return cy.findByRole('dialog', { name: 'Delete Message Template' })
  }
  getDeleteModalText() {
    return cy.contains('Are you sure you want to delete this template?')
  }
  getSavedMessagesDrawer() {
    return cy.contains('section', 'Saved Messages')
  }
  getWinBackSavedMessage() {
    return cy.findByText('Win Back')
  }
  getWelcomeSavedMessage() {
    return cy.findByText('Welcome')
  }
  getMessageVariablesButton() {
    return cy.contains('a', 'Message Variables')
  }
  getMessageVariablesDrawer() {
    return cy.contains('section', 'Personalize your text with variables')
  }
  getAvailableVariables() {
    return cy.findByText('Available Variables')
  }
  getNoMessagesHelper() {
    return cy.findByText('There are no saved messages yet')
  }
  getTemplateRemovedAlert() {
    cy.getAlert({ message: 'Template removed', close: 'close' })
  }
  getNoSavedMessagesYetText() {
    return cy.findByText(
      `You don't have any saved messages yet. Create one now, by clicking on the Actions menu button on the top of the page.`
    )
  }
  //Filters
  getSearchTemplateNameFilter() {
    return cy.findByPlaceholderText('Search Template Name')
  }
  getSearchTemplateBodyFilter() {
    return cy.findByPlaceholderText('Search Template Body')
  }
}
