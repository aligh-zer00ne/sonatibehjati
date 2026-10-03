'use client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { RefreshUserSessionDocument } from '@/generated/graphql';

let accessToken = '';
let accessExpiresAt = 0;
let queue: Promise<unknown> = Promise.resolve();
export function clearAccessToken() {
  accessToken = '';
  accessExpiresAt = 0;
}
export class AuthRequestError extends Error {
  constructor(
    message: string,
    public code = 'SERVICE_UNAVAILABLE',
    public retryAfter = 0,
  ) {
    super(message);
  }
}
async function send<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition',
  );
  const operationName =
    operation?.kind === 'OperationDefinition' ? operation.name?.value : undefined;
  let response;
  try {
    response = await fetch('/api/auth', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
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
  const data = result.data as TResult & {
    verifyOtp?: { accessToken: string; accessExpiresAt: string };
    refreshToken?: { accessToken: string; accessExpiresAt: string };
  };
  const session = data.verifyOtp ?? data.refreshToken;
  if (session) {
    accessToken = session.accessToken;
    accessExpiresAt = Date.parse(session.accessExpiresAt);
  }
  if (operationName === 'LogoutUser') clearAccessToken();
  return result.data;
}
export async function authRequest<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition',
  );
  const name = operation?.kind === 'OperationDefinition' ? operation.name?.value : undefined;
  const protectedOperation = ![
    'RequestOtp',
    'VerifyOtp',
    'RefreshUserSession',
    'LogoutUser',
  ].includes(name ?? '');
  const run = async () => {
    try {
      if (protectedOperation && (!accessToken || accessExpiresAt <= Date.now() + 15000))
        await send(RefreshUserSessionDocument, {});
      let data;
      try {
        data = await send(document, variables);
      } catch (error) {
        if (
          !protectedOperation ||
          !(error instanceof AuthRequestError) ||
          error.code !== 'UNAUTHENTICATED'
        )
          throw error;
        clearAccessToken();
        await send(RefreshUserSessionDocument, {});
        data = await send(document, variables);
      }
      if (name === 'CurrentUser' && !(data as { me?: unknown }).me) {
        clearAccessToken();
        await send(RefreshUserSessionDocument, {});
        data = await send(document, variables);
      }
      return data;
    } catch (error) {
      if (error instanceof AuthRequestError && error.code === 'UNAUTHENTICATED') {
        clearAccessToken();
        window.dispatchEvent(new Event('behjati-session-expired'));
        if (name === 'CurrentUser') return { me: null } as TResult;
      }
      throw error;
    }
  };
  // Read rotated cookies only after acquiring the cross-tab lock. Tokens stay in memory.
  if (navigator.locks) return navigator.locks.request('behjati-user-session', run);
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
}
