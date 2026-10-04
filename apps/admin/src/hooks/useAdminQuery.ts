import { useEffect, useState, useCallback } from 'react';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest } from '../lib/client';
export function useAdminQuery<T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V,
  enabled = true,
) {
  const { admin } = useAdmin();
  const adminId = admin?.id;
  const key = JSON.stringify(variables);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; adminId: string; data: T } | null>(null);
  const [failure, setFailure] = useState<{ key: string; adminId: string; message: string } | null>(
    null,
  );
  const refresh = useCallback(() => {
    setResult(null);
    setFailure(null);
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    let active = true;
    setResult(null);
    setFailure(null);
    if (adminId && enabled)
      void adminRequest(document, JSON.parse(key) as V)
        .then((data) => {
          if (active) setResult({ key, adminId, data });
        })
        .catch((error) => {
          if (active)
            setFailure({
              key,
              adminId,
              message: error instanceof Error ? error.message : 'اطلاعات دریافت نشد.',
            });
        });
    return () => {
      active = false;
    };
  }, [document, key, adminId, revision, enabled]);
  return {
    data: enabled && result?.key === key && result.adminId === adminId ? result.data : null,
    error: enabled && failure?.key === key && failure.adminId === adminId ? failure.message : '',
    refresh,
  };
}
