import { GraphQLResolveInfo } from 'graphql';
import { AuthContext } from '../graphql/context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  activeProductsCount: Scalars['Int']['output'];
  averageOrderValue: Scalars['Float']['output'];
  customersCount: Scalars['Int']['output'];
  orderValue: Scalars['Float']['output'];
  ordersCount: Scalars['Int']['output'];
  ordersThisMonth: Scalars['Int']['output'];
  ordersToday: Scalars['Int']['output'];
  recentOrders: Array<AdminOrderSummary>;
  recentUsers: Array<AdminUser>;
  report: AdminReport;
  revenue: Scalars['Float']['output'];
  topProducts: Array<AdminTopProduct>;
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
  shippingLabel?: Maybe<AdminShippingLabel>;
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

export type AdminPasswordChangeInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
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
  discountEndsAt?: InputMaybe<Scalars['String']['input']>;
  discountPercent?: InputMaybe<Scalars['Int']['input']>;
  discountStartsAt?: InputMaybe<Scalars['String']['input']>;
  discountTitle?: InputMaybe<Scalars['String']['input']>;
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

export type AdminPromotionInput = {
  discountEndsAt?: InputMaybe<Scalars['String']['input']>;
  discountPercent?: InputMaybe<Scalars['Int']['input']>;
  discountStartsAt?: InputMaybe<Scalars['String']['input']>;
  discountTitle?: InputMaybe<Scalars['String']['input']>;
};

export type AdminPromotionTargetInput = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
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

