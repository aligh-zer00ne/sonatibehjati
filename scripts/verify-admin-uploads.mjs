import assert from 'node:assert/strict';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { startAPI, apiURL, adminOrigin } from './auth-harness.mjs';
import { createAdmin, loginAdmin, adminGql, adminQueries, cleanupAdmin } from './admin-harness.mjs';
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const sharp = require('sharp');
const directory = await mkdtemp(join(tmpdir(), 'behjati-upload-check-'));
process.env.UPLOAD_DIRECTORY = directory;
try {
  await startAPI();
  const admin = await createAdmin();
  const session = await loginAdmin(admin);
  const token = session.data.adminLogin.accessToken;
  const image = await sharp({
    create: { width: 2600, height: 1500, channels: 3, background: '#bc965b' },
  })
    .jpeg()
    .toBuffer();
  const upload = (body, type = 'image/jpeg', bearer = token, origin = adminOrigin) =>
    fetch(`${apiURL}/admin/uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': type,
        Origin: origin,
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body,
    });
  assert.equal((await upload(image, 'image/jpeg', '')).status, 401);
  assert.equal((await upload(image, 'image/jpeg', token, 'https://wrong.example')).status, 403);
  assert.equal((await upload('<svg><script>alert(1)</script></svg>', 'image/svg+xml')).status, 400);
  assert.equal((await upload('not an image', 'image/png')).status, 400);
  assert.equal((await upload(Buffer.alloc(8 * 1024 * 1024 + 1))).status, 413);
  const result = await upload(image);
  assert.equal(result.status, 201);
  const { url } = await result.json();
  assert.match(url, /^\/uploads\/products\/[a-f0-9-]{36}\.webp$/);
  const response = await fetch(apiURL + url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  const info = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  assert.equal(info.width, 2000);
  assert.equal(info.format, 'webp');
  assert.equal(info.exif, undefined);
  assert.equal((await readdir(join(directory, 'products'))).length, 1);
  assert.equal((await fetch(`${apiURL}/uploads/products/secret.env`)).status, 404);
  await adminGql(adminQueries.logout, {}, session.cookies);
  assert.equal((await upload(image)).status, 401, 'Revoked sessions cannot upload');
  console.log(
    'Image uploads verified: protected admin/origin, real raster validation, size limits, WebP resize, public delivery and revoked-session rejection.',
  );
} finally {
  await cleanupAdmin();
  await rm(directory, { recursive: true, force: true });
}
