import { devices } from '@playwright/test'
import config from './pw.config.shared'
export default {
  ...config,
  reporter: [['@currents/playwright']],
  projects: [
    {
      name: 'Vendor_Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}
