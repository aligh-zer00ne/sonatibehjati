import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().startsWith('mysql://'),
  STOREFRONT_ORIGIN: z.string().url().default('http://localhost:3000'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:3001'),
  SHIPPING_COST: z.coerce.number().int().nonnegative().default(60000),
});
export const env = schema.parse(process.env);
if (env.NODE_ENV === 'production') {
  const keys = [
    'USER_ACCESS_TOKEN_SECRET',
    'USER_REFRESH_TOKEN_SECRET',
    'ADMIN_ACCESS_TOKEN_SECRET',
    'ADMIN_REFRESH_TOKEN_SECRET',
  ] as const;
  const secrets = keys.map((key) => z.string().min(32).parse(process.env[key]));
  if (new Set(secrets).size !== keys.length)
    throw new Error('Authentication secrets must be independent.');
}
