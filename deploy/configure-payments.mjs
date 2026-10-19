import { readFile, writeFile, chmod } from 'node:fs/promises';
import { parse } from 'dotenv';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const apiPath = root + 'apps/api/.env';
const original = await readFile(apiPath, 'utf8');
const api = parse(original);
const activate = process.argv.includes('--activate');
const review = process.argv.includes('--review');
const checkoutTest = process.argv.includes('--checkout-test');
if ([activate, review, checkoutTest].filter(Boolean).length > 1)
  throw new Error('Choose exactly one payment profile.');
const serverProfile = activate || review || checkoutTest;
const smsMode =
  process.argv.find((arg) => arg.startsWith('--sms-mode='))?.slice('--sms-mode='.length) ??
  (api.MELI_PAYAMAK_TRANSPORT === 'soap'
    ? 'soap'
    : api.MELI_PAYAMAK_PATH === '/api/send/otp/{apiKey}'
      ? 'otp'
      : 'shared');
if (!['otp', 'shared', 'soap'].includes(smsMode))
  throw new Error('Choose --sms-mode=soap, --sms-mode=otp or --sms-mode=shared.');
const normalizeDigits = (value) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persian = '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit);
    return String(persian >= 0 ? persian : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
  });
const bodyId = normalizeDigits(
  process.argv.find((arg) => arg.startsWith('--body-id='))?.slice('--body-id='.length) ??
    api.MELI_PAYAMAK_OTP_BODY_ID ??
    '',
);
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
  ...(activate
    ? {
        SMS_PROVIDER: 'melipayamak',
        MELI_PAYAMAK_TRANSPORT: smsMode === 'soap' ? 'soap' : 'console',
        MELI_PAYAMAK_OTP_BODY_ID: bodyId,
        ...(smsMode === 'soap'
          ? {}
          : {
              MELI_PAYAMAK_HOSTNAME: 'console.melipayamak.com',
              MELI_PAYAMAK_PATH: `/api/send/${smsMode}/{apiKey}`,
            }),
      }
    : {}),
  SEP_TERMINAL_ID: terminal,
  SEP_CALLBACK_ORIGIN: 'https://sonatibehjati.ir',
  PAYMENT_PROVIDER: serverProfile ? 'sep' : 'disabled',
  ADMIN_PAYMENT_TEST_ENABLED: review ? 'true' : 'false',
  CHECKOUT_PAYMENT_TEST_ENABLED: checkoutTest ? 'true' : 'false',
  ...(serverProfile ? { CUSTOMER_AUTH_ENABLED: review ? 'false' : 'true' } : {}),
};
if (serverProfile) {
  if (
    activate &&
    ((smsMode === 'soap'
      ? !api.MELI_PAYAMAK_USERNAME?.trim() || !api.MELI_PAYAMAK_PASSWORD?.trim()
      : !api.MELI_PAYAMAK_API_KEY?.trim()) ||
      ((smsMode !== 'otp' || bodyId !== '') &&
        (!/^\d+$/.test(bodyId) ||
          !Number.isSafeInteger(Number(bodyId)) ||
          Number(bodyId) <= 0 ||
          (smsMode === 'soap' && Number(bodyId) > 2147483647))))
  )
    throw new Error(
      smsMode === 'soap'
        ? 'SOAP requires MELI_PAYAMAK_USERNAME and MELI_PAYAMAK_PASSWORD in apps/api/.env and a positive 32-bit --body-id=... . Use panel web-service credentials, not a console token.'
        : 'Configure real SMS: MELI_PAYAMAK_API_KEY in apps/api/.env; shared mode also requires a positive numeric --body-id=... . Console OTP length must be five digits.',
    );
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
    ...(review || checkoutTest ? { SMS_PROVIDER: 'mock' } : {}),
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
    const pattern = new RegExp('^' + key + '=.*$', 'gm');
    text = pattern.test(text)
      ? text.replace(pattern, () => line)
      : text.trimEnd() + '\n' + line + '\n';
  }
  return text;
}
const backend = update(original, fields);
let frontend;
const higherUpdates = [];
const frontendPath = root + 'apps/storefront/.env.production';
if (serverProfile) {
  const base = await readFile(frontendPath, 'utf8').catch(() => '');
  frontend = update(base, {
    NEXT_PUBLIC_SITE_URL: 'https://sonatibehjati.ir',
    API_URL: 'http://127.0.0.1:4100/graphql',
    CATALOG_SOURCE: 'api',
    CHECKOUT_PAYMENT_TEST_ENABLED: checkoutTest ? 'true' : 'false',
    ...(activate ? { SEO_INDEXING_ENABLED: 'true' } : {}),
    STOREFRONT_ORIGIN: 'https://sonatibehjati.ir',
    ADMIN_ORIGIN: 'https://admin.sonatibehjati.ir',
    AUTH_PROXY_SECRET: api.AUTH_PROXY_SECRET,
    AUTH_TRUST_PROXY_HEADERS: 'true',
  });
  const parsed = parse(frontend);
  for (const name of ['.env.local', '.env.production.local']) {
    const path = root + 'apps/storefront/' + name;
    const text = await readFile(path, 'utf8').catch(() => '');
    let reconciled = text;
    const existing = parse(text);
    if (activate) {
      for (const key of ['CHECKOUT_PAYMENT_TEST_ENABLED', 'SEO_INDEXING_ENABLED'])
        if (existing[key] !== undefined) reconciled = update(reconciled, { [key]: parsed[key] });
    }
    const higher = parse(reconciled);
    for (const key of [
      'API_URL',
      'CHECKOUT_PAYMENT_TEST_ENABLED',
      'STOREFRONT_ORIGIN',
      'AUTH_PROXY_SECRET',
      'CATALOG_SOURCE',
      'NEXT_PUBLIC_SITE_URL',
      'AUTH_TRUST_PROXY_HEADERS',
      ...(activate ? ['SEO_INDEXING_ENABLED'] : []),
    ])
      if (higher[key] && higher[key] !== parsed[key])
        throw new Error(
          `${name} overrides the prepared production setting ${key}; reconcile that file first.`,
        );
    if (reconciled !== text) higherUpdates.push({ path, text: reconciled });
  }
}
for (const [key, value] of Object.entries(fields))
  if (parse(backend)[key] !== value)
    throw new Error(`Private configuration has conflicting entries for ${key}.`);
// All validation completes before private configuration is changed.
await writeFile(apiPath, backend, { mode: 0o600 });
await chmod(apiPath, 0o600);
if (frontend) {
  await writeFile(frontendPath, frontend, { mode: 0o600 });
  await chmod(frontendPath, 0o600);
}
for (const file of higherUpdates) {
  await writeFile(file.path, file.text, { mode: 0o600 });
  await chmod(file.path, 0o600);
}
console.log(
  checkoutTest
    ? 'Main storefront checkout test configured: fixed login code 123456, no SMS, real SEP payments. Deploy normally, then install payment-live.conf and reload Nginx.'
    : review
      ? 'Owner-only real gateway test is configured. Customer authentication is disabled; no SMS is sent. Deploy normally and keep payment-review.conf.'
      : activate
        ? `Production configured: MeliPayamak ${smsMode}, five-digit OTP, fixed-code/admin payment testing disabled, real SEP checkout and SEO enabled. Deploy using the normal script. Keep the existing payment-live.conf.`
        : 'Terminal and callback settings saved privately. Public payment remains disabled until real SMS is ready.',
);
