export default class Reporting {
  visitReporting() {
    return cy.visit('/reporting')
  }
  visitOrderReports() {
    return cy.visit('/reporting/orders')
  }
  visitOverview() {
    return cy.visit('/reporting/overview')
  }
  visitSummary() {
    return cy.visit('/reporting/summary')
  }
  visitRecentActivity() {
    return cy.visit('/reporting/recent-activity')
  }
  visitImpactAndROI() {
    return cy.visit('/reporting/impact')
  }
  //Tabs
  getOrderReportTab() {
    return cy.findByRole('tab', { name: 'Order Report' })
  }
  getDashboardTab() {
    return cy.findByRole('tab', { name: /^Dashboard$/i })
  }
  getRecentExportsTab() {
    return cy.findByRole('tab', { name: /^Recent Exports$/i })
  }
  getOverviewTab() {
    return cy.findByRole('tab', { name: /^Overview$/i })
  }
  getSummaryTab() {
    return cy.findByRole('tab', { name: /^Summary$/i })
  }
  getRecentActivityTab() {
    return cy.findByRole('tab', { name: /^Recent Activity$/i })
  }
  getImpactAndROITab() {
    return cy.findByRole('tab', { name: /^Impact and ROI$/i })
  }
  //Links
  getLinkByName(name: string) {
    return cy.findAllByRole('link', { name: name })
  }
  getDownloadItHereLink() {
    return cy.findByRole('link', { name: 'Download it here' })
  }
  getResetAlllLink() {
    return cy.contains('a', 'Reset All')
  }
  //Graphs
  getAllGraphs() {
    return cy.get('[class="ReactChart "]')
  }
  //Tables
  getOrderReportTable() {
    return cy.findByTestId('orderReport')
  }
  //Buttons
  getSortByDate() {
    return cy.contains('a', /DATE/i)
  }
  getExportButton() {
    return cy.findByRole('button', { name: 'Export' })
  }
  getSelectATeamButton() {
    return cy.findByRole('button', { name: 'Select a Team' })
  }
  getDateRangeButton() {
    return cy.findByRole('button', { name: 'Date Range' })
  }
  getThisMonthButton() {
    return cy.findByRole('button', { name: 'This Month' })
  }
  getAllTimeButton() {
    return cy.findByRole('button', { name: 'All Time' })
  }
  getSelectAUserButton() {
    return cy.findByRole('button', { name: 'Select a User' })
  }
  getClearButton() {
    return cy.findByRole('button', { name: 'Clear' })
  }
  getSelectATypeButton() {
    return cy.findByRole('button', { name: 'Select a Type' })
  }
  getBackToActivityStreamButton() {
    return cy.findByRole('button', { name: 'Back to Activity Stream' })
  }
  //Alerts
  getGeneratingAlert() {
    return cy.getAlert({
      message: 'Your report is being generated and will download shortly.',
      close: 'close',
    })
  }
  //Texts
  getNoRecentActivityText() {
    return cy.contains('No Recent Activity Found')
  }
  getChromeExtensionText() {
    return cy.findByText('Don’t yet have our Chrome Extension?')
  }
  getShowingAllTeamsText() {
    return cy.findByText('Showing all teams')
  }
  getShowingAllUsersText() {
    return cy.findByText('Showing all users')
  }
  getFilterByText() {
    return cy.findByText('Filter by:')
  }
  //Cards
  getStatsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Total CPT')
  }
  getGiftEmailSendsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Gift Email Sends')
  }
  getSpendCard() {
    return cy.contains('[data-testid="ui-card"]', 'Spend')
  }
  getMeetingsBookedCard() {
    return cy.contains('[data-testid="ui-card"]', 'Meetings Booked')
  }
  getEngagementCard() {
    return cy.contains('[data-testid="ui-card"]', 'Engagement')
  }
  getGiftEmailsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Gift Emails')
  }
  getMostPopularSendsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Most Popular Sends')
  }
  getMagicLinksCard() {
    return cy.contains('[data-testid="ui-card"]', 'MagicLinks')
  }
  getWonRevenueCard() {
    return cy.contains('[data-testid="ui-card"]', 'Won Revenue Influenced by Postal')
  }
  getOpenPipelineCard() {
    return cy.contains('[data-testid="ui-card"]', 'Open Pipeline Influenced by Postal')
  }
  getClosedWonDealsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Closed Won Deals Influenced by Postal')
  }
  getPostalInfluencedOppsByRepCard() {
    return cy.contains('[data-testid="ui-card"]', 'Postal Influenced Opps by Rep')
  }
  getDirectMailPipeLineCard() {
    return cy.contains('[data-testid="ui-card"]', 'Pipeline Influenced by Direct Mail Campaigns')
  }
  //Others Elements
  getAllActivityItems() {
    return cy.findAllByTestId('ActivityStreamList_item')
  }
  getActivityItemByName(name: string) {
    return cy.contains('[data-testid="ActivityStreamList_item"]', name)
  }
  getTotalCost() {
    return cy.contains('div', 'Total Cost')
  }
  getTotalCPT() {
    return cy.contains('div', 'Total CPT')
  }
  getTouches() {
    return cy.contains('div', 'Touches')
  }
  getDelivered() {
    return cy.contains('div', 'Delivered')
  }
  getDisplayByDiv() {
    return cy.contains('div', 'Display by:')
  }
  getSentGraphColor() {
    return cy.contains('div', /Sent/i)
  }
  getAcceptedGraphColor() {
    return cy.contains('div', /Accepted/i)
  }
  getThankYousInfo() {
    return cy.contains('div', /THANK YOUS/i)
  }
  getSocialSharesInfo() {
    return cy.contains('div', /Social Shares/i)
  }
  getNewContactsInfo() {
    return cy.contains('div', /NEW CONTACTS GENERATED/i)
  }
  getViewsInfo() {
    return cy.contains('div', /Views/i)
  }
  getAcceptedInfo() {
    return cy.contains('div', /Accepted/i)
  }
  getRateInfo() {
    return cy.contains('div', /Rate/i)
  }
  getSentInfo() {
    return cy.contains('div', /Sent/i)
  }
  getTotalOpensInfo() {
    return cy.contains('dd', /Total Opens/i)
  }
  getTotalClicksInfo() {
    return cy.contains('dd', /Total Clicks/i)
  }
  getTotalAcceptancesInfo() {
    return cy.contains('dd', /Total Acceptances/i)
  }
  getOpenRate() {
    return cy.contains('div', /Open Rate/i)
  }
  getClickRate() {
    return cy.contains('div', /Click Rate/i)
  }
  getAcceptanceRate() {
    return cy.contains('div', /Acceptance Rate/i)
  }
  getGiftEmailsColumn() {
    return cy.contains('div', /Gift Email/i)
  }
  getMagicLinksColumn() {
    return cy.contains('div', /MagicLink/i)
  }
  getOverallAcceptedColumn() {
    return cy.contains('div', /Overall Accepted/i)
  }
  getAtomicHabitsItemInfo() {
    return cy.contains('div', 'Atomic Habits:')
  }
  getHotHoneyItemInfo() {
    return cy.contains('div', `Mike's Hot Honey`)
  }
  getTreatYoElfItemInfo() {
    return cy.contains('div', `Treat Yo Elf`)
  }
  getTheBestThingsItemInfo() {
    return cy.contains('div', `The Best Things`)
  }
  //radios
  getTeamRadio() {
    return cy.findByRole('radio', { name: 'Team' })
  }
  getUserRadio() {
    return cy.findByRole('radio', { name: 'User' })
  }
  //tooltips and text
  showFunnelChartTooltipByOddNumber(number: number) {
    cy.get('path').eq(number).scrollIntoView()
    cy.get('path').eq(number).click({ force: true })
  }
  showPieChartTooltip(number: number) {
    cy.get('path').eq(number).scrollIntoView()
    cy.get('path').eq(number).trigger('mouseover', { force: true })
  }
  getStageTooltip() {
    return cy.contains('div', 'Stage').parent('div').parent('div')
  }
  getCampaignTooltip() {
    return cy.contains('div', 'Campaign Name').parent('div').parent('div')
  }
  getOppsTooltip() {
    return cy.contains('div', 'Opportunity Owner').parent('div').parent('div')
  }
  //filter popovers
  getTeamsFilterPopover() {
    return cy.findByTestId('TeamsFilterSearch_popover')
  }
  getUsersFilterPopover() {
    return cy.findByTestId('UsersFilterSearch_popover')
  }
  getDateFilterPopover() {
    return cy.findByTestId('DateFilterSearch_popover')
  }
  //SummaryRow
  getSummaryRowByText(text: string | RegExp) {
    return cy.contains('div', text).parent('div')
  }
  getCellByText(text: string | RegExp) {
    return cy.contains('div', text).parent('div')
  }
  getMagicLinkSummaryRow() {
    return cy.contains('p', 'MagicLink').parent('div').parent('div')
  }
}
