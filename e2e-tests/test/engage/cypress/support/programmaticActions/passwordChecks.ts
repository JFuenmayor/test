import { SignUpIn } from '../../support/pageObjects'

Cypress.Commands.add('passwordChecks', (userEmailAdd?: string) => {
  const signUpIn = new SignUpIn()
  //tests when password is less than twelve character
  signUpIn.getPasswordInput().fill(`Df)4v`)
  signUpIn.getReenterPasswordInput().fill(`Df)4v`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'notChecked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getContinueButton().should('be.disabled')

  //tests when password does not have upper case letters
  signUpIn.getPasswordInput().clear().fill(`cf8&b$cf8&b$`)
  signUpIn.getReenterPasswordInput().clear().fill(`cf8&b$cf8&b$`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'notChecked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getContinueButton().should('be.disabled')

  //tests when password does not have lower case letters
  signUpIn.getPasswordInput().clear().fill(`KS6#!UTKS6#!UT`)
  signUpIn.getReenterPasswordInput().clear().fill(`KS6#!UTKS6#!UT`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'notChecked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getContinueButton().should('be.disabled')

  //tests when the password does not contain one number
  signUpIn.getPasswordInput().clear().fill(`lcvBDR@lcvBDR@`)
  signUpIn.getReenterPasswordInput().clear().fill(`lcvBDR@lcvBDR@`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'notChecked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getContinueButton().should('be.disabled')

  //tests when the password does not contain one symbol
  signUpIn.getPasswordInput().clear().fill(`7Ho7vbD77Ho7vbD7`)
  signUpIn.getReenterPasswordInput().clear().fill(`7Ho7vbD77Ho7vbD7`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'notChecked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getContinueButton().should('be.disabled')

  //'tests when the password has three repeating consecutive characters'
  signUpIn.getPasswordInput().clear().fill(`&&&Huffington34Huffington34`)
  signUpIn.getReenterPasswordInput().clear().fill(`&&&Huffington34Huffington34`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'notChecked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getContinueButton().should('be.disabled')

  //tests when the password fields don't match
  signUpIn.getPasswordInput().clear().fill(`#Oe%xzY3~#Oe%xzY3~`)
  signUpIn.getReenterPasswordInput().clear().fill(`#Oe%xzY3+#Oe%xzY3+`)
  signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
  signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
  if (userEmailAdd !== 'forgot') {
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'checked')
  }
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'notChecked')
  signUpIn.getContinueButton().should('be.disabled')

  //tests that when the password fields don't match the field can be changed
  //on the first input to match the second input
  signUpIn.getPasswordInput().clear().fill(`#Oe%xzY3+#Oe%xzY3+`)
  signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')

  if (userEmailAdd !== 'forgot') {
    //tests when the password contains the user's email address
    signUpIn.getPasswordInput().clear()
    signUpIn.getReenterPasswordInput().clear()
    signUpIn.getPasswordInput().fill(`W0w!${userEmailAdd}`)
    signUpIn.getReenterPasswordInput().fill(`W0w!${userEmailAdd}`)
    signUpIn.get12LongRule().should('have.attr', 'data-testid', 'checked')
    signUpIn.getOneUpperRule().should('have.attr', 'data-testid', 'checked')
    signUpIn.getOneLowerRule().should('have.attr', 'data-testid', 'checked')
    signUpIn.getOneNumberRule().should('have.attr', 'data-testid', 'checked')
    signUpIn.getOneSymbolRule().should('have.attr', 'data-testid', 'checked')
    //because email is now generated as a random uuid the following might fail
    //signUpIn.getNoRepeatingRule().should('have.attr', 'data-testid', 'checked')
    signUpIn.getNoEmailRule().should('have.attr', 'data-testid', 'notChecked')
    signUpIn.getPasswordsMatchRule().should('have.attr', 'data-testid', 'checked')
    signUpIn.getContinueButton().should('be.disabled')
  }
})
