import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@behjati/shared', '@behjati/graphql'],
  poweredByHeader: false,
  env: { CATALOG_SOURCE: process.env.CATALOG_SOURCE ?? 'mock' },
};
export default config;
