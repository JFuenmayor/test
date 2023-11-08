import {
  CreateApprovedPostalDocument,
  ProductVariant,
  SearchMarketplaceProductsDocument,
  Status,
} from '../api'

Cypress.Commands.add('createApprovedPostal', ({ name }) => {
  return cy
    .graphqlRequest(SearchMarketplaceProductsDocument, { filter: { name: { eq: name } } })
    .then((res) => {
      const product = res.searchMarketplaceProducts?.[0]
      const variant = product?.variants?.[0] as ProductVariant

      // const log = Cypress.log({
      //   name: 'createApprovedPostal',
      //   displayName: 'Postal',
      //   message: [`📬 Creating | Postal`],
      // })
      return cy
        .graphqlRequest(CreateApprovedPostalDocument, {
          marketplaceProductId: product?.id,
          data: {
            name: product?.name,
            description: product?.description,
            items: [{ variant: variant.id, marketplaceProductId: product?.id ?? '' }],
            version: '2',
            status: Status.Active,
          },
        })
        .then((res) => {
          return res.createApprovedPostal.postal
        })
      // .then((res) => {
      //   log.set({
      //     consoleProps() {
      //       return {
      //         name: res.createApprovedPostal.postal.name,
      //         id: res.createApprovedPostal.postal.id,
      //       }
      //     },
      //   })
      //   log.end()
      //   return res.createApprovedPostal.postal
      // })
    })
})
