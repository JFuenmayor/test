import {
  CreateApprovedPostalDocument,
  SearchMarketplaceProductsDocument,
  Status,
  TeamsDocument,
  UpdateRolesV2Document,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import { Marketplace, Navbar, Profile, Universal } from '../../support/pageObjects'

describe('Switch Account test suite', () => {
  const marketplace = new Marketplace()
  const universal = new Universal()
  const profile = new Profile()
  const navbar = new Navbar()
  const user = userFactory()

  let userID: string
  let jerseyId: string
  let zzzTeamId: string

  const truncatedCompany = user.company.slice(0, 12)

  before(() => {
    cy.signup(user)
    cy.currentUser().then((res) => {
      userID = res.userId
    })
    cy.teamsSeed(5)
    //creates a postal an assigns to the Jersey team
    cy.graphqlRequest(TeamsDocument).then((res) => {
      //team names hard coded in teamsSeed
      jerseyId = res.teams?.filter((team) => team.name == 'Jersey')[0]?.id ?? ''
      zzzTeamId = res.teams?.filter((team) => team.name == 'zzzTeam')[0]?.id ?? ''
    })
    cy.graphqlRequest(SearchMarketplaceProductsDocument, {
      filter: { name: { eq: 'Postcard' } },
    }).then((res) => {
      const product = res.searchMarketplaceProducts?.[0]
      cy.graphqlRequest(CreateApprovedPostalDocument, {
        marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id,
        data: {
          name: 'Postcard',
          description: 'Postcard Description',
          status: Status.Active,
          teamIds: [`${jerseyId}`],
          items: [
            { variant: product?.variants?.[0]?.id ?? '', marketplaceProductId: product?.id ?? '' },
          ],
          version: '2',
        },
      })
      //and adds the user to 2 teams
      cy.graphqlRequest(UpdateRolesV2Document, { id: userID, teamId: jerseyId, roles: ['USER'] })
      cy.graphqlRequest(UpdateRolesV2Document, { id: userID, teamId: zzzTeamId, roles: ['USER'] })
    })
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests Account (U/A/M) Team`, () => {
    cy.wait(1000)
    profile.visitProfile()
    universal.getSpinner().should('not.exist')
    //checks signed in Team via seed
    navbar.getProfileData(truncatedCompany).should('exist')
    //checks planned Team switch is avaible via seed
    profile.getTeamsCard().within(() => {
      cy.findByText('Jersey').should('be.visible')
      universal.getRowsInATableBody().should('have.length', 3)
    })
    //tests that the user can see the approved postal while in the Account Team
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Postcard')) {
        cy.wait(3100)
        cy.reload()
        cy.wait(400)
        cy.get('body').then(($body) => {
          if ($body.text().includes('unexpected error')) {
            cy.reload()
          }
        })
      }
    })
    marketplace.getPostcardButton()
    //tests switching from the Account team to the Jersey team
    navbar.getProfileData(truncatedCompany).click()
    cy.findByRole('menu')
      .should('be.visible')
      .within(() => {
        cy.findByRole('menuitem', { name: 'Jersey Budget Disabled Balance $0.00' }).should('exist')
        cy.findByRole('menuitem', { name: 'zzzTeam Budget Disabled Balance $0.00' }).should('exist')
        //Tests to make sure account doesnt change when same account clicked
        cy.contains('[role="menuitem"]', truncatedCompany)
          .should('exist')
          .within(() => {
            cy.contains('Budget').should('exist')
            cy.contains('Disabled').should('exist')
            cy.contains('Balance').should('exist')
            cy.contains('$0.00').should('exist')
          })
        cy.contains('[role="menuitem"]', truncatedCompany).click({ force: true })
      })
    cy.findByRole('menu').should('not.exist')
    navbar.getProfileData(truncatedCompany).should('exist')
    //tests switch account to Jersey
    navbar.getProfileData(truncatedCompany).click()
    cy.findByRole('menu')
      .should('be.visible')
      .within(() => {
        cy.findByRole('menuitem', { name: 'Jersey Budget Disabled Balance $0.00' }).click({
          force: true,
        })
      })
    cy.findByRole('menu').should('not.exist')
    //checks new signed in Team
    navbar.getProfileData(truncatedCompany).should('not.exist')
    navbar.getProfileData('Jersey').should('exist')
    //tests that the user can see the approved postal while in Jersey Team
    marketplace.visitMyItems()
    universal.getSpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Postcard')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    marketplace.getPostcardButton().should('be.visible')
    //tests switching from the Jersey team to the zzzTeam`
    navbar.getProfileData('Jersey').click()
    cy.findByRole('menu')
      .should('be.visible')
      .within(() => {
        cy.findByRole('menuitem', { name: 'zzzTeam Budget Disabled Balance $0.00' }).click({
          force: true,
        })
      })
    cy.findByRole('menu').should('not.exist')
    //checks new signed in Team
    navbar.getProfileData('Jersey').should('not.exist')
    navbar.getProfileData('zzzTeam').should('exist')
    //tests that the user can not see the approved postal while in zzzTeam
    navbar.getMarketplaceLink().click({ force: true })
    cy.wait(200)
    marketplace.getApprovedItemsCheckbox().should('not.be.checked').check({ force: true })
    universal.getSpinner().should('not.exist')
    marketplace.getChangeSearchMessage().should('be.visible')
  })
})
