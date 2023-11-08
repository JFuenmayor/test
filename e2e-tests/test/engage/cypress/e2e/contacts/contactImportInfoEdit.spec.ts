import { addDays } from 'date-fns'
import { SearchContactsV2Document } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Contacts, Form, Universal } from '../../support/pageObjects'

describe('Contact Import, Info, and Edit Workflows', function () {
  const contacts = new Contacts()
  const universal = new Universal()
  const todaysDate = new Date().toLocaleDateString('en-US')
  const tomorrowsDate = addDays(new Date(), 1).toLocaleDateString('en-US')
  const user = userFactory()
  const form = new Form()

  before(() => {
    cy.signup(user)
    Cypress.on('uncaught:exception', () => {
      return false
    })
  })

  beforeEach(() => {
    cy.login(user)
    // cy.restoreLocalStorageCache()
    cy.filterLocalStorage('postal:contacts:filter')
    cy.intercept('POST', '/engage/api/upload-contacts?*').as('import')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'getContact') {
        req.alias = 'getContact'
      }
      if (req.body.operationName === 'searchContactsV2') {
        req.alias = 'searchContactsV2'
      }
    })
  })

  afterEach(() => {
    // cy.saveLocalStorageCache()
  })

  it('Creates contacts', function () {
    //creates a contact: required for elastisearch
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    cy.url().should('include', '/contacts')
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
    contacts.getAddAnAddressButton().click({ force: true })
    contacts.getAddAddressDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      cy.get('.UiSelectTypeahead__single-value').should('contain', 'United States')
      contacts.getAddressLabelInput().scrollIntoView().fill('Work')
      contacts.getStreetAddress1Input().type('1013 Royal Way', { force: true })
      contacts.getCityInput().fill('San Diego')
      cy.selectAutoCompleteState('California')
      contacts.getPostalCodeInput().should('be.visible').fill('93405')
      contacts.getStreetAddress2Input().fill('Apt 1')
      contacts.getAddAddressButton().click({ force: true })
    })
    contacts
      .getVerifyAddressModalFooter()
      .should('be.visible')
      .within(() => {
        contacts.getFixItAndTryAgainButton().should('exist')
        contacts.getUseThisAddressButton().click({ force: true })
      })
    contacts.getConfirmUnVerifiedAddressModal().within(() => {
      universal.getConfirmButton().click()
    })
    contacts.getCreateContactDrawer().within(() => {
      universal.getSaveButton().should('not.be.disabled').click({ force: true })
    })
    contacts.getCreateContactDrawer().should('not.exist')
    universal.getSpinner().should('not.exist')
    contacts.visitContacts()
    cy.url().should('include', '/contacts')
    cy.wait(2000)
    contacts.getSearchContactsInput().clear().type('Maria Lara')
    universal.waitForProgressBar()
    universal.getRowByText(`Maria Lara`)
    cy.contactsSeed()
  })

  it(
    'Opens Import Contacts and uploads a csv file',
    { retries: { openMode: 3, runMode: 3 } },
    () => {
      contacts.visitContacts()
      contacts.getImportContactsButton().click({ force: true })
      contacts.getImportContactsDrawer().within(() => {
        contacts.getImportContactsClose().should('be.visible')
        cy.wait(900)
        cy.fixture('file.csv', 'base64').then((content) => {
          cy.findByTestId('dropZone').upload({
            file: content,
            fileName: 'filename.csv',
            type: 'text/csv',
            testId: 'dropZone',
          })
        })
      })
      cy.wait('@import').then(() => {
        contacts.getRemappingDrawer().within(() => {
          universal.getCloseButtonByLabelText().should('be.visible')
        })
      })
      //tests that the Popover help tool renders as it should
      contacts.getRemappingDrawer().within(() => {
        cy.findByTestId('popOver').realHover()
        cy.contains('Remapping Requirements:').should('exist')
        cy.contains('First Name, Last Name, and Email are required to create a contact.').should(
          'exist'
        )
        cy.contains(
          'Address 1 must exist in order to add City, State, Postal Code, and Country data.'
        ).should('exist')
        //tests closing the Mapping page with the close button
        universal.getRowByText('Jed')
        universal.getCloseButtonByLabelText().should('be.visible').click({ force: true })
      })
      contacts.getRemappingDrawer().should('not.exist')
    }
  )

  it(
    'Import Contact: tests closing the Mapping page with the skip button',
    { retries: { openMode: 3, runMode: 3 } },
    () => {
      contacts.visitContacts()
      universal.getSpinner().should('not.exist')
      contacts.getImportContactsButton().click({ force: true })
      cy.wait(600)
      contacts.getImportContactsDrawer().within(() => {
        contacts.getImportContactsClose().should('be.visible')
        cy.findByText('Import from a file').should('be.visible')
        cy.fixture('file.csv', 'base64').then((content) => {
          cy.findByTestId('dropZone').upload({
            file: content,
            fileName: 'filename.csv',
            type: 'text/csv',
            testId: 'dropZone',
          })
        })
      })
      cy.wait('@import').then(() => {
        contacts.getRemappingDrawer().within(() => {
          contacts.getSkipButton().click()
        })
        contacts.getRemappingDrawer().should('not.exist')
      })
    }
  )

  it(
    'Import Contact: confirms the Mapping page renders info in csv',
    { retries: { openMode: 3, runMode: 3 } },
    () => {
      contacts.visitContacts()
      universal.getSpinner().should('not.exist')
      contacts.getImportContactsButton().click({ force: true })
      cy.wait(600)
      contacts.getImportContactsDrawer().within(() => {
        contacts.getImportContactsClose().should('be.visible')
        cy.fixture('file.csv', 'base64').then((content) => {
          cy.findByTestId('dropZone').upload({
            file: content,
            fileName: 'filename.csv',
            type: 'text/csv',
            testId: 'dropZone',
          })
        })
      })
      cy.wait('@import').then(() => {
        contacts.getRemappingDrawer().within(() => {
          universal.getCloseButtonByLabelText().should('be.visible')
          universal
            .getRowByText('JedDannerjed@postal.dev1922 Margot PlApt 1San JoseCA95125USACTO Verizon')
            .should('exist')
          universal
            .getRowByText(
              'ErikKostelnikerik@postal.dev123 Main St.Apt. 40San Luis ObispoCA94301USACEO SUNY'
            )
            .should('exist')
          universal
            .getRowByText(
              'BobSmithbob@postal.dev1233 Vista Del Lago San Luis ObispoCA93405USAMonkey Trinity'
            )
            .should('exist')
          contacts.getMappingSelectByNumber(0).should('have.value', 'firstName')
          contacts.getMappingSelectByNumber(1).should('have.value', 'lastName')
          contacts.getMappingSelectByNumber(2).should('have.value', 'emailAddress')
          contacts.getMappingSelectByNumber(3).should('have.value', 'address1')
          contacts.getMappingSelectByNumber(4).should('have.value', 'address2')
          contacts.getMappingSelectByNumber(5).should('have.value', 'city')
          contacts.getMappingSelectByNumber(6).should('have.value', 'state')
          contacts.getMappingSelectByNumber(7).should('have.value', 'postalCode')
          contacts.getMappingSelectByNumber(8).should('have.value', 'country')
          contacts.getMappingSelectByNumber(9).should('have.value', 'title')
          contacts.getMappingSelectByNumber(10).should('have.value', '')
          //tests assigning a mapping
          contacts.getMappingSelectByNumber(10).select('Company')
          contacts.getRemapButton().click({ force: true })
        })
      })
      contacts.getRemappingDrawer().should('not.exist')
      contacts.getProcessingAlert()
    }
  )

  it(`Contact Info/Edit: Given that the contact is not part of any campaign and has no items - then the Contact Info renders as it should`, function () {
    contacts.visitContacts()
    contacts.getShowFiltersButton().click()
    contacts.getLastNameFilter().clear().fill('Lara')
    contacts.getFirstNameFilter().clear().fill('Maria')
    universal.waitForProgressBar()
    universal.getLinkByText('Maria Lara').click({ force: true })
    universal.getSpinner().should('not.exist')
    contacts.getContactInfoCard('Maria Lara').within(() => {
      contacts.getDateAddedStat().should('contain', `${todaysDate}`)
      contacts.getItemsStat().should('contain', `0`)
    })
    contacts.getGroupOrdersTab().click()
    universal.progressBarZero()
    universal.getNoItemsMessage().should('exist')
    contacts.getOrdersTab().click()
    universal.progressBarZero()
    universal.getNoItemsMessage().should('exist')
    contacts.getSubscriptionsTab().click()
    universal.progressBarZero()
    universal.getNoItemsMessage().should('exist')
  })

  it('Contact Info/Edit: opens the Edit a Contact Form and uses the cancel button to close it', function () {
    contacts.visitContacts()
    universal.getLinkByText('Maria Lara').click({ force: true })
    universal.getSpinner().should('not.exist')
    contacts.getEditButton().click()
    contacts.getEditContactDrawer().within(() => {
      contacts.getTitleInput().clear()
      universal.getCloseButtonByLabelText().click()
    })
    contacts.getContactInfoCard('Maria Lara').within(() => {
      cy.contains('QA Engineer')
    })
  })

  it(`Contact Edit: confirms that edit form contains the info entered on create`, function () {
    contacts.visitContacts()
    universal.getLinkByText('Maria Lara').click({ force: true })
    universal.getSpinner().should('not.exist')
    contacts.getEditButton().click()
    contacts
      .getEditContactDrawer()
      .should('be.visible')
      .within(() => {
        universal.getCloseButtonByLabelText().should('be.visible')
        contacts.getFirstNameInput().should('have.value', 'Maria')
        contacts.getLastNameInput().should('have.value', 'Lara')
        contacts.getTitleInput().should('have.value', 'QA Engineer')
        //addresses are readonly at this point
        contacts
          .getAddressBlockByIndex(0)
          .scrollIntoView()
          .within(() => {
            cy.contains('1013 Royal Way')
            cy.contains('Apt 1')
            cy.contains('San Diego')
            cy.contains('CA')
            cy.contains('93405')
            cy.contains('USA')
          })
        contacts.getEmailInput().should('have.value', 'maria@postal.dev')
        contacts
          .getPhoneNumberInput()
          .should('have.value', '780-432-6754')
          .clear()
          .type('782-452-6774')
        // contacts.getPhoneNumbersBlock().within(() => {
        //   contacts.getPhoneNumberInputByIdx(0).should('have.value', '780-432-6754')
        //   contacts.getPhoneNumberTypeInputByIdx(0).should('have.value', 'WORK')
        //   contacts.getDeleteIconButton().should('have.length', 1)
        //   //adds a 2nd phone number to clear and edit it later
        //   contacts.getAddAPhoneNumberButton().click()
        //   contacts.getPhoneNumberTypeInputByIdx(1).select('OTHER')
        //   contacts.getPhoneNumberInputByIdx(1).fill('782-452-6774')
        // })
        universal.getSaveButton().click()
      })
    contacts.getEditContactDrawer().should('not.exist')
  })

  it('Contact Info/Edit: uses the close button to close the Edit Contact Form', function () {
    contacts.visitContacts()
    universal.getLinkByText('Maria Lara').click({ force: true })
    universal.getSpinner().should('not.exist')
    contacts.getEditButton().click()
    contacts.getEditContactDrawer().within(() => {
      contacts.getTitleInput().clear()
      universal.getCloseButtonByLabelText().click({ force: true, multiple: true })
    })
    contacts.getContactInfoCard('Maria Lara').within(() => {
      cy.contains('QA Engineer')
    })
  })

  it('Contact Info/Edit: edits a contact, tests field validation, adding removing addresses, etc', function () {
    contacts.visitContacts()
    universal.getLinkByText('Maria Lara').click({ force: true })
    universal.getSpinner().should('not.exist')
    contacts.getEditButton().click()
    contacts.getEditContactDrawer().within(() => {
      contacts.getEmailInput().clear()
      universal.getSaveButton().click()
      contacts.getEmailInput().then(form.checkValidity).should('be.false')
      contacts.getEmailInput().clear()
      contacts.getEmailInput().fill('fghfgu6juy^^^^^')
      contacts.getEmailInput().then(form.checkValidity).should('be.false')
      contacts.getEmailInput().clear()
      //tests validation for a good email patterns
      contacts.getEmailInput().clear()
      contacts.getEmailInput().fill('mariaUpdated@postal.dev')
      contacts.getEmailInput().then(form.checkValidity).should('be.true')
    })
    // edits and tests input fields validation
    //Test validation when cleared
    contacts.getFirstNameInput().clear()
    contacts.getLastNameInput().clear()
    contacts.getTitleInput().clear()
    contacts.getPhoneNumberInput().clear()
    // contacts.getPhoneNumberTypeInputByIdx(1).should('have.value', 'OTHER')
    // contacts.getPhoneNumberInputByIdx(1).clear()

    universal.getSaveButton().click()

    contacts.getFirstNameInput().getInputValidation('Please fill out this field.')
    contacts.getFirstNameInput().fill('MariaUp')
    universal.getSaveButton().click()
    contacts.getLastNameInput().getInputValidation('Please fill out this field.')
    contacts.getLastNameInput().fill('LaraUP')
    contacts.getTitleInput().should('not.have.attr', 'aria-invalid')

    //Tests validation when input entered with updated info

    contacts.getTitleInput().fill('QA Engineer UP')
    contacts.getPhoneNumberInput().fill('805-432-6754')

    cy.selectAutoCompleteTagsCreatable('dog')

    contacts.getTitleInput().should('not.have.attr', 'aria-invalid')

    //open address update
    contacts.getAddressBlockByIndex(0).within(() => {
      contacts.getEditLink().click()
    })
    contacts.getStreetAddress1Input().clear({ force: true })
    contacts.getCityInput().clear()
    // contacts.getStateInput().clear()
    contacts.getPostalCodeInput().clear()
    contacts.getStreetAddress2Input().clear()

    contacts.getUpdateAddressButton().click()
    cy.contains('Processing').should('not.exist')
    cy.contains('button', 'Try Again', { timeout: 99000 }).click()
    //contacts.getStreetAddress1Input().getInputValidation('Please fill out this field.')
    contacts.getStreetAddress1Input().fill('432 Rodeo Dr')
    contacts.getUpdateAddressButton().click()
    cy.contains('Processing').should('not.exist')
    contacts.getFixItAndTryAgainButton().click()
    //contacts.getStateInput().getInputValidation('Please fill out this field.')
    contacts.getCityInput().fill('Arroyo Grande')
    contacts.getUpdateAddressButton().click()
    contacts.getUseVerifiedAddressButton().click()
    // contacts.getVerifyAddressModal().within(() => {
    //   universal.getCloseButtonByLabelText().click()
    // })
    //contacts.getStateInput().getInputValidation('Please fill out this field.')
    // cy.selectAutoComplete('California')

    // contacts.getStreetAddress2Input().should('not.have.attr', 'aria-invalid')
    // contacts.getUpdateAddressButton().click()
    // contacts.getVerifyAddressModal().within(() => {
    //   cy.contains('Processing').should('not.exist')
    //   contacts.getVerifyAlert().contains('We found a matching address!')
    //   contacts.getVerifyStack().within(() => {
    //     contacts.getOriginalAddressCard().within(() => {
    //       cy.contains('432 Rodeo Dr')
    //       cy.contains('CA')
    //       cy.contains('USA')
    //     })
    //     contacts.getVerifiedAddressCard().within(() => {
    //       cy.contains('432 Rodeo Dr')
    //       cy.contains('CA')
    //       cy.contains('USA')
    //     })
    //   })
    //   contacts.getVerifyAddressModalFooter().within(() => {
    //     contacts.getUseOriginalAddressButton()
    //     contacts.getUseVerifiedAddressButton().click()
    //   })
    // })
    contacts.getVerifyAddressModal().should('not.exist')

    contacts.getAddressBlockByIndex(0).within(() => {
      cy.contains('432 Rodeo Dr')
      cy.contains('CA')
      cy.contains('USA')
      contacts.getVerifiedText()
      contacts.getEditLink().should('exist')
      contacts.getRemoveLink().should('exist')
    })
    // it(`Contact Info/Edit: removes a phone number`, function () {
    //   contacts.getPhoneNumberTypeInputByIdx(1).should('have.value', 'OTHER')

    //   contacts.getRemovePhoneButtonByCardIndex(1).click()
    //   contacts.getRemovePhoneModal().within(() => {
    //     universal.getRemoveButton().click()
    //   })

    //   contacts.getRemovePhoneModal().should('not.exist')
    //   // contacts.getPhoneNumbersBlock().within(() => {
    //   //   contacts.getDeleteIconButton().should('have.length', 1)
    //   //   contacts.getPhoneNumberTypeInputByIdx(0).should('have.value', 'WORK')
    //   // })
    //   contacts.getAddAPhoneNumberButton().click()
    //   contacts.getPhoneBlockByIdx(1).should('exist')
    //   contacts.getPhoneNumberInputByIdx(1).fill('789-342-5555')
    //   contacts.getPhoneNumberTypeInputByIdx(1).select('HOME', { force: true }).should('have.value', 'HOME')
    // })
    //removes and adds an address
    cy.contains('Work').scrollIntoView()

    contacts.getAddressBlockByIndex(0).within(() => {
      cy.contains('432 Rodeo Dr').should('exist')
      cy.contains('CA').should('exist')
      cy.contains('USA').should('exist')
      contacts.getVerifiedText().should('exist')
      contacts.getEditLink().should('exist')
      contacts.getRemoveLink().click()
    })

    contacts.getRemoveAddressModal().within(() => {
      cy.contains('Are you sure you want to Remove this address?')
      universal.getCancelButton().should('exist')
      universal.getRemoveButton().click()
    })
    contacts.getRemoveAddressModal().should('not.exist')
    contacts.getAddressBlockByIndex(0).should('not.exist')
    contacts.getAddAnAddressButton().click()
    contacts.getAddAddressDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      contacts.getStreetAddress1Input().type('1013 Royal UP', { force: true })
      contacts.getCityInput().fill('Sup Diego')
      cy.selectAutoCompleteState('Ohio')
      contacts.getPostalCodeInput().fill('93333')
      contacts.getStreetAddress2Input().fill('Apt 12')
      contacts.getAddAddressButton().click({ force: true })
    })
    cy.contains('Processing').should('not.exist')
    contacts.getVerifyAddressModal().within(() => {
      contacts.getVerifyAlert().contains('You entered an unknown address.')
      contacts.getVerifyStack().within(() => {
        contacts.getOriginalAddressCard().within(() => {
          cy.contains('1013 Royal UP')
          cy.contains('Sup Diego')
          cy.contains('OH')
          cy.contains('93333')
          cy.contains('USA')
          cy.contains('Apt 12')
        })
      })
      contacts
        .getVerifyAddressModalFooter()
        .should('be.visible')
        .within(() => {
          contacts.getUseThisAddressButton().click()
        })
    })
    contacts.getConfirmUnVerifiedAddressModal().within(() => {
      universal.getConfirmButton().click()
    })
    contacts.getVerifyAddressModal().should('not.exist')
    contacts.getAddAddressDrawer().should('not.exist')
    contacts.getAddressBlockByIndex(0).should('exist')
    //submits the edit contact form
    contacts.getEditContactDrawer().within(() => {
      universal.getSaveButton().should('not.be.disabled').click({ force: true })
    })
    contacts.getUpdatedAlert()
  })

  it(`Contact Info: confirms that the contact's profile contains the info entered on update`, function () {
    cy.wait(2000)
    // cy.queryForUpdateRecurse({
    //   request: SearchContactsV2Document,
    //   operationName: 'searchContactsV2',
    //   key: 'searchableContacts',
    //   value: 'MariaUp',
    //   key2: '24',
    //   key3: 'firstName',
    // })
    contacts.visitContacts()
    universal.getLinkByText('MariaUp LaraUP').click()
    contacts.getContactInfoCard('MariaUp LaraUP').within(() => {
      cy.contains('MariaUp LaraUP')
      cy.contains('QA Engineer UP')
      cy.contains('mariaupdated@postal.dev')
      cy.contains('805-432-6754')
      cy.contains('dog')
    })
    contacts.getDefaultAddressCard().within(() => {
      cy.contains('1013 Royal UP')
      cy.contains('Apt 12')
      cy.contains('Sup Diego, OH 93333')
    })
  })

  it(`Contact Info/Edit: confirms that edit form contains the info entered on update`, function () {
    contacts.visitContacts()
    contacts.getCreateContactLink().should('exist')
    universal.getSpinner().should('not.exist')
    contacts.getSearchContactsInput().fill('mariaUp')
    universal.getLinkByText('MariaUp LaraUP').click()
    universal.getSpinner().should('not.exist')
    contacts.getEditButton().click({ force: true })
    contacts.getEditContactDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      contacts.getFirstNameInput().should('have.value', 'MariaUp')
      contacts.getLastNameInput().should('have.value', 'LaraUP')
      contacts.getTitleInput().should('have.value', 'QA Engineer UP')
      contacts.getEmailInput().should('have.value', 'mariaupdated@postal.dev')
      //Read-only address card
      contacts.getAddressBlockByIndex(0).within(() => {
        cy.contains('1013 Royal UP')
        cy.contains('Apt 12')
        cy.contains('Sup Diego, OH 93333')
        cy.contains('USA')
      })
      contacts.getPhoneNumberInput().should('have.value', '805-432-6754')
      universal.getCloseButtonByLabelText().click()
    })
  })

  it('A contact address can be updated from the sidebar', function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    contacts.getSearchContactsInput().clear().fill('mariaUp')
    universal.getNoItemsMessage().should('not.exist')
    universal.getLinkByText('MariaUp LaraUP').click()
    //Edit address from sidebar
    contacts.getEditLink().click()
    contacts.getPreferredAddressCheck().click()
    contacts.getAddressLabelInput().fill('New Label')
    contacts.getUpdateAddressButton().click()
    contacts
      .getVerifyAddressModal()
      .should('be.visible')
      .within(() => {
        contacts.getFixItAndTryAgainButton().should('exist')
        contacts.getUseThisAddressButton().click()
      })
    contacts.getConfirmUnVerifiedAddressModal().within(() => {
      universal.getConfirmButton().click()
    })
    cy.contains('Manually Verified')
    cy.contains('New Label')
  })

  it('Delete Contact: tests the Delete a Contact modal', function () {
    contacts.visitContacts()
    contacts.getSearchContactsInput().clear().fill('mariaUp')
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: 'MariaUp' })
    cy.wait(200)
    contacts.getDeleteContactsIconButton().click({ force: true })
    contacts.getDeleteContactsModal(1).should('exist')
    cy.contains('Are you sure you want to Delete this 1 contact?').should('exist')
    universal.getRemoveButton().should('exist')
    //Delete Contact: tests the Cancel button
    universal.getCancelButton().click()
    universal.getRowByText('MariaUp LaraUP').should('exist')

    //Delete Contact: tests the Confirm button
    contacts.getShowFiltersButton().click({ force: true })
    contacts.getLastNameFilter().type('LaraUp{enter}')
    universal.waitForProgressBar()
    universal.getRowByText('MariaUp').within(() => {
      cy.findByRole('checkbox').should('be.checked')
    })
    contacts.getDeleteContactsIconButton().click({ force: true })
    contacts.getDeleteContactsModal(1).within(() => {
      universal.getRemoveButton().click()
    })
    contacts.getDeletedAlert()
    universal.getNoItemsMessage().should('exist')
  })

  it('Imported Contacts: tests that imported contacts exist in the contacts table', function () {
    contacts.visitContacts()
    contacts.getShowFiltersButton().click()
    contacts.getFirstNameFilter().as('firstName').fill('Jed')
    universal.getLinkByText('Jed Danner').should('exist')
    cy.get('@firstName').clear()
    cy.get('@firstName').fill('Erik')
    universal.getLinkByText('Erik Kostelnik').should('exist')
    cy.get('@firstName').clear()
    cy.get('@firstName').fill('Bob')
    universal.getLinkByText('Bob Smith').should('exist').click({ force: true })
    //Imported Contacts: tests that the assigned mapping made it into contact's profile
    cy.contains('Trinity')
    //Imported Contacts: tests that the info in the csv file made it into contact's profile
    cy.contains('Bob Smith').click({ force: true })
    cy.contains('1233 Vista Del Lago')
    cy.contains('San Luis Obispo')
    cy.contains('CA')
    cy.contains('93405')
    cy.contains('Bob Smith')
    cy.contains('Monkey')
    cy.contains('bob@postal.dev')
    contacts.getDateAddedStat().contains(RegExp(todaysDate + '|' + tomorrowsDate))
  })

  it(`Imported Contacts: tests that the info in the csv file made it into contact's edit form`, function () {
    contacts.visitContacts()
    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    contacts.getSearchContactsInput().fill('bob')
    universal.getLinkByText('Bob Smith').click({ force: true })
    contacts.getContactInfoCard('Bob Smith').should('be.visible')
    contacts.getEditButton().click()
    contacts.getFirstNameInput().should('have.value', 'Bob')
    contacts.getLastNameInput().should('have.value', 'Smith')
    contacts.getTitleInput().should('have.value', 'Monkey')
    cy.contains('1233 Vista Del Lago')
    cy.contains('San Luis Obispo')
    cy.contains('CA')
    cy.contains('93405')
    cy.contains('USA')
    contacts.getEmailInput().should('have.value', 'bob@postal.dev')
  })

  it(`Contact Info w/ Campaign: Given that the contact is part of a campaign and has sent postals - then the Contact Info renders as it should`, function () {
    contacts.visitContacts()
    //stubs can be used here without a tracker because the test exists at the end of the file
    cy.graphqlMockSet({
      operationName: 'objectAnalytics',
      fixture: 'objectAnalyticsMock.json',
      count: 4,
    })
    cy.graphqlMockSet({
      operationName: 'getContact',
      fixture: 'getContactMock.json',
      count: 4,
    })
    cy.graphqlMockSet({
      operationName: 'searchContactPostalFulfillments',
      fixture: 'searchPostalFulfillmentsMock.json',
      count: 4,
    })
    cy.graphqlMockSet({
      operationName: 'searchCampaigns',
      fixture: 'searchCampaignsMock.json',
      count: 4,
    })
    cy.graphqlMockStart()
    //Contact Hard Coded from Imports
    universal.getRowByNumber(1).find('a').click()
    universal.getSpinner().should('not.exist')
    //mock will direct to a Erwin Schneider(mocked contact) rather than Bob Smith
    contacts.getDateAddedStat().should('be.visible').and('contain', `10/7/2020`)
    contacts
      .getContactInfoCard(`Erwin Schneider`)
      .should('be.visible')
      .within(() => {
        //hardcoded assertions from mocked data
        contacts.getItemsStat().should('contain', `2`)
      })
    contacts.getGroupOrdersTab().click({ force: true })
    universal.getNoItemsMessage().should('not.exist')
    //Hard Coded via Mock
    universal
      .getRowByText('Tasty Steel Shoes')
      .should('have.text', 'Tasty Steel ShoesGift Email0 RecipientsCancelled')
    universal
      .getRowByText('Handmade Concrete Pants')
      .should('have.text', 'Handmade Concrete PantsGift Email0 RecipientsError')
    contacts.getOrdersTab().click({ force: true })
    universal.getRowByText('Erwin Schneider').and('contain', 'Delivered').and('be.visible')
    cy.graphqlMockClear()
  })
})
