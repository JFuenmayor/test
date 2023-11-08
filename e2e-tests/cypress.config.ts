import { defineConfig } from 'cypress'
import currents from 'cypress-cloud/plugin'
const { verifyDownloadTasks } = require('cy-verify-downloads')
const { rmdir } = require('fs')
require('dotenv').config()

export default defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  chromeWebSecurity: false,
  projectId: 'ion42z',
  pageLoadTimeout: 300000,
  responseTimeout: 300000,
  requestTimeout: 300000,
  defaultCommandTimeout: 44000,
  screenshotOnRunFailure: true,
  downloadsFolder: 'test/engage/cypress/downloads',
  fixturesFolder: 'test/engage/cypress/fixtures',
  numTestsKeptInMemory: 5,
  experimentalMemoryManagement: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    baseUser: 'billietest@postal.dev',
    basePassword: 'f34*(16F$f34*(16F$',
    testUrl: 'https://test.postal.dev',
    localHostUrl: 'http://localhost:3000',
    auth_param: process.env.AUTH_PARAM,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on('task', verifyDownloadTasks)
      currents(on, config)
      on('task', {
        deleteFolder(folderName) {
          console.log('deleting folder %s', folderName)

          return new Promise((resolve, reject) => {
            rmdir(folderName, { maxRetries: 10, recursive: true }, (err: any) => {
              if (err) {
                console.error(err)

                return reject(err)
              }

              resolve(null)
            })
          })
        },
      })
      //return require('./test/engage/cypress/plugins/index.js')(on, config)
    },
    //baseUrl: 'https://test.postal.dev',
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/engage/cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: 'test/engage/cypress/support/e2e.js',
  },
})
