import { Contacts, Universal } from '../../pageObjects'

export interface crudContactsProps {
  filename: string
  firstName: string
  lastName: string
  company: string
  title: string
  email: string
  tags: string
  deleting: string
}
Cypress.Commands.add('crudContacts', (args: crudContactsProps) => {
  //used pageObject models
  const universal = new Universal()
  const contacts = new Contacts()

  const filename = args.filename
  const firstName = args.firstName
  const lastName = args.lastName
  const company = args.company
  const title = args.title
  const email = args.email
  const tags = args.tags
  const deleting = args.deleting

  //Create
  contacts.visitContacts()
  universal.progressBarZero()
  contacts.getCreateContactLink().click({ force: true })
  contacts.getCreateContactDrawer().within(() => {
    contacts.getFirstNameInput().should('be.visible').fill(firstName)
    contacts.getLastNameInput().fill(lastName)
    contacts.getEmailInput().fill(email)
    contacts.getTitleInput().fill(title)
    contacts.getCompanyInput().fill(company)
    contacts.getAddAnAddressButton().click()
  })
  contacts.getAddAddressDrawer().within(() => {
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.wait(300)
    contacts.getStreetAddress1Input().fill('2058 Loomis St')
    contacts.getCityInput().fill('San Luis Obispo')
    cy.selectAutoCompleteState('California')
    cy.wait(300)
    contacts.getPostalCodeInput().should('be.visible').fill('93405')
    cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
    contacts.getAddAddressButton().should('not.be.disabled').click({ force: true })
  })
  contacts.getVerifyAddressModal().within(() => {
    cy.contains('Processing').should('not.exist')
    contacts.getVerifyAlert().should('be.visible').and('contain', 'We found a matching address!')
    contacts.getVerifyStack().within(() => {
      contacts.getOriginalAddressCard().within(() => {
        cy.contains('2058 Loomis St').should('be.visible')
        cy.contains('CA')
        cy.contains('USA')
      })
      cy.findByTestId('verified-address').within(() => {
        cy.contains('2058 Loomis St')
        cy.contains('CA')
        cy.contains('USA')
      })
    })
    contacts.getUseOriginalAddressButton().click()
  })
  contacts.getConfirmUnVerifiedAddressModal().within(() => {
    universal.getConfirmButton().click()
  })
  contacts.getConfirmUnVerifiedAddressModal().should('not.exist')
  contacts.getVerifyAddressModal().should('not.exist')
  contacts.getCreateContactDrawer().within(() => {
    contacts.getPhoneNumberInput().fill('780-432-6754')
    cy.selectAutoCompleteTagsCreatable(tags)
    universal.getSaveButton().click({ force: true })
  })
  cy.contains('Loading').should('not.exist')
  contacts.getCreateContactDrawer().should('not.exist')
  //Import
  cy.intercept('/engage/api/graphql', (req) => {
    if (req.body.operationName === 'searchContactsV2') {
      req.alias = 'searchContactsV2CrudContacts'
    }
  })
  contacts.visitContacts()
  cy.url().should('contain', 'contacts')
  cy.wait('@searchContactsV2CrudContacts', { timeout: 55000 })
  cy.intercept('POST', '/engage/api/upload-contacts?*').as('import')
  universal.getSpinner().should('not.exist')
  contacts.getImportContactsButton().click()
  contacts.getImportContactsDrawer().within(() => {
    universal.getCloseButtonByLabelText().should('be.visible')
  })
  cy.fixture(`${filename}.csv`, 'base64').then((content) => {
    cy.wait(600)
    cy.findByTestId('dropZone').upload({
      file: content,
      fileName: 'user.csv',
      type: 'text/csv',
      testId: 'dropZone',
    })

    cy.wait('@import').then(() => {
      cy.wait(300)
      contacts.getRemapButton().click({ force: true })
      contacts.getProcessingAlert()
    })
  })

  //Edit
  contacts.visitContacts()
  universal.getSpinner().should('not.exist')
  universal.progressBarZero()
  contacts.getSearchContactsInput().should('be.visible').fill(`${firstName} ${lastName}`)
  universal.waitForProgressBar()
  contacts.getContactLinkByName(`${firstName} ${lastName}`).click({ force: true })
  universal.getSpinner().should('not.exist')
  contacts.getEditButton().click({ force: true })
  contacts.getEditContactDrawer().within(() => {
    contacts.getFirstNameInput().should('be.visible').clear().fill(`${firstName}UP`)
    contacts.getLastNameInput().clear().fill(`${lastName}UP`)
    contacts.getEmailInput().clear().fill(email)
    contacts.getTitleInput().clear().fill(`${title}UP`)
    contacts.getCompanyInput().clear().fill(`${company}UP`)
    contacts.getPhoneNumberInput().clear().fill('805-432-6754')
    cy.selectAutoCompleteTagsCreatable('dog')
    contacts.getAddressBlockByIndex(0).within(() => {
      contacts.getEditLink().click({ force: true })
    })
  })
  contacts.getEditContactAddressDrawer().within(() => {
    contacts.getStreetAddress1Input().clear().fill('1544 Morro Street')
    contacts.getCityInput().clear().fill('San Luis Obispo')
    contacts.getPostalCodeInput().clear().fill('93401')
    contacts.getUpdateAddressButton().click()
  })
  contacts
    .getVerifyAddressModal()
    .should('be.visible')
    .within(() => {
      cy.contains('Processing').should('not.exist')
      contacts.getVerifyAlert().contains('We found a matching address!')
      contacts.getVerifyStack().within(() => {
        contacts.getOriginalAddressCard().within(() => {
          cy.contains('1544 Morro Street')
          cy.contains('CA')
          cy.contains('USA')
        })
        contacts.getVerifiedAddressCard().within(() => {
          cy.contains('1544 Morro St')
          cy.contains('CA')
          cy.contains('USA')
        })
      })
    })
  contacts
    .getVerifyAddressModal()
    .should('be.visible')
    .within(() => {
      contacts.getUseVerifiedAddressButton().click()
    })
  universal.getSaveButton().click()
  contacts.getEditContactDrawer().should('not.exist')
  contacts.getContactInfoCard(`${firstName}UP`).within(() => {
    cy.contains(`${lastName}UP`).should('be.visible')
  })
  //Delete
  contacts.visitContacts()
  universal.getSpinner().should('not.exist')
  cy.wait(500)
  contacts.getSearchContactsInput().should('be.visible').clear().fill(deleting)
  universal.waitForProgressBar()
  universal.getRowsInATableBody().should('have.length.lte', 5)
  cy.clickCheckbox({ name: deleting })
  contacts.getDeleteContactsIconButton().click({ force: true })
  universal.getRemoveButton().click({ force: true })
  contacts.getDeletedAlert()
})
