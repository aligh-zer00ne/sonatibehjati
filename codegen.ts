import type { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: 'apps/api/src/graphql/schema.graphql',
  generates: {
    'apps/api/src/generated/resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../graphql/context.js#AuthContext',
        enumsAsTypes: true,
        mappers: {
          OrderReceipt: '../modules/payments/types.js#ReceiptSource',
          AccountOrder: '../modules/payments/types.js#AccountOrderSource',
          AdminOrder: '../modules/payments/types.js#AdminOrderSource',
        },
      },
    },
    'apps/storefront/src/generated/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: { enumsAsTypes: true },
      documents: ['apps/storefront/src/**/*.graphql'],
    },
    'apps/admin/src/generated/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: { enumsAsTypes: true },
      documents: ['apps/admin/src/**/*.graphql'],
    },
  },
};
export default config;
