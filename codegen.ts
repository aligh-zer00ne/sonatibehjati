import type { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: 'apps/api/src/graphql/schema.graphql',
  generates: {
    'apps/api/src/generated/resolvers.ts': { plugins: ['typescript', 'typescript-resolvers'] },
    'apps/storefront/src/generated/': {
      preset: 'client',
      documents: ['apps/storefront/src/**/*.graphql'],
    },
    'apps/admin/src/generated/': { preset: 'client', documents: ['apps/admin/src/**/*.graphql'] },
  },
};
export default config;
