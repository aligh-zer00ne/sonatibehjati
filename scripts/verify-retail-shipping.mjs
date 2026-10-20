import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startAPI, db, gql, keys, verification } from './auth-harness.mjs';
import { createCustomer, cleanupAdmin, products } from './admin-harness.mjs';
const quoteQuery =
  'query($input:CheckoutInput!){checkoutQuote(input:$input){subtotal shipping total shippingMethod shippingWeightGrams}}';
const createQuery =
  'mutation($input:CreateOrderInput!){createOrder(input:$input){id total shipping shippingMethod shippingWeightGrams salesChannel}}';
try {
  await startAPI();
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
  console.log(
    'Retail shipping passed: all three methods, one mixed-package tariff, quantities/weight, final total, immutable shipping snapshots, idempotency, method conflict and stale-price rejection. No real SMS or bank request.',
  );
} finally {
  await cleanupAdmin();
}
