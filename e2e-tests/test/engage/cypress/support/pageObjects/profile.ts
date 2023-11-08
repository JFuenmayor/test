export default class Profile {
  visitProfile() {
    return cy.visit('/profile')
  }
  //Links
  getYouLink() {
    return cy.findByRole('link', { name: 'You' })
  }
  getUsersLink() {
    return cy.findByRole('link', { name: 'Users' })
  }
  getTeamsLink() {
    return cy.findByRole('link', { name: 'Teams' })
  }
  getTeamLink() {
    return cy.findByRole('link', { name: 'Team' })
  }
  getBrandingLink() {
    return cy.findByRole('link', { name: 'Branding' })
  }
  getIntegrationsLink() {
    return cy.findByRole('link', { name: 'Integrations' })
  }
  getBillingLink() {
    return cy.findByRole('link', { name: 'Billing' })
  }
  getFundsLink() {
    return cy.findByRole('link', { name: 'Team Budgets' })
  }
  getAccountsLink() {
    return cy.findByRole('link', { name: 'Accounts' })
  }
  getBudgetHistoryLink() {
    return cy.findByRole('link', { name: 'Budget History' })
  }
  getTransfersLink() {
    return cy.findByRole('link', { name: 'Transfers' })
  }
  getAccountSettingsLink() {
    return cy.findByRole('link', { name: 'Account Settings' })
  }
  getSavedMessagesLink() {
    return cy.findByRole('link', { name: 'Saved Messages' })
  }
  getEmailSettingsLink() {
    return cy.findByRole('link', { name: 'Email Settings' })
  }
  getNotificationsLink() {
    return cy.findByRole('link', { name: 'Notification Settings' })
  }
  getGiftEmailsLink() {
    return cy.findByRole('link', { name: 'Personalized Emails' })
  }
  getEmailTemplatesLink() {
    return cy.findByRole('link', { name: 'Email Templates' })
  }
  getEmailBlocklistLink() {
    return cy.findByRole('link', { name: 'Email Blocklist' })
  }
  getMeetingSettingsLink() {
    return cy.findByRole('link', { name: 'Meeting Settings' })
  }
  getWarehousingLink() {
    return cy.findByRole('link', { name: 'Warehousing' })
  }
  //Cards
  getYouDetailsCardByName(name: string) {
    return cy.contains('h6', name).parents('[data-testid="ui-card"]', { timeout: 40000 })
  }
  getTeamsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Teams')
  }
  getCampaignsCard() {
    return cy.findByTestId('campaignsCard')
  }
  getEmailIntegrationCard() {
    return cy.contains('[data-testid="ui-card"]', 'Email Integration', { timeout: 99000 })
  }
  getStatsCard() {
    return cy.findByTestId('statsCard')
  }
  //Details
  getYouEmail() {
    return cy.contains('div', 'Email')
  }
  getYouTitle() {
    return cy.contains('div', 'Title')
  }
  getYouPhone() {
    return cy.contains('div', 'Phone')
  }
  getYouMeetingLink() {
    return cy.contains('div', 'Meeting Link')
  }
  //Stats
  getDateAddedStat() {
    return cy.contains('div', 'Date Added')
  }
  getItemsStat() {
    return cy.contains('div', 'Items')
  }
  getCPTStat() {
    return cy.contains('div', 'CPT')
  }
  getStatsRangeIndicator() {
    return cy.findByText('Last 12 months')
  }

  //Headers
  getProfileSettingsHeading() {
    return cy.findByRole('heading', { name: 'Profile' })
  }
  getCampaignsHeading() {
    return cy.findByRole('heading', { name: 'Campaigns' })
  }
  getStatsHeading() {
    return cy.findByText('Stats')
  }
  //Butons
  getAllDisabledButtons() {
    return cy.findAllByTestId(/UserEmailIntegration_button/)
  }
  getEditProfileButton() {
    return cy.findByLabelText('edit button')
  }
  getUpdateProfileButton() {
    return cy.findByRole('button', { name: 'Update Profile' })
  }
  getUpdatePasswordButton() {
    return cy.findByRole('button', { name: 'Update Password' })
  }
  //Tooltips
  getEmailIntegrationTooltip() {
    return cy.contains('header', 'Email Integration').find('svg')
  }
  //Tooltip Text
  getEmailIntegrationTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'When Email Integration is enabled, all Gift Emails can be sent directly from your email account through your email provider',
    })
  }
  //Drawers
  getUpdateProfileDrawer() {
    return cy.findByRole('alertdialog', { name: 'Update Your Profile' })
  }
  //Tabs
  getMyProfileTab() {
    return cy.findByRole('tab', { name: 'My Profile' })
  }
  getChangePasswordTab() {
    return cy.findByRole('tab', { name: 'Change Password' })
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
    return cy.findByLabelText('Title')
  }
  getPhoneNumberInput() {
    return cy.findByLabelText('Phone Number')
  }
  getMeetingLinkInput() {
    return cy.findByLabelText('Meeting Link')
  }
  getEmailSignatureInput() {
    return cy.findByLabelText('Email Signature')
  }
  getCurrentPasswordInput() {
    return cy.findByPlaceholderText('Current Password')
  }
  getNewPasswordInput() {
    return cy.findByPlaceholderText('New Password')
  }
  getReenterPasswordInput() {
    return cy.findByPlaceholderText('Re-enter Password')
  }
  //Alerts
  getCurrentPSWDEnteredIncorrectlyAlert() {
    cy.getAlert({ message: 'Your current password was entered incorrectly.', close: 'close' })
  }
  getUseUnusedPasswordAlert() {
    cy.getAlert({
      message: 'Please enter a new password that has not been used before.',
      close: 'close',
    })
  }

  getTheBenCard() {
    return cy.contains('[data-testid="ui-card"]', 'The Ben')
  }
  getTheFeliciaCard() {
    return cy.contains('[data-testid="ui-card"]', 'The Felicia')
  }
  getTheRichieCard() {
    return cy.contains('[data-testid="ui-card"]', 'The Richie')
  }
  getUpdatedAlert() {
    cy.getAlert({ message: 'Handwriting updated to The Ben', close: 'close' })
  }
  getHandwritingStyleTooltip() {
    return cy.contains('header', 'Handwriting Style').find('svg')
  }
  getHandwritingStyleTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Choose a default handwriting style for your direct mail campaigns',
    })
  }

  //HTML Email Signature Example and Elements
  htmlEmailSignatureExample(company: string, email: string, title: string | undefined) {
    return `<table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr><td><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr><td style="padding: 0px; vertical-align: middle;"><h3 color="#000000" class="sc-fBuWsC eeihxG" style="margin: 0px; font-size: 18px; color: rgb(0, 0, 0);"><span>Billie</span><span>&nbsp;</span><span>Tester</span></h3><p color="#000000" font-size="medium" class="sc-fMiknA bxZCMx" style="margin: 0px; color: rgb(0, 0, 0); font-size: 14px; line-height: 22px;"><span>${title}</span></p><p color="#000000" font-size="medium" class="sc-dVhcbM fghLuF" style="margin: 0px; font-weight: 500; color: rgb(0, 0, 0); font-size: 14px; line-height: 22px;"><span>${company}</span></p><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; width: 100%;"><tbody><tr><td height="30"></td></tr><tr><td color="#F2547D" direction="horizontal" height="1" class="sc-jhAzac hmXDXQ" style="width: 100%; border-bottom: 1px solid rgb(242, 84, 125); border-left: none; display: block;"></td></tr><tr><td height="30"></td></tr></tbody></table><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr height="25" style="vertical-align: middle;"><td width="30" style="vertical-align: middle;"><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr><td style="vertical-align: bottom;"><span color="#F2547D" width="11" class="sc-jlyJG bbyJzT" style="display: block; background-color: rgb(242, 84, 125);"><img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/phone-icon-2x.png" color="#F2547D" width="13" class="sc-iRbamj blSEcj" style="display: block; background-color: rgb(242, 84, 125);"></span></td></tr></tbody></table></td><td style="padding: 0px; color: rgb(0, 0, 0);"><a href="tel:7605576358" color="#000000" class="sc-gipzik iyhjGb" style="text-decoration: none; color: rgb(0, 0, 0); font-size: 12px;"><span>7605576358</span></a></td></tr><tr height="25" style="vertical-align: middle;"><td width="30" style="vertical-align: middle;"><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr><td style="vertical-align: bottom;"><span color="#F2547D" width="11" class="sc-jlyJG bbyJzT" style="display: block; background-color: rgb(242, 84, 125);"><img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/email-icon-2x.png" color="#F2547D" width="13" class="sc-iRbamj blSEcj" style="display: block; background-color: rgb(242, 84, 125);"></span></td></tr></tbody></table></td><td style="padding: 0px;"><a href="mailto:${email}" color="#000000" class="sc-gipzik iyhjGb" style="text-decoration: none; color: rgb(0, 0, 0); font-size: 12px;"><span class="__postalio__parent">${email}</span></a></td></tr><tr height="25" style="vertical-align: middle;"><td width="30" style="vertical-align: middle;"><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr><td style="vertical-align: bottom;"><span color="#F2547D" width="11" class="sc-jlyJG bbyJzT" style="display: block; background-color: rgb(242, 84, 125);"><img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/address-icon-2x.png" color="#F2547D" width="13" class="sc-iRbamj blSEcj" style="display: block; background-color: rgb(242, 84, 125);"></span></td></tr></tbody></table></td><td style="padding: 0px;"><span color="#000000" class="sc-csuQGl CQhxV" style="font-size: 12px; color: rgb(0, 0, 0);"><span>75 Higuera St #240 SLO, CA 93401</span></span></td></tr></tbody></table><table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"><tbody><tr><td height="30"></td></tr></tbody></table><a href="https://www.hubspot.com/email-signature-generator?utm_source=create-signature" target="_blank" rel="noopener noreferrer" class="sc-gisBJw kDlVKO" style="font-size: 12px; display: block; color: rgb(0, 0, 0);">Create Your Own Free Signature</a></td></tr></tbody></table></td></tr></tbody></table>`
  }
  getEmailSignatureTable(name: string) {
    return cy.contains('table', name)
  }
  //Sorts
  sortBySent() {
    cy.contains('th', 'Sent', { timeout: 50000 }).should('be.visible').click()
  }
}
