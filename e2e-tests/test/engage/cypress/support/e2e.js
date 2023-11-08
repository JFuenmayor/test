// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:

import { configure } from '@testing-library/cypress'

configure({
  getElementError(message, container) {
    const error = new Error([message, container.tagName].filter(Boolean).join('\n\n'))
    error.name = 'TestingLibraryElementError'
    return error
  },
})

import '@testing-library/cypress/add-commands'
import 'cypress-fill-command'
import 'cypress-real-events/support'
import './api'
import './commands'
import './components'
import './helpers/approve-event'
import './helpers/current-user'
import './helpers/login'
import './helpers/signup'
import './postalSendMachine/addApprovedPostalUserMessage'
import './postalSendMachine/addVariant'
import './postalSendMachine/createChipotlePostal'
import './programmaticActions/addContactToCampaign'
import './programmaticActions/addToFavorites'
import './programmaticActions/campaignSendNow'
import './programmaticActions/createApprovedPostal'
import './programmaticActions/createApprovedPostcard'
import './programmaticActions/createPostalFulfillments'
import './programmaticActions/inviteSignUp'
import './programmaticActions/passwordChecks'
import './programmaticActions/programaticLogin'
import './programmaticActions/programaticSignup'
import './rolesAndInvites/admin'
import './rolesAndInvites/api/addProductAccess'
import './rolesAndInvites/api/createAContact'
import './rolesAndInvites/api/createAMessage'
import './rolesAndInvites/api/rolesBefore'
import './rolesAndInvites/api/sendAPostal'
import './rolesAndInvites/api/setupForTeamAdmin'
import './rolesAndInvites/crud/crudCollections'
import './rolesAndInvites/crud/crudContacts'
import './rolesAndInvites/crud/crudDraftOrder'
import './rolesAndInvites/crud/createEmailOrder'
import './rolesAndInvites/crud/crudEvents'
import './rolesAndInvites/crud/crudMagicLinks'
import './rolesAndInvites/crud/crudMessages'
import './rolesAndInvites/crud/crudPostals'
import './rolesAndInvites/crud/crudSubscriptions'
import './rolesAndInvites/crud/crudUsers'
import './rolesAndInvites/manager'
import './rolesAndInvites/managerAdmin'
import './rolesAndInvites/uam'
import './rolesAndInvites/user'
import './rolesAndInvites/userAdmin'
import './rolesAndInvites/userManager'
import './seeds/campaignsSeed'
import './seeds/collectionsSeed'
import './seeds/contactsSeed'
import './seeds/nonRandomContactsSeed'
import './seeds/invitesSeed'
import './seeds/magiclinksSeed'
import './seeds/messagesSeed'
import './seeds/subscriptionsSeed'
import './seeds/teamsSeed'
import './seeds/usersSeed'
import './stubs'

require('cy-verify-downloads').addCustomCommand()
require('cypress-cloud/support')

Cypress.on('uncaught:exception', (err) => {
  Cypress.log({ messgae: `🔥 UNCAUGHT EXCEPTION: ${err.message}` })
  // returning false here prevents Cypress from failing the test
  return false
})

// https://github.com/cypress-io/cypress/issues/8525
afterEach(() => {
  cy.window().then((win) => {
    if (typeof win.gc === 'function') {
      win.gc()
      win.gc()
    }
  })
})
