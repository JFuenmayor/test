export default class SubNavbar {
  getFilterTag() {
    return cy.get('li')
  }
  getAllFilterTags() {
    return cy.get('li')
  }
  getClearAllFilters() {
    return cy.contains('Clear filters', { timeout: 24000 })
  }
  getCenter() {
    return cy.findByTestId('ui-subnavbar-center', { timeout: 34000 })
  }
  getLeft() {
    return cy.findAllByTestId('ui-subnavbar-left')
  }
  getRight() {
    return cy.findByTestId('ui-subnavbar-right')
  }
  clearAllFilters() {
    return cy.findByRole('button', { name: 'Clear filters' }).click({ force: true })
  }
  clearFilter(name: string) {
    return cy.get('li').contains(name).parent().findByRole('button', { name: 'close' }).click()
  }
}
