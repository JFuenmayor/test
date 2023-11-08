import { Locator, Page, expect } from '@playwright/test'
import { addDays, addWeeks, format } from 'date-fns'
import baseURL from '../../../../../playwright.config'
import { FakeUser } from '../factories/user-factory'

const VARIANT_PRICE_ID = 'PostalVariantOption_priceWords_shipping'
const MAX_RETRIES_FOR_RELOAD = 30
const dateFormatInput = (date: Date) => format(date, 'MMMM d, yyyy')
const weekFromToday = dateFormatInput(addWeeks(new Date(), 1))
const weekNADayFromToday = dateFormatInput(addWeeks(addDays(new Date(), 1), 1))

export default class Events {
  readonly myEventsToggle: Locator
  readonly superDuperFunEvent: Locator
  readonly noEventsText: Locator
  readonly variantDropdownButton: Locator
  readonly variant1: Locator
  readonly variant2: Locator
  readonly variant3: Locator
  readonly variant4: Locator
  readonly variantPriceShipping: Locator
  readonly nameField: Locator
  readonly emailField: Locator
  readonly phoneNumberField: Locator
  readonly messageField: Locator
  readonly preferredDateField1: Locator
  readonly preferredDateField2: Locator
  readonly preferredDateField3: Locator
  readonly termsAndConditionsCheckbox: Locator
  readonly spendAsField: Locator
  readonly bookEventButton: Locator
  readonly estimatedAttendees: Locator
  readonly estimatedCost: Locator
  readonly bookedEventModal: Locator
  readonly inactiveEventButton: Locator
  readonly clearFiltersButton: Locator

