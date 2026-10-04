import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { startAPI, errorCode, db, origin } from './auth-harness.mjs';
import {
  adminGql,
  createAdmin,
  loginAdmin,
  cleanupAdmin,
  products,
  createCustomer,
  createOrderFixture,
} from './admin-harness.mjs';
const fields = 'id slug title price weight isActive updatedAt images{url alt}';
const save = `mutation($id:ID,$expectedUpdatedAt:String,$input:AdminProductInput!){saveAdminProduct(id:$id,expectedUpdatedAt:$expectedUpdatedAt,input:$input){${fields}}}`;
const active = `mutation($id:ID!,$isActive:Boolean!,$expectedUpdatedAt:String!){setAdminProductActive(id:$id,isActive:$isActive,expectedUpdatedAt:$expectedUpdatedAt){${fields}}}`;
const remove =
  'mutation($id:ID!,$expectedUpdatedAt:String!){deleteAdminProduct(id:$id,expectedUpdatedAt:$expectedUpdatedAt){deleted product{id isActive updatedAt}}}';
const orders =
  'query($input:AdminOrdersInput!){adminOrders(input:$input){total page totalPages items{id number status total address{city recipientName latitude longitude} user{id phone}}}}';
const detail =
  'query($id:ID!){adminOrder(id:$id){id status total subtotal discount shipping address{city postalAddress recipientName} items{productTitle unitPrice quantity lineTotal} statusEvents{fromStatus toStatus admin{id}}}}';
const change =
  'mutation($input:AdminOrderStatusInput!){updateAdminOrderStatus(input:$input){id status statusEvents{id}}}';
const report =
  'query($input:AdminReportInput!){adminReport(input:$input){ordersCount orderValue averageOrderValue revenue daily{date ordersCount orderValue revenue} statuses{status count}}}';
