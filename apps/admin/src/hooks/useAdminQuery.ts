import { useEffect, useState, useCallback, useRef } from 'react';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest } from '../lib/client';
export function useAdminQuery<T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V,
  enabled = true,
  options: { pollInterval?: number } = {},
) {
  const pollInterval = options.pollInterval ?? 0;
  const { admin } = useAdmin();
  const adminId = admin?.id;
  const key = JSON.stringify(variables);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    adminId: string;
    data: T;
    updatedAt: number;
  } | null>(null);
  const inFlight = useRef(false);
  const [fetching, setFetching] = useState(false);
  const [failure, setFailure] = useState<{ key: string; adminId: string; message: string } | null>(
    null,
  );
  const refresh = useCallback(() => {
    if (!pollInterval) setResult(null);
    setFailure(null);
    setRevision((value) => value + 1);
  }, [pollInterval]);
  useEffect(() => {
    if (!pollInterval || !enabled || !adminId) return;
    const update = () => {
      if (globalThis.document.visibilityState === 'visible' && !inFlight.current) refresh();
    };
    const timer = setInterval(update, pollInterval);
    window.addEventListener('focus', update);
    globalThis.document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', update);
      globalThis.document.removeEventListener('visibilitychange', update);
    };
  }, [pollInterval, enabled, adminId, refresh]);
  useEffect(() => {
    let active = true;
    setResult((previous) =>
      pollInterval && previous?.key === key && previous.adminId === adminId ? previous : null,
    );
    setFailure(null);
    inFlight.current = !!adminId && enabled;
    setFetching(inFlight.current);
    if (adminId && enabled)
      void adminRequest(document, JSON.parse(key) as V)
        .then((data) => {
          if (active) {
            setResult({ key, adminId, data, updatedAt: Date.now() });
            inFlight.current = false;
            setFetching(false);
          }
        })
        .catch((error) => {
          if (active) {
            inFlight.current = false;
            setFetching(false);
            setFailure({
              key,
              adminId,
              message: error instanceof Error ? error.message : 'اطلاعات دریافت نشد.',
            });
          }
        });
    return () => {
      active = false;
      inFlight.current = false;
    };
  }, [document, key, adminId, revision, enabled, pollInterval]);
  return {
    data: enabled && result?.key === key && result.adminId === adminId ? result.data : null,
    error: enabled && failure?.key === key && failure.adminId === adminId ? failure.message : '',
    refresh,
    refreshing: fetching,
    updatedAt:
      enabled && result?.key === key && result.adminId === adminId ? result.updatedAt : null,
  };
}
