import { requireCustomerAuth } from './availability.js';
import { randomUUID } from 'node:crypto';
import {
  otpRequestSchema,
  otpVerifySchemaForLength,
  OTP_LENGTH,
  OTP_LIFETIME_SECONDS,
  OTP_RESEND_SECONDS,
  OTP_MAX_ATTEMPTS,
} from '@behjati/shared';
import { db } from '../../database/client.js';
import { authConfig, smsService } from './runtime.js';
import { hashOtp, matchesOtp } from './crypto.js';
import { consumeAuthLimit } from './rate-limit.js';
import { authError } from './errors.js';
import { createSession } from './sessions.js';
import { env } from '../../config/env.js';
import { createOtpCode } from './otp-code.js';
const checkoutPaymentTest = env.CHECKOUT_PAYMENT_TEST_ENABLED === 'true';
const codeLength = checkoutPaymentTest ? 6 : OTP_LENGTH;
const verifySchema = otpVerifySchemaForLength(codeLength);
export async function requestOtp(raw: unknown, ip: string) {
  requireCustomerAuth();
  const parsed = otpRequestSchema.safeParse(raw);
  if (!parsed.success) throw authError('شماره موبایل معتبر وارد کنید.', 'BAD_USER_INPUT');
  const { phone } = parsed.data;
  await consumeAuthLimit(`otp-ip:${ip}`, 30, 3600);
  await consumeAuthLimit(`otp-resend:${phone}`, 1, OTP_RESEND_SECONDS);
  await consumeAuthLimit(`otp-phone:${phone}`, 5, 3600);
  const id = randomUUID();
  const code = createOtpCode(env.NODE_ENV, env.DEV_OTP_CODE, checkoutPaymentTest);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_LIFETIME_SECONDS * 1000);
  await db.$transaction(async (tx) => {
    await tx.otpCode.updateMany({ where: { phone, consumedAt: null }, data: { consumedAt: now } });
    await tx.otpCode.create({
      data: { id, phone, codeHash: hashOtp(authConfig.otpSecret, id, phone, code), expiresAt },
    });
  });
  try {
    await smsService.sendOTP(phone, code);
    await db.otpCode.update({ where: { id }, data: { sentAt: new Date() } });
  } catch {
    await db.otpCode.update({ where: { id }, data: { consumedAt: new Date() } });
    throw authError(
      'ارسال پیامک انجام نشد. کمی بعد دوباره تلاش کنید.',
      'SMS_UNAVAILABLE',
      OTP_RESEND_SECONDS,
    );
  }
  return {
    challengeId: id,
    codeLength,
    testMode: checkoutPaymentTest,
    phone,
    expiresAt: expiresAt.toISOString(),
    resendAt: new Date(now.getTime() + OTP_RESEND_SECONDS * 1000).toISOString(),
  };
}
export async function verifyOtp(raw: unknown, ip: string) {
  requireCustomerAuth();
  const parsed = verifySchema.safeParse(raw);
  if (!parsed.success)
    throw authError(
      checkoutPaymentTest
        ? 'شماره موبایل و کد شش‌رقمی را بررسی کنید.'
        : 'شماره موبایل و کد پنج‌رقمی را بررسی کنید.',
      'BAD_USER_INPUT',
    );
  await consumeAuthLimit(`otp-verify-ip:${ip}`, 50, 900);
  const { challengeId: id, phone, code } = parsed.data;
  const result = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM OtpCode WHERE id = ${id} FOR UPDATE`;
    const otp = await tx.otpCode.findUnique({ where: { id } });
    const now = new Date();
    if (
      !otp ||
      otp.phone !== phone ||
      !otp.sentAt ||
      otp.consumedAt ||
      otp.expiresAt <= now ||
      otp.attempts >= OTP_MAX_ATTEMPTS
    )
      return null;
    const valid = matchesOtp(authConfig.otpSecret, id, phone, code, otp.codeHash);
    await tx.otpCode.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        ...(valid || otp.attempts + 1 >= OTP_MAX_ATTEMPTS ? { consumedAt: now } : {}),
      },
    });
    if (!valid) return null;
    const user = await tx.user.upsert({ where: { phone }, create: { phone }, update: {} });
    const pair = await createSession(tx, user.id);
    return { user, pair };
  });
  if (!result)
    throw authError('کد نادرست است یا مهلت آن پایان یافته. کد تازه درخواست کنید.', 'INVALID_OTP');
  return result;
}
