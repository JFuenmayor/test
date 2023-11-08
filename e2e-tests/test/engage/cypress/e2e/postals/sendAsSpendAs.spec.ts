import { faker } from '@faker-js/faker'
import {
  AddFundsV2Document,
  BillingAccountsDocument,
  BudgetDuration,
  BudgetMode,
  ConfirmTransferIntentDocument,
  CreateBillingAccountDocument,
  CreateTeamDocument,
  CreateTransferIntentDocument,
  Currency,
  InviteDocument,
  PaymentPartnerType,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Marketplace,
  Navbar,
  Reporting,
  SendItem,
  Universal,
  Users,
} from '../../support/pageObjects'

const user = userFactory()
const user2 = userFactory()

describe('Send As / Spend As Testing', function () {
  let teamId: string
  let billingAccountId1: string
  let billingAccountId2: string
  const truncatedCompany = user.company.slice(0, 19)

  const marketplace = new Marketplace()
  const navbar = new Navbar()
  const reporting = new Reporting()
  const sendItem = new SendItem()
  const universal = new Universal()
  const users = new Users()

  beforeEach(() => {
    cy.signup(user)
    cy.createApprovedPostal({ name: 'Chipotle' })
    cy.createAContact({
      lastName: 'Court',
      firstName: 'Brad',
    })
    cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then(
      (res) => {
        billingAccountId1 = res.billingAccounts?.[0]?.id ?? ''
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 30000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
        cy.graphqlRequest(CreateTeamDocument, {
          data: {
            name: 'secondTeam',
            department: 'Other',
            settings: {
              billingAccountIds: [
                { billingAccountId: res.billingAccounts?.[0]?.id ?? '', currency: Currency.Usd },
              ],
              budget: { duration: BudgetDuration.Monthly, amount: 200, mode: BudgetMode.Pooled },
            },
          },
        }).then((team) => {
          teamId = team.createTeam.id
        })
      }
    )
    cy.graphqlRequest(CreateBillingAccountDocument, {
      data: {
        country: 'USA',
        currency: Currency.Usd,
        email: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        name: 'Network',
        state: 'CA',
      },
    }).then((res) => {
      billingAccountId2 = res.createBillingAccount.id
    })
    //cy.login(user)
    cy.filterLocalStorage('postal:items:tab')
    cy.filterLocalStorage('postal:items:approved:filter')
    cy.filterLocalStorage('postal:items:marketplace:filter')
    cy.intercept('/engage/api/graphql', (req) => {
      if (req.body.operationName === 'orderPostal') {
        req.alias = 'orderPostal'
      }
    })
  })

  it('tests the send as and spend as options in postal send workflow', () => {
    //tests that send as myself does not show the send as info in the review page
    marketplace.visitMyItems()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('could not load')) {
        cy.wait(3100)
        cy.reload()
        cy.wait(600)
      } else if ($body.text().includes('unexpected error')) {
        cy.wait(3100)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.url().should('contain', '/items/postals')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Chipotle')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('a', 'Chipotle').as('chipotleLink')
    cy.get('@chipotleLink').should('be.visible')
    cy.get('@chipotleLink').click()
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    universal.getNoItemsMessage().should('not.exist')
    cy.clickCheckbox({ name: 'Brad' })
    sendItem.getConfigureYourItemButton().click()
    //tests default landing page header
    cy.contains(user.firstName).should('exist')
    cy.contains(user.company).should('exist')
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    //tests the send as select options
    sendItem
      .getSendAsSelect()
      .should('have.value', 'Self')
      .find('option')
      .then((options: any) => {
        const actual = [...options].map((option) => option.value)
        expect(actual).to.deep.eq(['Self', 'ContactOwner', 'User'])
      })
    //tests the Send As tooltip
    cy.wait(800)
    sendItem.getSendAsTooltip().realHover()
    sendItem.getSendAsTooltipText().should('be.visible')
    sendItem.getReviewButton().click()
    sendItem.getSendAsInfo().should('not.exist')
    cy.wait(500)
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    cy.wait('@orderPostal').its('response.body.data.orderPostal.sendAs').should('eq', null)

    //creates a new user with a new contact and then signs in as that user
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: [user2.userName],
        roles: ['USER', 'ADMIN', 'MANAGER'],
      },
    }).then((res) => {
      const invite = res.invite?.[0]
      cy.completeInvitation({ id: invite?.invite?.id ?? '', ...user2 })
      cy.login(user2)
      cy.visit('/')
      cy.wait(500)
      cy.createAContact({
        tags1: 'grounded',
        tags2: 'timeshare',
        country: 'United States',
        postalCode: '93405',
        state: 'California',
        city: 'San Luis Obispo',
        address1: '535 Hill Street',
        phoneNumber: '780-432-6754',
        phoneType: 'WORK',
        emailAddress: `${faker.string.uuid()}@postal.dev`,
        title: faker.person.jobTitle(),
        lastName: 'Craig',
        firstName: 'Jane',
      })
      cy.graphqlRequest(BillingAccountsDocument, {
        filter: { type: { eq: 'FUNDS' }, name: { eq: 'Network Fund Management' } },
      }).then((res) => {
        cy.graphqlRequest(AddFundsV2Document, {
          input: {
            billingAccountId: res.billingAccounts?.[0]?.id ?? '',
            amount: 30000,
            partnerPaymentMethodId:
              res.billingAccounts?.[0].paymentPartners?.[0].paymentMethods?.[0].partnerId,
            paymentPartnerType: PaymentPartnerType.Mock,
          },
        })
      })
    })
    //tests that send as a specific user shows the correct send as info in the review page
    //uses the previous user rather the currently logged in user
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    cy.wait(500)
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click()
    cy.url().should('contain', '/items/postals/')
    cy.wait(500)
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    cy.clickCheckbox({ name: 'Jane' })
    sendItem.getConfigureYourItemButton().click()
    cy.contains(user2.firstName).should('exist')
    cy.contains(user.company).should('exist')
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    sendItem.getSendAsCard().scrollIntoView()
    sendItem.getSendAsCard().within(() => {
      sendItem.getSendAsSelect().select('User')
      //search by first name
      cy.findAllByRole('combobox').eq(1).type(user.firstName)
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('not.exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      //search by last name
      cy.findAllByRole('combobox').eq(1).clear()
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      cy.findAllByRole('combobox').eq(1).type(user.lastName)
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('not.exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      //search by email
      cy.findAllByRole('combobox').eq(1).clear()
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      cy.selectAutoCompleteUser(`${user.userName}`)
    })
    sendItem.getReviewButton().click()
    sendItem.getSendAsInfo().should('contain', `${user.firstName} ${user.lastName}`)
    cy.wait(800)
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendModal().within(() => {
      sendItem.getSendButton().click({ force: true })
    })
    cy.wait('@orderPostal')
      .its('response.body.data.orderPostal.sendAs.fullName')
      .should('eq', `${user.firstName} ${user.lastName}`)

    //tests that when send as the specific user is selected but the su is the same as the currently logged in user
    //the orderPostal response will show sendAs as null
    cy.visit('/')
    cy.wait(500)
    navbar.getMarketplaceLink().should('be.visible')
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    marketplace.getApprovedItemsCheckbox()
    marketplace.getApprovedItemsCheckbox().check({ force: true })
    cy.url().should('contain', '/items/postals')
    cy.wait(500)
    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click()
    cy.url().should('contain', '/items/postals/')
    cy.wait(500)
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    cy.clickCheckbox({ name: 'Jane' })
    sendItem.getConfigureYourItemButton().click()
    cy.contains(user2.firstName).should('exist')
    cy.contains(user.company).should('exist')
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    sendItem.getSendAsSelect().select('User')
    cy.selectAutoCompleteUser(`${user2.userName}`)
    sendItem.getReviewButton().click()
    sendItem.getSendAsInfo().should('contain', `${user2.firstName} ${user2.lastName}`)
    cy.wait(1500)
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendDuplicateModal().within(() => {
      sendItem.getSendNAgainButton().click()
    })
    cy.wait('@orderPostal').its('response.body.data.orderPostal.sendAs').should('eq', null)

    //tests that send as the contact owner shows the correct send as info in the review page
    //uses the contact made by the previous user rather than the contact made by the currently logged in user
    // marketplace.visitMyItems()
    // universal.waitForSpinner()
    // cy.wait(300)
    // marketplace.viewItemByName('Chipotle')
    // marketplace.getSendButton().click()
    // sendItem.getPersonalizedEmailButton().click()
    // universal.waitForProgressBar()
    // cy.clickCheckbox({ name: 'Brad' })
    // sendItem.getConfigureYourItemButton().click()
    // cy.wait(300)
    // sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    // sendItem.getSendAsSelect().select('ContactOwner')
    // sendItem.getReviewButton().click()
    // sendItem.getSendAsInfo().should('contain', `Contact Owner`).scrollIntoView().and('be.visible')
    // cy.wait(500)
    // sendItem.getSaveAndSendButton().click()
    // sendItem.getConfirmSendDuplicateModal().within(() => {
    //   sendItem.getSendNAgainButton().click()
    // })
    // cy.get('@orderPostal').then(() => {
    //   cy.wait('@orderPostal')
    //     .its('response.body.data.orderPostal.sendAs.fullName')
    //     .should('eq', `${user.firstName} ${user.lastName}`)
    // })

    //tests that when send as the contact owner is selected but the co is the same as the currently logged in user
    //the orderPostal response will show sendAs as null
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    cy.wait(400)
    cy.get('body').then(($body) => {
      if ($body.text().includes('unexpected error')) {
        cy.reload()
      }
    })
    cy.contains('a', 'Chipotle').should('be.visible').click()
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    cy.clickCheckbox({ name: 'Jane' })
    sendItem.getConfigureYourItemButton().click()
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    sendItem.getSendAsSelect().select('ContactOwner')
    sendItem.getReviewButton().click()
    sendItem.getSendAsInfo().should('contain', `Contact Owner`).scrollIntoView().and('be.visible')
    cy.wait(1000)
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendDuplicateModal().within(() => {
      sendItem.getSendNAgainButton().click()
    })
    cy.wait('@orderPostal').its('response.body.data.orderPostal.sendAs').should('eq', null)

    //tests the spendAs option
    //invites user2 to a new team with a different budget
    cy.graphqlRequest(InviteDocument, {
      data: {
        emailAddresses: [user2.userName],
        roles: ['USER', 'MANAGER'],
        teamId: teamId,
      },
    }).then((res) => {
      cy.completeInvitation({ id: res.invite?.[0]?.invite?.id ?? '', ...user2 }, true)
      cy.login(user2)
    })
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('a', 'Chipotle').should('be.visible')
    cy.contains('a', 'Chipotle').click()
    cy.url().should('contain', '/items/postals/')

    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    cy.clickCheckbox({ name: 'Jane' })
    sendItem.getConfigureYourItemButton().click()
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    sendItem.getSpendAsCard().within(() => {
      //search by first name
      cy.wait(500)
      cy.findAllByRole('combobox').type(user.firstName, { force: true })
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('not.exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      //search by last name
      cy.findAllByRole('combobox').clear()
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      cy.findAllByRole('combobox').type(user.lastName)
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('not.exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      //search by email
      cy.findAllByRole('combobox').clear()
      cy.contains(`${user2.firstName} ${user2.lastName}`).should('exist')
      cy.contains(`${user.firstName} ${user.lastName}`).should('exist')
      cy.findAllByRole('combobox').type(`${user.userName}`)
      cy.get('.UiSelectTypeahead__menu-list').within(() => {
        cy.contains(`${user.userName}`).should('exist').first().click({ force: true })
      })
      sendItem.getTeamButton().click({ force: true })
      cy.contains(`secondTeam`).should('not.exist')
      cy.contains('[role="menuitem"]', truncatedCompany)
        .should('contain', `BudgetDisabledBalance`)
        .click({ force: true })
      //tests the Spend As tooltip
      sendItem.getSpendAsTooltip().realHover()
    })
    sendItem.getSpendAsTooltipText().should('be.visible')
    sendItem.getReviewButton().click()
    cy.wait(1200)
    cy.contains('Spend As').should('exist').should('contain', truncatedCompany)
    sendItem.getSaveAndSendButton().click()
    sendItem.getConfirmSendDuplicateModal().within(() => {
      sendItem.getSendNAgainButton().click()
    })
    //null because it is the default team
    cy.wait('@orderPostal').its('response.body.data.orderPostal.spendAs.teamId').should('eq', null)
    //tests using spend as with a team with insufficient funds in the budget (v2)
    // universal.getRetryOrderAgainButton().click()
    // sendItem.getGiftEmailMessageInput().fill(`333${faker.lorem.paragraph(1)}`)
    // sendItem.getSpendAsCard().within(() => {
    //   sendItem.getTeamButton().click({ force: true })
    //   cy.contains('[role="menuitem"]', truncatedCompany).should('contain', `BudgetDisabledBalance$300.00`)
    //   cy.contains('[role="menuitem"]', 'secondTeam')
    //     .should('contain', `Budget$2.00Balance$300.00`)
    //     .click({ force: true })
    // })
    // sendItem.getReviewButton().click()
    // cy.wait(800)
    // cy.contains('Spend As').should('exist').should('contain', 'secondTeam')
    // sendItem.getSaveAndSendButton().click()
    // sendItem.getConfirmSendDuplicateModal().within(() => {
    //   sendItem.getSendNAgainButton().click()
    // })
    // cy.wait('@orderPostal').its('response.body.data.orderPostal.spendAs.teamId').should('eq', teamId)
    cy.wait(4000)
    //should zero out the balance
    cy.graphqlRequest(BillingAccountsDocument, {
      filter: { type: { eq: 'FUNDS' }, name: { contains: user.company } },
    }).then((res) => {
      cy.graphqlRequest(CreateTransferIntentDocument, {
        input: {
          /* @ts-ignore */
          amount: res.billingAccounts?.[0]?.balance,
          comment: 'fgjkdf',
          fromBillingAccountId: billingAccountId1,
          toBillingAccountId: billingAccountId2,
        },
      }).then((resp) => {
        cy.graphqlRequest(ConfirmTransferIntentDocument, {
          id: resp.createTransferIntent.id,
        })
      })
    })
    //tests using spend as with teams that have Insufficient balances
    universal.getRetryOrderAgainButton().click()
    cy.wait(800)
    sendItem.getGiftEmailMessageInput().fill(`1111${faker.lorem.paragraph(1)}`)
    sendItem.getSpendAsCard().within(() => {
      sendItem.getTeamButton().click({ force: true })
      cy.contains('[role="menuitem"]', 'secondTeam').should(
        'have.text',
        `secondTeamBudget$2.00Balance$0.00`
      )
      cy.contains('[role="menuitem"]', truncatedCompany)
        .should('contain', `BudgetDisabledBalance$0.00`)
        .click({ force: true })
    })
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('Insufficient Balance! Choose a way forward:').should('exist')
    //switches the user with an admin role to the team in which they do not have an admin role
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')

    universal.getSpinner().should('not.exist')
    navbar.getProfileMenuButton().click({ force: true })
    universal.getAllMenuItems().should('have.length', 4)
    navbar.getSwitchAccountMenuItem().trigger('click', { force: true })
    users.getSwitchAccountModal().within(() => {
      users.getAccountTeamLink(`secondTeam`).should('exist').click({ force: true })
    })
    universal.getSpinner().should('not.exist')
    navbar.getProfileData('secondTeam').should('exist')
    //tests that the spend as user dropdown does not show without the admin role
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')

    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getUISpinner().should('not.exist')
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Chipotle')) {
        cy.wait(3100)
        cy.reload()
      }
    })
    cy.contains('a', 'Chipotle').should('be.visible').click()
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.waitForProgressBar()
    cy.clickCheckbox({ name: 'Jane' })
    sendItem.getConfigureYourItemButton().click()
    sendItem.getGiftEmailMessageInput().fill(faker.lorem.paragraph(1))
    sendItem.getSpendFromCard().within(() => {
      //only one dropdown should exist since user select should be visible default should be the team the user is currently in
      cy.findAllByRole('button')
        .should('have.length', 1)
        .and('have.text', `secondTeam$2.00`)
        .click()
      //user is not an admin on this team so balance won't show
      cy.findByRole('menuitem', { name: `secondTeam Budget $2.00` }).should('exist')
      //user is a admin on this team so the balance would show
      cy.contains('[role="menuitem"]', truncatedCompany)
        .should('contain', `BudgetDisabledBalance$0.00`)
        .click({ force: true })
    })
    sendItem.getReviewButton().click()
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('Spend As').should('exist').should('contain', truncatedCompany)
    //tests that since the balance is zero the the warning should show
    cy.contains('Insufficient Balance! Choose a way forward:').should('exist')
    sendItem.getAddFundsToConfirmSendButton().click()
    cy.contains('Please contact your administrator to add funds.').should('exist')
    //tests using spend as with a team with insufficient funds
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')

    cy.contains('a', 'Chipotle').should('be.visible').click()
    marketplace.getSendButton().click({ force: true })
    sendItem.getPersonalizedEmailButton().click()
    universal.progressBarZero()
    cy.clickCheckbox({ name: 'Jane' })
    sendItem.getConfigureYourItemButton().click()
    cy.wait(800)
    sendItem.getGiftEmailMessageInput().fill(`${faker.lorem.paragraph(1)}`)
    sendItem.getSpendFromCard().within(() => {
      cy.findAllByRole('button')
        .should('have.length', 1)
        .and('have.text', `secondTeam$2.00`)
        .click()
      cy.contains('[role="menuitem"]', truncatedCompany)
        .should('contain', `BudgetDisabledBalance$0.00`)
        .should('exist')
      cy.findByRole('menuitem', { name: `secondTeam Budget $2.00` }).click({ force: true })
    })
    sendItem.getReviewButton().click()
    cy.contains('Spend As').should('exist').should('contain', 'secondTeam')
    cy.contains('Insufficient Budget! Choose a way forward:').should('exist')
    sendItem.getAddFundsToConfirmSendButton().click()
    cy.contains('Please contact your administrator to add funds.').should('exist')
    //tests sent-as and spend as in the view order modal
    marketplace.visitMyItems()
    cy.url().should('contain', '/items/postals')

    universal.getSpinner().should('not.exist')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    navbar.getProfileMenuButton().click({ force: true })
    navbar.getSwitchAccountMenuItem().trigger('click', { force: true })
    users.getSwitchAccountModal().within(() => {
      users.getAccountTeamLink(user.company).should('exist').click({ force: true })
    })
    universal.getSpinner().should('not.exist')
    navbar.getProfileData('secondTeam').should('not.exist')
    reporting.visitOrderReports()

    universal.getSpinner().should('not.exist')
    universal.getNoItemsMessage().should('not.exist')
    universal.getRowsInATableBody().should('have.length', 5)
    //spent as testing
    universal.getRowByNumber(0).within(() => {
      universal.getLinkByText('Jane Craig').should('exist')
      universal.getLinkByText(`${user2.firstName} ${user2.lastName}`).should('exist')
      universal.getLinkByText(`${user.firstName} ${user.lastName}`).should('not.exist')
      universal.getLinkByText('Chipotle').click({ force: true })
    })
    universal.getViewOrderModal().within(() => {
      universal.getSpinner().should('not.exist')
      cy.contains('div', 'Owner:').should('contain', `${user2.firstName} ${user2.lastName}`)
      cy.contains('div', 'Spent As:').should(
        'contain',
        `${user.firstName} ${user.lastName}from${user.company}`
      )
      universal.getCloseButton().click({ force: true })
    })
    universal.getRowByNumber(1).within(() => {
      universal.getLinkByText('Jane Craig').should('exist')
      universal.getLinkByText(`${user2.firstName} ${user2.lastName}`).should('exist')
      universal.getLinkByText(`${user.firstName} ${user.lastName}`).should('not.exist')
      universal.getLinkByText('Chipotle').click({ force: true })
    })
    universal.getViewOrderModal().within(() => {
      universal.getSpinner().should('not.exist')
      cy.contains('div', 'Owner:').should('contain', `${user2.firstName} ${user2.lastName}`)
      cy.contains('div', 'Spent As:').should('not.exist')
      universal.getCloseButton().click({ force: true })
    })
    //sent as testing
    // universal.getRowByNumber(2).within(() => {
    //   universal.getLinkByText('Brad Court').should('exist')
    //   universal.getLinkByText(`${user2.firstName} ${user2.lastName}`).should('exist')
    //   universal.getLinkByText(`${user.firstName} ${user.lastName}`).should('exist')
    //   universal.getLinkByText('Chipotle').click({ force: true })
    // })
    // universal.getViewOrderModal().within(() => {
    //   universal.getSpinner().should('not.exist')
    //   cy.contains('div', 'Owner:').should('contain', `${user2.firstName} ${user2.lastName}`)
    //   cy.contains('div', 'Sent As:').should('contain', `${user.firstName} ${user.lastName}`)
    //   universal.getCloseButton().click({ force: true })
    // })

    universal.getRowByNumber(3).within(() => {
      universal.getLinkByText('Jane Craig').should('exist')
      universal.getLinkByText(`${user2.firstName} ${user2.lastName}`).should('exist')
      universal.getLinkByText(`${user.firstName} ${user.lastName}`).should('exist')
      universal.getLinkByText('Chipotle').click({ force: true })
    })
    universal.getViewOrderModal().within(() => {
      universal.getSpinner().should('not.exist')
      cy.contains('div', 'Owner:').should('contain', `${user2.firstName} ${user2.lastName}`)
      cy.contains('div', 'Sent As:').should('contain', `${user.firstName} ${user.lastName}`)
      universal.getCloseButton().click({ force: true })
    })
    universal.getRowByNumber(4).within(() => {
      universal.getLinkByText('Brad Court').should('exist')
      universal.getLinkByText(`${user.firstName} ${user.lastName}`).should('exist')
      universal.getLinkByText(`${user2.firstName} ${user2.lastName}`).should('not.exist')
      universal.getLinkByText('Chipotle').click({ force: true })
    })
    universal.getViewOrderModal().within(() => {
      universal.getSpinner().should('not.exist')
      cy.contains('div', 'Owner:').should('contain', `${user.firstName} ${user.lastName}`)
      cy.contains('div', 'Sent As:').should('not.exist')
    })
  })
})
