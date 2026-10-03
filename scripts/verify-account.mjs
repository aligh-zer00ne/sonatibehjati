import assert from 'node:assert/strict';
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
const profile =
  'mutation($input:ProfileInput!){updateProfile(input:$input){id phone firstName lastName email}}';
const list =
  'query($input:MyOrdersInput!){myOrders(input:$input){items{id number status total createdAt} total page pageSize totalPages}}';
const detail =
  'query($id:ID!){myOrder(id:$id){id number status subtotal discount shipping total createdAt address{recipientName recipientPhone province city postalAddress postalCode latitude longitude} items{productId productTitle productWeight unitPrice quantity lineTotal}}}';
const save = 'mutation($input:AddressInput!){saveAddress(input:$input){id}}';
const runId = `account-${Date.now()}`;
let productId;
try {
  await startAPI({ environment: 'development', developmentCode: '123456' });
  const otp = await challenge();
  const login = await gql(keys.verify, verification(otp));
  const otherOtp = await challenge();
  const other = await gql(keys.verify, verification(otherOtp));
  const cookie = login.cookies;
  const userId = login.data.verifyOtp.user.id;
  const input = { firstName: ' علی ', lastName: ' غفوری ', email: ' USER@Example.COM ' };
  errorCode(await gql(profile, { input }), 'UNAUTHENTICATED');
  errorCode(await gql(list, { input: {} }), 'UNAUTHENTICATED');
  errorCode(await gql(detail, { id: 'unknown' }), 'UNAUTHENTICATED');
  errorCode(
    await gql(profile, { input }, cookie, '192.0.2.1', 'https://other.example'),
    'FORBIDDEN',
  );
  const saved = await gql(profile, { input }, cookie);
  assert.equal(saved.errors, undefined);
  assert.deepEqual(saved.data.updateProfile, {
    id: userId,
    phone: otp.phone,
    firstName: 'علی',
    lastName: 'غفوری',
    email: 'user@example.com',
  });
  assert.equal(
    (await db.user.findUniqueOrThrow({ where: { id: other.data.verifyOtp.user.id } })).firstName,
    null,
  );
  errorCode(
    await gql(profile, { input: { ...input, email: 'invalid' } }, cookie),
    'BAD_USER_INPUT',
  );
  errorCode(await gql(profile, { input: { ...input, firstName: ' ' } }, cookie), 'BAD_USER_INPUT');
  errorCode(
    await gql(profile, { input: { ...input, lastName: 'x'.repeat(81) } }, cookie),
    'BAD_USER_INPUT',
  );
  assert.ok((await gql(profile, { input: { ...input, phone: otherOtp.phone } }, cookie)).errors);
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: userId } })).phone, otp.phone);
  assert.equal(
    (await gql(profile, { input: { ...input, email: '' } }, cookie)).data.updateProfile.email,
    null,
  );
  const refresh = await gql(keys.refresh, {}, cookie);
  assert.equal(
    (await db.user.findUniqueOrThrow({ where: { id: refresh.data.refreshToken.user.id } }))
      .firstName,
    'علی',
  );
  const addressInput = {
    title: 'خانه',
    recipientName: 'گیرنده اولیه',
    recipientPhone: otp.phone,
    province: 'یزد',
    city: 'اردکان',
    postalAddress: 'خیابان اولیه، پلاک ۱۰',
    postalCode: '1234567890',
    latitude: 32.31,
    longitude: 54.01,
    isDefault: true,
  };
  const addressId = (await gql(save, { input: addressInput }, refresh.cookies)).data.saveAddress.id;
  const snapshot = { ...addressInput };
  delete snapshot.isDefault;
  const category = await db.category.findFirstOrThrow();
  productId = runId;
  await db.product.create({
    data: {
      id: productId,
      slug: runId,
      title: 'محصول اولیه',
      weight: '۵۰۰ گرم',
      price: 100000,
      categoryId: category.id,
      shortDescription: 'موقت',
      description: 'برای آزمون',
    },
  });
  const statuses = ['CREATED', 'PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'];
  const orders = [];
  for (let i = 0; i < 23; i++)
    orders.push(
      await db.order.create({
        data: {
          userId,
          addressId,
          addressSnapshot: snapshot,
          status: statuses[i % statuses.length],
          subtotal: 200000,
          discount: 10000,
          shipping: 60000,
          total: 250000,
          createdAt: new Date(Date.UTC(2026, 8, 1) + i * 1000),
          items: {
            create: {
              productId,
              productTitle: 'محصول اولیه',
              productWeight: '۵۰۰ گرم',
              unitPrice: 100000,
              quantity: 2,
              lineTotal: 200000,
            },
          },
        },
      }),
    );
  const newest = orders.at(-1);
  const paged = await gql(list, { input: {} }, refresh.cookies);
  assert.equal(paged.errors, undefined);
  assert.equal(paged.data.myOrders.total, 23);
  assert.equal(paged.data.myOrders.totalPages, 3);
  assert.equal(paged.data.myOrders.items.length, 10);
  assert.equal(paged.data.myOrders.items[0].id, newest.id);
  const second = (await gql(list, { input: { page: 2 } }, refresh.cookies)).data.myOrders;
  assert.equal(second.items.length, 10);
  assert.ok(
    second.items.every((item) => !paged.data.myOrders.items.some((first) => first.id === item.id)),
  );
  assert.equal(
    (await gql(list, { input: { page: 3 } }, refresh.cookies)).data.myOrders.items.length,
    3,
  );
  assert.equal((await gql(list, { input: {} }, other.cookies)).data.myOrders.total, 0);
  for (const status of statuses) {
    const filtered = (await gql(list, { input: { status } }, refresh.cookies)).data.myOrders;
    assert.equal(filtered.total, orders.filter((order) => order.status === status).length);
    assert.ok(filtered.items.every((order) => order.status === status));
  }
  for (const input of [{ page: 0 }, { pageSize: 21 }, { page: 10001 }])
    errorCode(await gql(list, { input }, refresh.cookies), 'BAD_USER_INPUT');
  errorCode(await gql(detail, { id: newest.id }, other.cookies), 'NOT_FOUND');
  errorCode(await gql(detail, { id: 'missing' }, refresh.cookies), 'NOT_FOUND');
  await db.address.update({
    where: { id: addressId },
    data: { postalAddress: 'نشانی جدید', recipientName: 'گیرنده جدید' },
  });
  await db.product.update({
    where: { id: productId },
    data: { price: 999999, title: 'عنوان جدید', isActive: false },
  });
  const read = await gql(detail, { id: newest.id }, refresh.cookies);
  assert.equal(read.errors, undefined);
  assert.equal(read.data.myOrder.address.postalAddress, snapshot.postalAddress);
  assert.equal(read.data.myOrder.address.recipientName, snapshot.recipientName);
  assert.equal(read.data.myOrder.items[0].productTitle, 'محصول اولیه');
  assert.equal(read.data.myOrder.items[0].unitPrice, 100000);
  assert.equal(read.data.myOrder.total, 250000);
  await db.order.update({
    where: { id: newest.id },
    data: { addressSnapshot: { city: 'اردکان', postalAddress: 'نشانی قدیمی' } },
  });
  const historical = (await gql(detail, { id: newest.id }, refresh.cookies)).data.myOrder;
  assert.equal(historical.address.recipientName, null);
  assert.equal(historical.address.postalAddress, 'نشانی قدیمی');
  console.log(
    'Account API passed: profile validation and identity protection, verified phone unchanged, origin/guest guards, own paginated and status-filtered orders, IDOR denial, stable product/address snapshots and historical incomplete snapshots.',
  );
} finally {
  await cleanup();
  if (productId) await db.product.deleteMany({ where: { id: productId } });
  await db.$disconnect();
}
