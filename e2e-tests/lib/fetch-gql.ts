import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { DocumentNode, OperationDefinitionNode } from 'graphql'
import { OperationTypeNode, print, visit } from 'graphql'

interface GraphqlErrorData extends Record<string, any> {
  method?: string
  operationName?: string
  operationType?: string
}

export class GraphqlError extends Error {
  public status
  public data

  constructor(message?: string, status?: number, data?: GraphqlErrorData) {
    super(message || 'Unknown Error')
    this.name = 'GraphqlError'
    this.status = status
    this.data = data
  }
}

interface FetchGqlParams<TData, TVariables> {
  operation: TypedDocumentNode<TData, TVariables>
  variables?: TVariables
  url: URL | string
  authParam?: string
}
export async function fetchGql<TData = any, TVariables = Record<string, any>>({
  operation,
  variables,
  url,
  authParam,
}: FetchGqlParams<TData, TVariables>): Promise<TData> {
  const operationName = getOperationName(operation) ?? ''
  const operationType = getOperationType(operation) ?? ''

  // setup headers
  const headers = new Headers()
  headers.set('content-type', 'application/json')
  if (authParam) headers.set('authorization', `Bearer ${authParam}`)

  let res
  let data

  try {
    // handle query
    const query = print(operation)
    res = await fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify({ operationName, query, variables }, trimString),
    })
    try {
      data = await res.json()
    } catch (error) {
      throw new Error('Unknown Server Error')
    }

    // if not a 20x status code, throw an error
    if (!res.ok) {
      throw new Error(data.errorMessage || data.error || res.statusText)
    }

    // handle graphql errors
    if (data.errors?.length) {
      const firstError = data.errors[0]
      const message = firstError.extensions?.postalMessage || firstError.message
      const status = firstError.extensions?.httpCode || res.status
      throw new GraphqlError(message, status, firstError)
    }

    return data.data
  } catch (err) {
    throw new GraphqlError(err.message, err.status ?? res?.status, {
      url,
      method: 'POST',
      operationName,
      operationType,
      ...err.data,
    })
  }
}

export function getOperationName(query: DocumentNode): string | undefined {
  let operationName
  visit(query, {
    OperationDefinition(node: OperationDefinitionNode) {
      operationName = node.name?.value
    },
  })
  return operationName
}

export function getOperationType(query: DocumentNode): OperationTypeNode | undefined {
  let operation
  visit(query, {
    OperationDefinition(node: OperationDefinitionNode) {
      operation = node.operation
    },
  })
  return operation
}

function trimString(_: string, value: unknown) {
  return typeof value === 'string' ? value.trim() : value
}
