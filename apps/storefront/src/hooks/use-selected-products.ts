'use client';
import { useEffect, useState } from 'react';
import type { SelectedProductsQuery } from '@/generated/graphql';
export function useSelectedProducts(ids: string[], hydrated: boolean) {
  const key = JSON.stringify([...new Set(ids)].sort());
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    products: SelectedProductsQuery['productsByIds'];
    error?: string;
  }>({ key: '', products: [] });
  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    const selected = JSON.parse(key) as string[];
    if (!selected.length) {
      setResult({ key, products: [] });
      return;
    }
    setResult({ key: '', products: [] });
    void fetch('/api/catalog/selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('دریافت اطلاعات محصولات انجام نشد. دوباره تلاش کنید.');
        return response.json() as Promise<{ products: SelectedProductsQuery['productsByIds'] }>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, products: data.products });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            key,
            products: [],
            error: 'دریافت اطلاعات محصولات انجام نشد. دوباره تلاش کنید.',
          });
      });
    return () => controller.abort();
  }, [key, hydrated, attempt]);
  useEffect(() => {
    if (!result.products.some((product) => product.promotion)) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setResult((current) => {
        if (
          !current.products.some(
            (product) => product.promotion && Date.parse(product.promotion.endsAt) <= now,
          )
        )
          return current;
        return {
          ...current,
          products: current.products.map((product) =>
            product.promotion && Date.parse(product.promotion.endsAt) <= now
              ? { ...product, promotion: null }
              : product,
          ),
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result.products]);
  return {
    products: result.products,
    loading: !hydrated || key !== result.key,
    error: result.error,
    retry: () => setAttempt((value) => value + 1),
  };
}
