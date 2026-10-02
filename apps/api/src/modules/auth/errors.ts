import { GraphQLError } from 'graphql';
export const authError = (message: string, code: string, retryAfter?: number) =>
  new GraphQLError(message, {
    extensions: { code, ...(retryAfter !== undefined ? { retryAfter } : {}) },
  });
export const invalidSession = () =>
  authError('نشست شما پایان یافته است. دوباره وارد شوید.', 'UNAUTHENTICATED');
