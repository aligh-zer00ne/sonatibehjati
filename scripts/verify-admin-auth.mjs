import assert from 'node:assert/strict';
import {
  startAPI,
  errorCode,
  gql,
  challenge,
  keys,
  verification,
  db,
  throttleKey,
  origin,
} from './auth-harness.mjs';
import { adminQueries, adminGql, createAdmin, loginAdmin, cleanupAdmin } from './admin-harness.mjs';
try {
  await startAPI({ environment: 'development', developmentCode: '123456' });
  const admin = await createAdmin();
  const input = { email: admin.email, password: admin.password };
  const read = 'query{adminDashboard{ordersCount}}';
  errorCode(await adminGql(read), 'UNAUTHENTICATED');
  errorCode(await adminGql(adminQueries.login, { input }, '', '192.0.2.1', origin), 'FORBIDDEN');
  const bad = await adminGql(adminQueries.login, { input: { ...input, password: 'wrong' } });
  errorCode(bad, 'INVALID_CREDENTIALS');
  const login = await loginAdmin(admin);
  assert.equal(login.errors, undefined);
  assert.equal(login.data.adminLogin.admin.id, admin.id);
  const cookie = login.cookies;
  const cookieHeader = login.response.headers.getSetCookie();
  assert.equal(cookieHeader.length, 1);
  assert.match(cookieHeader[0], /^behjati_admin_refresh=.*HttpOnly; SameSite=Lax; Max-Age=/);
  assert.ok(!cookieHeader.some((value) => value.startsWith('behjati_user_')));
  const family = await db.adminSession.findFirstOrThrow({ where: { adminId: admin.id } });
  assert.ok(family.expiresAt.getTime() - Date.now() <= 8 * 3600000);
  const identity = await adminGql(adminQueries.me, {}, cookie);
  assert.equal(identity.data.adminMe.id, admin.id);
  assert.equal(identity.response.headers.get('cache-control'), 'no-store');
  const otp = await challenge();
  const customer = await gql(keys.verify, verification(otp));
  errorCode(await adminGql(read, {}, customer.cookies), 'UNAUTHENTICATED');
  assert.equal((await gql(keys.me, {}, cookie)).data.me, null);
  assert.equal(
    (await adminGql(adminQueries.refresh, {}, customer.cookies)).errors[0].extensions.code,
    'UNAUTHENTICATED',
  );
  const rotated = await adminGql(adminQueries.refresh, {}, cookie);
  assert.equal(rotated.errors, undefined);
  assert.notEqual(rotated.cookies, cookie);
  errorCode(await adminGql(adminQueries.refresh, {}, cookie), 'UNAUTHENTICATED');
  errorCode(await adminGql(read, {}, rotated.cookies), 'UNAUTHENTICATED');
  assert.ok((await db.adminSession.findUniqueOrThrow({ where: { id: family.id } })).revokedAt);
  assert.equal(
    (await gql(keys.me, {}, customer.cookies)).data.me.id,
    customer.data.verifyOtp.user.id,
  );
  const next = await loginAdmin(admin);
  assert.equal(next.errors, undefined);
  assert.equal((await adminGql(adminQueries.logout, {}, next.cookies)).data.adminLogout, true);
  errorCode(await adminGql(read, {}, next.cookies), 'UNAUTHENTICATED');
  errorCode(await adminGql(adminQueries.refresh, {}, next.cookies), 'UNAUTHENTICATED');
  const brute = await createAdmin();
  for (let i = 0; i < 5; i++)
    errorCode(
      await adminGql(
        adminQueries.login,
        { input: { email: brute.email, password: 'wrong' } },
        '',
        '192.0.2.2',
      ),
      'INVALID_CREDENTIALS',
    );
  errorCode(
    await adminGql(
      adminQueries.login,
      { input: { email: brute.email, password: brute.password } },
      '',
      '192.0.2.2',
    ),
    'RATE_LIMITED',
  );
  const publicRegistration = await adminGql('mutation{createAdmin(email:"bad@example.com"){id}}');
  assert.ok(publicRegistration.errors);
  await db.authThrottle.deleteMany({
    where: { key: { in: [throttleKey(`admin-login-email:${admin.email}`)] } },
  });
  console.log(
    'Admin auth passed: independent roles/secrets/cookies, private queries, generic wrong credentials, origin guard, short access/8h refresh, rotation and replay revocation, logout, user-session isolation, brute-force limit and no public registration.',
  );
} finally {
  await cleanupAdmin();
}
