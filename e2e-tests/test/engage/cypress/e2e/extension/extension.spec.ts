import { onlyOn } from '@cypress/skip-test'
import {
  CampaignStatus,
  CreateApprovedPostalDocument,
  CreateCampaignDocument,
  CreateTagDocument,
  MeetingRequestSetting,
  SearchContactsV2Document,
  SearchMarketplaceProductsDocument,
  Status,
  UpdateSelfDocument,
} from '../../support/api'
import { userFactory } from '../../support/factories'
import {
  Billing,
  Contacts,
  Delivery,
  Extension,
  MagicLinks,
  Marketplace,
  SendItem,
  Universal,
} from '../../support/pageObjects'
onlyOn(Cypress.env('testUrl'), () => {
  describe('Extension - Contacts suite', () => {
    const universal = new Universal()
    const extension = new Extension()
    const marketplace = new Marketplace()
    const sendItem = new SendItem()
    const magicLinks = new MagicLinks()
    const contacts = new Contacts()
    const delivery = new Delivery()
    const billing = new Billing()
    const user = userFactory()
    const newContact = userFactory()
    let contactOne: any
    let contactTwo: any
    //const dateFormatTable = (date: Date) => date.toLocaleDateString()

    before(() => {
      cy.signup(user)
      cy.graphqlRequest(UpdateSelfDocument, {
        data: {
          meetingSettings: {
            availabilityBlockIcal:
              'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDURATION:PT59M\r\nDTSTART;TZID=America/Los_Angeles:20211102T120000\r\nRRULE:FREQ=WEEKLY;BYDAY=MO\r\nEND:VEVENT\r\nEND:VCALENDAR',
            dateRange: 14,
            enabled: true,
            meetingDurationMins: 30,
            meetingName: 'override wireless',
            meetingRequestDefault: MeetingRequestSetting.No,
          },
        },
      })
      cy.graphqlRequest(CreateTagDocument, { data: { name: 'grapes' } })
      cy.createAContact({ address1: '1306 Ironbark St', tags1: 'grapes' }).then((res) => {
        contactOne = res
      })
      //seeds a contact with a valid address
      cy.createAContact({}).then((res) => {
        contactTwo = res
      })
      cy.createChipotlePostal().then((res) => {
        cy.subscriptionsSeed({
          approvedPostalId: res.id,
          variantId: res.variants?.[0].id ?? '',
          numberOfSubscriptions: 1,
        })
      })
      cy.createApprovedPostcard().then((res) => {
        cy.graphqlRequest(CreateCampaignDocument, {
          data: {
            name: 'extCampaignSecond',
            status: CampaignStatus.Scheduled,
            approvedPostalId: res.id,
            variantId: res.variants?.[0].id,
            giftMessage: '',
            scheduleDate: new Date().toISOString(),
          },
        })
      })
      let products: any
      cy.graphqlRequest(SearchMarketplaceProductsDocument)
        .then((res) => {
          products = res.searchMarketplaceProducts || []
        })
        .then(() => {
          products.map((product: any) => {
            product?.variants?.[0]?.status === 'ACTIVE' &&
              product?.name !== 'Super-duper Fun Event' &&
              product?.name !== 'Postcard' &&
              product?.name !== 'Chipotle' &&
              product?.name !== 'Chipotle UK' &&
              product?.name !== 'Chipotle EU' &&
              cy.graphqlRequest(CreateApprovedPostalDocument, {
                marketplaceProductId: product.id,
                data: {
                  name: product.name,
                  description: product.description,
                  status: Status.Active,
                  items: [
                    { variant: product.variants[0].id ?? '', marketplaceProductId: product.id },
                  ],
                  version: '2',
                },
              })
          })
        })
    })

    beforeEach(() => {
      cy.filterLocalStorage('postal:contacts:filter')
      cy.filterLocalStorage('postal:filters:contacts')
      cy.intercept('POST', '/engage/api/upload-assets?*').as('uploadAssets')
      cy.intercept('/extension/api/graphql', (req) => {
        if (req.body.operationName === 'searchContactsV2') {
          req.alias = 'searchContactsV2'
        }
        if (req.body.operationName === 'getContact') {
          req.alias = 'getContact'
        }
        if (req.body.operationName === 'me') {
          req.alias = 'me'
        }
        if (req.body.operationName === 'getBudgetRemaining') {
          req.alias = 'getBudgetRemaining'
        }
        if (req.body.operationName === 'getMagicLink') {
          req.alias = 'getMagicLink'
        }
      })
    })

    it('tests contacts on the extension and adds tags', function () {
      cy.loginExtension(user)
      //tests the extension landing page
      extension.visitExtension()
      extension.getNoContactsFoundText()
      //extension.getMagicLinksHeader()
      //extension.getAddMagicLinkIconButton()
      //extension.getNoMagicLinksText()
      extension.getAddAContactButton()
      cy.queryForUpdateRecurse({
        request: SearchContactsV2Document,
        operationName: 'searchContactsV2',
        key: 'resultsSummary',
        value: 2,
        key2: 'totalRecords',
      })
      //tests the extension contacts/email/contactEmail page
      extension.visitExtContactProfileByEmail(contactOne.emailAddress)
      cy.wait('@getBudgetRemaining').then((res) => {
        cy.log(res.response?.body.data.getBudgetRemaining.applicableBudget.budget.amount)
      })
      cy.wait('@me').then((res) => {
        cy.log(res.response?.body.data.me.firstName)
      })
      cy.wait('@searchContactsV2').then((res) => {
        cy.log(res.response?.body.data.searchContactsV2.resultsSummary.totalRecords)
      })
      cy.wait('@getContact').then((res) => {
        cy.log(res.response?.body.data.getContact.firstName)
      })
      universal.getSpinner().should('not.exist')
      //tests a contact that has no orders
      //extension.getDateAddedContactDetail().should('be.visible').should('contain', dateFormatTable(new Date()))
      extension.getItemsContactDetail().should('contain', '0')
      //extension.getCPTContactDetail().should('contain', '$0.00')
      // extension
      //   .getContactLinkByName(`${contactOne.firstName} ${contactOne.lastName}`)
      //   .should('have.attr', 'href', `/contacts/${contactOne.id}`)
      cy.findByText(`${contactOne.title} at ${contactOne.companyName}`)
      //cy.findByText(contactOne.emailAddress)
      //cy.findByText(`(${contactOne.ownerLink.fullName})`)
      // extension.getMagicLinksCard().within(() => {
      //   extension.getMagicLinksLink().should('have.attr', 'href', `/links`)
      //   extension.getNoMagicLinksText().should('be.visible')
      //   extension.getAddMagicLinkIconButton().should('be.visible')
      // })
      extension.getRecentActivityCard().should('exist')
      extension.getNoItemsText().should('exist')
      // extension.getCampaignsCard().within(() => {
      //   extension.getNoCampaignsText()
      //   extension.getCampaignsLink().should('have.attr', 'href', `/campaigns`)
      // })
      // extension.getSubscriptionsCard().within(() => {
      //   extension.getNoSubscriptionsText()
      //   extension.getSubscriptionsLink().should('have.attr', 'href', `/subscriptions`)
      // })
      //adds the contact to a newly created List
      // extension.getListsCard().within(() => {
      //   extension.getNoListsText()
      //   extension.getListsLink().should('have.attr', 'href', `/contacts`)
      //   extension.getEditListsButton().click({ force: true })
      // })
      // extension.getContactsListDrawer().within(() => {
      //   universal.getCloseButtonByLabelText().should('be.visible')
      //   extension.getCreateANewListInput().fill('Extension Created')
      //   extension.getCreateListButton().should('be.visible').click()
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getListsCard().within(() => {
      //   cy.contains('Extension Created')
      //   //tests removing the contact from the list
      //   extension.getEditListsButton().click()
      // })
      // extension.getContactsListDrawer().within(() => {
      //   universal.getCloseButtonByLabelText().should('be.visible')
      //   extension.getCreateListButton().should('be.visible')
      //   extension.getListCheckboxByName('Extension Created').uncheck({ force: true })
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getListsCard().within(() => {
      //   extension.getNoListsText().should('be.visible')
      // })
      //tests removing a tag from a contact
      // extension.getTagsCard().within(() => {
      //   cy.contains('grapes')
      //   extension.getEditTagsButton().click()
      // })
      // extension
      //   .getContacTagsDrawer()
      //   .should('be.visible')
      //   .within(() => {
      //     extension.getCreateTagButton().should('be.visible')
      //     extension.getTagCheckboxByName('grapes').uncheck({ force: true }).should('not.be.checked')
      //     universal.clickCloseButtonInFooter()
      //   })
      // extension.getTagsCard().within(() => {
      //   //extension.getNoTagsText().should('be.visible')
      // })
      // //tests adding a contact to a campaign and removing it
      // extension.getCampaignsCard().within(() => {
      //   extension.getNoCampaignsText()
      //   extension.getEditCampaignsButton().click({ force: true })
      // })
      // extension
      //   .getUpcomingCampaignsDrawer()
      //   .should('be.visible')
      //   .within(() => {
      //     universal.getCloseButtonByLabelText().should('be.visible')
      //     extension.getCreateCampaignButton().should('be.visible')
      //     extension.getCampaignCheckboxByName('extCampaignSecond').check({ force: true }).should('be.checked')
      //   })
      // extension.getContactAddedAlert()
      // extension.getUpcomingCampaignsDrawer().within(() => {
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getUpcomingCampaignsDrawer().should('not.exist')
      // extension.getCampaignsCard().within(() => {
      //   cy.contains('extCampaignSecond')
      //   extension.getEditCampaignsButton().click({ force: true })
      // })
      // extension
      //   .getUpcomingCampaignsDrawer()
      //   .should('be.visible')
      //   .within(() => {
      //     extension.getCreateCampaignButton().should('be.visible')
      //     extension.getCampaignCheckboxByName('extCampaignSecond').uncheck({ force: true }).should('not.be.checked')
      //     universal.clickCloseButtonInFooter()
      //   })
      // extension.getContactRemovedAlert()
      // extension.getUpcomingCampaignsDrawer().should('not.exist')
      // extension.getCampaignsCard().within(() => {
      //   extension.getNoCampaignsText()
      // })
      //creates a new magicLink
      extension.getAddMagicLinkIconButton().click()
      cy.contains('No results').should('exist')
      cy.contains('Create a MagicLink').click()
      // tests filtering by multiple categories
      // sidePanel.selectFilter('Categories', 'Books')
      // sidePanel.waitForFilters()
      // marketplace.getBookButton().should('exist')
      // marketplace.getNewPostalByName('Tolosa Winery').should('not.exist')
      // sidePanel.selectFilter('Categories', 'Drink')
      // sidePanel.waitForFilters()
      // marketplace.getBookButton().should('exist')
      // marketplace.getNewPostalByName('Tolosa Winery').should('exist')
      // cy.findAllByTestId(`SidePanelFilter-Categories`).should('contain', 'Drink').and('contain', 'Books')
      // subNavbar.getLeft().within(() => {
      //   subNavbar.getAllFilterTags().should('have.length', 2).and('contain', 'Drink').and('contain', 'Books')
      // })
      // subNavbar.getClearAllFilters().click()
      // sidePanel.waitForFilters()
      cy.wait(1000)
      marketplace.getChipotleButton().should('be.visible').click({ force: true })
      cy.wait(500)
      sendItem.getLandingPageMessageInput().should('exist').fill('Chipotle Landing Page Message')
      //tests Send As Options and selecting owner
      sendItem
        .getSendAsSelect()
        .should('have.value', 'Self')
        //.select('ContactOwner')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['Self', 'User'])
        })
      //tests Meeting Requests Options
      sendItem
        .getCustomizeMeetingRequestSelect()
        .should('have.value', 'NO')
        .select('REQUIRE_BEFORE')
        .find('option')
        .then((options: any) => {
          const actual = [...options].map((option) => option.value)
          expect(actual).to.deep.eq(['NO', 'REQUIRE_BEFORE', 'ASK_AFTER'])
        })
      //tests that shipping price displays
      cy.contains('a', '$5').click()
      cy.findByTestId('PostalVariantOption_card_selected').should('contain', 'FREE Shipping')
      sendItem.getExtensionNextButton().click()
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns(win.prompt)
      })
      magicLinks.getSaveMagicLinkButton().should('not.have.attr', 'data-loading')
      //cy.findByText(`MagicLink ${dateFormatTable(new Date())}`).should('be.visible')
      //sendItem.getSendAsInfo().should('contain', 'Contact Owner')
      sendItem.getReviewMeetingRequest().should('contain', 'Require Before')
      magicLinks.getSaveMagicLinkButton().click({ force: true })
      cy.contains('Adding funds to your account allows you to order and send items').should(
        'be.visible'
      )
      cy.contains(4242, { timeout: 99000 }).should('exist')
      cy.findAllByPlaceholderText('1000.00').fill('300')
      billing.getAddFundsButton().should('not.be.disabled').click()
      universal.getConfirmButton().click()
      cy.contains('Save and Send').should('not.be.disabled').click()
      universal.getThingSpinner().should('not.exist')
      cy.contains('section', 'Confirm Send').within(() => {
        cy.contains('button', 'Create MagicLink').click({ force: true })
      })
      cy.contains('Create a MagicLink').should('exist')
      cy.contains('No results').should('not.exist')
      cy.contains('Loading').should('not.exist')
      cy.contains('Chipotle').should('exist')
      //tests that the new magicLink made to to the extension landing page
      // extension.visitExtension()
      // universal.getSpinner().should('not.exist')
      // extension.getMagicLinksCard().within(() => {
      //   extension.getListedMagicLinkByName(`MagicLink ${dateFormatTable(new Date())}`).should('be.visible')
      //   extension.getCopyLinkText().should('be.visible')
      // })
      //test navigating to the contact with a valid address with the contact id url
      extension.vistExtContactProfileByID(contactTwo.id)
      universal.getSpinner().should('not.exist')
      //extension.getDateAddedContactDetail().should('contain', dateFormatTable(new Date()))
      cy.findByText(`${contactTwo.firstName} ${contactTwo.lastName}`).should('exist')
      //.should('have.attr', 'href', `/contacts/${contactTwo.id}`)
      cy.findByText(`${contactTwo.title} at ${contactTwo.companyName}`)
      //cy.findByText(contactTwo.emailAddress)
      //cy.findByText(`(${contactTwo.ownerLink.fullName})`)

      //tests that the magic link created in the previous profile is here
      // extension.getMagicLinksCard().within(() => {
      //   extension.getListedMagicLinkByName(`MagicLink ${dateFormatTable(new Date())}`).should('be.visible')
      //   extension.getCopyLinkText().should('be.visible')
      // })
      //tests sending two chipotle postals
      extension.getSendAnItemIconButton().click()
      marketplace.getChipotleButton().should('be.visible').click()
      cy.contains('button', 'Next').should('be.visible').click()
      sendItem.getGiftEmailMessageInput().should('be.visible').fill('Chipotle gift email message')
      //tests leaving meeting request as its default, tooltip and tooltip text
      cy.contains('Preview').should('be.visible')
      cy.wait(4000)
      sendItem.getMeetingRequestTooltip().scrollIntoView().realHover()
      sendItem.getMeetingRequestTooltipText().should('be.visible')
      //tests leaving send as as its self default, tooltip and tooltip text
      sendItem.getSendAsTooltip().realHover()
      sendItem.getSendAsTooltipText().should('be.visible')
      sendItem.getExtensionNextButton().click()
      //test meeting request - no default and that send as info is hidden when self
      sendItem.getReviewMeetingRequest().should('contain', 'No')
      sendItem.getSendAsInfo().should('not.exist')
      //tests sending another chipotle card
      extension.vistExtContactProfileByID(contactTwo.id)
      extension.getSendAnItemIconButton().click()
      marketplace.getChipotleButton().should('be.visible').click()
      cy.contains('button', 'Next').should('be.visible').click()
      sendItem.getGiftEmailMessageInput().should('be.visible').fill('Chipotle gift email message')
      //tests setting send as to user
      sendItem.getSendAsSelect().select('User')
      cy.selectAutoCompleteUser(`${user.firstName}`)
      //tests setting MeetingReques to ASK_AFTER
      sendItem.getCustomizeMeetingRequestSelect().select('ASK_AFTER')
      sendItem.getExtensionNextButton().click()
      //test that send as and meeting request info is displayed correctly in the review screen
      sendItem.getCustomizeMeetingRequestSelect().should('not.exist')
      sendItem.getSendAsInfo().should('contain', `${user.firstName} ${user.lastName}`)
      sendItem.getReviewMeetingRequest().should('contain', 'Ask After')
      cy.contains('Item Costs').should('exist')
      sendItem.getSaveAndSendButton().click()
      sendItem.getConfirmSendModal().within(() => {
        sendItem.getSendButton().click({ force: true })
      })
      extension.getItemOrderedAlert()
      sendItem.getReviewDrawer().should('not.exist')
      extension.getSendAnItemIconButton().should('be.visible').click()
      marketplace.getPostcardButton().should('be.visible').click()
      cy.contains('button', 'Next').should('be.visible').click()
      sendItem.getExtensionNextButton().click()
      cy.contains('Item Costs').should('be.visible')
      sendItem.getSaveAndSendButton().should('be.visible').click()
      sendItem.getConfirmSendModal().within(() => {
        sendItem.getSendButton().click({ force: true })
      })
      sendItem.getReviewDrawer().should('not.exist')

      //tests adding a tag to a contact
      // extension.getTagsCard().within(() => {
      //   extension.getNoTagsText().should('be.visible')
      //   extension.getEditTagsButton().click()
      // })
      // extension.getContacTagsDrawer().within(() => {
      //   extension.getCreateTagButton().should('be.visible')
      //   extension.getCreateANewTagInput().fill('newTag')
      //   extension.getCreateTagButton().click()
      //   extension.getTagCheckboxByName('newTag').should('be.checked')
      //   extension.getTagCheckboxByName('grapes').check({ force: true })
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getTagsCard().should('contain', 'grapes')
    })

    it('tests that the sent postals are reflected in Recent Activity, lists, etc', function () {
      cy.loginExtension(user)
      // extension.vistExtContactProfileByID(contactTwo.id)
      // universal.getSpinner().should('not.exist')
      //adds a contact to a list to test that it makes it into the postal site
      // extension.getListsCard().within(() => {
      //   extension.getNoListsText().should('be.visible')
      //   extension.getEditListsButton().click()
      // })
      // extension.getContactsListDrawer().within(() => {
      //   extension.getCreateListButton().should('be.visible')
      //   extension.getContactCheckboxByName('Extension Created').check({ force: true })
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getListsCard().should('contain', 'Extension Created')
      //adds a contact to a campaign to test that it makes it into the postal site
      // extension.getCampaignsCard().within(() => {
      //   extension.getNoCampaignsText()
      //   extension.getEditCampaignsButton().click({ force: true })
      // })
      // extension.getUpcomingCampaignsDrawer().within(() => {
      //   extension.getCreateCampaignButton().should('be.visible')
      //   extension.getCampaignCheckboxByName('extCampaignSecond').check({ force: true }).should('be.checked')
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getUpcomingCampaignsDrawer().should('not.exist')
      // extension.getCampaignsCard().should('contain', 'extCampaignSecond')
      //tests that this contact can be added to the seeded playbook
      // extension.getSubscriptionsCard().within(() => {
      //   extension.getEditPlaybooksButton().click()
      // })
      // extension.getPlaybooksDrawer().within(() => {
      //   extension.getSearchPlaybooksIcon().should('be.visible')
      //   extension.getPlaybookCheckboxByName('Subscription One').check({ force: true }).should('be.checked')
      //   universal.clickCloseButtonInFooter()
      // })
      // extension.getSubscriptionsCard().within(() => {
      //   extension.getListedPlaybookByName('Subscription One').should('be.visible')
      // })
      // tests creating a new contact via the extension
      extension.visitExtension()
      universal.getSpinner().should('not.exist')
      extension.getAddAContactButton().should('be.visible')
      extension.getFirstNameInput().fill(newContact.firstName)
      extension.getLastNameInput().fill(newContact.lastName)
      extension.getEmailInput().fill(newContact.userName)
      extension.getTitleInput().fill(newContact.title || '')
      extension.getCompanyInput().fill(newContact.company)
      extension.getAddAContactButton().click({ force: true })
      cy.url().should('contain', '/extension/contacts/')
      cy.findByText(`${newContact.firstName} ${newContact.lastName}`)
      cy.findByText(`${newContact.title} at ${newContact.company}` || '')
      extension.getRecentActivityCard().should('exist')
      extension.getNoItemsText().should('exist')
      //tests Recent Activity (only that the correct number of items are listed since this pretty unstable)
      extension.vistExtContactProfileByID(contactTwo.id)
      extension.getRecentActivityCard().should('exist')
      cy.contains('Chipotle').should('exist')
      cy.contains('Postcard').should('exist')

      //tests that accepting a magicLink updates Recent Activity in the extension
      extension.getAddMagicLinkIconButton().click()
      cy.url().should('contain', '/extension/magiclinks')
      cy.wait(500)

      cy.contains('Chipotle').click({ force: true })
      cy.wait(500)

      cy.window().then((win) => {
        //@ts-ignore
        cy.stub(win, 'prompt').returns(win.prompt).as('copyToClipboardPrompt')
      })
      cy.contains('button', 'Share URL').scrollIntoView()
      cy.contains('button', 'Share URL').should('be.visible')
      cy.contains('button', 'Share URL').click({ force: true })
      cy.get('@copyToClipboardPrompt').should('be.called')

      cy.wait('@getMagicLink').then((res) => {
        delivery.visit(res.response?.body.data.getMagicLink.linkUrl)
      })

      delivery.getFirstNameInput().fill(newContact.firstName)
      delivery.getLastNameInput().should('be.visible').fill(newContact.lastName)
      delivery.getEmailInput().fill(newContact.userName)
      delivery.getSubmitButton().click({ force: true })
      delivery.getSayThanksForm().should('exist')
      //tests that accepted magiclink makes it into the extension
      extension.visitExtContactProfileByEmail(newContact.userName)
      universal.getSpinner().should('not.exist')
      cy.findByText(`${newContact.firstName} ${newContact.lastName}`)
      cy.findByText(`${newContact.title} at ${newContact.company}` || '')
      extension.getRecentActivityCard().should('exist')
      extension.getNoItemsText().should('not.exist')
      cy.contains('Chipotle').should('exist')
      cy.contains('MagicLink').should('exist')
      cy.contains('Processing').should('exist')
    })

    it('tests that everything created in the extension shows up in the postal app', function () {
      cy.login(user)
      contacts.visitContacts()
      cy.url().should('not.contain', 'extension')
      universal.getLinkByText(`${newContact.firstName} ${newContact.lastName}`).click()
      //tests that the manually created contact in the extension's info has made it into the app
      cy.contains(`${newContact.firstName} ${newContact.lastName}`)
      cy.findByText(newContact.title || '').should('be.visible')
      cy.findByText(newContact.company)
      cy.findByText(newContact.userName)
      contacts.visitContacts()
      //tests that the new list appears in the app
      // contacts.getSavedListsCard().within(() => {
      //   contacts.getSavedListByName('Extension Created').click()
      // })
      universal.progressBarZero()
      cy.contains(`${contactTwo.firstName} ${contactTwo.lastName}`).should('be.visible')
      cy.contains(`${contactOne.firstName} ${contactOne.lastName}`).should('exist')
      //contacts.getAllContactsLink().click()
      //tests that the additions made to the contact with the valid address has made it into the app
      universal.getLinkByText(`${contactTwo.firstName} ${contactTwo.lastName}`).click()
      // .within(() => {
      //   cy.findByText('grapes')
      //   cy.findByText('newTag')
      //   cy.contains(/^1$/)
      //   cy.get('a').click()
      // })
      universal.getSpinner().should('not.exist')
      //contacts.getOrdersSection().within(() => {
      cy.findByText('Chipotle').should('exist')
      // })
      //tests adding the contact to the campaign came through
      //contacts.getCampaignsSection().should('contain', 'extCampaignSecond')
      //tests adding the contact to the playbook came through
      //contacts.getPlaybooksSection().should('contain', 'Subscription One')
      //tests that the magiclink created manually through the extension appears
      magicLinks.visitMagicLinks()
      universal.getSpinner().should('not.exist')
      universal.getRowByText('Chipotle').within(() => {
        cy.contains(`${user.firstName} ${user.lastName}`)
        cy.contains(`${user.company}`)
        //cy.contains(`1/1`)
      })
      universal.getLinkByText('Chipotle').click()
      cy.contains('Processing').should('exist')
    })
  })
})
