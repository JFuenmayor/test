import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { fetchGql } from './fetch-gql'

export async function fetchGqlAdmin<TData = any, TVariables = Record<string, any>>(
  operation: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<TData> {
  const url = new URL('/e2e-api/admin/graphql', process.env.API_URL)
  return fetchGql({ operation, variables, url, authParam: process.env.AUTH_PARAM })
}
