import { describe, it, expect } from 'vitest';
import { randomBytes, scryptSync } from 'node:crypto';
import { RoleTokens, UserTokens, ADMIN_TOKEN_POLICY } from '../auth/tokens.js';
import { hashAdminPassword, verifyAdminPassword } from './passwords.js';
import { calendarBounds, dayStart, dayAfter, dateDays } from './time.js';
describe('Independent admin security', () => {
  it('rejects opposite-role JWTs even if secrets accidentally match', async () => {
    const a = randomBytes(48).toString('hex');
    const r = randomBytes(48).toString('hex');
    const user = new UserTokens(a, r);
    const admin = new RoleTokens(a, r, () => new Date(), ADMIN_TOKEN_POLICY);
    const up = await user.issue('subject');
    const ap = await admin.issue('subject');
    for (const kind of ['access', 'refresh'] as const) {
      await expect(user.verify(ap[kind], kind)).rejects.toThrow();
      await expect(admin.verify(up[kind], kind)).rejects.toThrow();
    }
  });
  it('expires admin access after ten minutes and refresh after eight hours', async () => {
    let now = new Date('2026-10-03T00:00:00Z');
    const admin = new RoleTokens(
      randomBytes(48).toString('hex'),
      randomBytes(48).toString('hex'),
      () => now,
      ADMIN_TOKEN_POLICY,
    );
    const pair = await admin.issue('admin');
    now = new Date('2026-10-03T00:10:00Z');
    await expect(admin.verify(pair.access, 'access')).rejects.toThrow();
    expect((await admin.verify(pair.refresh, 'refresh')).subjectId).toBe('admin');
    now = new Date('2026-10-03T08:00:00Z');
    await expect(admin.verify(pair.refresh, 'refresh')).rejects.toThrow();
  });
  it('uses salted passwords, verifies legacy seeds and rejects malformed hashes', async () => {
    const password = randomBytes(18).toString('hex');
    const one = await hashAdminPassword(password);
    const two = await hashAdminPassword(password);
    expect(one).not.toBe(two);
    expect(one).not.toContain(password);
    expect(await verifyAdminPassword(password, one)).toBe(true);
    expect(await verifyAdminPassword('wrong', one)).toBe(false);
    const salt = randomBytes(16).toString('hex');
    expect(
      await verifyAdminPassword(
        password,
        `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`,
      ),
    ).toBe(true);
    expect(await verifyAdminPassword(password, 'broken')).toBe(false);
    await expect(hashAdminPassword('short')).rejects.toThrow();
  });
  it('calculates Tehran day and Persian month boundaries', () => {
    expect(dayStart('2026-10-03').toISOString()).toBe('2026-10-02T20:30:00.000Z');
    expect(dayAfter('2026-10-03').toISOString()).toBe('2026-10-03T20:30:00.000Z');
    expect(calendarBounds(new Date('2026-10-03T12:00:00Z')).month).toBe('2026-09-23');
    expect(dateDays('2026-10-02', '2026-10-04')).toHaveLength(3);
  });
  it('requires an explicit maintenance override to hash a six-character password', async () => {
    await expect(hashAdminPassword('123456')).rejects.toThrow();
    await expect(hashAdminPassword('12345', true)).rejects.toThrow();
    const hash = await hashAdminPassword('123456', true);
    expect(await verifyAdminPassword('123456', hash)).toBe(true);
    expect(await verifyAdminPassword('654321', hash)).toBe(false);
  });
});
