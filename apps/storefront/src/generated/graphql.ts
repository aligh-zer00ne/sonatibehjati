/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  postalAddress: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  province: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  recipientPhone: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type AddressInput = {
  city: Scalars['String']['input'];
  isDefault: Scalars['Boolean']['input'];
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  postalAddress: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  province: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type AuthSession = {
  __typename?: 'AuthSession';
  accessExpiresAt: Scalars['String']['output'];
  accessToken: Scalars['String']['output'];
  user: AuthUser;
};

export type AuthUser = {
  __typename?: 'AuthUser';
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
};

export type CatalogInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  excludeSlug?: InputMaybe<Scalars['String']['input']>;
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ProductSort>;
};

export type CatalogPage = {
  __typename?: 'CatalogPage';
  items: Array<Product>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  image: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CheckoutInput = {
  addressId: Scalars['ID']['input'];
  discountCode: Scalars['String']['input'];
  items: Array<CheckoutLineInput>;
};

export type CheckoutLine = {
  __typename?: 'CheckoutLine';
  imageUrl?: Maybe<Scalars['String']['output']>;
  lineTotal: Scalars['Int']['output'];
  productId: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  unitPrice: Scalars['Int']['output'];
  weight: Scalars['String']['output'];
};

export type CheckoutLineInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type CheckoutQuote = {
  __typename?: 'CheckoutQuote';
  addressId: Scalars['ID']['output'];
  discount: Scalars['Int']['output'];
  items: Array<CheckoutLine>;
  shipping: Scalars['Int']['output'];
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CreateOrderInput = {
  addressId: Scalars['ID']['input'];
  discountCode: Scalars['String']['input'];
  expectedTotal: Scalars['Int']['input'];
  items: Array<CheckoutLineInput>;
  requestId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrder: OrderReceipt;
  deleteAddress: Scalars['Boolean']['output'];
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthSession;
  requestOtp: OtpChallenge;
  saveAddress: Address;
  verifyOtp: AuthSession;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRequestOtpArgs = {
  input: RequestOtpInput;
};


export type MutationSaveAddressArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AddressInput;
};


export type MutationVerifyOtpArgs = {
  input: VerifyOtpInput;
};

export type OrderReceipt = {
  __typename?: 'OrderReceipt';
  createdAt: Scalars['String']['output'];
  discount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  shipping: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type OtpChallenge = {
  __typename?: 'OtpChallenge';
  challengeId: Scalars['ID']['output'];
  expiresAt: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  resendAt: Scalars['String']['output'];
};

export type Product = {
  __typename?: 'Product';
  badge?: Maybe<Scalars['String']['output']>;
  category: Category;
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  images: Array<ProductImage>;
  isActive: Scalars['Boolean']['output'];
  price: Scalars['Int']['output'];
  shortDescription: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  weight: Scalars['String']['output'];
};

export type ProductImage = {
  __typename?: 'ProductImage';
  alt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type ProductSort =
  | 'FEATURED'
  | 'NAME_ASC'
  | 'NEWEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC';

export type Query = {
  __typename?: 'Query';
  catalog: CatalogPage;
  categories: Array<Category>;
  checkoutQuote: CheckoutQuote;
  health: Scalars['String']['output'];
  me?: Maybe<AuthUser>;
  myAddresses: Array<Address>;
  orderByRequestId?: Maybe<OrderReceipt>;
  orderReceipt: OrderReceipt;
  product?: Maybe<Product>;
  products: Array<Product>;
  productsByIds: Array<Product>;
  reverseLocation?: Maybe<Scalars['String']['output']>;
};


export type QueryCatalogArgs = {
  input: CatalogInput;
};


export type QueryCheckoutQuoteArgs = {
  input: CheckoutInput;
};


export type QueryOrderByRequestIdArgs = {
  requestId: Scalars['ID']['input'];
};


export type QueryOrderReceiptArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductsByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryReverseLocationArgs = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type RequestOtpInput = {
  phone: Scalars['String']['input'];
};

export type VerifyOtpInput = {
  challengeId: Scalars['ID']['input'];
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type SessionUserFragment = { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', me?: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null };

export type RequestOtpMutationVariables = Exact<{
  input: RequestOtpInput;
}>;


export type RequestOtpMutation = { __typename?: 'Mutation', requestOtp: { __typename?: 'OtpChallenge', challengeId: string, phone: string, expiresAt: string, resendAt: string } };

export type VerifyOtpMutationVariables = Exact<{
  input: VerifyOtpInput;
}>;


export type VerifyOtpMutation = { __typename?: 'Mutation', verifyOtp: { __typename?: 'AuthSession', accessToken: string, accessExpiresAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null } } };

export type RefreshUserSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshUserSessionMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthSession', accessToken: string, accessExpiresAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null } } };

export type LogoutUserMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutUserMutation = { __typename?: 'Mutation', logout: boolean };

export type CatalogProductFragment = { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } };

export type CatalogPageQueryVariables = Exact<{
  input: CatalogInput;
}>;


export type CatalogPageQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, slug: string, title: string, image: string }>, catalog: { __typename?: 'CatalogPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }> } };

export type ProductDetailQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProductDetailQuery = { __typename?: 'Query', product?: { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } } | null };

export type SelectedProductsQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SelectedProductsQuery = { __typename?: 'Query', productsByIds: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }> };

export type CheckoutAddressFragment = { __typename?: 'Address', id: string, title: string, recipientName: string, recipientPhone: string, province: string, city: string, postalAddress: string, postalCode: string, latitude?: number | null, longitude?: number | null, isDefault: boolean };

export type MyAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAddressesQuery = { __typename?: 'Query', myAddresses: Array<{ __typename?: 'Address', id: string, title: string, recipientName: string, recipientPhone: string, province: string, city: string, postalAddress: string, postalCode: string, latitude?: number | null, longitude?: number | null, isDefault: boolean }> };

export type RecoverCheckoutOrderQueryVariables = Exact<{
  requestId: Scalars['ID']['input'];
}>;


export type RecoverCheckoutOrderQuery = { __typename?: 'Query', orderByRequestId?: { __typename?: 'OrderReceipt', id: string, number: number, status: string, subtotal: number, discount: number, shipping: number, total: number, createdAt: string } | null };

export type ReverseCheckoutLocationQueryVariables = Exact<{
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
}>;


export type ReverseCheckoutLocationQuery = { __typename?: 'Query', reverseLocation?: string | null };

export type SaveCheckoutAddressMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AddressInput;
}>;


export type SaveCheckoutAddressMutation = { __typename?: 'Mutation', saveAddress: { __typename?: 'Address', id: string, title: string, recipientName: string, recipientPhone: string, province: string, city: string, postalAddress: string, postalCode: string, latitude?: number | null, longitude?: number | null, isDefault: boolean } };

export type DeleteCheckoutAddressMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCheckoutAddressMutation = { __typename?: 'Mutation', deleteAddress: boolean };

export type CheckoutQuoteQueryVariables = Exact<{
  input: CheckoutInput;
}>;


export type CheckoutQuoteQuery = { __typename?: 'Query', checkoutQuote: { __typename?: 'CheckoutQuote', addressId: string, subtotal: number, discount: number, shipping: number, total: number, items: Array<{ __typename?: 'CheckoutLine', productId: string, title: string, weight: string, imageUrl?: string | null, quantity: number, unitPrice: number, lineTotal: number }> } };

export type ReceiptFragment = { __typename?: 'OrderReceipt', id: string, number: number, status: string, subtotal: number, discount: number, shipping: number, total: number, createdAt: string };

export type CreateCheckoutOrderMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export type CreateCheckoutOrderMutation = { __typename?: 'Mutation', createOrder: { __typename?: 'OrderReceipt', id: string, number: number, status: string, subtotal: number, discount: number, shipping: number, total: number, createdAt: string } };

export type CheckoutOrderReceiptQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CheckoutOrderReceiptQuery = { __typename?: 'Query', orderReceipt: { __typename?: 'OrderReceipt', id: string, number: number, status: string, subtotal: number, discount: number, shipping: number, total: number, createdAt: string } };

export type HomepageCatalogQueryVariables = Exact<{ [key: string]: never; }>;


export type HomepageCatalogQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, slug: string, title: string, image: string }>, products: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }> };

