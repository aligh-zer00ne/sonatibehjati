import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { bank, bankRecords, bankControl } from './payment-harness.mjs';
const { db, startAPI, apiURL, proxySecret, errorCode } = await import('./auth-harness.mjs');
process.env.AUTH_PROXY_SECRET = proxySecret;
const { createAdmin, createCustomer, createOrderFixture, loginAdmin, adminGql, cleanupAdmin } =
  await import('./admin-harness.mjs');
const {
  createPaymentRequest,
  findRequest,
  publicRequest,
  startRequestPayment,
  cancelPaymentRequest,
} = await import('../apps/api/src/modules/payments/requests.ts');
const { callback, verifyPayment, retryPayment } =
  await import('../apps/api/src/modules/payments/service.ts');
const { accountBalance } = await import('../apps/api/src/modules/admin/customer-accounts.ts');
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
const createQuery =
  'mutation($input:AdminPaymentRequestInput!){createAdminPaymentRequest(input:$input){id url amount status}}';
const publicCall = async (action, id, key, secret = proxySecret) =>
  fetch(apiURL + '/payments/sep/' + action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Proxy-Key': secret },
    body: JSON.stringify({ id, key }),
  });
try {
  await startAPI();
  const owner = await createAdmin(),
    cookie = (await loginAdmin(owner)).cookies;
  const customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const invoice = async (total, date) => {
    const o = await createOrderFixture(customer, product, { total, date });
    return db.order.update({
      where: { id: o.id },
      data: { salesChannel: 'IN_PERSON', status: 'DELIVERED' },
    });
  };
  const old = await invoice(100000, new Date(Date.now() - 60000)),
    recent = await invoice(200000, new Date());
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date());
  const readReport = async (extra = {}) =>
    good(
      await adminGql(
        'query($i:AdminReportInput!){adminReport(input:$i){revenue offlineRevenue bankRevenue paymentLinkRevenue ordersCount daily{revenue}}}',
        { i: { from: date, to: date, ...extra } },
        cookie,
      ),
    ).adminReport;
  const before = await readReport();
  const input = {
    requestId: randomUUID(),
    scope: 'CUSTOMER_BALANCE',
    customerId: customer.user.id,
    amount: 300000,
    title: 'مانده آزمون',
    expiresInHours: 72,
  };
  errorCode(
    await adminGql(createQuery, { input: { ...input, amount: 300001 } }, cookie),
    'PRICE_CHANGED',
  );
  const r = good(await adminGql(createQuery, { input }, cookie)).createAdminPaymentRequest;
  const stored = await db.paymentRequest.findUniqueOrThrow({ where: { id: r.id } });
  const key = stored.key;
  assert.equal(r.amount, 300000);
  assert.equal(r.status, 'ACTIVE');
  assert.match(r.url, new RegExp('/pay/' + r.id + '/' + key + '$'));
  assert.equal((await createPaymentRequest(owner, input)).id, r.id);
  await assert.rejects(() => createPaymentRequest(owner, { ...input, amount: 1 }));
  await assert.rejects(() => findRequest(r.id, '0'.repeat(64)));
  assert.equal((await publicCall('request-status', r.id, key, 'wrong')).status, 403);
  assert.equal((await publicCall('request-status', r.id, '0'.repeat(64))).status, 404);
  const pub = await (await publicCall('request-status', r.id, key)).json();
  assert.equal(pub.amount, 300000);
  for (const field of [
    'customerId',
    'payerPhone',
    'payerName',
    'key',
    'customerName',
    'requestHash',
  ])
    assert.ok(!(field in pub));
  // Manual payment before bank confirmation changes debt, but cannot mutate the link amount.
  good(
    await adminGql(
      'mutation($i:AdminAccountEntryInput!){recordAdminAccountEntry(input:$i){balance}}',
      {
        i: {
          requestId: randomUUID(),
          customerId: customer.user.id,
          direction: 'RECEIPT',
          amount: 50000,
          method: 'CASH',
        },
      },
      cookie,
    ),
  );
  bankControl.tokenDelay = true;
  const starts = await Promise.allSettled([
    startRequestPayment(r.id, key),
    startRequestPayment(r.id, key),
  ]);
  bankControl.tokenDelay = false;
  assert.ok(starts.some((s) => s.status === 'fulfilled'));
  assert.equal(await db.payment.count({ where: { paymentRequestId: r.id } }), 1);
  const start = await startRequestPayment(r.id, key);
  const [, id, callbackKey] = start.redirectUrl.match(/redirect\/([^/]+)\/([^/]+)$/);
  assert.equal(bankRecords.get(id).Amount, 3000000);
  assert.equal(await db.customerAccountEntry.count({ where: { paymentId: id } }), 0);
  await assert.rejects(() => cancelPaymentRequest(r.id));
  await assert.rejects(() =>
    callback(id, callbackKey, { resnum: id, state: 'OK', terminalid: '999', refnum: 'ref-' + id }),
  );
  const complete = (pid = id, pkey = callbackKey) =>
    callback(pid, pkey, { resnum: pid, state: 'OK', terminalid: '12345678', refnum: 'ref-' + pid });
  bankRecords.get(id).outage = true;
  await complete();
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id } })).status, 'VERIFY_PENDING');
  assert.equal(await db.customerAccountEntry.count({ where: { paymentId: id } }), 0);
  await assert.rejects(() => startRequestPayment(r.id, key));
  bankRecords.get(id).outage = false;
  await Promise.all([retryPayment(id), verifyPayment(id)]);
  await complete();
  const receipt = await db.customerAccountEntry.findUniqueOrThrow({
    where: { paymentId: id },
    include: { allocations: true },
  });
  assert.equal(receipt.method, 'ONLINE');
  assert.equal(receipt.amount, 300000);
  assert.equal(receipt.remaining, 50000);
  assert.equal(await db.$transaction((tx) => accountBalance(tx, customer.user.id)), -50000);
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: old.id } })).offlinePaidAmount,
    100000,
  );
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: recent.id } })).offlinePaidAmount,
    200000,
  );
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: recent.id } })).paidAt, null);
  assert.equal((await publicRequest(r.id, key)).status, 'PAID');
  await assert.rejects(() => startRequestPayment(r.id, key));
  await assert.rejects(() => cancelPaymentRequest(r.id));
  assert.equal(await db.customerAccountEntry.count({ where: { paymentId: id } }), 1);
  // A second bank debit for the same request is reversed, with no second account entry.
  const duplicate = await db.payment.create({
    data: {
      ...(await db.payment.findUniqueOrThrow({ where: { id } })),
      id: randomUUID(),
      status: 'READY',
      refNum: null,
      acceptedAt: null,
      verifiedAt: null,
      token: 'duplicate',
      callbackKey: 'f'.repeat(64),
    },
  });
  bankRecords.set(duplicate.id, {
    ...bankRecords.get(id),
    ResNum: duplicate.id,
    verifyCalls: 0,
    reverseCalls: 0,
  });
  await complete(duplicate.id, duplicate.callbackKey);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: duplicate.id } })).status,
    'REVERSED',
  );
  assert.equal(await db.customerAccountEntry.count({ where: { userId: customer.user.id } }), 2);
  assert.equal(
    (await publicRequest(r.id, key)).payment.id,
    id,
    'A duplicate debit must not replace the accepted public receipt',
  );
  // Generic links must never create a user, order or customer-account entry.
  const generic = await createPaymentRequest(owner, {
    requestId: randomUUID(),
    scope: 'CUSTOM_AMOUNT',
    title: 'دریافت بدون مشتری',
    amount: 45000,
    expiresInHours: 24,
  });
  const parallelInput = {
    requestId: randomUUID(),
    scope: 'CUSTOM_AMOUNT',
    title: 'درخواست هم‌زمان',
    amount: 10000,
  };
  const parallelCreated = await Promise.all([
    createPaymentRequest(owner, parallelInput),
    createPaymentRequest(owner, parallelInput),
  ]);
  assert.equal(parallelCreated[0].id, parallelCreated[1].id);
  assert.equal(await db.paymentRequest.count({ where: { id: parallelInput.requestId } }), 1);
  const g = await db.paymentRequest.findUniqueOrThrow({ where: { id: generic.id } });
  const ordersCount = await db.order.count(),
    usersCount = await db.user.count(),
    entriesCount = await db.customerAccountEntry.count();
  const gs = await startRequestPayment(g.id, g.key);
  const [, gid, gkey] = gs.redirectUrl.match(/redirect\/([^/]+)\/([^/]+)$/);
  await complete(gid, gkey);
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: gid } })).status, 'SUCCEEDED');
  assert.equal(await db.order.count(), ordersCount);
  assert.equal(await db.user.count(), usersCount);
  assert.equal(await db.customerAccountEntry.count(), entriesCount);
  const after = await readReport();
  assert.equal(after.revenue - before.revenue, 395000);
  assert.equal(after.offlineRevenue - before.offlineRevenue, 350000);
  assert.equal(after.paymentLinkRevenue - before.paymentLinkRevenue, 45000);
  assert.equal(after.ordersCount, before.ordersCount);
  assert.equal(after.bankRevenue, before.bankRevenue);
  assert.equal(
    after.daily.reduce((s, d) => s + d.revenue, 0) -
      before.daily.reduce((s, d) => s + d.revenue, 0),
    395000,
  );
  const filtered = await readReport({ salesChannel: 'IN_PERSON' });
  assert.equal(filtered.paymentLinkRevenue, 0);
  // Failed token, wrong amount, canceled/expired capability and request mode separation.
  const make = async () => {
    const t = await createPaymentRequest(owner, {
      requestId: randomUUID(),
      scope: 'CUSTOM_AMOUNT',
      title: 'حالت خطای آزمون',
      amount: 10000,
    });
    return db.paymentRequest.findUniqueOrThrow({ where: { id: t.id } });
  };
  const failed = await make();
  bankControl.tokenError = true;
  await assert.rejects(() => startRequestPayment(failed.id, failed.key));
  bankControl.tokenError = false;
  assert.equal(
    (await db.payment.findFirstOrThrow({ where: { paymentRequestId: failed.id } })).status,
    'TOKEN_FAILED',
  );
  await cancelPaymentRequest(failed.id);
  await assert.rejects(() => startRequestPayment(failed.id, failed.key));
  const expired = await make();
  await db.paymentRequest.update({ where: { id: expired.id }, data: { expiresAt: new Date(0) } });
  assert.equal((await publicRequest(expired.id, expired.key)).status, 'EXPIRED');
  await assert.rejects(() => startRequestPayment(expired.id, expired.key));
  const wrong = await make();
  const ws = await startRequestPayment(wrong.id, wrong.key);
  const [, wid, wkey] = ws.redirectUrl.match(/redirect\/([^/]+)\/([^/]+)$/);
  bankRecords.get(wid).wrongAmount = 10;
  await complete(wid, wkey);
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: wid } })).status, 'REVERSED');
  assert.equal((await publicRequest(wrong.id, wrong.key)).status, 'ACTIVE');
  await db.paymentRequest.update({ where: { id: wrong.id }, data: { mode: 'LIVE' } });
  await assert.rejects(() => findRequest(wrong.id, wrong.key));
  await db.paymentRequest.update({ where: { id: wrong.id }, data: { mode: 'TEST' } });
  const staff = await createAdmin();
  await db.admin.update({
    where: { id: staff.id },
    data: { role: 'STAFF', permissions: ['PRODUCTS'] },
  });
  const staffCookie = (await loginAdmin(staff)).cookies;
  errorCode(
    await adminGql(
      createQuery,
      { input: { requestId: randomUUID(), scope: 'CUSTOM_AMOUNT', title: 'ممنوع', amount: 10000 } },
      staffCookie,
    ),
    'FORBIDDEN',
  );
  const sales = await createAdmin();
  await db.admin.update({
    where: { id: sales.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const salesCookie = (await loginAdmin(sales)).cookies;
  good(
    await adminGql('query{adminPaymentRequests(input:{page:1}){total items{id}}}', {}, salesCookie),
  );
  errorCode(
    await adminGql(
      'mutation($i:AdminAccountEntryInput!){recordAdminAccountEntry(input:$i){balance}}',
      {
        i: {
          requestId: randomUUID(),
          customerId: customer.user.id,
          direction: 'RECEIPT',
          method: 'ONLINE',
          amount: 1,
        },
      },
      salesCookie,
    ),
    'BAD_USER_INPUT',
  );
  console.log(
    'Payment links: exact balance, fixed amount, private capability, bank verification, FIFO/credit, replay/concurrency/reversal, generic income/reports, failures/expiry/mode and staff guards passed.',
  );
} finally {
  await cleanupAdmin();
  bank.close();
}
