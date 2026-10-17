import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@behjati/shared', '@behjati/graphql'],
  poweredByHeader: false,
  rewrites() {
    return [{ source: '/qr', destination: '/QR' }];
  },
  headers() {
    const adminOrigin = new URL(
      process.env.ADMIN_ORIGIN ??
        (process.env.NODE_ENV === 'production'
          ? 'https://admin.sonatibehjati.ir'
          : 'http://localhost:3001'),
    ).origin;
    return [
      ...[
        '/account/:path*',
        '/checkout/:path*',
        '/payment/:path*',
        '/api/:path*',
        '/login',
        '/verify',
        '/cart',
        '/favorites',
        '/search',
        '/support',
        '/admin/:path*',
      ].map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
      ...['/QR', '/qr', '/qr.html'].map((source) => ({
        source,
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, follow' },
          { key: 'Link', value: '<https://sonatibehjati.ir/QR>; rel="canonical"' },
        ],
      })),
      {
        source: '/product/:slug',
        headers: [
          { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${adminOrigin}` },
        ],
      },
    ];
  },
  images: {
    qualities: [75, 85],
    localPatterns: [
      { pathname: '/**', search: '' },
      { pathname: '/images/products/**', search: '?v=styled-3' },
    ],
  },
  env: { CATALOG_SOURCE: process.env.CATALOG_SOURCE ?? 'mock' },
};
export default config;
