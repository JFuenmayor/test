import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import {
  ApprovedPostal,
  CompleteInvitationProps,
  Contact,
  MessageTemplate,
  PostalFulfillment,
} from './api'
import {
  addPhoneNumberProps,
  catchCallsRecurseProps,
  clickCheckboxByRowNumberProps,
  clickCheckboxProps,
  getAlertProps,
  queryForUpdateRecurseProps,
  saveTextProps,
  uploadProps,
} from './commands'
import { FakeUser } from './factories'
import { ApproveEventResponse } from './helpers/approve-event'
import { CurrentUserResponse } from './helpers/current-user'
import { addApprovedPostalUserMessageProps } from './postalSendMachine/addApprovedPostalUserMessage'
import { addVariantProps } from './postalSendMachine/addVariant'
import { createPostalFulfillmentsProps } from './programmaticActions/createPostalFulfillments'
import { inviteSignUpProps } from './programmaticActions/inviteSignUp'
import { seedingAdminProps } from './rolesAndInvites/admin'
import { createAContactProps } from './rolesAndInvites/api/createAContact'
import { createAMessageProps } from './rolesAndInvites/api/createAMessage'
import { sendAPostalProps } from './rolesAndInvites/api/sendAPostal'
import { setupForTeamAdminProps } from './rolesAndInvites/api/setupForTeamAdmin'
import { crudEmailOrderProps } from './rolesAndInvites/crud/createEmailOrder'
import { crudCollectionsProps } from './rolesAndInvites/crud/crudCollections'
import { crudContactsProps } from './rolesAndInvites/crud/crudContacts'
import { crudDraftOrderProps } from './rolesAndInvites/crud/crudDraftOrder'
import { crudEventsProps } from './rolesAndInvites/crud/crudEvents'
import { acceptingMagicLinkProps, crudMagicLinksProps } from './rolesAndInvites/crud/crudMagicLinks'
import { crudMessagesProps } from './rolesAndInvites/crud/crudMessages'
import { crudPostalsProps } from './rolesAndInvites/crud/crudPostals'
import { crudUsersProps } from './rolesAndInvites/crud/crudUsers'
import { seedingManagerProps } from './rolesAndInvites/manager'
import { seedingManagerAdminProps } from './rolesAndInvites/managerAdmin'
import { SeedingUAMResponse } from './rolesAndInvites/uam'
import { seedingUserProps } from './rolesAndInvites/user'
import { seedingUserAdminProps } from './rolesAndInvites/userAdmin'
import { seedingUserManagerProps } from './rolesAndInvites/userManager'
import { campaignsSeedProps } from './seeds/campaignsSeed'
import { createACollectionProps } from './seeds/collectionsSeed'
import { magiclinksSeedProps } from './seeds/magiclinksSeed'
import { nonRandomContactsSeedProps } from './seeds/nonRandomContactsSeed'
import { subscriptionsSeedProps } from './seeds/subscriptionsSeed'
import { usersSeedProps } from './seeds/usersSeed'
import { MockGraphqlProps } from './stubs'

