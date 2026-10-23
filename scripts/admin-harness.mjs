import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { hashAdminPassword } from '../apps/api/src/modules/admin/passwords.ts';
import {
  db,
  gql,
  adminOrigin,
  phone,
  cleanup,
  throttleKey,
  processes,
  ready,
} from './auth-harness.mjs';
export const adminQueries = {
  login:
    'mutation($input:AdminLoginInput!){adminLogin(input:$input){admin{id email} accessToken accessExpiresAt}}',
  refresh: 'mutation{adminRefresh{admin{id email} accessToken accessExpiresAt}}',
  logout: 'mutation{adminLogout}',
  me: '{adminMe{id email}}',
};
export const admins = [];
export const products = new Set();
let shippingBackup;
export async function shippingFixture(data) {
  if (shippingBackup === undefined)
    shippingBackup = await db.shippingSettings.findUnique({ where: { id: 'store' } });
  return db.shippingSettings.upsert({
    where: { id: 'store' },
    create: { id: 'store', data },
    update: { data, updatedAt: new Date() },
  });
}
export const adminGql = (
  query,
  variables = {},
  cookie = '',
  ip = '192.0.2.1',
  origin = adminOrigin,
) => gql(query, variables, cookie, ip, origin);
export async function createAdmin() {
  const email = `admin-${randomBytes(8).toString('hex')}@example.test`;
  const password = randomBytes(24).toString('base64url');
  const admin = await db.admin.create({
    data: { email, passwordHash: await hashAdminPassword(password) },
  });
  admins.push(admin);
  return { ...admin, password };
}
export async function loginAdmin(admin) {
  return adminGql(adminQueries.login, { input: { email: admin.email, password: admin.password } });
}
export async function createCustomer() {
  const mobile = phone();
  const user = await db.user.create({
    data: { phone: mobile, firstName: 'مشتری آزمون', lastName: 'موقت' },
  });
  const address = await db.address.create({
    data: {
      userId: user.id,
      title: 'خانه',
      recipientName: 'گیرنده هنگام خرید',
      recipientPhone: mobile,
      province: 'یزد',
      city: 'اردکان',
      postalAddress: 'خیابان آزمون، پلاک ۱۰',
      postalCode: '1234567890',
      latitude: 32.31,
      longitude: 54.01,
      isDefault: true,
    },
  });
  const {
    title,
    recipientName,
    recipientPhone,
    province,
    city,
    postalAddress,
    postalCode,
    latitude,
    longitude,
  } = address;
  return {
    user,
    address,
    snapshot: {
      title,
      recipientName,
      recipientPhone,
      province,
      city,
      postalAddress,
      postalCode,
      latitude,
      longitude,
    },
  };
}
export async function createOrderFixture(
  customer,
  product,
  {
    status = 'PENDING_PAYMENT',
    date = new Date(),
    total = 250000,
    snapshot = customer.snapshot,
  } = {},
) {
  return db.order.create({
    data: {
      userId: customer.user.id,
      addressId: customer.address.id,
      addressSnapshot: snapshot,
      status,
      createdAt: date,
      subtotal: 200000,
      discount: 10000,
      shipping: 60000,
      total,
      items: {
        create: {
          productId: product.id,
          productTitle: product.title,
          productWeight: product.weight,
          unitPrice: 100000,
          quantity: 2,
          lineTotal: 200000,
        },
      },
    },
  });
}
export async function startAdmin() {
  const require = createRequire(import.meta.url);
  const server = spawn(
    process.execPath,
    [
      join(dirname(require.resolve('vite/package.json')), 'bin/vite.js'),
      'preview',
      '--port',
      '3005',
      '--host',
      '127.0.0.1',
      '--strictPort',
    ],
    {
      cwd: 'apps/admin',
      env: {
        ...process.env,
        API_PROXY_TARGET: 'http://localhost:4003',
        VITE_API_URL: '/api/admin',
      },
      stdio: 'ignore',
    },
  );
  processes.push(server);
  await ready(adminOrigin + '/login');
}
export async function cleanupAdmin() {
  if (shippingBackup !== undefined) {
    if (shippingBackup)
      await db.shippingSettings.upsert({
        where: { id: 'store' },
        create: shippingBackup,
        update: { data: shippingBackup.data, updatedAt: shippingBackup.updatedAt },
      });
    else await db.shippingSettings.deleteMany({ where: { id: 'store' } });
  }
  await db.payment.deleteMany({
    where: { gatewayTestAdminId: { in: admins.map((a) => a.id) }, mode: 'TEST' },
  });
  const requestWhere = { createdByAdminId: { in: admins.map((a) => a.id) }, mode: 'TEST' };
  await db.offlinePayment.deleteMany({
    where: { accountEntry: { payment: { paymentRequest: requestWhere } } },
  });
  await db.customerAccountEntry.deleteMany({
    where: { payment: { paymentRequest: requestWhere } },
  });
  await db.payment.deleteMany({ where: { paymentRequest: requestWhere, mode: 'TEST' } });
  await db.paymentRequest.deleteMany({ where: requestWhere });
  await cleanup();
  await db.admin.deleteMany({ where: { id: { in: admins.map((admin) => admin.id) } } });
  await db.product.deleteMany({ where: { id: { in: [...products] } } });
  const rateKeys = admins.flatMap((admin) => [
    `admin-login-email:${admin.email}`,
    `admin-password:${admin.id}`,
    `staff:${admin.id}`,
    `export:${admin.id}`,
    `support:${admin.id}`,
    `payment-check:${admin.id}`,
    `gateway-test:${admin.id}`,
    `payment-links:${admin.id}`,
  ]);
  for (const ip of [
    '127.0.0.1',
    '::ffff:127.0.0.1',
    ...Array.from({ length: 32 }, (_, i) => `192.0.2.${i + 1}`),
  ])
    rateKeys.push(`admin-login-ip:${ip}`, `admin-refresh-ip:${ip}`);
  await db.authThrottle.deleteMany({ where: { key: { in: rateKeys.map(throttleKey) } } });
  await db.$disconnect();
}
