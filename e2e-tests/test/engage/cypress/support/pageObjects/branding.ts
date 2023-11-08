export default class Branding {
  //visits
  visitBranding() {
    return cy.visit('/account/branding')
  }
  //headings
  getBrandingHeading() {
    return cy.findByRole('heading', { name: 'Branding' })
  }
  getUploadFromAFileHeading() {
    return cy.contains('Upload From a File')
  }
  //tooltips and tooltip text
  getCurrentLogoTooltip() {
    return cy.contains('Main Logo').find('svg')
  }
  getCurrentLogoTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'Your logo will be included in your gift and event invite workflows, including emails and landing pages, and can easily be included in your direct mail designs.',
    })
  }
  getBrandColorsTooltip() {
    return cy.contains('Brand Colors').find('svg')
  }
  getSampleElementsTooltip() {
    return cy.contains('Sample Elements').find('svg')
  }
  getPrimaryColorTooltip() {
    return cy.findByTestId('primaryColor').find('svg')
  }
  getSecondaryColorTooltip() {
    return cy.findByTestId('secondaryColor').find('svg')
  }
  getTertiaryColorTooltip() {
    return cy.findByTestId('tertiaryColor').find('svg')
  }
  getBrandColorsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'These colors will be used in your gift and event invite workflows, including emails and landing pages.',
    })
  }
  getSampleElementsTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'These are examples of elements found inside your email templates, using the branding colors you have selected.',
    })
  }
  getPrimaryColorTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The main color at the top of your gift emails and landing pages. Recommended to avoid light colors.',
    })
  }
  getSecondaryColorTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The color of buttons on gift emails and landing pages. Recommended to avoid lighter colors that may conflict with the white text on a button.',
    })
  }
  getTertiaryColorTooltipText() {
    return cy.findByRole('tooltip', {
      name: 'The background of your gift emails. Lighter colors are recommended.',
    })
  }
  //alerts
  getUploadedLogoAlert() {
    cy.getAlert({ message: 'Success! Your new logo has been uploaded', close: 'close' })
  }
  //inputs
  getPrimaryInput() {
    return cy.contains('div', 'Primary').find('input')
  }
  getSecondaryInput() {
    return cy.contains('div', 'Secondary').find('input')
  }
  getTertiaryInput() {
    return cy.contains('div', 'Tertiary').find('input')
  }
  //text elements
  getWorkWellText() {
    return cy.contains('Example logo dimensions that work well:')
  }
  getExLogoDimensionsText() {
    return cy.contains('1372 x 359 pixels (width by height)')
  }
  getPrimaryColorText() {
    return cy.contains('This is sample text using primary color.')
  }
  getSecondaryColorText() {
    return cy.contains('This is sample text using secondary color.')
  }
  getTertiaryColorText() {
    return cy.contains('This is sample text using tertiary color.')
  }
  //cards
  getLogoCard() {
    return cy.contains('[data-testid="ui-card"]', 'Main Logo')
  }
  getColorsCard() {
    return cy.contains('[data-testid="ui-card"]', 'Brand Colors')
  }
  //butons
  getPrimaryButtons() {
    return cy.findAllByRole('button', { name: 'Primary' })
  }
  getSecondaryButtons() {
    return cy.findAllByRole('button', { name: 'Secondary' })
  }
  getTertiaryButtons() {
    return cy.findAllByRole('button', { name: 'Tertiary' })
  }
  //links
  getPreviewLink() {
    return cy.contains('a', 'Preview and update your email templates ')
  }
}
