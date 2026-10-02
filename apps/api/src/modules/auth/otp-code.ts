import { randomInt } from 'node:crypto';

export function createOtpCode(environment: string, developmentCode?: string) {
  if (environment === 'development' && developmentCode) return developmentCode;
  return String(randomInt(0, 1000000)).padStart(6, '0');
}
