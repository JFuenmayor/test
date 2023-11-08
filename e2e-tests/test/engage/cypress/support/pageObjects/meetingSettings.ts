export default class MeetingSettings {
  //visits
  visitMeetingSettings() {
    return cy.visit('/profile/meetings')
  }
  //links
  getMeetingSettingsLink() {
    return cy.findByRole('link', { name: 'Meeting Settings' })
  }
  getConnectLink() {
    return cy.contains('a', 'Connect')
  }
  //sections
  getMeetingSettingsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Meeting Settings')
  }
  //tooltips and text
  getMeetingNameTooltip() {
    return cy.contains('label', 'Meeting name').parent('div').find('svg')
  }
  getMeetingNameTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The name of the meeting on your calendar',
    })
  }
  getMeetingLinkTooltip() {
    return cy.contains('div', 'Meeting link').find('svg')
  }
  getMeetingLinkTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The URL to your video meetings',
    })
  }
  getMeetingRequestsTooltip() {
    return cy.contains('label', 'Default meeting requests').parent('div').find('svg')
  }
  getMeetingRequestsTooltipText() {
    return cy
      .findAllByRole('tooltip')
      .should(
        'contain',
        `The default setting for meeting requests, which you can override on individual sends`
      )
  }
  getMeetingDurationTooltip() {
    return cy.contains('div', 'Meeting duration').find('svg')
  }
  getMeetingDurationTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'How long you want the meetings to last',
    })
  }
  getMaxDaysInTheFutureTooltip() {
    return cy.contains('div', 'Max days in future').find('svg')
  }
  getMaxDaysInTheFutureTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'For example, a contact can only schedule a meeting up to 7 days out rather than 6 months out',
    })
  }
  getDayLeadTimeTooltip() {
    return cy.contains('div', 'Day lead time').find('svg')
  }
  getDayLeadTimeTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'For example, a contact can only schedule a meeting the next day rather than the same day',
    })
  }
  getHourLeadTimeTooltip() {
    return cy.contains('div', 'Hour lead time').find('svg')
  }
  getHourLeadTimeTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'For example, a contact can only schedule a meeting an hour later rather than scheduling immediately',
    })
  }
  getMeetingBufferMinutesTooltip() {
    return cy.contains('div', 'Meeting buffer minutes').find('svg')
  }
  getMeetingBufferMinutesTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Provides a buffer time between meetings in order to avoid back to back meetings',
    })
  }
  getCalendlyLinkTooltip() {
    return cy.contains('div', 'Calendly Link').find('svg')
  }
  getCalendlyLinkTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The URL to your Calendly scheduling page',
    })
  }
  getChiliPiperLinkTooltip() {
    return cy.contains('div', 'Chili Piper Link').find('svg')
  }
  getChiliPiperLinkTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The URL to your Chili Piper scheduling page',
    })
  }
  //toggles
  getDisabledToggle() {
    return cy.contains('[role="group"]', 'Disabled')
  }
  getEnabledToggle() {
    return cy.contains('[role="group"]', 'Enabled')
  }
  //inputs
  getMeetingNameInput() {
    return cy.findByRole('textbox', { name: 'Meeting name' })
  }
  getMeetingLinkInput() {
    return cy.findByRole('textbox', { name: 'Video Meeting link' })
  }
  getFromInput() {
    return cy.contains('[role="group"]', 'From').find('input')
  }
  getToInput() {
    return cy.contains('[role="group"]', 'To').find('input')
  }
  getCalendlyLinkInput() {
    return cy.findByRole('textbox', { name: 'Calendly Link' })
  }
  getChiliPiperLinkInput() {
    return cy.findByRole('textbox', { name: 'Chili Piper Link' })
  }
  //buttons
  getCalendarButton(name: string) {
    return cy.findByTestId(`UserEmailIntegration_button_${name}`)
  }
  getAddATimeBlock() {
    return cy.findByRole('button', { name: 'Add a time block' })
  }
  getAllDeleteButtons() {
    return cy.findAllByRole('button', { name: 'delete', timeout: 45000 })
  }
  getGoogleButton() {
    return cy.findAllByRole('button', { name: 'Google' })
  }
  getMicrosoftButton() {
    return cy.findAllByRole('button', { name: 'Microsoft', timeout: 55000 })
  }
  getCalendlyButton() {
    return cy.findAllByRole('button', { name: 'Calendly' })
  }
  getChiliPiperButton() {
    return cy.findAllByRole('button', { name: 'Chili Piper' })
  }
  getPostalButton() {
    return cy.findAllByRole('button', { name: 'Test' })
  }
  //modals
  getRemoveDateSet() {
    return cy.findByRole('alertdialog', { name: 'Remove Date Set' })
  }
  getConnnectToGoogleModal() {
    return cy.findByRole('dialog', { name: 'Connect to Google' })
  }
  getConnnectToMicrosoftModal() {
    return cy.findByRole('dialog', { name: 'Connect to Microsoft' })
  }
  //text
  getAuthorizationIsRequiredText() {
    return cy.contains('Authorization is required.')
  }
  //checkboxes
  getMonCheckbox() {
    return cy.findByTestId(`Day-Mon`).find('input')
  }
  //selects
  getMeetingRequestSelect() {
    return cy.findByRole('combobox', { name: 'Default meeting requests' })
  }
  //alerts
  getMeetingSettingsSavedAlert() {
    cy.getAlert({
      message: 'Meeting Settings Saved',
      close: 'close',
    })
  }
}
