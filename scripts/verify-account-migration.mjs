import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
const source = new URL(process.env.DATABASE_URL);
assert.ok(
  ['localhost', '127.0.0.1'].includes(source.hostname) && source.port === '3307',
  'Migration verification requires the local development database host',
);
const name = 'behjati_account_test_' + randomBytes(8).toString('hex');
assert.match(name, /^behjati_account_test_[a-f0-9]{16}$/);
const admin = new PrismaClient();
let scratch;
try {
  await admin.$executeRawUnsafe(
    `CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  source.pathname = '/' + name;
  scratch = new PrismaClient({ datasourceUrl: source.href });
  const oldSchema = [
    'CREATE TABLE User(id VARCHAR(191) PRIMARY KEY) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'CREATE TABLE `Order`(id VARCHAR(191) PRIMARY KEY,userId VARCHAR(191),status VARCHAR(191),total INTEGER,offlinePaidAmount INTEGER) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'CREATE TABLE OrderItem(id VARCHAR(191) PRIMARY KEY,lineTotal INTEGER) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    "CREATE TABLE OfflinePayment(id VARCHAR(36) PRIMARY KEY,orderId VARCHAR(191),amount INTEGER,method ENUM('CASH','POS','CARD_TRANSFER') NOT NULL,adminId VARCHAR(191),adminEmail VARCHAR(191),createdAt DATETIME(3)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    "INSERT INTO User VALUES('customer')",
    "INSERT INTO `Order` VALUES('active','customer','PROCESSING',150000,50000),('canceled','customer','CANCELED',25000,25000)",
    "INSERT INTO OrderItem VALUES('line',150000)",
    "INSERT INTO OfflinePayment VALUES('old-cash','active',50000,'CASH','admin','owner@example.test','2026-10-20 12:34:56.123'),('old-pos','canceled',25000,'POS','admin','owner@example.test','2026-10-20 13:00:00.000')",
  ];
  for (const sql of oldSchema) await scratch.$executeRawUnsafe(sql);
  const before = await scratch.$queryRawUnsafe(
    'SELECT id,total,offlinePaidAmount FROM `Order` ORDER BY id',
  );
  const receiptsBefore = await scratch.$queryRawUnsafe(
    'SELECT id,orderId,amount,method,adminId,adminEmail,createdAt FROM OfflinePayment ORDER BY id',
  );
  const migration = await readFile(
    'apps/api/prisma/migrations/202610220001_manual_accounts/migration.sql',
    'utf8',
  );
  for (const sql of migration
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean))
    await scratch.$executeRawUnsafe(sql);
  assert.deepEqual(
    await scratch.$queryRawUnsafe('SELECT id,total,offlinePaidAmount FROM `Order` ORDER BY id'),
    before,
  );
  assert.deepEqual(
    await scratch.$queryRawUnsafe(
      'SELECT id,orderId,amount,method,adminId,adminEmail,createdAt FROM OfflinePayment ORDER BY id',
    ),
    receiptsBefore,
  );
  const entries = await scratch.$queryRawUnsafe(
    'SELECT id,userId,amount,remaining,direction,createdAt FROM CustomerAccountEntry ORDER BY id',
  );
  assert.equal(entries.length, 2);
  assert.equal(entries[0].amount, 50000);
  assert.equal(entries[0].remaining, 0);
  assert.equal(entries[1].amount, 25000);
  assert.equal(entries[1].remaining, 25000);
  for (let i = 0; i < entries.length; i++) {
    assert.equal(entries[i].userId, 'customer');
    assert.equal(entries[i].direction, 'RECEIPT');
    assert.equal(entries[i].createdAt.toISOString(), receiptsBefore[i].createdAt.toISOString());
  }
  const allocation = await scratch.$queryRawUnsafe(
    'SELECT id,accountEntryId,voided FROM OfflinePayment ORDER BY id',
  );
  assert.equal(allocation[0].accountEntryId, 'old-cash');
  assert.equal(Boolean(allocation[0].voided), false);
  assert.equal(Boolean(allocation[1].voided), true);
  const lines = await scratch.$queryRawUnsafe(
    'SELECT lineTotal,lineSubtotal,discountAmount FROM OrderItem',
  );
  assert.equal(lines[0].lineSubtotal, lines[0].lineTotal);
  assert.equal(lines[0].discountAmount, 0);
  console.log(
    'Account migration passed in a disposable database: old totals, received amounts, payment identities/methods/dates unchanged; legacy receipts backfilled, canceled allocations retained and converted to usable credit, line snapshots preserved. Main database untouched.',
  );
} finally {
  await scratch?.$disconnect();
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${name}\``);
  await admin.$disconnect();
}
