import './setup-auth-env.mjs';
import { readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';
const path = 'apps/api/.env';
let text = readFileSync(path, 'utf8');
const values = parse(text);
if (process.env.NODE_ENV === 'production' || values.NODE_ENV === 'production')
  throw new Error('Admin setup is development-only.');
for (const [key, value] of [
  ['DEV_ADMIN_EMAIL', 'admin@sonatibehjati.local'],
  ['DEV_ADMIN_PASSWORD', randomBytes(24).toString('base64url')],
]) {
  if (!values[key])
    text = new RegExp(`^${key}=.*$`, 'm').test(text)
      ? text.replace(new RegExp(`^${key}=.*$`, 'm'), () => `${key}=${value}`)
      : text.trimEnd() + `\n${key}=${value}\n`;
}
writeFileSync(path, text, { mode: 0o600 });
chmodSync(path, 0o600);
const result = spawnSync(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
  cwd: 'apps/api',
  env: { ...process.env, ...parse(text), NODE_ENV: 'development' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
if (result.status !== 0)
  throw new Error('Development seed failed. Check the migrated DATABASE_URL and seed settings.');
console.log(
  'Development admin seeded. Credentials are preserved in private apps/api/.env (DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD); no production admin was created.',
);
