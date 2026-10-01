import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';
export async function executeGraphQL<TResult, TVariables extends Record<string, unknown>>(
  endpoint: string,
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: print(document), variables }),
    credentials: 'include',
  });
  const result = (await response.json()) as { data?: TResult; errors?: { message: string }[] };
  if (!response.ok || result.errors || !result.data)
    throw new Error('دریافت اطلاعات انجام نشد. دوباره تلاش کنید.');
  return result.data;
}
