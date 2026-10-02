'use client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
export class AuthRequestError extends Error {
  constructor(
    message: string,
    public code = 'SERVICE_UNAVAILABLE',
    public retryAfter = 0,
  ) {
    super(message);
  }
}
export async function authRequest<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition',
  );
  const operationName =
    operation?.kind === 'OperationDefinition' ? operation.name?.value : undefined;
  const send = async () => {
    let response;
    try {
      response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: operationName, variables }),
        signal: AbortSignal.timeout(16000),
      });
    } catch {
      throw new AuthRequestError('ارتباط برقرار نشد. دوباره تلاش کنید.');
    }
    const result = (await response.json()) as {
      data?: TResult;
      errors?: { message: string; extensions?: { code?: string; retryAfter?: number } }[];
    };
    if (!response.ok || result.errors?.length || !result.data) {
      const error = result.errors?.[0];
      throw new AuthRequestError(
        error?.message ?? 'درخواست انجام نشد. دوباره تلاش کنید.',
        error?.extensions?.code,
        error?.extensions?.retryAfter,
      );
    }
    return result.data;
  };
  // Serialize cookie rotation across tabs; token values never enter JavaScript state.
  return navigator.locks ? navigator.locks.request('behjati-user-session', send) : send();
}
