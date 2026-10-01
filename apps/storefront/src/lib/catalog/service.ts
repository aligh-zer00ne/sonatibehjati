import 'server-only';
import { executeGraphQL } from '@behjati/graphql';
import { HomepageCatalogDocument } from '@/generated/graphql';
import { mockCatalog } from './mock';
export async function getHomepageCatalog() {
  if (process.env.CATALOG_SOURCE === 'api')
    return executeGraphQL(
      process.env.API_URL ?? 'http://localhost:4000/graphql',
      HomepageCatalogDocument,
      {},
    );
  if (process.env.NODE_ENV === 'production' && process.env.CATALOG_SOURCE !== 'mock')
    throw new Error('Configure CATALOG_SOURCE explicitly as api or mock.');
  return mockCatalog;
}
