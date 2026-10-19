import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hashOtp } from './crypto.js';

const state = vi.hoisted(() => ({
  record: null as null | {
    id: string;
    phone: string;
    codeHash: string;
    sentAt: Date | null;
    consumedAt: Date | null;
    expiresAt: Date;
    attempts: number;
  },
  send: vi.fn(),
}));
vi.mock('./availability.js', () => ({ requireCustomerAuth: vi.fn() }));
vi.mock('./runtime.js', () => ({
  authConfig: { otpSecret: 'fixture-otp-secret' },
  smsService: { sendOTP: state.send },
}));
vi.mock('./otp-code.js', () => ({ createOtpCode: () => '98765' }));
vi.mock('./rate-limit.js', () => ({ consumeAuthLimit: vi.fn() }));
vi.mock('./sessions.js', () => ({ createSession: async () => ({ access: 'fixture-access' }) }));
vi.mock('../../config/env.js', () => ({
  env: { NODE_ENV: 'production', CHECKOUT_PAYMENT_TEST_ENABLED: 'false' },
}));
vi.mock('../../database/client.js', () => {
  const tx = {
    $queryRaw: vi.fn(),
    otpCode: {
      updateMany: async () => {
        if (state.record) state.record.consumedAt = new Date();
      },
      create: async ({ data }: { data: NonNullable<typeof state.record> }) => {
        state.record = { ...data, attempts: 0, consumedAt: null, sentAt: null };
      },
      update: async ({
        data,
      }: {
        data: {
          attempts?: { increment: number };
          consumedAt?: Date;
          codeHash?: string;
          sentAt?: Date;
        };
      }) => {
        if (!state.record) throw new Error('No challenge');
        const { attempts, ...values } = data;
        Object.assign(state.record, values);
        if (attempts) state.record.attempts += attempts.increment;
      },
      findUnique: async () => state.record,
    },
    user: { upsert: async () => ({ id: 'fixture-customer', phone: '09000000001' }) },
  };
  return {
    db: { ...tx, $transaction: async (work: (client: typeof tx) => Promise<unknown>) => work(tx) },
  };
});
import { requestOtp, verifyOtp } from './otp.js';

beforeEach(() => {
  state.record = null;
  state.send.mockReset();
});
describe('delivered OTP and login verification', () => {
  const phone = '09000000001';
  it('verifies the console-generated code, rejects the unused local code and prevents replay', async () => {
    state.send.mockResolvedValue('00042');
    const challenge = await requestOtp({ phone }, '192.0.2.1');
    expect(challenge.codeLength).toBe(5);
    expect(JSON.stringify(challenge)).not.toContain('00042');
    expect(state.record?.codeHash).toBe(
      hashOtp('fixture-otp-secret', challenge.challengeId, phone, '00042'),
    );
    expect(state.record?.codeHash).not.toContain('00042');
    const input = { phone, challengeId: challenge.challengeId };
    await expect(verifyOtp({ ...input, code: '98765' }, '192.0.2.1')).rejects.toMatchObject({
      extensions: { code: 'INVALID_OTP' },
    });
    expect((await verifyOtp({ ...input, code: '00042' }, '192.0.2.1')).user.id).toBe(
      'fixture-customer',
    );
    await expect(verifyOtp({ ...input, code: '00042' }, '192.0.2.1')).rejects.toMatchObject({
      extensions: { code: 'INVALID_OTP' },
    });
  });
  it('keeps supplied-code verification for shared templates and development', async () => {
    state.send.mockResolvedValue(undefined);
    const challenge = await requestOtp({ phone }, '192.0.2.1');
    expect(
      (await verifyOtp({ phone, challengeId: challenge.challengeId, code: '98765' }, '192.0.2.1'))
        .user.id,
    ).toBe('fixture-customer');
  });
  it.each(['123456', '1234', null])(
    'invalidates a challenge if a provider returns an unusable code: %s',
    async (code) => {
      state.send.mockResolvedValue(code);
      await expect(requestOtp({ phone }, '192.0.2.1')).rejects.toMatchObject({
        extensions: { code: 'SMS_UNAVAILABLE' },
      });
      expect(state.record?.sentAt).toBeNull();
      expect(state.record?.consumedAt).toBeInstanceOf(Date);
    },
  );
  it('invalidates a challenge after a provider failure', async () => {
    state.send.mockRejectedValue(new Error('provider failure'));
    await expect(requestOtp({ phone }, '192.0.2.1')).rejects.toMatchObject({
      extensions: { code: 'SMS_UNAVAILABLE' },
    });
    expect(state.record?.sentAt).toBeNull();
    expect(state.record?.consumedAt).toBeInstanceOf(Date);
  });
});
