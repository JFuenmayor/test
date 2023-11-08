require('dotenv').config()

module.exports = {
  projectId: process.env.CYPRESS_PROJECT_ID,
  recordKey: process.env.CURRENTS_RECORD_KEY,
  e2e: {
    batchSize: 3,
  },
}
