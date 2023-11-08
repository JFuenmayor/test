export default class Navbar {
  getProfileData(name: string) {
    const truncatedName = name.slice(0, 12)
    return cy.contains('[data-testid="atomic-subnavbar-right"]', truncatedName)
  }
  getNavbarCenter() {
    return cy.findByTestId('ui-subnavbar-center', { timeout: 34000 })
  }
  getNavbarLeft() {
    return cy.findAllByTestId('atomic-subnavbar-left').eq(0)
  }
  getNavbarRight() {
    return cy.findByTestId('ui-subnavbar-right')
  }
  getMarketplaceLink() {
    return cy.contains('a', /marketplace/i, { timeout: 34000 })
  }
  getContactsLink() {
    return cy.contains('a', /contacts/i)
  }
  getCampaignsLink() {
    return cy.contains('a', /campaigns/i)
  }
  getOrdersLink() {
    return cy.contains('a', /orders/i)
  }
  getEventsLink() {
    return cy.contains('a', /events/i)
  }
  getReportingLink() {
    return cy.contains('a', /Reporting/i)
  }
  getAutomationLink() {
    return cy.contains('button', /Automation/i)
  }
  getMagicLinkMenuItem() {
    return cy.findByRole('menuitem', { name: /MagicLinks/i })
  }
  getCollectionsMenuItem() {
    return cy.findByRole('menuitem', { name: /Collections/i })
  }
  getConciergeMenuItem() {
    return cy.findByRole('menuitem', { name: /Paper Plane/i })
  }
  getTriggersMenuItem() {
    return cy.findByRole('menuitem', { name: /Triggers/i })
  }
  getSubscriptionsMenuItem() {
    return cy.findByRole('menuitem', { name: /Subscriptions/i, timeout: 55000 })
  }
  getBudgetElement() {
    return cy.findByTestId('navbar-budget-test')
  }
  getProfileDropDownMenu() {
    return cy.findByTestId('dropdown')
    //delete?
  }
  getProfileMenuButton() {
    return cy.findAllByTestId('NavbarV2_profilemenu_button').eq(0)
  }
  getProfileMenuItem() {
    return cy.findByRole('menuitem', { name: 'Profile' })
  }
  getSwitchAccountMenuItem() {
    return cy.findByRole('menuitem', { name: 'Switch Account' })
  }
  getHelpMenuItem() {
    return cy.findByRole('menuitem', { name: 'Help' })
  }
  getLogoutMenuItem() {
    return cy.findByRole('menuitem', { name: 'Logout' })
  }
  getGoogleIntegrationTopper() {
    return cy.contains(
      'div',
      'Connect your Google Apps account to send more personalized and effective emails.'
    )
  }
  getLearnMoreButton() {
    return cy.findByRole('button', { name: 'Learn More' })
  }
}
