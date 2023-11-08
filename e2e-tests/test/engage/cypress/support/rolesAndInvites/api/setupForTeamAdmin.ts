import { addDays, addWeeks } from 'date-fns'
import {
  BillingAccountsDocument,
  BudgetDuration,
  BudgetMode,
  CreateApprovedPostalDocument,
  CreateTeamDocument,
  Currency,
  SearchMarketplaceProductsDocument,
  Status,
  UpdateApprovedPostalDocument,
} from '../../api'

const teamsIds: any = {}
const weekFromToday = addWeeks(new Date(), 1).toISOString()
const weekNADayFromToday = addWeeks(addDays(new Date(), 1), 1).toISOString()

export interface setupForTeamAdminProps {
  accountId: string
  uamUser: any
}
//creates a second team
Cypress.Commands.add('setupForTeamAdmin', (args: setupForTeamAdminProps) => {
  const accountId = args.accountId
  const uamUser = args.uamUser
  const teamsToCreate = ['secondTeam', 'thirdTeam']
  cy.graphqlRequest(BillingAccountsDocument, { filter: { type: { eq: 'FUNDS' } } }).then((res) => {
    teamsToCreate.forEach((i) => {
      cy.graphqlRequest(CreateTeamDocument, {
        data: {
          name: i,
          department: 'Other',
          settings: {
            billingAccountIds: [
              { billingAccountId: res.billingAccounts?.[0]?.id as string, currency: Currency.Usd },
            ],
            budget: {
              duration: BudgetDuration.Monthly,
              amount: 30000,
              mode: BudgetMode.Pooled,
            },
          },
        },
      }).then((team) => {
        teamsIds[i] = team.createTeam.id
      })
    })
  })
  cy.graphqlRequest(SearchMarketplaceProductsDocument, {
    filter: { name: { eq: 'Notecard' } },
  }).then((res) => {
    cy.graphqlRequest(CreateApprovedPostalDocument, {
      marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id,
      data: {
        name: res.searchMarketplaceProducts?.[0]?.name,
        description: res.searchMarketplaceProducts?.[0]?.description,
        status: Status.Active,
        items: [
          {
            variant: res.searchMarketplaceProducts?.[0]?.variants?.[0]?.id ?? '',
            marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id ?? '',
          },
        ],
        version: '2',
        teamIds: [teamsIds.secondTeam, teamsIds.thirdTeam],
      },
    })
  })
  cy.graphqlRequest(SearchMarketplaceProductsDocument, {
    filter: {
      name: {
        eq: 'Everybody Lies: Big Data, New Data, and What the Internet Can Tell Us About Who We Really Are',
      },
    },
  }).then((res) => {
    cy.graphqlRequest(CreateApprovedPostalDocument, {
      marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id,
      data: {
        name: res.searchMarketplaceProducts?.[0]?.name,
        description: res.searchMarketplaceProducts?.[0]?.description,
        status: Status.Active,
        items: [
          {
            variant: res.searchMarketplaceProducts?.[0]?.variants?.[0]?.id ?? '',
            marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id ?? '',
          },
        ],
        version: '2',
        teamIds: [teamsIds.secondTeam],
      },
    })
  })
  cy.createAMessage({
    accountId,
    obj: {
      name: 'Saved Message For Default Team',
      templateText: 'This was made with with a UAM role, in the default team.',
    },
  })
  cy.createACollection({ collectionName: `Default Team's collection`, numOfItems: 1 }).then(() => {
    cy.createACollection({
      collectionName: ` Multi teams collection`,
      numOfItems: 1,
      teamsIds: [teamsIds.secondTeam, teamsIds.thirdTeam],
    })
  })
  cy.graphqlRequest(SearchMarketplaceProductsDocument, {
    filter: { name: { eq: 'Super-duper Fun Event' } },
  })
    .then((res) => {
      cy.graphqlRequest(CreateApprovedPostalDocument, {
        marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id,
        data: {
          status: Status.Disabled,
          items: [
            {
              variant: res.searchMarketplaceProducts?.[0]?.variants?.[0]?.id ?? '',
              marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id ?? '',
            },
          ],
          version: '2',
          event: {
            requestedAttendeeCount: 10,
            requestedByEmail: uamUser.userName,
            requestedByName: `${uamUser.firstName} ${uamUser.lastName}`,
            requestedByPhone: '769034567',
            requestedByMessage: 'created in the uam role (two teams)',
            requestedDates: [weekFromToday, weekNADayFromToday],
          },
          teamIds: [teamsIds.secondTeam, teamsIds.thirdTeam],
        },
      }).then((event) => {
        cy.approveEvent(event.createApprovedPostal.postal.id)
        cy.graphqlRequest(UpdateApprovedPostalDocument, {
          id: event.createApprovedPostal.postal.id,
          data: {
            status: Status.Active,
            name: 'Two Teams',
            description: 'This is the best event in town!',
            teamIds: [],
            attribution: {},
            event: {
              requestedByName: `${uamUser.firstName} ${uamUser.lastName}`,
              requestedByEmail: uamUser.userName,
              requestedByPhone: '769034567',
              requestedAttendeeCount: 10,
              requestedByMessage: 'created in the uam role (two teams)',
              meetingLink: 'http://www.google.com',
              sendEmailConfirmation: true,
              sendReminderDayBefore: true,
              sendReminderDayOf: true,
              sendCancelledAlert: true,
              sendInviteExpiringAlert: true,
              sendMeetingLinkChanged: true,
            },
          },
        })
      })
      cy.graphqlRequest(CreateApprovedPostalDocument, {
        marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id,
        data: {
          status: Status.Disabled,
          items: [
            {
              variant: res.searchMarketplaceProducts?.[0]?.variants?.[0]?.id ?? '',
              marketplaceProductId: res.searchMarketplaceProducts?.[0]?.id ?? '',
            },
          ],
          version: '2',
          event: {
            requestedAttendeeCount: 10,
            requestedByEmail: uamUser.userName,
            requestedByName: `${uamUser.firstName} ${uamUser.lastName}`,
            requestedByPhone: '769034567',
            requestedByMessage: 'created in the uam role (no teams)',
            requestedDates: [weekFromToday, weekNADayFromToday],
          },
        },
      }).then((event2) => {
        cy.approveEvent(event2.createApprovedPostal.postal.id)
        cy.graphqlRequest(UpdateApprovedPostalDocument, {
          id: event2.createApprovedPostal.postal.id,
          data: {
            status: Status.Active,
            name: 'All Teams',
            description: 'This is the best event in town!',
            teamIds: [],
            attribution: {},
            event: {
              requestedByName: `${uamUser.firstName} ${uamUser.lastName}`,
              requestedByEmail: uamUser.userName,
              requestedByPhone: '769034567',
              requestedAttendeeCount: 10,
              requestedByMessage: 'created in the uam role (no teams)',
              meetingLink: 'http://www.google.com',
              sendEmailConfirmation: true,
              sendReminderDayBefore: true,
              sendReminderDayOf: true,
              sendCancelledAlert: true,
              sendInviteExpiringAlert: true,
              sendMeetingLinkChanged: true,
            },
          },
        })
      })
    })
    .then(() => {
      return teamsIds
    })
})
