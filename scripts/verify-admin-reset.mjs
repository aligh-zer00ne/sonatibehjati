import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { startAPI, db } from './auth-harness.mjs';
import { createAdmin, loginAdmin, adminGql, adminQueries, cleanupAdmin } from './admin-harness.mjs';

function reset(currentEmail, email, allowShortPassword = false) {
  const result = spawnSync(
    process.execPath,
    ['scripts/reset-admin.mjs', ...(allowShortPassword ? ['--allow-short-password'] : [])],
    {
      env: {
        ...process.env,
        ADMIN_CURRENT_EMAIL: currentEmail,
        ADMIN_EMAIL: email,
        ADMIN_PASSWORD: '123456',
      },
      encoding: 'utf8',
    },
  );
  assert.ok(!(result.stdout + result.stderr).includes('123456'), 'Do not log passwords');
  return result.status;
}

try {
  await startAPI();
  const admin = await createAdmin();
  const other = await createAdmin();
  const session = await loginAdmin(admin);
  const otherSession = await loginAdmin(other);
  const email = `reset-${randomBytes(8).toString('hex')}@example.test`;
  assert.notEqual(reset(admin.email, email), 0, 'Short password must require override');
  assert.notEqual(reset(admin.email, other.email, true), 0, 'Do not overwrite another admin');
  assert.equal((await adminGql(adminQueries.me, {}, session.cookies)).data.adminMe.id, admin.id);
  assert.equal(reset(admin.email, email, true), 0);
  const updated = await db.admin.findUniqueOrThrow({ where: { id: admin.id } });
  assert.equal(updated.email, email, 'Preserve admin identity when renaming');
  assert.equal(await db.admin.findUnique({ where: { email: admin.email } }), null);
  assert.equal(await db.adminSession.count({ where: { adminId: admin.id, revokedAt: null } }), 0);
  assert.equal(
    await db.adminRefreshToken.count({ where: { adminId: admin.id, revokedAt: null } }),
    0,
  );
  assert.equal((await adminGql(adminQueries.me, {}, session.cookies)).data.adminMe, null);
  assert.ok((await adminGql(adminQueries.refresh, {}, session.cookies)).errors?.length);
  assert.equal(
    (await adminGql(adminQueries.me, {}, otherSession.cookies)).data.adminMe.id,
    other.id,
  );
  assert.ok((await loginAdmin(admin)).errors?.length, 'Old login must stop working');
  const newSession = await loginAdmin({ email, password: '123456' });
  assert.equal(newSession.data.adminLogin.admin.id, admin.id);
  assert.equal(reset('', email, true), 0, 'Subsequent resets select the destination account');
  console.log(
    'Admin reset checks passed: rename, short-password override, collision rollback, login and session revocation.',
  );
} finally {
  await cleanupAdmin();
}
