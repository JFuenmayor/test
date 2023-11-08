export default class Contacts {
  visitContacts() {
    return cy.visit('/contacts')
  }
  //Tables
  getContactsTable() {
    return cy.findByRole('table')
  }
  //TextElements
  contactsTableHeaderText() {
    return 'NameEmailTitleCompanyCreated'
  }
  contactsTableHeaderText2() {
    return 'NameTitleCompanyVerified'
  }
  mainContactsTableHeaderText() {
    return 'NameEmailTitleCompanyCreated'
  }
  unknownAddressText() {
    return 'You entered an unknown address.'
  }
  matchingAddressText() {
    return 'We found a matching address!'
  }
  getVerifiedText() {
    return cy.findByText('Verified')
  }
  getPreferredText() {
    return cy.findByText('Preferred')
  }
  //Links
  getHideContactsLink() {
    return cy.contains('a', 'Hide Contacts')
  }
  getEditLink() {
    return cy.contains('a', /^Edit$/)
  }
  getRemoveLink() {
    return cy.contains('a', 'Remove')
  }
  getSetAsDefaultLink() {
    return cy.contains('a', 'Set as default')
  }
  getSavedListByName(name: string) {
    return cy.contains('a', name)
  }
  getListsDropdown(currentList: string) {
    return cy.findByRole('button', { name: currentList })
  }
  getAllContactsMenuitem() {
    return cy.findByRole('menuitem', { name: 'All Contacts' })
  }
  getMyContactsMenuitem() {
    return cy.findByRole('menuitem', { name: 'My Contacts' })
  }
  getFavoritesMenuitem() {
    return cy.findByRole('menuitem', { name: 'Favorites' })
  }
  getContactLinkByName(name: string) {
    return cy.findByRole('link', { name: name })
  }
  getFollowUpMenuitem() {
    return cy.findByRole('menuitem', { name: 'Follow Up' })
  }
  //Modals
  getRemovePhoneModal() {
    return cy.findByRole('alertdialog', { name: 'Remove Phone' })
  }
  getVerifyAddressModal() {
    return cy.contains('section', 'Verify Preferred Address')
  }
  getConfirmUnVerifiedAddressModal() {
    return cy.contains('section', 'Confirm Unverified Address')
  }
  getSetDefaultAddressModal() {
    return cy.contains('section', 'Set Default Address')
  }
  getRemoveAddressModal() {
    return cy.contains('section', 'Remove Address')
  }
  getVerifyAddressModalFooter() {
    return cy.findByTestId('verify-address-modal-footer')
  }
  getUpdateTagsModal(numOfContacts: number) {
    if (numOfContacts === 1) {
      return cy.findByRole('alertdialog', { name: `Update Tags for ${numOfContacts} Contact` })
    }
    return cy.findByRole('alertdialog', { name: `Update Tags for ${numOfContacts} Contacts` })
  }
  getAddToFavoritesModal() {
    return cy.findByRole('alertdialog', { name: 'Add to Favorites' })
  }
  getAddToListModal() {
    return cy.findByRole('alertdialog', { name: 'Add to List' })
  }
  getUpdateListsModal(numOfContacts: number) {
    if (numOfContacts === 1) {
      return cy.findByRole('alertdialog', { name: `Update Lists for ${numOfContacts} Contact` })
    }
    return cy.findByRole('alertdialog', { name: `Update Lists for ${numOfContacts} Contacts` })
  }
  getDeleteContactsModal(numberOfContacts: number) {
    if (numberOfContacts === 1) {
      return cy.findByRole('dialog', { name: 'Delete Contact' })
    } else {
      return cy.findByRole('dialog', { name: 'Delete Contacts' })
    }
  }
  getShowFilterModal() {
    return cy.findByRole('dialog', { name: 'Filter', timeout: 34000 })
  }
  //Modal Text
  getRemovePhoneModalText() {
    return cy.contains('Are you sure you want to Remove this phone number?')
  }
  getAddContactsToFavoritesModalText(numberOfContacts: number) {
    return cy.contains(
      `Are you sure you want to add these ${numberOfContacts} contacts to favorites?`
    )
  }
  //Verify Address Modal Elements
  getVerifyAlert() {
    return cy.findByTestId('verify-address-alert')
  }
  getVerifyStack() {
    return cy.findByTestId('verify-address-stack')
  }
  getOriginalAddressCard() {
    return cy.contains('div', 'Original Address')
  }
  getVerifiedAddressCard() {
    return cy.contains('div', 'Verified Address')
  }
  //Filters
  getCreateDateFilter() {
    return cy.contains('div', 'Date Created')
  }
  getFirstNameFilter() {
    return cy.findByLabelText('First Name')
  }
  getCompanyFilter() {
    return cy.findByLabelText('Company')
  }
  getLastSendFilter() {
    return cy.contains('div', 'Last Send')
  }
  getLastNameFilter() {
    return cy.findByLabelText('Last Name')
  }
  getTitleFilter() {
    return cy.findByLabelText('Title')
  }
  getEmailAddressFilter() {
    return cy.findByLabelText('Email Address')
  }
  getCityFilter() {
    return cy.findByLabelText('City')
  }
  getStateFilter() {
    return cy.findByLabelText('State')
  }
  getPostalCodeFilter() {
    return cy.findByLabelText('Postal Code')
  }
  getContactOwnerFilter() {
    return cy.contains('div', 'Contact Owner').find('input')
  }
  getSavedListFilter() {
    return cy.findByLabelText('Saved List')
  }
  getTagsFilter() {
    return cy.findByLabelText('Tags')
  }
  //Drawers
  getCreateContactDrawer() {
    return cy.contains('[role="dialog"]', 'Create Contact')
  }
  getAddAddressDrawer() {
    return cy.contains('[role="dialog"]', 'Add Address')
  }
  getImportContactsDrawer() {
    return cy.findByTestId('ContactsImport_popover')
  }
  getImportContactsClose() {
    return cy.findByTestId('ContactsImport_popover_close')
  }
  getEditContactDrawer() {
    return cy.contains('section', 'Update Contact')
  }
  getEditContactAddressDrawer() {
    return cy.contains('section', 'Update Address')
  }
  getRemappingDrawer() {
    return cy.contains(
      '[role="dialog"]',
      'Please select which values you want to remap.Unmapped values will not be imported.'
    )
  }
  //Inputs
  getFirstNameInput() {
    return cy.contains('div', 'First Name').find('input')
  }
  getLastNameInput() {
    return cy.contains('div', 'Last Name').find('input')
  }
  getEmailInput() {
    return cy.contains('div', 'Email').find('input')
  }
  getTitleInput() {
    return cy.contains('div', 'Title').find('input')
  }
  getCompanyInput() {
    return cy.contains('div', 'Company').find('input')
  }
  getTagsInput() {
    return cy.contains('[role="group"]', 'Tags').find('input')
  }
  getPhoneNumberInput() {
    return cy.findByLabelText('Phone')
  }
  getEditPhoneNumberInput() {
    return cy.findByLabelText('Phone Number')
  }
  getPhoneNumberInputByIdx(num: number) {
    return cy.findByTestId(`contact-edit-phone-${num}`).find('input')
  }
  getPhoneNumberTypeInputByIdx(num: number) {
    return cy.findByTestId(`contact-edit-phone-${num}`).find('select')
  }
  getPhoneTypeInput() {
    return cy.findByLabelText('Phone Type')
  }
  getSearchGoogleForAnAddressInput() {
    return cy.findByLabelText('Search Google for an Address')
  }
  getSearchContactsInput() {
    return cy.findByPlaceholderText('Search Contacts')
  }
  getAddressLabelInput() {
    return cy.findByRole('textbox', { name: 'Address Label' })
  }
  getStreetAddress1Input() {
    return cy.findByRole('textbox', { name: 'Street Address 1' })
  }
  getStreetAddress2Input() {
    return cy.findByRole('textbox', { name: 'Street Address 2' })
  }
  getCityInput() {
    return cy.findByRole('textbox', { name: 'City' })
  }
  getStateInput() {
    return cy.findByRole('combobox', { name: 'State' })
  }
  getPostalCodeInput() {
    return cy.findByRole('textbox', { name: 'Postal Code' })
  }
  //form blocks
  getPhoneNumbersBlock() {
    return cy.findByTestId('contact-edit-phones')
  }
  getAddressesBlock() {
    return cy.findByTestId('contact-edit-addresses')
  }
  //Buttons
  getAddAPhoneNumberButton() {
    return cy.findByRole('button', { name: 'Add a Phone Number' })
  }
  getAddAnAddressButton() {
    return cy.contains('Add an Address')
  }
  getAddAddressButton() {
    return cy.findByRole('button', { name: 'Add Address' })
  }
  getSendItemButton() {
    return cy.findByLabelText('Send Item')
  }
  getSendPlaybookIconButton() {
    return cy.findByLabelText('Send Subscription')
  }
  getCreateContactLink() {
    return cy.contains('a', 'Create a Contact')
  }

  getRemovePhoneButtonByCardIndex(cardIdx: number) {
    return cy.findByTestId(`contact-edit-phone-remove-${cardIdx}`)
  }
  getFixItAndTryAgainButton() {
    return cy.findByRole('button', { name: 'Update and Resubmit' })
  }
  getUseThisAddressButton() {
    return cy.findByRole('button', { name: 'Use Unverified Address' })
  }
  getUseOriginalAddressButton() {
    return cy.findByRole('button', { name: 'Use Original Address' })
  }
  getUseVerifiedAddressButton() {
    return cy.findByRole('button', { name: 'Use Verified Address' })
  }
  getHomeButton() {
    return cy.contains('button', 'HOME')
  }
  getWorkButton() {
    return cy.contains('button', 'WORK')
  }
  getShowFiltersButton() {
    return cy.findByRole('button', { name: 'Filter', timeout: 34000 })
  }
  getOldShowFiltersButton() {
    return cy.findByRole('button', { name: 'Show Filters', timeout: 34000 })
  }
  getClearFiltersButton() {
    return cy.findByRole('button', { name: 'Clear Filters', timeout: 34000 })
  }
  getHideFiltersButton() {
    return cy.findByRole('button', { name: 'Hide Filters' })
  }
  getImportContactsButton() {
    return cy.contains('a', 'Import')
  }
  getAddListIconButton() {
    return cy.findByTestId('listAddIcon')
  }
  getDeleteContactsIconButton() {
    return cy.findByLabelText('Delete Contacts')
  }
  getRemapButton() {
    return cy.contains('button', 'Remap')
  }
  getSkipButton() {
    return cy.contains('button', 'Skip')
  }
  getEditButton() {
    return cy.contains('a', 'Edit Contact')
  }
  getUpdateAddressButton() {
    return cy.findByRole('button', { name: 'Update Address' })
  }
  getUpdateContactButton() {
    return cy.findByRole('button', { name: 'Update Contact' })
  }
  getAddTagIconButton() {
    return cy.findByTestId(`tagAddIcon`)
  }
  getUpdateTagsButton() {
    return cy.findByRole('button', { name: 'Update Tags' })
  }
  getFavoriteAddIconButton() {
    return cy.findByTestId(`favoriteAddIcon`)
  }
  getUpdateListsButton() {
    return cy.findByRole('button', { name: 'Update Lists' })
  }
  getAddress1Button() {
    return cy.findByRole('tab', { name: 'Address 1' })
  }
  getDeleteIconButton() {
    return cy.findAllByRole('button', { name: 'Delete' })
  }

  //Tabs
  getPhoneBlockByIdx(idx: number) {
    return cy.findByTestId(`contact-edit-phone-${idx}`)
  }
  getPhone0Block() {
    return cy.findByTestId('contact-edit-phone-0')
  }
  getPhone1Block() {
    return cy.findByTestId('contact-edit-phone-1', { timeout: 90000 })
  }
  getPhone5Block() {
    return cy.findByTestId('contact-edit-phone-5')
  }
  getAddressBlockByIndex(idx: number) {
    return cy.findByTestId(`contact-edit-address-${idx}`)
  }
  //Cards
  getOldOrdersSection() {
    return cy.contains('[data-testid="ui-card"]', 'Orders')
  }
  getOrdersTab() {
    return cy.findByRole('button', { name: 'Orders' })
  }
  getGroupOrdersTab() {
    return cy.findByRole('button', { name: 'Group Orders' })
  }
  getSubscriptionsTab() {
    return cy.findByRole('button', { name: 'Subscriptions' })
  }
  getPlaybooksSection() {
    return cy.contains('[data-testid="ui-card"]', 'Subscriptions')
  }
  getContactInfoCard(name: string) {
    return cy.contains('[data-testid="ui-card"]', name, { timeout: 40000 })
  }
  getDefaultAddressCard() {
    return cy.contains('div', 'Default').parent('div')
  }
  getSavedListsCard() {
    return cy.contains('div', 'Saved Lists')
  }
  //info
  getDateAddedStat() {
    return cy.contains('div', 'Date Added')
  }
  getItemsStat() {
    return cy.contains('div', 'Items')
  }
  //Other Elements
  getTagsGroup() {
    return cy.contains('[role="group"]', 'Tags')
  }
  checkContactCheckboxByRowNumber(rowNum: number) {
    cy.clickCheckboxByRowNumber({ num: rowNum })
  }
  clickIntoContactByRownumber(rowNum: number) {
    cy.findAllByRole('row').eq(rowNum).click()
  }
  getCheckboxForAllContacts() {
    return cy.findAllByTestId('th-checkbox')
  }
  getPreferredAddressIcon() {
    return cy.findByTestId('preferred-address-tag')
  }
  getMappingSelectByNumber(index: number) {
    return cy.get('select').eq(index)
  }
  getPreferredAddressCheck() {
    return cy.findByTestId('preferredCheckAdd')
  }
  //Alerts
  getContactCreatedAlert() {
    return cy.getAlert({ message: 'Contact Created', close: 'close' })
  }
  getProcessingAlert() {
    return cy.getAlert({ message: 'Contacts are being processed', close: 'close' })
  }
  getDeletedAlert() {
    return cy.getAlert({ message: 'Contacts will be removed', close: 'close' })
  }
  getTagCreatedAlert() {
    return cy.getAlert({ message: 'Tag created', close: 'close' })
  }
  getUpdatedAlert() {
    return cy.getAlert({ message: 'Contact Updated', close: 'close' })
  }
  getTagsUpdatedAlert(numofContacts: number) {
    return cy.getAlert({ message: `Tags updated for ${numofContacts} Contacts`, close: 'close' })
  }
  getListsUpdatedAlert(numofContacts: number) {
    return cy.getAlert({ message: `Lists updated for ${numofContacts} Contacts`, close: 'close' })
  }
  getSelectPreferredAddressAlert() {
    return cy.getAlert({ message: 'Please select a preferred address.', close: 'close' })
  }
}
