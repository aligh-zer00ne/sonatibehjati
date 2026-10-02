import type { ServerResponse } from 'node:http';
import type { TokenPair } from './tokens.js';
export {
  USER_ACCESS_COOKIE as ACCESS_COOKIE,
  USER_REFRESH_COOKIE as REFRESH_COOKIE,
} from '@behjati/shared';
import {
  USER_ACCESS_COOKIE as ACCESS_COOKIE,
  USER_REFRESH_COOKIE as REFRESH_COOKIE,
} from '@behjati/shared';
export function readCookie(header: string | null, name: string) {
  const value = header
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
  if (!value || value.length > 4096) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}
export function serializeCookie(name: string, token: string, seconds: number, secure: boolean) {
  return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, Math.floor(seconds))}${secure ? '; Secure' : ''}`;
}
export function setSessionCookies(response: ServerResponse, pair: TokenPair, secure: boolean) {
  response.appendHeader('Set-Cookie', [
    // Remove the access cookie used by earlier storefront versions.
    serializeCookie(ACCESS_COOKIE, '', 0, secure),
    serializeCookie(
      REFRESH_COOKIE,
      pair.refresh,
      (pair.expiresAt.getTime() - Date.now()) / 1000,
      secure,
    ),
  ]);
  response.setHeader('Cache-Control', 'no-store');
}
export function readBearer(header: string | null) {
  if (!header || header.length > 4103) return undefined;
  return /^Bearer ([A-Za-z0-9._-]+)$/i.exec(header)?.[1];
}
export function clearSessionCookies(response: ServerResponse, secure: boolean) {
  response.appendHeader('Set-Cookie', [
    serializeCookie(ACCESS_COOKIE, '', 0, secure),
    serializeCookie(REFRESH_COOKIE, '', 0, secure),
  ]);
  response.setHeader('Cache-Control', 'no-store');
}