export type AdminShippingLabel = {
  __typename?: 'AdminShippingLabel';
  carrier: Scalars['String']['output'];
  note: Scalars['String']['output'];
  packageContent: Scalars['String']['output'];
  packageWeight: Scalars['String']['output'];
  paperSize: LabelPaperSize;
  recipientAddress: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  recipientPhone: Scalars['String']['output'];
  recipientPostalCode: Scalars['String']['output'];
  senderAddress: Scalars['String']['output'];
  senderName: Scalars['String']['output'];
  senderPhone: Scalars['String']['output'];
  senderPostalCode: Scalars['String']['output'];
  trackingNumber: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type AdminShippingLabelInput = {
  carrier: Scalars['String']['input'];
  note: Scalars['String']['input'];
  packageContent: Scalars['String']['input'];
  packageWeight: Scalars['String']['input'];
  paperSize: LabelPaperSize;
  recipientAddress: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  recipientPostalCode: Scalars['String']['input'];
  senderAddress: Scalars['String']['input'];
  senderName: Scalars['String']['input'];
  senderPhone: Scalars['String']['input'];
  senderPostalCode: Scalars['String']['input'];
  trackingNumber: Scalars['String']['input'];
};

export type AdminStatusMetric = {
  __typename?: 'AdminStatusMetric';
  count: Scalars['Int']['output'];
  status: OrderStatus;
};

export type AdminTopProduct = {
  __typename?: 'AdminTopProduct';
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  orderValue: Scalars['Float']['output'];
  quantity: Scalars['Int']['output'];
  title: Scalars['String']['output'];
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

export type LabelPaperSize =
  | 'A5'
  | 'THERMAL';

export type Mutation = {
  __typename?: 'Mutation';
  adminLogin: AdminSessionPayload;
  adminLogout: Scalars['Boolean']['output'];
  adminRefresh: AdminSessionPayload;
  changeAdminPassword: Scalars['Boolean']['output'];
  createOrder: OrderReceipt;
  deleteAddress: Scalars['Boolean']['output'];
  deleteAdminProduct: AdminProductDeletion;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthSession;
  requestOtp: OtpChallenge;
  saveAddress: Address;
  saveAdminProduct: Product;
  saveAdminShippingLabel: AdminShippingLabel;
  setAdminProductActive: Product;
  setAdminPromotion: Array<Product>;
  updateAdminOrderStatus: AdminOrder;
  updateProfile: AuthUser;
  verifyOtp: AuthSession;
};


export type MutationAdminLoginArgs = {
  input: AdminLoginInput;
};


export type MutationChangeAdminPasswordArgs = {
  input: AdminPasswordChangeInput;
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


export type MutationSaveAdminShippingLabelArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AdminShippingLabelInput;
  orderId: Scalars['ID']['input'];
};


export type MutationSetAdminProductActiveArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetAdminPromotionArgs = {
  input: AdminPromotionInput;
  products: Array<AdminPromotionTargetInput>;
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
  discountEndsAt?: Maybe<Scalars['String']['output']>;
  discountPercent?: Maybe<Scalars['Int']['output']>;
  discountStartsAt?: Maybe<Scalars['String']['output']>;
  discountTitle?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images: Array<ProductImage>;
  isActive: Scalars['Boolean']['output'];
  price: Scalars['Int']['output'];
  promotion?: Maybe<ProductPromotion>;
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

export type ProductPromotion = {
  __typename?: 'ProductPromotion';
  amount: Scalars['Int']['output'];
  endsAt: Scalars['String']['output'];
  originalPrice: Scalars['Int']['output'];
  percent: Scalars['Int']['output'];
  price: Scalars['Int']['output'];
  startsAt: Scalars['String']['output'];
  title: Scalars['String']['output'];
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
  adminProduct: Product;
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
  promotionalProducts: Array<Product>;
  reverseLocation?: Maybe<Scalars['String']['output']>;
};


export type QueryAdminOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminOrdersArgs = {
  input: AdminOrdersInput;
};


export type QueryAdminProductArgs = {
  id: Scalars['ID']['input'];
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccountOrder: ResolverTypeWrapper<AccountOrder>;
  AccountOrderSummary: ResolverTypeWrapper<AccountOrderSummary>;
  Address: ResolverTypeWrapper<Address>;
  AddressInput: AddressInput;
  AdminDailyMetric: ResolverTypeWrapper<AdminDailyMetric>;
  AdminDashboard: ResolverTypeWrapper<AdminDashboard>;
  AdminIdentity: ResolverTypeWrapper<AdminIdentity>;
  AdminLoginInput: AdminLoginInput;
  AdminOrder: ResolverTypeWrapper<AdminOrder>;
  AdminOrderSort: AdminOrderSort;
  AdminOrderStatusInput: AdminOrderStatusInput;
  AdminOrderSummary: ResolverTypeWrapper<AdminOrderSummary>;
  AdminOrdersInput: AdminOrdersInput;
  AdminOrdersPage: ResolverTypeWrapper<AdminOrdersPage>;
  AdminPasswordChangeInput: AdminPasswordChangeInput;
  AdminProductDeletion: ResolverTypeWrapper<AdminProductDeletion>;
  AdminProductImageInput: AdminProductImageInput;
  AdminProductInput: AdminProductInput;
  AdminProductsInput: AdminProductsInput;
  AdminProductsPage: ResolverTypeWrapper<AdminProductsPage>;
  AdminPromotionInput: AdminPromotionInput;
  AdminPromotionTargetInput: AdminPromotionTargetInput;
  AdminReport: ResolverTypeWrapper<AdminReport>;
  AdminReportInput: AdminReportInput;
  AdminSessionPayload: ResolverTypeWrapper<AdminSessionPayload>;
  AdminShippingLabel: ResolverTypeWrapper<AdminShippingLabel>;
  AdminShippingLabelInput: AdminShippingLabelInput;
  AdminStatusMetric: ResolverTypeWrapper<AdminStatusMetric>;
  AdminTopProduct: ResolverTypeWrapper<AdminTopProduct>;
  AdminUser: ResolverTypeWrapper<AdminUser>;
  AdminUsersInput: AdminUsersInput;
  AdminUsersPage: ResolverTypeWrapper<AdminUsersPage>;
  AuthSession: ResolverTypeWrapper<AuthSession>;
  AuthUser: ResolverTypeWrapper<AuthUser>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CatalogInput: CatalogInput;
  CatalogPage: ResolverTypeWrapper<CatalogPage>;
  Category: ResolverTypeWrapper<Category>;
  CheckoutInput: CheckoutInput;
  CheckoutLine: ResolverTypeWrapper<CheckoutLine>;
  CheckoutLineInput: CheckoutLineInput;
  CheckoutQuote: ResolverTypeWrapper<CheckoutQuote>;
  CreateOrderInput: CreateOrderInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LabelPaperSize: LabelPaperSize;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  MyOrdersInput: MyOrdersInput;
  MyOrdersPage: ResolverTypeWrapper<MyOrdersPage>;
  OrderAddressSnapshot: ResolverTypeWrapper<OrderAddressSnapshot>;
  OrderItemSnapshot: ResolverTypeWrapper<OrderItemSnapshot>;
  OrderReceipt: ResolverTypeWrapper<OrderReceipt>;
  OrderStatus: OrderStatus;
  OrderStatusEvent: ResolverTypeWrapper<OrderStatusEvent>;
  OtpChallenge: ResolverTypeWrapper<OtpChallenge>;
  Product: ResolverTypeWrapper<Product>;
  ProductImage: ResolverTypeWrapper<ProductImage>;
  ProductPromotion: ResolverTypeWrapper<ProductPromotion>;
  ProductSort: ProductSort;
  ProfileInput: ProfileInput;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RequestOtpInput: RequestOtpInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  VerifyOtpInput: VerifyOtpInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AccountOrder: AccountOrder;
  AccountOrderSummary: AccountOrderSummary;
  Address: Address;
  AddressInput: AddressInput;
  AdminDailyMetric: AdminDailyMetric;
  AdminDashboard: AdminDashboard;
  AdminIdentity: AdminIdentity;
  AdminLoginInput: AdminLoginInput;
  AdminOrder: AdminOrder;
  AdminOrderStatusInput: AdminOrderStatusInput;
  AdminOrderSummary: AdminOrderSummary;
  AdminOrdersInput: AdminOrdersInput;
  AdminOrdersPage: AdminOrdersPage;
  AdminPasswordChangeInput: AdminPasswordChangeInput;
  AdminProductDeletion: AdminProductDeletion;
  AdminProductImageInput: AdminProductImageInput;
  AdminProductInput: AdminProductInput;
  AdminProductsInput: AdminProductsInput;
  AdminProductsPage: AdminProductsPage;
  AdminPromotionInput: AdminPromotionInput;
  AdminPromotionTargetInput: AdminPromotionTargetInput;
  AdminReport: AdminReport;
  AdminReportInput: AdminReportInput;
  AdminSessionPayload: AdminSessionPayload;
  AdminShippingLabel: AdminShippingLabel;
  AdminShippingLabelInput: AdminShippingLabelInput;
  AdminStatusMetric: AdminStatusMetric;
  AdminTopProduct: AdminTopProduct;
  AdminUser: AdminUser;
  AdminUsersInput: AdminUsersInput;
  AdminUsersPage: AdminUsersPage;
  AuthSession: AuthSession;
  AuthUser: AuthUser;
  Boolean: Scalars['Boolean']['output'];
  CatalogInput: CatalogInput;
  CatalogPage: CatalogPage;
  Category: Category;
  CheckoutInput: CheckoutInput;
  CheckoutLine: CheckoutLine;
  CheckoutLineInput: CheckoutLineInput;
  CheckoutQuote: CheckoutQuote;
  CreateOrderInput: CreateOrderInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  MyOrdersInput: MyOrdersInput;
  MyOrdersPage: MyOrdersPage;
  OrderAddressSnapshot: OrderAddressSnapshot;
  OrderItemSnapshot: OrderItemSnapshot;
  OrderReceipt: OrderReceipt;
  OrderStatusEvent: OrderStatusEvent;
  OtpChallenge: OtpChallenge;
  Product: Product;
  ProductImage: ProductImage;
  ProductPromotion: ProductPromotion;
  ProfileInput: ProfileInput;
  Query: Record<PropertyKey, never>;
  RequestOtpInput: RequestOtpInput;
  String: Scalars['String']['output'];
  VerifyOtpInput: VerifyOtpInput;
};

export type AccountOrderResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AccountOrder'] = ResolversParentTypes['AccountOrder']> = {
  address?: Resolver<ResolversTypes['OrderAddressSnapshot'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['OrderItemSnapshot']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AccountOrderSummaryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AccountOrderSummary'] = ResolversParentTypes['AccountOrderSummary']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AddressResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = {
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  postalAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  postalCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  province?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipientPhone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AdminDailyMetricResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminDailyMetric'] = ResolversParentTypes['AdminDailyMetric']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  revenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type AdminDashboardResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminDashboard'] = ResolversParentTypes['AdminDashboard']> = {
  activeProductsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  averageOrderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  customersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  orderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ordersThisMonth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ordersToday?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  recentOrders?: Resolver<Array<ResolversTypes['AdminOrderSummary']>, ParentType, ContextType>;
  recentUsers?: Resolver<Array<ResolversTypes['AdminUser']>, ParentType, ContextType>;
  report?: Resolver<ResolversTypes['AdminReport'], ParentType, ContextType>;
  revenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  topProducts?: Resolver<Array<ResolversTypes['AdminTopProduct']>, ParentType, ContextType>;
};

export type AdminIdentityResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminIdentity'] = ResolversParentTypes['AdminIdentity']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type AdminOrderResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminOrder'] = ResolversParentTypes['AdminOrder']> = {
  address?: Resolver<ResolversTypes['OrderAddressSnapshot'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['OrderItemSnapshot']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingLabel?: Resolver<Maybe<ResolversTypes['AdminShippingLabel']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  statusEvents?: Resolver<Array<ResolversTypes['OrderStatusEvent']>, ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
};

export type AdminOrderSummaryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminOrderSummary'] = ResolversParentTypes['AdminOrderSummary']> = {
  address?: Resolver<ResolversTypes['OrderAddressSnapshot'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
};

export type AdminOrdersPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminOrdersPage'] = ResolversParentTypes['AdminOrdersPage']> = {
  items?: Resolver<Array<ResolversTypes['AdminOrderSummary']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AdminProductDeletionResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminProductDeletion'] = ResolversParentTypes['AdminProductDeletion']> = {
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType>;
};

export type AdminProductsPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminProductsPage'] = ResolversParentTypes['AdminProductsPage']> = {
  items?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AdminReportResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminReport'] = ResolversParentTypes['AdminReport']> = {
  averageOrderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  daily?: Resolver<Array<ResolversTypes['AdminDailyMetric']>, ParentType, ContextType>;
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  revenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  statuses?: Resolver<Array<ResolversTypes['AdminStatusMetric']>, ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AdminSessionPayloadResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminSessionPayload'] = ResolversParentTypes['AdminSessionPayload']> = {
  accessExpiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  admin?: Resolver<ResolversTypes['AdminIdentity'], ParentType, ContextType>;
};

export type AdminShippingLabelResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminShippingLabel'] = ResolversParentTypes['AdminShippingLabel']> = {
  carrier?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  note?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  packageContent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  packageWeight?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paperSize?: Resolver<ResolversTypes['LabelPaperSize'], ParentType, ContextType>;
  recipientAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipientPhone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipientPostalCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  senderAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  senderName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  senderPhone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  senderPostalCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trackingNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AdminStatusMetricResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminStatusMetric'] = ResolversParentTypes['AdminStatusMetric']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
};

