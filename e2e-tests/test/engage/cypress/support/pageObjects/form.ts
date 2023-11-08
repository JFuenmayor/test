/*
Information to help build this class out

Form validity API
https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation

Cypress article
https://glebbahmutov.com/blog////////form-validation-in-cypress/
*/
export default class Form {
  checkValidity([$el]: any) {
    return $el.checkValidity()
  }
}
