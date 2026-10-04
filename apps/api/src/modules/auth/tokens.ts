import { randomUUID, createHash } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
export const ACCESS_SECONDS = 15 * 60;
export const REFRESH_SECONDS = 30 * 24 * 60 * 60;
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const USER_TOKEN_POLICY = {
  role: 'user',
  audience: 'behjati-storefront',
  accessSeconds: ACCESS_SECONDS,
  refreshSeconds: REFRESH_SECONDS,
} as const;
export const ADMIN_TOKEN_POLICY = {
  role: 'admin',
  audience: 'behjati-admin',
  accessSeconds: 10 * 60,
  refreshSeconds: 8 * 60 * 60,
} as const;
type TokenPolicy = {
  role: 'user' | 'admin';
  audience: string;
  accessSeconds: number;
  refreshSeconds: number;
};
export class RoleTokens {
  constructor(
    private accessSecret: string,
    private refreshSecret: string,
    private now = () => new Date(),
    private policy: TokenPolicy = USER_TOKEN_POLICY,
  ) {}
  async issue(
    subjectId: string,
    familyId: string = randomUUID(),
    expiresAt = new Date(this.now().getTime() + this.policy.refreshSeconds * 1000),
  ) {
    const issuedAt = Math.floor(this.now().getTime() / 1000);
    const refreshId = randomUUID();
    const accessExpiresAt = new Date(
      Math.min((issuedAt + this.policy.accessSeconds) * 1000, expiresAt.getTime()),
    );
    const sign = (kind: 'access' | 'refresh', id: string, expiry: Date, secret: string) =>
      new SignJWT({ kind: `${this.policy.role}_${kind}`, fid: familyId })
        .setProtectedHeader({ alg: 'HS256', typ: `behjati-${this.policy.role}-${kind}+jwt` })
        .setIssuer('behjati-api')
        .setAudience(this.policy.audience)
        .setSubject(subjectId)
        .setJti(id)
        .setIssuedAt(issuedAt)
        .setExpirationTime(Math.floor(expiry.getTime() / 1000))
        .sign(new TextEncoder().encode(secret));
    const [access, refresh] = await Promise.all([
      sign('access', randomUUID(), accessExpiresAt, this.accessSecret),
      sign('refresh', refreshId, expiresAt, this.refreshSecret),
    ]);
    return { access, refresh, subjectId, familyId, refreshId, expiresAt, accessExpiresAt };
  }
  async verify(token: string, kind: 'access' | 'refresh') {
    if (token.length > 4096) throw new Error('Invalid token');
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(kind === 'access' ? this.accessSecret : this.refreshSecret),
      {
        algorithms: ['HS256'],
        typ: `behjati-${this.policy.role}-${kind}+jwt`,
        issuer: 'behjati-api',
        audience: this.policy.audience,
        requiredClaims: ['sub', 'jti', 'iat', 'exp', 'fid', 'kind'],
        currentDate: this.now(),
      },
    );
    if (
      payload.kind !== `${this.policy.role}_${kind}` ||
      typeof payload.sub !== 'string' ||
      typeof payload.fid !== 'string' ||
      typeof payload.jti !== 'string'
    )
      throw new Error('Invalid token');
    return { subjectId: payload.sub, familyId: payload.fid, id: payload.jti };
  }
}
export class UserTokens extends RoleTokens {
  override async issue(userId: string, familyId?: string, expiresAt?: Date) {
    const pair = await super.issue(userId, familyId, expiresAt);
    return { ...pair, userId: pair.subjectId };
  }
  override async verify(token: string, kind: 'access' | 'refresh') {
    const claims = await super.verify(token, kind);
    return { ...claims, userId: claims.subjectId };
  }
}
export type TokenPair = Awaited<ReturnType<UserTokens['issue']>>;