export type AdminTopProductResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminTopProduct'] = ResolversParentTypes['AdminTopProduct']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AdminUserResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminUser'] = ResolversParentTypes['AdminUser']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalOrdersValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type AdminUsersPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminUsersPage'] = ResolversParentTypes['AdminUsersPage']> = {
  items?: Resolver<Array<ResolversTypes['AdminUser']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AuthSessionResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AuthSession'] = ResolversParentTypes['AuthSession']> = {
  accessExpiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
};

export type AuthUserResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AuthUser'] = ResolversParentTypes['AuthUser']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CatalogPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CatalogPage'] = ResolversParentTypes['CatalogPage']> = {
  items?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CheckoutLineResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CheckoutLine'] = ResolversParentTypes['CheckoutLine']> = {
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lineTotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unitPrice?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weight?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CheckoutQuoteResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CheckoutQuote'] = ResolversParentTypes['CheckoutQuote']> = {
  addressId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['CheckoutLine']>, ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  adminLogin?: Resolver<ResolversTypes['AdminSessionPayload'], ParentType, ContextType, RequireFields<MutationAdminLoginArgs, 'input'>>;
  adminLogout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  adminRefresh?: Resolver<ResolversTypes['AdminSessionPayload'], ParentType, ContextType>;
  changeAdminPassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationChangeAdminPasswordArgs, 'input'>>;
  createOrder?: Resolver<ResolversTypes['OrderReceipt'], ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'input'>>;
  deleteAddress?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAddressArgs, 'id'>>;
  deleteAdminProduct?: Resolver<ResolversTypes['AdminProductDeletion'], ParentType, ContextType, RequireFields<MutationDeleteAdminProductArgs, 'expectedUpdatedAt' | 'id'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['AuthSession'], ParentType, ContextType>;
  requestOtp?: Resolver<ResolversTypes['OtpChallenge'], ParentType, ContextType, RequireFields<MutationRequestOtpArgs, 'input'>>;
  saveAddress?: Resolver<ResolversTypes['Address'], ParentType, ContextType, RequireFields<MutationSaveAddressArgs, 'input'>>;
  saveAdminProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationSaveAdminProductArgs, 'input'>>;
  saveAdminShippingLabel?: Resolver<ResolversTypes['AdminShippingLabel'], ParentType, ContextType, RequireFields<MutationSaveAdminShippingLabelArgs, 'input' | 'orderId'>>;
  setAdminProductActive?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationSetAdminProductActiveArgs, 'expectedUpdatedAt' | 'id' | 'isActive'>>;
  setAdminPromotion?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<MutationSetAdminPromotionArgs, 'input' | 'products'>>;
  updateAdminOrderStatus?: Resolver<ResolversTypes['AdminOrder'], ParentType, ContextType, RequireFields<MutationUpdateAdminOrderStatusArgs, 'input'>>;
  updateProfile?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  verifyOtp?: Resolver<ResolversTypes['AuthSession'], ParentType, ContextType, RequireFields<MutationVerifyOtpArgs, 'input'>>;
};

