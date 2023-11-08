import { Marketplace } from '../../support/pageObjects'

export default class BulkSelect {
  marketplace = new Marketplace()
  getBulkEditButton() {
    return cy.contains('button', 'Edit')
  }
  getBulkApproveButton() {
    return cy.contains('button', 'Approve')
  }
  getConfirmApproveButton(numOfItems: number) {
    return cy.findByRole('button', { name: `Approve ${numOfItems} Items` })
  }
  getConfirmUpdateButton(numOfItems: number) {
    return cy.findByRole('button', { name: `Edit ${numOfItems} Items` })
  }
  getConfirmBulkApproveItemsModal() {
    return cy.contains('section', 'Confirm Bulk Approve Items')
  }
  getConfirmBulkUpdateItemsModal() {
    return cy.contains('section', 'Confirm Bulk Update Items')
  }
  getItemByName(name: string | RegExp) {
    cy.contains('a', name).parents('[data-testid="ui-card"]').as('card')
    cy.get('@card').realHover()
    cy.get('@card').within(() => {
      cy.get('[aria-label="Select item"]').click()
    })
  }
  getBulkApproveItemsMenuItem() {
    return cy.findByRole('menuitem', { name: 'Bulk Approve Items' })
  }
  getBulkEditItemsMenuItem() {
    return cy.findByRole('menuitem', { name: 'Bulk Edit Items' })
  }
  getCancelBulkApproveMenuItem() {
    return cy.findByRole('menuitem', { name: 'Cancel Bulk Approve' })
  }
  getCancelBulkEditMenuItem() {
    return cy.findByRole('menuitem', { name: 'Cancel Bulk Edit' })
  }
  getApproveMenuItem(numOfItems: number) {
    if (numOfItems === 1) {
      return cy.findByRole('menuitem', { name: `Approve ${numOfItems} Item` })
    }
    return cy.findByRole('menuitem', { name: `Approve ${numOfItems} Items` })
  }
  getDeselectMenuItem(numOfItems: number) {
    if (numOfItems === 1) {
      return cy.findByRole('menuitem', { name: `Deselect ${numOfItems} Item` })
    }
    return cy.findByRole('menuitem', { name: `Deselect ${numOfItems} Items` })
  }
  getEditMenuItem(numOfItems: number) {
    if (numOfItems === 1) {
      return cy.findByRole('menuitem', { name: `Edit ${numOfItems} Item` })
    }
    return cy.findByRole('menuitem', { name: `Edit ${numOfItems} Items` })
  }
}
