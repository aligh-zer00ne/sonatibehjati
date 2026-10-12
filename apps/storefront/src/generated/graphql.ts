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

export type AdminCoupon = {
  __typename?: 'AdminCoupon';
  code: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxDiscountAmount?: Maybe<Scalars['Int']['output']>;
  minOrderAmount: Scalars['Int']['output'];
  startsAt: Scalars['String']['output'];
  type: DiscountType;
  updatedAt: Scalars['String']['output'];
  usageCount: Scalars['Int']['output'];
  usageLimit?: Maybe<Scalars['Int']['output']>;
  value: Scalars['Int']['output'];
};

export type AdminCouponInput = {
  code: Scalars['String']['input'];
  expiresAt: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  maxDiscountAmount?: InputMaybe<Scalars['Int']['input']>;
  minOrderAmount: Scalars['Int']['input'];
  startsAt: Scalars['String']['input'];
  type: DiscountType;
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
  value: Scalars['Int']['input'];
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
  isActive: Scalars['Boolean']['output'];
  role: AdminRole;
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

export type AdminRole =
  | 'OWNER'
  | 'STAFF';

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

export type CustomerExport = {
  __typename?: 'CustomerExport';
  base64: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  filename: Scalars['String']['output'];
};

export type DiscountType =
  | 'FIXED'
  | 'PERCENT';

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
  createStaff: AdminIdentity;
  createTicket: SupportTicket;
  deleteAddress: Scalars['Boolean']['output'];
  deleteAdminProduct: AdminProductDeletion;
  logout: Scalars['Boolean']['output'];
  moderateProductReview: ProductReview;
  refreshToken: AuthSession;
  replyAdminTicket: SupportTicket;
  replyTicket: SupportTicket;
  requestOtp: OtpChallenge;
  saveAddress: Address;
  saveAdminCoupon: AdminCoupon;
  saveAdminProduct: Product;
  saveAdminShippingLabel: AdminShippingLabel;
  setAdminProductActive: Product;
  setAdminPromotion: Array<Product>;
  setAdminTicketStatus: SupportTicket;
  setStaffActive: AdminIdentity;
  submitProductReview: ProductReview;
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


export type MutationCreateStaffArgs = {
  input: StaffInput;
};


export type MutationCreateTicketArgs = {
  input: TicketInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAdminProductArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationModerateProductReviewArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  status: ReviewStatus;
};


export type MutationReplyAdminTicketArgs = {
  input: TicketReplyInput;
};


export type MutationReplyTicketArgs = {
  input: TicketReplyInput;
};


export type MutationRequestOtpArgs = {
  input: RequestOtpInput;
};


export type MutationSaveAddressArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AddressInput;
};


export type MutationSaveAdminCouponArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AdminCouponInput;
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


export type MutationSetAdminTicketStatusArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  status: TicketStatus;
};


