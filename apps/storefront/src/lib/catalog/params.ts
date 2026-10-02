import { catalogFilterSchema, normalizeDigits } from '@behjati/shared';
export type CatalogParams = Record<string, string | string[] | undefined>;
export const param = (value: CatalogParams[string]) =>
  Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
export function parseCatalogParams(params: CatalogParams, category?: string) {
  const number = (value: CatalogParams[string]) => {
    const text = normalizeDigits(param(value)).trim();
    return text ? (/^\d+$/.test(text) ? Number(text) : NaN) : undefined;
  };
  return catalogFilterSchema.safeParse({
    search: param(params.q),
    category: category ?? param(params.category),
    sort: param(params.sort) || undefined,
    minPrice: number(params.min),
    maxPrice: number(params.max),
    page: number(params.page),
    pageSize: number(params.size),
  });
}
export function catalogURL(
  path: string,
  params: CatalogParams,
  changes: Record<string, string | undefined>,
) {
  const query = new URLSearchParams();
  for (const key of ['q', 'category', 'sort', 'min', 'max', 'size', 'page']) {
    const value = param(params[key]);
    if (value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  return `${path}${query.size ? `?${query}` : ''}`;
}
