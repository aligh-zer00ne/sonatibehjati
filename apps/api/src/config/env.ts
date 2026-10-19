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
  ADMIN_ACCESS_TOKEN_SECRET: optionalSecret,
  ADMIN_REFRESH_TOKEN_SECRET: optionalSecret,
  USER_ACCESS_TOKEN_SECRET: optionalSecret,
  USER_REFRESH_TOKEN_SECRET: optionalSecret,
  OTP_HASH_SECRET: optionalSecret,
  AUTH_PROXY_SECRET: optionalSecret,
  AUTH_TRUST_PROXY_HEADERS: z.enum(['true', 'false']).default('false'),
  CUSTOMER_AUTH_ENABLED: z.enum(['true', 'false']).default('true'),
  CHECKOUT_PAYMENT_TEST_ENABLED: z.enum(['true', 'false']).default('false'),
  ADMIN_PAYMENT_TEST_ENABLED: z.enum(['true', 'false']).default('false'),
  SMS_PROVIDER: z.enum(['mock', 'melipayamak']).default('mock'),
  DEV_OTP_CODE: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      // Accept existing six-digit preview settings; only the first five digits are used.
      .regex(/^\d{5,6}$/)
      .optional(),
  ),
  MELI_PAYAMAK_HOSTNAME: z.string().default('console.melipayamak.com'),
  MELI_PAYAMAK_TRANSPORT: z.enum(['console', 'soap']).default('console'),
  MELI_PAYAMAK_USERNAME: z.string().optional(),
  MELI_PAYAMAK_PASSWORD: z.string().optional(),
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
  PAYMENT_PROVIDER: z.enum(['disabled', 'sep']).default('disabled'),
  SEP_TERMINAL_ID: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^\d{1,10}$/)
      .optional(),
  ),
  SEP_CALLBACK_ORIGIN: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional(),
  ),
  SEP_TEST_BASE_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional(),
  ),
  SHIPPING_COST: z.coerce.number().int().nonnegative().default(60000),
  UPLOAD_DIRECTORY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(1).optional(),
  ),
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
  if (new URL(env.ADMIN_ORIGIN).protocol !== 'https:')
    throw new Error('Production admin must use HTTPS.');
  if (new URL(env.STOREFRONT_ORIGIN).protocol !== 'https:')
    throw new Error('Production storefront must use HTTPS.');
  if (
    env.CUSTOMER_AUTH_ENABLED === 'true' &&
    env.SMS_PROVIDER === 'mock' &&
    env.CHECKOUT_PAYMENT_TEST_ENABLED !== 'true'
  )
    throw new Error('Production requires a real SMS provider.');
  z.string().min(32).parse(env.AUTH_PROXY_SECRET);
  const secrets = keys.map((key) => z.string().min(32).parse(process.env[key]));
  if (new Set(secrets).size !== keys.length)
    throw new Error('Authentication secrets must be independent.');
}

const configuredTokenSecrets = [
  env.USER_ACCESS_TOKEN_SECRET,
  env.USER_REFRESH_TOKEN_SECRET,
  env.ADMIN_ACCESS_TOKEN_SECRET,
  env.ADMIN_REFRESH_TOKEN_SECRET,
].filter(Boolean);
if (new Set(configuredTokenSecrets).size !== configuredTokenSecrets.length)
  throw new Error('Token secrets must be independent across roles and kinds.');

if (
  env.SEP_TEST_BASE_URL &&
  (env.NODE_ENV !== 'test' ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(env.SEP_TEST_BASE_URL).hostname))
)
  throw new Error('Payment test endpoints are permitted only in local tests.');
if (env.PAYMENT_PROVIDER === 'sep') {
  if (env.NODE_ENV === 'test' && !env.SEP_TEST_BASE_URL)
    throw new Error('Payment tests require a local bank simulator.');
  if (!env.SEP_TERMINAL_ID || Number(env.SEP_TERMINAL_ID) <= 0)
    throw new Error('Configure SEP_TERMINAL_ID.');
  const callback = new URL(env.SEP_CALLBACK_ORIGIN ?? env.STOREFRONT_ORIGIN);
  if (
    callback.pathname !== '/' ||
    callback.search ||
    callback.hash ||
    callback.username ||
    callback.password
  )
    throw new Error('SEP_CALLBACK_ORIGIN must be an origin.');
  if (env.NODE_ENV !== 'test' && callback.protocol !== 'https:')
    throw new Error('Real SEP callbacks require HTTPS.');
  z.string().min(32).parse(env.AUTH_PROXY_SECRET);
}

if (env.ADMIN_PAYMENT_TEST_ENABLED === 'true' && env.PAYMENT_PROVIDER !== 'sep')
  throw new Error('Admin gateway tests require the SEP provider.');

if (
  env.CHECKOUT_PAYMENT_TEST_ENABLED === 'true' &&
  (env.CUSTOMER_AUTH_ENABLED !== 'true' ||
    env.PAYMENT_PROVIDER !== 'sep' ||
    env.ADMIN_PAYMENT_TEST_ENABLED === 'true')
)
  throw new Error(
    'Checkout payment testing requires customer authentication, SEP and no admin-only test mode.',
  );
