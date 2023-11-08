import { test } from '@playwright/test'
import { Events, SignUpIn } from './support/pageObjects'
let user: any

test.beforeEach(async ({ page }) => {
  const signupin = new SignUpIn(page)
  await signupin.a_new_user_is_generated_and_logged_into_the_Enagage_app(page).then((res) => {
    user = res
  })
})

test.describe('Functionality of events', async () => {
  test('Verifies event information is displayed correctly', async ({ page }) => {
    const events = new Events(page)
    //Given
    await events.theUserIsOnTheEventsMarketplacePage(page)
    await events.theUserHasNoEventsScheduled(page)
    //When
    await events.clickOnSuperDuperFunEvent(page)
    //Then
    await events.eventInformationIsDisplayed(page)
    await events.eventVariantsExist(page)
    await events.eventFormIsFilledOutPartially(user)
  })
  test('Test booking an event with both host fee and per attendee fee', async ({ page }) => {
    const events = new Events(page)
    //Given
    await events.theUserIsOnTheEventsMarketplacePage(page)
    await events.theUserHasNoEventsScheduled(page)
    //When
    await events.clickOnSuperDuperFunEvent(page)
    await events.fillOutEventForm(user)
    await events.selectVariant(page, 4)
    //Then
    await events.checkEstimatedCost('12.50')
    //When
    await events.setNumberOfParticipants(0)
    //Then
    await events.checkEstimatedCost('10.00')
    await events.cannotBookEventWithInvalidNumParticipants()
    //When
    await events.setNumberOfParticipants(11)
    //Then
    await events.checkEstimatedCost('12.75')
    await events.bookEventOpensSuccessModal(page)
    await events.justBookedEventPageIsVisible(page)
    await events.variantPriceIsExpected(page, '0.25')
    //When
    await events.theUserIsOnMyEventsPage(page)
    await events.clickOnSuperDuperFunEvent(page)
    //Then
    await events.justBookedEventPageIsVisible(page)
    await events.variantPriceIsExpected(page, '0.25')
  })
})
