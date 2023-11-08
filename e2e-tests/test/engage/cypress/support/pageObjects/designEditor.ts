export default class DesignEditor {
  //drawers
  // getPostcardDesignDrawer() {
  //   return cy.findByRole('dialog', { name: 'Postcard Design' })
  // }
  //buttons
  getSaveDesignButton() {
    return cy.findByRole('button', { name: 'Save Design' })
  }
  getAssetTrashButton() {
    return cy.findByTestId('Assets_Uploaded_Trash')
  }
  getAllLayersLockButtons() {
    return cy.findAllByTestId('Layers_Button_Lock')
  }
  getAllLayersTrashButtons() {
    return cy.findAllByTestId('Layers_Button_Trash')
  }
  getLayersTrashButton() {
    return cy.findByTestId('Layers_Button_Trash')
  }
  getLayersEyeButton() {
    return cy.findByTestId('Layers_Button_Eye')
  }
  getAllLayersEyeButton() {
    return cy.findAllByTestId('Layers_Button_Eye')
  }
  getLayersEyeSlashButton() {
    return cy.findByTestId('Layers_Button_EyeSlash')
  }
  getLayersDragButton() {
    return cy.findByTestId('Layers_Button_Drag')
  }
  getUploadFilesButton() {
    return cy.findByRole('button', { name: 'Upload File' })
  }
  getResetTool() {
    return cy.findByLabelText('Reset')
  }
  getUndoTool() {
    return cy.findByLabelText('Undo')
  }
  getRedoTool() {
    return cy.findByLabelText('Redo')
  }
  getToggleVisibilityTool() {
    return cy.findByLabelText('Toggle Visibility')
  }
  getDeleteElementTool() {
    return cy.findByLabelText('Delete Element')
  }
  //tabs and tab panels
  getMediaTab() {
    return cy.findByRole('tab', { name: 'Media' })
  }
  getElementTab() {
    return cy.findByRole('tab', { name: 'Element' })
  }
  getLayersTab() {
    return cy.findByRole('tab', { name: 'Layers' })
  }
  getMediaTabPanel() {
    return cy.findByRole('tabpanel', { name: 'Media' })
  }
  getElementTabPanel() {
    return cy.findByRole('tabpanel', { name: 'Element' })
  }
  getLayersTabPanel() {
    return cy.findByRole('tabpanel', { name: 'Layers' })
  }
  //modals
  getRemoveImageModal() {
    return cy.findByRole('dialog', { name: 'Remove Image' })
  }
  getDeleteElementModal() {
    return cy.findByRole('dialog', { name: 'Confirm Deletion' })
  }
  //links (and transformed links)
  getSide1Link() {
    return cy.contains('a', 'Side 1')
  }
  getSide1NotALink() {
    return cy.contains('p', 'Side 1')
  }
  getSide2Link() {
    return cy.contains('a', 'Side 2')
  }
  getSide2NotALink() {
    return cy.contains('p', 'Side 2')
  }
  //tooltips and tooltip text
  getTooltip() {
    return cy.findByTestId('popOver')
  }
  getTooltipBanner() {
    return cy.findByRole('banner').should('contain', 'Minimum Sizes for a Full Background:')
  }
  //alerts
  getCopiedContactFirstNameToClipboardAlert() {
    return cy.getAlert({ message: 'Copied ${contact.firstName} to clipboard', close: 'close' })
  }
  //form inputs
  getPositionText() {
    return cy.findByText('Position')
  }
  getXInput() {
    return cy.findByPlaceholderText('x')
  }
  getYInput() {
    return cy.findByPlaceholderText('y')
  }
  getDimensionsText() {
    return cy.findByText('Dimensions')
  }
  getWidthInput() {
    return cy.findByPlaceholderText('width')
  }
  getHeightInput() {
    return cy.findByPlaceholderText('height')
  }
  getDrawMode() {
    return cy.contains('div', 'Draw Mode').find('select')
  }
  getHandwritingFont() {
    cy.findByText('Handwriting Font')
    return cy.get('[name="handwritingName"]').eq(0)
  }
  getSystemFont() {
    cy.findByText('System Font')
    return cy.get('[name="handwritingName"]').eq(1)
  }
  getHorizontal() {
    cy.findByText('Horizontal')
    return cy.get('[name="horizontalAlignment"]')
  }
  getVertical() {
    cy.findByText('Vertical')
    return cy.get('[name="verticalAlignment"]')
  }
  getPenColor() {
    return cy.findByText('Pen Color')
  }
  getTextElement() {
    return cy.contains('div', 'Text')
  }
  getUserMessageElement() {
    return cy.contains('div', 'User Message')
  }
  getQRCodeElement() {
    return cy.contains('div', 'QR Code')
  }
  getLogoElement() {
    return cy.contains('div', 'Logo')
  }
  getBorderElement() {
    return cy.contains('div', 'Border')
  }
  getSizeSlider() {
    return cy.findAllByRole('slider').eq(0)
  }
  getSpacingSlider() {
    return cy.findAllByRole('slider').eq(1)
  }
  getRandomOffest() {
    cy.findByText('Random Offset')
    return cy.get('[name="randomLeftOffset"]')
  }
  getSizeToFit() {
    cy.findByText(/Size To Fit/i)
    return cy.get('[name="sizeToFit"]')
  }
  getURL() {
    return cy.contains('div', 'URL').find('input')
  }
  getThicknessSlider() {
    return cy.findByRole('slider')
  }
  //text elements
  getMediaPanelHeader() {
    return cy.findByText(
      'Drag and drop any asset below to the template design to add it to your postal.'
    )
  }
  getNoneSelectedHeader() {
    return cy.findByText('No Element Selected')
  }
  getUSPSBlock() {
    return cy.findByText('Usps Block')
  }
  getImportImages() {
    return cy.findByText('Images')
  }
  getExampleofVariables() {
    return cy.findByText('Example usage in text')
  }
  getExampleVariablesTextBox() {
    return cy.findByRole('textbox')
  }
  getContactsFirstNameVariable() {
    return cy.findByText(`Contact's First Name`)
  }
  //upNum is order in which assets were uploaded, 0=1
  getNewAsset(upNum: number) {
    return cy.findByTestId(`Assets_Uploaded${upNum}`)
  }
  getLayersPanelHeader() {
    return cy.findByText('Top')
  }
  //text
  getAssetArray() {
    return ['Text', 'User Message', 'Border', 'QR Code', 'Logo']
  }
  dropzoneTestId() {
    return 'Assets_Dropzone'
  }
  inputNames() {
    return ['x', 'y', 'width', 'height']
  }
}
