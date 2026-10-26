import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { availablePort, developmentEnvironment } from './dev-ports.mjs';

test('occupied loopback ports are skipped and all services stay connected', async () => {
  const occupied = createServer();
  await new Promise((resolve) => occupied.listen(0, '127.0.0.1', resolve));
  try {
    const port = occupied.address().port;
    const original = {
      DEV_STOREFRONT_PORT: String(port),
      DEV_ADMIN_PORT: String(port),
      DEV_API_PORT: String(port),
      PORT: '4100',
      API_URL: 'https://example.com/graphql',
      AUTH_PROXY_SECRET: 'preserved-secret',
    };
    const snapshot = { ...original };
    const { ports, env } = await developmentEnvironment(original);
    assert.equal(new Set(Object.values(ports)).size, 3);
    assert.ok(Object.values(ports).every((chosen) => chosen > port));
    assert.equal(env.PORT, String(ports.api));
    assert.equal(env.API_URL, `http://127.0.0.1:${ports.api}/graphql`);
    assert.equal(env.API_PROXY_TARGET, `http://127.0.0.1:${ports.api}`);
    assert.equal(env.VITE_API_URL, '/api/admin');
    assert.equal(env.STOREFRONT_ORIGIN, `http://localhost:${ports.storefront}`);
    assert.equal(env.ADMIN_ORIGIN, `http://localhost:${ports.admin}`);
    assert.equal(env.NEXT_PUBLIC_SITE_URL, env.STOREFRONT_ORIGIN);
    assert.equal(env.VITE_STOREFRONT_URL, env.STOREFRONT_ORIGIN);
    assert.equal(env.AUTH_PROXY_SECRET, original.AUTH_PROXY_SECRET);
    assert.deepEqual(original, snapshot);
    assert.equal(occupied.listening, true);
  } finally {
    await new Promise((resolve) => occupied.close(resolve));
  }
});

test('free preferred port is retained and reserved for the next service', async () => {
  const reserved = new Set();
  const port = await availablePort(20000, reserved);
  assert.equal(reserved.has(port), true);
  assert.equal(await availablePort(port), port);
  assert.notEqual(await availablePort(port, reserved), port);
});

test('invalid development port overrides fail clearly', async () => {
  for (const port of [NaN, 0, -1, 80, 65536, 3000.5])
    await assert.rejects(availablePort(port), /Development ports/);
});
