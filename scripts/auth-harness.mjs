import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
export const db = new PrismaClient();
export const origin = 'http://localhost:3004';
export const apiURL = 'http://localhost:4003';
export const otpSecret = randomBytes(48).toString('hex');
const proxySecret = randomBytes(48).toString('hex');
export const codes = new Map();
export const phones = [];
const base = Date.now() % 100000000;
export function phone() {
  const value = `090${String((base + phones.length) % 100000000).padStart(8, '0')}`;
  phones.push(value);
  return value;
}
export const keys = {
  request:
    'mutation($input:RequestOtpInput!){requestOtp(input:$input){challengeId phone expiresAt resendAt}}',
  verify:
    'mutation($input:VerifyOtpInput!){verifyOtp(input:$input){user{id phone} accessExpiresAt}}',
  refresh: 'mutation{refreshToken{user{id phone} accessExpiresAt}}',
  logout: 'mutation{logout}',
  me: '{me{id phone}}',
};
export const processes = [];
export async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* Await local service. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Local verification service did not start');
}
export async function startAPI() {
  assert.ok(process.env.DATABASE_URL, 'Set DATABASE_URL to the migrated test database');
  const server = spawn(process.execPath, ['dist/app.js'], {
    cwd: 'apps/api',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '4003',
      STOREFRONT_ORIGIN: origin,
      SMS_PROVIDER: 'mock',
      USER_ACCESS_TOKEN_SECRET: randomBytes(48).toString('hex'),
      USER_REFRESH_TOKEN_SECRET: randomBytes(48).toString('hex'),
      OTP_HASH_SECRET: otpSecret,
      AUTH_PROXY_SECRET: proxySecret,
      AUTH_TRUST_PROXY_HEADERS: 'true',
    },
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  processes.push(server);
  let output = '';
  server.stdout.on('data', (chunk) => {
    output += String(chunk);
    const lines = output.split('\n');
    output = lines.pop() ?? '';
    for (const line of lines) {
      const match = line.match(/\[Development SMS\] (09\d{9}): (\d{6})/);
      if (match) codes.set(match[1], match[2]);
    }
  });
  await ready(`${apiURL}/health`);
}
export async function startStorefront() {
  const rootRequire = createRequire(import.meta.url);
  const server = spawn(
    process.execPath,
    [rootRequire.resolve('next/dist/bin/next'), 'start', '--port', '3004'],
    {
      cwd: 'apps/storefront',
      env: {
        ...process.env,
        API_URL: `${apiURL}/graphql`,
        STOREFRONT_ORIGIN: origin,
        AUTH_PROXY_SECRET: proxySecret,
        AUTH_TRUST_PROXY_HEADERS: 'false',
      },
      stdio: 'ignore',
    },
  );
  processes.push(server);
  await ready(`${origin}/login`);
}
export async function gql(
  query,
  variables = {},
  cookie = '',
  ip = '192.0.2.1',
  requestOrigin = origin,
  authenticatedProxy = true,
) {
  const response = await fetch(`${apiURL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: requestOrigin,
      Cookie: cookie,
      'X-Client-IP': ip,
      ...(authenticatedProxy ? { 'X-Auth-Proxy-Key': proxySecret } : {}),
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json();
  return {
    response,
    ...body,
    cookies: response.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; '),
  };
}
export async function challenge(mobile = phone(), ip) {
  assert.equal(await db.user.count({ where: { phone: mobile } }), 0, 'Test number already exists');
  const result = await gql(keys.request, { input: { phone: mobile } }, '', ip);
  assert.equal(result.errors, undefined);
  assert.ok(codes.get(mobile));
  return result.data.requestOtp;
}
export const verification = (otp) => ({
  input: { challengeId: otp.challengeId, phone: otp.phone, code: codes.get(otp.phone) },
});
export const throttleKey = (key) =>
  createHmac('sha256', otpSecret).update(`rate:${key}`).digest('hex');
export async function unlockResend(mobile) {
  await db.authThrottle.update({
    where: { key: throttleKey(`otp-resend:${mobile}`) },
    data: { expiresAt: new Date(0) },
  });
}
export function errorCode(result, code) {
  assert.equal(result.errors?.[0]?.extensions?.code, code);
}
export async function cleanup() {
  for (const process of processes) process.kill('SIGTERM');
  await db.otpCode.deleteMany({ where: { phone: { in: phones } } });
  await db.user.deleteMany({ where: { phone: { in: phones } } });
  const throttleKeys = phones.flatMap((mobile) => [`otp-resend:${mobile}`, `otp-phone:${mobile}`]);
  for (const ip of [
    '127.0.0.1',
    '::ffff:127.0.0.1',
    ...Array.from({ length: 32 }, (_, i) => `192.0.2.${i + 1}`),
  ])
    throttleKeys.push(`otp-ip:${ip}`, `otp-verify-ip:${ip}`, `refresh-ip:${ip}`);
  await db.authThrottle.deleteMany({ where: { key: { in: throttleKeys.map(throttleKey) } } });
  await db.$disconnect();
}
