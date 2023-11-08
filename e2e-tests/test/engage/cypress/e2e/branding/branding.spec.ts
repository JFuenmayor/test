import { userFactory } from '../../support/factories'
import { Branding, Profile, Universal } from '../../support/pageObjects'

describe('Branding suite', () => {
  const user = userFactory()
  const branding = new Branding()
  const universal = new Universal()
  const profile = new Profile()

  before(() => {
    cy.signup(user)
    branding.visitBranding()
    cy.url().should('include', '/account/branding')
    universal.getSpinner().should('not.exist')
    universal.getUISpinner().should('not.exist')
  })

  beforeEach(() => {
    cy.login(user)
    cy.visit('/account/branding')
    // cy.filterLocalStorage('postal:filters:contacts')
    cy.intercept('POST', '/engage/api/upload-assets?*').as('uploadAssets')
  })

  it('tests branding', () => {
    //tests uplaoding an svg
    profile.getBrandingLink().should('exist').should('have.class', 'active')
    branding.getLogoCard().within(() => {
      cy.get('img').should('be.visible')
      cy.findByText("You currently don't have a Company Logo set.").should('not.exist')
    })
    branding.getUploadFromAFileHeading().should('not.exist')
    cy.findAllByTestId('dropZone').eq(0).should('exist')
    cy.fixture('postal-plane.svg', 'base64').then((content) => {
      cy.upload({
        file: content,
        fileName: 'postal-plane.svg',
        type: 'image/svg+xml',
        testId: 'dropZone',
        whichDZ: 0,
      })
      universal.getSpinner().should('exist')
      cy.wait('@uploadAssets').then(() => {
        universal.getSpinner().should('not.exist')
        branding.getUploadedLogoAlert()
      })
    })
    universal.getSpinner().should('not.exist')
    //tests rendering of brand color selectors
    branding.getColorsCard().within(() => {
      branding.getPrimaryInput().should('have.value', '#222222')
      branding.getSecondaryInput().should('have.value', '#29afff')
      branding.getTertiaryInput().should('have.value', '#e4f6ff')
    })
    //tests rendering of other Logo card elements and tooltips
    branding.getLogoCard().within(() => {
      branding.getWorkWellText().should('be.visible')
      branding.getExLogoDimensionsText().should('be.visible')
      branding.getCurrentLogoTooltip().realHover()
    })
    branding.getCurrentLogoTooltipText().should('be.visible')
    //tests rendering of other colors card elements and tooltips
    branding.getColorsCard().within(() => {
      branding.getPreviewLink().should('have.attr', 'href', '/account/email-templates')
      branding.getPrimaryButtons().should('have.length', 2)
      branding.getSecondaryButtons().should('have.length', 2)
      branding.getTertiaryButtons().should('have.length', 2)
      branding.getPrimaryColorText().should('be.visible')
      branding.getSecondaryColorText().should('be.visible')
      branding.getTertiaryColorText().should('be.visible')
      branding.getBrandColorsTooltip().realHover()
    })
    branding.getBrandColorsTooltipText().should('be.visible')
    branding.getPrimaryColorTooltip().realHover()
    branding.getPrimaryColorTooltipText().should('be.visible')
    branding.getSecondaryColorTooltip().realHover()
    branding.getSecondaryColorTooltipText().should('be.visible')
    branding.getTertiaryColorTooltip().realHover()
    branding.getTertiaryColorTooltipText().should('be.visible')
    branding.getSampleElementsTooltip().realHover()
    branding.getSampleElementsTooltipText().should('be.visible')
  })
})
//ToDo: include testing for secondary Logo
