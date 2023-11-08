import { MeDocument } from '../../../../../../admin-app/app/graphql'
import { userFactory } from '../../support/factories'

describe.skip('Test Helpers', function () {
  const user = userFactory()

  //test start
  it('tests that the signup and me helper works', function () {
    cy.signup(user)
    cy.currentUser().then((me) => {
      expect(me.firstName).to.eq(user.firstName)
      expect(me.lastName).to.eq(user.lastName)
      expect(me.csrfToken).to.exist
    })
  })

  it(`tests the login and me helper works`, function () {
    cy.login(user)
    cy.currentUser().then((me) => {
      expect(me.firstName).to.eq(user.firstName)
      expect(me.lastName).to.eq(user.lastName)
      expect(me.csrfToken).to.exist
    })
  })

  it.only(`tests the admin api helper works`, function () {
    cy.fetchGqlAdmin(MeDocument).then((res) => {
      console.log('res', res.me)
      expect(res.me).to.exist
    })
  })
})
