import { initialShippingSettings } from '@behjati/shared/shipping';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startAPI, db, gql, keys, verification } from './auth-harness.mjs';
import {
  createCustomer,
  createAdmin,
  loginAdmin,
  adminGql,
  shippingFixture,
  cleanupAdmin,
  products,
} from './admin-harness.mjs';
const quoteQuery =
  'query($input:CheckoutInput!){checkoutQuote(input:$input){subtotal shipping total shippingMethod shippingWeightGrams}}';
const createQuery =
  'mutation($input:CreateOrderInput!){createOrder(input:$input){id total shipping shippingMethod shippingWeightGrams salesChannel}}';
try {
  await shippingFixture(initialShippingSettings(80000, 20000));
  await startAPI();
  const owner = await createAdmin(),
    adminCookie = (await loginAdmin(owner)).cookies;
  const customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const productA = await db.product.create({
    data: {
      title: 'ارسال آزمایش الف',
      slug: `shipping-${randomUUID()}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      shortDescription: '',
      description: '',
      categoryId: category.id,
      shippingWeightGrams: 500,
      shippingBaseCost: 80000,
      shippingAdditionalKgCost: 10000,
    },
  });
  products.add(productA.id);
  const productB = await db.product.create({
    data: {
      title: 'ارسال آزمایش ب',
      slug: `shipping-${randomUUID()}`,
      price: 150000,
      weight: '۹۰۰ میلی‌لیتر',
      shortDescription: '',
      description: '',
      categoryId: category.id,
      shippingWeightGrams: 1100,
      shippingBaseCost: 40000,
      shippingAdditionalKgCost: 20000,
    },
  });
  products.add(productB.id);
  const request = await gql(keys.request, { input: { phone: customer.user.phone } });
  assert.equal(request.errors, undefined);
  const login = await gql(keys.verify, verification(request.data.requestOtp));
  assert.equal(login.errors, undefined);
  const cookie = login.cookies;
  const input = {
    addressId: customer.address.id,
    items: [
      { productId: productA.id, quantity: 2 },
      { productId: productB.id, quantity: 1 },
    ],
    discountCode: '',
  };
  for (const shippingMethod of ['POST', 'TIPAX', 'COURIER']) {
    const result = await gql(quoteQuery, { input: { ...input, shippingMethod } }, cookie);
    assert.equal(result.errors, undefined);
    assert.deepEqual(result.data.checkoutQuote, {
      subtotal: 350000,
      shipping: 120000,
      total: 470000,
      shippingMethod,
      shippingWeightGrams: 2100,
    });
  }
  const createInput = {
    ...input,
    shippingMethod: 'TIPAX',
    expectedTotal: 470000,
    requestId: randomUUID(),
  };
  const created = await gql(createQuery, { input: createInput }, cookie);
  assert.equal(created.errors, undefined);
  const stored = await db.order.findUniqueOrThrow({
    where: { id: created.data.createOrder.id },
    include: { items: true },
  });
  assert.equal(stored.shipping, 120000);
  assert.equal(stored.total, 470000);
  assert.equal(stored.shippingMethod, 'TIPAX');
  assert.equal(stored.salesChannel, 'WEBSITE');
  assert.equal(stored.shippingBaseCost, 80000);
  assert.equal(stored.shippingAdditionalKgCost, 20000);
  assert.equal(
    stored.items.find((item) => item.productId === productB.id).shippingWeightGrams,
    1100,
  );
  await db.product.update({
    where: { id: productA.id },
    data: { shippingBaseCost: 200000, shippingWeightGrams: 2000 },
  });
  const replay = await gql(createQuery, { input: createInput }, cookie);
  assert.equal(replay.errors, undefined);
  assert.equal(replay.data.createOrder.id, stored.id);
  assert.equal(replay.data.createOrder.shipping, 120000);
  const changed = await gql(
    createQuery,
    { input: { ...createInput, shippingMethod: 'POST' } },
    cookie,
  );
  assert.equal(changed.errors[0].extensions.code, 'REQUEST_CONFLICT');
  const stale = await gql(
    createQuery,
    { input: { ...createInput, requestId: randomUUID() } },
    cookie,
  );
  assert.equal(stale.errors[0].extensions.code, 'PRICE_CHANGED');
  const invalid = await gql(quoteQuery, { input: { ...input, shippingMethod: 'PICKUP' } }, cookie);
  assert.ok(invalid.errors?.length);
  assert.equal(await db.order.count({ where: { userId: customer.user.id } }), 1);
  const fields =
    'freeShippingThreshold updatedAt methods{method enabled baseCost additionalKgCost freeShippingEligible}';
  const read = async (cookie = adminCookie) =>
    adminGql(`query{adminShippingSettings{${fields}}}`, {}, cookie);
  const settings = (await read()).data.adminShippingSettings;
  const save = async (data, version = settings.updatedAt, cookie = adminCookie) =>
    adminGql(
      `mutation($input:ShippingSettingsInput!,$v:String!){saveAdminShippingSettings(input:$input,expectedUpdatedAt:$v){${fields}}}`,
      { input: data, v: version },
      cookie,
    );
  const config = { freeShippingThreshold: 350000, methods: settings.methods };
  const outcomes = await Promise.all([save(config), save(config)]);
  assert.equal(outcomes.filter((r) => r.data?.saveAdminShippingSettings).length, 1);
  assert.equal(outcomes.find((r) => r.errors)?.errors[0].extensions.code, 'REQUEST_CONFLICT');
  let free = await gql(
    'query($input:CheckoutInput!){checkoutQuote(input:$input){shipping total freeShippingApplied freeShippingRemaining}}',
    { input: { ...input, shippingMethod: 'POST' } },
    cookie,
  );
  assert.equal(free.errors, undefined);
  assert.deepEqual(free.data.checkoutQuote, {
    shipping: 0,
    total: 350000,
    freeShippingApplied: true,
    freeShippingRemaining: 0,
  });
  // Coupon reductions qualify on net products, never the fee itself.
  const coupon = await db.discountCode.create({
    data: {
      code: 'SHIP-' + randomUUID(),
      type: 'FIXED',
      value: 1,
      startsAt: new Date(0),
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  try {
    const discounted = await gql(
      'query($input:CheckoutInput!){checkoutQuote(input:$input){shipping total freeShippingApplied freeShippingRemaining}}',
      { input: { ...input, shippingMethod: 'POST', discountCode: coupon.code } },
      cookie,
    );
    assert.equal(discounted.errors, undefined);
    assert.equal(discounted.data.checkoutQuote.freeShippingApplied, false);
    assert.equal(discounted.data.checkoutQuote.freeShippingRemaining, 1);
  } finally {
    await db.discountCode.delete({ where: { id: coupon.id } });
  }
  const freeOrder = await gql(
    createQuery,
    { input: { ...input, shippingMethod: 'POST', requestId: randomUUID(), expectedTotal: 350000 } },
    cookie,
  );
  assert.equal(freeOrder.errors, undefined);
  const snapshot = await db.order.findUniqueOrThrow({
    where: { id: freeOrder.data.createOrder.id },
  });
  assert.equal(snapshot.shippingPolicySnapshot.freeShippingApplied, true);
  assert.equal(snapshot.shippingPolicySnapshot.freeShippingThreshold, 350000);
  let current = (await read()).data.adminShippingSettings;
  const disabled = {
    freeShippingThreshold: 350000,
    methods: current.methods.map((m) => ({
      ...m,
      enabled: m.method !== 'POST',
      freeShippingEligible: m.method !== 'TIPAX',
    })),
  };
  assert.equal((await save(disabled, current.updatedAt)).errors, undefined);
  const methods = await gql('{shippingOptions{availableMethods}}');
  assert.deepEqual(methods.data.shippingOptions.availableMethods, ['TIPAX', 'COURIER']);
  const unavailable = await gql(
    quoteQuery,
    { input: { ...input, shippingMethod: 'POST' } },
    cookie,
  );
  assert.equal(unavailable.errors[0].extensions.code, 'SHIPPING_UNAVAILABLE');
  const paidMethod = await gql(
    quoteQuery,
    { input: { ...input, shippingMethod: 'TIPAX' } },
    cookie,
  );
  assert.equal(paidMethod.errors, undefined);
  assert.ok(paidMethod.data.checkoutQuote.shipping > 0);
  const unchanged = await db.order.findUniqueOrThrow({ where: { id: stored.id } });
  assert.equal(unchanged.shipping, 120000);
  assert.equal(unchanged.total, 470000);
  const staff = await createAdmin();
  await db.admin.update({
    where: { id: staff.id },
    data: { role: 'STAFF', permissions: ['PRODUCTS'] },
  });
  let staffCookie = (await loginAdmin(staff)).cookies;
  assert.equal((await read(staffCookie)).errors[0].extensions.code, 'FORBIDDEN');
  await db.admin.update({ where: { id: staff.id }, data: { permissions: ['SHIPPING'] } });
  staffCookie = (await loginAdmin(staff)).cookies;
  assert.equal((await read(staffCookie)).errors, undefined);
  current = (await read()).data.adminShippingSettings;
  assert.equal(
    (
      await save(
        { ...disabled, methods: disabled.methods.map((m) => ({ ...m, enabled: false })) },
        current.updatedAt,
      )
    ).errors[0].extensions.code,
    'BAD_USER_INPUT',
  );
  console.log(
    'Store shipping passed: central mixed-package rates, carrier selection/availability, product weight, net-discount free threshold, immutable snapshots/replay, stale totals, concurrent admin versions, staff permissions and validation. Settings and fixtures restored; no real SMS/bank request.',
  );
} finally {
  await cleanupAdmin();
}
