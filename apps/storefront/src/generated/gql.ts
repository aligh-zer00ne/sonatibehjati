/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment SessionUser on AuthUser {\n  id\n  phone\n  firstName\n  lastName\n  email\n}\n\nquery CurrentUser {\n  me {\n    ...SessionUser\n  }\n}\n\nmutation RequestOtp($input: RequestOtpInput!) {\n  requestOtp(input: $input) {\n    challengeId\n    phone\n    expiresAt\n    resendAt\n  }\n}\n\nmutation VerifyOtp($input: VerifyOtpInput!) {\n  verifyOtp(input: $input) {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation RefreshUserSession {\n  refreshToken {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation LogoutUser {\n  logout\n}": typeof types.SessionUserFragmentDoc,
    "fragment CatalogProduct on Product {\n  id\n  slug\n  title\n  shortDescription\n  description\n  price\n  weight\n  badge\n  isActive\n  images {\n    id\n    url\n    alt\n  }\n  category {\n    id\n    slug\n    title\n    image\n  }\n  createdAt\n  updatedAt\n}\n\nquery CatalogPage($input: CatalogInput!) {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  catalog(input: $input) {\n    items {\n      ...CatalogProduct\n    }\n    total\n    page\n    pageSize\n    totalPages\n  }\n}\n\nquery ProductDetail($slug: String!) {\n  product(slug: $slug) {\n    ...CatalogProduct\n  }\n}\n\nquery SelectedProducts($ids: [ID!]!) {\n  productsByIds(ids: $ids) {\n    ...CatalogProduct\n  }\n}": typeof types.CatalogProductFragmentDoc,
    "query HomepageCatalog {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  products {\n    id\n    slug\n    title\n    shortDescription\n    description\n    price\n    weight\n    badge\n    isActive\n    images {\n      id\n      url\n      alt\n    }\n    category {\n      id\n      slug\n      title\n      image\n    }\n    createdAt\n    updatedAt\n  }\n}": typeof types.HomepageCatalogDocument,
};
const documents: Documents = {
    "fragment SessionUser on AuthUser {\n  id\n  phone\n  firstName\n  lastName\n  email\n}\n\nquery CurrentUser {\n  me {\n    ...SessionUser\n  }\n}\n\nmutation RequestOtp($input: RequestOtpInput!) {\n  requestOtp(input: $input) {\n    challengeId\n    phone\n    expiresAt\n    resendAt\n  }\n}\n\nmutation VerifyOtp($input: VerifyOtpInput!) {\n  verifyOtp(input: $input) {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation RefreshUserSession {\n  refreshToken {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation LogoutUser {\n  logout\n}": types.SessionUserFragmentDoc,
    "fragment CatalogProduct on Product {\n  id\n  slug\n  title\n  shortDescription\n  description\n  price\n  weight\n  badge\n  isActive\n  images {\n    id\n    url\n    alt\n  }\n  category {\n    id\n    slug\n    title\n    image\n  }\n  createdAt\n  updatedAt\n}\n\nquery CatalogPage($input: CatalogInput!) {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  catalog(input: $input) {\n    items {\n      ...CatalogProduct\n    }\n    total\n    page\n    pageSize\n    totalPages\n  }\n}\n\nquery ProductDetail($slug: String!) {\n  product(slug: $slug) {\n    ...CatalogProduct\n  }\n}\n\nquery SelectedProducts($ids: [ID!]!) {\n  productsByIds(ids: $ids) {\n    ...CatalogProduct\n  }\n}": types.CatalogProductFragmentDoc,
    "query HomepageCatalog {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  products {\n    id\n    slug\n    title\n    shortDescription\n    description\n    price\n    weight\n    badge\n    isActive\n    images {\n      id\n      url\n      alt\n    }\n    category {\n      id\n      slug\n      title\n      image\n    }\n    createdAt\n    updatedAt\n  }\n}": types.HomepageCatalogDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment SessionUser on AuthUser {\n  id\n  phone\n  firstName\n  lastName\n  email\n}\n\nquery CurrentUser {\n  me {\n    ...SessionUser\n  }\n}\n\nmutation RequestOtp($input: RequestOtpInput!) {\n  requestOtp(input: $input) {\n    challengeId\n    phone\n    expiresAt\n    resendAt\n  }\n}\n\nmutation VerifyOtp($input: VerifyOtpInput!) {\n  verifyOtp(input: $input) {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation RefreshUserSession {\n  refreshToken {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation LogoutUser {\n  logout\n}"): (typeof documents)["fragment SessionUser on AuthUser {\n  id\n  phone\n  firstName\n  lastName\n  email\n}\n\nquery CurrentUser {\n  me {\n    ...SessionUser\n  }\n}\n\nmutation RequestOtp($input: RequestOtpInput!) {\n  requestOtp(input: $input) {\n    challengeId\n    phone\n    expiresAt\n    resendAt\n  }\n}\n\nmutation VerifyOtp($input: VerifyOtpInput!) {\n  verifyOtp(input: $input) {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation RefreshUserSession {\n  refreshToken {\n    accessToken\n    user {\n      ...SessionUser\n    }\n    accessExpiresAt\n  }\n}\n\nmutation LogoutUser {\n  logout\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment CatalogProduct on Product {\n  id\n  slug\n  title\n  shortDescription\n  description\n  price\n  weight\n  badge\n  isActive\n  images {\n    id\n    url\n    alt\n  }\n  category {\n    id\n    slug\n    title\n    image\n  }\n  createdAt\n  updatedAt\n}\n\nquery CatalogPage($input: CatalogInput!) {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  catalog(input: $input) {\n    items {\n      ...CatalogProduct\n    }\n    total\n    page\n    pageSize\n    totalPages\n  }\n}\n\nquery ProductDetail($slug: String!) {\n  product(slug: $slug) {\n    ...CatalogProduct\n  }\n}\n\nquery SelectedProducts($ids: [ID!]!) {\n  productsByIds(ids: $ids) {\n    ...CatalogProduct\n  }\n}"): (typeof documents)["fragment CatalogProduct on Product {\n  id\n  slug\n  title\n  shortDescription\n  description\n  price\n  weight\n  badge\n  isActive\n  images {\n    id\n    url\n    alt\n  }\n  category {\n    id\n    slug\n    title\n    image\n  }\n  createdAt\n  updatedAt\n}\n\nquery CatalogPage($input: CatalogInput!) {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  catalog(input: $input) {\n    items {\n      ...CatalogProduct\n    }\n    total\n    page\n    pageSize\n    totalPages\n  }\n}\n\nquery ProductDetail($slug: String!) {\n  product(slug: $slug) {\n    ...CatalogProduct\n  }\n}\n\nquery SelectedProducts($ids: [ID!]!) {\n  productsByIds(ids: $ids) {\n    ...CatalogProduct\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query HomepageCatalog {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  products {\n    id\n    slug\n    title\n    shortDescription\n    description\n    price\n    weight\n    badge\n    isActive\n    images {\n      id\n      url\n      alt\n    }\n    category {\n      id\n      slug\n      title\n      image\n    }\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query HomepageCatalog {\n  categories {\n    id\n    slug\n    title\n    image\n  }\n  products {\n    id\n    slug\n    title\n    shortDescription\n    description\n    price\n    weight\n    badge\n    isActive\n    images {\n      id\n      url\n      alt\n    }\n    category {\n      id\n      slug\n      title\n      image\n    }\n    createdAt\n    updatedAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;