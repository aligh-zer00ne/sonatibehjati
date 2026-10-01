import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
if (!process.env.DATABASE_URL)
  throw new Error('Set DATABASE_URL to a migrated and seeded test database.');
const server = spawn(process.execPath, ['dist/app.js'], {
  cwd: 'apps/api',
  env: { ...process.env, NODE_ENV: 'test', PORT: '4002' },
  stdio: ['ignore', 'ignore', 'pipe'],
});
let diagnostics = '';
server.stderr.on('data', (chunk) => {
  diagnostics += chunk;
});
const url = 'http://localhost:4002';
const db = new PrismaClient();
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${url}/health`)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for the test API. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `API did not start: ${diagnostics}`);
  const response = await fetch(`${url}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify({
      query:
        '{ products { id title price images { url } category { slug } createdAt } categories { slug } }',
    }),
  });
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  const catalog = await response.json();
  assert.equal(catalog.errors, undefined);
  assert.ok(catalog.data.products.length >= 3);
  assert.equal(catalog.data.categories.length, 3);
  assert.ok(
    catalog.data.products.every(
      (product) => Number.isInteger(product.price) && !Number.isNaN(Date.parse(product.createdAt)),
    ),
  );
  assert.equal(await db.order.count({ where: { id: 'development-order' } }), 1);
  const orderedProduct = await db.orderItem.findFirstOrThrow({
    where: { orderId: 'development-order' },
  });
  await assert.rejects(
    db.product.delete({ where: { id: orderedProduct.productId } }),
    (error) => error.code === 'P2003',
  );
  const unknown = await fetch(`${url}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ product(slug:"does-not-exist") { id } }' }),
  });
  assert.equal((await unknown.json()).data.product, null);
  console.log(
    'API checks passed: MySQL-backed catalog, CORS, date and price serialization, idempotent seed, order product deletion restricted, missing product handled.',
  );
} finally {
  server.kill('SIGTERM');
  await db.$disconnect();
}