declare global {
  namespace Cypress {
    interface Chainable {
      acceptingMagicLink(args: acceptingMagicLinkProps): Chainable<any>
      addApprovedPostalUserMessage(
        args: addApprovedPostalUserMessageProps
      ): Chainable<ApprovedPostal>
      addContactToCampaignA(): Chainable<any>
      addPhoneNumber(args: addPhoneNumberProps): Chainable<any>
      addToFavorites(id: string): Chainable<any>
      addVariant(args: addVariantProps): Chainable<any>

      authPasswordApi({
        userName,
        password,
      }: {
        userName: string
        password: string
      }): Chainable<any>
      campaignsSeed(args: campaignsSeedProps): Chainable<any>
      campaignSendNow(): Chainable<any>
      catchCallsRecurse(args: catchCallsRecurseProps): Chainable<any>
      clickCheckbox(args: clickCheckboxProps): Chainable<any>
      clickCheckboxByRowNumber(args: clickCheckboxByRowNumberProps): Chainable<any>
      clickToCreateATeam(): Chainable<any>
      completeInvitation(args: CompleteInvitationProps, skipPassword?: boolean): Chainable<any>
      createACollection(args: createACollectionProps): Chainable<any>
      createAContact(args: createAContactProps): Chainable<Contact>
      createAMessage(args: createAMessageProps): Chainable<MessageTemplate>
      createApprovedPostal(args: { name: string }): Chainable<ApprovedPostal>
      createApprovedPostcard(obj?: any): Chainable<ApprovedPostal>
      createChipotlePostal(variantChoice?: number): Chainable<ApprovedPostal>
      createEmailOrder(args: crudEmailOrderProps): Chainable<any>
      contactsSeed(numberOfContacts?: number): Chainable<Contact>
      nonRandomContactsSeed(args: nonRandomContactsSeedProps): Chainable<Contact>
      createPostalFulfillments(
        args: createPostalFulfillmentsProps
      ): Chainable<{ postalFulfillments: PostalFulfillment[]; first: string; last: string }>
      crudContacts(args: crudContactsProps): Chainable<any>
      crudCollections(args: crudCollectionsProps): Chainable<any>
      crudDraftOrder(args: crudDraftOrderProps): Chainable<any>
      crudEvents(args: crudEventsProps): Chainable<any>
      crudMagicLinks(args: crudMagicLinksProps): Chainable<any>
      crudMessages(args: crudMessagesProps): Chainable<any>
      crudPostals(args: crudPostalsProps): Chainable<any>
      crudSubscriptions(itemName: string, admin?: boolean): Chainable<any>
      crudUsers(args: crudUsersProps): Chainable<any>
      fill(text: string): Chainable<any>
      filterLocalStorage(...args: string[]): Chainable<any>
      getAlert(args: getAlertProps): Chainable<any>
      getAutoCompleteValue(dataTestId?: string): Chainable<any>
      getAutoCompleteValues(dataTestId?: string): Chainable<any>
      getAutoCompleteCreatableTagsValues(): Chainable<any>
      getAutoCompleteCreatableValue(dataTestId?: string): Chainable<any>
      getAutoCompleteCreatableValues(dataTestId?: string): Chainable<any>
      getAutoCompleteTagsValues(dataTestId?: string): Chainable<any>
      getAutoCompleteTagsCreatableValues(dataTestId?: string): Chainable<any>
      getRefreshToken(): Chainable<string>
      getAllSelectedVariants(): Chainable<any>
      getAllUnselectedVariants(): Chainable<any>
      getInputValidation(errMessage: string): Chainable<any>
      getToken(): Chainable<string>
      inviteCompleteApi(id: string, firstName: string, lastName: string): Chainable<any>
      inviteInfoApi(id: string): Chainable<any>
      invitesSeed(numberOfInvites?: number): Chainable<any>
      inviteSignUp(args: inviteSignUpProps): Chainable<any>
      keyboardMoveBy(amount: number, direction: string): Chainable<any>
      // new helpers
      approveEvent(eventId: string): Chainable<ApproveEventResponse>
      login(user: FakeUser, newSession?: boolean): Chainable<any>
      loginExtension(user: FakeUser, newSession?: boolean): Chainable<any>
      signup(user: FakeUser): Chainable<any>
      currentUser(): Chainable<CurrentUserResponse>
      currentUserExtension(): Chainable<CurrentUserResponse>
      //

      logUserInfo(user: FakeUser): Chainable<any>
      logToken(): Chainable<any>
      logRefreshToken(): Chainable<any>
      magiclinksSeed(args: magiclinksSeedProps): Chainable<any>
      manageState(): Chainable<any>
      messagesSeed(): Chainable<any>
      passwordChecks(userEmailAdd?: string): Chainable<any>
      subscriptionsSeed(args: subscriptionsSeedProps): Chainable<any>
      programaticLogin({
        userName,
        password,
      }: {
        userName: string
        password: string
      }): Chainable<any>
      programaticSignup(user: FakeUser): Chainable<any>
      restoreLocalStorageCache(): Chainable<any>
      rolesSetupA(user: any): Chainable<any>
      saveLocalStorageCache(): Chainable<any>
      saveSession(session: { token?: string; refreshToken?: string }): Chainable<any>
      saveText(args: saveTextProps): Chainable<any>
      seedingAdmin(args: seedingAdminProps): Chainable<any>
      seedingManager(args: seedingManagerProps): Chainable<any>
      seedingManagerAdmin(args: seedingManagerAdminProps): Chainable<any>
      seedingUAM(accountId: string): Chainable<SeedingUAMResponse>
      seedingUser(args: seedingUserProps): Chainable<any>
      seedingUserAdmin(args: seedingUserAdminProps): Chainable<any>
      seedingUserManager(args: seedingUserManagerProps): Chainable<any>
      selectAutoComplete(selection?: string, dataTestId?: string): Chainable<any>
      selectAutoCompleteCreatable(selection?: string, dataTestId?: string): Chainable<any>
      selectAutoCompleteTransferFromAccount(selection?: string): Chainable<any>
      selectAutoCompleteTransferToAccount(selection?: string): Chainable<any>
      selectAutoCompleteCampaign(selection?: string): Chainable<any>
      selectAutoCompleteContact(selection?: string): Chainable<any>
      selectAutoCompleteItem(selection?: string): Chainable<any>
      selectAutoCompleteCountry(selection?: string): Chainable<any>
      selectAutoCompleteMagicLink(selection?: string): Chainable<any>
      selectAutoCompleteContactListCreatable(selection?: string): Chainable<any>
      selectAutoCompleteState(selection?: string): Chainable<any>
      selectAutoCompleteTags(selection?: string): Chainable<any>
      selectAutoCompleteTagsCreatable(selection?: string): Chainable<any>
      selectAutoCompleteTeam(selection?: string): Chainable<any>
      selectAutoCompleteUser(selection?: string): Chainable<any>
      selectUserRoles(...roles: string[]): Chainable<any>
      sendAPostal(args: sendAPostalProps): Chainable<PostalFulfillment>
      sessionAccessTokenApi(): Chainable<any>
      sessionLogoutApi(): Chainable<any>
      setupForTeamAdmin(args: setupForTeamAdminProps): Chainable<any>
      signupNewApi({
        firstName,
        lastName,
        userName,
        password,
      }: {
        firstName: string
        lastName: string
        userName: string
        password: string
      }): Chainable<any>
      signupPasswordApi(id: string, userName: string): Chainable<any>
      signupVerifyApi(userName: string): Chainable<any>
      teamsSeed(numberOfTeams?: number): Chainable<any>
      upload(args: uploadProps): Chainable<any>
      usersSeed(args: usersSeedProps): Chainable<any>
      verifyDownload(
        text: string,
        options?: { timeout?: number; interval?: number; contains?: boolean }
      ): Chainable<boolean>
      queryForUpdateRecurse(args: queryForUpdateRecurseProps): Chainable<any>
      graphqlRequest<TData = any, TVariables = Record<string, any>>(
        operation: TypedDocumentNode<TData, TVariables>,
        variables?: TVariables,
        options?: Partial<Cypress.RequestOptions>
      ): Chainable<TData>
      fetchGqlAdmin<TData = any, TVariables = Record<string, any>>(
        operation: TypedDocumentNode<TData, TVariables>,
        variables?: TVariables,
        options?: Partial<Cypress.RequestOptions>
      ): Chainable<TData>
      graphqlMockSet({ operationName, count, fixture, response }: MockGraphqlProps): Chainable<any>
      graphqlMockDelete({ operationName }: MockGraphqlProps): Chainable<any>
      graphqlMockClear(): Chainable<any>
      graphqlMockStart(): Chainable<any>
    }
  }
}
