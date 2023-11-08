import { onlyOn } from '@cypress/skip-test'
import { CreateMagicLinkDocument, MagicLinkStatus } from '../../support/api'
import { userFactory } from '../../support/factories'
import { Delivery, MagicLinks, Universal } from '../../support/pageObjects'

describe('Email Blocklist page testing', function () {
  const user = userFactory()
  const universal = new Universal()
  const magiclinks = new MagicLinks()
  const delivery = new Delivery()
  const blockedDomain = 'jollyRoger.dev'
  const blockedContains = 'blackbeard'
  const blockedEndsWith = '@scallywag.dev'
  const blockedEquals = 'jack@noTales.dev'

  before(function () {
    cy.signup(user)
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
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests adding entries and importing lists`, function () {
    //tests adding blocklist entries
    visitEmailBlocklist()
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    cy.contains('Email Blocklist')
    universal.getTableHeader().should('contain', blocklistTableHeaderText())
    universal.progressBarZero()
    universal.getNoItemsMessage().should('exist')
    getAddEntryButton().click()
    getAddBlocklistEntryModal().within(() => {
      getTypeSelect()
        .should('have.value', 'DOMAIN')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['CONTAINS', 'DOMAIN', 'ENDS_WITH', 'EQUALS'])
        })
      universal.getCancelButton().should('exist')
      getValueInput()
        .getInputValidation('Please fill out this field.')
        .type('hehsgsg')
        .clear()
        .type(blockedDomain)
      getSaveEntryButton().click()
    })
    cy.getAlert({ message: 'Entry Added', close: 'close' })
    getAddBlocklistEntryModal().should('not.exist')
    universal.progressBarZero()
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowByText(blockedDomain).should('contain', 'DOMAIN')
    const blocks = [
      [blockedContains, 'CONTAINS', '2'],
      [blockedEndsWith, 'ENDS_WITH', '3'],
      [blockedEquals, 'EQUALS', '4'],
    ]
    blocks.forEach((block) => {
      getAddEntryButton().click()
      getAddBlocklistEntryModal().within(() => {
        getTypeSelect().select(block[1])
        getValueInput().type(block[0])
        getSaveEntryButton().click()
      })
      cy.getAlert({ message: 'Entry Added', close: 'close' })
      getAddBlocklistEntryModal().should('not.exist')
      universal.progressBarZero()
      universal.getRowsInATableBody().should('have.length', block[2])
      universal.getRowByText(block[0]).should('contain', block[1])
    })
    //tests importing a blocklist
    getImportListButton().click()
    getImportDrawer().within(() => {
      cy.contains(
        'Need help? Check out our help article, which contains an import template.'
      ).should('exist')
      cy.contains('a', 'help article').should(
        'have.attr',
        'href',
        'https://help.postal.com/helpcenter/s/article/Email-Blocklist-CSV-Upload'
      )
      universal.getCloseButtonByLabelText().should('be.visible')
      cy.fixture(`pirates.csv`, 'base64').then((content) => {
        cy.findByTestId('dropZone').upload({
          file: content,
          fileName: 'user.csv',
          type: 'text/csv',
          testId: 'dropZone',
        })
      })
    })
    universal.progressBarZero()
    cy.reload()
    universal.progressBarZero()
    universal.getRowsInATableBody().should('have.length', 8)
    universal.getRowByText('parley.rum').should('contain', 'DOMAIN')
    universal.getRowByText('anneBonny@doubloon.aft').should('contain', 'EQUALS')
    universal.getRowByText('@plunder.sail').should('contain', 'ENDS_WITH')
    universal.getRowByText('bounty').should('contain', 'CONTAINS')
    //tests clicking into and editing an entry
    universal.getRowByText('parley.rum').click()
    getUpdateBlocklistEntryModal().within(() => {
      getTypeSelect().should('have.value', 'DOMAIN').select('CONTAINS')
      getValueInput().should('have.value', 'parley.rum').clear().type(`parley.rumEdit`)
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().should('exist')
      getSaveEntryButton().click()
    })
    cy.getAlert({ message: 'Entry Updated', close: 'close' })
    //deletes the same entry
    universal.getRowByText(`parley.rumEdit`).should('contain', 'CONTAINS').click()
    getUpdateBlocklistEntryModal().within(() => {
      getTypeSelect().should('have.value', 'CONTAINS')
      getValueInput().should('have.value', `parley.rumEdit`)
      getSaveEntryButton().should('exist')
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().click()
    })
    getPleaseConfirmModal().within(() => {
      getConfirmModalText()
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().click()
    })
    cy.getAlert({ message: 'Entry Removed', close: 'close' })
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    universal.getRowByText(`parley.rumEdit`).should('not.exist')
    universal.getRowsInATableBody().should('have.length', 7)
    //tests searchbar
    getSearchbar().type('@{enter}')
    universal.getRowsInATableBody().should('have.length', 4)
    const rowNums = [0, 1, 2, 3]
    rowNums.forEach((row) => {
      universal.getRowByNumber(row).should('contain', '@')
    })
    getSearchbar().clear()
    universal.getRowsInATableBody().should('have.length', 7)
    getSearchbar().type('blackbeard')
    universal.getRowsInATableBody().should('have.length', 1).and('contain', 'blackbeard')
    onlyOn(Cypress.env('testUrl'), () => {
      magiclinks.visitMagicLinks()
      cy.contains('tr', 'MagicLink 0')
        .find('button')
        .eq(0)
        .should('be.visible')
        .then(($link: any) => {
          delivery.visit($link.attr('title'))
        })
      delivery.getFirstNameInput().fill('Daniel')
      delivery.getLastNameInput().fill('Davis')
      delivery.getEmailInput().fill(`daniel@${blockedDomain}`)
      delivery.getSubmitButton().click({ force: true })
      delivery.getFirstNameInput().should('exist')
      getLinkIsNotValidText().should('not.exist')
      const emailInputs = [
        `daniel${blockedContains}@postal.dev`,
        `danielDavis${blockedEndsWith}`,
        blockedEquals,
      ]
      emailInputs.forEach((email) => {
        cy.reload()
        delivery.getFirstNameInput().fill('Daniel')
        delivery.getLastNameInput().fill('Davis')
        delivery.getEmailInput().clear().fill(email)
        delivery.getSubmitButton().click({ force: true })
        delivery.getFirstNameInput().should('exist')
        getLinkIsNotValidText().should('not.exist')
      })
    })
  })
})

const visitEmailBlocklist = () => {
  return cy.visit('/account/blocklist')
}
const getImportListButton = () => {
  return cy.findByRole('button', { name: 'Import List' })
}
const getAddEntryButton = () => {
  return cy.findByRole('button', { name: 'Add Entry' })
}
const blocklistTableHeaderText = () => {
  return 'EntryType'
}
const getSearchbar = () => {
  return cy.findByPlaceholderText('Search')
}
const getAddBlocklistEntryModal = () => {
  return cy.findByRole('dialog', { name: 'Add Blocklist Entry' })
}
const getTypeSelect = () => {
  return cy.findByRole('combobox', { name: 'Type' })
}
const getValueInput = () => {
  return cy.findByRole('textbox', { name: 'Value' })
}
const getSaveEntryButton = () => {
  return cy.findByRole('button', { name: 'Save Entry' })
}
const getImportDrawer = () => {
  return cy.findByTestId('ContactsImport_popover')
}
const getUpdateBlocklistEntryModal = () => {
  return cy.findByRole('dialog', { name: 'Update Blocklist Entry' })
}
const getPleaseConfirmModal = () => {
  return cy.findByRole('dialog', { name: 'Delete Entry' })
}
const getConfirmModalText = () => {
  return cy.contains('Are you sure you want to delete this entry?')
}
const getLinkIsNotValidText = () => {
  return cy.contains(
    'Unfortunately, you are unable to redeem this item due to a setting configured by the Sender.'
  )
}