export type MutationSetStaffActiveArgs = {
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSubmitProductReviewArgs = {
  input: ReviewInput;
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

export type ProductReview = {
  __typename?: 'ProductReview';
  authorName: Scalars['String']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  productId: Scalars['ID']['output'];
  productTitle: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  status: ReviewStatus;
  updatedAt: Scalars['String']['output'];
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
  adminAccounts: Array<AdminIdentity>;
  adminCoupons: Array<AdminCoupon>;
  adminCustomerExport: CustomerExport;
  adminDashboard: AdminDashboard;
  adminMe?: Maybe<AdminIdentity>;
  adminOrder: AdminOrder;
  adminOrders: AdminOrdersPage;
  adminProduct: Product;
  adminProducts: AdminProductsPage;
  adminReport: AdminReport;
  adminReviews: ReviewPage;
  adminTicket: SupportTicket;
  adminTickets: TicketPage;
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
  myProductReview?: Maybe<ProductReview>;
  myTicket: SupportTicket;
  myTickets: TicketPage;
  orderByRequestId?: Maybe<OrderReceipt>;
  orderReceipt: OrderReceipt;
  product?: Maybe<Product>;
  productReviews: ReviewPage;
  products: Array<Product>;
  productsByIds: Array<Product>;
  promotionalProducts: Array<Product>;
  reverseLocation?: Maybe<Scalars['String']['output']>;
};


export type QueryAdminCustomerExportArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
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


export type QueryAdminReviewsArgs = {
  input: ReviewFilter;
};


export type QueryAdminTicketArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminTicketsArgs = {
  input: TicketFilter;
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


export type QueryMyProductReviewArgs = {
  productId: Scalars['ID']['input'];
};


export type QueryMyTicketArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyTicketsArgs = {
  input: TicketFilter;
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


export type QueryProductReviewsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['ID']['input'];
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

export type ReviewFilter = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ReviewStatus>;
};

export type ReviewInput = {
  body: Scalars['String']['input'];
  productId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
};

export type ReviewPage = {
  __typename?: 'ReviewPage';
  items: Array<ProductReview>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ReviewStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED';

export type StaffInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SupportTicket = {
  __typename?: 'SupportTicket';
  createdAt: Scalars['String']['output'];
  customerName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  messages: Array<TicketMessage>;
  orderNumber?: Maybe<Scalars['Int']['output']>;
  status: TicketStatus;
  subject: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type TicketFilter = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TicketStatus>;
};

export type TicketInput = {
  body: Scalars['String']['input'];
  orderId?: InputMaybe<Scalars['ID']['input']>;
  subject: Scalars['String']['input'];
};

export type TicketMessage = {
  __typename?: 'TicketMessage';
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  fromSupport: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
};

export type TicketPage = {
  __typename?: 'TicketPage';
  items: Array<SupportTicket>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type TicketReplyInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type TicketStatus =
  | 'CLOSED'
  | 'IN_PROGRESS'
  | 'OPEN';

export type VerifyOtpInput = {
  challengeId: Scalars['ID']['input'];
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type UpdateAccountProfileMutationVariables = Exact<{
  input: ProfileInput;
}>;


export type UpdateAccountProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null } };

export type AccountOrderSummaryFieldsFragment = { __typename?: 'AccountOrderSummary', id: string, number: number, status: OrderStatus, total: number, createdAt: string };

export type AccountOrdersQueryVariables = Exact<{
  input: MyOrdersInput;
}>;


export type AccountOrdersQuery = { __typename?: 'Query', myOrders: { __typename?: 'MyOrdersPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'AccountOrderSummary', id: string, number: number, status: OrderStatus, total: number, createdAt: string }> } };

export type AccountOrderDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AccountOrderDetailsQuery = { __typename?: 'Query', myOrder: { __typename?: 'AccountOrder', id: string, number: number, status: OrderStatus, createdAt: string, subtotal: number, discount: number, shipping: number, total: number, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineTotal: number }> } };

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

export type CatalogProductFragment = { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, promotion?: { __typename?: 'ProductPromotion', title: string, percent: number, amount: number, originalPrice: number, price: number, startsAt: string, endsAt: string } | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } };

export type CatalogPageQueryVariables = Exact<{
  input: CatalogInput;
}>;


export type CatalogPageQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, slug: string, title: string, image: string }>, catalog: { __typename?: 'CatalogPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, promotion?: { __typename?: 'ProductPromotion', title: string, percent: number, amount: number, originalPrice: number, price: number, startsAt: string, endsAt: string } | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }> } };

export type ProductDetailQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProductDetailQuery = { __typename?: 'Query', product?: { __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, promotion?: { __typename?: 'ProductPromotion', title: string, percent: number, amount: number, originalPrice: number, price: number, startsAt: string, endsAt: string } | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } } | null };

export type SelectedProductsQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SelectedProductsQuery = { __typename?: 'Query', productsByIds: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, promotion?: { __typename?: 'ProductPromotion', title: string, percent: number, amount: number, originalPrice: number, price: number, startsAt: string, endsAt: string } | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }> };

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


export type HomepageCatalogQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, slug: string, title: string, image: string }>, products: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, promotion?: { __typename?: 'ProductPromotion', title: string, percent: number, amount: number, originalPrice: number, price: number, startsAt: string, endsAt: string } | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }>, promotionalProducts: Array<{ __typename?: 'Product', id: string, slug: string, title: string, shortDescription: string, description: string, price: number, weight: string, badge?: string | null, isActive: boolean, createdAt: string, updatedAt: string, promotion?: { __typename?: 'ProductPromotion', title: string, percent: number, amount: number, originalPrice: number, price: number, startsAt: string, endsAt: string } | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }>, category: { __typename?: 'Category', id: string, slug: string, title: string, image: string } }> };

export type TicketFieldsFragment = { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> };

export type MyTicketsQueryVariables = Exact<{
  input: TicketFilter;
}>;


export type MyTicketsQuery = { __typename?: 'Query', myTickets: { __typename?: 'TicketPage', total: number, page: number, pageSize: number, items: Array<{ __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, updatedAt: string }> } };

export type MyTicketQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MyTicketQuery = { __typename?: 'Query', myTicket: { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> } };

export type CreateTicketMutationVariables = Exact<{
  input: TicketInput;
}>;


export type CreateTicketMutation = { __typename?: 'Mutation', createTicket: { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> } };

export type ReplyTicketMutationVariables = Exact<{
  input: TicketReplyInput;
}>;


export type ReplyTicketMutation = { __typename?: 'Mutation', replyTicket: { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> } };

export type ReviewFieldsFragment = { __typename?: 'ProductReview', id: string, rating: number, body: string, authorName: string, status: ReviewStatus, productId: string, productTitle: string, createdAt: string, updatedAt: string };

