import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@behjati/shared', '@behjati/graphql'],
  poweredByHeader: false,
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
