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

export type AccountOrder = {
  __typename?: 'AccountOrder';
  address: OrderAddressSnapshot;
  createdAt: Scalars['String']['output'];
  discount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItemSnapshot>;
  number: Scalars['Int']['output'];
  shipping: Scalars['Int']['output'];
  status: OrderStatus;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AccountOrderSummary = {
  __typename?: 'AccountOrderSummary';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  status: OrderStatus;
  total: Scalars['Int']['output'];
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

export type AdminDailyMetric = {
  __typename?: 'AdminDailyMetric';
  date: Scalars['String']['output'];
  orderValue: Scalars['Float']['output'];
  ordersCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type AdminDashboard = {
  __typename?: 'AdminDashboard';
  averageOrderValue: Scalars['Float']['output'];
  orderValue: Scalars['Float']['output'];
  ordersCount: Scalars['Int']['output'];
  ordersThisMonth: Scalars['Int']['output'];
  ordersToday: Scalars['Int']['output'];
  recentOrders: Array<AdminOrderSummary>;
  report: AdminReport;
  revenue: Scalars['Float']['output'];
};

export type AdminIdentity = {
  __typename?: 'AdminIdentity';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type AdminLoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type AdminOrder = {
  __typename?: 'AdminOrder';
  address: OrderAddressSnapshot;
  createdAt: Scalars['String']['output'];
  discount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItemSnapshot>;
  number: Scalars['Int']['output'];
  shipping: Scalars['Int']['output'];
  status: OrderStatus;
  statusEvents: Array<OrderStatusEvent>;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  user: AuthUser;
};

export type AdminOrderSort =
  | 'NEWEST'
  | 'OLDEST'
  | 'TOTAL_ASC'
  | 'TOTAL_DESC';

export type AdminOrderStatusInput = {
  expectedStatus: OrderStatus;
  id: Scalars['ID']['input'];
  status: OrderStatus;
};

export type AdminOrderSummary = {
  __typename?: 'AdminOrderSummary';
  address: OrderAddressSnapshot;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  status: OrderStatus;
  total: Scalars['Int']['output'];
  user: AuthUser;
};

export type AdminOrdersInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<AdminOrderSort>;
  status?: InputMaybe<OrderStatus>;
  to?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type AdminOrdersPage = {
  __typename?: 'AdminOrdersPage';
  items: Array<AdminOrderSummary>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminProductDeletion = {
  __typename?: 'AdminProductDeletion';
  deleted: Scalars['Boolean']['output'];
  product?: Maybe<Product>;
};

export type AdminProductImageInput = {
  alt: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type AdminProductInput = {
  badge?: InputMaybe<Scalars['String']['input']>;
  categoryId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  images: Array<AdminProductImageInput>;
  isActive: Scalars['Boolean']['input'];
  price: Scalars['Int']['input'];
  shortDescription: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  weight: Scalars['String']['input'];
};

export type AdminProductsInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ProductSort>;
};

export type AdminProductsPage = {
  __typename?: 'AdminProductsPage';
  items: Array<Product>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminReport = {
  __typename?: 'AdminReport';
  averageOrderValue: Scalars['Float']['output'];
  daily: Array<AdminDailyMetric>;
  from: Scalars['String']['output'];
  orderValue: Scalars['Float']['output'];
  ordersCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  statuses: Array<AdminStatusMetric>;
  to: Scalars['String']['output'];
};

export type AdminReportInput = {
  from: Scalars['String']['input'];
  status?: InputMaybe<OrderStatus>;
  to: Scalars['String']['input'];
};

export type AdminSessionPayload = {
  __typename?: 'AdminSessionPayload';
  accessExpiresAt: Scalars['String']['output'];
  accessToken: Scalars['String']['output'];
  admin: AdminIdentity;
};

export type AdminStatusMetric = {
  __typename?: 'AdminStatusMetric';
  count: Scalars['Int']['output'];
  status: OrderStatus;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  ordersCount: Scalars['Int']['output'];
  phone: Scalars['String']['output'];
  totalOrdersValue: Scalars['Float']['output'];
};

export type AdminUsersInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminUsersPage = {
  __typename?: 'AdminUsersPage';
  items: Array<AdminUser>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
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
  adminLogin: AdminSessionPayload;
  adminLogout: Scalars['Boolean']['output'];
  adminRefresh: AdminSessionPayload;
  createOrder: OrderReceipt;
  deleteAddress: Scalars['Boolean']['output'];
  deleteAdminProduct: AdminProductDeletion;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthSession;
  requestOtp: OtpChallenge;
  saveAddress: Address;
  saveAdminProduct: Product;
  setAdminProductActive: Product;
  updateAdminOrderStatus: AdminOrder;
  updateProfile: AuthUser;
  verifyOtp: AuthSession;
};


export type MutationAdminLoginArgs = {
  input: AdminLoginInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAdminProductArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationRequestOtpArgs = {
  input: RequestOtpInput;
};


export type MutationSaveAddressArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AddressInput;
};


export type MutationSaveAdminProductArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AdminProductInput;
};


export type MutationSetAdminProductActiveArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationUpdateAdminOrderStatusArgs = {
  input: AdminOrderStatusInput;
};


export type MutationUpdateProfileArgs = {
  input: ProfileInput;
};


export type MutationVerifyOtpArgs = {
  input: VerifyOtpInput;
};

export type MyOrdersInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<OrderStatus>;
};

export type MyOrdersPage = {
  __typename?: 'MyOrdersPage';
  items: Array<AccountOrderSummary>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type OrderAddressSnapshot = {
  __typename?: 'OrderAddressSnapshot';
  city?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  postalAddress?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
  recipientName?: Maybe<Scalars['String']['output']>;
  recipientPhone?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type OrderItemSnapshot = {
  __typename?: 'OrderItemSnapshot';
  id: Scalars['ID']['output'];
  lineTotal: Scalars['Int']['output'];
  productId: Scalars['ID']['output'];
  productTitle: Scalars['String']['output'];
  productWeight: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  unitPrice: Scalars['Int']['output'];
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

export type OrderStatus =
  | 'CANCELED'
  | 'CREATED'
  | 'DELIVERED'
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED';

export type OrderStatusEvent = {
  __typename?: 'OrderStatusEvent';
  admin: AdminIdentity;
  createdAt: Scalars['String']['output'];
  fromStatus: OrderStatus;
  id: Scalars['ID']['output'];
  toStatus: OrderStatus;
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

export type ProfileInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  adminDashboard: AdminDashboard;
  adminMe?: Maybe<AdminIdentity>;
  adminOrder: AdminOrder;
  adminOrders: AdminOrdersPage;
  adminProducts: AdminProductsPage;
  adminReport: AdminReport;
  adminUser: AdminUser;
  adminUsers: AdminUsersPage;
  catalog: CatalogPage;
  categories: Array<Category>;
  checkoutQuote: CheckoutQuote;
  health: Scalars['String']['output'];
  me?: Maybe<AuthUser>;
  myAddresses: Array<Address>;
  myOrder: AccountOrder;
  myOrders: MyOrdersPage;
  orderByRequestId?: Maybe<OrderReceipt>;
  orderReceipt: OrderReceipt;
  product?: Maybe<Product>;
  products: Array<Product>;
  productsByIds: Array<Product>;
  reverseLocation?: Maybe<Scalars['String']['output']>;
};


export type QueryAdminOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminOrdersArgs = {
  input: AdminOrdersInput;
};


export type QueryAdminProductsArgs = {
  input: AdminProductsInput;
};


export type QueryAdminReportArgs = {
  input: AdminReportInput;
};


export type QueryAdminUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminUsersArgs = {
  input: AdminUsersInput;
};


export type QueryCatalogArgs = {
  input: CatalogInput;
};


export type QueryCheckoutQuoteArgs = {
  input: CheckoutInput;
};


export type QueryMyOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyOrdersArgs = {
  input: MyOrdersInput;
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

export type AdminIdentityFieldsFragment = { __typename?: 'AdminIdentity', id: string, email: string };

export type AdminLoginMutationVariables = Exact<{
  input: AdminLoginInput;
}>;


export type AdminLoginMutation = { __typename?: 'Mutation', adminLogin: { __typename?: 'AdminSessionPayload', accessToken: string, accessExpiresAt: string, admin: { __typename?: 'AdminIdentity', id: string, email: string } } };

export type AdminRefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type AdminRefreshMutation = { __typename?: 'Mutation', adminRefresh: { __typename?: 'AdminSessionPayload', accessToken: string, accessExpiresAt: string, admin: { __typename?: 'AdminIdentity', id: string, email: string } } };

export type AdminLogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type AdminLogoutMutation = { __typename?: 'Mutation', adminLogout: boolean };

export type AdminMeQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminMeQuery = { __typename?: 'Query', adminMe?: { __typename?: 'AdminIdentity', id: string, email: string } | null };

export type AdminProductFieldsFragment = { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> };

export type AdminProductsQueryVariables = Exact<{
  input: AdminProductsInput;
}>;


export type AdminProductsQuery = { __typename?: 'Query', adminProducts: { __typename?: 'AdminProductsPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> }> }, categories: Array<{ __typename?: 'Category', id: string, title: string }> };

export type SaveAdminProductMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AdminProductInput;
}>;


export type SaveAdminProductMutation = { __typename?: 'Mutation', saveAdminProduct: { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> } };

export type SetAdminProductActiveMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type SetAdminProductActiveMutation = { __typename?: 'Mutation', setAdminProductActive: { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> } };

export type DeleteAdminProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type DeleteAdminProductMutation = { __typename?: 'Mutation', deleteAdminProduct: { __typename?: 'AdminProductDeletion', deleted: boolean, product?: { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> } | null } };

export type AdminOrderAddressFieldsFragment = { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null };

export type AdminCustomerFieldsFragment = { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null };

export type AdminOrderSummaryFieldsFragment = { __typename?: 'AdminOrderSummary', id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } };

export type AdminOrderFieldsFragment = { __typename?: 'AdminOrder', id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', id: string, email: string } }> };

export type AdminOrdersQueryVariables = Exact<{
  input: AdminOrdersInput;
}>;


export type AdminOrdersQuery = { __typename?: 'Query', adminOrders: { __typename?: 'AdminOrdersPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'AdminOrderSummary', id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } }> } };

export type AdminOrderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminOrderQuery = { __typename?: 'Query', adminOrder: { __typename?: 'AdminOrder', id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', id: string, email: string } }> } };

export type UpdateAdminOrderStatusMutationVariables = Exact<{
  input: AdminOrderStatusInput;
}>;


export type UpdateAdminOrderStatusMutation = { __typename?: 'Mutation', updateAdminOrderStatus: { __typename?: 'AdminOrder', id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', id: string, email: string } }> } };

export type AdminUsersQueryVariables = Exact<{
  input: AdminUsersInput;
}>;


export type AdminUsersQuery = { __typename?: 'Query', adminUsers: { __typename?: 'AdminUsersPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null, createdAt: string, ordersCount: number, totalOrdersValue: number }> } };

export type AdminReportFieldsFragment = { __typename?: 'AdminReport', from: string, to: string, ordersCount: number, orderValue: number, averageOrderValue: number, revenue: number, daily: Array<{ __typename?: 'AdminDailyMetric', date: string, ordersCount: number, orderValue: number, revenue: number }>, statuses: Array<{ __typename?: 'AdminStatusMetric', status: OrderStatus, count: number }> };

export type AdminDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminDashboardQuery = { __typename?: 'Query', adminDashboard: { __typename?: 'AdminDashboard', ordersCount: number, ordersToday: number, ordersThisMonth: number, orderValue: number, revenue: number, averageOrderValue: number, recentOrders: Array<{ __typename?: 'AdminOrderSummary', id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } }>, report: { __typename?: 'AdminReport', from: string, to: string, ordersCount: number, orderValue: number, averageOrderValue: number, revenue: number, daily: Array<{ __typename?: 'AdminDailyMetric', date: string, ordersCount: number, orderValue: number, revenue: number }>, statuses: Array<{ __typename?: 'AdminStatusMetric', status: OrderStatus, count: number }> } } };

export type AdminReportQueryVariables = Exact<{
  input: AdminReportInput;
}>;


export type AdminReportQuery = { __typename?: 'Query', adminReport: { __typename?: 'AdminReport', from: string, to: string, ordersCount: number, orderValue: number, averageOrderValue: number, revenue: number, daily: Array<{ __typename?: 'AdminDailyMetric', date: string, ordersCount: number, orderValue: number, revenue: number }>, statuses: Array<{ __typename?: 'AdminStatusMetric', status: OrderStatus, count: number }> } };

export type AdminSelectedUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminSelectedUserQuery = { __typename?: 'Query', adminUser: { __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null, createdAt: string, ordersCount: number, totalOrdersValue: number } };

export const AdminProductFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<AdminProductFieldsFragment, unknown>;
export const AdminCustomerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminCustomerFieldsFragment, unknown>;
export const AdminOrderAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]} as unknown as DocumentNode<AdminOrderAddressFieldsFragment, unknown>;
export const AdminOrderSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]} as unknown as DocumentNode<AdminOrderSummaryFieldsFragment, unknown>;
export const AdminIdentityFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminIdentityFieldsFragment, unknown>;
export const AdminOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminOrderFieldsFragment, unknown>;
export const AdminReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"daily"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminReportFieldsFragment, unknown>;
export const AdminLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminLoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminLoginMutation, AdminLoginMutationVariables>;
export const AdminRefreshDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminRefresh"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRefresh"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminRefreshMutation, AdminRefreshMutationVariables>;
export const AdminLogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLogout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLogout"}}]}}]} as unknown as DocumentNode<AdminLogoutMutation, AdminLogoutMutationVariables>;
export const AdminMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminMeQuery, AdminMeQueryVariables>;
export const AdminProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<AdminProductsQuery, AdminProductsQueryVariables>;
export const SaveAdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<SaveAdminProductMutation, SaveAdminProductMutationVariables>;
export const SetAdminProductActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminProductActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminProductActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<SetAdminProductActiveMutation, SetAdminProductActiveMutationVariables>;
export const DeleteAdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAdminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleted"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<DeleteAdminProductMutation, DeleteAdminProductMutationVariables>;
export const AdminOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrdersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderSummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}}]} as unknown as DocumentNode<AdminOrdersQuery, AdminOrdersQueryVariables>;
export const AdminOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<AdminOrderQuery, AdminOrderQueryVariables>;
export const UpdateAdminOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAdminOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAdminOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAdminOrderStatusMutation, UpdateAdminOrderStatusMutationVariables>;
export const AdminUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrdersValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const AdminDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"ordersToday"}},{"kind":"Field","name":{"kind":"Name","value":"ordersThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"recentOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderSummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"report"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminReportFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"daily"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminDashboardQuery, AdminDashboardQueryVariables>;
export const AdminReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminReportFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"daily"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminReportQuery, AdminReportQueryVariables>;
export const AdminSelectedUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSelectedUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrdersValue"}}]}}]}}]} as unknown as DocumentNode<AdminSelectedUserQuery, AdminSelectedUserQueryVariables>;