'use client';
import { useEffect, useState, useCallback } from 'react';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useAuth } from '@/components/auth/AuthProvider';
import { authRequest } from '@/lib/auth/client';
export function useAccountQuery<T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V,
  enabled = true,
) {
  const { user } = useAuth();
  const key = JSON.stringify(variables);
  const userId = user?.id;
  const [result, setResult] = useState<{ key: string; userId: string; data: T } | null>(null);
  const [failure, setFailure] = useState<{ key: string; userId: string; message: string } | null>(
    null,
  );
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => {
    setResult(null);
    setFailure(null);
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    let active = true;
    if (!userId || !enabled) return;
    setResult(null);
    setFailure(null);
    void authRequest(document, JSON.parse(key) as V)
      .then((data) => {
        if (active) setResult({ key, userId, data });
      })
      .catch((error) => {
        if (active)
          setFailure({
            key,
            userId,
            message: error instanceof Error ? error.message : 'اطلاعات دریافت نشد.',
          });
      });
    return () => {
      active = false;
    };
  }, [userId, key, document, revision, enabled]);
  return {
    data: enabled && result?.key === key && result.userId === userId ? result.data : null,
    error: enabled && failure?.key === key && failure.userId === userId ? failure.message : '',
    refresh,
  };
}
