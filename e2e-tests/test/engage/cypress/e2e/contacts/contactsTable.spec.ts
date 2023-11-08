import { addDays, format } from 'date-fns'
import { SearchContactsV2Document } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Contacts, Universal } from '../../support/pageObjects'
describe('Contacts Table Workflows', function () {
  const contacts = new Contacts()
  const universal = new Universal()
  const user = userFactory()
  const today = new Date()
  const inTwoDays = addDays(today, 2)
  const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
  //let teamId: string | undefined
  //let contactOwnerEmail: string
  const txt1: string = 'Anthony'
  const txt2: string = 'Frederico'
  const txt3: string = 'Prince'
  const txt7: string = 'Carissa'
  const txt4: string = 'Amir'
  const txt5: string = 'Elinore'
  const txt6: string = 'Jettie'
  const txt8: string = 'Gillian'
  const txt9: string = 'Angelica'

  before(() => {
    cy.signup(user)
    // cy.teamsSeed(5)
    // cy.graphqlRequest(TeamsDocument).then((res) => {
    //   teamId = res.teams?.filter((team) => team.name == 'jersey')[0]?.id
    // })
    // cy.graphqlRequest(InviteDocument, {
    //   data: {
    //     emailAddresses: [`${faker.datatype.uuid()}@postal.dev`],
    //     teamId: teamId,
    //     roles: ['USER'],
    //   },
    // }).then((res) => {
    //   cy.manageState()
    //   contactOwnerEmail = res.invite?.[0]?.emailAddress || 'N/A'
    //   const id = res.invite?.[0]?.invite?.id
    //   cy.inviteCompleteApi(id, 'Jess', 'Jersey')
    //   cy.signupPasswordApi(contactOwnerEmail, user.password)
    // })
    // contacts.visitContacts()
    // universal.waitForProgressBar()
    // universal.getSpinner().should('not.exist')
    // contacts.getCreateContactLink().should('exist')
    // cy.createAContact({
    //   lastName: 'Jersey',
    //   firstName: 'Jones',
    // })
    // cy.manageState()
    contacts.visitContacts()
    universal.progressBarZero()
    universal.getSpinner().should('not.exist')
    contacts.getCreateContactLink().should('exist')
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:contacts:filter')
    cy.intercept('POST', '/engage/api/upload-contacts?*').as('import')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getBackgroundTaskById') {
        req.alias = 'getBackgroundTaskById'
      }
      if (req.body.operationName === 'searchContactsV2') {
        req.alias = 'searchContactsV2'
      }
    })
  })

  it('creates a contact: required for elastisearch', () => {
    contacts.visitContacts()
    cy.url().should('include', '/contacts')
    universal.progressBarZero()
    //creates a contact: required for elastisearch
    contacts.getCreateContactLink().click({ force: true })
    contacts.getCreateContactDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      contacts.getFirstNameInput().fill('Maria')
      contacts.getLastNameInput().fill('Lara')
      contacts.getEmailInput().fill('maria@postal.dev')
      contacts.getTitleInput().fill('QA Engineer')
      contacts.getCompanyInput().fill(`Maria's Place`)
      contacts.getPhoneNumberInput().fill('780-432-6754')
      cy.selectAutoCompleteTagsCreatable('cat')
    })
    contacts.getAddAnAddressButton().click()
    contacts.getAddAddressDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      contacts.getAddressLabelInput().scrollIntoView().fill('Work')
      contacts.getStreetAddress1Input().fill('1013 Royal Way')
      contacts.getCityInput().fill('San Diego')
      cy.selectAutoCompleteState('California')
      contacts.getPostalCodeInput().fill('93405')
      contacts.getStreetAddress2Input().fill('Apt 1')
      cy.intercept('/engage/api/graphql', (req) => {
        if (req.body.operationName === 'verifyAddress') {
          req.alias = 'verifyAddress'
        }
      })
      contacts.getAddAddressButton().click()
    })
    contacts
      .getVerifyAddressModalFooter()
      .should('be.visible')
      .within(() => {
        contacts.getFixItAndTryAgainButton().should('be.visible')
        cy.wait('@verifyAddress')
        contacts.getUseThisAddressButton().click()
      })
    contacts.getConfirmUnVerifiedAddressModal().within(() => {
      universal.getConfirmButton().click()
    })
    contacts.getCreateContactDrawer().within(() => {
      universal.getSaveButton().click({ force: true })
    })
    contacts.getContactCreatedAlert()
    cy.nonRandomContactsSeed({ numOfNonRandomContacts: 10 })
    cy.contactsSeed(11)
  })

  it('tests adding Tags', function () {
    contacts.visitContacts()
    universal.progressBarZero()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: txt6 })
    cy.clickCheckbox({ name: txt7 })
    contacts.getAddTagIconButton().click()
    contacts.getUpdateTagsModal(2).within(() => {
      cy.selectAutoCompleteTagsCreatable('peanutbutter')
    })
    contacts.getTagCreatedAlert()
    contacts.getUpdateTagsModal(2).within(() => {
      contacts.getUpdateTagsButton().click({ force: true })
    })
    contacts.getUpdateTagsModal(2).should('not.exist')
    // cy.catchCallsRecurse({
    //   operationName: 'getBackgroundTaskById',
    //   key: 'successCount',
    //   value: 2,
    // })
  })

  it('tests table rendering and pagination', function () {
    contacts.visitContacts()
    universal.waitForProgressBar()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    //tests that columns are visible
    cy.get('th').should('be.visible').and('contain.text', contacts.mainContactsTableHeaderText())
    //tests pagination
    // >
    universal.getRowsInATableBody().should('have.length', 22)
    universal.getPaginationButton().should('contain', '1 / 1')
  })

  it('tests saving contacts to Favorites', function () {
    //tests Saving contacts to Favorites
    contacts.visitContacts()
    universal.waitForProgressBar()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: txt1 })
    cy.clickCheckbox({ name: txt2 })
    cy.clickCheckbox({ name: txt3 })
    contacts.getFavoriteAddIconButton().click()
    contacts.getAddToFavoritesModal().within(() => {
      contacts.getAddContactsToFavoritesModalText(3).should('exist')
      //Tests Clicking Cancel
      universal.getCancelButton().click()
    })
    contacts.getAddToFavoritesModal().should('not.exist')
    //Tests Clicking Confirm
    contacts.getFavoriteAddIconButton().click()
    universal.getConfirmButton().click({ force: true })
    cy.getAlert({ message: 'Contacts will be added to favorites', close: 'close' })
    contacts.getAddToFavoritesModal().should('not.exist')
    cy.wait(10000)
    //universal.getThingSpinner().should('not.exist')
  })

  it(
    'tests that added contacts make it into the Favorites List',
    {
      retries: {
        openMode: 3,
        runMode: 3,
      },
    },
    () => {
      contacts.visitContacts()
      universal.waitForProgressBar()
      universal.getSpinner().should('not.exist')
      universal.getNoItemsMessage().should('not.exist')
      contacts.getListsDropdown('All Contacts').click({ force: true })
      contacts.getFavoritesMenuitem().click({ force: true })
      universal.progressBarZero()
      universal.getNoItemsMessage().should('not.exist')
      universal.getRowByText(txt1).should('exist')
      universal.getRowByText(txt2).should('exist')
      universal.getRowByText(txt3).should('exist')
    }
  )

  it('tests creating lists and adding contacts to lists', function () {
    //tests creating New List and adding a contact to it
    contacts.visitContacts()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.progressBarZero()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: txt4 })
    contacts.getAddListIconButton().click()
    contacts.getUpdateListsModal(1).within(() => {
      cy.intercept('/engage/api/graphql', (req) => {
        if (req.body.operationName === 'createContactList') {
          req.alias = 'createContactList'
        }
      })
      cy.selectAutoCompleteContactListCreatable('Follow Up')
      cy.wait('@createContactList')
        .its('response.body.data.createContactList.name')
        .should('eq', 'Follow Up')
      cy.wait(300)
      contacts
        .getUpdateListsButton()
        .should('exist')
        .should('not.be.disabled')
        .click({ force: true })
    })
    cy.wait('@getBackgroundTaskById', { timeout: 66000 }).then((res) => {
      const followupId = res.response?.body.data.getBackgroundTaskById.name.slice(9)
      // cy.wrap(res)
      //   .its('response.body.data.getBackgroundTaskById.status')
      //   .should('eq', 'COMPLETED')
      // cy.queryForUpdateRecurse({
      //   request: SearchContactsV2Document,
      //   options: { filter: { lists: { eq: followupId } } },
      //   operationName: 'searchContactsV2',
      //   key: 'resultsSummary',
      //   value: 1,
      //   key2: 'totalRecords',
      // })
      cy.wait(800)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Back to Home')) {
          cy.wait(300)
          cy.reload()
          cy.wait(600)
        }
      })
      cy.wait(50000)
      //universal.getThingSpinner().should('not.exist')
      contacts.getListsDropdown('All Contacts').click({ force: true })
      contacts.getFollowUpMenuitem().click({ force: true })
      universal.progressBarZero()
      cy.contains(txt4).should('exist')
      universal.getRowsInATableBody().should('have.length', 1)

      //tests adding contacts to a previously created Saved List
      contacts.visitContacts()
      universal.waitForProgressBar()
      universal.getSpinner().should('not.exist')
      universal.getNoItemsMessage().should('not.exist')
      cy.clickCheckbox({ name: txt5 })
      cy.clickCheckbox({ name: txt6 })
      cy.wait(200)
      contacts.getAddListIconButton().click()
      contacts.getUpdateListsModal(2).within(() => {
        cy.selectAutoCompleteContactListCreatable('Follow Up')
        cy.contains('div', 'Follow Up').should('be.visible')
        contacts.getUpdateListsButton().should('exist').click()
      })
      contacts.getListsUpdatedAlert(2)
      // cy.wait('@getBackgroundTaskById')
      //   .its('response.body.data.getBackgroundTaskById.status')
      //   .should('eq', 'COMPLETED')
      cy.wait(55000)
      //universal.getThingSpinner().should('not.exist')
      // cy.queryForUpdateRecurse({
      //   request: SearchContactsV2Document,
      //   options: { filter: { lists: { eq: followupId } } },
      //   operationName: 'searchContactsV2',
      //   key: 'resultsSummary',
      //   value: 3,
      //   key2: 'totalRecords',
      // })
      contacts.getListsDropdown('All Contacts').click({ force: true })
      contacts.getFollowUpMenuitem().click({ force: true })
      universal.progressBarZero()
      cy.contains(txt5).should('exist')
      cy.contains(txt6).should('exist')

      //Tests the Cancel Button
      contacts.getListsDropdown('Follow Up').click({ force: true })
      contacts.getAllContactsMenuitem().click({ force: true })
      universal.progressBarZero()
      universal.getSpinner().should('not.exist')
      universal.getNoItemsMessage().should('not.exist')
      cy.clickCheckbox({ name: txt7 })
      cy.clickCheckbox({ name: txt8 })
      cy.wait(200)
      contacts.getAddListIconButton().click()
      contacts.getUpdateListsModal(2).within(() => {
        cy.selectAutoCompleteContactListCreatable('Follow Up')
        universal.getCloseButton().should('exist').click()
      })
      contacts.getListsDropdown('All Contacts').click({ force: true })
      contacts.getFollowUpMenuitem().click({ force: true })
      universal.getRowsInATableBody().should('have.length', '3')
      cy.contains(txt7).should('not.exist')
      cy.contains(txt8).should('not.exist')
    })
  })

  it('tests contacts table filtering', function () {
    contacts.visitContacts()
    universal.waitForProgressBar()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    //tests filtering by Create Date
    contacts.getShowFiltersButton().click()
    contacts
      .getCreateDateFilter()
      .type(`${dateFormatInput(today)} to ${dateFormatInput(inTwoDays)}{enter}`)
    contacts.getFirstNameFilter().click({ force: true })

    //tests filtering by First Name`
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCreateContactLink().should('exist')
    contacts.getShowFiltersButton().click({ force: true })
    contacts.getClearFiltersButton().click({ force: true })
    contacts.getShowFiltersButton().parent('div').should('not.contain', '2')
    contacts.getFirstNameFilter().type('Maria{enter}')
    universal.getRowsInATableBody().should('have.length.lte', 3)
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by Company
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getCompanyFilter().should('be.visible').type(`Place`)
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by Last Send`
    contacts.getShowFilterModal().within(() => {
      contacts
        .getLastSendFilter()
        .type(`${dateFormatInput(today)} to ${dateFormatInput(inTwoDays)}{enter}`)
      contacts.getFirstNameFilter().click({ force: true })
    })
    universal.getNoItemsMessage().should('exist')
    contacts.getShowFiltersButton().parent('div').should('contain', '2')

    //tests filtering by Last Name
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getLastNameFilter().fill('Lara')
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by Title
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getTitleFilter().fill('QA')
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').within(() => {
      cy.findByText('QA Engineer').should('exist')
    })

    //tests filtering by Email Address
    //is an equal, not a contains
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getEmailAddressFilter().fill('maria@postal.dev')
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by City
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getCityFilter().fill('San Diego')
    })
    universal.getRowsInATableBody().should('have.length.lte', 2)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by State
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getStateFilter().fill('CA')
    })
    universal.getRowsInATableBody().should('have.length.lte', 22)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by Postal Code
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      contacts.getPostalCodeFilter().fill('93405')
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')

    //tests filtering by Contact Owner
    // contacts.getClearFiltersButton().click({ force: true })
    // universal.getRowsInATableBody().should('have.length.gt', 1)
    // contacts.getShowFilterModal().within(() => {
    //   cy.selectAutoCompleteUser(contactOwnerEmail)
    // })
    // universal.getRowsInATableBody().should('have.length', 1)
    // universal.progressBarZero()
    // universal.getRowByText('Jones Jersey').should('exist')

    //tests filtering by tags
    contacts.getClearFiltersButton().click({ force: true })
    universal.getRowsInATableBody().should('have.length.gt', 1)
    contacts.getShowFilterModal().within(() => {
      cy.selectAutoCompleteTags('cat')
    })
    universal.getRowsInATableBody().should('have.length', 1)
    universal.progressBarZero()
    universal.getRowByText('Maria Lara').should('exist')
  })

  it('finishing up add tags testing', function () {
    //tests canceling Adding Tags
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCreateContactLink().should('exist')
    universal.getRowsInATableBody().should('have.length.gt', 6)
    cy.clickCheckbox({ name: txt7 })
    cy.clickCheckbox({ name: txt8 })
    cy.wait(200)
    contacts.getAddTagIconButton().click()
    contacts.getUpdateTagsModal(2).within(() => {
      cy.contains('Please select the tags to update on each Contact').should('exist')
      cy.selectAutoCompleteTagsCreatable('brush')
      universal.getCloseButton().click()
    })
    universal.getRowByText('brush').should('not.exist')

    //Confirms tags were added sucessfully
    contacts.visitContacts()
    universal.waitForProgressBar()
    contacts.getCreateContactLink().should('exist')
    universal.getRowByText(txt7).find('a').click({ force: true })
    universal.getSpinner().should('not.exist')
    cy.contains('div', txt7).within(() => {
      universal.getAllUITags().should('have.length', 2)
      universal.getUITagByText('peanutbutter').should('exist')
    })

    //tests Adding an existing Tag
    contacts.visitContacts()
    universal.waitForProgressBar()
    universal.getSpinner().should('not.exist')
    contacts.getCreateContactLink().should('exist')
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length.gt', 8)
    cy.clickCheckbox({ name: txt9 })
    contacts.getAddTagIconButton().click()
    contacts.getUpdateTagsModal(1).within(() => {
      cy.selectAutoCompleteTagsCreatable('peanutbutter')
      contacts.getUpdateTagsButton().should('exist').click()
    })
    // cy.catchCallsRecurse({
    //   operationName: 'getBackgroundTaskById',
    //   key: 'successCount',
    //   value: 1,
    // })
    universal.getRowByText(txt9).find('a').click({ force: true })
    universal.getSpinner().should('not.exist')
    universal.getUITagByText('peanutbutter').should('exist')
    cy.contains('div', txt9).within(() => {
      universal.getAllUITags().should('have.length', 2)
      universal.getUITagByText('peanutbutter').should('exist')
    })
    cy.wait(60000)
    //universal.getThingSpinner().should('not.exist')
    //tests filtering by two Tags
    contacts.visitContacts()
    contacts.getShowFiltersButton().click()
    cy.selectAutoCompleteTags('peanutbutter')
    universal.getRowsInATableBody().should('have.length', 3)
    cy.selectAutoCompleteTags('cat')
    universal.getRowsInATableBody().should('have.length', 4)
  })
})
