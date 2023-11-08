import { onlyOn } from '@cypress/skip-test'
import { format } from 'date-fns'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  CreateMagicLinkDocument,
  GetAccountDocument,
  MagicLinkStatus,
  PaymentPartnerType,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import { Delivery, MagicLinks, Reporting, Universal } from '../../support/pageObjects'
import { deleteDownloadsFolder } from '../../support/utils'

const NUM_APPROVED_POSTALS = 4
// items that are truncated using UiTruncate are not fully visible on page
const TRUNCATE_LENGTH = 40

// so we don't need to query it again, we just save this returned from create mutation
const user = userFactory()
let id: string
let shipToName: string
let truncatedItemName: string
let teamID: string
let teamName: string
const userNameForTag = `${user.firstName} ${user.lastName.charAt(0)}.`
//used Page Objects
const reporting = new Reporting()
const universal = new Universal()
const magicLinks = new MagicLinks()
const delivery = new Delivery()
let created: string | null | undefined
// const lastSunday = format(startOfWeek(new Date()), 'yyyy-MM-dd')

describe('Reporting Testing', () => {
  before(() => {
    cy.logUserInfo(user)
    cy.signup(user)
    cy.currentUser().then((res) => {
      id = res.userId
    })
    cy.graphqlRequest(GetAccountDocument).then((res) => {
      created = res.getAccount.created?.dateTime
    })
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 30000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      }
    )
    cy.createAContact({})
    reporting.visitOverview()
    universal.getSpinner().should('not.exist')
    // create postal fulfillments and dependent data
    // the bulk of the heavy-lifting is in this command, current file is mainly for the tests
    cy.createPostalFulfillments({ numberOf: NUM_APPROVED_POSTALS }).then((res: any) => {
      shipToName = res.postalFulfillments[0].shipToName
      truncatedItemName = res.postalFulfillments[0].itemName.slice(0, TRUNCATE_LENGTH - 3)
    })
    //creates the chipotle postal and then creates and accepts a magiclink with it
    cy.createChipotlePostal().then((res: any) => {
      cy.graphqlRequest(CreateMagicLinkDocument, {
        data: {
          name: 'MagicLink 0',
          status: MagicLinkStatus.Active,
          message: 'MagicLink Message',
          approvedPostalId: res?.id,
          variantId: res?.variants?.[0].id,
        },
      })
    })
    onlyOn(Cypress.env('testUrl'), () => {
      magicLinks.visitMagicLinks()
      cy.contains('tr', 'MagicLink 0')
        .find('button')
        .then(($link: any) => {
          delivery.visit($link.attr('title'))
        })
      cy.acceptingMagicLink({ needAddress: false })
      delivery.getSubmitButton().click()
      cy.wait(300)
      delivery.getComingSoonToYourInboxText().should('exist')
      delivery.getThanksInput().type('Thank You!', { force: true })
      delivery.getSendMessageButton().click({ force: true }).should('not.have.attr', 'data-loading')
      delivery.getHeresWhatYouSaidSection().should('be.visible')
      cy.on('window:before:load', (win) => {
        cy.stub(win, 'open').callsFake(cy.stub())
      })
      delivery.getLinkedInButton().click()
    })
    cy.usersSeed({})
    cy.teamsSeed().then((resp) => {
      teamID = resp.id
      teamName = resp.name
    })
  })

  after(() => {
    cy.filterLocalStorage('postal:reporting:tab')
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`Order Report`, () => {
    Cypress.on('uncaught:exception', () => {
      return false
    })
    //clicks Order Report tab
    reporting.visitReporting()
    reporting.getDashboardTab().should('not.exist')
    universal.getSpinner().should('not.exist')
    reporting.getRecentExportsTab().should('exist')
    reporting.getOverviewTab().should('exist')
    reporting.getSummaryTab().should('exist')
    reporting.getRecentActivityTab().should('exist')
    reporting.getOrderReportTab().click({ force: true })
    //tests that the correct number of postal fulfillments are in the table
    universal.getNoItemsMessage().should('not.exist')
    onlyOn(Cypress.env('testUrl'), () => {
      universal.getRowsInATableBody().should('have.length', NUM_APPROVED_POSTALS)
    })
    onlyOn(Cypress.env('localHostUrl'), () => {
      universal.getRowsInATableBody().should('have.length', NUM_APPROVED_POSTALS - 1)
    })
    //tests that the table's rows contains some of the correct data
    cy.contains('tr', truncatedItemName).within(() => {
      cy.contains('a', truncatedItemName)
      cy.contains('a', shipToName)
    })
    universal.getRowByText('Notecard').should('exist')
    universal.getRowByText('Postcard').should('exist')
    //tests that clicking on the itemName opens a modal
    cy.contains('a', truncatedItemName).click({ force: true })
    //tests that the opened modal has the title "View Order"
    universal.getViewOrderModal().within(() => {
      cy.contains(truncatedItemName).should('be.visible')
    })
    //tests that clicking on the contact name navigates to the contact's page
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    cy.contains('tr', truncatedItemName).within(() => {
      cy.contains('a', shipToName).click()
    })
    universal.getSpinner().should('not.exist')
    cy.url().should('contain', '/contacts')
    universal.getSpinner().should('not.exist')
    cy.contains(shipToName).should('be.visible')

    //tests clicking on the mocked campaign name navigates to the campaign's page
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsMockB.json',
      count: 3,
    })
    cy.graphqlMockStart()
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    reporting
      .getOrderReportTable()
      .should('be.visible')
      .within(() => {
        //hardcoded in mock
        cy.contains('Lurline Tromp', { timeout: 84000 }).should('exist')
        cy.contains('a', `Campaign 11/8/2020`)
      })
    cy.graphqlMockClear()
    //clicking on the mocked magiclink name navigates to the magiclink's page
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsMockB.json',
      count: 4,
    })
    cy.graphqlMockStart()
    reporting.visitOrderReports()
    reporting
      .getOrderReportTable()
      .should('be.visible')
      .within(() => {
        //hardcoded in mock
        cy.contains('a', `MagicLink 11/10/2020`).click({ force: true })
      })
    //mocked so this page won't entirely render, can only check url
    cy.url().should('contain', '/links')
    cy.graphqlMockClear()
    //tests sorting by date via mocked api responses
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsMockB.json',
      count: 5,
    })
    cy.graphqlMockStart()
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    universal.waitForProgressBar()
    //dates hardcoded in mock
    universal.getRowByNumber(0).should('contain', '11/10/2020')
    universal.getRowByNumber(1).should('contain', '11/9/2020')
    cy.graphqlMockClear()
    cy.graphqlMockSet({
      operationName: 'searchPostalFulfillments',
      fixture: 'searchPostalFulfillmentsMockC.json',
      count: 2,
    })
    cy.graphqlMockStart()
    reporting.getSortByDate().click({ force: true })
    universal.waitForProgressBar()
    universal.getRowByNumber(0).should('contain', '11/8/2020')
    universal.getRowByNumber(1).should('contain', '11/9/2020')
    cy.graphqlMockClear()
    //checks if download of a report with filters applied downloads successfully
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    cy.findByRole('button', { name: 'Show Filters', timeout: 34000 }).click()
    cy.selectAutoCompleteItem('Brochure')
    universal.getRowsInATableBody().should('have.length', 1).and('contain', 'Brochure')
    reporting.getExportButton().click({ force: true })
    reporting.getGeneratingAlert()
    universal.getThingSpinner().should('not.exist')
    onlyOn(Cypress.env('testUrl'), () => {
      //checks if download of a report with filters downloads successfully
      cy.verifyDownload('Postal Order Report', { contains: true, timeout: 25000, interval: 600 })
      //deletes the downloadFolder so that it should be completely empty for any new verification that might occur
      deleteDownloadsFolder()
    })
  })
  it(`Recent Exports`, () => {
    //exporting reports and recent exports list testing
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    reporting.getRecentExportsTab().click({ force: true })
    universal.getNoItemsMessage().should('be.visible')
    reporting.getOrderReportTab().click({ force: true })
    reporting.getExportButton().click({ force: true })
    reporting.getGeneratingAlert()
    universal.getThingSpinner().should('not.exist')
    onlyOn(Cypress.env('testUrl'), () => {
      //checks if download of a report without filters downloads successfully
      cy.verifyDownload('Postal Order Report', { contains: true, timeout: 25000, interval: 600 })
      //deletes the downloadFolder so that it should be completely empty for any new verification that might occur
      deleteDownloadsFolder()
    })
    reporting.getRecentExportsTab().click({ force: true })
    universal.getSpinner().should('not.exist')
    universal
      .getRowsInATableBody()
      .should('have.length', 2)
      .and('contain', `Order Report ${format(new Date(), 'MM-dd-yyyy')}`)
    cy.contains('Saved Exports').find('svg').realHover()
    cy.contains('View previously generated reports').should('exist')
  })
  it(`Summary`, () => {
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    Cypress.on('uncaught:exception', () => {
      return false
    })
    //tests the tab
    reporting.getSummaryTab().should('be.visible').click().and('have.attr', 'aria-selected', 'true')
    universal.getSpinner().should('not.exist')
    //tests rendering of radios and filters
    reporting.getDisplayByDiv().within(() => {
      reporting.getTeamRadio().should('not.be.checked')
      reporting.getUserRadio().should('be.checked')
    })
    reporting.getFilterByText().should('exist')
    reporting.getSelectATeamButton().should('exist')
    reporting.getThisMonthButton().should('exist')
    reporting.getSelectAUserButton().should('exist')
    reporting.getTeamRadio().check({ force: true })
    reporting.getSelectAUserButton().should('not.exist')
    reporting.getThisMonthButton().should('exist')
    reporting.getSelectATeamButton().should('exist')
    cy.graphqlMockSet({
      operationName: 'userAnalyticsV2',
      fixture: 'userAnalyticsV2SummaryMock.json',
      count: 100,
    })
    cy.graphqlMockSet({
      operationName: 'postalAnalyticsV2',
      fixture: 'postalAnalyticsV2MockSummary.json',
      count: 100,
    })
    cy.graphqlMockStart()
    reporting.visitSummary()
    universal.getSpinner().should('not.exist')
    reporting
      .getSummaryRowByText('Allan Gerlach')
      .as('tableHeader')
      .should('be.visible')
      .scrollIntoView()
      .and('contain', 'Aymeris Arnold')
      .and('contain', 'Elio Emmerick')
      .and('contain', 'Peter Harper')
      .and('contain', 'Sandra Parker')
    reporting
      .getSummaryRowByText('Accepted')
      .scrollIntoView()
      .should('contain', '1023')
      .and('contain', '0')
      .and('contain', '80')
      .and('contain', '100')
      .and('contain', '233')
    reporting.getSummaryRowByText('Engagement').within(() => {
      reporting
        .getCellByText('Thank yous56')
        .should('contain', 'Social share34')
        .and('contain', 'New contacts101')
      reporting
        .getCellByText('Thank yous0')
        .should('contain', 'Social share0')
        .and('contain', 'New contacts0')
      reporting
        .getCellByText('Thank yous11')
        .should('contain', 'Social share7')
        .and('contain', 'New contacts1111')
      reporting
        .getCellByText('Thank yous83')
        .should('contain', 'Social share406')
        .and('contain', 'New contacts37')
      reporting
        .getCellByText('Thank yous68')
        .should('contain', 'Social share888')
        .and('contain', 'New contacts2')
    })
    reporting
      .getSummaryRowByText('Spend')
      .scrollIntoView()
      .should('contain', '$8,900')
      .and('contain', '$0')
      .and('contain', '$946')
      .and('contain', '$1,458')
      .and('contain', '$3,704')
    reporting.getMagicLinkSummaryRow().within(() => {
      reporting.getCellByText('Viewed5').should('contain', 'Accepted88')
      reporting.getCellByText('Viewed0').should('contain', 'Accepted0')
      reporting.getCellByText('Viewed324').should('contain', 'Accepted44')
      reporting.getCellByText('Viewed24').should('contain', 'Accepted66')
      reporting.getCellByText('Viewed2345').should('contain', 'Accepted77')
    })
    reporting
      .getSummaryRowByText('Avg Item Cost')
      .scrollIntoView()
      .should('contain', '$9')
      .and('contain', '$0')
      .and('contain', '$12')
      .and('contain', '$15')
      .and('contain', '$16')
    reporting
      .getSummaryRowByText('Meetings Booked')
      .scrollIntoView()
      .should('contain', '23')
      .and('contain', '0')
      .and('contain', '59')
      .and('contain', '27')
      .and('contain', '53')
    reporting.getSummaryRowByText('Popular Items').within(() => {
      cy.findByRole('combobox')
        .should('have.value', 'Overall Accepted')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['Overall Accepted', 'Magic Links', 'Gift Emails'])
        })
      cy.contains('Thank-You Stripes').should('exist')
      cy.contains('div', '6').should('contain', 'Accepted')
    })
    reporting.getTeamRadio().check({ force: true })
    cy.contains('Allan Gerlach', { timeout: 50000 }).should('not.exist')
    cy.contains(user.company, { timeout: 50000 }).should('exist')
    cy.graphqlMockClear()
  })
  it(`Impact and ROI`, () => {
    //Some Assumptions - the existing mocks in impact/mocks will always be avaible on the test env
    //02012023 above mocks removed, affected assertions commented out
    //tests Impact and ROI
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    Cypress.on('uncaught:exception', () => {
      return false
    })
    //tests the tab
    reporting
      .getImpactAndROITab()
      .should('be.visible')
      .click()
      .and('have.attr', 'aria-selected', 'true')
    universal.getSpinner().should('not.exist')
    reporting.getWonRevenueCard().should('contain', '$0')
    //'$2,100,000')
    reporting.getClosedWonDealsCard().should('contain', '0')
    reporting.getOpenPipelineCard().should('exist')
    reporting.getDirectMailPipeLineCard().should('exist')
    reporting.getPostalInfluencedOppsByRepCard().should('exist')
    cy.contains('These stats will show once we have collected').should('exist')
    // reporting.getOpenPipelineCard().within(() => {
    //   const phases = [
    //     'Needs Analysis',
    //     'Proposal/Price Quote',
    //     'Negotiation/Review',
    //     'Magic Phase',
    //     'The End Game',
    //     'Super End Game',
    //     'Mega End Game',
    //   ]
    //   phases.forEach((phase) => {
    //     cy.contains(phase).should('exist')
    //   })
    //   const money = ['680k', '270k', '400k', '350k', '250k', '150k', '100k']
    //   money.forEach((investment) => {
    //     cy.contains(investment).should('exist')
    //   })
    //   //tests a couple of tooltips
    //   reporting.showFunnelChartTooltipByOddNumber(0)
    // })
    // reporting.getStageTooltip().within(() => {
    //   cy.contains('Needs Analysis').should('exist')
    //   cy.contains('div', 'Total Amount').should('contain', '$675,000')
    //   cy.contains('div', '(41.2% of $1.6M)').should('exist')
    // })
    // reporting.getOpenPipelineCard().within(() => {
    //   reporting.showFunnelChartTooltipByOddNumber(1)
    // })
    // reporting.getStageTooltip().within(() => {
    //   cy.contains('Proposal/Price Quote').should('exist')
    //   cy.contains('div', 'Total Amount').should('contain', '$270,000')
    //   cy.contains('div', '(16.5% of $1.6M)').should('exist')
    // })
    // reporting.getClosedWonDealsCard().should('contain', '6')
    // reporting.getDirectMailPipeLineCard().within(() => {
    //   const campaigns = [
    //     'Awesome Campaign',
    //     'Not as Awesome',
    //     'Potatoes',
    //     'Potatoes1',
    //     'Potatoes2',
    //     'Potatoes3',
    //     'Potatoes4',
    //     'Potatoes5',
    //     'Potatoes6',
    //     'Potatoes7',
    //   ]
    //   campaigns.forEach((campaign) => {
    //     cy.contains(campaign).should('exist')
    //   })
    //   const costs = ['$1.2M', '$395K', '$56K']
    //   costs.forEach((cost) => {
    //     cy.contains(cost).should('exist')
    //   })
    //   cy.contains('$1.7M').should('exist')
    //   //tests a couple of tooltips
    //   reporting.showPieChartTooltip(10)
    // })
    // reporting.getCampaignTooltip().within(() => {
    //   cy.contains('Awesome Campaign').should('exist')
    //   cy.contains('div', 'Sum of Amount').should('contain', '$1,230,000')
    //   cy.contains('div', '(74.5% of $1.7M)').should('exist')
    // })
    // reporting.getDirectMailPipeLineCard().within(() => {
    //   reporting.showPieChartTooltip(11)
    // })
    // reporting.getCampaignTooltip().within(() => {
    //   cy.contains('Not as Awesome').should('exist')
    //   cy.contains('div', 'Sum of Amount').should('contain', '$394,830')
    //   cy.contains('div', '(23.9% of $1.7M)').should('exist')
    // })
    // reporting.getPostalInfluencedOppsByRepCard().within(() => {
    //   const names = ['dusty doris', 'monkey bunny', 'hello there', 'dusty doris 2', 'monkey bunny 2', 'hello there 2']
    //   names.forEach((name) => {
    //     cy.contains(name).should('exist')
    //   })
    //   const opps = ['6', '4', '2']
    //   opps.forEach((opp) => {
    //     cy.findAllByText(opp).should('have.length', '2')
    //   })
    //   cy.contains('12').should('exist')
    //   //tests a couple of tooltips
    //   reporting.showPieChartTooltip(6)
    // })
    // reporting.getOppsTooltip().within(() => {
    //   cy.contains('dusty doris').should('exist')
    //   cy.contains('div', 'Record Count').should('contain', '6')
    //   cy.contains('div', '(50% of 12)').should('exist')
    // })
    // reporting.getPostalInfluencedOppsByRepCard().within(() => {
    //   reporting.showPieChartTooltip(7)
    // })
    // reporting.getOppsTooltip().within(() => {
    //   cy.contains('monkey bunny').should('exist')
    //   cy.contains('div', 'Record Count').should('contain', '4')
    //   cy.contains('div', '(33.3% of 12)').should('exist')
    // })
    // //tests the refresh button
    // cy.intercept('/engage/api/graphql', (req) => {
    //   if (req.body.operationName === 'getBudgetRemaining') {
    //     req.alias = 'getBudgetRemaining'
    //   }
    //   if (req.body.operationName === 'getBalanceRemaining') {
    //     req.alias = 'getBalanceRemaining'
    //   }
    // })
    // cy.contains('div', 'Report Run:').within(() => {
    //   cy.findByRole('button').click()
    //   cy.waitFor('@getBudgetRemaining')
    //   cy.waitFor('@getBalanceRemaining')
    // })
    // cy.findByRole('tooltip', { name: 'Re-Run Report' }).scrollIntoView().should('exist')
    // cy.contains('div', 'Report Run:').within(() => {
    //   cy.get('svg').eq(0).realHover()
    // })
    // cy.findByRole('tooltip', {
    //   name: 'Salesforce reports are kept for up to 6 hours. Click the Re-Run Report button to the right for the most up-to-date data.',
    // }).should('exist')
  })
  it(`Recent Activity`, () => {
    //tests recent Activity
    reporting.visitOrderReports()
    universal.getSpinner().should('not.exist')
    Cypress.on('uncaught:exception', () => {
      return false
    })
    //tests the tab
    reporting
      .getRecentActivityTab()
      .should('be.visible')
      .click()
      .and('have.attr', 'aria-selected', 'true')
    universal.getSpinner().should('not.exist')
    reporting.getSelectATypeButton().click()
    cy.findByRole('checkbox', { name: 'Delivered' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Delivered' }).should('be.checked')
    reporting.getNoRecentActivityText().should('exist')
    reporting.getLinkByName(shipToName).should('not.exist')
    cy.contains('button', 'Type').should('contain', '(1)')
    cy.findByRole('checkbox', { name: 'Delivered' }).uncheck({ force: true })
    cy.findByRole('checkbox', { name: 'Delivered' }).should('not.be.checked')
    cy.findByRole('checkbox', { name: 'Update' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Update' }).should('be.checked')
    cy.contains('button', 'Type').should('contain', '(1)')
    reporting.getNoRecentActivityText().should('not.exist')
    reporting.getLinkByName(shipToName).should('not.exist')
    //tests that the select a team and select a user buttons exist
    reporting.getUserRadio().should('not.exist')
    reporting.getTeamRadio().should('not.exist')
    reporting.getSelectATeamButton().should('exist')
    reporting.getSelectAUserButton().should('exist')
    reporting.getResetAlllLink().should('exist')
    // onlyOn(Cypress.env('testUrl'), () => {
    //   reporting.getLinkByName('Daniel Davis').should('exist')
    //   //tests filtering by Team
    //   reporting.getSelectATeamButton().click()
    //   cy.findByRole('checkbox', { name: user.company }).check({ force: true }).should('be.checked')
    //   reporting.getNoRecentActivityText().should('exist')
    //   reporting.getTeamsFilterPopover().within(() => {
    //     reporting.getClearButton().click({ force: true })
    //   })
    //   reporting.getLinkByName('Daniel Davis').should('exist')
    // })
    //tests the Actions' filters via mocked calls
    cy.graphqlMockSet({
      operationName: 'searchActivityStream',
      count: 8,
      fixture: 'searchActivityStreamMock.json',
    })
    cy.graphqlMockStart()
    reporting.visitRecentActivity()
    //hardcoded in mock
    cy.wait(300)
    cy.contains('Zieme Ambrose').should('exist')
    cy.graphqlMockSet({
      operationName: 'searchActivityStream',
      count: 1,
      fixture: 'searchActivityStreamDeliveredMock.json',
    })
    reporting.getSelectATypeButton().click()
    cy.findByRole('checkbox', { name: 'Delivered' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Delivered' }).should('be.checked')
    reporting.getAllActivityItems().should('have.length', '1').and('contain', 'Delivered')
    cy.graphqlMockSet({
      operationName: 'searchActivityStream',
      count: 1,
      fixture: 'searchActivityStreamActionMock.json',
    })
    cy.findByRole('checkbox', { name: 'Delivered' }).uncheck({ force: true })
    cy.findByRole('checkbox', { name: 'Delivered' }).should('not.be.checked')
    cy.findByRole('checkbox', { name: 'Action' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Action' }).should('be.checked')
    reporting.getAllActivityItems().should('have.length', '1').and('contain', 'Action')
    cy.graphqlMockSet({
      operationName: 'searchActivityStream',
      count: 1,
      fixture: 'searchActivityStreamUpdateMock.json',
    })
    cy.findByRole('checkbox', { name: 'Action' }).uncheck({ force: true })
    cy.findByRole('checkbox', { name: 'Action' }).should('not.be.checked')
    cy.findByRole('checkbox', { name: 'Update' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Update' }).should('be.checked')
    reporting.getAllActivityItems().should('have.length', '1').and('contain', 'Update')
    cy.graphqlMockSet({
      operationName: 'searchActivityStream',
      count: 1,
      fixture: 'searchActivityStreamMock.json',
    })
    cy.findByRole('checkbox', { name: 'Update' }).should('be.checked')
    cy.findByRole('checkbox', { name: 'Action' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Action' }).should('be.checked')
    cy.findByRole('checkbox', { name: 'Delivered' }).check({ force: true })
    cy.findByRole('checkbox', { name: 'Delivered' }).should('be.checked')
    reporting.getAllActivityItems().should('have.length', '4')
    cy.graphqlMockClear()
    //tests an Activity Stream item's Action Links via mocked calls
    cy.graphqlMockSet({
      operationName: 'searchActivityStream',
      fixture: 'searchActivityStreamMock.json',
      count: 8,
    })
    cy.graphqlMockStart()
    reporting.visitRecentActivity()
    universal.getSpinner().should('not.exist')
    //no longer works with the mock
    //tests the prompt update a contact with a verified address links to the contact
    // reporting.getLinkByName('update').click({ force: true })
    // reporting.getBackToActivityStreamButton().should('exist')
    // contacts.getOldOrdersSection().should('exist')
    // reporting.visitRecentActivity()
    // universal.getSpinner().should('not.exist')
    // tests a contact link in Recent Activity
    cy.contains('Zieme Ambrose').should('exist')
    //vv flaky
    // cy.findAllByRole('link', { name: 'Zieme Ambrose' }).eq(0).click({ force: true })
    // cy.url().should('contain', '/contacts/')
    cy.graphqlMockClear()
    //tests a postal/item link in Recent Activity
    //    onlyOn(Cypress.env('testUrl'), () => {
    //     reporting.visitRecentActivity()
    //     reporting
    //       .getLinkByName('Chipotle')
    //       .should('be.visible')
    //       .then(($Chipotle) => {
    //         if ($Chipotle.length === 1) {
    //           cy.wrap($Chipotle).click()
    //         } else {
    //           cy.wrap($Chipotle).eq(1).click()
    //         }
    //       })
    //     cy.findByRole('heading', { name: 'Chipotle' })
    //     marketplace.getEditButton().should('exist')
    //     cy.url().should('contain', '/postals/')
    //   })
    // })
  })
  it(`Overview`, () => {
    //tests what can be tested without mocking
    //clicks Overview tab from reporting
    Cypress.on('uncaught:exception', () => {
      return false
    })
    reporting.visitReporting()
    universal.getSpinner().should('not.exist')
    reporting
      .getOverviewTab()
      .should('be.visible')
      .click()
      .and('have.attr', 'aria-selected', 'true')
    universal.getAllUiCards().should('have.length', 7)
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'userAnalyticsV2') {
        req.alias = 'userAnalyticsV2'
      }
    })
    //tests rendering of radios and filters
    reporting.getDisplayByDiv().within(() => {
      reporting.getTeamRadio().should('not.be.checked')
      reporting.getUserRadio().should('be.checked')
    })
    reporting.getFilterByText().should('exist')
    reporting.getSelectATeamButton().should('exist')
    reporting.getThisMonthButton().should('exist')
    reporting.getSelectAUserButton().should('exist')
    reporting.getTeamRadio().check({ force: true })
    //not sure groupby is the right field to be checking here
    //cy.wait('@userAnalyticsV2').its('request.body.variables.config.groupBy').should('eq', 'TEAM')
    reporting.getDisplayByDiv().within(() => {
      reporting.getTeamRadio().should('exist').and('be.checked')
      reporting.getUserRadio().should('exist')
      reporting.getSelectAUserButton().should('not.exist')
    })
    reporting.getSelectATeamButton().should('exist')
    reporting.getThisMonthButton().should('exist')
    universal.getSpinner().should('not.exist')
    //tests going back to the user radio default and the resulting api request
    reporting.getUserRadio().click({ force: true })
    //pollForRequest('equals', 'groupBy', 'USER')
    //tests the Select A Team filter rendering and api requests
    reporting.getSelectATeamButton().click()
    reporting.getTeamsFilterPopover().within(() => {
      cy.findByRole('searchbox').should('exist')
      reporting.getShowingAllTeamsText().should('exist')
      cy.findAllByRole('checkbox').should('have.length', 16)
      cy.findByRole('searchbox').type(teamName)
      cy.findAllByRole('checkbox').should('not.have.length', 16)
      cy.findByRole('checkbox', { name: teamName }).should('exist')
      cy.findByRole('searchbox').clear()
      cy.findAllByRole('checkbox').should('have.length', 16)
      cy.findByRole('checkbox', { name: user.company }).should('exist')
      universal.getUITagByText(teamName).should('not.exist')
      reporting.getClearButton().should('not.exist')
      cy.findByRole('checkbox', { name: teamName }).scrollIntoView()
      cy.findByRole('checkbox', { name: teamName }).check({ force: true })
    })
    universal.getSpinner().should('not.exist')
    pollForRequest('notUndefined', 'teamIds.0', teamID)
    cy.contains('button', 'Team').should('contain', '(1)')
    reporting.getTeamsFilterPopover().within(() => {
      cy.get('li').should('have.length', 1)
      cy.contains('li', teamName).should('exist')
      reporting.getShowingAllTeamsText().should('not.exist')
      reporting.getClearButton().should('exist')
      cy.findByRole('checkbox', { name: 'Jersey' }).scrollIntoView()
      cy.findByRole('checkbox', { name: 'Jersey' }).check({ force: true })
    })
    universal.getSpinner().should('not.exist')
    pollForRequest('length', 'teamIds', teamID)
    cy.contains('button', 'Team').should('contain', '(2)')
    reporting.getTeamsFilterPopover().within(() => {
      cy.get('li').should('have.length', 2)
      cy.contains('li', 'Jersey').should('exist')
      cy.contains('li', teamName).within(() => {
        universal.getCloseButtonByLabelText().click({ force: true })
      })
      cy.contains('li', teamName).should('not.exist')
      cy.contains('li', 'Jersey').should('exist')
    })
    cy.contains('button', 'Team').should('contain', '(1)')
    reporting.getTeamsFilterPopover().within(() => {
      reporting.getClearButton().click()
    })
    cy.contains('li', 'Jersey').should('not.exist')
    cy.contains('button', 'Select a Team').should('exist')
    //click away from open dialog and closes it
    reporting.getFilterByText().click({ force: true })
    universal.getSpinner().should('not.exist')
    //tests the Select A User filter rendering and api requests
    reporting.getSelectAUserButton().focus().click()
    reporting.getUsersFilterPopover().within(() => {
      reporting.getShowingAllUsersText().should('exist')
      cy.findAllByRole('checkbox').should('have.length', 16)
      //search by first name
      cy.findByRole('searchbox').type(user.firstName)
      cy.findAllByRole('checkbox').should('have.length', 1)
      cy.contains('label', `${user.firstName} ${user.lastName}`).should('exist')
      //search by last name
      cy.findByRole('searchbox').clear()
      cy.findAllByRole('checkbox').should('have.length', 16)
      cy.findByRole('searchbox').type(user.lastName)
      cy.findAllByRole('checkbox').should('have.length.lte', 2)
      cy.contains('label', `${user.firstName} ${user.lastName}`).should('exist')
      //search by email
      cy.findByRole('searchbox').clear()
      cy.findAllByRole('checkbox').should('have.length', 16)
      cy.findByRole('searchbox').type(user.userName)
      cy.findAllByRole('checkbox').should('have.length', 1)
      cy.contains('label', `${user.firstName} ${user.lastName}`).should('exist')
      cy.findByRole('searchbox').clear()
      cy.findAllByRole('checkbox').should('have.length', 16)
      universal.getUITagByText(userNameForTag).should('not.exist')
      reporting.getClearButton().should('not.exist')
      cy.contains('label', `${user.firstName} ${user.lastName}`).scrollIntoView()
      cy.contains('label', `${user.firstName} ${user.lastName}`)
        .find('input')
        .check({ force: true })
    })
    universal.getSpinner().should('not.exist')
    pollForRequest('notUndefined', 'userIds.0', id)
    cy.contains('button', 'User').should('contain', '(1)')
    reporting.getUsersFilterPopover().within(() => {
      cy.get('li').should('have.length', 1)
      cy.contains('li', userNameForTag).should('exist')
      reporting.getShowingAllTeamsText().should('not.exist')
      reporting.getClearButton().should('exist')
      cy.contains('label', 'Aymeris Arnold').scrollIntoView()
      cy.contains('label', 'Aymeris Arnold').find('input').check({ force: true })
    })
    universal.getSpinner().should('not.exist')
    pollForRequest('length', 'userIds', id)
    cy.contains('button', 'User').should('contain', '(2)')
    reporting.getUsersFilterPopover().within(() => {
      cy.get('li').should('have.length', 2)
      cy.contains('li', 'Aymeris A.').should('exist')
      cy.contains('li', userNameForTag).within(() => {
        universal.getCloseButtonByLabelText().click({ force: true })
      })
      cy.contains('li', userNameForTag).should('not.exist')
      cy.contains('li', 'Aymeris A.').should('exist')
    })
    cy.contains('button', 'User').should('contain', '(1)')
    reporting.getUsersFilterPopover().within(() => {
      reporting.getClearButton().click()
    })
    cy.contains('li', 'Aymeris A.').should('not.exist')
    reporting.getSelectAUserButton().should('exist')
    //2 for date range button and dropdown and third for the visual indicator at top of table
    cy.findAllByText('This Month').should('have.length', 3)
    //tests the Date filter rendering and api requests
    reporting.getThisMonthButton().click()
    reporting.getDateFilterPopover().within(() => {
      cy.findByLabelText('Date Range')
        .should('have.value', 'This Month')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq([
            'All Time',
            'Today',
            'This Week',
            'This Month',
            'This Quarter',
            'This Year',
            'Custom',
          ])
        })
      cy.findByLabelText('Date Range').select('All Time')
      pollForRequest('equals', 'startDate', created)
    })
    universal.getSpinner().should('not.exist')
    //tests the rendering and api for frequency in the meetings booked card
    reporting.getMeetingsBookedCard().within(() => {
      cy.findByText('Frequency:').scrollIntoView()
      cy.findByText('Frequency:').should('exist')
      cy.findByRole('radio', { name: 'Daily' }).should('exist')
      cy.findByRole('radio', { name: 'Weekly' }).should('be.checked')
      cy.findByRole('radio', { name: 'All' }).should('exist')
      cy.findByRole('radio', { name: 'Yearly' }).should('exist')
      cy.findByRole('radio', { name: 'Monthly' }).check({ force: true })
      pollForRequest('equals', 'granularity', 'MONTHLY')
    })
    reporting.getAllTimeButton().click()
    cy.findByLabelText('Date Range').select('This Week')
    cy.wait(['@userAnalyticsV2', '@userAnalyticsV2'])
    universal.getSpinner().should('not.exist')
    // onlyOn(Cypress.env('testUrl'), () => {
    //   //tests that accepted magiclinks info is reflected in the overview page
    //   //not mocked, info added through seed
    //   reporting.getEngagementCard().within(() => {
    //     reporting.getThankYousInfo().should('contain', '1')
    //     reporting.getSocialSharesInfo().should('contain', '1')
    //     reporting.getNewContactsInfo().should('contain', '1')
    //   })
    //   reporting.getMagicLinksCard().within(() => {
    //     reporting.getNewContactsInfo().should('contain', '1')
    //     reporting.getViewsInfo().should('contain', '1')
    //   })
    // })
    //starts the mock
    cy.graphqlMockSet({
      operationName: 'userAnalyticsV2',
      fixture: 'userAnalyticsV2Mock.json',
      count: 100,
    })
    cy.graphqlMockSet({
      operationName: 'postalAnalyticsV2',
      fixture: 'postalAnalyticsV2Mock.json',
      count: 100,
    })
    cy.graphqlMockStart()
    reporting.visitOverview()
    reporting.getOverviewTab().should('have.attr', 'aria-selected', 'true')
    universal.getAllUiCards().should('have.length', 7)
    //all metrics hardcoded in the mock
    reporting.getGiftEmailSendsCard().within(() => {
      reporting.getSentGraphColor().should('exist')
      reporting.getAcceptedGraphColor().should('exist')
      cy.contains('90').should('exist')
    })
    reporting.getSpendCard().within(() => {
      cy.contains('$2,931').should('exist')
    })
    reporting.getMeetingsBookedCard().within(() => {
      cy.contains('3').should('exist')
    })
    reporting.getEngagementCard().within(() => {
      reporting.getThankYousInfo().should('contain', '3')
      reporting.getSocialSharesInfo().should('contain', '2')
      reporting.getNewContactsInfo().should('contain', '15')
    })
    reporting.getMostPopularSendsCard().within(() => {
      reporting.getGiftEmailsColumn().within(() => {
        cy.findAllByRole('img').should('have.length', 5)
        reporting.getAtomicHabitsItemInfo().within(() => {
          reporting.getSentInfo().should('contain', '20')
          reporting.getAcceptedInfo().should('contain', '14')
          reporting.getRateInfo().should('contain', '70%')
        })
        reporting.getHotHoneyItemInfo().within(() => {
          reporting.getSentInfo().should('contain', '2')
          reporting.getAcceptedInfo().should('contain', '0')
          reporting.getRateInfo().should('contain', '0%')
        })
        reporting.getTheBestThingsItemInfo().within(() => {
          reporting.getSentInfo().should('contain', '1')
          reporting.getAcceptedInfo().should('contain', '1')
          reporting.getRateInfo().should('contain', '100%')
        })
      })
      reporting.getMagicLinksColumn().within(() => {
        cy.findAllByRole('img').should('have.length', 5)
        reporting.getAtomicHabitsItemInfo().within(() => {
          reporting.getViewsInfo().should('contain', '12')
          reporting.getAcceptedInfo().should('contain', '8')
          reporting.getRateInfo().should('contain', '67%')
        })
        reporting.getTreatYoElfItemInfo().within(() => {
          reporting.getViewsInfo().should('contain', '0')
          reporting.getAcceptedInfo().should('contain', '0')
          reporting.getRateInfo().should('contain', '0%')
        })
      })
      reporting.getOverallAcceptedColumn().within(() => {
        cy.findAllByRole('img').should('have.length', 5)
        reporting.getAtomicHabitsItemInfo().within(() => {
          reporting.getAcceptedInfo().should('contain', '22')
        })
      })
    })
    reporting.getGiftEmailsCard().within(() => {
      reporting.getSentInfo().should('contain', '90')
      reporting.getTotalOpensInfo().should('contain', '77')
      reporting.getTotalClicksInfo().should('contain', '72')
      reporting.getTotalAcceptancesInfo().should('contain', '68')
      reporting.getOpenRate().should('contain', '86%')
      reporting.getClickRate().should('contain', '80%')
      reporting.getAcceptanceRate().should('contain', '76%')
    })
    reporting.getMagicLinksCard().within(() => {
      reporting.getViewsInfo().should('contain', '9')
      reporting.getAcceptedInfo().should('contain', '12')
      reporting.getNewContactsInfo().should('contain', '18')
    })
  })
})

const pollForRequest = (switchCase: string, keys?: string, value?: string | null) => {
  switch (switchCase) {
    case 'length':
      cy.wait('@userAnalyticsV2').then((request) => {
        const body = request.request.body.variables.config
        const keysA = keys ? keys : 'undefined'
        if (body[keysA].length != 2) {
          pollForRequest(switchCase, keys, value)
        } else {
          cy.wrap(body).its(`${keysA}.0`).should('eq', value)
          cy.wrap(body).its(`${keysA}.1`).should('exist').and('not.eq', value)
        }
      })
      break
    case 'notUndefined':
      cy.wait('@userAnalyticsV2').then((request) => {
        const body = request.request.body.variables.config
        const keysA = keys ? keys : 'undefined.undefined'
        const itsKeys = keysA.split('.')
        if (body[itsKeys[0]] === undefined) {
          pollForRequest(switchCase, keys, value)
        } else {
          cy.wrap(body).its(keysA).should('eq', value)
        }
      })
      break
    case 'equals':
      cy.wait('@userAnalyticsV2').then((request) => {
        const body = request.request.body.variables.config
        const keysA = keys ? keys : 'undefined'
        if (body[keysA] !== value) {
          pollForRequest(switchCase, keys, value)
        } else {
          cy.wrap(body).its(keysA).should('eq', value)
        }
      })
      break
  }
}
