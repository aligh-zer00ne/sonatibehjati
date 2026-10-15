import { randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';
import { UserTokens } from './tokens.js';
import { createSMSService } from '../../services/smsService.js';
export const authConfig = {
  accessSecret: env.USER_ACCESS_TOKEN_SECRET ?? randomBytes(48).toString('base64url'),
  refreshSecret: env.USER_REFRESH_TOKEN_SECRET ?? randomBytes(48).toString('base64url'),
  otpSecret: env.OTP_HASH_SECRET ?? randomBytes(48).toString('base64url'),
};
export const userTokens = new UserTokens(authConfig.accessSecret, authConfig.refreshSecret);
export const smsService = createSMSService(
  env.NODE_ENV,
  {
    hostname: env.MELI_PAYAMAK_HOSTNAME,
    port: 443,
    path: env.MELI_PAYAMAK_PATH ?? process.env.MELI_PAYMAK_PATH ?? '/api/send/shared/{apiKey}',
    apiKey: env.MELI_PAYAMAK_API_KEY ?? process.env.MELI_PAYMAK_API_KEY ?? '',
    bodyId: env.MELI_PAYAMAK_OTP_BODY_ID ?? 0,
  },
  env.CUSTOMER_AUTH_ENABLED === 'true',
  env.CHECKOUT_PAYMENT_TEST_ENABLED === 'true',
);
