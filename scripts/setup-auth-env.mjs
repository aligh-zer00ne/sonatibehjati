import { readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (process.env.NODE_ENV === 'production')
  throw new Error('Local environment setup is development-only.');
const apiPath = 'apps/api/.env';
const storefrontPath = 'apps/storefront/.env.local';
const load = (path, example) =>
  existsSync(path) ? readFileSync(path, 'utf8') : readFileSync(example, 'utf8');
const get = (text, key) => {
  const value = text.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim();
  return value?.replace(/^(['"])(.*)\1$/, '$2');
};
const put = (text, key, value) =>
  new RegExp(`^${key}=.*$`, 'm').test(text)
    ? text.replace(new RegExp(`^${key}=.*$`, 'm'), () => `${key}=${value}`)
    : `${text.trimEnd()}\n${key}=${value}\n`;
let api = load(apiPath, 'apps/api/.env.example');
if (get(api, 'NODE_ENV') === 'production')
  throw new Error('Refusing to edit a production environment.');
for (const key of [
  'USER_ACCESS_TOKEN_SECRET',
  'USER_REFRESH_TOKEN_SECRET',
  'ADMIN_ACCESS_TOKEN_SECRET',
  'ADMIN_REFRESH_TOKEN_SECRET',
  'OTP_HASH_SECRET',
  'AUTH_PROXY_SECRET',
]) {
  if (!get(api, key)) api = put(api, key, randomBytes(48).toString('hex'));
}
if (process.env.DATABASE_URL) api = put(api, 'DATABASE_URL', process.env.DATABASE_URL);
let storefront = load(storefrontPath, 'apps/storefront/.env.example');
storefront = put(storefront, 'AUTH_PROXY_SECRET', get(api, 'AUTH_PROXY_SECRET'));
storefront = put(
  storefront,
  'STOREFRONT_ORIGIN',
  get(api, 'STOREFRONT_ORIGIN') ?? 'http://localhost:3000',
);
for (const [path, text] of [
  [apiPath, api],
  [storefrontPath, storefront],
]) {
  writeFileSync(path, text, { mode: 0o600 });
  chmodSync(path, 0o600);
}
console.log('Local auth environment configured; secrets remain in ignored private env files.');
