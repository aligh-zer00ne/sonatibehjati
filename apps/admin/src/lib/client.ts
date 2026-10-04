import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';
import { AdminRefreshDocument } from '../generated/graphql';
let accessToken = '';
let expiresAt = 0;
let queue: Promise<unknown> = Promise.resolve();
export function clearAdminAccess() {
  accessToken = '';
  expiresAt = 0;
}
export class AdminRequestError extends Error {
  constructor(
    message: string,
    public code = 'SERVICE_UNAVAILABLE',
  ) {
    super(message);
  }
}
async function send<T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V,
): Promise<T> {
  let response;
  try {
    response = await fetch(import.meta.env.VITE_API_URL ?? '/api/admin', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query: print(document), variables }),
      signal: AbortSignal.timeout(16000),
    });
  } catch {
    throw new AdminRequestError('ارتباط برقرار نشد. دوباره تلاش کنید.');
  }
  let result: { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };
  try {
    result = await response.json();
  } catch {
    throw new AdminRequestError('سرویس مدیریت در دسترس نیست. دوباره تلاش کنید.');
  }
  if (!response.ok || result.errors?.length || !result.data) {
    const error = result.errors?.[0];
    const code = error?.extensions?.code ?? '';
    const known = [
      'BAD_USER_INPUT',
      'INVALID_CREDENTIALS',
      'UNAUTHENTICATED',
      'FORBIDDEN',
      'RATE_LIMITED',
      'NOT_FOUND',
      'REQUEST_CONFLICT',
    ];
    throw new AdminRequestError(
      known.includes(code) ? error!.message : 'سرویس مدیریت در دسترس نیست. دوباره تلاش کنید.',
      known.includes(code) ? code : 'SERVICE_UNAVAILABLE',
    );
  }
  const session = result.data as T & {
    adminLogin?: { accessToken: string; accessExpiresAt: string };
    adminRefresh?: { accessToken: string; accessExpiresAt: string };
  };
  const issued = session.adminLogin ?? session.adminRefresh;
  if (issued) {
    accessToken = issued.accessToken;
    expiresAt = Date.parse(issued.accessExpiresAt);
  }
  return result.data;
}
export async function adminRequest<T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V,
): Promise<T> {
  const definition = document.definitions.find((value) => value.kind === 'OperationDefinition');
  const name = definition?.kind === 'OperationDefinition' ? definition.name?.value : '';
  const protectedOperation = !['AdminLogin', 'AdminRefresh', 'AdminLogout'].includes(name ?? '');
  const run = async () => {
    try {
      if (protectedOperation && (!accessToken || expiresAt <= Date.now() + 15000))
        await send(AdminRefreshDocument, {});
      let data;
      try {
        data = await send(document, variables);
      } catch (error) {
        if (
          !protectedOperation ||
          !(error instanceof AdminRequestError) ||
          error.code !== 'UNAUTHENTICATED'
        )
          throw error;
        clearAdminAccess();
        await send(AdminRefreshDocument, {});
        data = await send(document, variables);
      }
      if (name === 'AdminLogout') clearAdminAccess();
      return data;
    } catch (error) {
      if (error instanceof AdminRequestError && error.code === 'UNAUTHENTICATED') {
        clearAdminAccess();
        window.dispatchEvent(new Event('behjati-admin-expired'));
      }
      throw error;
    }
  };
  if (navigator.locks) return navigator.locks.request('behjati-admin-session', run);
  const pending = queue.then(run, run);
  queue = pending.catch(() => {});
  return pending;
}
