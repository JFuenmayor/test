import { faker } from '@faker-js/faker'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  CreateApprovedPostalDocument,
  PaymentPartnerType,
  SearchMarketplaceProductsDocument,
  Status,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import { Marketplace, Navbar, SendItem, Subscriptions, Universal } from '../../support/pageObjects'

describe('Triggers Testing', () => {
  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const sendItem = new SendItem()
  //const subNavbar = new SubNavbar()
  const subscriptions = new Subscriptions()
  const universal = new Universal()
  const user = userFactory()
  const todaysDate = new Date().toLocaleDateString('en-US')
  const giftEmailMessage = faker.lorem.sentence(1)
  let approvedPostalId: string
  let approvedVariantId: string

  before(() => {
    cy.signup(user)
    cy.graphqlRequest(SearchMarketplaceProductsDocument, {
      filter: { name: { eq: 'Def Leppard T-Shirt' } },
    }).then((res) => {
      const product = res.searchMarketplaceProducts?.[0]
      return cy
        .graphqlRequest(CreateApprovedPostalDocument, {
          marketplaceProductId: product?.id,
          data: {
            name: 'Def Leppard T-Shirt',
            description: 'Def Leppard T-Shirt Description',
            status: Status.Active,
            items: [
              { variant: product?.variants?.[0].id ?? '', marketplaceProductId: product?.id ?? '' },
            ],
            version: '2',
          },
        })
        .then((postal) => {
          approvedPostalId = postal.createApprovedPostal.postal.id
          approvedVariantId = postal.createApprovedPostal.postal.variants?.[0].id ?? ''
        })
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
  })

  beforeEach(() => {
    cy.login(user)
  })

  it(`tests triggers`, () => {
    //tests the empty default trigger page
    visitTriggers()
    universal.getSpinner().should('not.exist')
    navbar.getNavbarLeft().should('contain', 'Triggers')
    cy.wait(500)
    getEmptyTriggersInfo()
      .should('be.visible')
      .within(() => {
        cy.contains('Triggers')
        cy.contains('Automate actions based on events from your CRM or sales engagement tool.')
        cy.contains('button', 'Create a trigger').click()
        cy.url().should('contain', '/edit')
      })
    //tests creating a trigger with the zapier - do nothing option
    cy.contains('Add Trigger').should('exist')
    cy.findByLabelText('Name').type('Trigger1')
    cy.findByLabelText('Trigger Action').should('not.exist')
    cy.contains('[role="group"]', 'Integration').find('input').eq(0).click()
    cy.findByText('Zapier').click()
    cy.contains('[role="alert"]', 'Once saved, this trigger can be enabled in Zapier')
    cy.contains('[role="group"]', 'Trigger Action').find('input').eq(0).click()
    cy.findByText('Send an Item').should('exist')
    cy.findByText('Start a Subscription').should('exist')
    cy.findByText('Stop a Subscription').should('exist')
    cy.findByText('Do Nothing').click()
    universal.getCancelButton().should('exist')
    getCreateTriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')

    cy.contains('Add Trigger').should('not.exist')
    getEmptyTriggersInfo().should('not.exist')
    getSearchTriggersByNameFilter().should('exist')
    getSelectIntegrationFilter().should('exist')
    getSelectStatusFilter().should('exist')
    getCreateATriggerButton().should('exist')
    universal.getTableHeader().should('contain', triggersTableText())
    universal.getRowsInATableBody().should('have.length', 1)
    universal
      .getRowByText('Trigger1')
      .should('exist')
      .within(() => {
        cy.contains(`${user.firstName} ${user.lastName}`)
        cy.contains('Nothing')
        cy.contains(todaysDate)
        cy.contains(/^0$/)
      })
    universal.getPagesPaginationButton().should('contain', '1')
    //creates a second trigger and tests sending an item option
    getCreateATriggerButton().click()
    cy.url().should('contain', '/edit')
    cy.findByLabelText('Name').type('Trigger2')
    cy.contains('[role="group"]', 'Integration').find('input').eq(0).click()
    cy.findByText('Zapier').click()
    cy.contains('[role="group"]', 'Trigger Action').find('input').eq(0).click()
    cy.findByText('Send an Item').click()
    cy.contains('Choose Item').should('exist')
    cy.wait(600)
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Select this Item')) {
        cy.contains('a', 'Def Leppard T-Shirt').click({ force: true })
      }
    })
    sendItem.getSubjectLineInput().should('exist')
    sendItem.getGiftEmailMessageInput().fill(giftEmailMessage)
    sendItem.getLandingPageHeaderInput().should('exist')
    sendItem.getLandingPageBodySection().should('exist')
    sendItem.getLandingPageFormFieldsSection().should('exist')
    sendItem.getSendAsSelect().should('exist')
    sendItem.getSpendAsCard().should('exist')
    sendItem.getReviewButton().click()
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('Def Leppard T-Shirt').should('exist')
    cy.contains('Def Leppard T-Shirt')
    cy.contains('XS')
    cy.contains('Gift Email')
    cy.contains(giftEmailMessage)
    cy.wait(800)
    cy.contains('button', 'Update Trigger').click()
    // cy.contains('section', 'Confirm Send').within(() => {
    //   cy.contains('button', 'Update Trigger').click({ force: true })
    // })
    getCreateTriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')
    universal.getRowsInATableBody().should('have.length', 2)
    universal
      .getRowByText('Trigger2')
      .should('exist')
      .within(() => {
        cy.contains(`${user.firstName} ${user.lastName}`)
        cy.contains('Send Postal')
        cy.contains(todaysDate)
        cy.contains(/^0$/)
      })
    //tests creating a trigger with the zapier - start a subscrition
    getCreateATriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')
    universal.getCloseButtonByLabelText().should('be.visible')
    cy.findByLabelText('Name').type('Trigger3')
    cy.contains('[role="group"]', 'Integration').find('input').eq(0).click()
    cy.findByText('Zapier').click()
    cy.contains('[role="group"]', 'Trigger Action').find('input').eq(0).click()
    cy.findByText('Start a Subscription').click()
    getSendPostalCard().should('not.exist')
    cy.contains('button', 'Create a Subscription').click({ force: true })
    cy.url().should('contain', 'subscriptions')
    cy.subscriptionsSeed({
      approvedPostalId: approvedPostalId,
      variantId: approvedVariantId,
      numberOfSubscriptions: 1,
    })
    cy.wait(300)
    cy.visit('/triggers')
    universal.getSpinner().should('not.exist')
    cy.wait(10000)
    getCreateATriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')
    cy.findByLabelText('Name').type('Trigger3')
    cy.contains('[role="group"]', 'Integration').find('input').eq(0).click()
    cy.findByText('Zapier').click()
    cy.contains('[role="group"]', 'Trigger Action').find('input').eq(0).click()
    cy.findByText('Start a Subscription').click()
    getSendPostalCard().should('not.exist')
    subscriptions
      .getPlaybookByName('Subscription One')
      .within(() => {
        subscriptions.getItemsInfo().should('contain', '1')
        subscriptions.getCostInfo().should('contain', '$4.50')
        subscriptions.getDurationInfo().should('contain', '0')
        cy.contains('div', 'Step 1').should('contain', 'Def Leppard T-Shirt')
      })
      .trigger('mouseover', { force: true })
    cy.findByTestId('subscription-name')
      .should('contain', 'Subscription One')
      .siblings('button')
      .should('have.text', 'Select Subscription')
      .click({ force: true })
    cy.contains('Subscription One')
    cy.contains('a', 'Remove Subscription').should('exist')
    getCreateTriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')

    universal.getRowsInATableBody().should('have.length', 3)
    universal
      .getRowByText('Trigger3')
      .should('exist')
      .within(() => {
        cy.contains(`${user.firstName} ${user.lastName}`)
        cy.contains('Start Subscription')
        cy.contains(todaysDate)
        cy.contains(/^0$/)
      })
    //tests creating a trigger with the zapier - stop a subscrition
    getCreateATriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')
    cy.findByLabelText('Name').type('Trigger4')
    cy.contains('[role="group"]', 'Integration').find('input').eq(0).click()
    cy.findByText('Zapier').click()
    cy.contains('[role="group"]', 'Trigger Action').find('input').eq(0).click()
    cy.findByText('Stop a Subscription').click()
    subscriptions
      .getPlaybookByName('Subscription One')
      .within(() => {
        subscriptions.getItemsInfo().should('contain', '1')
        subscriptions.getCostInfo().should('contain', '$4.50')
        subscriptions.getDurationInfo().should('contain', '0')
        cy.contains('div', 'Step 1').should('contain', 'Def Leppard T-Shirt')
      })
      .trigger('mouseover', { force: true })
    cy.findByTestId('subscription-name')
      .should('contain', 'Subscription One')
      .siblings('button')
      .should('have.text', 'Select Subscription')
      .click({ force: true })
    cy.contains('Subscription One')
    cy.contains('a', 'Choose Another Subscription').should('exist')
    getCreateTriggerButton().click({ force: true })
    cy.url().should('contain', '/edit')

    universal.getRowsInATableBody().should('have.length', 4)
    universal
      .getRowByText('Trigger4')
      .should('exist')
      .within(() => {
        cy.contains(`${user.firstName} ${user.lastName}`)
        cy.contains('Stop Subscription')
        cy.contains(todaysDate)
        cy.contains(/^0$/)
      })
    //tests the filtering options for the triggers table
    getSearchTriggersByNameFilter().type('Trigger3')
    universal.getRowsInATableBody().should('have.length', 1)
    getSearchTriggersByNameFilter().clear().type(user.firstName)
    universal.getNoItemsMessage().should('exist')
    getSearchTriggersByNameFilter().clear()
    universal.getRowsInATableBody().should('have.length', 4)
    cy.findByLabelText('Filter').click()
    cy.wait(300)
    cy.contains('section', 'Filter').within(() => {
      cy.contains('[role="group"]', 'Integration').find('input').eq(0).click()
      cy.contains('div', 'Zapier').click()
      cy.contains('[role="group"]', 'Status').find('input').eq(0).click()
      cy.contains('Active').should('exist')
      cy.contains('div', 'Disabled').click()
    })
    universal.progressBarZero()
    universal.getNoItemsMessage().should('exist')
    cy.contains('section', 'Filter').within(() => {
      cy.contains('[role="group"]', 'Status').find('input').eq(0).click()
      cy.contains('div', 'Active').click()
    })
    universal.getRowsInATableBody().should('have.length', 4)
    universal.getLinkByText('Trigger1').click({ force: true })
    //tests a new triggers profile page (nothing)
    getTriggerDetailsCard().within(() => {
      getEnabledInfo().within(() => {
        cy.findAllByRole('checkbox').should('be.checked')
      })
      getOwnerInfo().should('contain', `${user.firstName} ${user.lastName}`)
      getActionInfo().should('contain', `Nothing`)
      getCreatedInfo().should('contain', todaysDate)
    })
    getActivityCard().within(() => {
      getSearchContactsFilter().should('exist')
      cy.findByLabelText('Filter').click()
      cy.wait(200)
      getSearchDateFilter().should('exist')
      cy.contains('div', 'Status').should('exist')
      universal.getTableHeader().should('contain', 'ContactContact OwnerInitiatedResult')
      universal.getNoItemsMessage().should('exist')
      universal.getPagesPaginationButton().should('contain', '1')
    })
    getSendPostalCard().should('not.exist')
    getStartSubscriptionCard().should('not.exist')
    getStopSubscriptionCard().should('not.exist')
    cy.findAllByTestId('SecondaryNavbar_actionMenu').eq(0).trigger('click', { force: true })
    getEditTriggerMenuItem().should('exist')
    getDeleteTriggerMenuItem().should('exist')
    //tests the trigger's profile page of the other types
    universal.getBackToButton('triggers').eq(0).click({ force: true })
    universal.getLinkByText('Trigger2').click({ force: true })
    getTriggerDetailsCard().within(() => {
      getActionInfo().should('contain', `Send Postal`)
    })
    getActivityCard().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    getStartSubscriptionCard().should('not.exist')
    getStopSubscriptionCard().should('not.exist')
    cy.contains('[data-testid="ui-card"]', 'Action').within(() => {
      cy.findByText('Send Postal').should('exist')
    })
    cy.contains('div', giftEmailMessage).should('exist')
    visitTriggers()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(300)
      }
    })
    universal.getLinkByText('Trigger3').click({ force: true })
    getTriggerDetailsCard().within(() => {
      getActionInfo().should('contain', `Start Subscription`)
    })
    getActivityCard().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    getSendPostalCard().should('not.exist')
    getStopSubscriptionCard().should('not.exist')
    cy.contains('div', 'Remove Subscription').within(() => {
      cy.findByText(`Choose Another Subscription`).should('exist')
    })
    visitTriggers()
    universal.getLinkByText('Trigger4').click({ force: true })
    getTriggerDetailsCard().within(() => {
      getActionInfo().should('contain', `Stop Subscription`)
    })
    getActivityCard().within(() => {
      universal.getNoItemsMessage().should('exist')
    })
    getSendPostalCard().should('not.exist')
    getStartSubscriptionCard().should('not.exist')
    cy.contains('div', 'Remove Subscription').within(() => {
      cy.findByText(`Choose Another Subscription`).should('exist')
    })
    //tests deleting a trigger
    cy.findAllByTestId('SecondaryNavbar_actionMenu').eq(0).trigger('click', { force: true })
    getDeleteTriggerMenuItem().click()
    cy.contains('section', 'Delete Trigger').within(() => {
      cy.contains('Are you sure you want to Delete this Trigger?').should('exist')
      universal.getCancelButton().should('exist')
      universal.getDeleteButton().click()
    })
    cy.contains('section', 'Delete Trigger').should('not.exist')
    universal.getLinkByText('Trigger4').should('not.exist')
    //tests editing a trigger
    universal.getLinkByText('Trigger3').click()
    cy.findAllByTestId('SecondaryNavbar_actionMenu').eq(0).trigger('click', { force: true })
    getEditTriggerMenuItem().click()
    cy.contains('Edit Trigger').should('exist')
    cy.findByLabelText('Name').clear()
    cy.findByLabelText('Name').type('TriggerThree')
    cy.findByRole('button', { name: 'Update Trigger' }).click()
    cy.contains('TriggerThree').should('exist')
    cy.findAllByTestId('SecondaryNavbar_actionMenu').eq(0).trigger('click', { force: true })
    getEditTriggerMenuItem().click()
    cy.contains('Edit Trigger').should('exist')
    cy.findByLabelText('Name').should('have.value', 'TriggerThree')
    universal.getCancelButton().click()

    //tests disabling a trigger
    getEnabledInfo().within(() => {
      cy.findAllByRole('checkbox').should('be.checked').uncheck({ force: true })
      cy.contains('Disabled').should('exist')
    })
    //tests the status filter
    visitTriggers()
    universal.getRowsInATableBody().should('have.length', 3)
    cy.findByLabelText('Filter').click()
    cy.wait(500)
    cy.contains('section', 'Filter').within(() => {
      cy.contains('[role="group"]', 'Status').find('input').eq(0).click()
      cy.contains('div', 'Disabled').click()
    })
    universal.progressBarZero()
    universal.getRowsInATableBody().should('have.length', 1)
    universal.getRowByText('TriggerThree').should('exist')
    cy.contains('section', 'Filter').within(() => {
      cy.contains('[role="group"]', 'Status').find('input').eq(0).click()
      cy.contains('div', 'Active').click()
    })
    universal.getRowsInATableBody().should('have.length', 2)
    universal.getRowByText('Trigger2').should('exist')
    universal.getRowByText('Trigger1').should('exist')
  })
})

