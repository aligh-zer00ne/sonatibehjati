import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { bank, bankRecords, bankControl } from './payment-harness.mjs';
// Local Eitaa stand-in: paid orders must be announced exactly once, never to the real chat.
const eitaaMessages = [];
const eitaa = createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    eitaaMessages.push({ url: req.url, form: Object.fromEntries(new URLSearchParams(body)) });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, result: { message_id: eitaaMessages.length } }));
  });
});
await new Promise((resolve) => eitaa.listen(0, '127.0.0.1', resolve));
process.env.EITAA_API_BASE = `http://127.0.0.1:${eitaa.address().port}`;
process.env.EITAA_BOT_TOKEN = 'bot1:local-test';
process.env.EITAA_CHAT_ID = '1';
const { db, startAPI, apiURL, proxySecret, errorCode } = await import('./auth-harness.mjs');
process.env.AUTH_PROXY_SECRET = proxySecret;
const {
  createAdmin,
  createCustomer,
  createOrderFixture,
  loginAdmin,
  adminGql,
  cleanupAdmin,
  products,
} = await import('./admin-harness.mjs');
async function createProductFixture(category) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const product = await db.product.create({
    data: {
      title: `پرداخت آزمون ${suffix}`,
      slug: `payment-test-${suffix}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      categoryId: category.id,
      shortDescription: '',
      description: '',
    },
  });
  products.add(product.id);
  return product;
}
const {
  startOrderPayment,
  callback,
  verifyPayment,
  reversePayment,
  reconcilePayments,
  retryPayment,
} = await import('../apps/api/src/modules/payments/service.ts');
try {
  await startAPI();
  const owner = await createAdmin();
  const ownerSession = await loginAdmin(owner);
  const customer = await createCustomer();
  const other = await createCustomer();
  // Fresh installations have no catalog yet; use a temporary product removed by cleanupAdmin.
  const product =
    (await db.product.findFirst({ where: { isActive: true } })) ??
    (await createProductFixture(await db.category.findFirstOrThrow()));
  async function attempt() {
    const order = await createOrderFixture(customer, product);
    const result = await startOrderPayment(customer.user.id, order.id);
    const [, id, key] = result.redirectUrl.match(/redirect\/([^/]+)\/([^/]+)$/);
    return { order, id, key, bank: bankRecords.get(id) };
  }
  async function complete(p, extra = {}) {
    return callback(p.id, p.key, {
      resnum: p.id,
      state: 'OK',
      terminalid: '12345678',
      refnum: 'ref-' + p.id,
      ...extra,
    });
  }
  for (const flag of ['tokenError', 'tokenOutage']) {
    const order = await createOrderFixture(customer, product);
    bankControl[flag] = true;
    await assert.rejects(() => startOrderPayment(customer.user.id, order.id));
    bankControl[flag] = false;
    const failed = await db.payment.findFirstOrThrow({ where: { orderId: order.id } });
    assert.equal(failed.status, 'TOKEN_FAILED');
    assert.equal(failed.resultCode, flag === 'tokenError' ? 8 : null);
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).paidAt, null);
    assert.ok((await startOrderPayment(customer.user.id, order.id)).redirectUrl);
  }
  const parallelOrder = await createOrderFixture(customer, product);
  bankControl.tokenDelay = true;
  const starts = await Promise.allSettled([
    startOrderPayment(customer.user.id, parallelOrder.id),
    startOrderPayment(customer.user.id, parallelOrder.id),
  ]);
  bankControl.tokenDelay = false;
  assert.ok(starts.some((r) => r.status === 'fulfilled'));
  assert.equal(await db.payment.count({ where: { orderId: parallelOrder.id } }), 1);
  const paid = await attempt();
  assert.equal(paid.bank.Amount, paid.order.total * 10);
  assert.equal(
    (await startOrderPayment(customer.user.id, paid.order.id)).redirectUrl,
    `/payment/sep/redirect/${paid.id}/${paid.key}`,
  );
  await assert.rejects(() => startOrderPayment(other.user.id, paid.order.id));
  await assert.rejects(() => callback(paid.id, '0'.repeat(64), { resnum: paid.id, state: 'OK' }));
  await assert.rejects(() => complete(paid, { terminalid: '999' }));
  await assert.rejects(() => complete(paid, { resnum: 'wrong' }));
  await Promise.all([complete(paid), complete(paid)]);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: paid.id } })).status,
    'SUCCEEDED',
  );
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: paid.order.id } })).status,
    'PROCESSING',
  );
  assert.ok((await db.order.findUniqueOrThrow({ where: { id: paid.order.id } })).paidAt);
  assert.equal(paid.bank.verifyCalls, 1);
  for (let i = 0; i < 50 && !eitaaMessages.length; i++)
    await new Promise((resolve) => setTimeout(resolve, 20));
  const announced = eitaaMessages.filter((m) =>
    m.form.text?.includes(`/admin/orders/${paid.order.id}`),
  );
  assert.equal(announced.length, 1);
  assert.equal(announced[0].url, '/bot1:local-test/sendMessage');
  assert.equal(announced[0].form.chat_id, '1');
  assert.match(announced[0].form.text, /سفارش جدید پرداخت شد/);
  await assert.rejects(() => startOrderPayment(customer.user.id, paid.order.id));
  await callback(paid.id, paid.key, { resnum: paid.id, state: 'CanceledByUser' });
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: paid.id } })).status,
    'SUCCEEDED',
  );
  const canceled = await attempt();
  await callback(canceled.id, canceled.key, {
    resnum: canceled.id,
    state: 'CanceledByUser',
    status: '1',
  });
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: canceled.id } })).status,
    'CANCELED',
  );
  assert.ok((await startOrderPayment(customer.user.id, canceled.order.id)).redirectUrl);
  const failed = await attempt();
  await callback(failed.id, failed.key, { resnum: failed.id, state: 'Failed', status: '12' });
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: failed.id } })).status, 'FAILED');
  const outage = await attempt();
  outage.bank.outage = true;
  await complete(outage);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: outage.id } })).status,
    'VERIFY_PENDING',
  );
  await assert.rejects(() => startOrderPayment(customer.user.id, outage.order.id));
  outage.bank.outage = false;
  await verifyPayment(outage.id);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: outage.id } })).status,
    'SUCCEEDED',
  );
  const wrong = await attempt();
  wrong.bank.wrongAmount = 10;
  wrong.bank.reverseOutage = true;
  await complete(wrong);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: wrong.id } })).status,
    'REFUND_PENDING',
  );
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: wrong.order.id } })).paidAt, null);
  wrong.bank.reverseOutage = false;
  await reversePayment(wrong.id);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: wrong.id } })).status,
    'REVERSED',
  );
  const voided = await attempt();
  await db.order.update({ where: { id: voided.order.id }, data: { status: 'CANCELED' } });
  await complete(voided);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: voided.id } })).status,
    'REVERSED',
  );
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: voided.order.id } })).paidAt, null);
  const malformed = await attempt();
  malformed.bank.incomplete = true;
  await complete(malformed);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: malformed.id } })).status,
    'VERIFY_PENDING',
  );
  malformed.bank.incomplete = false;
  await verifyPayment(malformed.id);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: malformed.id } })).status,
    'SUCCEEDED',
  );
  const mismatch = await attempt();
  mismatch.bank.wrongTerminal = true;
  await complete(mismatch);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: mismatch.id } })).status,
    'REVIEW_REQUIRED',
  );
  assert.equal(mismatch.bank.reverseCalls, 0);
  const late = await attempt();
  await db.payment.update({ where: { id: late.id }, data: { expiresAt: new Date(0) } });
  await reconcilePayments();
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: late.id } })).status, 'EXPIRED');
  const next = await startOrderPayment(customer.user.id, late.order.id);
  const [, newId, newKey] = next.redirectUrl.match(/redirect\/([^/]+)\/([^/]+)$/);
  await complete({ id: newId, key: newKey });
  await complete(late);
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: late.id } })).status, 'REVERSED');
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: newId } })).status, 'SUCCEEDED');
  // A forged reference cannot reserve or reverse a receipt already owned by a different order.
  const reused = await attempt();
  bankRecords.delete(reused.id);
  // Use the existing ref but matching bank session key to emulate a provider that omits reservation details.
  const savedKey = paid.bank.TxnRandomSessionKey;
  paid.bank.TxnRandomSessionKey = (
    await db.payment.findUniqueOrThrow({ where: { id: reused.id } })
  ).sessionKey;
  await complete(reused, { refnum: 'ref-' + paid.id });
  paid.bank.TxnRandomSessionKey = savedKey;
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: reused.id } })).status,
    'REVIEW_REQUIRED',
  );
  assert.equal(paid.bank.reverseCalls, 0);
  const lost = await attempt();
  await db.payment.update({
    where: { id: lost.id },
    data: { status: 'VERIFYING', refNum: 'ref-' + lost.id, leaseUntil: new Date(0) },
  });
  await reconcilePayments();
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: lost.id } })).status,
    'SUCCEEDED',
  );
  for (const code of [-2, -6, 5]) {
    const p = await attempt();
    p.bank.forceCode = code;
    await complete(p);
    assert.equal(
      (await db.payment.findUniqueOrThrow({ where: { id: p.id } })).status,
      code === 5 ? 'REVERSED' : 'FAILED',
    );
  }
  const review = await attempt();
  review.bank.outage = true;
  await db.payment.update({
    where: { id: review.id },
    data: { createdAt: new Date(Date.now() - 65 * 60000) },
  });
  await complete(review);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: review.id } })).reason,
    'VERIFICATION_UNRESOLVED',
  );
  review.bank.outage = false;
  assert.equal((await retryPayment(review.id)).status, 'SUCCEEDED');
  const oldRefund = await attempt();
  oldRefund.bank.wrongAmount = 10;
  oldRefund.bank.reverseOutage = true;
  await complete(oldRefund);
  await db.payment.update({
    where: { id: oldRefund.id },
    data: { verifiedAt: new Date(Date.now() - 55 * 60000) },
  });
  await reversePayment(oldRefund.id);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: oldRefund.id } })).reason,
    'REFUND_UNCONFIRMED',
  );
  oldRefund.bank.reverseOutage = false;
  assert.equal((await retryPayment(oldRefund.id)).status, 'REVERSED');
  const live = await attempt();
  await db.payment.update({
    where: { id: live.id },
    data: {
      mode: 'LIVE',
      status: 'VERIFY_PENDING',
      refNum: 'ref-' + live.id,
      retryAt: new Date(0),
    },
  });
  await reconcilePayments();
  assert.equal(live.bank.verifyCalls, 0);
  await assert.rejects(() => retryPayment(live.id));
  await assert.rejects(() => complete(live));
  const unpaid = await attempt();
  const changed = await adminGql(
    'mutation($input:AdminOrderStatusInput!){updateAdminOrderStatus(input:$input){id}}',
    { input: { id: unpaid.order.id, status: 'PROCESSING', expectedStatus: 'PENDING_PAYMENT' } },
    ownerSession.cookies,
  );
  errorCode(changed, 'BAD_USER_INPUT');
  const unauthorized = await fetch(apiURL + '/payments/sep/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: paid.id, key: paid.key }),
  });
  assert.equal(unauthorized.status, 403);
  const status = await fetch(apiURL + '/payments/sep/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Proxy-Key': proxySecret },
    body: JSON.stringify({ id: paid.id, key: paid.key }),
  });
  assert.equal((await status.json()).status, 'SUCCEEDED');
  const report = await adminGql('{adminDashboard{revenue}}', {}, ownerSession.cookies);
  assert.equal(report.errors, undefined);
  assert.ok(report.data.adminDashboard.revenue >= paid.order.total);
  await db.payment.update({
    where: { id: live.id },
    data: { status: 'SUCCEEDED', acceptedAt: new Date() },
  });
  const isolatedIncome = await adminGql('{adminDashboard{revenue}}', {}, ownerSession.cookies);
  assert.equal(isolatedIncome.data.adminDashboard.revenue, report.data.adminDashboard.revenue);

  console.log(
    'SEP amount conversion, duplicate start/callback, ownership, cancellation/failure, timeout recovery, verified receipts, canceled/duplicate refunds, amount/reference/terminal mismatch, expired attempts, crashed leases, bank codes, private proxy and unpaid fulfilment guard passed.',
  );
} finally {
  await cleanupAdmin();
  await new Promise((resolve) => bank.close(resolve));
  await new Promise((resolve) => eitaa.close(resolve));
}
