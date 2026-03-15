import type { TypedDocumentString } from './graphql'
 
export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const graphqlUrl = process.env.GRAPHQL_URL

  if (!graphqlUrl) {
    throw new Error('GRAPHQL_URL is missing. Add it to the environment before calling GraphQL.')
  }

  const authToken = process.env.GRAPHQL_AUTH_TOKEN
  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
 
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
 
  const payload = await response.json() as {
    data?: TResult
    errors?: Array<{ message?: string }>
  }

  if (payload.errors?.length) {
    throw new Error(
      payload.errors
        .map((error) => error.message)
        .filter(Boolean)
        .join('\n') || 'GraphQL returned an unknown error.',
    )
  }

  if (!payload.data) {
    throw new Error('GraphQL response did not include data.')
  }

  return payload.data
}
