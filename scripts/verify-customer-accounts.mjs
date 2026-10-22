import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startAPI, db, phone } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  adminGql,
  createCustomer,
  createOrderFixture,
  cleanupAdmin,
  products,
} from './admin-harness.mjs';

const fields =
  'id number salesChannel status total shipping discount subtotal offlinePaidAmount updatedAt paidAt items{unitPrice quantity lineSubtotal discountAmount discountPercent lineTotal} statusEvents{id}';
const create = `mutation($input:AdminManualOrderInput!){createAdminManualOrder(input:$input){${fields}}}`;
const accountFields =
  'balance received paid invoiced invoiceTotal total entries{id direction amount method chequeNumber chequeDueDate allocations{orderId number amount}} invoices{id total offlinePaidAmount}';
const post = `mutation($input:AdminAccountEntryInput!){recordAdminAccountEntry(input:$input){${accountFields}}}`;
const read = `query($id:ID!){adminCustomerAccount(customerId:$id){${accountFields}}}`;
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
try {
  await startAPI();
  const admin = await createAdmin(),
    cookie = (await loginAdmin(admin)).cookies;
  const customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const catalog = [];
  for (let i = 0; i < 2; i++) {
    const product = await db.product.create({
      data: {
        title: `حساب مشتری آزمون ${i}`,
        slug: `account-${randomUUID()}`,
        price: 100000,
        weight: '۵۰۰ گرم',
        categoryId: category.id,
        shortDescription: '',
        description: '',
      },
    });
    products.add(product.id);
    catalog.push(product);
  }
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date());
  const reportQuery =
    'query($input:AdminReportInput!){adminReport(input:$input){offlineRevenue revenue bankRevenue daily{revenue}}}';
  const report = () =>
    adminGql(reportQuery, { input: { from: date, to: date } }, cookie).then(
      (r) => good(r).adminReport,
    );
  const baseline = await report();
  const invoice = async (quoteInput, salesChannel = 'IN_PERSON', extra = {}) => {
    const quote = good(
      await adminGql(
        'query($input:AdminManualQuoteInput!){adminManualQuote(input:$input){total subtotal discount shipping}}',
        { input: quoteInput },
        cookie,
      ),
    ).adminManualQuote;
    return good(
      await adminGql(
        create,
        {
          input: {
            ...quoteInput,
            customerId: customer.user.id,
            salesChannel,
            receivedAmount: 0,
            paymentMethod: null,
            requestId: randomUUID(),
            expectedTotal: quote.total,
            ...extra,
          },
        },
        cookie,
      ),
    ).createAdminManualOrder;
  };
  const a = await invoice({
    items: [{ productId: catalog[0].id, quantity: 1, unitPrice: 100000 }],
    pickup: true,
    shippingMethod: 'POST',
  });
  const address = { ...customer.snapshot, title: 'نشانی سفارش', isDefault: false };
  const b = await invoice(
    {
      items: [
        { productId: catalog[0].id, quantity: 2, unitPrice: 100000, discountPercent: 10 },
        { productId: catalog[1].id, quantity: 1, unitPrice: 50000, discountAmount: 5000 },
      ],
      pickup: false,
      shippingMethod: 'POST',
      manualShippingCost: 30000,
    },
    'INSTAGRAM',
    { address },
  );
  assert.equal(a.total, 100000);
  assert.equal(a.status, 'DELIVERED');
  assert.equal(a.statusEvents.length, 0);
  assert.equal(b.total, 255000);
  assert.equal(b.subtotal, 250000);
  assert.equal(b.discount, 25000);
  assert.equal(b.shipping, 30000);
  assert.equal(b.statusEvents.length, 0);
  assert.equal(b.items.reduce((s, l) => s + l.lineTotal, 0) + b.shipping, b.total);
  assert.equal(b.paidAt, null);
  const website = await createOrderFixture(customer, catalog[0]);
  const state = () =>
    adminGql(read, { id: customer.user.id }, cookie).then((r) => good(r).adminCustomerAccount);
  assert.equal(
    (await state()).balance,
    355000,
    'Website unpaid orders do not enter the manual ledger',
  );
  const receiptInput = {
    customerId: customer.user.id,
    direction: 'RECEIPT',
    amount: 150000,
    method: 'CASH',
    requestId: randomUUID(),
  };
  const receipt = good(
    await adminGql(post, { input: receiptInput }, cookie),
  ).recordAdminAccountEntry;
  assert.equal(receipt.balance, 205000);
  assert.equal(receipt.invoices.find((i) => i.id === a.id).offlinePaidAmount, 100000);
  assert.equal(receipt.invoices.find((i) => i.id === b.id).offlinePaidAmount, 50000);
  good(await adminGql(post, { input: receiptInput }, cookie));
  assert.equal((await state()).total, 1);
  const check = {
    customerId: customer.user.id,
    direction: 'RECEIPT',
    amount: 300000,
    method: 'CHECK',
    chequeNumber: '123456',
    chequeBank: 'بانک آزمون',
    chequeDueDate: date,
    requestId: randomUUID(),
  };
  assert.equal(
    (await adminGql(post, { input: { ...check, chequeNumber: '' } }, cookie)).errors?.[0]
      ?.extensions.code,
    'BAD_USER_INPUT',
  );
  const credited = good(await adminGql(post, { input: check }, cookie)).recordAdminAccountEntry;
  assert.equal(credited.balance, -95000, 'Cheque affects balance immediately');
  assert.equal(credited.invoices.find((i) => i.id === b.id).offlinePaidAmount, b.total);
  const refund = good(
    await adminGql(
      post,
      {
        input: {
          customerId: customer.user.id,
          direction: 'PAYMENT',
          amount: 20000,
          method: 'POS',
          requestId: randomUUID(),
        },
      },
      cookie,
    ),
  ).recordAdminAccountEntry;
  assert.equal(refund.balance, -75000);
  const c = await invoice({
    items: [{ productId: catalog[1].id, quantity: 1, unitPrice: 100000 }],
    pickup: true,
    shippingMethod: 'POST',
  });
  assert.equal(c.offlinePaidAmount, 75000, 'Existing credit settles the next independent invoice');
  assert.equal((await state()).balance, 25000);
  const concurrent = {
    customerId: customer.user.id,
    direction: 'RECEIPT',
    amount: 100000,
    method: 'POS',
    requestId: randomUUID(),
  };
  const repeated = await Promise.all([
    adminGql(post, { input: concurrent }, cookie),
    adminGql(post, { input: concurrent }, cookie),
  ]);
  repeated.forEach(good);
  assert.equal((await state()).total, 4);
  assert.equal((await state()).balance, -75000);
  assert.equal(
    (await adminGql(post, { input: { ...concurrent, amount: 100001 } }, cookie)).errors?.[0]
      ?.extensions.code,
    'REQUEST_CONFLICT',
  );
  const withdrawals = await Promise.all(
    [1, 2].map(() =>
      adminGql(
        post,
        {
          input: {
            customerId: customer.user.id,
            direction: 'PAYMENT',
            amount: 50000,
            method: 'CASH',
            requestId: randomUUID(),
          },
        },
        cookie,
      ),
    ),
  );
  assert.equal(withdrawals.filter((r) => r.data?.recordAdminAccountEntry).length, 1);
  assert.equal(
    withdrawals.filter((r) => r.errors?.[0]?.extensions.code === 'BAD_USER_INPUT').length,
    1,
  );
  const final = await state();
  assert.equal(final.balance, -25000);
  assert.equal(final.invoiced, 455000);
  assert.equal(final.received, 550000);
  assert.equal(final.paid, 70000);
  assert.equal(final.invoiceTotal, 3);
  assert.ok(final.invoices.every((i) => i.offlinePaidAmount === i.total));
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: website.id } })).offlinePaidAmount,
    0,
  );
  const users = good(
    await adminGql(
      'query($input:AdminUsersInput!){adminUsers(input:$input){items{id accountBalance}}}',
      { input: { search: customer.user.phone } },
      cookie,
    ),
  ).adminUsers;
  assert.equal(users.items[0].accountBalance, -25000);
  const after = await report();
  assert.equal(after.offlineRevenue - baseline.offlineRevenue, 480000);
  assert.equal(after.revenue - baseline.revenue, 480000);
  assert.equal(
    after.daily.reduce((n, d) => n + d.revenue, 0),
    after.revenue,
  );
  const source = good(
    await adminGql(
      reportQuery,
      { input: { from: date, to: date, salesChannel: 'INSTAGRAM' } },
      cookie,
    ),
  ).adminReport;
  assert.ok(source.offlineRevenue >= b.total);
  const mobile = phone();
  const customerMutation =
    'mutation($input:AdminCustomerInput!){createAdminCustomer(input:$input){id defaultAddress{postalCode postalAddress recipientPhone}}}';
  const newCustomer = good(
    await adminGql(
      customerMutation,
      {
        input: {
          phone: mobile,
          firstName: 'مشتری اینستا',
          lastName: 'آزمون',
          salesChannel: 'INSTAGRAM',
          address: { ...address, recipientPhone: mobile },
        },
      },
      cookie,
    ),
  ).createAdminCustomer;
  assert.equal(newCustomer.defaultAddress.postalCode, address.postalCode);
  assert.equal(newCustomer.defaultAddress.postalAddress, address.postalAddress);
  assert.equal(
    (
      await adminGql(
        customerMutation,
        {
          input: {
            phone: phone(),
            firstName: 'بدون نشانی',
            lastName: '',
            salesChannel: 'INSTAGRAM',
          },
        },
        cookie,
      )
    ).errors?.[0]?.extensions.code,
    'BAD_USER_INPUT',
  );
  assert.equal(
    (
      await adminGql(
        'mutation($input:AdminOrderStatusInput!){updateAdminOrderStatus(input:$input){id}}',
        { input: { id: b.id, status: 'PROCESSING', expectedStatus: b.status } },
        cookie,
      )
    ).errors?.[0]?.extensions.code,
    'BAD_USER_INPUT',
  );
  await db.admin.update({
    where: { id: admin.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const staff = (await loginAdmin(admin)).cookies;
  good(await adminGql(read, { id: customer.user.id }, staff));
  await db.admin.update({ where: { id: admin.id }, data: { permissions: ['CUSTOMERS'] } });
  assert.equal(
    (await adminGql(read, { id: customer.user.id }, staff)).errors?.[0]?.extensions.code,
    'FORBIDDEN',
  );
  assert.equal(await db.payment.count({ where: { order: { userId: customer.user.id } } }), 0);
  console.log(
    'Customer accounting passed: independent invoice discounts/manual shipping, FIFO allocations, immediate cheque, overpayment credit, refund cap, future invoice credit, concurrent replay/refunds, bank separation, net/daily reports, address snapshots and permissions. Temporary fixtures only; no real SMS or bank request.',
  );
} finally {
  await cleanupAdmin();
}
