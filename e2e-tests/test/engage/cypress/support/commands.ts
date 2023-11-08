// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import { Contacts, Universal } from './pageObjects'
const universal = new Universal()

import '@testing-library/cypress/add-commands'

//specified xhr requests will no longer show up in the command log
// Cypress.Server.defaults({
//   enable: true,
//   delay: 500,
//   force404: false,
//   ignore: (xhr) => {
//     if (
//       xhr.url.includes('printmaker') ||
//       xhr.url.includes('comet') ||
//       xhr.url.includes('session') ||
//       xhr.url.includes('segment')
//     ) {
//       return true
//     }
//   },
// })

export interface uploadProps {
  file: string
  fileName: string
  type: string
  testId: string
  whichDZ?: number
}

Cypress.Commands.add('upload', (args: uploadProps) => {
  const file = args.file
  const fileName = args.fileName
  const type = args.type
  const testId = args.testId
  const whichDZ = args.whichDZ

  cy.window().then((window) => {
    const blob = b64toBlob(file, '', 512)
    const testFile = new window.File([blob], fileName, { type: type })
    if (typeof whichDZ != 'undefined') {
      cy.findAllByTestId(testId)
        .eq(whichDZ)
        .trigger('drop', {
          dataTransfer: { files: [testFile], types: ['Files'], force: true },
          force: true,
        })
    } else {
      cy.findByTestId(testId).trigger('drop', {
        dataTransfer: { files: [testFile], types: ['Files'], force: true },
        force: true,
      })
    }
  })
})

function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

// used in the beforeEach and afterEach to save and pass the local Storage to the following test
// only need in specs that seperate out tests using multiple it blocks or if retries is enabled

let LOCAL_STORAGE_MEMORY = {} as any
let SESSION_STORAGE_MEMORY = {} as any

Cypress.Commands.add('saveLocalStorageCache', () => {
  return cy.window({ log: false }).then((window) => {
    Object.keys(window.localStorage).forEach((key) => {
      LOCAL_STORAGE_MEMORY[key] = localStorage.getItem(key)
    })
    Object.keys(window.sessionStorage).forEach((key) => {
      SESSION_STORAGE_MEMORY[key] = sessionStorage.getItem(key)
    })
  })
})

Cypress.Commands.add('restoreLocalStorageCache', () => {
  return cy.window({ log: false }).then((window) => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
      const value = LOCAL_STORAGE_MEMORY[key]
      if (value) window.localStorage.setItem(key, value)
    })
    Object.keys(SESSION_STORAGE_MEMORY).forEach((key) => {
      const value = SESSION_STORAGE_MEMORY[key]
      if (value) window.sessionStorage.setItem(key, value)
    })
  })
})

Cypress.Commands.add('filterLocalStorage', (...args: string[]) => {
  return cy.window().then((window) => {
    Object.keys(window.localStorage).forEach((key) => {
      args.forEach((prefix) => {
        if (prefix && key.startsWith(prefix)) window.localStorage.removeItem(key)
      })
    })
    Object.keys(window.sessionStorage).forEach((key) => {
      args.forEach((prefix) => {
        if (prefix && key.startsWith(prefix)) window.sessionStorage.removeItem(key)
      })
    })
  })
})

Cypress.Commands.add('manageState', () => {
  const token = localStorage.getItem('postal:refreshToken')
  if (token) {
    cy.visit(`/`, {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
        win.sessionStorage.clear()
        LOCAL_STORAGE_MEMORY = {}
        SESSION_STORAGE_MEMORY = {}
      },
      log: false,
    })
  }
})

Cypress.Commands.add('logUserInfo', (user) => {
  Cypress.log({
    name: 'logUserInfo',
    message: `${user.firstName} ${user.userName}`,
    consoleProps: () => user,
  })
})

export interface clickCheckboxProps {
  name: string
  not?: string
}
Cypress.Commands.add('clickCheckbox', (args: clickCheckboxProps) => {
  const name = args.name
  const not = args.not
  cy.contains('tr', name, { timeout: 40000 }).within(() => {
    cy.findByRole('checkbox').scrollIntoView()
    cy.findByRole('checkbox').click({ force: true })
    if (not) {
      cy.findByRole('checkbox').should('not.be.checked')
    } else {
      cy.findByRole('checkbox').should('be.checked')
    }
  })
})

export interface clickCheckboxByRowNumberProps {
  num: number
  not?: string
}
Cypress.Commands.add('clickCheckboxByRowNumber', (args: clickCheckboxByRowNumberProps) => {
  const num = args.num
  const not = args.not

  universal.getRowByNumber(num).within(() => {
    cy.findByRole('checkbox').scrollIntoView()
    cy.findByRole('checkbox').click({ force: true })
    if (not) {
      cy.findByRole('checkbox').should('not.be.checked')
    } else {
      cy.findByRole('checkbox').should('be.checked')
    }
  })
})

export interface getAlertProps {
  message: string | RegExp
  close?: string
}

Cypress.Commands.add('getAlert', (args: getAlertProps) => {
  const message = args.message
  const close = args.close
  cy.contains('[role="status"]', message, { timeout: 100000 }).within(() => {
    if (close)
      cy.findByLabelText('Close', { timeout: 99000 }).click({
        force: true,
        multiple: true,
      })
  })
  if (close) {
    cy.wait(300)
    cy.contains('[role="status"]', message, { timeout: 50000 }).should('not.exist')
  }
})

export interface saveTextProps {
  rowNumber: number
  element: string
}

