import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startAPI, db, errorCode } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  createOrderFixture,
  adminGql,
  cleanupAdmin,
  admins,
  products,
} from './admin-harness.mjs';

const deletion =
  'mutation($id:ID!,$version:String!){deleteAdminOrder(id:$id,expectedUpdatedAt:$version)}';
const list = 'query($input:AdminOrdersInput!){adminOrders(input:$input){items{id status} total}}';
const paymentIds = [];
const orderIds = [];
const payment = (orderId, status) => {
  const id = randomUUID();
  paymentIds.push(id);
  return db.payment.create({
    data: {
      id,
      orderId,
      status,
      mode: 'TEST',
      amountRials: 250000n,
      terminalId: 'TEST',
      callbackKey: randomUUID().replaceAll('-', ''),
      sessionKey: 1,
      expiresAt: new Date(Date.now() + 600000),
      refNum: status === 'SUCCEEDED' ? 'REF-' + id : null,
    },
  });
};
try {
  await startAPI();
  const owner = await createAdmin(),
    session = await loginAdmin(owner),
    customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const suffix = randomUUID().slice(0, 8);
  const product = await db.product.create({
    data: {
      title: `حذف سفارش آزمون ${suffix}`,
      slug: `order-deletion-${suffix}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      categoryId: category.id,
      shortDescription: '',
      description: '',
    },
  });
  products.add(product.id);
  const staff = await db.admin.create({
    data: {
      email: `orders-${randomUUID()}@example.test`,
      passwordHash: owner.passwordHash,
      role: 'STAFF',
      permissions: ['ORDERS'],
    },
  });
  admins.push(staff);
  const staffSession = await loginAdmin({ ...staff, password: owner.password });

  // Default list hides canceled and unpaid orders; ALL (no exclusion) and explicit status show them.
  const statuses = ['PENDING_PAYMENT', 'CANCELED', 'PROCESSING', 'CREATED'];
  const fixtures = {};
  for (const status of statuses) {
    fixtures[status] = await createOrderFixture(customer, product, { status });
    orderIds.push(fixtures[status].id);
  }
  const scoped = async (extra) =>
    (
      await adminGql(
        list,
        { input: { userId: customer.user.id, pageSize: 50, ...extra } },
        session.cookies,
      )
    ).data.adminOrders.items.map((o) => o.status);
  assert.deepEqual((await scoped({ excludeStatuses: ['CANCELED', 'PENDING_PAYMENT'] })).sort(), [
    'CREATED',
    'PROCESSING',
  ]);
  assert.equal((await scoped({})).length, 4);
  assert.deepEqual(await scoped({ status: 'CANCELED', excludeStatuses: ['CANCELED'] }), [
    'CANCELED',
  ]);

  // Authorization, origin and optimistic version checks.
  const target = await db.order.findUniqueOrThrow({ where: { id: fixtures.PROCESSING.id } });
  const variables = { id: target.id, version: target.updatedAt.toISOString() };
  errorCode(await adminGql(deletion, variables), 'UNAUTHENTICATED');
  errorCode(await adminGql(deletion, variables, staffSession.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(deletion, variables, session.cookies, '192.0.2.1', 'https://foreign.test'),
    'FORBIDDEN',
  );
  errorCode(
    await adminGql(deletion, { ...variables, version: new Date(0).toISOString() }, session.cookies),
    'REQUEST_CONFLICT',
  );

  // Unsettled bank payments block deletion; settled ones are detached and kept.
  const pending = await payment(target.id, 'READY');
  errorCode(await adminGql(deletion, variables, session.cookies), 'BAD_USER_INPUT');
  await db.payment.update({ where: { id: pending.id }, data: { status: 'FAILED' } });
  const settled = await payment(target.id, 'SUCCEEDED');
  const ticket = await db.supportTicket.create({
    data: { userId: customer.user.id, orderId: target.id, subject: 'آزمون حذف' },
  });
  await db.orderStatusEvent.create({
    data: { orderId: target.id, adminId: owner.id, fromStatus: 'CREATED', toStatus: 'PROCESSING' },
  });
  const fresh = await db.order.findUniqueOrThrow({ where: { id: target.id } });
  const removed = await adminGql(
    deletion,
    { id: target.id, version: fresh.updatedAt.toISOString() },
    session.cookies,
  );
  assert.equal(removed.data?.deleteAdminOrder, true, JSON.stringify(removed.errors));
  assert.equal(await db.order.count({ where: { id: target.id } }), 0);
  assert.equal(await db.orderItem.count({ where: { orderId: target.id } }), 0);
  assert.equal(await db.orderStatusEvent.count({ where: { orderId: target.id } }), 0);
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: settled.id } })).orderId, null);
  assert.equal(
    (await db.supportTicket.findUniqueOrThrow({ where: { id: ticket.id } })).orderId,
    null,
  );
  const audit = await db.adminRecordChange.findFirstOrThrow({
    where: { entityType: 'ORDER_DELETION', entityId: target.id },
  });
  assert.equal(audit.adminId, owner.id);
  assert.equal(audit.before.number, target.number);
  errorCode(
    await adminGql(deletion, { id: target.id, version: variables.version }, session.cookies),
    'NOT_FOUND',
  );

  // Credit allocated to a deleted manual invoice returns to the customer and is re-applied.
  const manual = async (createdAt) => {
    const order = await createOrderFixture(customer, product, { status: 'CREATED' });
    orderIds.push(order.id);
    return db.order.update({
      where: { id: order.id },
      data: { salesChannel: 'INSTAGRAM', createdAt },
    });
  };
  const first = await manual(new Date(Date.now() - 7200000));
  const second = await manual(new Date(Date.now() - 3600000));
  const entry = await db.customerAccountEntry.create({
    data: {
      id: randomUUID(),
      userId: customer.user.id,
      direction: 'RECEIPT',
      amount: 100000,
      remaining: 0,
      method: 'CASH',
      adminId: owner.id,
      adminEmail: owner.email,
      requestHash: randomUUID().replaceAll('-', '').padEnd(64, '0'),
    },
  });
  await db.offlinePayment.create({
    data: {
      id: randomUUID(),
      orderId: first.id,
      accountEntryId: entry.id,
      amount: 100000,
      method: 'CASH',
      adminId: owner.id,
      adminEmail: owner.email,
    },
  });
  const firstNow = await db.order.update({
    where: { id: first.id },
    data: { offlinePaidAmount: 100000 },
  });
  const manualRemoval = await adminGql(
    deletion,
    { id: first.id, version: firstNow.updatedAt.toISOString() },
    session.cookies,
  );
  assert.equal(manualRemoval.data?.deleteAdminOrder, true, JSON.stringify(manualRemoval.errors));
  assert.equal(
    (await db.customerAccountEntry.findUniqueOrThrow({ where: { id: entry.id } })).remaining,
    0,
  );
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: second.id } })).offlinePaidAmount,
    100000,
  );

  // Retention: only orders canceled for more than 30 days are removed.
  const { purgeCanceledOrders } = await import('../apps/api/dist/modules/admin/order-deletion.js');
  const old = new Date(Date.now() - 31 * 86400000);
  await db.$executeRaw`UPDATE \`Order\` SET updatedAt=${old} WHERE id=${fixtures.CANCELED.id}`;
  const recent = await createOrderFixture(customer, product, { status: 'CANCELED' });
  orderIds.push(recent.id);
  const oldActive = fixtures.CREATED.id;
  await db.$executeRaw`UPDATE \`Order\` SET updatedAt=${old} WHERE id=${oldActive}`;
  await purgeCanceledOrders(new Date(), 50, { userId: customer.user.id });
  assert.equal(await db.order.count({ where: { id: fixtures.CANCELED.id } }), 0);
  assert.equal(await db.order.count({ where: { id: recent.id } }), 1);
  assert.equal(await db.order.count({ where: { id: oldActive } }), 1);
  assert.ok(
    await db.adminRecordChange.findFirst({
      where: { entityId: fixtures.CANCELED.id, adminId: 'system' },
    }),
  );
  await db.customerAccountEntry.update({ where: { id: entry.id }, data: { remaining: 0 } });
  await db.offlinePayment.deleteMany({ where: { accountEntryId: entry.id } });
  await db.customerAccountEntry.delete({ where: { id: entry.id } });
  console.info(
    'Order deletion passes: default active filter, owner-only/origin/CAS, unsettled-bank guard, detached settled payment/ticket, audit snapshot, credit return/reallocation and 30-day canceled retention.',
  );
} finally {
  await db.adminRecordChange.deleteMany({
    where: { entityType: 'ORDER_DELETION', entityId: { in: orderIds } },
  });
  await db.payment.deleteMany({ where: { id: { in: paymentIds } } });
  await cleanupAdmin();
}