  constructor(page: Page) {
    this.myEventsToggle = page.getByTestId('ui-subnavbar-left').locator('span').first()
    this.superDuperFunEvent = page.locator(
      `[data-testid="ui-card"]:has-Text("Super-Duper Fun Event")`
    )
    this.noEventsText = page.getByText('You currently have no scheduled Events')
    this.variantDropdownButton = page.getByRole('button', { name: 'Select an option' })
    this.variant1 = page.getByRole('menuitem').nth(0)
    this.variant2 = page.getByRole('menuitem').nth(1)
    this.variant3 = page.getByRole('menuitem').nth(2)
    this.variant4 = page.getByRole('menuitem').nth(3)
    this.variantPriceShipping = page.getByTestId('PostalVariantOption_priceWords_shipping')
    this.nameField = page.getByLabel('Name*')
    this.emailField = page.getByLabel('Email*')
    this.phoneNumberField = page.getByLabel('Phone*')
    this.messageField = page.getByLabel('Message*')
    this.preferredDateField1 = page.getByRole('textbox', { name: 'First choice' })
    this.preferredDateField2 = page.getByRole('textbox', { name: 'Second choice' })
    this.preferredDateField3 = page.getByRole('textbox', { name: 'Third choice' })
    this.termsAndConditionsCheckbox = page
      .locator('label')
      .filter({ hasText: 'I agree to the Postal Events Terms & Conditions' })
      .locator('span')
      .first()
    this.spendAsField = page.getByTestId('AutoCompleteSpendAs')
    this.bookEventButton = page.getByRole('button', { name: 'Book Your Event' })
    this.estimatedAttendees = page.getByTestId('event-estimated-attendees')
    this.estimatedCost = page.getByTestId('event-estimated-cost')
    this.bookedEventModal = page.getByRole('dialog', { name: 'Thanks for reaching out!' })
    this.inactiveEventButton = page.getByRole('button', { name: 'Inactive event' })
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear filters' })
  }
  async theUserIsOnTheEventsMarketplacePage(page: Page) {
    await page.goto(`${baseURL.use?.baseURL}/events/marketplace`)
  }
  async theUserIsOnMyEventsPage(page: Page) {
    await page.goto(`${baseURL.use?.baseURL}/events/postals`)
  }
  async theUserHasNoEventsScheduled(page: Page) {
    await this.myEventsToggle.click()
    await expect(this.noEventsText).toHaveCount(1)
    await this.myEventsToggle.click()
    await expect(this.noEventsText).not.toBeVisible()
  }
  async clickOnSuperDuperFunEvent(page: Page) {
    let count = 0
    while (!(await this.superDuperFunEvent.isVisible()) && count < MAX_RETRIES_FOR_RELOAD) {
      await this.noEventsText.isVisible()
      await page.reload()
      if ((await page.$('text=Clear filters')) !== null) {
        await this.clearFiltersButton.click()
      }
      await page.waitForTimeout(2000)
      count++
    }
    await this.superDuperFunEvent.hover()
    await page.getByText('View this event').click()
  }
  async eventInformationIsDisplayed(page: Page) {
    //Page title
    await expect(
      page.getByText('I am interested in setting up an event with Super-duper Fun Event')
    ).toHaveCount(1)
    //Event title
    await expect(page.getByText('Super-duper Fun Event')).toHaveCount(2)
    //Event description
    await expect(page.getByText('This is the best event in town!')).toHaveCount(1)
    //Event duration
    await expect(page.getByText('90 minutes')).toHaveCount(1)
    //Participant info
    await expect(page.getByText('Up to 100 participantsminimum of 10')).toHaveCount(1)
    //Joining info
    await expect(page.getByText('Join from your computer, phone, or tablet')).toHaveCount(1)
  }
  async eventVariantsExist(page: Page) {
    await this.variantDropdownButton.click()
    await expect(this.variant1).toHaveCount(1)
    await expect(this.variant2).toHaveCount(1)
    await expect(this.variant3).toHaveCount(1)
    await expect(this.variant4).toHaveCount(1)
    await this.variant1.hover()
    await expect(page.getByText('This is the best variant.')).toHaveCount(1)
    await expect(this.variant1.getByTestId(VARIANT_PRICE_ID)).toContainText('per person')
    await expect(this.variant1.getByTestId(VARIANT_PRICE_ID)).not.toContainText('host fee')
    await expect(this.variant2.getByTestId(VARIANT_PRICE_ID)).toContainText('per person')
    await expect(this.variant2.getByTestId(VARIANT_PRICE_ID)).not.toContainText('host fee')
    await expect(this.variant3.getByTestId(VARIANT_PRICE_ID)).toContainText('host fee')
    await expect(this.variant4.getByTestId(VARIANT_PRICE_ID)).toContainText('host fee')
  }
  async eventFormIsFilledOutPartially(user: FakeUser) {
    await expect(this.nameField).toHaveValue(user.firstName + ' ' + user.lastName)
    await expect(this.emailField).toHaveValue(user.userName)
    await expect(this.phoneNumberField).toBeEmpty()
    await expect(this.messageField).toBeEmpty()
    await expect(this.preferredDateField1).toBeEmpty()
    await expect(this.preferredDateField2).toBeEmpty()
    await expect(this.preferredDateField3).toBeEmpty()
    await expect(this.termsAndConditionsCheckbox).not.toBeChecked()
    await expect(this.spendAsField).toContainText('Search Users')
    await expect(this.bookEventButton).toBeDisabled()
  }
  async fillOutEventForm(user: FakeUser) {
    await this.phoneNumberField.fill(user.phoneNumber)
    await this.messageField.fill('Event message')
    await this.preferredDateField1.fill(`${weekFromToday} 9:00 AM`, { force: true })
    await this.preferredDateField1.press('Enter')
    await this.preferredDateField2.fill(`${weekNADayFromToday} 9:00 AM`, { force: true })
    await this.preferredDateField2.press('Enter')
    await expect(this.bookEventButton).toBeDisabled()
    await this.termsAndConditionsCheckbox.check()
    await expect(this.bookEventButton).toBeEnabled()
  }
  async selectVariant(page: Page, index: number) {
    await this.variantDropdownButton.click()
    await page
      .getByRole('menuitem')
      .nth(index - 1)
      .click()
  }
  async checkEstimatedCost(cost: string) {
    await expect(this.estimatedCost.locator('dd')).toHaveText(`$${cost}`)
  }
  async setNumberOfParticipants(num: number) {
    const participantsInput = this.estimatedAttendees.locator('#requestedAttendeeCount')
    await participantsInput.fill(`${num}`)
  }
  async cannotBookEventWithInvalidNumParticipants() {
    await this.bookEventButton.click()
    const participantsInput = this.estimatedAttendees.locator('#requestedAttendeeCount')
    await expect(participantsInput).toBeFocused()
  }
  async bookEventOpensSuccessModal(page: Page) {
    await this.bookEventButton.click()
    await expect(this.bookedEventModal).toHaveCount(1)
    await expect(this.bookedEventModal.getByText('temporary event')).toBeVisible()
    await this.bookedEventModal.getByText('Close').click()
  }
  async justBookedEventPageIsVisible(page: Page) {
    await expect(page.getByText('Super-duper Fun Event')).toHaveCount(2)
    await expect(page.getByText('Selected option')).toHaveCount(1)
    await expect(this.inactiveEventButton).toBeVisible()
    await expect(this.inactiveEventButton).toBeDisabled()
  }
  async variantPriceIsExpected(page: Page, cost: string) {
    await expect(page.getByRole('button').filter({ hasText: 'Variant' }).first()).toContainText(
      `$${cost}`
    )
  }
}
