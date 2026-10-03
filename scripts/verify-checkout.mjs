import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  startAPI,
  db,
  challenge,
  gql,
  keys,
  verification,
  errorCode,
  cleanup,
} from './auth-harness.mjs';
const runId = `checkout-${Date.now()}`;
const save =
  'mutation($id:ID,$input:AddressInput!){saveAddress(id:$id,input:$input){id title recipientName recipientPhone postalAddress postalCode latitude longitude isDefault}}';
const quote =
  'query($input:CheckoutInput!){checkoutQuote(input:$input){subtotal discount shipping total items{productId unitPrice quantity lineTotal}}}';
const create =
  'mutation($input:CreateOrderInput!){createOrder(input:$input){id number status subtotal discount shipping total}}';
const receipt = 'query($id:ID!){orderReceipt(id:$id){id total status}}';
const remove = 'mutation($id:ID!){deleteAddress(id:$id)}';
let productIds = [];
try {
  await startAPI({ environment: 'development', developmentCode: '123456' });
  const otp = await challenge();
  const login = await gql(keys.verify, verification(otp));
  const cookie = login.cookies;
  const otherOtp = await challenge();
  const other = await gql(keys.verify, verification(otherOtp));
  const input = {
    title: 'خانه',
    recipientName: 'گیرنده نمونه',
    recipientPhone: otp.phone,
    province: 'یزد',
    city: 'اردکان',
    postalAddress: 'خیابان نمونه، کوچه نمونه، پلاک ۱۰',
    postalCode: '۱۲۳۴۵۶۷۸۹۰',
    latitude: 32.31,
    longitude: 54.01,
    isDefault: true,
  };
  errorCode(await gql(save, { input }), 'UNAUTHENTICATED');
  const first = await gql(save, { input }, cookie);
  assert.equal(first.errors, undefined);
  const addressId = first.data.saveAddress.id;
  assert.equal(first.data.saveAddress.postalCode, '1234567890');
  errorCode(await gql(save, { id: addressId, input }, other.cookies), 'NOT_FOUND');
  errorCode(await gql(remove, { id: addressId }, other.cookies), 'NOT_FOUND');
  const second = await gql(save, { input: { ...input, title: 'محل کار' } }, cookie);
  assert.equal(second.errors, undefined);
  assert.equal(
    await db.address.count({ where: { userId: login.data.verifyOtp.user.id, isDefault: true } }),
    1,
  );
  assert.equal(
    (await gql(remove, { id: second.data.saveAddress.id }, cookie)).data.deleteAddress,
    true,
  );
  assert.equal((await db.address.findUniqueOrThrow({ where: { id: addressId } })).isDefault, true);
  const category = await db.category.findFirstOrThrow();
  productIds = [runId + '-a', runId + '-b'];
  await db.product.createMany({
    data: productIds.map((id, i) => ({
      id,
      slug: id,
      title: 'محصول آزمون',
      shortDescription: 'آزمون',
      description: 'داده موقت',
      price: i ? 50000 : 100000,
      weight: '۵۰۰ گرم',
      categoryId: category.id,
    })),
  });
  const discountCode = runId.toUpperCase();
  await db.discountCode.create({
    data: {
      code: discountCode,
      type: 'PERCENT',
      value: 10,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 3600000),
      usageLimit: 1,
    },
  });
  const checkout = {
    addressId,
    items: [
      { productId: productIds[0], quantity: 2 },
      { productId: productIds[1], quantity: 1 },
    ],
    discountCode,
  };
  errorCode(await gql(quote, { input: checkout }, other.cookies), 'NOT_FOUND');
  errorCode(
    await gql(quote, { input: { ...checkout, discountCode: 'DOES-NOT-EXIST' } }, cookie),
    'INVALID_DISCOUNT',
  );
  const priced = await gql(quote, { input: checkout }, cookie);
  assert.equal(priced.errors, undefined);
  assert.deepEqual(
    {
      subtotal: priced.data.checkoutQuote.subtotal,
      discount: priced.data.checkoutQuote.discount,
      shipping: priced.data.checkoutQuote.shipping,
      total: priced.data.checkoutQuote.total,
    },
    { subtotal: 250000, discount: 25000, shipping: 60000, total: 285000 },
  );
  const orderInput = { ...checkout, requestId: randomUUID(), expectedTotal: 285000 };
  errorCode(
    await gql(create, { input: { ...orderInput, expectedTotal: 1 } }, cookie),
    'PRICE_CHANGED',
  );
  assert.equal(
    (await db.discountCode.findUniqueOrThrow({ where: { code: discountCode } })).usageCount,
    0,
  );
  const concurrent = await Promise.all([
    gql(create, { input: orderInput }, cookie),
    gql(create, { input: orderInput }, cookie),
  ]);
  assert.ok(concurrent.every((result) => !result.errors));
  assert.equal(concurrent[0].data.createOrder.id, concurrent[1].data.createOrder.id);
  const orderId = concurrent[0].data.createOrder.id;
  const recover = 'query($requestId:ID!){orderByRequestId(requestId:$requestId){id total}}';
  assert.equal(
    (await gql(recover, { requestId: orderInput.requestId }, cookie)).data.orderByRequestId.id,
    orderId,
  );
  assert.equal(
    (await gql(recover, { requestId: orderInput.requestId }, other.cookies)).data.orderByRequestId,
    null,
  );
  assert.equal(concurrent[0].data.createOrder.status, 'PENDING_PAYMENT');
  assert.equal(
    (await db.discountCode.findUniqueOrThrow({ where: { code: discountCode } })).usageCount,
    1,
  );
  errorCode(
    await gql(create, { input: { ...orderInput, expectedTotal: 123 } }, cookie),
    'REQUEST_CONFLICT',
  );
  errorCode(
    await gql(create, { input: { ...orderInput, requestId: randomUUID() } }, cookie),
    'INVALID_DISCOUNT',
  );
  errorCode(await gql(receipt, { id: orderId }, other.cookies), 'NOT_FOUND');
  assert.equal((await gql(receipt, { id: orderId }, cookie)).data.orderReceipt.total, 285000);
  errorCode(await gql(remove, { id: addressId }, cookie), 'ADDRESS_IN_USE');
  await gql(
    save,
    { id: addressId, input: { ...input, postalAddress: 'نشانی جدید بعد از ثبت سفارش' } },
    cookie,
  );
  await db.product.update({
    where: { id: productIds[0] },
    data: { price: 999000, title: 'عنوان تغییرکرده' },
  });
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });
  assert.equal(order.addressSnapshot.postalAddress, input.postalAddress);
  assert.equal(order.items.find((line) => line.productId === productIds[0]).unitPrice, 100000);
  const undiscounted = { ...checkout, discountCode: '' };
  const newQuote = await gql(quote, { input: undiscounted }, cookie);
  assert.equal(newQuote.data.checkoutQuote.subtotal, 2048000);
  await db.product.update({ where: { id: productIds[0] }, data: { isActive: false } });
  errorCode(await gql(quote, { input: undiscounted }, cookie), 'PRODUCT_UNAVAILABLE');
  errorCode(
    await gql(
      quote,
      { input: { ...undiscounted, items: [checkout.items[0], checkout.items[0]] } },
      cookie,
    ),
    'BAD_USER_INPUT',
  );
  console.log(
    'Checkout API passed: authenticated ownership, Persian address inputs/defaults, server prices/shipping/discounts, price-change rejection, atomic coupon usage, concurrent idempotency, immutable snapshots, private receipt, used address restriction and unavailable/duplicate products.',
  );
} finally {
  await cleanup();
  await db.discountCode.deleteMany({ where: { code: runId.toUpperCase() } });
  await db.product.deleteMany({ where: { id: { in: productIds } } });
  await db.$disconnect();
}
