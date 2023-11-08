import { devices } from '@playwright/test'
import config from './pw.config.shared'
export default {
  ...config,
  reporter: [['@currents/playwright']],
  projects: [
    {
      name: 'Engage_Playwright_Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}
