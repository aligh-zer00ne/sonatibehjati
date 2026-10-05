import { randomBytes } from 'node:crypto';
import { writeFileSync, chmodSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2] ?? '/etc/nginx';
if (directory === '/etc/nginx' && process.getuid?.() !== 0)
  throw new Error('Run this command with sudo using the full Node executable path.');
if (!existsSync(directory)) throw new Error('The target directory must exist.');
const token = randomBytes(32).toString('hex');
const files = {
  'sonatibehjati-preview-server.conf': `auth_basic "Sonati Behjati preview";\nauth_basic_user_file ${join(directory, 'sonatibehjati-preview.htpasswd')};\n`,
  // Do not use "always": a rejected Basic-auth response must NEVER issue the gate cookie.
  'sonatibehjati-preview-cookie.conf': `add_header Set-Cookie "behjati_preview=${token}; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Lax";\n`,
  // APIs receive Bearer tokens. Gate them by the cookie issued after a successful Basic login.
  'sonatibehjati-preview-api.conf': `auth_basic off;\nif ($cookie_behjati_preview != "${token}") { return 403; }\n`,
};
for (const [name, text] of Object.entries(files)) {
  const path = join(directory, name);
  writeFileSync(path, text, { mode: 0o600 });
  chmodSync(path, 0o600);
}
console.log(
  'Preview access snippets generated; token was not printed. Create the htpasswd file before nginx -t.',
);
