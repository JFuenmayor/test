import { faker } from '@faker-js/faker'
import { InviteDocument, TeamsDocument } from '../../support/api'
import { FakeUser, userFactory } from '../../support/factories'
import { Marketplace, Navbar, Universal } from '../../support/pageObjects'

describe('Postals Assigned to Teams Testing', function () {
  const user = userFactory()
  let jerseyId: string
  let zzzTeamId: string
  let ZZTopUser: FakeUser
  let JerseyUser: FakeUser
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const universal = new Universal()

  before(function () {
    cy.signup(user)
    cy.teamsSeed(5)
    cy.graphqlRequest(TeamsDocument).then((res) => {
      jerseyId = res.teams?.filter((team) => team.name == 'Jersey')[0]?.id ?? ''
      zzzTeamId = res.teams?.filter((team) => team.name == 'zzzTeam')[0]?.id ?? ''
    })
    Cypress.on('uncaught:exception', () => {
      return false
    })
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBudgetRemaining') {
        req.alias = 'getBudgetRemaining'
      }
    })
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:marketplace:filter')
  })

  it(`tests that the Teams postal that was made in the U/A/M role and assigned to team, Jersey, shows up for users invited to that team and does not show up for other teams`, function () {
    //creates a postal and assigns it to a team
    marketplace.visitAllItems()
    // cy.wait('@getBudgetRemaining')
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('Postcard').should('be.visible')
    marketplace.getPostcardButton().should('be.visible')
    marketplace.getPostcardButton().scrollIntoView()
    marketplace.getPostcardButton().click()
    marketplace.getApproveThisButton().click()
    marketplace.getPostalNameInput().clear().fill('Teams Testing')
    marketplace.getDisplayNameInput().clear().fill('Teams Testing')
    marketplace.getPostalDescriptionInput().clear().fill('Testing Assigned Teams')
    cy.findByTestId('AutoCompleteTeam').scrollIntoView()
    cy.selectAutoCompleteTeam('Jersey')
    marketplace.getSavePostalButton().click()
    cy.wait(500)

    // invites new users to two different teams - one zzzTeam and one Jersey
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: [`${faker.string.uuid()}@postal.dev`],
        teamId: zzzTeamId,
        roles: ['USER'],
      },
    }).then((res) => {
      const invite = res.invite?.[0]
      ZZTopUser = userFactory({
        userName: invite?.emailAddress,
        firstName: 'ZZ',
        lastName: 'Top',
        company: 'ZZTop',
      })
      cy.completeInvitation({
        id: invite?.invite?.id ?? '',
        firstName: ZZTopUser.firstName,
        lastName: ZZTopUser.lastName,
        password: ZZTopUser.password,
      })
      cy.graphqlRequest(InviteDocument, {
        data: {
          emailAddresses: [`${faker.string.uuid()}@postal.dev`],
          teamId: jerseyId,
          roles: ['USER'],
        },
      })
        .then((res) => {
          const invite = res.invite?.[0]
          JerseyUser = userFactory({
            userName: invite?.emailAddress,
            firstName: 'Jess',
            lastName: 'Jersey',
            company: 'JessJersey',
          })
          cy.completeInvitation({
            id: invite?.invite?.id ?? '',
            firstName: JerseyUser.firstName,
            lastName: JerseyUser.lastName,
            password: JerseyUser.password,
          })
        })
        .then(() => {
          cy.login(JerseyUser)
          // tests that the Teams postal that was made in the U/A/M role and assigned to team, Jersey,
          // shows up for users invited to that team.
          marketplace.visitMyItems()
          navbar.getProfileData('Jess Jersey').should('exist')
          cy.get('body').then(($body) => {
            if (!$body.text().includes('Teams Testing')) {
              cy.wait(3100)
              cy.reload()
            }
          })
          marketplace.getNewPostalByName('Teams Testing').should('be.visible')

          //logs in as the zzzTeam user
          cy.login(ZZTopUser)
          // tests that the Teams postal that was made in the U/A/M role and assigned to team, Jersey,
          // does not show up for users invited to a team that is not jersey.
          marketplace.visitMyItems()
          navbar.getProfileData('ZZ Top')
          marketplace.getNewPostalByName('Teams Testing').should('not.exist')
          marketplace.getChangeSearchMessage().should('be.visible')
        })
    })
  })
})
