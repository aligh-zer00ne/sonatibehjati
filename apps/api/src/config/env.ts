import 'dotenv/config';
import { z } from 'zod';
const optionalSecret = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(32).optional(),
);
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().startsWith('mysql://'),
  STOREFRONT_ORIGIN: z.string().url().default('http://localhost:3000'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:3001'),
  USER_ACCESS_TOKEN_SECRET: optionalSecret,
  USER_REFRESH_TOKEN_SECRET: optionalSecret,
  OTP_HASH_SECRET: optionalSecret,
  AUTH_PROXY_SECRET: optionalSecret,
  AUTH_TRUST_PROXY_HEADERS: z.enum(['true', 'false']).default('false'),
  SMS_PROVIDER: z.enum(['mock', 'melipayamak']).default('mock'),
  DEV_OTP_CODE: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
  ),
  MELI_PAYAMAK_HOSTNAME: z.string().default('console.melipayamak.com'),
  MELI_PAYAMAK_PATH: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().optional(),
  ),
  MELI_PAYAMAK_API_KEY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().optional(),
  ),
  MELI_PAYAMAK_OTP_BODY_ID: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  SHIPPING_COST: z.coerce.number().int().nonnegative().default(60000),
});
export const env = schema.parse(process.env);
if (env.NODE_ENV === 'production') {
  const keys = [
    'USER_ACCESS_TOKEN_SECRET',
    'USER_REFRESH_TOKEN_SECRET',
    'ADMIN_ACCESS_TOKEN_SECRET',
    'ADMIN_REFRESH_TOKEN_SECRET',
    'OTP_HASH_SECRET',
  ] as const;
  if (new URL(env.STOREFRONT_ORIGIN).protocol !== 'https:')
    throw new Error('Production storefront must use HTTPS.');
  if (env.SMS_PROVIDER === 'mock') throw new Error('Production requires a real SMS provider.');
  z.string().min(32).parse(env.AUTH_PROXY_SECRET);
  const secrets = keys.map((key) => z.string().min(32).parse(process.env[key]));
  if (new Set(secrets).size !== keys.length)
    throw new Error('Authentication secrets must be independent.');
}
