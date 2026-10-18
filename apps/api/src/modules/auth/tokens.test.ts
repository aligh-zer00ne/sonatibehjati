import { describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  UserTokens,
  USER_TOKEN_POLICY,
  hashToken,
  ACCESS_SECONDS,
  REFRESH_SECONDS,
} from './tokens.js';
import { hashOtp, matchesOtp } from './crypto.js';
import { readCookie, serializeCookie } from './cookies.js';
describe('user session cryptography', () => {
  it('rejects pre-release access and refresh tokens after switching to SMS and preserves new SMS sessions', async () => {
    const access = randomBytes(48).toString('hex');
    const refresh = randomBytes(48).toString('hex');
    const trial = new UserTokens(access, refresh);
    const production = () =>
      new UserTokens(access, refresh, undefined, {
        ...USER_TOKEN_POLICY,
        authenticationMethod: 'sms',
      });
    const previous = await trial.issue('existing-customer');
    await expect(production().verify(previous.access, 'access')).rejects.toThrow();
    await expect(production().verify(previous.refresh, 'refresh')).rejects.toThrow();
    const current = await production().issue('existing-customer');
    expect(await production().verify(current.access, 'access')).toMatchObject({
      userId: 'existing-customer',
    });
    expect(await production().verify(current.refresh, 'refresh')).toMatchObject({
      familyId: current.familyId,
    });
  });
  it('separates access and refresh tokens and enforces expiry and tamper checks', async () => {
    let now = new Date('2026-10-02T00:00:00Z');
    const tokens = new UserTokens(
      randomBytes(48).toString('hex'),
      randomBytes(48).toString('hex'),
      () => now,
    );
    const pair = await tokens.issue('user-id');
    expect(await tokens.verify(pair.access, 'access')).toMatchObject({
      userId: 'user-id',
      familyId: pair.familyId,
    });
    await expect(tokens.verify(pair.access, 'refresh')).rejects.toThrow();
    await expect(tokens.verify(pair.refresh, 'access')).rejects.toThrow();
    await expect(tokens.verify(`${pair.access.slice(0, -5)}wrong`, 'access')).rejects.toThrow();
    expect(hashToken(pair.refresh)).not.toContain(pair.refresh);
    now = new Date(now.getTime() + ACCESS_SECONDS * 1000);
    await expect(tokens.verify(pair.access, 'access')).rejects.toThrow();
    expect(await tokens.verify(pair.refresh, 'refresh')).toMatchObject({ userId: 'user-id' });
    now = new Date('2026-10-02T00:00:00Z');
    now = new Date(now.getTime() + REFRESH_SECONDS * 1000);
    await expect(tokens.verify(pair.refresh, 'refresh')).rejects.toThrow();
  });
  it('rejects tokens issued with another secret', async () => {
    const user = new UserTokens(randomBytes(48).toString('hex'), randomBytes(48).toString('hex'));
    const other = new UserTokens(randomBytes(48).toString('hex'), randomBytes(48).toString('hex'));
    const pair = await other.issue('admin-id');
    await expect(user.verify(pair.access, 'access')).rejects.toThrow();
    await expect(user.verify(pair.refresh, 'refresh')).rejects.toThrow();
  });
  it('binds OTP hashes to the challenge and phone', () => {
    const secret = randomBytes(48).toString('hex');
    const hash = hashOtp(secret, 'challenge', '09000000001', '012345');
    expect(matchesOtp(secret, 'challenge', '09000000001', '012345', hash)).toBe(true);
    expect(matchesOtp(secret, 'other', '09000000001', '012345', hash)).toBe(false);
    expect(matchesOtp(secret, 'challenge', '09000000002', '012345', hash)).toBe(false);
    expect(matchesOtp(secret, 'challenge', '09000000001', '999999', hash)).toBe(false);
    expect(matchesOtp(secret, 'challenge', '09000000001', '012345', '')).toBe(false);
  });
  it('sets host-only HttpOnly secure cookies and clears malformed cookie values', () => {
    expect(serializeCookie('user', 'token', 900, true)).toBe(
      'user=token; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; Secure',
    );
    expect(serializeCookie('user', '', 0, true)).toContain('Max-Age=0');
    expect(readCookie('other=ok; user=a.b.c', 'user')).toBe('a.b.c');
    expect(readCookie('user=%broken', 'user')).toBeUndefined();
  });
});
