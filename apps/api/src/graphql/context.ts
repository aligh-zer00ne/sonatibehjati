import type { IncomingMessage, ServerResponse } from 'node:http';
import { isIP } from 'node:net';
import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { authError } from '../modules/auth/errors.js';
export interface AuthContext {
  request: Request;
  response: ServerResponse;
  ip: string;
}
export function createAuthContext({
  request,
  req,
  res,
}: {
  request: Request;
  req: IncomingMessage;
  res: ServerResponse;
}): AuthContext {
  let ip = req.socket.remoteAddress ?? 'unknown';
  const secret = request.headers.get('x-auth-proxy-key') ?? '';
  const forwarded = request.headers.get('x-client-ip') ?? '';
  if (
    env.AUTH_PROXY_SECRET &&
    Buffer.byteLength(secret) === Buffer.byteLength(env.AUTH_PROXY_SECRET) &&
    timingSafeEqual(Buffer.from(secret), Buffer.from(env.AUTH_PROXY_SECRET)) &&
    env.AUTH_TRUST_PROXY_HEADERS === 'true' &&
    isIP(forwarded)
  )
    ip = forwarded;
  return { request, response: res, ip };
}
export function requireAuthOrigin(context: AuthContext) {
  if (
    context.request.method !== 'POST' ||
    context.request.headers.get('origin') !== new URL(env.STOREFRONT_ORIGIN).origin
  )
    throw authError('درخواست ورود مجاز نیست.', 'FORBIDDEN');
}
