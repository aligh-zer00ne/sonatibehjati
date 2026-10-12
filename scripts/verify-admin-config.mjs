import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { defaultHomepage } from '@behjati/shared/homepage';
import { startAPI, db, apiURL, adminOrigin, errorCode, throttleKey } from './auth-harness.mjs';
import { createAdmin, loginAdmin, adminGql, admins, cleanupAdmin } from './admin-harness.mjs';
const grant =
  'mutation($id:ID!,$permissions:[AdminPermission!]!){setStaffPermissions(id:$id,permissions:$permissions){id permissions}}';
const save =
  'mutation($input:HomepageContentInput!,$expectedUpdatedAt:String){saveHomepageContent(input:$input,expectedUpdatedAt:$expectedUpdatedAt){updatedAt slides{title}}}';
let previous;
let testVersion;
try {
  await startAPI();
  previous = await db.homepageContent.findUnique({ where: { id: 'homepage' } });
  const owner = await createAdmin();
  const ownerSession = await loginAdmin(owner);
  const password = randomBytes(24).toString('hex');
  const created = await adminGql(
    'mutation($input:StaffInput!){createStaff(input:$input){id email permissions}}',
    { input: { email: `config-${randomBytes(6).toString('hex')}@example.test`, password } },
    ownerSession.cookies,
  );
  assert.equal(created.errors, undefined);
  assert.deepEqual(created.data.createStaff.permissions, []);
  const staff = { ...created.data.createStaff, password };
  admins.push(staff);
  const staffLogin = async () => {
    await db.authThrottle.deleteMany({
      where: { key: throttleKey(`admin-login-email:${staff.email}`) },
    });
    return loginAdmin(staff);
  };
  let session = await staffLogin();
  const sections = {
    DASHBOARD: '{adminDashboard{ordersCount}}',
    ORDERS: '{adminOrders(input:{page:1}){total}}',
    ORDER_MAP: '{adminOrders(input:{page:1}){total}}',
    PRODUCTS: '{adminProducts(input:{page:1}){total}}',
    CUSTOMERS: '{adminUsers(input:{page:1}){total}}',
    REPORTS: '{adminReport(input:{from:"2026-10-01",to:"2026-10-12"}){ordersCount}}',
    COUPONS: '{adminCoupons{id}}',
    TICKETS: '{adminTickets(input:{page:1}){total}}',
    REVIEWS: '{adminReviews(input:{page:1}){total}}',
    HOMEPAGE: '{adminHomepageContent{updatedAt}}',
  };
  for (const query of Object.values(sections))
    errorCode(await adminGql(query, {}, session.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(grant, { id: staff.id, permissions: ['DASHBOARD'] }, session.cookies),
    'FORBIDDEN',
  );
  errorCode(
    await adminGql(grant, { id: owner.id, permissions: [] }, ownerSession.cookies),
    'FORBIDDEN',
  );
  for (const [permission, query] of Object.entries(sections)) {
    const result = await adminGql(
      grant,
      { id: staff.id, permissions: [permission] },
      ownerSession.cookies,
    );
    assert.equal(result.errors, undefined);
    // Existing access and refresh tokens cannot survive a permission change.
    errorCode(await adminGql(query, {}, session.cookies), 'UNAUTHENTICATED');
    session = await staffLogin();
    assert.equal((await adminGql(query, {}, session.cookies)).errors, undefined, permission);
    errorCode(await adminGql('{adminAccounts{id}}', {}, session.cookies), 'FORBIDDEN');
    const denied = permission === 'TICKETS' ? sections.PRODUCTS : sections.TICKETS;
    errorCode(await adminGql(denied, {}, session.cookies), 'FORBIDDEN');
  }
  const data = structuredClone(defaultHomepage);
  data.slides[0].title = `محتوای آزمون ${randomBytes(4).toString('hex')}`;
  const stored = await adminGql(
    save,
    { input: data, expectedUpdatedAt: previous?.updatedAt.toISOString() ?? null },
    session.cookies,
  );
  assert.equal(stored.errors, undefined);
  testVersion = stored.data.saveHomepageContent.updatedAt;
  // Public content is independent of admin authentication.
  const publicResponse = await fetch(apiURL + '/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{homepageContent{slides{title} story{title}}}' }),
  });
  assert.equal(
    (await publicResponse.json()).data.homepageContent.slides[0].title,
    data.slides[0].title,
  );
  errorCode(
    await adminGql(
      save,
      { input: data, expectedUpdatedAt: previous?.updatedAt.toISOString() ?? null },
      ownerSession.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  const invalid = structuredClone(data);
  invalid.slides[0].href = 'javascript:alert(1)';
  errorCode(
    await adminGql(save, { input: invalid, expectedUpdatedAt: testVersion }, ownerSession.cookies),
    'BAD_USER_INPUT',
  );
  invalid.slides[0].href = '/shop';
  invalid.slides[0].src = '/images/../../private.jpg';
  errorCode(
    await adminGql(save, { input: invalid, expectedUpdatedAt: testVersion }, ownerSession.cookies),
    'BAD_USER_INPUT',
  );
  // A homepage-only colleague can upload homepage images, but cannot upload product images.
  const image = Buffer.from(
    await (
      await import('sharp')
    )
      .default({ create: { width: 24, height: 24, channels: 3, background: '#810c20' } })
      .png()
      .toBuffer(),
  );
  const sendUpload = async (purpose) => {
    const refreshed = await adminGql('mutation{adminRefresh{accessToken}}', {}, session.cookies);
    assert.equal(refreshed.errors, undefined);
    session.cookies = refreshed.cookies;
    return fetch(apiURL + '/admin/uploads' + (purpose ? '?purpose=' + purpose : ''), {
      method: 'POST',
      headers: {
        Origin: adminOrigin,
        Authorization: 'Bearer ' + refreshed.data.adminRefresh.accessToken,
        'Content-Type': 'image/png',
      },
      body: image,
    });
  };
  assert.equal((await sendUpload()).status, 403);
  const uploaded = await sendUpload('homepage');
  assert.equal(uploaded.status, 201);
  const { url } = await uploaded.json();
  await (await import('node:fs/promises')).unlink('apps/api' + url);
  const revoked = await adminGql(grant, { id: staff.id, permissions: [] }, ownerSession.cookies);
  assert.equal(revoked.errors, undefined);
  session = await staffLogin();
  errorCode(
    await adminGql(save, { input: data, expectedUpdatedAt: testVersion }, session.cookies),
    'FORBIDDEN',
  );
  assert.equal((await adminGql('{adminMe{permissions}}', {}, session.cookies)).errors, undefined);
  console.log(
    'Per-section grants/denials, owner-only account administration, session revocation, scoped uploads, public homepage content, validation and concurrent save conflicts passed.',
  );
} finally {
  if (testVersion) {
    const current = await db.homepageContent.findUnique({ where: { id: 'homepage' } });
    if (current?.updatedAt.toISOString() === testVersion) {
      if (previous)
        await db.homepageContent.update({
          where: { id: 'homepage' },
          data: { data: previous.data, updatedAt: previous.updatedAt },
        });
      else await db.homepageContent.delete({ where: { id: 'homepage' } });
    }
  }
  await cleanupAdmin();
}
