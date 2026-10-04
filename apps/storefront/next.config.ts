import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@behjati/shared', '@behjati/graphql'],
  poweredByHeader: false,
  images: { qualities: [75, 85] },
  env: { CATALOG_SOURCE: process.env.CATALOG_SOURCE ?? 'mock' },
};
export default config;
