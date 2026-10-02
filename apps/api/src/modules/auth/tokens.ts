import { randomUUID, createHash } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
export const ACCESS_SECONDS = 15 * 60;
export const REFRESH_SECONDS = 30 * 24 * 60 * 60;
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export class UserTokens {
  constructor(
    private accessSecret: string,
    private refreshSecret: string,
    private now = () => new Date(),
  ) {}
  async issue(
    userId: string,
    familyId: string = randomUUID(),
    expiresAt = new Date(this.now().getTime() + REFRESH_SECONDS * 1000),
  ) {
    const issuedAt = Math.floor(this.now().getTime() / 1000);
    const refreshId = randomUUID();
    const accessExpiresAt = new Date(
      Math.min((issuedAt + ACCESS_SECONDS) * 1000, expiresAt.getTime()),
    );
    const sign = (kind: 'access' | 'refresh', id: string, expiry: Date, secret: string) =>
      new SignJWT({ kind: `user_${kind}`, fid: familyId })
        .setProtectedHeader({ alg: 'HS256', typ: `behjati-user-${kind}+jwt` })
        .setIssuer('behjati-api')
        .setAudience('behjati-storefront')
        .setSubject(userId)
        .setJti(id)
        .setIssuedAt(issuedAt)
        .setExpirationTime(Math.floor(expiry.getTime() / 1000))
        .sign(new TextEncoder().encode(secret));
    const [access, refresh] = await Promise.all([
      sign('access', randomUUID(), accessExpiresAt, this.accessSecret),
      sign('refresh', refreshId, expiresAt, this.refreshSecret),
    ]);
    return { access, refresh, userId, familyId, refreshId, expiresAt, accessExpiresAt };
  }
  async verify(token: string, kind: 'access' | 'refresh') {
    if (token.length > 4096) throw new Error('Invalid token');
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(kind === 'access' ? this.accessSecret : this.refreshSecret),
      {
        algorithms: ['HS256'],
        typ: `behjati-user-${kind}+jwt`,
        issuer: 'behjati-api',
        audience: 'behjati-storefront',
        requiredClaims: ['sub', 'jti', 'iat', 'exp', 'fid', 'kind'],
        currentDate: this.now(),
      },
    );
    if (
      payload.kind !== `user_${kind}` ||
      typeof payload.sub !== 'string' ||
      typeof payload.fid !== 'string' ||
      typeof payload.jti !== 'string'
    )
      throw new Error('Invalid token');
    return { userId: payload.sub, familyId: payload.fid, id: payload.jti };
  }
}
export type TokenPair = Awaited<ReturnType<UserTokens['issue']>>;