export const SessionUserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<SessionUserFragment, unknown>;
export const CatalogProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CatalogProductFragment, unknown>;
export const CheckoutAddressFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CheckoutAddressFragment, unknown>;
export const ReceiptFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ReceiptFragment, unknown>;
export const CurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const RequestOtpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestOtp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestOtpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestOtp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"challengeId"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"resendAt"}}]}}]}}]} as unknown as DocumentNode<RequestOtpMutation, RequestOtpMutationVariables>;
export const VerifyOtpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyOtp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyOtpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyOtp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<VerifyOtpMutation, VerifyOtpMutationVariables>;
export const RefreshUserSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshUserSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<RefreshUserSessionMutation, RefreshUserSessionMutationVariables>;
export const LogoutUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogoutUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutUserMutation, LogoutUserMutationVariables>;
export const CatalogPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CatalogPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"catalog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CatalogPageQuery, CatalogPageQueryVariables>;
export const ProductDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ProductDetailQuery, ProductDetailQueryVariables>;
export const SelectedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SelectedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productsByIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SelectedProductsQuery, SelectedProductsQueryVariables>;
export const MyAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<MyAddressesQuery, MyAddressesQueryVariables>;
export const RecoverCheckoutOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecoverCheckoutOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderByRequestId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Receipt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RecoverCheckoutOrderQuery, RecoverCheckoutOrderQueryVariables>;
export const ReverseCheckoutLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReverseCheckoutLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reverseLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"latitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"longitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}}}]}]}}]} as unknown as DocumentNode<ReverseCheckoutLocationQuery, ReverseCheckoutLocationQueryVariables>;
export const SaveCheckoutAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveCheckoutAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SaveCheckoutAddressMutation, SaveCheckoutAddressMutationVariables>;
export const DeleteCheckoutAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCheckoutAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCheckoutAddressMutation, DeleteCheckoutAddressMutationVariables>;
export const CheckoutQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckoutQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addressId"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>;
export const CreateCheckoutOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCheckoutOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Receipt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateCheckoutOrderMutation, CreateCheckoutOrderMutationVariables>;
export const CheckoutOrderReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckoutOrderReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderReceipt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Receipt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CheckoutOrderReceiptQuery, CheckoutOrderReceiptQueryVariables>;
export const HomepageCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomepageCatalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<HomepageCatalogQuery, HomepageCatalogQueryVariables>;