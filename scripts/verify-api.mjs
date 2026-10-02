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
const runId = `commerce-${Date.now()}`;
async function graphql(query, variables = {}) {
  const response = await fetch(`${url}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}
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
  const category = await db.category.findUniqueOrThrow({ where: { slug: 'oil' } });
  const ids = Array.from({ length: 6 }, (_, index) => `${runId}-${index}`);
  await db.product.createMany({
    data: ids.map((id, index) => ({
      id,
      slug: id,
      title: `روغن کنجدی ${runId}`,
      shortDescription: 'آزمون کاتالوگ',
      description: 'دادهٔ موقت آزمون',
      categoryId: category.id,
      weight: '۲۵۰ میلی‌لیتر',
      price: (index + 1) * 100,
      isActive: index !== 5,
    })),
  });
  const query =
    'query($input:CatalogInput!){ catalog(input:$input){ items { id price } total page pageSize totalPages } }';
  const input = {
    search: `كنجدي ${runId}`,
    category: 'oil',
    minPrice: 100,
    maxPrice: 500,
    sort: 'PRICE_ASC',
    pageSize: 2,
  };
  const pages = [];
  for (const page of [1, 2, 3]) {
    const result = await graphql(query, { input: { ...input, page } });
    assert.equal(result.errors, undefined);
    assert.equal(result.data.catalog.total, 5);
    assert.equal(result.data.catalog.totalPages, 3);
    pages.push(...result.data.catalog.items);
  }
  assert.deepEqual(
    pages.map((product) => product.price),
    [100, 200, 300, 400, 500],
  );
  assert.equal(new Set(pages.map((product) => product.id)).size, 5);
  const excluded = await graphql(query, {
    input: {
      ...input,
      excludeSlug: ids[0],
      minPrice: 200,
      maxPrice: 400,
      sort: 'PRICE_DESC',
      pageSize: 24,
    },
  });
  assert.deepEqual(
    excluded.data.catalog.items.map((product) => product.price),
    [400, 300, 200],
  );
  const selection = await graphql('query($ids:[ID!]!){ productsByIds(ids:$ids){ id } }', {
    ids: [...ids, ids[0], 'missing'],
  });
  assert.equal(selection.data.productsByIds.length, 5);
  assert.ok(selection.data.productsByIds.every((product) => product.id !== ids[5]));
  for (const invalid of [{ page: 0 }, { pageSize: 25 }, { minPrice: 400, maxPrice: 200 }]) {
    const result = await graphql(query, { input: invalid });
    assert.equal(result.errors[0].extensions.code, 'BAD_USER_INPUT');
  }
  const oversized = await graphql('query($ids:[ID!]!){ productsByIds(ids:$ids){ id } }', {
    ids: Array(201).fill(ids[0]),
  });
  assert.equal(oversized.errors[0].extensions.code, 'BAD_USER_INPUT');
  console.log(
    'API checks passed: MySQL-backed catalog, combined filters, normalized Persian search, stable sorted pagination, related-product exclusion, active-only cart lookup, bounded invalid inputs, CORS, serialization, seed integrity and restricted order product deletion.',
  );
} finally {
  await db.product.deleteMany({ where: { id: { startsWith: runId } } });
  server.kill('SIGTERM');
  await db.$disconnect();
}
