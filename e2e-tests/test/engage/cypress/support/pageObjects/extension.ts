export default class Extension {
  visitLogin() {
    cy.visit('/extension/login')
    return cy.url().should('contain', '/extension/login')
  }
  visitAuth() {
    cy.visit('/extension/auth')
    return cy.url().should('contain', '/extension/auth')
  }
  getEmailAddressInput() {
    return cy.findByPlaceholderText('Email Address')
  }
  getPasswordInput() {
    return cy.findByPlaceholderText('Password')
  }
  getAuthNextButton() {
    return cy.findByRole('button', { name: 'Next' })
  }
  getAuthLoginButton() {
    return cy.findByRole('button', { name: 'Log in' })
  }
  getAuthDoneMessage() {
    return cy.findByText(/You may now close this window/)
  }
  visitExtension() {
    cy.visit('/extension/')
    cy.wait(300)
    return cy.url().should('contain', '/extension/')
  }
  visitExtContactProfileByEmail(email: string) {
    return cy.visit(`/extension/contacts/email/${email}`)
  }
  vistExtContactProfileByID(id: string) {
    return cy.visit(`/extension/contacts/${id}`)
  }
  getCampaignsCard() {
    return cy.contains('div', 'Campaigns')
  }
  getEditListsButton() {
    return cy.findByLabelText('Edit Lists')
  }
  getEditCampaignsButton() {
    return cy.findByLabelText('Edit Lists')
  }
  getUpcomingCampaignsDrawer() {
    return cy.findByRole('dialog', { name: 'Upcoming Campaigns' })
  }
  getCampaignCheckboxByName(name: string) {
    return cy.contains('label', name).find('input')
  }
  clickFootersCloseButton() {
    cy.get('footer').within(() => {
      cy.findByRole('button', { name: 'Close' }).click()
    })
  }
  getContactAddedAlert() {
    return cy.getAlert({ message: 'Contact added to Campaign', close: 'close' })
  }
  getContactRemovedAlert() {
    return cy.getAlert({ message: 'Contact removed from Campaign', close: 'close' })
  }
  getRecentActivityCard() {
    return cy.contains('div', 'Activity History')
  }
  getSubscriptionsCard() {
    return cy.contains('div', 'Subscriptions')
  }
  getListsCard() {
    return cy.contains('div', 'Lists')
  }
  getContactsListDrawer() {
    return cy.findByRole('dialog', { name: 'Contact Lists' })
  }
  getContacTagsDrawer() {
    return cy.findByRole('dialog', { name: 'Contact Tags' })
  }
  getPlaybooksDrawer() {
    return cy.findByRole('dialog', { name: 'Playbooks' })
  }
  getAddContactDrawer() {
    return cy.findByRole('dialog', { name: 'Add Contact' })
  }
  getContactInfoDrawer() {
    return cy.findByRole('dialog', { name: 'Contact Info' })
  }
  getMagicLinksDrawer() {
    return cy.findByRole('dialog', { name: 'Magic Links' })
  }
  getCreateListButton() {
    return cy.findByLabelText('create list')
  }
  getCreateTagButton() {
    return cy.findByLabelText('create tag')
  }
  getCreateCampaignButton() {
    return cy.findByLabelText('create campaign')
  }
  getSearchPlaybooksIcon() {
    return cy
      .findByPlaceholderText(/^Search Playbooks$/i)
      .parent('div')
      .find('svg')
  }
  getNoContactsFoundText() {
    return cy.findByText('No Contact found')
  }
  getMagicLinksHeader() {
    return cy.findByRole('heading', { name: 'MagicLinks' })
  }
  getAddMagicLinkIconButton() {
    return cy.findByRole('button', { name: 'MagicLinks' })
  }
  getNoMagicLinksText() {
    return cy.contains('You currently do not have any MagicLinks. Would you like to create one?')
  }
  getAddAContactButton() {
    return cy.findByRole('button', { name: 'Add Contact' })
  }
  getDateAddedContactDetail() {
    return cy.contains('div', 'Date Added')
  }
  getItemsContactDetail() {
    return cy.contains('div', 'Items')
  }
  getCPTContactDetail() {
    return cy.contains('div', 'CPT')
  }
  getContactLinkByName(name: string) {
    return cy.findAllByRole('link', { name: name })
  }
  getMagicLinksCard() {
    return cy.contains('div', 'MagicLinks')
  }
  getMagicLinksLink() {
    return cy.findAllByRole('link', { name: 'MagicLinks' })
  }
  getRecentActivityLink() {
    return cy.findAllByRole('link', { name: 'Recent Activity' })
  }
  getNoItemsText() {
    return cy.findByText('No Recent Activity')
  }
  getCampaignsLink() {
    return cy.findAllByRole('link', { name: 'Campaigns' })
  }
  getSubscriptionsLink() {
    return cy.findAllByRole('link', { name: 'Subscriptions' })
  }
  getListsLink() {
    return cy.findAllByRole('link', { name: 'Lists' })
  }
  getNoCampaignsText() {
    return cy.findByText('No campaigns')
  }
  getNoSubscriptionsText() {
    return cy.findByText('No subscriptions found')
  }
  getNoListsText() {
    return cy.contains('Not in any contact lists yet. Would you like to add one?')
  }
  getCreateANewListInput() {
    return cy.findByPlaceholderText('Create a new list')
  }
  getListCheckboxByName(name: string) {
    return cy.contains('label', name).find('input')
  }
  getContactCheckboxByName(name: string) {
    return cy.contains('label', name).find('input')
  }
  getTagsCard() {
    return cy.contains('div', 'Tags')
  }
  getEditTagsButton() {
    return cy.findByLabelText('Edit Tags')
  }
  getTagCheckboxByName(name: string) {
    return cy.contains('label', name).find('input')
  }
  getNoTagsText() {
    return cy.contains('This contact does not have any tags. Would you like to add one?')
  }
  getEditPlaybooksButton() {
    return cy.findByLabelText('Edit Playbooks')
  }
  getPlaybookCheckboxByName(name: string) {
    return cy.contains('label', name).find('input')
  }
  getListedPlaybookByName(name: string) {
    return cy.contains('a', name)
  }
  getFirstNameInput() {
    return cy.findByRole('textbox', { name: 'First Name (required)' })
  }
  getLastNameInput() {
    return cy.findByRole('textbox', { name: 'Last Name (required)' })
  }
  getEmailInput() {
    return cy.findByRole('textbox', { name: 'Email (required)' })
  }
  getTitleInput() {
    return cy.findByRole('textbox', { name: 'Title' })
  }
  getCompanyInput() {
    return cy.findByRole('textbox', { name: 'Company' })
  }
  getCreateContactLink() {
    return cy.contains('a', 'Create Contact')
  }
  getListedMagicLinkByName(name: string) {
    return cy.findByText(name)
  }
  getCopyLinkText() {
    return cy.findByText('Copy Link')
  }
  getSendAnItemIconButton() {
    return cy.contains('button', 'Send Item')
  }
  getItemOrderedAlert() {
    cy.getAlert({ message: 'Item is Ordered!', close: 'close' })
  }
  getGoToYourAccountText() {
    return cy.contains('Go to your account to update your funds.')
  }
  getCreateANewTagInput() {
    return cy.findByPlaceholderText('Create a new tag')
  }
}
