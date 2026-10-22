import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
export const db = new PrismaClient();
export const origin = 'http://localhost:3004';
export const adminOrigin = 'http://localhost:3005';
export const apiURL = 'http://localhost:4003';
export const otpSecret = randomBytes(48).toString('hex');
export const proxySecret = randomBytes(48).toString('hex');
export const codes = new Map();
export const phones = [];
const startedAt = new Date();
const base = Date.now() % 100000000;
export function phone() {
  const value = `090${String((base + phones.length) % 100000000).padStart(8, '0')}`;
  phones.push(value);
  return value;
}
export const keys = {
  request:
    'mutation($input:RequestOtpInput!){requestOtp(input:$input){challengeId phone expiresAt resendAt codeLength testMode}}',
  verify:
    'mutation($input:VerifyOtpInput!){verifyOtp(input:$input){user{id phone} accessToken accessExpiresAt}}',
  refresh: 'mutation{refreshToken{user{id phone} accessToken accessExpiresAt}}',
  logout: 'mutation{logout}',
  me: '{me{id phone}}',
};
export const processes = [];
const accessTokens = new Map();
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
export async function startAPI({ environment = 'test', developmentCode = '' } = {}) {
  assert.ok(process.env.DATABASE_URL, 'Set DATABASE_URL to the migrated test database');
  const server = spawn(process.execPath, ['dist/app.js'], {
    cwd: 'apps/api',
    env: {
      ...process.env,
      NODE_ENV: environment,
      DEV_OTP_CODE: developmentCode,
      PORT: '4003',
      ADMIN_ORIGIN: adminOrigin,
      ADMIN_ACCESS_TOKEN_SECRET: randomBytes(48).toString('hex'),
      ADMIN_REFRESH_TOKEN_SECRET: randomBytes(48).toString('hex'),
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
      const match = line.match(/\[Development SMS\] (09\d{9}): (\d{5})/);
      if (match) codes.set(match[1], match[2]);
    }
  });
  await ready(`${apiURL}/health`);
}
export async function startStorefront({ hostname = 'localhost' } = {}) {
  const rootRequire = createRequire(import.meta.url);
  const server = spawn(
    process.execPath,
    [rootRequire.resolve('next/dist/bin/next'), 'start', '--hostname', hostname, '--port', '3004'],
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
      ...(accessTokens.get(cookie) ? { Authorization: `Bearer ${accessTokens.get(cookie)}` } : {}),
      'X-Client-IP': ip,
      ...(authenticatedProxy ? { 'X-Auth-Proxy-Key': proxySecret } : {}),
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json();
  const cookies = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
  const session =
    body.data?.verifyOtp ??
    body.data?.refreshToken ??
    body.data?.adminLogin ??
    body.data?.adminRefresh;
  if (session?.accessToken) accessTokens.set(cookies, session.accessToken);
  return {
    response,
    ...body,
    cookies,
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
  const users = await db.user.findMany({
    where: { phone: { in: phones }, createdAt: { gte: startedAt } },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);
  await db.supportTicket.deleteMany({ where: { userId: { in: userIds } } });
  await db.offlinePayment.deleteMany({ where: { order: { userId: { in: userIds } } } });
  await db.customerAccountEntry.deleteMany({ where: { userId: { in: userIds } } });
  await db.orderItem.deleteMany({ where: { order: { userId: { in: userIds } } } });
  await db.order.deleteMany({ where: { userId: { in: userIds } } });
  await db.otpCode.deleteMany({ where: { phone: { in: phones }, createdAt: { gte: startedAt } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  const throttleKeys = phones.flatMap((mobile) => [`otp-resend:${mobile}`, `otp-phone:${mobile}`]);
  for (const id of userIds)
    throttleKeys.push(
      `address:${id}`,
      `quote:${id}`,
      `order:${id}`,
      `payment:${id}`,
      `location:${id}`,
      `profile:${id}`,
      `ticket:${id}`,
      `reply:${id}`,
      `review:${id}`,
    );
  for (const ip of [
    '127.0.0.1',
    '::ffff:127.0.0.1',
    ...Array.from({ length: 32 }, (_, i) => `192.0.2.${i + 1}`),
  ])
    throttleKeys.push(`otp-ip:${ip}`, `otp-verify-ip:${ip}`, `refresh-ip:${ip}`);
  await db.authThrottle.deleteMany({ where: { key: { in: throttleKeys.map(throttleKey) } } });
  await db.$disconnect();
}
