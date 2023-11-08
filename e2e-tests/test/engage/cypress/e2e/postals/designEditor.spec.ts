import '@4tw/cypress-drag-drop'
import { userFactory } from '../../support/factories'
import {
  DesignEditor,
  Marketplace,
  SavedMessages,
  SidePanel,
  Universal,
} from '../../support/pageObjects'

describe(`Direct Mail Postal Design Editor Testing`, function () {
  const user = userFactory()
  const marketplace = new Marketplace()
  const designEditor = new DesignEditor()
  const universal = new Universal()
  const savedMessages = new SavedMessages()
  const sidePanel = new SidePanel()
  const inputNames = designEditor.inputNames()
  let orderOfLayers: string

  before(function () {
    cy.signup(user)
  })

  beforeEach(() => {
    cy.login(user)
    cy.intercept('POST', '/engage/api/upload-assets?*').as('uploadAssets')
    // cy.intercept('/engage/api/graphql', (req) => {
    //   if (req.body.operationName === 'searchMarketplaceProducts') {
    //     req.alias = 'searchMarketplaceProducts'
    //   }
    // })
    cy.filterLocalStorage('postal:marketplace:filter')
  })

  it('tests the direct mail postal design editor', () => {
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    // cy.wait('@searchMarketplaceProducts')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    sidePanel.selectFilter('Categories', 'Direct Mail')
    universal.getSpinner().should('not.exist')
    marketplace.getPostcardButton().click({ force: true })
    cy.contains('Choose your options').should('exist')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getEditDesignButton().click()
    cy.contains('Edit Design - Postcard').should('be.visible')
    designEditor.getMediaPanelHeader().should('be.visible')
    //Side 1 testing of tabs
    designEditor.getElementTab().click()
    designEditor.getNoneSelectedHeader()
    designEditor.getLayersTab().click()
    designEditor.getLayersPanelHeader()
    designEditor.getLayersEyeButton()
    designEditor.getAllLayersLockButtons().should('be.visible')
    designEditor.getAllLayersTrashButtons().should('have.length', 1)
    designEditor.getLayersTrashButton().should('be.disabled')
    designEditor.getLayersEyeButton().should('be.disabled')
    designEditor.getUSPSBlock()
    designEditor.getMediaTab().click()
    designEditor.getMediaTabPanel().within(() => {
      const assetsArray = designEditor.getAssetArray()
      assetsArray.forEach((asset) => {
        cy.contains('div', asset).should('have.attr', 'draggable', 'true')
      })
      designEditor.getImportImages().should('exist')
      designEditor.getUploadFilesButton().should('exist')
    })
    //Side 2 testing of tabs
    designEditor.getSide1NotALink().should('exist')
    designEditor.getSide2Link().click()
    designEditor.getElementTab().click({ force: true })
    designEditor.getNoneSelectedHeader()
    designEditor.getLayersTab().click()
    designEditor.getLayersPanelHeader().should('not.exist')
    designEditor.getAllLayersLockButtons().should('not.exist')
    designEditor.getMediaTab().click()
    designEditor.getMediaTabPanel().within(() => {
      designEditor.getUploadFilesButton()
    })
    designEditor.getSide2NotALink().should('exist')
    //back to side 1
    designEditor.getSide1Link().click()
    //image dropzone testing
    cy.findByTestId(designEditor.dropzoneTestId()).as('dropZone').should('exist')
    //feeds an image into the dropzone
    cy.fixture('postal-plane.svg', 'base64').then((content) => {
      cy.get('@dropZone').upload({
        file: content,
        fileName: 'postal-plane.svg',
        type: 'image/svg+xml',
        testId: designEditor.dropzoneTestId(),
      })
    })
    cy.wait('@uploadAssets')
    universal.getSpinner().should('not.exist')
    designEditor.getNewAsset(0).should('exist')
    //test deleting the image
    designEditor.getAssetTrashButton().should('exist').click({ force: true })
    designEditor.getRemoveImageModal().within(() => {
      universal.getCancelButton()
      universal.getDeleteButton().click()
    })
    designEditor.getNewAsset(0).should('not.exist')
    //reuploads the image
    cy.fixture('postal-plane.svg', 'base64').then((content) => {
      cy.get('@dropZone').upload({
        file: content,
        fileName: 'postal-plane.svg',
        type: 'image/svg+xml',
        testId: designEditor.dropzoneTestId(),
      })
    })
    cy.wait('@uploadAssets')
    universal.getSpinner().should('not.exist')
    designEditor.getNewAsset(0).should('exist')
    //then drags it onto the canvas
    designEditor.getNewAsset(0).as('image')
    cy.get('canvas').eq(1).as('dropCanvas')
    /* @ts-ignore */
    cy.get('@image').drag('@dropCanvas', { target: { position: 'topLeft', force: true } })
    designEditor.getElementTabPanel().should('contain', 'Image')
    //tests the design template tools - reset
    designEditor.getResetTool().click()
    designEditor.getElementTabPanel().should('contain', 'No Element Selected')
    designEditor.getMediaTab().click()
    /* @ts-ignore */
    cy.get('@image').drag('@dropCanvas', { target: { position: 'topLeft', force: true } })
    designEditor.getElementTabPanel().should('contain', 'Image')
    //tests undo
    designEditor.getUndoTool().click()
    designEditor.getElementTabPanel().should('contain', 'No Element Selected')
    //tests undo
    designEditor.getRedoTool().click()
    designEditor.getElementTabPanel().should('contain', 'Image')
    //test toggle visibility but really only that the icon changes on click
    designEditor.getLayersTab().click()
    designEditor.getAllLayersEyeButton().should('have.length', 2)
    designEditor.getToggleVisibilityTool().click()
    designEditor.getAllLayersEyeButton().should('have.length', 1)
    designEditor.getLayersEyeSlashButton()
    //tests delete button in the tools
    designEditor.getLayersTabPanel().should('contain', 'Image')
    designEditor.getDeleteElementTool().click()
    designEditor.getDeleteElementModal().within(() => {
      universal.getCancelButton()
      universal.getDeleteButton().click()
    })
    designEditor.getLayersTabPanel().should('not.contain', 'Image')
    //not testing the toggle grid and snap to because I don't have anything to assert against in the canvas
  })
  it('tests adding all avaible media types', () => {
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    //cy.wait('@searchMarketplaceProducts')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    sidePanel.selectFilter('Categories', 'Direct Mail')
    universal.getSpinner().should('not.exist')
    marketplace.getPostcardButton().click({ force: true })
    cy.contains('Choose your options').should('exist')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getEditDesignButton().click()
    designEditor.getMediaTab().should('have.attr', 'aria-selected', 'true')
    //uploads the image
    cy.findByTestId(designEditor.dropzoneTestId()).as('dropZone').should('exist')
    cy.fixture('postal-plane.svg', 'base64').then((content) => {
      cy.get('@dropZone').upload({
        file: content,
        fileName: 'postal-plane.svg',
        type: 'image/svg+xml',
        testId: designEditor.dropzoneTestId(),
      })
    })
    cy.wait('@uploadAssets')
    universal.getSpinner().should('not.exist')
    designEditor.getNewAsset(0).should('exist')
    designEditor.getNewAsset(0).as('image')
    cy.get('canvas').eq(1).as('dropCanvas')
    /* @ts-ignore */
    cy.get('@image').drag('@dropCanvas', { target: { position: 'center', force: true } })
    designEditor.getElementTabPanel().should('contain', 'Image')
    //test images element's options
    designEditor.getPositionText()
    designEditor.getXInput().clear().fill('12')
    designEditor.getYInput().clear().fill('12')
    designEditor.getDimensionsText()
    designEditor.getWidthInput().clear().fill('100')
    designEditor.getHeightInput().clear().type('100')
    designEditor
      .getDrawMode()
      .find('option')
      .then((options: any) => {
        const actual = [...options].map((option) => option.value)
        expect(actual).to.deep.eq(['NONE', 'FILL', 'CONTAIN', 'COVER', 'SCALE_DOWN'])
      })
    designEditor.getDrawMode().select('CONTAIN').should('have.value', 'CONTAIN')
    designEditor.getMediaTab().click()
    //tests text elements options
    designEditor.getTextElement().as('textElement')
    /* @ts-ignore */
    cy.get('@textElement').drag('@dropCanvas', { target: { position: 'center', force: true } })
    designEditor.getElementTabPanel().should('contain', 'Text')
    designEditor.getPositionText()
    designEditor.getXInput().as('x').invoke('val').should('not.be.empty')
    cy.get('@x').clear()
    cy.get('@x').fill('12')
    designEditor.getYInput().clear()
    designEditor.getYInput().fill('12')
    designEditor.getYInput().as('y')
    designEditor.getYInput().invoke('val').should('not.be.empty')
    cy.get('@y').clear()
    cy.get('@y').fill('115')
    designEditor.getDimensionsText()
    designEditor.getWidthInput().clear().fill('150')
    designEditor.getHeightInput().as('height').clear().type('150')
    designEditor
      .getHandwritingFont()
      .find('option')
      .then((options: any) => {
        const actual = [...options].map((option) => option.value)
        expect(actual).to.deep.eq([
          'SYSTEM',
          '${user.handwritingName}',
          'ashley',
          'ben',
          'erik',
          'grace',
          'richie',
          'patricia',
          'nick',
          'felicia',
        ])
      })
    designEditor.getHandwritingFont().select('The Ben').should('have.value', 'ben')
    designEditor.getSystemFont().select('Amatic Regular').should('have.value', 'AmaticSC-Regular')
    designEditor
      .getSystemFont()
      .select('-- Using Handwriting Font --')
      .should('have.value', 'HUMAN')
    designEditor
      .getHorizontal()
      .find('option')
      .then((options: any) => {
        const actual = [...options].map((option) => option.value)
        expect(actual).to.deep.eq(['LEFT', 'CENTER', 'RIGHT'])
      })
    designEditor.getHorizontal().select('Center').should('have.value', 'CENTER')
    designEditor
      .getVertical()
      .find('option')
      .then((options: any) => {
        const actual = [...options].map((option) => option.value)
        expect(actual).to.deep.eq(['TOP', 'CENTER', 'BOTTOM'])
      })
    designEditor.getVertical().select('Center').should('have.value', 'CENTER')
    designEditor.getPenColor().should('exist')
    designEditor.getSizeSlider().should('have.attr', 'aria-valuenow', '20')
    designEditor.getSpacingSlider().should('have.attr', 'aria-valuenow', '-8')
    designEditor.getRandomOffest().scrollIntoView().check({ force: true }).should('be.checked')
    designEditor.getSizeToFit().uncheck({ force: true }).should('not.be.checked')
    savedMessages.getMessageVariablesButton().click()
    savedMessages.getMessageVariablesDrawer().within(() => {
      cy.get('tr').should('have.length', 15)
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns(win.prompt)
      })
      designEditor.getContactsFirstNameVariable().scrollIntoView().click()
    })
    designEditor.getCopiedContactFirstNameToClipboardAlert()
    designEditor.getExampleVariablesTextBox().should('contain', 'Example text.')
    savedMessages.getSavedMessageButton().click()
    savedMessages.getSavedMessagesDrawer().within(() => {
      cy.findAllByTestId('ui-card').should('have.length', 8)
      savedMessages.getWinBackSavedMessage().scrollIntoView().click()
    })
    designEditor
      .getExampleVariablesTextBox()
      .should('not.contain', 'Example text.')
      .and('contain', '${contact.firstName},')
    //test user message element options
    designEditor.getMediaTab().click()
    designEditor.getUserMessageElement().as('userMessElement')
    /* @ts-ignore */
    cy.get('@userMessElement').drag('@dropCanvas', {
      target: { position: 'topLeft', force: true },
    })
    designEditor
      .getElementTabPanel()
      .should('contain', 'User Message')
      .within(() => {
        designEditor.getXInput().clear().fill('12')
        designEditor.getYInput().clear().fill('268')
        designEditor.getWidthInput().clear().fill('200')
        designEditor.getHeightInput().clear().type('143')
        savedMessages.getSavedMessageButton().should('not.exist')
        savedMessages.getMessageVariablesButton().should('not.exist')
        designEditor.getExampleVariablesTextBox().should('not.exist')
        cy.get('select').should('have.length', 4)
        cy.findAllByRole('slider').should('have.length', 2)
        cy.findAllByRole('checkbox').should('have.length', 2)
        inputNames.forEach((i: string) => {
          cy.get(`input[name="${i}"]`).should('exist')
        })
      })
    //tests border element options
    designEditor.getMediaTab().click()
    designEditor.getBorderElement().as('borderElement')
    /* @ts-ignore */
    cy.get('@borderElement').drag('@dropCanvas', { target: { position: 'topLeft', force: true } })
    designEditor
      .getElementTabPanel()
      .should('contain', 'Border')
      .within(() => {
        designEditor.getXInput().clear().fill('120')
        designEditor.getYInput().clear().fill('12')
        designEditor.getWidthInput().clear().fill('100')
        designEditor.getHeightInput().clear().type('100')
        inputNames.forEach((i: string) => {
          cy.get(`input[name="${i}"]`).should('exist')
        })
        designEditor.getThicknessSlider().should('have.attr', 'aria-valuenow', '8')
        cy.get('select').should('have.length', 0)
        cy.findAllByRole('slider').should('have.length', 1)
        cy.findAllByRole('checkbox').should('have.length', 0)
        savedMessages.getMessageVariablesButton().should('not.exist')
        designEditor.getExampleVariablesTextBox().should('not.exist')
      })
    //tests qr code element options
    designEditor.getMediaTab().click()
    designEditor.getQRCodeElement().as('qrElement')
    /* @ts-ignore */
    cy.get('@qrElement').drag('@dropCanvas', { target: { position: 'topLeft', force: true } })
    designEditor
      .getElementTabPanel()
      .should('contain', 'QR Code')
      .within(() => {
        designEditor.getXInput().clear().fill('229')
        designEditor.getYInput().clear().fill('12')
        designEditor.getWidthInput().clear().fill('125')
        designEditor.getHeightInput().clear().type('100')
        inputNames.forEach((i: string) => {
          cy.get(`input[name="${i}"]`).should('exist')
        })
        designEditor
          .getURL()
          .should('have.value', 'http://www.postal.com')
          .clear()
          .fill('http://www.latsop.dev')
        cy.findByText('Black').should('not.exist')
        cy.get('select').should('have.length', 0)
        cy.findAllByRole('slider').should('have.length', 0)
        cy.findAllByRole('checkbox').should('have.length', 0)
        savedMessages.getMessageVariablesButton().should('not.exist')
      })
    //tests logo element options
    designEditor.getMediaTab().click()
    designEditor.getLogoElement().as('logo')
    /* @ts-ignore */
    cy.get('@logo').drag('@dropCanvas', { target: { position: 'topLeft', force: true } })
    designEditor
      .getElementTabPanel()
      .should('contain', 'Logo')
      .within(() => {
        designEditor.getXInput().clear({ force: true }).fill('360')
        designEditor.getYInput().clear().fill('12')
        designEditor.getWidthInput().clear().fill('240')
        designEditor.getHeightInput().clear().type('100')
        inputNames.forEach((i: string) => {
          cy.get(`input[name="${i}"]`).should('exist')
        })
        designEditor.getDrawMode().should('exist')
        cy.get('select').should('have.length', 1)
        cy.findByText('URL').should('not.exist')
        cy.findByText('Black').should('not.exist')
        cy.findAllByRole('slider').should('have.length', 0)
        cy.findAllByRole('checkbox').should('have.length', 0)
        savedMessages.getMessageVariablesButton().should('not.exist')
        designEditor.getExampleVariablesTextBox().should('not.exist')
      })
    designEditor.getLayersTab().click()
    designEditor.getLayersTabPanel().within(() => {
      designEditor.getAllLayersEyeButton().should('have.length', 7)
    })
    //adds all elements to side 2
    designEditor.getSide2Link().click()
    designEditor.getMediaTab().click()
    designEditor.getTextElement().as('text')
    /* @ts-ignore */
    cy.get('@text').drag('@dropCanvas', { target: { x: 22, y: 22, force: true } })
    designEditor.getMediaTab().click()
    designEditor.getUserMessageElement().as('userMess')
    /* @ts-ignore */
    cy.get('@userMess').drag('@dropCanvas', { target: { x: 305, y: 22, force: true } })
    designEditor.getMediaTab().click()
    designEditor.getBorderElement().as('border')
    /* @ts-ignore */
    cy.get('@border').drag('@dropCanvas', { target: { x: 22, y: 310, force: true } })
    designEditor.getMediaTab().click()
    designEditor.getQRCodeElement().as('qrCode')
    /* @ts-ignore */
    cy.get('@qrCode').drag('@dropCanvas', { target: { x: 310, y: 425, force: true } })
    designEditor.getMediaTab().click()
    designEditor.getLogoElement().as('logo')
    /* @ts-ignore */
    cy.get('@logo').drag('@dropCanvas', { target: { x: 310, y: 310, force: true } })
    designEditor.getMediaTab().click()
    designEditor.getNewAsset(0).as('image')
    /* @ts-ignore */
    cy.get('@image').drag('@dropCanvas', { target: { x: 590, y: 22, force: true } })
    designEditor.getLayersTab().click()
    designEditor.getLayersTabPanel().within(() => {
      designEditor.getAllLayersEyeButton().should('have.length.gte', 4)
      //tests a visibility button
      designEditor.getLogoElement().within(() => {
        designEditor.getAllLayersEyeButton().click()
        designEditor.getLayersEyeSlashButton().click()
        designEditor.getAllLayersEyeButton()
      })
      //tests a trash button
      designEditor.getAllLayersTrashButtons().should('have.length.gte', 4)
      designEditor.getTextElement().within(() => {
        designEditor.getAllLayersTrashButtons().click()
      })
    })
    designEditor.getDeleteElementModal().within(() => {
      universal.getDeleteButton().click()
    })
    designEditor.getDeleteElementModal().should('not.exist')
    designEditor.getLayersTabPanel().within(() => {
      designEditor.getAllLayersTrashButtons().should('have.length.gte', 3)
      designEditor.getTextElement().should('not.exist')
    })
    designEditor.getLayersTabPanel().then(($element) => {
      orderOfLayers = $element.text()
    })
    designEditor.getLayersTabPanel().within(() => {
      designEditor.getBorderElement().within(() => {
        designEditor.getLayersDragButton().as('border')
      })
    })
    cy.get('@border').keyboardMoveBy(16, 'up')
    designEditor.getLayersTabPanel().then(($element) => {
      expect($element.text()).to.not.equal(orderOfLayers)
    })
    designEditor.getSaveDesignButton().click({ force: true })
    marketplace.getSavePostalButton().click({ force: true })
    marketplace.getSendDirectlyButton().should('be.visible')
    cy.wait(800)
    marketplace.getMyItemsHeaderButton().click()
    marketplace.getPostcardDrawer().should('not.exist')
    universal.getSpinner().should('not.exist')
    //universal.getThingSpinner().should('not.exist')
    cy.wait(3100)
    cy.reload()
    cy.wait(300)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Back to Home')) {
        cy.wait(300)
        cy.reload()
        cy.wait(600)
      }
    })
    cy.contains('a', 'Postcard', { timeout: 500000 }).should('be.visible')
    cy.contains('a', 'Postcard', { timeout: 500000 }).click()
    //make sure the design was saved by opening it back up and checking that the elements remain
    cy.findAllByText('Postcard').should('be.visible')
    //cy.findAllByAltText('Preview', { timeout: 75000 }).should('be.visible')
    marketplace.getEditButton().click({ force: true })
    marketplace.getEditDesignButton().should('be.visible').click({ force: true })
    designEditor.getLayersTab().click()
    designEditor.getAllLayersTrashButtons().should('have.length.gte', 6)
    designEditor.getSide2Link().click()
    designEditor.getAllLayersTrashButtons().should('have.length.gte', 3)
  })
  it(`tests that the 'Edit The Design' button does not show up in the chipotle workflow`, () => {
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    //cy.wait('@searchMarketplaceProducts')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    sidePanel.selectFilter('Categories', 'Gift Cards')
    universal.getSpinner().should('not.exist')
    sidePanel.getFilter('Categories').should('be.visible')
    marketplace.getAllItems().should('have.length.lte', 5)
    marketplace.viewItemByName('Chipotle')
    cy.contains('Choose your options').should('exist')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getEditDesignButton().should('not.exist')
  })
  it(`tests that the 'Edit The Design' button does show up in the brochure and notecard workflows`, () => {
    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    //cy.wait('@searchMarketplaceProducts')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getSpinner().should('not.exist')
    marketplace.getAllItems().should('have.length.gte', 5)
    marketplace.getBrochureButton().should('be.visible')
    cy.contains('Price').should('be.visible')
    sidePanel.selectFilter('Categories', 'Direct Mail')
    universal.getSpinner().should('not.exist')
    marketplace.getAllItems().should('have.length.lte', 5)
    marketplace.getBrochureButton().click({ force: true })
    cy.contains('Choose your options').should('exist')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getEditDesignButton().should('exist')

    marketplace.visitAllItems()
    universal.getSpinner().should('not.exist')
    //cy.wait('@searchMarketplaceProducts')
    cy.findByTestId('SidePanelFilter_Filters_loading').should('not.exist')
    universal.getSpinner().should('not.exist')
    marketplace.getAllItems().should('have.length.gte', 5)
    marketplace.getBrochureButton().should('be.visible')
    cy.contains('Direct Mail').should('exist')
    universal.getSpinner().should('not.exist')
    marketplace.getAllItems().should('have.length.lte', 5)
    marketplace.getNotecardButton().click({ force: true })
    cy.contains('Choose your options').should('exist')
    marketplace.getApproveThisButton().click({ force: true })
    marketplace.getEditDesignButton().should('exist')
  })
})
