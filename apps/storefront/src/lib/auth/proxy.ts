import 'server-only';
import { print } from 'graphql';
import { z } from 'zod';
import {
  otpRequestSchema,
  otpVerifySchema,
  USER_ACCESS_COOKIE,
  USER_REFRESH_COOKIE,
} from '@behjati/shared';
import {
  CurrentUserDocument,
  RequestOtpDocument,
  VerifyOtpDocument,
  RefreshUserSessionDocument,
  LogoutUserDocument,
} from '@/generated/graphql';
const empty = z.object({}).strict();
const operations = {
  CurrentUser: { document: CurrentUserDocument, schema: empty },
  RequestOtp: {
    document: RequestOtpDocument,
    schema: z.object({ input: otpRequestSchema }).strict(),
  },
  VerifyOtp: { document: VerifyOtpDocument, schema: z.object({ input: otpVerifySchema }).strict() },
  RefreshUserSession: { document: RefreshUserSessionDocument, schema: empty },
  LogoutUser: { document: LogoutUserDocument, schema: empty },
};
export const proxyInputSchema = z
  .object({
    operation: z.enum([
      'CurrentUser',
      'RequestOtp',
      'VerifyOtp',
      'RefreshUserSession',
      'LogoutUser',
    ]),
    variables: z.unknown(),
  })
  .strict();
type ProxyInput = z.infer<typeof proxyInputSchema>;
export const authCookies = (cookie: string | null) =>
  (cookie ?? '')
    .split(';')
    .map((value) => value.trim())
    .filter((value) => value.startsWith(`${USER_REFRESH_COOKIE}=`))
    .join('; ');
const failure = (message: string, code: string, status: number) =>
  Response.json(
    { errors: [{ message, extensions: { code } }] },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
export async function proxyAuth(request: Request, input: ProxyInput) {
  const operation = operations[input.operation];
  const parsed = operation.schema.safeParse(input.variables);
  if (!parsed.success) return failure('اطلاعات ورود را بررسی کنید.', 'BAD_USER_INPUT', 400);
  const cookie = authCookies(request.headers.get('cookie'));
  const authorization = request.headers.get('authorization') ?? '';
  if (input.operation === 'CurrentUser' && !authorization)
    return Response.json({ data: { me: null } }, { headers: { 'Cache-Control': 'no-store' } });
  if (input.operation === 'RefreshUserSession' && !cookie)
    return failure('نشست شما پایان یافته است.', 'UNAUTHENTICATED', 401);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Cookie: cookie,
    Authorization: authorization,
    Origin: new URL(
      process.env.STOREFRONT_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? request.url,
    ).origin,
  };
  if (process.env.AUTH_PROXY_SECRET) {
    headers['X-Auth-Proxy-Key'] = process.env.AUTH_PROXY_SECRET;
    if (process.env.AUTH_TRUST_PROXY_HEADERS === 'true')
      headers['X-Client-IP'] = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  }
  const call = async (document: typeof operation.document, variables: unknown) => {
    const response = await fetch(process.env.API_URL ?? 'http://localhost:4000/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: print(document), variables }),
      cache: 'no-store',
      signal: AbortSignal.timeout(13000),
    });
    if (!response.ok) throw new Error('Auth service unavailable');
    return { response, body: await response.json() };
  };
  try {
    const result = await call(operation.document, parsed.data);
    const known = [
      'BAD_USER_INPUT',
      'RATE_LIMITED',
      'INVALID_OTP',
      'SMS_UNAVAILABLE',
      'UNAUTHENTICATED',
      'FORBIDDEN',
    ];
    if (result.body.errors)
      result.body = {
        errors: result.body.errors.map(
          (error: { message: string; extensions?: { code?: string; retryAfter?: number } }) =>
            known.includes(error.extensions?.code ?? '')
              ? {
                  message: error.message,
                  extensions: {
                    code: error.extensions?.code,
                    retryAfter: error.extensions?.retryAfter,
                  },
                }
              : {
                  message: 'سرویس ورود موقتاً در دسترس نیست. دوباره تلاش کنید.',
                  extensions: { code: 'SERVICE_UNAVAILABLE' },
                },
        ),
      };
    const response = Response.json(result.body, { headers: { 'Cache-Control': 'no-store' } });
    for (const value of result.response.headers.getSetCookie()) {
      if ([USER_ACCESS_COOKIE, USER_REFRESH_COOKIE].some((name) => value.startsWith(`${name}=`)))
        response.headers.append('Set-Cookie', value);
    }
    return response;
  } catch {
    return failure(
      'سرویس ورود موقتاً در دسترس نیست. دوباره تلاش کنید.',
      'SERVICE_UNAVAILABLE',
      503,
    );
  }
}