const visitTriggers = () => {
  return cy.visit('/triggers')
}

const getEmptyTriggersInfo = () => {
  return cy.contains('div', 'Automate')
}

const triggersTableText = () => {
  return 'NameOwnerSystemEnabledActionCreatedHit Count'
}

const getCreateATriggerButton = () => {
  return cy.contains('button', 'Create a Trigger')
}

// const getCreateATriggerMenuItem = () => {
//   return cy.findByRole('menuitem', { name: 'Create a Trigger' })
// }

const getCreateTriggerButton = () => {
  return cy.findByTestId('create-edit-trigger')
  //return cy.contains('button', 'Create Trigger')
}

const getSearchTriggersByNameFilter = () => {
  return cy.findByPlaceholderText('Search Triggers')
}

const getSelectIntegrationFilter = () => {
  return cy.get('[name="systemName"]')
}

const getSelectStatusFilter = () => {
  return cy.get('[name="status"]')
}

// const getSelectItemButton = () => {
//   return cy.findByRole('button', { name: 'Select Item' })
// }

const getSendPostalCard = () => {
  return cy.contains('div', 'Send Postal')
}

const getStartSubscriptionCard = () => {
  return cy.contains('div', 'Start Subscription')
}

const getStopSubscriptionCard = () => {
  return cy.contains('div', 'Stop Subscription')
}

const getTriggerDetailsCard = () => {
  return cy.contains('[data-testid="ui-card"]', 'Trigger Details')
}

const getEnabledInfo = () => {
  return cy.findByTestId('TriggerStatusToggle')
  // return cy.contains('div', 'Enabled')
}

const getOwnerInfo = () => {
  return cy.contains('div', 'Owner')
}

const getActionInfo = () => {
  return cy.contains('div', 'Action')
}

const getCreatedInfo = () => {
  return cy.contains('div', 'Created')
}

const getActivityCard = () => {
  return cy.contains('[data-testid="ui-card"]', 'Activity')
}

const getSearchContactsFilter = () => {
  return cy.findByPlaceholderText('Search Contacts')
}

const getSearchDateFilter = () => {
  return cy.findAllByPlaceholderText('Search Date')
}

const getEditTriggerMenuItem = () => {
  return cy.findByRole('menuitem', { name: 'Edit Trigger' })
}

const getDeleteTriggerMenuItem = () => {
  return cy.findByRole('menuitem', { name: 'Delete Trigger' })
}
