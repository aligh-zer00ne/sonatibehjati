import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, copyFile, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { parse } from 'dotenv';

function run(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve({ code, output }));
  });
}

await mkdir('.deployment/verification', { recursive: true });
const fixture = await mkdtemp(resolve('.deployment/verification/production-release-'));
try {
  await mkdir(fixture + '/deploy');
  await mkdir(fixture + '/apps/api', { recursive: true });
  await mkdir(fixture + '/apps/storefront', { recursive: true });
  await copyFile('deploy/configure-payments.mjs', fixture + '/deploy/configure-payments.mjs');
  const secrets = Object.fromEntries(
    [
      'USER_ACCESS_TOKEN_SECRET',
      'USER_REFRESH_TOKEN_SECRET',
      'ADMIN_ACCESS_TOKEN_SECRET',
      'ADMIN_REFRESH_TOKEN_SECRET',
      'OTP_HASH_SECRET',
      'AUTH_PROXY_SECRET',
    ].map((key) => [key, randomBytes(32).toString('hex')]),
  );
  const original = {
    ...secrets,
    NODE_ENV: 'production',
    CUSTOMER_AUTH_ENABLED: 'true',
    CHECKOUT_PAYMENT_TEST_ENABLED: 'true',
    ADMIN_PAYMENT_TEST_ENABLED: 'false',
    SMS_PROVIDER: 'mock',
    DEV_OTP_CODE: '123456',
    SEP_TERMINAL_ID: '12345678',
    DATABASE_URL: 'mysql://fixture:fixture@127.0.0.1:3307/not_connected',
    MELI_PAYAMAK_API_KEY: 'fixture-only-key',
    MELI_PAYAMAK_OTP_BODY_ID: '',
  };
  const apiPath = fixture + '/apps/api/.env';
  const encode = (data) =>
    Object.entries(data)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('\n') + '\n';
  const before = encode(original);
  await writeFile(apiPath, before, { mode: 0o600 });
  for (const invalid of ['', 'approved template text', '0', '1.5', '9007199254740993']) {
    const result = await run([
      fixture + '/deploy/configure-payments.mjs',
      '--activate',
      '--body-id=' + invalid,
    ]);
    assert.notEqual(result.code, 0);
    assert.equal(
      await readFile(apiPath, 'utf8'),
      before,
      'Invalid settings cannot partially activate production',
    );
  }
  const overridePath = fixture + '/apps/storefront/.env.production.local';
  const conflicting =
    'API_URL=http://conflicting.invalid/graphql\nCHECKOUT_PAYMENT_TEST_ENABLED=true\n';
  await writeFile(overridePath, conflicting);
  const blocked = await run([
    fixture + '/deploy/configure-payments.mjs',
    '--activate',
    '--body-id=123',
  ]);
  assert.notEqual(blocked.code, 0);
  assert.equal(await readFile(apiPath, 'utf8'), before);
  assert.equal(await readFile(overridePath, 'utf8'), conflicting);
  await writeFile(
    overridePath,
    'CHECKOUT_PAYMENT_TEST_ENABLED=true\nSEO_INDEXING_ENABLED=false\nGOOGLE_SITE_VERIFICATION=keep-this-token\n',
  );
  const activated = await run([
    fixture + '/deploy/configure-payments.mjs',
    '--activate',
    '--body-id=۱۲۳',
  ]);
  assert.equal(activated.code, 0, activated.output);
  const api = parse(await readFile(apiPath, 'utf8'));
  const front = parse(await readFile(fixture + '/apps/storefront/.env.production', 'utf8'));
  const higher = parse(await readFile(overridePath, 'utf8'));
  for (const config of [api, front, higher])
    assert.equal(config.CHECKOUT_PAYMENT_TEST_ENABLED, 'false');
  assert.equal(api.NODE_ENV, 'production');
  assert.equal(api.SMS_PROVIDER, 'melipayamak');
  assert.equal(api.MELI_PAYAMAK_OTP_BODY_ID, '123');
  assert.equal(api.MELI_PAYAMAK_API_KEY, original.MELI_PAYAMAK_API_KEY);
  assert.equal(api.DEV_OTP_CODE, '');
  assert.equal(api.ADMIN_PAYMENT_TEST_ENABLED, 'false');
  assert.equal(api.PAYMENT_PROVIDER, 'sep');
  assert.equal(api.DATABASE_URL, original.DATABASE_URL);
  for (const [key, value] of Object.entries(secrets)) assert.equal(api[key], value);
  assert.equal(front.CATALOG_SOURCE, 'api');
  assert.equal(front.SEO_INDEXING_ENABLED, 'true');
  assert.equal(higher.SEO_INDEXING_ENABLED, 'true');
  assert.equal(higher.GOOGLE_SITE_VERIFICATION, 'keep-this-token');
  assert.equal((await stat(apiPath)).mode & 0o777, 0o600);
  const runtime = await run(
    [
      '-e',
      `
    import assert from 'node:assert/strict';
    const calls = [];
    const logs = [];
    console.info = (...args) => logs.push(args);
    globalThis.fetch = async (url, options) => {
      calls.push({url, body: JSON.parse(options.body)});
      return new Response(JSON.stringify({ recId: '1234567' }), { status: 200 });
    };
    const { smsService, userTokens, authConfig } = await import('./apps/api/src/modules/auth/runtime.ts');
    const { UserTokens } = await import('./apps/api/src/modules/auth/tokens.ts');
    const { createOtpCode } = await import('./apps/api/src/modules/auth/otp-code.ts');
    const legacy = await new UserTokens(authConfig.accessSecret, authConfig.refreshSecret).issue('existing-customer');
    await assert.rejects(userTokens.verify(legacy.access, 'access'));
    await assert.rejects(userTokens.verify(legacy.refresh, 'refresh'));
    const pair = await userTokens.issue('existing-customer');
    assert.equal((await userTokens.verify(pair.refresh, 'refresh')).userId, 'existing-customer');
    await smsService.sendOTP('09000000001', '00042');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://console.melipayamak.com:443/api/send/shared/fixture-only-key');
    assert.deepEqual(calls[0].body, { to: '09000000001', bodyId: 123, args: ['00042'] });
    assert.equal(createOtpCode('production', '123456').length, 5);
    assert.deepEqual(logs, []);
    console.log('REAL_SMS_RUNTIME_VERIFIED');
  `,
    ],
    { ...process.env, ...api },
  );
  assert.equal(runtime.code, 0, runtime.output);
  assert.match(runtime.output, /REAL_SMS_RUNTIME_VERIFIED/);
  const beforeOtp = await readFile(apiPath, 'utf8');
  const invalidMode = await run([
    fixture + '/deploy/configure-payments.mjs',
    '--activate',
    '--sms-mode=unknown',
  ]);
  assert.notEqual(invalidMode.code, 0);
  assert.equal(await readFile(apiPath, 'utf8'), beforeOtp);
  const otpProfile = await run([
    fixture + '/deploy/configure-payments.mjs',
    '--activate',
    '--sms-mode=otp',
    '--body-id=',
  ]);
  assert.equal(otpProfile.code, 0, otpProfile.output);
  const otpApi = parse(await readFile(apiPath, 'utf8'));
  assert.equal(otpApi.MELI_PAYAMAK_PATH, '/api/send/otp/{apiKey}');
  assert.equal(otpApi.MELI_PAYAMAK_OTP_BODY_ID, '');
  assert.equal(otpApi.MELI_PAYAMAK_API_KEY, original.MELI_PAYAMAK_API_KEY);
  assert.equal(otpApi.DATABASE_URL, original.DATABASE_URL);
  for (const [key, value] of Object.entries(secrets)) assert.equal(otpApi[key], value);
  const otpRuntime = await run(
    [
      '-e',
      `
    import assert from 'node:assert/strict';
    const calls = [], logs = [];
    console.info = (...args) => logs.push(args);
    console.warn = (...args) => logs.push(args);
    globalThis.fetch = async (url, options) => {
      calls.push({url, body: JSON.parse(options.body)});
      return new Response(JSON.stringify({ code: '00042', status: 'accepted' }));
    };
    const {smsService} = await import('./apps/api/src/modules/auth/runtime.ts');
    assert.equal(await smsService.sendOTP('09000000001', '98765'), '00042');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://console.melipayamak.com:443/api/send/otp/fixture-only-key');
    assert.deepEqual(calls[0].body, {to:'09000000001'});
    assert.deepEqual(logs, []);
    console.log('CONSOLE_OTP_RUNTIME_VERIFIED');
  `,
    ],
    { ...process.env, ...otpApi },
  );
  assert.equal(otpRuntime.code, 0, otpRuntime.output);
  assert.match(otpRuntime.output, /CONSOLE_OTP_RUNTIME_VERIFIED/);
  const preserveMode = await run([fixture + '/deploy/configure-payments.mjs', '--activate']);
  assert.equal(preserveMode.code, 0, preserveMode.output);
  assert.equal(parse(await readFile(apiPath, 'utf8')).MELI_PAYAMAK_PATH, '/api/send/otp/{apiKey}');
  const beforeSoap = await readFile(apiPath, 'utf8');
  const missingSoap = await run([
    fixture + '/deploy/configure-payments.mjs',
    '--activate',
    '--sms-mode=soap',
    '--body-id=559650',
  ]);
  assert.notEqual(missingSoap.code, 0);
  assert.equal(
    await readFile(apiPath, 'utf8'),
    beforeSoap,
    'Missing panel credentials must not partially switch providers',
  );
  await writeFile(
    apiPath,
    encode({
      ...parse(beforeSoap),
      MELI_PAYAMAK_API_KEY: '',
      MELI_PAYAMAK_USERNAME: 'fixture-panel-user',
      MELI_PAYAMAK_PASSWORD: 'fixture-panel-secret',
    }),
  );
  const soapProfile = await run([
    fixture + '/deploy/configure-payments.mjs',
    '--activate',
    '--sms-mode=soap',
    '--body-id=559650',
  ]);
  assert.equal(soapProfile.code, 0, soapProfile.output);
  const soapApi = parse(await readFile(apiPath, 'utf8'));
  assert.equal(soapApi.MELI_PAYAMAK_TRANSPORT, 'soap');
  assert.equal(soapApi.MELI_PAYAMAK_OTP_BODY_ID, '559650');
  assert.equal(soapApi.MELI_PAYAMAK_API_KEY, '');
  assert.equal(soapApi.MELI_PAYAMAK_USERNAME, 'fixture-panel-user');
  assert.equal(soapApi.MELI_PAYAMAK_PASSWORD, 'fixture-panel-secret');
  for (const [key, value] of Object.entries(secrets)) assert.equal(soapApi[key], value);
  const soapRuntime = await run(
    [
      '-e',
      `
    import assert from 'node:assert/strict';
    const calls = [], logs = [];
    console.info = (...args) => logs.push(args);
    console.warn = (...args) => logs.push(args);
    globalThis.fetch = async (url, options) => {
      calls.push({url,options});
      return new Response('<Envelope><Body><SendByBaseNumberResponse><SendByBaseNumberResult>1234567890123456789</SendByBaseNumberResult></SendByBaseNumberResponse></Body></Envelope>');
    };
    const {smsService} = await import('./apps/api/src/modules/auth/runtime.ts');
    assert.equal(await smsService.sendOTP('09000000001', '00042'), undefined);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.payamak-panel.com/post/send.asmx');
    assert.equal(calls[0].options.headers.SOAPAction, '"http://tempuri.org/SendByBaseNumber"');
    assert.ok(calls[0].options.body.includes('<text><string>00042</string></text>'));
    assert.ok(calls[0].options.body.includes('<bodyId>559650</bodyId>'));
    assert.ok(calls[0].options.body.includes('<username>fixture-panel-user</username>'));
    assert.deepEqual(logs, []);
    console.log('SOAP_PATTERN_RUNTIME_VERIFIED');
  `,
    ],
    { ...process.env, ...soapApi },
  );
  assert.equal(soapRuntime.code, 0, soapRuntime.output);
  assert.match(soapRuntime.output, /SOAP_PATTERN_RUNTIME_VERIFIED/);
  const preserveSoap = await run([fixture + '/deploy/configure-payments.mjs', '--activate']);
  assert.equal(preserveSoap.code, 0, preserveSoap.output);
  assert.equal(parse(await readFile(apiPath, 'utf8')).MELI_PAYAMAK_TRANSPORT, 'soap');
  console.log(
    'Production release verified: SOAP pattern with panel credentials, shared-template and console OTP contracts, five-digit code with leading zeros, preserved mode/private settings, no fixed login, old sessions rejected, override conflicts handled, SEO enabled. Provider traffic was mocked; no SMS, bank or database request was sent.',
  );
} finally {
  await rm(fixture, { recursive: true, force: true });
}
