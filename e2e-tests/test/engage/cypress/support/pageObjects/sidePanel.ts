export default class SidePanel {
  getToggle() {
    return cy.findByTestId('UiSidePanel_collapse')
  }
  getSidePanel() {
    return cy.findAllByTestId('SidePanelFilter', { timeout: 90000 })
  }
  waitForFilters() {
    this.getSidePanel().within(() => {
      cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
      cy.findByTestId('SidePanelFilter_Filters').should('exist')
    })
  }
  waitForFilterHeader() {
    this.getSidePanel()
      .should('be.visible')
      .within(() => {
        cy.findByText('Price', { timeout: 100000 }).should('be.visible')
      })
  }
  getFilterHeader(name: string) {
    return cy.findByTestId(`SidePanelHeader-${name}`)
  }
  getClearFilter(name: string) {
    return this.getFilterHeader(name).should('be.visible').contains('a', 'clear')
  }
  getTitle() {
    return cy.findByTestId('UiSidePanel_Title')
  }
  getFilter(name: string) {
    return cy.findByTestId(`SidePanelFilter-${name}`, { timeout: 90000 })
  }
  clearFilter(name: string) {
    return this.getClearFilter(name).click({ force: true })
  }
  selectFilter(name: string, value: string) {
    return cy.selectAutoComplete(value, `SidePanelFilter-${name}`)
  }
  getOpenFilterMenu() {
    return cy.get('.UiSelectTypeahead__menu')
  }
  getSidePanelToggle() {
    return cy.findByTestId('UiSidePanel_collapse')
  }
  getSearchBar() {
    return cy.findAllByPlaceholderText('Search')
  }
  getAvailableDateFilter() {
    return cy
      .findByTestId('SidePanelFilter-Available Date')
      .parent()
      .findByRole('textbox', { name: '' })
  }
  ifIncludes(arr: string[], name: string, filterTitle: string) {
    return arr.includes(name)
      ? this.getFilterHeader(filterTitle).should('exist')
      : this.getFilterHeader(filterTitle).should('not.exist')
  }
}
