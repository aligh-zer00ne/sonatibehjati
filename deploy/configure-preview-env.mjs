import { readFileSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
const root = fileURLToPath(new URL('../', import.meta.url));
const apiPath = `${root}apps/api/.env`;
const api = parse(readFileSync(apiPath));
if (api.NODE_ENV === 'production')
  throw new Error('Refusing to overwrite a production API environment.');
for (const key of [
  'USER_ACCESS_TOKEN_SECRET',
  'USER_REFRESH_TOKEN_SECRET',
  'ADMIN_ACCESS_TOKEN_SECRET',
  'ADMIN_REFRESH_TOKEN_SECRET',
  'OTP_HASH_SECRET',
  'AUTH_PROXY_SECRET',
]) {
  if ((api[key] ?? '').length < 32) throw new Error(`Missing existing secret: ${key}`);
}
if (!/^\d{5,6}$/.test(api.DEV_OTP_CODE ?? ''))
  throw new Error(
    'An existing five-digit development OTP (or an existing six-digit preview setting) is required.',
  );
if (new URL(api.DATABASE_URL).protocol !== 'mysql:')
  throw new Error('Configure the server MySQL URL first.');
for (const name of ['.env', '.env.local', '.env.production.local']) {
  if (existsSync(`${root}apps/storefront/${name}`))
    throw new Error(
      `Remove the conflicting storefront ${name} from this fresh server installation first.`,
    );
}
const save = (path, values) => {
  writeFileSync(
    path,
    Object.entries(values)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  chmodSync(path, 0o600);
};
save(apiPath, {
  ...api,
  NODE_ENV: 'development',
  PORT: '4100',
  STOREFRONT_ORIGIN: 'https://sonatibehjati.ir',
  ADMIN_ORIGIN: 'https://admin.sonatibehjati.ir',
  AUTH_TRUST_PROXY_HEADERS: 'true',
  SMS_PROVIDER: 'mock',
});
save(`${root}apps/storefront/.env.production`, {
  NEXT_PUBLIC_SITE_URL: 'https://sonatibehjati.ir',
  STOREFRONT_ORIGIN: 'https://sonatibehjati.ir',
  API_URL: 'http://127.0.0.1:4100/graphql',
  CATALOG_SOURCE: 'api',
  AUTH_PROXY_SECRET: api.AUTH_PROXY_SECRET,
  AUTH_TRUST_PROXY_HEADERS: 'true',
});
save(`${root}apps/admin/.env.production`, {
  VITE_API_URL: '/api/admin',
  VITE_STOREFRONT_URL: 'https://sonatibehjati.ir',
});
console.log(
  'Server preview env configured. Existing secrets and OTP preserved; no SMS will be sent.',
);
