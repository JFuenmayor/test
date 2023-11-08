import type { FakeUser } from '../factories/user-factory'
import { expect, type Page } from '@playwright/test'

export const signup = async (user: FakeUser, page: Page) => {
  await page.goto('/sign-up')
  await page.getByPlaceholder('First Name').fill(user.firstName)
  await page.getByPlaceholder('Last Name').fill(user.lastName)
  await page.getByPlaceholder('Email Address').fill(user.userName)
  await page.getByPlaceholder('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign Up Now' }).click({ force: true })
  const loading = page.locator('text=Loading...')
  await expect(loading).toHaveCount(0, { timeout: 90000 })
  const url = await page.url()
  await expect(url).toContain('/register')
  await page.locator('div[role="group"]:has-text("Company") >> input').fill(user.company)
  await page.locator('div[role="group"]:has-text("Phone") >> input').fill(user.phoneNumber)
  await page.locator('.chakra-switch__track').click({ force: true })
  const start = page.getByRole('button', { name: 'Start using Postal' })
  await expect(start).not.toBeDisabled()
  await start.click({ force: true })
  await expect(loading).toHaveCount(0, { timeout: 90000 })
  const creating = page.locator('text=Hang tight')
  await expect(creating).toHaveCount(0, { timeout: 90000 })
  const url2 = await page.url()
  await expect(url2).toContain('/items')
}
