import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
const root = process.cwd();
function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, args, {
      cwd: root,
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    p.stdout.on('data', (chunk) => (output += chunk));
    p.stderr.on('data', (chunk) => (output += chunk));
    p.on('error', reject);
    p.on('exit', (code) => resolve({ code, output }));
  });
}
const suffix = randomBytes(8).toString('hex');
const fixture = resolve('.deployment', 'verification', 'gateway-profile-' + suffix);
const target = new URL(process.env.DATABASE_URL);
assert.ok(
  ['localhost', '127.0.0.1'].includes(target.hostname) && target.port === '3307',
  'Use the managed local verification database only.',
);
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const databaseName = 'behjati_gateway_install_' + suffix;
let created = false;
try {
  await mkdir(fixture + '/deploy', { recursive: true });
  await mkdir(fixture + '/apps/api', { recursive: true });
  await mkdir(fixture + '/apps/storefront', { recursive: true });
  await copyFile('deploy/configure-payments.mjs', fixture + '/deploy/configure-payments.mjs');
  const secretNames = [
    'USER_ACCESS_TOKEN_SECRET',
    'USER_REFRESH_TOKEN_SECRET',
    'ADMIN_ACCESS_TOKEN_SECRET',
    'ADMIN_REFRESH_TOKEN_SECRET',
    'OTP_HASH_SECRET',
    'AUTH_PROXY_SECRET',
  ];
  const config = {
    NODE_ENV: 'development',
    SMS_PROVIDER: 'mock',
    DEV_OTP_CODE: '12345',
    DATABASE_URL: target.href,
    SEP_TERMINAL_ID: '12345678',
    MELI_PAYAMAK_API_KEY: '',
    MELI_PAYAMAK_OTP_BODY_ID: '',
    ...Object.fromEntries(secretNames.map((name) => [name, randomBytes(32).toString('hex')])),
  };
  await writeFile(
    fixture + '/apps/api/.env',
    Object.entries(config)
      .map(([key, value]) => key + '=' + JSON.stringify(value))
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  const prepared = await run([fixture + '/deploy/configure-payments.mjs', '--review']);
  assert.equal(prepared.code, 0, prepared.output);
  const content = await readFile(fixture + '/apps/api/.env', 'utf8');
  const api = parse(content);
  assert.equal(api.NODE_ENV, 'production');
  assert.equal(api.CUSTOMER_AUTH_ENABLED, 'false');
  assert.equal(api.ADMIN_PAYMENT_TEST_ENABLED, 'true');
  assert.equal(api.PAYMENT_PROVIDER, 'sep');
  assert.equal(api.DEV_OTP_CODE, '');
  assert.equal(api.SMS_PROVIDER, 'mock');
  for (const key of secretNames) assert.equal(api[key], config[key]);
  assert.equal(api.DATABASE_URL, config.DATABASE_URL);
  const front = parse(await readFile(fixture + '/apps/storefront/.env.production', 'utf8'));
  assert.equal(front.AUTH_PROXY_SECRET, api.AUTH_PROXY_SECRET);
  assert.equal(front.API_URL, 'http://127.0.0.1:4100/graphql');
  const production = await run(
    [
      '-e',
      "const { smsService } = await import('./apps/api/src/modules/auth/runtime.ts'); let refused=false; try { await smsService.sendOTP('09000000001','12345'); } catch { refused=true; } if (!refused) throw new Error('SMS must be disabled'); console.log('GATEWAY_REVIEW_PRODUCTION_OK');",
    ],
    { env: { ...process.env, ...api } },
  );
  assert.equal(production.code, 0, production.output);
  assert.ok(production.output.includes('GATEWAY_REVIEW_PRODUCTION_OK'));
  assert.ok(!production.output.includes('[Development SMS]'));
  const blocked = await run([fixture + '/deploy/configure-payments.mjs', '--activate']);
  assert.notEqual(blocked.code, 0);
  assert.ok(blocked.output.includes('real SMS'));
  assert.equal(await readFile(fixture + '/apps/api/.env', 'utf8'), content);
  await writeFile(
    fixture + '/apps/storefront/.env.local',
    'API_URL=http://conflicting.invalid/graphql\n',
  );
  const conflicting = await run([fixture + '/deploy/configure-payments.mjs', '--review']);
  assert.notEqual(conflicting.code, 0);
  assert.equal(await readFile(fixture + '/apps/api/.env', 'utf8'), content);
  await db.$executeRawUnsafe('CREATE DATABASE `' + databaseName + '` CHARACTER SET utf8mb4');
  created = true;
  target.pathname = '/' + databaseName;
  const migration = await run(
    [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    { cwd: resolve('apps/api'), env: { ...process.env, DATABASE_URL: target.href } },
  );
  assert.equal(migration.code, 0, migration.output);
  const fields = await db.$queryRawUnsafe(
    'SELECT COLUMN_NAME name, IS_NULLABLE nullable FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME IN (?, ?)',
    databaseName,
    'Payment',
    'orderId',
    'gatewayTestAdminId',
  );
  assert.equal(fields.length, 2);
  assert.ok(fields.every((field) => field.nullable === 'YES'));
  console.log(
    'Payment deployment checks passed: real production review mode starts without SMS credentials, private secrets/database preserved, customer auth closed, live activation guarded, conflicting env refused and all migrations applied successfully to a fresh empty local database.',
  );
} finally {
  if (created) await db.$executeRawUnsafe('DROP DATABASE `' + databaseName + '`');
  await db.$disconnect();
  await rm(fixture, { recursive: true, force: true });
}
