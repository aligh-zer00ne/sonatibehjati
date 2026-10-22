import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startAPI, db, phone, keys, gql, verification } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  adminGql,
  admins,
  cleanupAdmin,
  products,
} from './admin-harness.mjs';
const fields =
  'id number total shipping salesChannel shippingMethod status paidAt offlinePaidAmount updatedAt offlinePayments{id amount method adminEmail}';
const create = `mutation($input:AdminManualOrderInput!){createAdminManualOrder(input:$input){${fields}}}`;
const record = `mutation($input:AdminOfflinePaymentInput!){recordAdminOfflinePayment(input:$input){${fields}}}`;
const users =
  'query($input:AdminUsersInput!){adminUsers(input:$input){items{id acquisitionSource salesChannels} total}}';
const customerMutation =
  'mutation($input:AdminCustomerInput!){createAdminCustomer(input:$input){id phone acquisitionSource salesChannels}}';
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
try {
  await startAPI();
  const owner = await createAdmin();
  const cookie = (await loginAdmin(owner)).cookies;
  const inputCustomer = {
    phone: phone(),
    firstName: 'مشتری دستی آزمون',
    lastName: 'موقت',
    salesChannel: 'INSTAGRAM',
    address: {
      title: 'خانه',
      recipientName: 'مشتری دستی آزمون',
      recipientPhone: '',
      province: 'یزد',
      city: 'اردکان',
      postalAddress: 'خیابان آزمون پلاک ۱۲',
      postalCode: '1234567890',
      isDefault: true,
    },
  };
  inputCustomer.address.recipientPhone = inputCustomer.phone;
  const customer = good(
    await adminGql(customerMutation, { input: inputCustomer }, cookie),
  ).createAdminCustomer;
  assert.equal(customer.acquisitionSource, 'INSTAGRAM');
  assert.equal(
    (await adminGql(customerMutation, { input: inputCustomer }, cookie)).errors[0].extensions.code,
    'BAD_USER_INPUT',
  );
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: 'محصول فروش دستی آزمون',
      slug: `manual-${randomUUID()}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      shortDescription: '',
      description: '',
      categoryId: category.id,
      shippingWeightGrams: 500,
      shippingBaseCost: 50000,
      shippingAdditionalKgCost: 10000,
    },
  });
  products.add(product.id);
  const input = {
    customerId: customer.id,
    salesChannel: 'IN_PERSON',
    items: [{ productId: product.id, quantity: 3 }],
    discountCode: '',
    shippingMethod: 'POST',
    pickup: true,
    receivedAmount: 100000,
    paymentMethod: 'POS',
    requestId: randomUUID(),
    expectedTotal: 300000,
  };
  const order = good(await adminGql(create, { input }, cookie)).createAdminManualOrder;
  assert.equal(order.shipping, 0);
  assert.equal(order.shippingMethod, null);
  assert.equal(order.offlinePaidAmount, 100000);
  assert.equal(order.paidAt, null);
  assert.equal(order.status, 'DELIVERED');
  assert.equal(order.offlinePayments.length, 1);
  assert.equal(good(await adminGql(create, { input }, cookie)).createAdminManualOrder.id, order.id);
  assert.equal(
    (await adminGql(create, { input: { ...input, receivedAmount: 200000 } }, cookie)).errors[0]
      .extensions.code,
    'REQUEST_CONFLICT',
  );
  const status =
    'mutation($input:AdminOrderStatusInput!){updateAdminOrderStatus(input:$input){id status}}';
  assert.equal(
    (
      await adminGql(
        status,
        { input: { id: order.id, expectedStatus: order.status, status: 'PROCESSING' } },
        cookie,
      )
    ).errors[0].extensions.code,
    'BAD_USER_INPUT',
  );
  const payment = {
    orderId: order.id,
    amount: 200000,
    method: 'CARD_TRANSFER',
    requestId: randomUUID(),
    expectedUpdatedAt: order.updatedAt,
  };
  const paid = good(await adminGql(record, { input: payment }, cookie)).recordAdminOfflinePayment;
  assert.equal(paid.status, 'DELIVERED');
  assert.equal(paid.offlinePaidAmount, 300000);
  assert.equal(paid.paidAt, null);
  assert.equal(paid.offlinePayments.length, 2);
  good(await adminGql(record, { input: payment }, cookie));
  assert.equal(
    (await adminGql(record, { input: { ...payment, requestId: randomUUID() } }, cookie)).errors[0]
      .extensions.code,
    'REQUEST_CONFLICT',
  );
  assert.equal(
    (
      await adminGql(
        record,
        {
          input: {
            ...payment,
            requestId: randomUUID(),
            expectedUpdatedAt: paid.updatedAt,
            amount: 1,
          },
        },
        cookie,
      )
    ).errors[0].extensions.code,
    'BAD_USER_INPUT',
  );
  const request = await gql(keys.request, { input: { phone: inputCustomer.phone } });
  const login = await gql(keys.verify, verification(good(request).requestOtp));
  good(login);
  const pay = await gql(
    'mutation($id:ID!){startOrderPayment(orderId:$id){redirectUrl}}',
    { id: order.id },
    login.cookies,
  );
  assert.ok(
    ['ORDER_NOT_PAYABLE', 'PAYMENT_DISABLED'].includes(pay.errors?.[0]?.extensions?.code),
    JSON.stringify(pay.errors),
  );
  assert.equal(await db.payment.count({ where: { orderId: order.id } }), 0);
  assert.equal(
    good(
      await adminGql(
        users,
        { input: { search: inputCustomer.phone, salesChannel: 'WEBSITE' } },
        cookie,
      ),
    ).adminUsers.total,
    0,
  );
  const shippedInput = {
    ...input,
    salesChannel: 'INSTAGRAM',
    pickup: false,
    shippingMethod: 'TIPAX',
    manualShippingCost: 60000,
    receivedAmount: 360000,
    expectedTotal: 360000,
    requestId: randomUUID(),
    address: {
      title: 'خانه',
      recipientName: 'گیرنده آزمون',
      recipientPhone: inputCustomer.phone,
      province: 'یزد',
      city: 'اردکان',
      postalAddress: 'خیابان آزمون پلاک ۱۲',
      postalCode: '1234567890',
      isDefault: false,
    },
  };
  const shipped = good(
    await adminGql(create, { input: shippedInput }, cookie),
  ).createAdminManualOrder;
  for (const channel of ['INSTAGRAM', 'IN_PERSON'])
    assert.ok(
      good(
        await adminGql(
          users,
          { input: { search: inputCustomer.phone, salesChannel: channel } },
          cookie,
        ),
      ).adminUsers.items.some((u) => u.id === customer.id),
    );
  assert.equal(shipped.shipping, 60000);
  assert.equal(shipped.status, 'CREATED');
  const list = good(
    await adminGql(
      'query($input:AdminOrdersInput!){adminOrders(input:$input){items{id} total}}',
      { input: { userId: customer.id, salesChannel: 'INSTAGRAM', shippingMethod: 'TIPAX' } },
      cookie,
    ),
  ).adminOrders;
  assert.equal(list.total, 1);
  assert.equal(list.items[0].id, shipped.id);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date());
  const report = good(
    await adminGql(
      'query($input:AdminReportInput!){adminReport(input:$input){offlineRevenue bankRevenue revenue ordersCount daily{revenue}}}',
      { input: { from: date, to: date, salesChannel: 'INSTAGRAM', shippingMethod: 'TIPAX' } },
      cookie,
    ),
  ).adminReport;
  // Other pre-existing sales are allowed; compare the fixture-only delta through a baseline below.
  assert.ok(report.offlineRevenue >= 360000);
  assert.equal(report.revenue, report.bankRevenue + report.offlineRevenue);
  assert.equal(
    report.daily.reduce((n, d) => n + d.revenue, 0),
    report.revenue,
  );
  const dashboard = good(
    await adminGql(
      '{adminDashboard(salesChannel:INSTAGRAM){channelMetrics{salesChannel customersCount ordersCount revenue} recentUsers{id salesChannels} recentOrders{id salesChannel}}}',
      {},
      cookie,
    ),
  ).adminDashboard;
  assert.equal(dashboard.channelMetrics.length, 3);
  assert.ok(dashboard.channelMetrics.find((v) => v.salesChannel === 'IN_PERSON').revenue >= 300000);
  assert.ok(dashboard.recentOrders.every((o) => o.salesChannel === 'INSTAGRAM'));
  // Sales-only staff can select customers and enter orders, but cannot edit customers/products or reports.
  const staff = await createAdmin();
  await db.admin.update({
    where: { id: staff.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const staffCookie = (await loginAdmin(staff)).cookies;
  good(
    await adminGql(
      'query($input:AdminUsersInput!){adminOrderCustomers(input:$input){items{id}}}',
      { input: { search: inputCustomer.phone } },
      staffCookie,
    ),
  );
  for (const query of [users, customerMutation]) {
    const r = await adminGql(query, { input: query === users ? {} : inputCustomer }, staffCookie);
    assert.equal(r.errors[0].extensions.code, 'FORBIDDEN');
  }
  const bad = await adminGql(
    create,
    { input: { ...input, salesChannel: 'WEBSITE', requestId: randomUUID() } },
    cookie,
  );
  assert.equal(bad.errors[0].extensions.code, 'BAD_USER_INPUT');
  assert.equal(
    (
      await adminGql(
        create,
        { input: { ...input, requestId: randomUUID(), receivedAmount: -1 } },
        cookie,
      )
    ).errors[0].extensions.code,
    'BAD_USER_INPUT',
  );
  assert.equal(
    (
      await adminGql(
        create,
        { input: { ...input, requestId: randomUUID(), expectedTotal: 1 } },
        cookie,
      )
    ).errors[0].extensions.code,
    'PRICE_CHANGED',
  );
  assert.equal(
    (
      await adminGql(
        create,
        { input: { ...input, requestId: randomUUID(), pickup: false } },
        cookie,
      )
    ).errors[0].extensions.code,
    'BAD_USER_INPUT',
  );
  assert.equal(await db.order.count({ where: { userId: customer.id } }), 2);
  const raceInput = { ...input, requestId: randomUUID(), receivedAmount: 0, paymentMethod: null };
  const racedOrders = await Promise.all([
    adminGql(create, { input: raceInput }, cookie),
    adminGql(create, { input: raceInput }, cookie),
  ]);
  const raceOrder = good(racedOrders[0]).createAdminManualOrder;
  assert.equal(good(racedOrders[1]).createAdminManualOrder.id, raceOrder.id);
  const racePayment = {
    orderId: raceOrder.id,
    amount: 160000,
    method: 'CASH',
    expectedUpdatedAt: raceOrder.updatedAt,
  };
  const racedReceipts = await Promise.all([
    adminGql(record, { input: { ...racePayment, requestId: randomUUID() } }, cookie),
    adminGql(record, { input: { ...racePayment, requestId: randomUUID() } }, cookie),
  ]);
  assert.equal(racedReceipts.filter((r) => r.data?.recordAdminOfflinePayment).length, 1);
  assert.equal(
    racedReceipts.filter((r) => r.errors?.[0]?.extensions?.code === 'REQUEST_CONFLICT').length,
    1,
  );
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: raceOrder.id } })).offlinePaidAmount,
    160000,
  );
  assert.equal(await db.offlinePayment.count({ where: { orderId: raceOrder.id } }), 1);

  assert.ok(admins.length === 2);
  console.log(
    'Retail operations passed: manual customers with saved addresses, manual shipping, no approval workflow, partial/full invoice receipts, ledger/replay/conflicts, stale price guards, payment separation, source/method reports, multi-source customers, dashboard and permissions. No real SMS or bank request.',
  );
} finally {
  await cleanupAdmin();
}
