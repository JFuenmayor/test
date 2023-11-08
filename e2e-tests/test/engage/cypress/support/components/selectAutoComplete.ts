// If selection is empty, select the first option.
// Otherwise search for the option and choose the first result
Cypress.Commands.add('selectAutoComplete', (selection?: string, dataTestId?: string) => {
  const container = dataTestId
    ? cy.findAllByTestId(dataTestId)
    : cy.get('.UiSelectTypeahead__control')
  container
    .scrollIntoView()
    .should('be.visible')
    .within(() => {
      if (selection) {
        cy.get('input:not([type="hidden"])').click({ force: true })
        cy.get('input:not([type="hidden"])').fill(selection)
        cy.get('.UiSelectTypeahead__menu-list').within(() => {
          cy.findByText('Loading...').should('not.exist')
          cy.contains('Found', { timeout: 25000 }).should('not.exist')
          cy.contains(selection, { timeout: 65000 }).should('exist').first().click({ force: true })
        })
      } else {
        cy.get('svg').click({ force: true })
        cy.get('.UiSelectTypeahead__menu-list')
          .find('.UiSelectTypeahead__option')
          .first()
          .click({ force: true })
      }
    })
})

// I don't know if these work yet
Cypress.Commands.add('getAutoCompleteValue', (dataTestId?: string) => {
  const container = dataTestId
    ? cy.findAllByTestId(dataTestId)
    : cy.get('.UiSelectTypeahead__control')
  return container.get('.UiSelectTypeahead__single-value')
})

Cypress.Commands.add('getAutoCompleteValues', (dataTestId?: string) => {
  const container = dataTestId
    ? cy.findAllByTestId(dataTestId, { timeout: 99000 })
    : cy.get('.UiSelectTypeahead__control')
  return container.get('.UiSelectTypeahead__multi-value')
})

Cypress.Commands.add('selectAutoCompleteCreatable', (selection?: string, dataTestId?: string) => {
  const container = dataTestId
    ? cy.findAllByTestId(dataTestId)
    : cy.get('.UiSelectTypeaheadCreatable__control')
  container
    .scrollIntoView()
    .should('be.visible')
    .within(() => {
      if (selection) {
        cy.get('input:not([type="hidden"])').click({ force: true })
        cy.get('input:not([type="hidden"])').fill(selection)
        cy.get('.UiSelectTypeaheadCreatable__menu-list').within(() => {
          cy.findByText('Loading...').should('not.exist')
          cy.contains('Found', { timeout: 25000 }).should('not.exist')
          cy.contains(selection, { timeout: 65000 }).should('exist').first().click({ force: true })
        })
      } else {
        cy.get('.UiSelectTypeaheadCreatable__dropdown-indicator').click({ force: true })
        cy.get('.UiSelectTypeaheadCreatable__menu-list')
          .find('.UiSelectTypeaheadCreatable__option')
          .first()
          .click({ force: true })
      }
    })
})

Cypress.Commands.add('getAutoCompleteCreatableValue', (dataTestId?: string) => {
  const container = dataTestId
    ? cy.findAllByTestId(dataTestId)
    : cy.get('.UiSelectTypeaheadCreatable__control')
  return container.get('.UiSelectTypeaheadCreatable__single-value')
})

Cypress.Commands.add('getAutoCompleteCreatableValues', (dataTestId?: string) => {
  const container = dataTestId
    ? cy.findAllByTestId(dataTestId)
    : cy.get('.UiSelectTypeaheadCreatable__control')
  return container.get('.UiSelectTypeaheadCreatable__multi-value')
})

Cypress.Commands.add('selectAutoCompleteTransferFromAccount', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteTransferFromAccount')
})

Cypress.Commands.add('selectAutoCompleteTransferToAccount', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteTransferToAccount')
})

Cypress.Commands.add('selectAutoCompleteCampaign', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteCampaign')
})

Cypress.Commands.add('selectAutoCompleteContact', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteContact')
})

Cypress.Commands.add('selectAutoCompleteItem', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteItem')
})

Cypress.Commands.add('selectAutoCompleteMagicLink', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteMagicLink')
})

Cypress.Commands.add('selectAutoCompleteTeam', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteTeam')
})

Cypress.Commands.add('selectAutoCompleteUser', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteUser')
})

Cypress.Commands.add('getAutoCompleteTagsValues', () => {
  cy.getAutoCompleteTagsValues('AutoCompleteTags')
})

Cypress.Commands.add('selectAutoCompleteTags', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteTags')
})

Cypress.Commands.add('getAutoCompleteCreatableTagsValues', () => {
  cy.getAutoCompleteCreatableValues('AutoCompleteTagsCreatable')
})

Cypress.Commands.add('selectAutoCompleteTagsCreatable', (selection?: string) => {
  cy.selectAutoCompleteCreatable(selection, 'AutoCompleteTagsCreatable')
})

Cypress.Commands.add('selectAutoCompleteContactListCreatable', (selection?: string) => {
  cy.selectAutoCompleteCreatable(selection, 'AutoCompleteContactListCreatable')
})

Cypress.Commands.add('selectAutoCompleteCountry', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteCountry')
})

Cypress.Commands.add('selectAutoCompleteState', (selection?: string) => {
  cy.selectAutoComplete(selection, 'AutoCompleteState')
})
