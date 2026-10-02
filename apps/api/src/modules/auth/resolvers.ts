import type { Resolvers } from '../../generated/resolvers.js';
import { env } from '../../config/env.js';
import { requireAuthOrigin } from '../../graphql/context.js';
import {
  readBearer,
  REFRESH_COOKIE,
  readCookie,
  setSessionCookies,
  clearSessionCookies,
} from './cookies.js';
import { requestOtp, verifyOtp } from './otp.js';
import { currentUser, rotateSession, revokeSession } from './sessions.js';
import { consumeAuthLimit } from './rate-limit.js';
const secure = env.NODE_ENV === 'production';
export const authResolvers: Resolvers = {
  Query: {
    me: (_parent, _args, context) =>
      currentUser(readBearer(context.request.headers.get('authorization'))),
  },
  Mutation: {
    requestOtp: (_parent, { input }, context) => {
      requireAuthOrigin(context);
      return requestOtp(input, context.ip);
    },
    verifyOtp: async (_parent, { input }, context) => {
      requireAuthOrigin(context);
      const result = await verifyOtp(input, context.ip);
      setSessionCookies(context.response, result.pair, secure);
      return {
        user: result.user,
        accessToken: result.pair.access,
        accessExpiresAt: result.pair.accessExpiresAt.toISOString(),
      };
    },
    refreshToken: async (_parent, _args, context) => {
      requireAuthOrigin(context);
      await consumeAuthLimit(`refresh-ip:${context.ip}`, 120, 900);
      try {
        const result = await rotateSession(
          readCookie(context.request.headers.get('cookie'), REFRESH_COOKIE),
        );
        setSessionCookies(context.response, result.pair, secure);
        return {
          user: result.user,
          accessToken: result.pair.access,
          accessExpiresAt: result.pair.accessExpiresAt.toISOString(),
        };
      } catch (error) {
        if (
          error instanceof Error &&
          'extensions' in error &&
          (error.extensions as { code?: string }).code === 'UNAUTHENTICATED'
        )
          clearSessionCookies(context.response, secure);
        throw error;
      }
    },
    logout: async (_parent, _args, context) => {
      requireAuthOrigin(context);
      await revokeSession(
        readBearer(context.request.headers.get('authorization')),
        readCookie(context.request.headers.get('cookie'), REFRESH_COOKIE),
      );
      clearSessionCookies(context.response, secure);
      return true;
    },
  },
};
