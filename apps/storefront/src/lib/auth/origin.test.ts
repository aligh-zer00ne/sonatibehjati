import { describe, expect, it } from 'vitest';
import { hasAllowedAuthOrigin } from './origin';

const publicOrigin = 'https://sonatibehjati.ir';
const request = (origin?: string, extra: Record<string, string> = {}) =>
  new Request('http://127.0.0.1:3100/api/auth', {
    method: 'POST',
    headers: { ...(origin === undefined ? {} : { Origin: origin }), ...extra },
  });

describe('storefront auth origin behind Nginx', () => {
  it('accepts the configured HTTPS storefront through the internal HTTP listener', () => {
    expect(hasAllowedAuthOrigin(request(publicOrigin), publicOrigin)).toBe(true);
  });

  it('accepts the public origin when Next.js constructs an HTTPS loopback URL', () => {
    const proxied = new Request('https://127.0.0.1:3100/api/auth', {
      method: 'POST',
      headers: {
        Origin: publicOrigin,
        Host: 'sonatibehjati.ir',
        'X-Forwarded-Host': 'sonatibehjati.ir',
        'X-Forwarded-Proto': 'https',
        'Sec-Fetch-Site': 'same-origin',
      },
    });
    expect(hasAllowedAuthOrigin(proxied, publicOrigin)).toBe(true);
  });

  it.each([
    undefined,
    'null',
    'https://other.example',
    'http://sonatibehjati.ir',
    'https://admin.sonatibehjati.ir',
    'https://sonatibehjati.ir.other.example',
    'http://127.0.0.1:3100',
  ])('rejects untrusted or missing Origin %s', (origin) => {
    expect(hasAllowedAuthOrigin(request(origin), publicOrigin)).toBe(false);
  });

  it('does not trust spoofed host or forwarded headers', () => {
    const forged = request('https://other.example', {
      Host: 'other.example',
      'X-Forwarded-Host': 'other.example',
      'X-Forwarded-Proto': 'https',
    });
    expect(hasAllowedAuthOrigin(forged, publicOrigin)).toBe(false);
  });

  it('still rejects an explicitly cross-site request', () => {
    expect(
      hasAllowedAuthOrigin(request(publicOrigin, { 'Sec-Fetch-Site': 'cross-site' }), publicOrigin),
    ).toBe(false);
  });

  it('rejects invalid server configuration', () => {
    expect(hasAllowedAuthOrigin(request(publicOrigin), 'invalid')).toBe(false);
  });

  it('preserves local same-origin login without a configured domain', () => {
    const local = new Request('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { Origin: 'http://localhost:3000' },
    });
    expect(hasAllowedAuthOrigin(local)).toBe(true);
    expect(hasAllowedAuthOrigin(request(publicOrigin))).toBe(false);
  });
});
