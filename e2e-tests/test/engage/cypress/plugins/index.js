/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const execa = require('execa')
const { rmdir } = require('fs')

const findBrowser = () => {
  const browserPath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
  return execa(browserPath, ['--version']).then((result) => {
    const [, version] = /Brave Browser (\d+\.\d+\.\d+\.\d+)/.exec(result.stdout)
    const majorVersion = parseInt(version.split('.')[0])
    return {
      name: 'brave',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Brave',
      version,
      path: browserPath,
      majorVersion,
    }
  })
}

module.exports = (on, config) => {
  on('task', {
    deleteFolder(folderName) {
      console.log('deleting folder %s', folderName)

      return new Promise((resolve, reject) => {
        rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
          if (err) {
            console.error(err)

            return reject(err)
          }

          resolve(null)
        })
      })
    },
  })
  return findBrowser()
    .then((browser) => {
      return { browsers: config.browsers.concat(browser) }
    })
    .catch(() => {
      return {}
    })
}
