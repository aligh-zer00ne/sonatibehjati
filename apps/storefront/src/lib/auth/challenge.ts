'use client';
import type { RequestOtpMutation } from '@/generated/graphql';
import { z } from 'zod';
import { phoneSchema } from '@behjati/shared';
export type Challenge = RequestOtpMutation['requestOtp'];
const schema = z.object({
  challengeId: z.string().uuid(),
  phone: phoneSchema,
  expiresAt: z.iso.datetime(),
  resendAt: z.iso.datetime(),
});
const key = 'behjati-otp-challenge';
export function saveChallenge(challenge: Challenge) {
  sessionStorage.setItem(key, JSON.stringify(challenge));
}
export function loadChallenge(id: string): Challenge | null {
  try {
    const parsed = schema.safeParse(JSON.parse(sessionStorage.getItem(key) ?? 'null'));
    return parsed.success && parsed.data.challengeId === id ? parsed.data : null;
  } catch {
    return null;
  }
}
export function clearChallenge() {
  sessionStorage.removeItem(key);
}
