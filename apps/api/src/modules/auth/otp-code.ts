import { randomInt } from 'node:crypto';
import { OTP_LENGTH } from '@behjati/shared';

export function createOtpCode(environment: string, developmentCode?: string) {
  if (environment === 'development' && developmentCode) return developmentCode.slice(0, OTP_LENGTH);
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}
