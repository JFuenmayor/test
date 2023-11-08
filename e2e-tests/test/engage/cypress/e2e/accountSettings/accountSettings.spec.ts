import { addDays, format } from 'date-fns'
import { userFactory } from '../../support/factories'
import { AccountInfo, Navbar, Universal } from '../../support/pageObjects'

describe('Account Settings test suite', () => {
  const user = userFactory()
  const accountInfo = new AccountInfo()
  const universal = new Universal()
  const navbar = new Navbar()

  const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
  const dateFormatYearFirst = (date: Date) => format(date, 'yyyy-MM-dd')

  const todaysDate = dateFormatYearFirst(new Date())
  const tomorrowsDate = dateFormatYearFirst(addDays(new Date(), 1))

  beforeEach(() => {
    cy.signup(user)
    cy.login(user)
  })

  it('displays initial account information', () => {
    accountInfo.visitAccountInfo()
    cy.url().should('include', '/account/info')
    universal.getSpinner().should('not.exist')
    accountInfo.getCompanyInfoHeading().should('be.visible')
    accountInfo.getAccountNameGroup().should('exist').contains(user.company)
    accountInfo
      .getDisplaytNameGroup()
      .should('exist')
      .within(() => {
        accountInfo.getNotSetText()
      })
    accountInfo
      .getCompanyAddressGroup()
      .should('exist')
      .within(() => {
        accountInfo.getNotSetText()
      })
    navbar.getProfileData(user.company.slice(0, 10)).should('exist')
    //tests that it has an accurately displayed sidebar
    accountInfo.visitAccountInfo()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    accountInfo.getAccountSettingsLink().should('exist').should('have.class', 'active')
    //tests that it has a drawer to edit company info
    accountInfo.getEditCompanyInfoButton().click({ force: true })
    //Drawer should be open and visible
    accountInfo.getEditCompanyInfoDrawer().within(() => {
      universal.getCancelButton().should('be.visible')
      accountInfo
        .getDisplayNameInput()
        .should('exist')
        .should('have.value', '')
        .fill('new display name')

      //fill in empty fields with updated company info
      cy.wait(400)
      cy.contains('[role="group"]', 'State').within(() => {
        cy.getAutoCompleteValue().scrollIntoView()
        cy.getAutoCompleteValue().should('not.be.not.be.empty')
      })
      cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
      accountInfo.getStreetAddress1Input().type('101 Royal Way')
      accountInfo.getStreetAddress2Input().fill('Apt 1')
      accountInfo.getCityInput().fill('San Diego')
      accountInfo.getPostalCodeInput().fill('93405')
      universal.getSaveButton().should('exist').click()
    })

    //Check to see if drawer was closed
    accountInfo.getEditCompanyInfoDrawer().should('not.exist')

    //Check to see if UI updated correctly.
    accountInfo.getDisplaytNameGroup().should('contain', 'new display name')
    accountInfo.getCompanyAddressGroup().within(() => {
      cy.findByText('101 Royal Way').should('exist')
      cy.findByText('Apt 1').should('exist')
      cy.contains(`San Diego`).should('exist')
      cy.contains(`93405`).should('exist')
    })
    //Checks to see if edited info made it into the edit drawer
    accountInfo.getEditCompanyInfoButton().click({ force: true })
    accountInfo.getEditCompanyInfoDrawer().within(() => {
      universal.getCancelButton().should('be.visible')
      accountInfo.getDisplayNameInput().should('have.value', 'new display name')
      accountInfo.getStreetAddress1Input().should('have.value', '101 Royal Way')
      accountInfo.getStreetAddress2Input().should('have.value', 'Apt 1')
      accountInfo.getCityInput().should('have.value', 'San Diego')
      cy.contains('[role="group"]', 'State').scrollIntoView()
      cy.contains('[role="group"]', 'State').within(() => {
        cy.contains(
          RegExp(
            'Texas' +
              '|' +
              'California' +
              '|' +
              'Virginia' +
              '|' +
              'Iowa' +
              '|' +
              'Washington State' +
              '|' +
              'Ohio' +
              '|' +
              'Arizona'
          )
        ).should('exist')
        cy.get('input').clear()
        cy.get('input').type('California')
      })
      accountInfo.getPostalCodeInput().should('have.value', '93405')
      cy.getAutoCompleteValue('AutoCompleteCountry').should('contain', 'United States')
      universal.getCancelButton().should('exist').click()
    })
    //tests that it can toggle user visibility
    accountInfo.visitAccountInfo()
    accountInfo.getCompanyInfoHeading().should('be.visible')
    accountInfo
      .getUserProductVisibilityCard()
      .should('be.visible')
      .within(() => {
        // item email notifications
        // starts at all, select user
        accountInfo
          .getItemEmailNotficationsButton()
          .should('be.visible')
          .and('not.be.disabled')
          .contains('All Admins')
          .click({ force: true })
      })
    accountInfo.getItemEmailNotificationsContent().within(() => {
      cy.findByText('All Admins').should('exist')
      accountInfo.getEmailNotificationCheckbox(user).click({ force: true })
      cy.findByText('All Admins', { timeout: 68000 }).should('not.exist')
    })
    accountInfo.getUserProductVisibilityCard().within(() => {
      // user selected, deselect via tag
      accountInfo
        .getItemEmailNotficationsButton()
        .should('be.visible')
        .and('not.be.disabled')
        .contains('(1) Admin')
    })
    accountInfo.getItemEmailNotificationsContent().within(() => {
      accountInfo.getEmailNotificationSelectedTag(user).click({ force: true })
      cy.contains('li', `${user.firstName} ${user.lastName}`).should('not.exist')
      cy.contains('label', `${user.firstName} ${user.lastName}`).should('not.be.checked')
      cy.findByText('All Admins').should('exist')
    })
    accountInfo.getUserProductVisibilityCard().within(() => {
      // back to all, select user
      accountInfo
        .getItemEmailNotficationsButton()
        .should('be.visible')
        .and('not.be.disabled')
        .contains('All Admin')
    })
    accountInfo.getItemEmailNotificationsContent().within(() => {
      cy.findByText('All Admins').should('exist')
      accountInfo.getEmailNotificationCheckbox(user).click({ force: true })
    })
    accountInfo.getUserProductVisibilityCard().within(() => {
      accountInfo.getItemEmailNotficationsButton().click({ force: true })
    })
    cy.getAlert({ message: 'Setting Updated', close: 'close' })
    accountInfo.getUserProductVisibilityCard().within(() => {
      // user selected, clear with checkbox
      accountInfo
        .getItemEmailNotficationsButton()
        .should('be.visible')
        .and('not.be.disabled')
        .contains('(1) Admin')
        .click({ force: true })
    })
    accountInfo.getEmailNotificationClear().trigger('click', { force: true })
    accountInfo.getUserProductVisibilityCard().within(() => {
      // back to all
      accountInfo
        .getItemEmailNotficationsButton()
        .should('be.visible')
        .and('not.be.disabled')
        .contains('All Admins')

      //tests toggling Items
      accountInfo.getViewAllItemsCheckbox().should('be.checked').uncheck({ force: true })
      accountInfo.getViewAllItemsCheckbox().should('not.be.checked')
      accountInfo.getItemEmailNotficationsButton().should('not.exist')
      // tests selecting event email recipients
      // starts at all, select user
      accountInfo
        .getEventEmailNotficationsButton()
        .should('be.visible')
        .and('not.be.disabled')
        .contains('All Admins')
        .click({ force: true })
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Success!')) {
        cy.findByLabelText('Close', { timeout: 99000 }).click({
          force: true,
          multiple: true,
        })
      }
    })
    accountInfo.getEventEmailNotificationsContent().within(() => {
      cy.findByText('All Admins').should('exist')
      accountInfo.getEmailNotificationCheckbox(user).should('be.visible').check({ force: true })
      cy.findByText('All Admins').should('not.exist')
    })
    accountInfo.getUserProductVisibilityCard().within(() => {
      accountInfo
        .getEventEmailNotficationsButton()
        .should('be.visible')
        .and('not.be.disabled')
        .contains('(1) Admin')
    })
    accountInfo.getEventEmailNotificationsContent().within(() => {
      accountInfo.getEmailNotificationSelectedTag(user).click({ force: true })
      cy.contains('li', `${user.firstName} ${user.lastName}`).should('not.exist')
      cy.contains('label', `${user.firstName} ${user.lastName}`).should('not.be.checked')
      cy.findByText('All Admins').should('exist')
    })
    accountInfo.getUserProductVisibilityCard().within(() => {
      accountInfo.getEventEmailNotficationsButton().click({ force: true })

      //tests toggling Events
      accountInfo.getViewAllEventsCheckbox().should('be.checked').uncheck({ force: true })
      accountInfo.getViewAllEventsCheckbox().should('not.be.checked')
    })
    cy.getAlert({ message: 'Setting Updated', close: 'close' })
    accountInfo.getUserProductVisibilityCard().within(() => {
      accountInfo.getEventEmailNotficationsButton().should('not.exist')
    })
    cy.get('body').then(($body) => {
      if ($body.text().includes('Setting Updated')) {
        cy.getAlert({ message: 'Setting Updated', close: 'close' })
      }
    })
    accountInfo.getUserProductVisibilityCard().within(() => {
      // tests the tooltip
      accountInfo.getProductVisibilityTooltip().scrollIntoView()
      cy.wait(300)
      accountInfo
        .getProductVisibilityTooltip()
        .realHover({ position: 'center', scrollBehavior: 'bottom' })
    })
    accountInfo.getProductVisibilityTooltipText().should('exist')
    //tests support access
    accountInfo.getSupportAccessCard().within(() => {
      accountInfo.getSupportAccessEnabledText().should('exist')
      accountInfo.getEnableAccessForSelect().should('not.exist')
      accountInfo.getRevokeAccessImmediatelyButton().click({ force: true })
      accountInfo
        .getEnableAccessForSelect()
        .select('1 Hour')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['1', '3', '24', '168', ''])
        })
      accountInfo.getEnableSupportAccessButton().click()
      accountInfo.getAccessTimeRemainingText().should('exist')
      cy.contains('59').should('exist')
      accountInfo.getRevokeAccessImmediatelyButton().click({ force: true })
      accountInfo.getEnableAccessForSelect().select('3 Hours')
      accountInfo.getEnableSupportAccessButton().click()
    })
    cy.wait(600)
    cy.get('body').then(($body) => {
      if (!$body.text().includes(`Access time remaining`)) {
        cy.wait(600)
        cy.reload()
        cy.wait(600)
      }
    })
    accountInfo.getSupportAccessCard().within(() => {
      accountInfo.getAccessTimeRemainingText().should('exist')
      cy.contains('02').should('exist')
      accountInfo.getRevokeAccessImmediatelyButton().click({ force: true })
      accountInfo.getEnableAccessForSelect().select('1 Day')
      accountInfo.getEnableSupportAccessButton().click()
      accountInfo.getAccessTimeRemainingText().should('exist')
      cy.contains('23').should('exist')
      accountInfo.getRevokeAccessImmediatelyButton().click({ force: true })
      accountInfo.getEnableAccessForSelect().select('1 Week')
      accountInfo.getEnableSupportAccessButton().click()
      accountInfo.getAccessTimeRemainingText().should('exist')
      cy.contains('06').should('exist')
      accountInfo.getRevokeAccessImmediatelyButton().click({ force: true })
      accountInfo.getEnableAccessForSelect().select('Always Enabled')
      accountInfo.getEnableSupportAccessButton().click()
      accountInfo.getAccessTimeRemainingText().should('exist')
    })
    //tests the magicLinks settings card
    accountInfo.getMagicLinkSettingsCard().within(() => {
      accountInfo
        .getAutoApproveSelect()
        .select('2')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['0', '2', '5', '10'])
        })
    })

    // cy.getAlert({ message: 'Changes Saved' })

    //tests the Budget Timeline card's ui
    accountInfo.getBudgetTimelineCard().within(() => {
      accountInfo
        .getMethodSelect()
        .should('have.value', 'CALENDAR')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['CALENDAR', 'OFFSET_MONTHS', 'BLOCK_90_DAYS'])
        })
      accountInfo.getConfigurationNumberField().should('not.exist')
      universal.getSaveButton().should('not.exist')
      accountInfo.getMethodSelect().select('OFFSET_MONTHS')
      accountInfo.getConfigurationNumberField().should('exist').type('1')
      cy.intercept('/engage/api/graphql', (req) => {
        if (req.body.operationName === 'me') {
          req.alias = 'me'
        }
      })
      universal.getSaveButton().should('exist').click({ force: true })
      universal.getSaveButton().should('not.exist')
      cy.wait('@me')
      accountInfo.getMethodSelect().select('CALENDAR')
      accountInfo.getConfigurationNumberField().should('not.exist')
      cy.intercept('/engage/api/graphql', (req) => {
        if (req.body.operationName === 'me') {
          req.alias = 'me'
        }
      })
      universal.getSaveButton().should('exist').click({ force: true })
      cy.contains('button', 'Save').and('not.exist')
      cy.wait('@me')
      accountInfo.getMethodSelect().select('BLOCK_90_DAYS')
      accountInfo.getConfigurationDateInput().eq(0).should('exist').click({ force: true })
    })
    cy.findByLabelText(`${dateFormatInput(new Date())}`).click({ force: true })
    accountInfo.getBudgetTimelineCard().within(() => {
      accountInfo.getConfigurationDateInput().then(($name: any) => {
        expect($name.attr('value')).to.match(RegExp(todaysDate + '|' + tomorrowsDate))
      })
      universal.getSaveButton().should('exist').and('not.be.disabled').click({ force: true })
      universal.getSaveButton().should('not.exist')
      //tesst tooltips and text
      accountInfo
        .getBudgetTimelineTooltip()
        .realHover({ position: 'center', scrollBehavior: 'bottom' })
      accountInfo
        .getConfigurationDateTooltip()
        .realHover({ position: 'center', scrollBehavior: 'bottom' })
    })
    accountInfo.getBudgetTimelineTooltipText().should('exist')
    accountInfo.getConfigurationDateTooltipText().should('exist')
    cy.reload()
    universal.getSpinner().should('not.exist')
    cy.wait(500)
    accountInfo
      .getBudgetTimelineCard()
      .should('be.visible')
      .within(() => {
        accountInfo.getMethodSelect().select('OFFSET_MONTHS')
        cy.wait(400)
        accountInfo.getConfigurationNumberTooltip().scrollIntoView()
        accountInfo
          .getConfigurationNumberTooltip()
          .realHover({ position: 'center', scrollBehavior: 'bottom' })
      })
    cy.get('body').then(($body) => {
      if (!$body.text().includes(`Enter the number of months the start of your company's`)) {
        cy.wait(300)
        accountInfo
          .getConfigurationNumberTooltip()
          .realHover({ position: 'center', scrollBehavior: 'bottom' })
      }
    })
    accountInfo.getConfigurationNumberTooltipText().should('exist')
  })
})