export type PublicProductReviewsQueryVariables = Exact<{
  productId: Scalars['ID']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PublicProductReviewsQuery = { __typename?: 'Query', productReviews: { __typename?: 'ReviewPage', total: number, page: number, pageSize: number, items: Array<{ __typename?: 'ProductReview', id: string, rating: number, body: string, authorName: string, status: ReviewStatus, productId: string, productTitle: string, createdAt: string, updatedAt: string }> } };

export type MyProductReviewQueryVariables = Exact<{
  productId: Scalars['ID']['input'];
}>;


export type MyProductReviewQuery = { __typename?: 'Query', myProductReview?: { __typename?: 'ProductReview', id: string, rating: number, body: string, authorName: string, status: ReviewStatus, productId: string, productTitle: string, createdAt: string, updatedAt: string } | null };

export type SubmitProductReviewMutationVariables = Exact<{
  input: ReviewInput;
}>;


export type SubmitProductReviewMutation = { __typename?: 'Mutation', submitProductReview: { __typename?: 'ProductReview', id: string, rating: number, body: string, authorName: string, status: ReviewStatus, productId: string, productTitle: string, createdAt: string, updatedAt: string } };

export const AccountOrderSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AccountOrderSummaryFieldsFragment, unknown>;
export const SessionUserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<SessionUserFragment, unknown>;
export const CatalogProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"promotion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CatalogProductFragment, unknown>;
export const CheckoutAddressFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CheckoutAddressFragment, unknown>;
export const ReceiptFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ReceiptFragment, unknown>;
export const TicketFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<TicketFieldsFragment, unknown>;
export const ReviewFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ReviewFieldsFragment, unknown>;
export const UpdateAccountProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAccountProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<UpdateAccountProfileMutation, UpdateAccountProfileMutationVariables>;
export const AccountOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MyOrdersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountOrderSummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AccountOrdersQuery, AccountOrdersQueryVariables>;
export const AccountOrderDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountOrderDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}}]}}]}}]} as unknown as DocumentNode<AccountOrderDetailsQuery, AccountOrderDetailsQueryVariables>;
export const CurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const RequestOtpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestOtp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestOtpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestOtp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"challengeId"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"resendAt"}}]}}]}}]} as unknown as DocumentNode<RequestOtpMutation, RequestOtpMutationVariables>;
export const VerifyOtpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyOtp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyOtpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyOtp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<VerifyOtpMutation, VerifyOtpMutationVariables>;
export const RefreshUserSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshUserSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<RefreshUserSessionMutation, RefreshUserSessionMutationVariables>;
export const LogoutUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogoutUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutUserMutation, LogoutUserMutationVariables>;
export const CatalogPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CatalogPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"catalog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"promotion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CatalogPageQuery, CatalogPageQueryVariables>;
export const ProductDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"promotion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ProductDetailQuery, ProductDetailQueryVariables>;
export const SelectedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SelectedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productsByIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"promotion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SelectedProductsQuery, SelectedProductsQueryVariables>;
export const MyAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<MyAddressesQuery, MyAddressesQueryVariables>;
export const RecoverCheckoutOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecoverCheckoutOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderByRequestId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Receipt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RecoverCheckoutOrderQuery, RecoverCheckoutOrderQueryVariables>;
export const ReverseCheckoutLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReverseCheckoutLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reverseLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"latitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"longitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}}}]}]}}]} as unknown as DocumentNode<ReverseCheckoutLocationQuery, ReverseCheckoutLocationQueryVariables>;
export const SaveCheckoutAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveCheckoutAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SaveCheckoutAddressMutation, SaveCheckoutAddressMutationVariables>;
export const DeleteCheckoutAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCheckoutAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCheckoutAddressMutation, DeleteCheckoutAddressMutationVariables>;
export const CheckoutQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckoutQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addressId"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>;
export const CreateCheckoutOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCheckoutOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Receipt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateCheckoutOrderMutation, CreateCheckoutOrderMutationVariables>;
export const CheckoutOrderReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckoutOrderReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderReceipt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Receipt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Receipt"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderReceipt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CheckoutOrderReceiptQuery, CheckoutOrderReceiptQueryVariables>;
export const HomepageCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomepageCatalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"promotionalProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogProduct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"promotion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<HomepageCatalogQuery, HomepageCatalogQueryVariables>;
export const MyTicketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTickets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTickets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}}]}}]}}]} as unknown as DocumentNode<MyTicketsQuery, MyTicketsQueryVariables>;
export const MyTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MyTicketQuery, MyTicketQueryVariables>;
export const CreateTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateTicketMutation, CreateTicketMutationVariables>;
export const ReplyTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReplyTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketReplyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replyTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ReplyTicketMutation, ReplyTicketMutationVariables>;
export const PublicProductReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PublicProductReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PublicProductReviewsQuery, PublicProductReviewsQueryVariables>;
export const MyProductReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyProductReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProductReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyProductReviewQuery, MyProductReviewQueryVariables>;
export const SubmitProductReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitProductReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitProductReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SubmitProductReviewMutation, SubmitProductReviewMutationVariables>;