import { CreateApprovedPostalDocument, SearchMarketplaceProductsDocument, Status } from '../api'

Cypress.Commands.add('createChipotlePostal', (variantChoice?: number) => {
  //Variants
  // 2 = $5
  // 1 = $10
  // 0 = $25
  // 3 = all

  let variants: any

  const log = Cypress.log({
    name: 'createChipotlePostal',
    displayName: 'Postal',
    message: [`🎁 Creating | Chipotle Gift Card`],
    autoEnd: false,
  })
  cy.graphqlRequest(SearchMarketplaceProductsDocument, {
    filter: { name: { eq: 'Chipotle' } },
  }).then((res) => {
    const product = res.searchMarketplaceProducts?.[0]
    if (!variantChoice) {
      variants = [{ marketplaceProductId: product?.id, variant: product?.variants?.[0].id }]
    } else if (variantChoice === 3) {
      variants = [
        { marketplaceProductId: product?.id, variant: product?.variants?.[0].id },
        { marketplaceProductId: product?.id, variant: product?.variants?.[1].id },
        { marketplaceProductId: product?.id, variant: product?.variants?.[2].id },
      ]
    } else {
      variants = [
        { marketplaceProductId: product?.id, variant: product?.variants?.[variantChoice].id },
      ]
    }
    return cy
      .graphqlRequest(CreateApprovedPostalDocument, {
        marketplaceProductId: product?.id,
        data: {
          description: 'Chipotle Description',
          designTemplate: null,
          displayName: 'Chipotle',
          items: variants,
          name: 'Chipotle',
          status: Status.Active,
          teamIds: [],
          version: '2',
        },
      })
      .then((res) => {
        log.set({
          consoleProps() {
            return {
              variant: res.createApprovedPostal.postal.variants?.[0].variantName,
            }
          },
        })
        log.end()
        return res.createApprovedPostal.postal
      })
  })
})
