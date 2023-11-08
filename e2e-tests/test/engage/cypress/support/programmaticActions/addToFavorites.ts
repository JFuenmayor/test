import {
  BulkContactAddToListDocument,
  SearchContactListsDocument,
  SearchContactsV2Document,
} from '../api'

Cypress.Commands.add('addToFavorites', (id: string) => {
  return cy.graphqlRequest(SearchContactListsDocument).then((res) => {
    const list = res.searchContactLists?.[0]
    return cy.graphqlRequest(SearchContactsV2Document, { limit: 2 }).then((res) => {
      const contacts = res.searchContactsV2?.searchableContacts || []
      return cy
        .graphqlRequest(BulkContactAddToListDocument, {
          v2filter: { id: { in: contacts.map((c) => c.id) } },
          data: { name: 'Favorites', listId: list?.id ?? '', userId: id },
        })
        .then((res) => res.bulkContactAddToList)
    })
  })
})
