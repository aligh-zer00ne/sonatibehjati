import type { z } from 'zod';
import { authError } from '../auth/errors.js';
export function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw authError('اطلاعات درخواست را بررسی کنید.', 'BAD_USER_INPUT');
  return result.data;
}
export const omitNulls = (input: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null));
export const serializeDates = <T extends { createdAt: Date; updatedAt: Date }>(value: T) => ({
  ...value,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