Cypress.Commands.add('saveText', (args: saveTextProps) => {
  universal
    .getRowByNumber(args.rowNumber)
    .find(args.element)
    .then(($element) => {
      const txt = $element.text()
      return txt
    })
})
//tests html input validation
Cypress.Commands.add('getInputValidation', { prevSubject: true }, (subject, errMessage: string) => {
  return cy.wrap(subject).then(($input) => {
    expect(($input[0] as any).validationMessage).to.eq(errMessage)
  })
})

//only on contacts
export interface addPhoneNumberProps {
  header: string
  num: number
  phoneNum: string
  type: string
}

Cypress.Commands.add('addPhoneNumber', (args: addPhoneNumberProps) => {
  const num = args.num
  const phoneNum = args.phoneNum
  const type = args.type
  const contacts = new Contacts()

  contacts.getAddAPhoneNumberButton().click({ force: true })
  contacts.getPhoneNumberInputByIdx(num).fill(`${phoneNum}`)
  contacts
    .getPhoneNumberTypeInputByIdx(num)
    .select(`${type}`, { force: true })
    .should('have.value', `${type.toUpperCase()}`)
})

Cypress.Commands.add('getAllUnselectedVariants', () => {
  return cy.findAllByTestId('PostalVariantOption_card_unselected')
})

Cypress.Commands.add('getAllSelectedVariants', () => {
  return cy.findAllByTestId('PostalVariantCard_card_selected')
})

export interface catchCallsRecurseProps {
  operationName: string
  key: string
  value: string | number
  key2?: string
}

Cypress.Commands.add('catchCallsRecurse', (args: catchCallsRecurseProps) => {
  const operationName = args.operationName
  const key = args.key
  const value = args.value
  const key2 = args.key2
  //used in the .then of an intercepted api calls wait command
  cy.wait(`@${operationName}`).then((response) => {
    const data = response.response?.body.data
    if (!key2) {
      if (data[operationName][key] && data[operationName][key] === value) {
        expect(data[operationName][key]).to.eq(value)
      } else {
        cy.catchCallsRecurse({ operationName, key, value })
      }
    } else {
      if (data[operationName][key] && data[operationName][key][key2] === value) {
        expect(data[operationName][key][key2]).to.eq(value)
      } else {
        cy.catchCallsRecurse({ operationName, key, value, key2 })
      }
    }
  })
})

export interface queryForUpdateRecurseProps {
  request: any
  options?: any
  operationName: string
  key: string
  value: number | string
  key2?: string
  key3?: string
  tracker?: number
}

Cypress.Commands.add('queryForUpdateRecurse', (args: queryForUpdateRecurseProps) => {
  const request = args.request
  const options = args.options
  const operationName = args.operationName
  const key = args.key
  const value = args.value
  const key2 = args.key2
  const key3 = args.key3
  const tracker = !args.tracker ? 0 : args.tracker
  cy.graphqlRequest(request, options).then((res) => {
    const generateResponseKeyToTest = (key: string, key2?: string, key3?: string) => {
      if (key && !key2 && !key3) {
        if (res[operationName] !== undefined) {
          return res[operationName][key]
        }
        return undefined
      } else if (key && key2 && !key3) {
        if (res[operationName][key] !== undefined) {
          return res[operationName][key][key2]
        }
        return undefined
      } else if (key && key2 && key3) {
        if (res[operationName][key][key2] !== undefined) {
          return res[operationName][key][key2][key3]
        }
        return undefined
      }
    }
    const responseKeyToTest = generateResponseKeyToTest(key, key2, key3)
    if (responseKeyToTest != value && tracker < 52) {
      const counter = tracker + 1
      cy.wait(900)
      cy.queryForUpdateRecurse({
        request,
        options,
        operationName,
        key,
        value,
        key2,
        key3,
        tracker: counter,
      })
    } else {
      expect(responseKeyToTest).to.eq(value)
    }
  })
})

const Keys = {
  Space: ' ',
}

Cypress.Commands.add(
  'keyboardMoveBy',
  { prevSubject: 'element' },
  (subject, times: number, direction: string) => {
    const arrowKey = `{${direction}arrow}`
    Cypress.log({ $el: subject, name: 'Move' })
    cy.wrap(subject, { log: false }).focus({ log: false })
    cy.wrap(subject, { log: false }).type(Keys.Space, {
      delay: 150,
      scrollBehavior: false,
      force: true,
      log: false,
    })
    cy.wrap(subject, { log: false }).type(arrowKey.repeat(times), {
      scrollBehavior: false,
      delay: 150,
      force: true,
    })
    cy.wait(150)
    cy.wrap(subject, { log: false }).type(Keys.Space, {
      scrollBehavior: false,
      log: false,
      force: true,
    })
  }
)

const isInViewport = (_chai: {
  Assertion: { addMethod: (arg0: string, arg1: (options: any) => void) => void }
}) => {
  function assertIsInViewport(this: any) {
    const subject = this._obj
    /* @ts-ignore */
    const windowHeight = Cypress.$(cy.state('window')).height()
    const bottomOfCurrentViewport = windowHeight
    const rect = subject[0]?.getBoundingClientRect()

    this.assert(
      /* @ts-ignore */
      (rect.top > 0 && rect.top < bottomOfCurrentViewport) ||
        /* @ts-ignore */
        (rect.bottom > 0 && rect.bottom < bottomOfCurrentViewport),
      'expected #{this} to be in viewport',
      'expected #{this} to not be in viewport',
      subject
    )
  }

  _chai.Assertion.addMethod('inViewport', assertIsInViewport)
}

chai.use(isInViewport)
