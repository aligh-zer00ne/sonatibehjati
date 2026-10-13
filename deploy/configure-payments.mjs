import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'dotenv';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const apiPath = root + 'apps/api/.env';
const original = await readFile(apiPath, 'utf8');
const api = parse(original);
const activate = process.argv.includes('--activate');
const terminal = (
  process.argv.find((arg) => arg.startsWith('--terminal-id='))?.split('=')[1] ??
  api.SEP_TERMINAL_ID ??
  ''
).replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
if (!/^\d{1,10}$/.test(terminal) || Number(terminal) <= 0)
  throw new Error(
    'Supply the issued terminal using --terminal-id=... or the private SEP_TERMINAL_ID setting.',
  );
const fields = {
  SEP_TERMINAL_ID: terminal,
  SEP_CALLBACK_ORIGIN: 'https://sonatibehjati.ir',
  PAYMENT_PROVIDER: activate ? 'sep' : 'disabled',
};
if (activate) {
  if (
    api.SMS_PROVIDER !== 'melipayamak' ||
    !api.MELI_PAYAMAK_API_KEY ||
    !Number.isInteger(Number(api.MELI_PAYAMAK_OTP_BODY_ID)) ||
    Number(api.MELI_PAYAMAK_OTP_BODY_ID) <= 0
  )
    throw new Error('Configure real SMS before enabling public payments.');
  const names = [
    'USER_ACCESS_TOKEN_SECRET',
    'USER_REFRESH_TOKEN_SECRET',
    'ADMIN_ACCESS_TOKEN_SECRET',
    'ADMIN_REFRESH_TOKEN_SECRET',
    'OTP_HASH_SECRET',
    'AUTH_PROXY_SECRET',
  ];
  const secrets = names.map((name) => api[name] ?? '');
  if (secrets.some((value) => value.length < 32) || new Set(secrets).size !== secrets.length)
    throw new Error('Configure independent production authentication secrets.');
  Object.assign(fields, {
    NODE_ENV: 'production',
    PORT: '4100',
    STOREFRONT_ORIGIN: 'https://sonatibehjati.ir',
    ADMIN_ORIGIN: 'https://admin.sonatibehjati.ir',
    AUTH_TRUST_PROXY_HEADERS: 'true',
    DEV_OTP_CODE: '',
    SEP_TEST_BASE_URL: '',
  });
}
function update(text, values) {
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${JSON.stringify(value)}`;
    const pattern = new RegExp('^' + key + '=.*$', 'm');
    text = pattern.test(text)
      ? text.replace(pattern, () => line)
      : text.trimEnd() + '\n' + line + '\n';
  }
  return text;
}
const backend = update(original, fields);
let frontend;
const frontendPath = root + 'apps/storefront/.env.production';
if (activate) {
  const base = await readFile(frontendPath, 'utf8').catch(() => '');
  frontend = update(base, {
    NEXT_PUBLIC_SITE_URL: 'https://sonatibehjati.ir',
    API_URL: 'http://127.0.0.1:4100/graphql',
    CATALOG_SOURCE: 'api',
    STOREFRONT_ORIGIN: 'https://sonatibehjati.ir',
    ADMIN_ORIGIN: 'https://admin.sonatibehjati.ir',
    AUTH_PROXY_SECRET: api.AUTH_PROXY_SECRET,
    AUTH_TRUST_PROXY_HEADERS: 'true',
  });
  const parsed = parse(frontend);
  for (const name of ['.env.local', '.env.production.local']) {
    const higher = parse(await readFile(root + 'apps/storefront/' + name, 'utf8').catch(() => ''));
    for (const key of [
      'API_URL',
      'STOREFRONT_ORIGIN',
      'AUTH_PROXY_SECRET',
      'CATALOG_SOURCE',
      'NEXT_PUBLIC_SITE_URL',
      'AUTH_TRUST_PROXY_HEADERS',
    ])
      if (higher[key] && higher[key] !== parsed[key])
        throw new Error(
          `${name} overrides the prepared production setting ${key}; reconcile that file first.`,
        );
  }
}
for (const [key, value] of Object.entries(fields))
  if (parse(backend)[key] !== value)
    throw new Error(`Private configuration has conflicting entries for ${key}.`);
// All validation completes before private configuration is changed.
await writeFile(apiPath, backend, { mode: 0o600 });
if (frontend) await writeFile(frontendPath, frontend, { mode: 0o600 });
console.log(
  activate
    ? 'Production payment configuration saved. Deploy using the normal script, then install deploy/nginx/payment-live.conf and reload Nginx.'
    : 'Terminal and callback settings saved privately. Public payment remains disabled until real SMS is ready.',
);
