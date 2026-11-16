import { useEffect, useState } from 'react';
import { shippingMethodLabel, shippingMethodLabels, shippingMethods } from '@behjati/shared/sales';
import { AdminShippingMethodsDocument } from '../generated/graphql';
import { adminRequest } from '../lib/client';

export type ShippingMethodOption = { method: string; label: string; enabled: boolean };
const fallback: ShippingMethodOption[] = shippingMethods.map((method) => ({
  method,
  label: shippingMethodLabels[method],
  enabled: true,
}));
let cache: { at: number; value: Promise<ShippingMethodOption[]> } | null = null;
const listeners = new Set<(methods: ShippingMethodOption[]) => void>();
function load(force = false) {
  if (force || !cache || Date.now() - cache.at > 60_000) {
    const value = adminRequest(AdminShippingMethodsDocument, {}).then(
      (data) => data.shippingOptions.methods,
    );
    value.then(
      (methods) => listeners.forEach((listener) => listener(methods)),
      () => {
        if (cache?.value === value) cache = null;
      },
    );
    cache = { at: Date.now(), value };
  }
  return cache.value;
}
/** Call after saving shipping settings so open selectors show renamed or new methods. */
export function invalidateShippingMethods() {
  void load(true).catch(() => undefined);
}
/** Store shipping methods (built-in plus custom) with a built-in fallback while loading. */
export function useShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethodOption[]>(fallback);
  useEffect(() => {
    let active = true;
    const update = (next: ShippingMethodOption[]) => active && setMethods(next);
    listeners.add(update);
    load().then(update, () => undefined);
    return () => {
      active = false;
      listeners.delete(update);
    };
  }, []);
  return {
    methods,
    label: (code: string | null | undefined) => shippingMethodLabel(code, methods),
    /** Select options; a disabled method is still listed when it is the current value. */
    options: (current?: string | null) =>
      methods
        .filter((item) => item.enabled || item.method === current)
        .map((item) => ({ value: item.method, label: item.label })),
  };
}