try {
  await startAPI();
  const admin = await createAdmin();
  const login = await loginAdmin(admin);
  assert.equal(login.errors, undefined);
  const cookie = login.cookies;
  const run = async (query, variables = {}) => {
    const result = await adminGql(query, variables, cookie);
    assert.equal(result.errors, undefined, JSON.stringify(result.errors));
    return result.data;
  };
  for (const query of [
    '{adminProducts(input:{}){total}}',
    '{adminOrders(input:{}){total}}',
    '{adminOrder(id:"missing"){id}}',
    '{adminUsers(input:{}){total}}',
    '{adminUser(id:"missing"){id}}',
    '{adminReport(input:{from:"2030-01-01",to:"2030-01-02"}){ordersCount}}',
  ])
    errorCode(await adminGql(query), 'UNAUTHENTICATED');
  const category = await db.category.findFirstOrThrow();
  const input = {
    title: 'محصول آزمون مدیریت',
    slug: `test-admin-${randomBytes(8).toString('hex')}`,
    price: 100000,
    weight: '۵۰۰ گرم',
    shortDescription: 'توضیح کوتاه',
    description: 'شرح آزمون',
    categoryId: category.id,
    isActive: true,
    badge: '',
    images: [
      { url: '/images/products/halva.png', alt: 'اول' },
      { url: 'https://example.com/second.png', alt: 'دوم' },
    ],
  };
  errorCode(await adminGql(save, { input }), 'UNAUTHENTICATED');
  errorCode(await adminGql(save, { input }, cookie, '192.0.2.1', origin), 'FORBIDDEN');
  for (const bad of [
    { price: -1 },
    { categoryId: 'missing' },
    { images: [{ url: 'javascript:alert(1)', alt: 'بد' }] },
  ])
    errorCode(await adminGql(save, { input: { ...input, ...bad } }, cookie), 'BAD_USER_INPUT');
  let product = (await run(save, { input })).saveAdminProduct;
  products.add(product.id);
  assert.deepEqual(
    product.images.map((image) => image.alt),
    ['اول', 'دوم'],
  );
  errorCode(await adminGql(save, { input }, cookie), 'BAD_USER_INPUT');
  product = (
    await run(save, {
      id: product.id,
      expectedUpdatedAt: product.updatedAt,
      input: { ...input, price: 120000, images: [...input.images].reverse() },
    })
  ).saveAdminProduct;
  assert.deepEqual(
    product.images.map((image) => image.alt),
    ['دوم', 'اول'],
  );
  const oldVersion = product.updatedAt;
  product = (await run(active, { id: product.id, isActive: false, expectedUpdatedAt: oldVersion }))
    .setAdminProductActive;
  assert.notEqual(product.updatedAt, oldVersion);
  errorCode(
    await adminGql(
      active,
      { id: product.id, isActive: true, expectedUpdatedAt: oldVersion },
      cookie,
    ),
    'REQUEST_CONFLICT',
  );
  assert.equal(
    (await run('query($slug:String!){product(slug:$slug){id}}', { slug: product.slug })).product,
    null,
  );
  const concurrent = await Promise.all(
    [true, false].map((isActive) =>
      adminGql(active, { id: product.id, isActive, expectedUpdatedAt: product.updatedAt }, cookie),
    ),
  );
  assert.equal(concurrent.filter((result) => !result.errors).length, 1);
  errorCode(
    concurrent.find((result) => result.errors),
    'REQUEST_CONFLICT',
  );
  product = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  const customer = await createCustomer();
  const a = await createOrderFixture(customer, product, {
    date: new Date('2030-01-01T20:29:59Z'),
    status: 'PENDING_PAYMENT',
  });
  const b = await createOrderFixture(customer, product, {
    date: new Date('2030-01-01T20:30:00Z'),
    status: 'CANCELED',
    total: 900000,
  });
  const c = await createOrderFixture(customer, product, {
    date: new Date('2030-01-02T20:29:59Z'),
    status: 'PROCESSING',
    total: 350000,
    snapshot: { ...customer.snapshot, latitude: null, longitude: null },
  });
  await db.address.update({
    where: { id: customer.address.id },
    data: { city: 'تهران', postalAddress: 'نشانی جدید' },
  });
  await db.product.update({
    where: { id: product.id },
    data: { title: 'عنوان جدید محصول', price: 999999 },
  });
  assert.equal((await run(orders, { input: { userId: customer.user.id } })).adminOrders.total, 3);
  assert.equal(
    (await run(orders, { input: { userId: customer.user.id, city: 'اردکان' } })).adminOrders.total,
    3,
  );
  assert.equal(
    (await run(orders, { input: { userId: customer.user.id, city: 'تهران' } })).adminOrders.total,
    0,
  );
  assert.deepEqual(
    (
      await run(orders, {
        input: { userId: customer.user.id, from: '2030-01-01', to: '2030-01-01' },
      })
    ).adminOrders.items.map((order) => order.id),
    [a.id],
  );
  assert.equal(
    (
      await run(orders, {
        input: {
          userId: customer.user.id,
          search: customer.user.phone,
          pageSize: 1,
          page: 2,
          sort: 'TOTAL_ASC',
        },
      })
    ).adminOrders.items[0].id,
    c.id,
  );
  assert.equal((await run(orders, { input: { number: b.number } })).adminOrders.items[0].id, b.id);
  for (const bad of [{ pageSize: 51 }, { page: 0 }, { from: '2030-01-03', to: '2030-01-01' }])
    errorCode(await adminGql(orders, { input: bad }, cookie), 'BAD_USER_INPUT');
  const historical = (await run(detail, { id: a.id })).adminOrder;
  assert.equal(historical.address.city, 'اردکان');
  assert.equal(historical.items[0].productTitle, 'محصول آزمون مدیریت');
  errorCode(
    await adminGql(
      change,
      { input: { id: a.id, expectedStatus: 'PENDING_PAYMENT', status: 'DELIVERED' } },
      cookie,
    ),
    'BAD_USER_INPUT',
  );
  const statusResults = await Promise.all(
    ['PROCESSING', 'CANCELED'].map((status) =>
      adminGql(change, { input: { id: a.id, expectedStatus: 'PENDING_PAYMENT', status } }, cookie),
    ),
  );
  assert.equal(statusResults.filter((result) => !result.errors).length, 1);
  errorCode(
    statusResults.find((result) => result.errors),
    'REQUEST_CONFLICT',
  );
  const after = (await run(detail, { id: a.id })).adminOrder;
  assert.deepEqual(after.items, historical.items);
  assert.equal(after.total, historical.total);
  assert.equal(after.statusEvents.length, 1);
  assert.equal(after.statusEvents[0].admin.id, admin.id);
  // Restore an isolated fixture status directly for deterministic report arithmetic.
  await db.order.update({ where: { id: a.id }, data: { status: 'PROCESSING' } });
  const values = (await run(report, { input: { from: '2030-01-01', to: '2030-01-03' } }))
    .adminReport;
  assert.equal(values.ordersCount, 3);
  assert.equal(values.orderValue, 600000);
  assert.equal(values.averageOrderValue, 300000);
  assert.equal(values.revenue, 0);
  assert.deepEqual(
    values.daily.map((day) => [day.ordersCount, day.orderValue, day.revenue]),
    [
      [1, 250000, 0],
      [2, 350000, 0],
      [0, 0, 0],
    ],
  );
  assert.equal(values.statuses.find((status) => status.status === 'CANCELED').count, 1);
  assert.equal(
    (await run(report, { input: { from: '2030-01-01', to: '2030-01-03', status: 'CANCELED' } }))
      .adminReport.orderValue,
    0,
  );
  errorCode(
    await adminGql(report, { input: { from: '2030-01-01', to: '2032-01-01' } }, cookie),
    'BAD_USER_INPUT',
  );
  const users = (
    await run(
      'query($input:AdminUsersInput!){adminUsers(input:$input){total items{id ordersCount totalOrdersValue}}}',
      { input: { search: customer.user.phone } },
    )
  ).adminUsers;
  assert.equal(users.total, 1);
  assert.equal(users.items[0].ordersCount, 3);
  assert.equal(users.items[0].totalOrdersValue, 600000);
  errorCode(await adminGql('query{adminUser(id:"missing"){id}}', {}, cookie), 'NOT_FOUND');
  const current = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  const deletion = (
    await run(remove, { id: product.id, expectedUpdatedAt: current.updatedAt.toISOString() })
  ).deleteAdminProduct;
  assert.equal(deletion.deleted, false);
  assert.equal(deletion.product.isActive, false);
  const spare = (await run(save, { input: { ...input, slug: input.slug + '-unused' } }))
    .saveAdminProduct;
  products.add(spare.id);
  assert.equal(
    (await run(remove, { id: spare.id, expectedUpdatedAt: spare.updatedAt })).deleteAdminProduct
      .deleted,
    true,
  );
  assert.equal(await db.product.findUnique({ where: { id: spare.id } }), null);
  const dashboard = (
    await run(
      '{adminDashboard{ordersCount orderValue revenue ordersToday ordersThisMonth recentOrders{id} report{daily{date}}}}',
    )
  ).adminDashboard;
  assert.ok(dashboard.ordersCount >= 3);
  assert.equal(dashboard.revenue, 0);
  assert.ok(dashboard.recentOrders.length <= 5);
  assert.equal(dashboard.report.daily.length, 30);
  console.log(
    'Admin commerce passed: private CRUD, safe images/order, duplicate/invalid input, atomic edit conflicts, public active filtering, historical snapshots, bounded filters, legal audited status races, Tehran report boundaries, zero paid revenue, customer aggregates and safe product deletion.',
  );
} finally {
  await cleanupAdmin();
}
