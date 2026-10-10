import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
export async function hashAdminPassword(password: string, allowShortPassword = false) {
  const minimum = allowShortPassword ? 6 : 12;
  if (password.length < minimum || password.length > 128)
    throw new Error(`Admin password must contain ${minimum}–128 characters.`);
  const salt = randomBytes(16).toString('hex');
  const key = await new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
  return `scrypt:32768:8:1:${salt}:${key.toString('hex')}`;
}
export async function verifyAdminPassword(password: string, hash: string) {
  if (password.length > 128) return false;
  const parts = hash.split(':');
  let key: Buffer, expected: string;
  if (
    parts.length === 3 &&
    parts[0] === 'scrypt' &&
    /^[a-f0-9]{32}$/.test(parts[1] ?? '') &&
    /^[a-f0-9]{128}$/.test(parts[2] ?? '')
  ) {
    key = (await derive(password, parts[1]!, 64)) as Buffer;
    expected = parts[2]!;
  } else if (
    parts.length === 6 &&
    parts.slice(0, 4).join(':') === 'scrypt:32768:8:1' &&
    /^[a-f0-9]{32}$/.test(parts[4] ?? '') &&
    /^[a-f0-9]{128}$/.test(parts[5] ?? '')
  ) {
    key = await new Promise<Buffer>((resolve, reject) =>
      scrypt(
        password,
        parts[4]!,
        64,
        { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
        (error, key) => (error ? reject(error) : resolve(key)),
      ),
    );
    expected = parts[5]!;
  } else return false;
  return timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