export type MyOrdersPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['MyOrdersPage'] = ResolversParentTypes['MyOrdersPage']> = {
  items?: Resolver<Array<ResolversTypes['AccountOrderSummary']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type OrderAddressSnapshotResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['OrderAddressSnapshot'] = ResolversParentTypes['OrderAddressSnapshot']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  postalAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  province?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recipientName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recipientPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type OrderItemSnapshotResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['OrderItemSnapshot'] = ResolversParentTypes['OrderItemSnapshot']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lineTotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  productTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productWeight?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unitPrice?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type OrderReceiptResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['OrderReceipt'] = ResolversParentTypes['OrderReceipt']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type OrderStatusEventResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['OrderStatusEvent'] = ResolversParentTypes['OrderStatusEvent']> = {
  admin?: Resolver<ResolversTypes['AdminIdentity'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fromStatus?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  toStatus?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
};

export type OtpChallengeResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['OtpChallenge'] = ResolversParentTypes['OtpChallenge']> = {
  challengeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resendAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ProductResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Product'] = ResolversParentTypes['Product']> = {
  badge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discountEndsAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discountPercent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  discountStartsAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discountTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Array<ResolversTypes['ProductImage']>, ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  promotion?: Resolver<Maybe<ResolversTypes['ProductPromotion']>, ParentType, ContextType>;
  shortDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ProductImageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['ProductImage'] = ResolversParentTypes['ProductImage']> = {
  alt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ProductPromotionResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['ProductPromotion'] = ResolversParentTypes['ProductPromotion']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endsAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalPrice?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startsAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  adminDashboard?: Resolver<ResolversTypes['AdminDashboard'], ParentType, ContextType>;
  adminMe?: Resolver<Maybe<ResolversTypes['AdminIdentity']>, ParentType, ContextType>;
  adminOrder?: Resolver<ResolversTypes['AdminOrder'], ParentType, ContextType, RequireFields<QueryAdminOrderArgs, 'id'>>;
  adminOrders?: Resolver<ResolversTypes['AdminOrdersPage'], ParentType, ContextType, RequireFields<QueryAdminOrdersArgs, 'input'>>;
  adminProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<QueryAdminProductArgs, 'id'>>;
  adminProducts?: Resolver<ResolversTypes['AdminProductsPage'], ParentType, ContextType, RequireFields<QueryAdminProductsArgs, 'input'>>;
  adminReport?: Resolver<ResolversTypes['AdminReport'], ParentType, ContextType, RequireFields<QueryAdminReportArgs, 'input'>>;
  adminUser?: Resolver<ResolversTypes['AdminUser'], ParentType, ContextType, RequireFields<QueryAdminUserArgs, 'id'>>;
  adminUsers?: Resolver<ResolversTypes['AdminUsersPage'], ParentType, ContextType, RequireFields<QueryAdminUsersArgs, 'input'>>;
  catalog?: Resolver<ResolversTypes['CatalogPage'], ParentType, ContextType, RequireFields<QueryCatalogArgs, 'input'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  checkoutQuote?: Resolver<ResolversTypes['CheckoutQuote'], ParentType, ContextType, RequireFields<QueryCheckoutQuoteArgs, 'input'>>;
  health?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType>;
  myAddresses?: Resolver<Array<ResolversTypes['Address']>, ParentType, ContextType>;
  myOrder?: Resolver<ResolversTypes['AccountOrder'], ParentType, ContextType, RequireFields<QueryMyOrderArgs, 'id'>>;
  myOrders?: Resolver<ResolversTypes['MyOrdersPage'], ParentType, ContextType, RequireFields<QueryMyOrdersArgs, 'input'>>;
  orderByRequestId?: Resolver<Maybe<ResolversTypes['OrderReceipt']>, ParentType, ContextType, RequireFields<QueryOrderByRequestIdArgs, 'requestId'>>;
  orderReceipt?: Resolver<ResolversTypes['OrderReceipt'], ParentType, ContextType, RequireFields<QueryOrderReceiptArgs, 'id'>>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<QueryProductArgs, 'slug'>>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, Partial<QueryProductsArgs>>;
  productsByIds?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<QueryProductsByIdsArgs, 'ids'>>;
  promotionalProducts?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  reverseLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryReverseLocationArgs, 'latitude' | 'longitude'>>;
};

export type Resolvers<ContextType = AuthContext> = {
  AccountOrder?: AccountOrderResolvers<ContextType>;
  AccountOrderSummary?: AccountOrderSummaryResolvers<ContextType>;
  Address?: AddressResolvers<ContextType>;
  AdminDailyMetric?: AdminDailyMetricResolvers<ContextType>;
  AdminDashboard?: AdminDashboardResolvers<ContextType>;
  AdminIdentity?: AdminIdentityResolvers<ContextType>;
  AdminOrder?: AdminOrderResolvers<ContextType>;
  AdminOrderSummary?: AdminOrderSummaryResolvers<ContextType>;
  AdminOrdersPage?: AdminOrdersPageResolvers<ContextType>;
  AdminProductDeletion?: AdminProductDeletionResolvers<ContextType>;
  AdminProductsPage?: AdminProductsPageResolvers<ContextType>;
  AdminReport?: AdminReportResolvers<ContextType>;
  AdminSessionPayload?: AdminSessionPayloadResolvers<ContextType>;
  AdminShippingLabel?: AdminShippingLabelResolvers<ContextType>;
  AdminStatusMetric?: AdminStatusMetricResolvers<ContextType>;
  AdminTopProduct?: AdminTopProductResolvers<ContextType>;
  AdminUser?: AdminUserResolvers<ContextType>;
  AdminUsersPage?: AdminUsersPageResolvers<ContextType>;
  AuthSession?: AuthSessionResolvers<ContextType>;
  AuthUser?: AuthUserResolvers<ContextType>;
  CatalogPage?: CatalogPageResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CheckoutLine?: CheckoutLineResolvers<ContextType>;
  CheckoutQuote?: CheckoutQuoteResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyOrdersPage?: MyOrdersPageResolvers<ContextType>;
  OrderAddressSnapshot?: OrderAddressSnapshotResolvers<ContextType>;
  OrderItemSnapshot?: OrderItemSnapshotResolvers<ContextType>;
  OrderReceipt?: OrderReceiptResolvers<ContextType>;
  OrderStatusEvent?: OrderStatusEventResolvers<ContextType>;
  OtpChallenge?: OtpChallengeResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  ProductImage?: ProductImageResolvers<ContextType>;
  ProductPromotion?: ProductPromotionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

