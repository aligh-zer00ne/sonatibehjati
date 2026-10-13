import assert from 'node:assert/strict';
import {
  startAPI,
  db,
  gql,
  phone,
  challenge,
  keys,
  verification,
  codes,
  unlockResend,
  errorCode,
  cleanup,
  throttleKey,
} from './auth-harness.mjs';
try {
  const development = process.env.AUTH_VERIFY_DEVELOPMENT === 'true';
  await startAPI({ environment: development ? 'development' : 'test', developmentCode: '12345' });
  const adminCount = await db.adminRefreshToken.count();
  errorCode(await gql(keys.request, { input: { phone: 'not-a-phone' } }), 'BAD_USER_INPUT');
  errorCode(
    await gql(keys.request, { input: { phone: phone() } }, '', undefined, 'https://other.example'),
    'FORBIDDEN',
  );
  const otp = await challenge();
  if (development) assert.equal(codes.get(otp.phone), '12345');
  assert.match(codes.get(otp.phone), /^\d{5}$/);
  const record = await db.otpCode.findUniqueOrThrow({ where: { id: otp.challengeId } });
  assert.equal(record.codeHash.length, 64);
  assert.notEqual(record.codeHash, codes.get(otp.phone));
  assert.ok(record.sentAt);
  assert.ok(Date.parse(otp.expiresAt) - Date.now() <= 180000);
  assert.equal('code' in otp, false);
  const limited = await gql(keys.request, { input: { phone: otp.phone } });
  errorCode(limited, 'RATE_LIMITED');
  assert.ok(limited.errors[0].extensions.retryAfter > 0);
  const input = verification(otp);
  errorCode(
    await gql(keys.verify, { input: { ...input.input, code: '123456' } }),
    'BAD_USER_INPUT',
  );
  const wrong = codes.get(otp.phone) === '99999' ? '00000' : '99999';
  errorCode(await gql(keys.verify, { input: { ...input.input, code: wrong } }), 'INVALID_OTP');
  assert.equal(
    (await db.otpCode.findUniqueOrThrow({ where: { id: otp.challengeId } })).attempts,
    1,
  );
  const login = await gql(keys.verify, input);
  assert.equal(login.errors, undefined);
  assert.equal(login.data.verifyOtp.user.phone, otp.phone);
  const userId = login.data.verifyOtp.user.id;
  assert.equal(await db.user.count({ where: { phone: otp.phone } }), 1);
  assert.ok(login.cookies.includes('behjati_user_access='));
  assert.ok(login.cookies.includes('behjati_user_refresh='));
  assert.ok(
    login.response.headers
      .getSetCookie()
      .every(
        (cookie) =>
          cookie.includes('HttpOnly') &&
          cookie.includes('SameSite=Lax') &&
          !cookie.includes('Domain='),
      ),
  );
  assert.equal(typeof login.data.verifyOtp.accessToken, 'string');
  assert.ok(
    login.response.headers
      .getSetCookie()
      .find((value) => value.startsWith('behjati_user_access='))
      .includes('Max-Age=0'),
  );
  const cookieOnly = await fetch('http://localhost:4003/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `behjati_user_access=${login.data.verifyOtp.accessToken}`,
    },
    body: JSON.stringify({ query: keys.me }),
  });
  assert.equal((await cookieOnly.json()).data.me, null);
  assert.equal((await gql(keys.me, {}, login.cookies)).data.me.id, userId);
  errorCode(await gql(keys.verify, input), 'INVALID_OTP');
  const before = await db.refreshToken.findFirstOrThrow({ where: { userId } });
  const rotated = await gql(keys.refresh, {}, login.cookies);
  assert.equal(rotated.errors, undefined);
  assert.notEqual(rotated.cookies, login.cookies);
  const after = await db.refreshToken.findFirstOrThrow({ where: { userId, revokedAt: null } });
  assert.equal(after.expiresAt.getTime(), before.expiresAt.getTime());
  assert.equal(after.familyId, before.familyId);
  errorCode(await gql(keys.refresh, {}, login.cookies), 'UNAUTHENTICATED');
  assert.equal((await gql(keys.me, {}, rotated.cookies)).data.me, null);
  assert.ok((await db.userSession.findUniqueOrThrow({ where: { id: before.familyId } })).revokedAt);
  await unlockResend(otp.phone);
  const again = await gql(keys.request, { input: { phone: otp.phone } });
  assert.equal(again.errors, undefined);
  const existing = await gql(keys.verify, verification(again.data.requestOtp));
  assert.equal(existing.data.verifyOtp.user.id, userId);
  assert.equal(await db.user.count({ where: { phone: otp.phone } }), 1);
  const logout = await gql(keys.logout, {}, existing.cookies);
  assert.equal(logout.data.logout, true);
  assert.ok(logout.response.headers.getSetCookie().every((cookie) => cookie.includes('Max-Age=0')));
  assert.equal((await gql(keys.me, {}, existing.cookies)).data.me, null);
  errorCode(await gql(keys.refresh, {}, existing.cookies), 'UNAUTHENTICATED');
  const attempts = await challenge(undefined, '192.0.2.2');
  const attemptInput = verification(attempts);
  const wrongAttempt = attemptInput.input.code === '99999' ? '00000' : '99999';
  for (let i = 0; i < 5; i++)
    errorCode(
      await gql(
        keys.verify,
        { input: { ...attemptInput.input, code: wrongAttempt } },
        '',
        '192.0.2.2',
      ),
      'INVALID_OTP',
    );
  const locked = await db.otpCode.findUniqueOrThrow({ where: { id: attempts.challengeId } });
  assert.equal(locked.attempts, 5);
  assert.ok(locked.consumedAt);
  errorCode(await gql(keys.verify, attemptInput, '', '192.0.2.2'), 'INVALID_OTP');
  const expired = await challenge(undefined, '192.0.2.3');
  await db.otpCode.update({ where: { id: expired.challengeId }, data: { expiresAt: new Date(0) } });
  errorCode(await gql(keys.verify, verification(expired), '', '192.0.2.3'), 'INVALID_OTP');
  const replaced = await challenge(undefined, '192.0.2.4');
  const oldInput = verification(replaced);
  await unlockResend(replaced.phone);
  const resend = await gql(keys.request, { input: { phone: replaced.phone } }, '', '192.0.2.4');
  assert.equal(resend.errors, undefined);
  errorCode(await gql(keys.verify, oldInput, '', '192.0.2.4'), 'INVALID_OTP');
  assert.equal(
    (await gql(keys.verify, verification(resend.data.requestOtp), '', '192.0.2.4')).errors,
    undefined,
  );
  const concurrentPhone = phone();
  const sends = await Promise.all([
    gql(keys.request, { input: { phone: concurrentPhone } }, '', '192.0.2.5'),
    gql(keys.request, { input: { phone: concurrentPhone } }, '', '192.0.2.5'),
  ]);
  assert.equal(sends.filter((result) => result.data?.requestOtp).length, 1);
  errorCode(
    sends.find((result) => result.errors),
    'RATE_LIMITED',
  );
  const simultaneous = sends.find((result) => result.data?.requestOtp).data.requestOtp;
  const logins = await Promise.all([
    gql(keys.verify, verification(simultaneous), '', '192.0.2.5'),
    gql(keys.verify, verification(simultaneous), '', '192.0.2.5'),
  ]);
  assert.equal(logins.filter((result) => result.data?.verifyOtp).length, 1);
  errorCode(
    logins.find((result) => result.errors),
    'INVALID_OTP',
  );
  const session = logins.find((result) => result.data?.verifyOtp);
  const simultaneousRefresh = await Promise.all([
    gql(keys.refresh, {}, session.cookies, '192.0.2.5'),
    gql(keys.refresh, {}, session.cookies, '192.0.2.5'),
  ]);
  assert.equal(simultaneousRefresh.filter((result) => result.data?.refreshToken).length, 1);
  errorCode(
    simultaneousRefresh.find((result) => result.errors),
    'UNAUTHENTICATED',
  );
  assert.equal(
    (
      await gql(
        keys.me,
        {},
        simultaneousRefresh.find((result) => result.data?.refreshToken).cookies,
      )
    ).data.me,
    null,
  );
  const logoutRace = await challenge(undefined, '192.0.2.6');
  const raceLogin = await gql(keys.verify, verification(logoutRace), '', '192.0.2.6');
  await Promise.all([
    gql(keys.refresh, {}, raceLogin.cookies, '192.0.2.6'),
    gql(keys.logout, {}, raceLogin.cookies, '192.0.2.6'),
  ]);
  assert.equal(
    await db.userSession.count({
      where: { userId: raceLogin.data.verifyOtp.user.id, revokedAt: null },
    }),
    0,
  );
  const hourlyPhone = phone();
  for (let i = 0; i < 5; i++) {
    if (i) await unlockResend(hourlyPhone);
    assert.equal(
      (await gql(keys.request, { input: { phone: hourlyPhone } }, '', '192.0.2.7')).errors,
      undefined,
    );
  }
  await unlockResend(hourlyPhone);
  errorCode(
    await gql(keys.request, { input: { phone: hourlyPhone } }, '', '192.0.2.7'),
    'RATE_LIMITED',
  );
  const spoofPhone = phone();
  assert.equal(
    (await gql(keys.request, { input: { phone: spoofPhone } }, '', '192.0.2.31', undefined, false))
      .errors,
    undefined,
  );
  assert.equal(
    await db.authThrottle.findUnique({ where: { key: throttleKey('otp-ip:192.0.2.31') } }),
    null,
  );
  assert.equal((await gql(keys.me, {}, 'behjati_admin_access=untrusted')).data.me, null);
  assert.equal(await db.adminRefreshToken.count(), adminCount);
  console.log(
    'Auth API checks passed: hashed expiring OTP, resend/hourly limits, persistent failed attempts, single use and replacement, automatic registration and existing login, cookie flags, rotation/replay revocation, expiry and logout, concurrent OTP/refresh/logout safety, trusted proxy boundary and separate admin sessions.',
  );
} finally {
  await cleanup();
}
