import { userFactory } from '../../support/factories'
import { Contacts, Form, Universal } from '../../support/pageObjects'

describe('Create Contact Workflow', function () {
  const contacts = new Contacts()
  const universal = new Universal()
  const form = new Form()
  const user = userFactory()
  const todaysDate = new Date().toLocaleDateString('en-US')
  const date = new Date()
  date.setDate(date.getDate() + 1)

  before(() => {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
    cy.filterLocalStorage('postal:filters:contacts')
    cy.filterLocalStorage('postal:contacts:filter')
  })

  // Create Contact Workflow

  it('tests the create contact workflow and contacts table', function () {
    //opens the Create a Contact Form and uses the cancel button to close it
    contacts.visitContacts()
    cy.url().should('include', '/contacts')
    universal.getSpinner().should('not.exist')
    contacts.getCreateContactLink().should('be.visible').click({ force: true })
    contacts.getCreateContactDrawer().within(() => {
      //universal.getCancelButton().click({ force: true })
      universal.getCloseButtonByLabelText().click()
    })
    //opens the Create a Contact Form and uses the close button to close it
    contacts.getCreateContactDrawer().should('not.exist')
    contacts.getCreateContactLink().click({ force: true })
    contacts.getCreateContactDrawer().within(() => {
      universal.getCloseButtonByLabelText().click({ force: true, multiple: true })
    })
    //submits the form without filling anything out
    contacts.getCreateContactDrawer().should('not.exist')
    contacts.getCreateContactLink().click({ force: true })
    contacts.getCreateContactDrawer().within(() => {
      universal.getSaveButton().scrollIntoView().should('be.visible').click({ force: true })
      //three fields should be invalid three should be clear
      contacts
        .getFirstNameInput()
        .scrollIntoView()
        .getInputValidation('Please fill out this field.')
      contacts.getFirstNameInput().fill('Maria').should('not.have.attr', 'aria-invalid')
      universal.getSaveButton().scrollIntoView().should('be.visible').click({ force: true })
      contacts.getLastNameInput().scrollIntoView().getInputValidation('Please fill out this field.')
      contacts.getLastNameInput().fill('Lara')
      universal.getSaveButton().scrollIntoView().should('be.visible').click({ force: true })
      contacts.getEmailInput().scrollIntoView().getInputValidation('Please fill out this field.')
      //tests validation for bad email patterns
      contacts
        .getEmailInput()
        .clear()
        .fill('sdhsh@%%%%')
        .then(form.checkValidity)
        .should('be.false')
      universal.getSaveButton().scrollIntoView().should('be.visible').click({ force: true })
      //tests validation for a good email patterns
      contacts
        .getEmailInput()
        .scrollIntoView()
        .clear()
        .fill('maria@postal.dev')
        .then(form.checkValidity)
        .should('be.true')
      contacts.getTitleInput().should('not.have.attr', 'aria-invalid')
      contacts.getCompanyInput().should('not.have.attr', 'aria-invalid')
      contacts.getTagsInput().should('not.have.attr', 'aria-invalid')
      //checks for the Search Tags placeholder
      contacts.getTagsGroup().should('contain', 'Search Tags')
      //tests and fills out more input fields`
      contacts.getTitleInput().fill('QA Engineer')
      contacts.getCompanyInput().fill(`Maria's Place`)
      cy.selectAutoCompleteTagsCreatable('cat1')
      //tests and fills address input fields
      contacts.getPhoneNumberInput().fill('239-389-9902')
      contacts.getAddAnAddressButton().click({ force: true })
    })
    contacts.getAddAddressDrawer().within(() => {
      universal.getCloseButtonByLabelText().should('be.visible')
      contacts.getAddressLabelInput().scrollIntoView().fill('Work')
      contacts.getStreetAddress1Input().fill('1013 Royal Way')
      contacts.getStreetAddress2Input().fill('Apt 1')
      contacts.getCityInput().fill('San Diego')
      cy.selectAutoCompleteState('California')
      contacts.getPostalCodeInput().fill('93405')
      contacts.getAddAddressButton().click({ force: true })
    })
    contacts
      .getVerifyAddressModal()
      .wait(200)
      .within(() => {
        contacts.getVerifyAlert().should('contain', contacts.unknownAddressText())
        contacts.getVerifyStack().within(() => {
          contacts.getVerifiedAddressCard().should('not.exist')
          contacts
            .getOriginalAddressCard()
            .should('be.visible')
            .within(() => {
              cy.contains('1013 Royal Way')
              cy.contains('93405')
              cy.contains('USA')
            })
        })
        contacts.getFixItAndTryAgainButton()
        contacts.getUseThisAddressButton().click()
      })
    contacts.getConfirmUnVerifiedAddressModal().within(() => {
      universal.getConfirmButton().click()
    })
    contacts.getConfirmUnVerifiedAddressModal().should('not.exist')
    contacts.getVerifyAddressModal().should('not.exist')
    contacts
      .getAddressBlockByIndex(0)
      .scrollIntoView()
      .within(() => {
        contacts.getPreferredAddressIcon().should('exist')
      })

    contacts.getAddAnAddressButton().click()

    contacts.getAddAddressDrawer().within(() => {
      contacts.getAddressLabelInput().scrollIntoView().fill('HOME')
      contacts.getStreetAddress1Input().fill('432 Rodeo Dr')
      contacts.getCityInput().fill('Arroyo Grande')
      cy.selectAutoCompleteState('California')
      contacts.getPostalCodeInput().fill('93420')
      contacts.getAddAddressButton().click()
    })
    contacts
      .getVerifyAddressModal()
      .wait(200)
      .within(() => {
        cy.contains('Processing').should('not.exist')
        contacts.getVerifyAlert().contains(contacts.matchingAddressText())
        contacts.getVerifyStack().within(() => {
          contacts.getOriginalAddressCard().within(() => {
            cy.contains('432 Rodeo Dr')
            cy.contains('CA')
            cy.contains('USA')
          })
          contacts.getVerifiedAddressCard().within(() => {
            cy.contains('432 Rodeo Dr')
            cy.contains('CA')
            cy.contains('USA')
          })
        })
        contacts.getUseOriginalAddressButton()
        contacts.getUseVerifiedAddressButton().click()
      })
    contacts.getVerifyAddressModal().should('not.exist')
    contacts
      .getAddressBlockByIndex(1)
      .as('address-block-1')
      .scrollIntoView()
      .within(() => {
        contacts.getPreferredAddressIcon().should('not.exist')
      })
    cy.get('@address-block-1').within(() => {
      cy.contains('432 Rodeo Dr')
      cy.contains('CA')
      cy.contains('USA')
      contacts.getVerifiedText().should('be.visible')
      contacts.getPreferredText().should('not.exist')
      contacts.getEditLink().should('be.visible')
      contacts.getRemoveLink().should('be.visible')
      contacts.getSetAsDefaultLink().click()
    })
    contacts
      .getSetDefaultAddressModal()
      .should('be.visible')
      .within(() => {
        universal.getCancelButton().should('be.visible')
        universal.getConfirmButton().click()
      })
    contacts.getSetDefaultAddressModal().should('not.exist')
    cy.wait(300)
    contacts
      .getAddressBlockByIndex(1)
      .scrollIntoView()
      .within(() => {
        contacts.getPreferredText().should('exist')
        contacts.getEditLink().should('be.visible')
        contacts.getRemoveLink().should('be.visible')
        contacts.getSetAsDefaultLink().should('not.exist')
      })
    contacts.getAddressBlockByIndex(0).within(() => {
      contacts.getPreferredText().should('not.exist')
      contacts.getEditLink().should('be.visible')
      contacts.getRemoveLink().click({ force: true })
    })

    contacts.getRemoveAddressModal().within(() => {
      universal.getCancelButton().should('be.visible')
      universal.getRemoveButton().click({ force: true })
    })

    contacts.getAddressBlockByIndex(0).within(() => {
      contacts.getPreferredText().should('exist')
      contacts.getEditLink().should('be.visible')
      contacts.getSetAsDefaultLink().should('not.exist')
    })

    //submits the create contact form
    contacts.getCreateContactDrawer().within(() => {
      universal.getSaveButton().click({ force: true })
      universal.getSpinner().should('not.exist')
    })
    contacts.getCreateContactDrawer().should('not.exist')

    //confirms that the new contact is displayed in the table
    universal
      .getRowByText('QA Engineer')
      .should('contain', 'maria@postal.dev')
      .should('contain', `Maria's Place`)
      .should('contain', todaysDate)
      .contains('Maria Lara')
      .click()
    //confirms that the new contact's profile contains the info entered on create
    contacts.getContactInfoCard(`Maria Lara`).within(() => {
      cy.contains('QA Engineer')
      cy.contains('cat1')
      cy.contains('maria@postal.dev')
      cy.contains('239-389-9902')
      contacts.getDateAddedStat().should('contain', todaysDate)
    })
    contacts.getDefaultAddressCard().within(() => {
      cy.contains('432 Rodeo Dr')
      cy.contains('Arroyo Grande,')
      cy.contains('CA 93420')
      cy.contains('Verified')
    })
  })
})
