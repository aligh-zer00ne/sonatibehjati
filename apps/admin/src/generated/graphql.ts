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

export type AccountAllocation = {
  __typename?: 'AccountAllocation';
  amount: Scalars['Int']['output'];
  number: Scalars['Int']['output'];
  orderId: Scalars['ID']['output'];
};

export type AccountEntryDirection =
  | 'PAYMENT'
  | 'RECEIPT';

export type AccountInvoice = {
  __typename?: 'AccountInvoice';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  offlinePaidAmount: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AccountOrder = {
  __typename?: 'AccountOrder';
  address: OrderAddressSnapshot;
  createdAt: Scalars['String']['output'];
  discount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItemSnapshot>;
  number: Scalars['Int']['output'];
  offlinePaidAmount: Scalars['Int']['output'];
  paidAt?: Maybe<Scalars['String']['output']>;
  payments: Array<PaymentInfo>;
  salesChannel: SalesChannel;
  shipping: Scalars['Int']['output'];
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
  status: OrderStatus;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AccountOrderSummary = {
  __typename?: 'AccountOrderSummary';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  offlinePaidAmount: Scalars['Int']['output'];
  salesChannel: SalesChannel;
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
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

export type AdminAccountEntryInput = {
  amount: Scalars['Int']['input'];
  chequeBank?: InputMaybe<Scalars['String']['input']>;
  chequeDueDate?: InputMaybe<Scalars['String']['input']>;
  chequeNumber?: InputMaybe<Scalars['String']['input']>;
  customerId: Scalars['ID']['input'];
  direction: AccountEntryDirection;
  method: OfflinePaymentMethod;
  note?: InputMaybe<Scalars['String']['input']>;
  requestId: Scalars['ID']['input'];
};

export type AdminChannelMetric = {
  __typename?: 'AdminChannelMetric';
  customersCount: Scalars['Int']['output'];
  orderValue: Scalars['Float']['output'];
  ordersCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  salesChannel: SalesChannel;
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

export type AdminCustomerInput = {
  address?: InputMaybe<AddressInput>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  salesChannel: SalesChannel;
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
  channelMetrics: Array<AdminChannelMetric>;
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

export type AdminGatewayTestPayment = {
  __typename?: 'AdminGatewayTestPayment';
  payment: PaymentInfo;
  redirectUrl?: Maybe<Scalars['String']['output']>;
  resultUrl: Scalars['String']['output'];
};

export type AdminGatewayTestState = {
  __typename?: 'AdminGatewayTestState';
  amount: Scalars['Int']['output'];
  enabled: Scalars['Boolean']['output'];
  payments: Array<AdminGatewayTestPayment>;
  terminalId?: Maybe<Scalars['String']['output']>;
};

export type AdminIdentity = {
  __typename?: 'AdminIdentity';
  email: Scalars['String']['output'];
  gatewayTestEnabled?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  permissions: Array<AdminPermission>;
  role: AdminRole;
};

export type AdminLoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type AdminManualLineInput = {
  discountAmount?: InputMaybe<Scalars['Int']['input']>;
  discountPercent?: InputMaybe<Scalars['Float']['input']>;
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  unitPrice?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminManualOrderInput = {
  address?: InputMaybe<AddressInput>;
  customerId: Scalars['ID']['input'];
  discountCode?: InputMaybe<Scalars['String']['input']>;
  expectedTotal: Scalars['Int']['input'];
  items: Array<AdminManualLineInput>;
  manualShippingCost?: InputMaybe<Scalars['Int']['input']>;
  paymentMethod?: InputMaybe<OfflinePaymentMethod>;
  pickup: Scalars['Boolean']['input'];
  receivedAmount: Scalars['Int']['input'];
  requestId: Scalars['ID']['input'];
  salesChannel: SalesChannel;
  shippingMethod: ShippingMethod;
};

export type AdminManualQuote = {
  __typename?: 'AdminManualQuote';
  discount: Scalars['Int']['output'];
  items: Array<CheckoutLine>;
  shipping: Scalars['Int']['output'];
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AdminManualQuoteInput = {
  discountCode?: InputMaybe<Scalars['String']['input']>;
  items: Array<AdminManualLineInput>;
  manualShippingCost?: InputMaybe<Scalars['Int']['input']>;
  pickup: Scalars['Boolean']['input'];
  shippingMethod: ShippingMethod;
};

export type AdminOfflinePayment = {
  __typename?: 'AdminOfflinePayment';
  adminEmail: Scalars['String']['output'];
  amount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  method: OfflinePaymentMethod;
};

export type AdminOfflinePaymentInput = {
  amount: Scalars['Int']['input'];
  expectedUpdatedAt: Scalars['String']['input'];
  method: OfflinePaymentMethod;
  orderId: Scalars['ID']['input'];
  requestId: Scalars['ID']['input'];
};

export type AdminOrder = {
  __typename?: 'AdminOrder';
  address: OrderAddressSnapshot;
  createdAt: Scalars['String']['output'];
  discount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItemSnapshot>;
  number: Scalars['Int']['output'];
  offlinePaidAmount: Scalars['Int']['output'];
  offlinePayments: Array<AdminOfflinePayment>;
  paidAt?: Maybe<Scalars['String']['output']>;
  payments: Array<PaymentInfo>;
  salesChannel: SalesChannel;
  shipping: Scalars['Int']['output'];
  shippingLabel?: Maybe<AdminShippingLabel>;
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
  status: OrderStatus;
  statusEvents: Array<OrderStatusEvent>;
  storeInformation: StoreInformation;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  user: AuthUser;
};

export type AdminOrderProvince = {
  __typename?: 'AdminOrderProvince';
  code: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  locatedCount: Scalars['Int']['output'];
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
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
  offlinePaidAmount: Scalars['Int']['output'];
  salesChannel: SalesChannel;
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
  status: OrderStatus;
  total: Scalars['Int']['output'];
  user: AuthUser;
};

export type AdminOrdersInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  manualOnly?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  salesChannel?: InputMaybe<SalesChannel>;
  search?: InputMaybe<Scalars['String']['input']>;
  shippingMethod?: InputMaybe<ShippingMethod>;
  sort?: InputMaybe<AdminOrderSort>;
  status?: InputMaybe<OrderStatus>;
  to?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type AdminOrdersMapResult = {
  __typename?: 'AdminOrdersMapResult';
  items: Array<AdminOrderSummary>;
  locatedCount: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  pageTotal: Scalars['Int']['output'];
  provinces: Array<AdminOrderProvince>;
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
  unknownCount: Scalars['Int']['output'];
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

export type AdminPaymentRequest = {
  __typename?: 'AdminPaymentRequest';
  amount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  customerId?: Maybe<Scalars['ID']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['String']['output']>;
  payerName?: Maybe<Scalars['String']['output']>;
  payerPhone?: Maybe<Scalars['String']['output']>;
  payments: Array<PaymentInfo>;
  scope: PaymentRequestScope;
  status: PaymentRequestStatus;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type AdminPaymentRequestInput = {
  amount: Scalars['Int']['input'];
  customerId?: InputMaybe<Scalars['ID']['input']>;
  expiresInHours?: InputMaybe<Scalars['Int']['input']>;
  payerName?: InputMaybe<Scalars['String']['input']>;
  payerPhone?: InputMaybe<Scalars['String']['input']>;
  requestId: Scalars['ID']['input'];
  scope: PaymentRequestScope;
  title: Scalars['String']['input'];
};

export type AdminPaymentRequestPage = {
  __typename?: 'AdminPaymentRequestPage';
  gatewayAvailable: Scalars['Boolean']['output'];
  items: Array<AdminPaymentRequest>;
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AdminPaymentRequestsInput = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  scope?: InputMaybe<PaymentRequestScope>;
  status?: InputMaybe<PaymentRequestStatus>;
};

export type AdminPermission =
  | 'COUPONS'
  | 'CUSTOMERS'
  | 'DASHBOARD'
  | 'HOMEPAGE'
  | 'MESSAGES'
  | 'ORDERS'
  | 'ORDER_MAP'
  | 'PRODUCTS'
  | 'REPORTS'
  | 'REVIEWS'
  | 'SHIPPING'
  | 'STORE_INFO'
  | 'TICKETS';

export type AdminPriceChangeInput = {
  expectedUpdatedAt: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  price: Scalars['Int']['input'];
};

export type AdminPriceItem = {
  __typename?: 'AdminPriceItem';
  categoryTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  price: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  weight: Scalars['String']['output'];
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
  shippingAdditionalKgCost?: InputMaybe<Scalars['Int']['input']>;
  shippingBaseCost?: InputMaybe<Scalars['Int']['input']>;
  shippingWeightGrams?: InputMaybe<Scalars['Int']['input']>;
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
  bankRevenue: Scalars['Float']['output'];
  daily: Array<AdminDailyMetric>;
  from: Scalars['String']['output'];
  offlineRevenue: Scalars['Float']['output'];
  orderValue: Scalars['Float']['output'];
  ordersCount: Scalars['Int']['output'];
  paymentLinkRevenue: Scalars['Float']['output'];
  revenue: Scalars['Float']['output'];
  statuses: Array<AdminStatusMetric>;
  to: Scalars['String']['output'];
};

export type AdminReportInput = {
  from: Scalars['String']['input'];
  salesChannel?: InputMaybe<SalesChannel>;
  shippingMethod?: InputMaybe<ShippingMethod>;
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

export type AdminShipmentInput = {
  expectedLabelUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  expectedUpdatedAt: Scalars['String']['input'];
  orderId: Scalars['ID']['input'];
  shippingMethod: ShippingMethod;
  trackingNumber: Scalars['String']['input'];
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
  accountBalance: Scalars['Float']['output'];
  acquisitionSource: SalesChannel;
  createdAt: Scalars['String']['output'];
  defaultAddress?: Maybe<Address>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  ordersCount: Scalars['Int']['output'];
  phone: Scalars['String']['output'];
  salesChannels: Array<SalesChannel>;
  totalOrdersValue: Scalars['Float']['output'];
};

export type AdminUsersInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  salesChannel?: InputMaybe<SalesChannel>;
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

export type Announcement = {
  __typename?: 'Announcement';
  enabled: Scalars['Boolean']['output'];
  text: Scalars['String']['output'];
};

export type AnnouncementInput = {
  enabled: Scalars['Boolean']['input'];
  text: Scalars['String']['input'];
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

export type BrandStoryContent = {
  __typename?: 'BrandStoryContent';
  action: Scalars['String']['output'];
  alt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  href: Scalars['String']['output'];
  location: Scalars['String']['output'];
  mobileAction: Scalars['String']['output'];
  mobileSrc: Scalars['String']['output'];
  src: Scalars['String']['output'];
  subtitle: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type BrandStoryContentInput = {
  action: Scalars['String']['input'];
  alt: Scalars['String']['input'];
  description: Scalars['String']['input'];
  href: Scalars['String']['input'];
  location: Scalars['String']['input'];
  mobileAction: Scalars['String']['input'];
  mobileSrc: Scalars['String']['input'];
  src: Scalars['String']['input'];
  subtitle: Scalars['String']['input'];
  title: Scalars['String']['input'];
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
  shippingMethod?: InputMaybe<ShippingMethod>;
};

export type CheckoutLine = {
  __typename?: 'CheckoutLine';
  discountAmount?: Maybe<Scalars['Int']['output']>;
  discountPercent?: Maybe<Scalars['Float']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  lineSubtotal?: Maybe<Scalars['Int']['output']>;
  lineTotal: Scalars['Int']['output'];
  productId: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
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
  freeShippingApplied: Scalars['Boolean']['output'];
  freeShippingRemaining?: Maybe<Scalars['Int']['output']>;
  freeShippingThreshold?: Maybe<Scalars['Int']['output']>;
  items: Array<CheckoutLine>;
  shipping: Scalars['Int']['output'];
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CreateOrderInput = {
  addressId: Scalars['ID']['input'];
  discountCode: Scalars['String']['input'];
  expectedTotal: Scalars['Int']['input'];
  items: Array<CheckoutLineInput>;
  requestId: Scalars['ID']['input'];
  shippingMethod?: InputMaybe<ShippingMethod>;
};

export type CustomerAccount = {
  __typename?: 'CustomerAccount';
  balance: Scalars['Float']['output'];
  entries: Array<CustomerAccountEntry>;
  invoicePage: Scalars['Int']['output'];
  invoiceTotal: Scalars['Int']['output'];
  invoiced: Scalars['Float']['output'];
  invoices: Array<AccountInvoice>;
  page: Scalars['Int']['output'];
  paid: Scalars['Float']['output'];
  received: Scalars['Float']['output'];
  total: Scalars['Int']['output'];
  user: AuthUser;
};

export type CustomerAccountEntry = {
  __typename?: 'CustomerAccountEntry';
  adminEmail: Scalars['String']['output'];
  allocations: Array<AccountAllocation>;
  amount: Scalars['Int']['output'];
  chequeBank?: Maybe<Scalars['String']['output']>;
  chequeDueDate?: Maybe<Scalars['String']['output']>;
  chequeNumber?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  direction: AccountEntryDirection;
  id: Scalars['ID']['output'];
  method: OfflinePaymentMethod;
  note?: Maybe<Scalars['String']['output']>;
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

export type HeroSlide = {
  __typename?: 'HeroSlide';
  action: Scalars['String']['output'];
  alt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  eyebrow: Scalars['String']['output'];
  href: Scalars['String']['output'];
  label: Scalars['String']['output'];
  mobileAction: Scalars['String']['output'];
  mobileSrc: Scalars['String']['output'];
  src: Scalars['String']['output'];
  subtitle: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type HeroSlideInput = {
  action: Scalars['String']['input'];
  alt: Scalars['String']['input'];
  description: Scalars['String']['input'];
  eyebrow: Scalars['String']['input'];
  href: Scalars['String']['input'];
  label: Scalars['String']['input'];
  mobileAction: Scalars['String']['input'];
  mobileSrc: Scalars['String']['input'];
  src: Scalars['String']['input'];
  subtitle: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type HomepageContent = {
  __typename?: 'HomepageContent';
  announcement: Announcement;
  slides: Array<HeroSlide>;
  story: BrandStoryContent;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type HomepageContentInput = {
  slides: Array<HeroSlideInput>;
  story: BrandStoryContentInput;
};

export type LabelPaperSize =
  | 'A5'
  | 'THERMAL';

export type MessageKind =
  | 'PAYMENT'
  | 'SHIPPING';

export type MessageTemplate = {
  __typename?: 'MessageTemplate';
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  kind: MessageKind;
  title: Scalars['String']['output'];
};

export type MessageTemplateInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  kind: MessageKind;
  title: Scalars['String']['input'];
};

export type MessageTemplateSettings = {
  __typename?: 'MessageTemplateSettings';
  items: Array<MessageTemplate>;
  storeName: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  adminLogin: AdminSessionPayload;
  adminLogout: Scalars['Boolean']['output'];
  adminRefresh: AdminSessionPayload;
  cancelAdminPaymentRequest: AdminPaymentRequest;
  changeAdminPassword: Scalars['Boolean']['output'];
  createAdminCustomer: AdminUser;
  createAdminManualOrder: AdminOrder;
  createAdminPaymentRequest: AdminPaymentRequest;
  createOrder: OrderReceipt;
  createStaff: AdminIdentity;
  createTicket: SupportTicket;
  deleteAddress: Scalars['Boolean']['output'];
  deleteAdminCoupon: Scalars['Boolean']['output'];
  deleteAdminProduct: AdminProductDeletion;
  logout: Scalars['Boolean']['output'];
  moderateProductReview: ProductReview;
  recordAdminAccountEntry: CustomerAccount;
  recordAdminOfflinePayment: AdminOrder;
  refreshToken: AuthSession;
  replyAdminTicket: SupportTicket;
  replyTicket: SupportTicket;
  requestOtp: OtpChallenge;
  retryAdminPayment: PaymentInfo;
  saveAddress: Address;
  saveAdminCoupon: AdminCoupon;
  saveAdminMessageTemplates: MessageTemplateSettings;
  saveAdminProduct: Product;
  saveAdminShipment: AdminOrder;
  saveAdminShippingLabel: AdminShippingLabel;
  saveAdminShippingSettings: ShippingSettings;
  saveAdminStoreInformation: StoreInformation;
  saveAnnouncement: HomepageContent;
  saveHomepageContent: HomepageContent;
  setAdminPrices: Array<AdminPriceItem>;
  setAdminProductActive: Product;
  setAdminPromotion: Array<Product>;
  setAdminTicketStatus: SupportTicket;
  setStaffActive: AdminIdentity;
  setStaffPermissions: AdminIdentity;
  startAdminGatewayTest: PaymentRedirect;
  startOrderPayment: PaymentRedirect;
  submitProductReview: ProductReview;
  updateAdminOrderStatus: AdminOrder;
  updateProfile: AuthUser;
  verifyOtp: AuthSession;
};


export type MutationAdminLoginArgs = {
  input: AdminLoginInput;
};


export type MutationCancelAdminPaymentRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChangeAdminPasswordArgs = {
  input: AdminPasswordChangeInput;
};


export type MutationCreateAdminCustomerArgs = {
  input: AdminCustomerInput;
};


export type MutationCreateAdminManualOrderArgs = {
  input: AdminManualOrderInput;
};


export type MutationCreateAdminPaymentRequestArgs = {
  input: AdminPaymentRequestInput;
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


export type MutationDeleteAdminCouponArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
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


export type MutationRecordAdminAccountEntryArgs = {
  input: AdminAccountEntryInput;
};


export type MutationRecordAdminOfflinePaymentArgs = {
  input: AdminOfflinePaymentInput;
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


export type MutationRetryAdminPaymentArgs = {
  paymentId: Scalars['ID']['input'];
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


export type MutationSaveAdminMessageTemplatesArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  items: Array<MessageTemplateInput>;
};


export type MutationSaveAdminProductArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AdminProductInput;
};


export type MutationSaveAdminShipmentArgs = {
  input: AdminShipmentInput;
};


export type MutationSaveAdminShippingLabelArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AdminShippingLabelInput;
  orderId: Scalars['ID']['input'];
};


export type MutationSaveAdminShippingSettingsArgs = {
  expectedUpdatedAt: Scalars['String']['input'];
  input: ShippingSettingsInput;
};


export type MutationSaveAdminStoreInformationArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: StoreInformationInput;
};


export type MutationSaveAnnouncementArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AnnouncementInput;
};


export type MutationSaveHomepageContentArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: HomepageContentInput;
};


export type MutationSetAdminPricesArgs = {
  items: Array<AdminPriceChangeInput>;
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


export type MutationSetStaffPermissionsArgs = {
  id: Scalars['ID']['input'];
  permissions: Array<AdminPermission>;
};


export type MutationStartOrderPaymentArgs = {
  orderId: Scalars['ID']['input'];
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

export type OfflinePaymentMethod =
  | 'CARD_TRANSFER'
  | 'CASH'
  | 'CHECK'
  | 'ONLINE'
  | 'POS';

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
  discountAmount?: Maybe<Scalars['Int']['output']>;
  discountPercent?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  lineSubtotal?: Maybe<Scalars['Int']['output']>;
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
  offlinePaidAmount: Scalars['Int']['output'];
  paidAt?: Maybe<Scalars['String']['output']>;
  payments: Array<PaymentInfo>;
  salesChannel: SalesChannel;
  shipping: Scalars['Int']['output'];
  shippingMethod?: Maybe<ShippingMethod>;
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
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
  codeLength: Scalars['Int']['output'];
  expiresAt: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  resendAt: Scalars['String']['output'];
  testMode: Scalars['Boolean']['output'];
};

export type PaymentInfo = {
  __typename?: 'PaymentInfo';
  amount: Scalars['Int']['output'];
  bankCode?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  reversedAt?: Maybe<Scalars['String']['output']>;
  rrn?: Maybe<Scalars['String']['output']>;
  status: PaymentStatus;
  traceNumber?: Maybe<Scalars['String']['output']>;
  verifiedAt?: Maybe<Scalars['String']['output']>;
};

export type PaymentRedirect = {
  __typename?: 'PaymentRedirect';
  redirectUrl: Scalars['String']['output'];
};

export type PaymentRequestScope =
  | 'CUSTOMER_BALANCE'
  | 'CUSTOM_AMOUNT';

export type PaymentRequestStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'PAID';

export type PaymentStatus =
  | 'CANCELED'
  | 'CREATING'
  | 'EXPIRED'
  | 'FAILED'
  | 'READY'
  | 'REFUNDING'
  | 'REFUND_PENDING'
  | 'REVERSED'
  | 'REVIEW_REQUIRED'
  | 'SUCCEEDED'
  | 'TOKEN_FAILED'
  | 'VERIFYING'
  | 'VERIFY_PENDING';

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
  shippingAdditionalKgCost: Scalars['Int']['output'];
  shippingBaseCost: Scalars['Int']['output'];
  shippingWeightGrams?: Maybe<Scalars['Int']['output']>;
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
  adminCustomerAccount: CustomerAccount;
  adminCustomerExport: CustomerExport;
  adminDashboard: AdminDashboard;
  adminGatewayTest: AdminGatewayTestState;
  adminHomepageContent: HomepageContent;
  adminManualQuote: AdminManualQuote;
  adminMe?: Maybe<AdminIdentity>;
  adminMessageTemplates: MessageTemplateSettings;
  adminOrder: AdminOrder;
  adminOrderCustomer: AdminUser;
  adminOrderCustomers: AdminUsersPage;
  adminOrders: AdminOrdersPage;
  adminOrdersMap: AdminOrdersMapResult;
  adminPaymentRequests: AdminPaymentRequestPage;
  adminPriceList: Array<AdminPriceItem>;
  adminProduct: Product;
  adminProducts: AdminProductsPage;
  adminReport: AdminReport;
  adminReviews: ReviewPage;
  adminShippingSettings: ShippingSettings;
  adminStoreInformation: StoreInformation;
  adminTicket: SupportTicket;
  adminTickets: TicketPage;
  adminUser: AdminUser;
  adminUsers: AdminUsersPage;
  catalog: CatalogPage;
  categories: Array<Category>;
  checkoutQuote: CheckoutQuote;
  health: Scalars['String']['output'];
  homepageContent: HomepageContent;
  me?: Maybe<AuthUser>;
  myAddresses: Array<Address>;
  myOrder: AccountOrder;
  myOrders: MyOrdersPage;
  myProductReview?: Maybe<ProductReview>;
  myTicket: SupportTicket;
  myTickets: TicketPage;
  orderByRequestId?: Maybe<OrderReceipt>;
  orderReceipt: OrderReceipt;
  paymentAvailable: Scalars['Boolean']['output'];
  product?: Maybe<Product>;
  productReviews: ReviewPage;
  products: Array<Product>;
  productsByIds: Array<Product>;
  promotionalProducts: Array<Product>;
  reverseLocation?: Maybe<Scalars['String']['output']>;
  shippingOptions: ShippingOptions;
};


export type QueryAdminCustomerAccountArgs = {
  customerId: Scalars['ID']['input'];
  invoicePage?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminCustomerExportArgs = {
  salesChannel?: InputMaybe<SalesChannel>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminDashboardArgs = {
  salesChannel?: InputMaybe<SalesChannel>;
};


export type QueryAdminManualQuoteArgs = {
  input: AdminManualQuoteInput;
};


export type QueryAdminOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminOrderCustomerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminOrderCustomersArgs = {
  input: AdminUsersInput;
};


export type QueryAdminOrdersArgs = {
  input: AdminOrdersInput;
};


export type QueryAdminOrdersMapArgs = {
  input: AdminOrdersInput;
  province?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminPaymentRequestsArgs = {
  input: AdminPaymentRequestsInput;
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

export type SalesChannel =
  | 'INSTAGRAM'
  | 'IN_PERSON'
  | 'WEBSITE';

export type ShippingMethod =
  | 'COURIER'
  | 'POST'
  | 'TIPAX';

export type ShippingOptions = {
  __typename?: 'ShippingOptions';
  availableMethods: Array<ShippingMethod>;
};

export type ShippingRule = {
  __typename?: 'ShippingRule';
  additionalKgCost: Scalars['Int']['output'];
  baseCost: Scalars['Int']['output'];
  enabled: Scalars['Boolean']['output'];
  freeShippingEligible: Scalars['Boolean']['output'];
  method: ShippingMethod;
};

export type ShippingRuleInput = {
  additionalKgCost: Scalars['Int']['input'];
  baseCost: Scalars['Int']['input'];
  enabled: Scalars['Boolean']['input'];
  freeShippingEligible: Scalars['Boolean']['input'];
  method: ShippingMethod;
};

export type ShippingSettings = {
  __typename?: 'ShippingSettings';
  freeShippingThreshold?: Maybe<Scalars['Int']['output']>;
  methods: Array<ShippingRule>;
  updatedAt: Scalars['String']['output'];
};

export type ShippingSettingsInput = {
  freeShippingThreshold?: InputMaybe<Scalars['Int']['input']>;
  methods: Array<ShippingRuleInput>;
};

export type StaffInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  permissions?: InputMaybe<Array<AdminPermission>>;
};

export type StoreInformation = {
  __typename?: 'StoreInformation';
  address: Scalars['String']['output'];
  isConfigured: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type StoreInformationInput = {
  address: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
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

export type AdminIdentityFieldsFragment = { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string };

export type AdminLoginMutationVariables = Exact<{
  input: AdminLoginInput;
}>;


export type AdminLoginMutation = { __typename?: 'Mutation', adminLogin: { __typename?: 'AdminSessionPayload', accessToken: string, accessExpiresAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } } };

export type AdminRefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type AdminRefreshMutation = { __typename?: 'Mutation', adminRefresh: { __typename?: 'AdminSessionPayload', accessToken: string, accessExpiresAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } } };

export type AdminLogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type AdminLogoutMutation = { __typename?: 'Mutation', adminLogout: boolean };

export type AdminMeQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminMeQuery = { __typename?: 'Query', adminMe?: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } | null };

export type AdminProductFieldsFragment = { __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> };

export type AdminProductQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminProductQuery = { __typename?: 'Query', adminProduct: { __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> }, categories: Array<{ __typename?: 'Category', id: string, title: string }> };

export type AdminProductsQueryVariables = Exact<{
  input: AdminProductsInput;
}>;


export type AdminProductsQuery = { __typename?: 'Query', adminProducts: { __typename?: 'AdminProductsPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> }> }, categories: Array<{ __typename?: 'Category', id: string, title: string }> };

export type SaveAdminProductMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AdminProductInput;
}>;


export type SaveAdminProductMutation = { __typename?: 'Mutation', saveAdminProduct: { __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> } };

export type SetAdminProductActiveMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type SetAdminProductActiveMutation = { __typename?: 'Mutation', setAdminProductActive: { __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> } };

export type DeleteAdminProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type DeleteAdminProductMutation = { __typename?: 'Mutation', deleteAdminProduct: { __typename?: 'AdminProductDeletion', deleted: boolean, product?: { __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> } | null } };

export type AdminOrderAddressFieldsFragment = { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null };

export type AdminCustomerFieldsFragment = { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null };

export type AdminOrderSummaryFieldsFragment = { __typename?: 'AdminOrderSummary', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } };

export type AdminOrderFieldsFragment = { __typename?: 'AdminOrder', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, paidAt?: string | null, id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, storeInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null }, offlinePayments: Array<{ __typename?: 'AdminOfflinePayment', id: string, amount: number, method: OfflinePaymentMethod, adminEmail: string, createdAt: string }>, payments: Array<{ __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }>, shippingLabel?: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } | null, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineSubtotal?: number | null, discountAmount?: number | null, discountPercent?: number | null, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } }> };

export type AdminOrdersQueryVariables = Exact<{
  input: AdminOrdersInput;
}>;


export type AdminOrdersQuery = { __typename?: 'Query', adminOrders: { __typename?: 'AdminOrdersPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'AdminOrderSummary', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } }> } };

export type AdminOrderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminOrderQuery = { __typename?: 'Query', adminOrder: { __typename?: 'AdminOrder', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, paidAt?: string | null, id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, storeInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null }, offlinePayments: Array<{ __typename?: 'AdminOfflinePayment', id: string, amount: number, method: OfflinePaymentMethod, adminEmail: string, createdAt: string }>, payments: Array<{ __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }>, shippingLabel?: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } | null, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineSubtotal?: number | null, discountAmount?: number | null, discountPercent?: number | null, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } }> } };

export type UpdateAdminOrderStatusMutationVariables = Exact<{
  input: AdminOrderStatusInput;
}>;


export type UpdateAdminOrderStatusMutation = { __typename?: 'Mutation', updateAdminOrderStatus: { __typename?: 'AdminOrder', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, paidAt?: string | null, id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, storeInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null }, offlinePayments: Array<{ __typename?: 'AdminOfflinePayment', id: string, amount: number, method: OfflinePaymentMethod, adminEmail: string, createdAt: string }>, payments: Array<{ __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }>, shippingLabel?: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } | null, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineSubtotal?: number | null, discountAmount?: number | null, discountPercent?: number | null, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } }> } };

export type AdminUsersQueryVariables = Exact<{
  input: AdminUsersInput;
}>;


export type AdminUsersQuery = { __typename?: 'Query', adminUsers: { __typename?: 'AdminUsersPage', total: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null, createdAt: string, ordersCount: number, acquisitionSource: SalesChannel, salesChannels: Array<SalesChannel>, accountBalance: number, totalOrdersValue: number }> } };

export type AdminReportFieldsFragment = { __typename?: 'AdminReport', paymentLinkRevenue: number, bankRevenue: number, offlineRevenue: number, from: string, to: string, ordersCount: number, orderValue: number, averageOrderValue: number, revenue: number, daily: Array<{ __typename?: 'AdminDailyMetric', date: string, ordersCount: number, orderValue: number, revenue: number }>, statuses: Array<{ __typename?: 'AdminStatusMetric', status: OrderStatus, count: number }> };

export type AdminDashboardQueryVariables = Exact<{
  salesChannel?: InputMaybe<SalesChannel>;
}>;


export type AdminDashboardQuery = { __typename?: 'Query', adminDashboard: { __typename?: 'AdminDashboard', activeProductsCount: number, customersCount: number, ordersCount: number, ordersToday: number, ordersThisMonth: number, orderValue: number, revenue: number, averageOrderValue: number, channelMetrics: Array<{ __typename?: 'AdminChannelMetric', salesChannel: SalesChannel, customersCount: number, ordersCount: number, orderValue: number, revenue: number }>, recentUsers: Array<{ __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null, createdAt: string, ordersCount: number, acquisitionSource: SalesChannel, salesChannels: Array<SalesChannel>, accountBalance: number, totalOrdersValue: number }>, topProducts: Array<{ __typename?: 'AdminTopProduct', id: string, title: string, image?: string | null, quantity: number, orderValue: number }>, recentOrders: Array<{ __typename?: 'AdminOrderSummary', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } }>, report: { __typename?: 'AdminReport', paymentLinkRevenue: number, bankRevenue: number, offlineRevenue: number, from: string, to: string, ordersCount: number, orderValue: number, averageOrderValue: number, revenue: number, daily: Array<{ __typename?: 'AdminDailyMetric', date: string, ordersCount: number, orderValue: number, revenue: number }>, statuses: Array<{ __typename?: 'AdminStatusMetric', status: OrderStatus, count: number }> } } };

export type AdminShippingLabelFieldsFragment = { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string };

export type SaveAdminShippingLabelMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  input: AdminShippingLabelInput;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaveAdminShippingLabelMutation = { __typename?: 'Mutation', saveAdminShippingLabel: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } };

export type ChangeAdminPasswordMutationVariables = Exact<{
  input: AdminPasswordChangeInput;
}>;


export type ChangeAdminPasswordMutation = { __typename?: 'Mutation', changeAdminPassword: boolean };

export type AdminReportQueryVariables = Exact<{
  input: AdminReportInput;
}>;


export type AdminReportQuery = { __typename?: 'Query', adminReport: { __typename?: 'AdminReport', paymentLinkRevenue: number, bankRevenue: number, offlineRevenue: number, from: string, to: string, ordersCount: number, orderValue: number, averageOrderValue: number, revenue: number, daily: Array<{ __typename?: 'AdminDailyMetric', date: string, ordersCount: number, orderValue: number, revenue: number }>, statuses: Array<{ __typename?: 'AdminStatusMetric', status: OrderStatus, count: number }> } };

export type AdminSelectedUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminSelectedUserQuery = { __typename?: 'Query', adminUser: { __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null, createdAt: string, ordersCount: number, acquisitionSource: SalesChannel, salesChannels: Array<SalesChannel>, accountBalance: number, totalOrdersValue: number } };

export type SetAdminPromotionMutationVariables = Exact<{
  input: AdminPromotionInput;
  products: Array<AdminPromotionTargetInput> | AdminPromotionTargetInput;
}>;


export type SetAdminPromotionMutation = { __typename?: 'Mutation', setAdminPromotion: Array<{ __typename?: 'Product', shippingWeightGrams?: number | null, shippingBaseCost: number, shippingAdditionalKgCost: number, id: string, slug: string, title: string, shortDescription: string, description: string, price: number, discountPercent?: number | null, discountTitle?: string | null, discountStartsAt?: string | null, discountEndsAt?: string | null, weight: string, isActive: boolean, badge?: string | null, createdAt: string, updatedAt: string, category: { __typename?: 'Category', id: string, title: string }, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt: string }> }> };

export type AdminAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminAccountsQuery = { __typename?: 'Query', adminAccounts: Array<{ __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string }> };

export type CreateStaffMutationVariables = Exact<{
  input: StaffInput;
}>;


export type CreateStaffMutation = { __typename?: 'Mutation', createStaff: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } };

export type SetStaffActiveMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type SetStaffActiveMutation = { __typename?: 'Mutation', setStaffActive: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } };

export type AdminCouponFieldsFragment = { __typename?: 'AdminCoupon', id: string, code: string, type: DiscountType, value: number, minOrderAmount: number, maxDiscountAmount?: number | null, startsAt: string, expiresAt: string, usageLimit?: number | null, usageCount: number, isActive: boolean, updatedAt: string };

export type AdminCouponsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCouponsQuery = { __typename?: 'Query', adminCoupons: Array<{ __typename?: 'AdminCoupon', id: string, code: string, type: DiscountType, value: number, minOrderAmount: number, maxDiscountAmount?: number | null, startsAt: string, expiresAt: string, usageLimit?: number | null, usageCount: number, isActive: boolean, updatedAt: string }> };

export type SaveAdminCouponMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AdminCouponInput;
}>;


export type SaveAdminCouponMutation = { __typename?: 'Mutation', saveAdminCoupon: { __typename?: 'AdminCoupon', id: string, code: string, type: DiscountType, value: number, minOrderAmount: number, maxDiscountAmount?: number | null, startsAt: string, expiresAt: string, usageLimit?: number | null, usageCount: number, isActive: boolean, updatedAt: string } };

export type AdminCustomerExportQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  salesChannel?: InputMaybe<SalesChannel>;
}>;


export type AdminCustomerExportQuery = { __typename?: 'Query', adminCustomerExport: { __typename?: 'CustomerExport', filename: string, base64: string, count: number } };

export type AdminTicketFieldsFragment = { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> };

export type AdminTicketsQueryVariables = Exact<{
  input: TicketFilter;
}>;


export type AdminTicketsQuery = { __typename?: 'Query', adminTickets: { __typename?: 'TicketPage', total: number, page: number, pageSize: number, items: Array<{ __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, updatedAt: string }> } };

export type AdminTicketQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminTicketQuery = { __typename?: 'Query', adminTicket: { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> } };

export type ReplyAdminTicketMutationVariables = Exact<{
  input: TicketReplyInput;
}>;


export type ReplyAdminTicketMutation = { __typename?: 'Mutation', replyAdminTicket: { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> } };

export type SetAdminTicketStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: TicketStatus;
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type SetAdminTicketStatusMutation = { __typename?: 'Mutation', setAdminTicketStatus: { __typename?: 'SupportTicket', id: string, subject: string, status: TicketStatus, orderNumber?: number | null, customerName: string, createdAt: string, updatedAt: string, messages: Array<{ __typename?: 'TicketMessage', id: string, body: string, fromSupport: boolean, createdAt: string }> } };

export type AdminReviewsQueryVariables = Exact<{
  input: ReviewFilter;
}>;


export type AdminReviewsQuery = { __typename?: 'Query', adminReviews: { __typename?: 'ReviewPage', total: number, page: number, pageSize: number, items: Array<{ __typename?: 'ProductReview', id: string, rating: number, body: string, authorName: string, status: ReviewStatus, productId: string, productTitle: string, createdAt: string, updatedAt: string }> } };

export type ModerateProductReviewMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: ReviewStatus;
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type ModerateProductReviewMutation = { __typename?: 'Mutation', moderateProductReview: { __typename?: 'ProductReview', id: string, status: ReviewStatus, updatedAt: string } };

export type SetStaffPermissionsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  permissions: Array<AdminPermission> | AdminPermission;
}>;


export type SetStaffPermissionsMutation = { __typename?: 'Mutation', setStaffPermissions: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } };

export type HomepageContentFieldsFragment = { __typename?: 'HomepageContent', updatedAt?: string | null, slides: Array<{ __typename?: 'HeroSlide', src: string, mobileSrc: string, alt: string, label: string, eyebrow: string, title: string, subtitle: string, description: string, href: string, action: string, mobileAction: string }>, story: { __typename?: 'BrandStoryContent', src: string, mobileSrc: string, alt: string, title: string, subtitle: string, description: string, action: string, mobileAction: string, href: string, location: string } };

export type AdminHomepageContentQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminHomepageContentQuery = { __typename?: 'Query', adminHomepageContent: { __typename?: 'HomepageContent', updatedAt?: string | null, slides: Array<{ __typename?: 'HeroSlide', src: string, mobileSrc: string, alt: string, label: string, eyebrow: string, title: string, subtitle: string, description: string, href: string, action: string, mobileAction: string }>, story: { __typename?: 'BrandStoryContent', src: string, mobileSrc: string, alt: string, title: string, subtitle: string, description: string, action: string, mobileAction: string, href: string, location: string } } };

export type SaveHomepageContentMutationVariables = Exact<{
  input: HomepageContentInput;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaveHomepageContentMutation = { __typename?: 'Mutation', saveHomepageContent: { __typename?: 'HomepageContent', updatedAt?: string | null, slides: Array<{ __typename?: 'HeroSlide', src: string, mobileSrc: string, alt: string, label: string, eyebrow: string, title: string, subtitle: string, description: string, href: string, action: string, mobileAction: string }>, story: { __typename?: 'BrandStoryContent', src: string, mobileSrc: string, alt: string, title: string, subtitle: string, description: string, action: string, mobileAction: string, href: string, location: string } } };

export type AdminPaymentFieldsFragment = { __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null };

export type RetryAdminPaymentMutationVariables = Exact<{
  paymentId: Scalars['ID']['input'];
}>;


export type RetryAdminPaymentMutation = { __typename?: 'Mutation', retryAdminPayment: { __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null } };

export type AdminGatewayTestQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminGatewayTestQuery = { __typename?: 'Query', adminGatewayTest: { __typename?: 'AdminGatewayTestState', enabled: boolean, amount: number, terminalId?: string | null, payments: Array<{ __typename?: 'AdminGatewayTestPayment', redirectUrl?: string | null, resultUrl: string, payment: { __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null } }> } };

export type StartAdminGatewayTestMutationVariables = Exact<{ [key: string]: never; }>;


export type StartAdminGatewayTestMutation = { __typename?: 'Mutation', startAdminGatewayTest: { __typename?: 'PaymentRedirect', redirectUrl: string } };

export type AdminAnnouncementQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminAnnouncementQuery = { __typename?: 'Query', adminHomepageContent: { __typename?: 'HomepageContent', updatedAt?: string | null, announcement: { __typename?: 'Announcement', enabled: boolean, text: string } } };

export type SaveAnnouncementMutationVariables = Exact<{
  input: AnnouncementInput;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaveAnnouncementMutation = { __typename?: 'Mutation', saveAnnouncement: { __typename?: 'HomepageContent', updatedAt?: string | null, announcement: { __typename?: 'Announcement', enabled: boolean, text: string } } };

export type AdminOrderCustomersQueryVariables = Exact<{
  input: AdminUsersInput;
}>;


export type AdminOrderCustomersQuery = { __typename?: 'Query', adminOrderCustomers: { __typename?: 'AdminUsersPage', total: number, items: Array<{ __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null }> } };

export type AdminOrderCustomerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminOrderCustomerQuery = { __typename?: 'Query', adminOrderCustomer: { __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, accountBalance: number, lastName?: string | null, defaultAddress?: { __typename?: 'Address', id: string, title: string, recipientName: string, recipientPhone: string, province: string, city: string, postalAddress: string, postalCode: string, latitude?: number | null, longitude?: number | null, isDefault: boolean } | null } };

export type ManualCatalogQueryVariables = Exact<{
  input: CatalogInput;
}>;


export type ManualCatalogQuery = { __typename?: 'Query', catalog: { __typename?: 'CatalogPage', total: number, items: Array<{ __typename?: 'Product', id: string, title: string, weight: string, price: number, images: Array<{ __typename?: 'ProductImage', url: string }> }> } };

export type AdminManualQuoteQueryVariables = Exact<{
  input: AdminManualQuoteInput;
}>;


export type AdminManualQuoteQuery = { __typename?: 'Query', adminManualQuote: { __typename?: 'AdminManualQuote', subtotal: number, discount: number, shipping: number, total: number, shippingWeightGrams?: number | null } };

export type CreateAdminCustomerMutationVariables = Exact<{
  input: AdminCustomerInput;
}>;


export type CreateAdminCustomerMutation = { __typename?: 'Mutation', createAdminCustomer: { __typename?: 'AdminUser', id: string, phone: string, firstName?: string | null, lastName?: string | null } };

export type CreateAdminManualOrderMutationVariables = Exact<{
  input: AdminManualOrderInput;
}>;


export type CreateAdminManualOrderMutation = { __typename?: 'Mutation', createAdminManualOrder: { __typename?: 'AdminOrder', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, paidAt?: string | null, id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, storeInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null }, offlinePayments: Array<{ __typename?: 'AdminOfflinePayment', id: string, amount: number, method: OfflinePaymentMethod, adminEmail: string, createdAt: string }>, payments: Array<{ __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }>, shippingLabel?: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } | null, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineSubtotal?: number | null, discountAmount?: number | null, discountPercent?: number | null, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } }> } };

export type RecordAdminOfflinePaymentMutationVariables = Exact<{
  input: AdminOfflinePaymentInput;
}>;


export type RecordAdminOfflinePaymentMutation = { __typename?: 'Mutation', recordAdminOfflinePayment: { __typename?: 'AdminOrder', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, paidAt?: string | null, id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, storeInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null }, offlinePayments: Array<{ __typename?: 'AdminOfflinePayment', id: string, amount: number, method: OfflinePaymentMethod, adminEmail: string, createdAt: string }>, payments: Array<{ __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }>, shippingLabel?: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } | null, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineSubtotal?: number | null, discountAmount?: number | null, discountPercent?: number | null, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } }> } };

export type CustomerAccountFieldsFragment = { __typename?: 'CustomerAccount', invoiceTotal: number, invoicePage: number, received: number, paid: number, invoiced: number, balance: number, total: number, page: number, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, entries: Array<{ __typename?: 'CustomerAccountEntry', id: string, direction: AccountEntryDirection, amount: number, method: OfflinePaymentMethod, note?: string | null, chequeNumber?: string | null, chequeBank?: string | null, chequeDueDate?: string | null, adminEmail: string, createdAt: string, allocations: Array<{ __typename?: 'AccountAllocation', orderId: string, number: number, amount: number }> }>, invoices: Array<{ __typename?: 'AccountInvoice', id: string, number: number, total: number, offlinePaidAmount: number, createdAt: string }> };

export type AdminCustomerAccountQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  invoicePage?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminCustomerAccountQuery = { __typename?: 'Query', adminCustomerAccount: { __typename?: 'CustomerAccount', invoiceTotal: number, invoicePage: number, received: number, paid: number, invoiced: number, balance: number, total: number, page: number, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, entries: Array<{ __typename?: 'CustomerAccountEntry', id: string, direction: AccountEntryDirection, amount: number, method: OfflinePaymentMethod, note?: string | null, chequeNumber?: string | null, chequeBank?: string | null, chequeDueDate?: string | null, adminEmail: string, createdAt: string, allocations: Array<{ __typename?: 'AccountAllocation', orderId: string, number: number, amount: number }> }>, invoices: Array<{ __typename?: 'AccountInvoice', id: string, number: number, total: number, offlinePaidAmount: number, createdAt: string }> } };

export type RecordAdminAccountEntryMutationVariables = Exact<{
  input: AdminAccountEntryInput;
}>;


export type RecordAdminAccountEntryMutation = { __typename?: 'Mutation', recordAdminAccountEntry: { __typename?: 'CustomerAccount', invoiceTotal: number, invoicePage: number, received: number, paid: number, invoiced: number, balance: number, total: number, page: number, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, entries: Array<{ __typename?: 'CustomerAccountEntry', id: string, direction: AccountEntryDirection, amount: number, method: OfflinePaymentMethod, note?: string | null, chequeNumber?: string | null, chequeBank?: string | null, chequeDueDate?: string | null, adminEmail: string, createdAt: string, allocations: Array<{ __typename?: 'AccountAllocation', orderId: string, number: number, amount: number }> }>, invoices: Array<{ __typename?: 'AccountInvoice', id: string, number: number, total: number, offlinePaidAmount: number, createdAt: string }> } };

export type AdminPaymentRequestFieldsFragment = { __typename?: 'AdminPaymentRequest', id: string, scope: PaymentRequestScope, customerId?: string | null, customerName?: string | null, title: string, amount: number, payerName?: string | null, payerPhone?: string | null, url: string, status: PaymentRequestStatus, createdAt: string, expiresAt: string, paidAt?: string | null, payments: Array<{ __typename?: 'PaymentInfo', id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, bankCode?: number | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }> };

export type AdminPaymentRequestsQueryVariables = Exact<{
  input: AdminPaymentRequestsInput;
}>;


export type AdminPaymentRequestsQuery = { __typename?: 'Query', adminPaymentRequests: { __typename?: 'AdminPaymentRequestPage', total: number, page: number, gatewayAvailable: boolean, items: Array<{ __typename?: 'AdminPaymentRequest', id: string, scope: PaymentRequestScope, customerId?: string | null, customerName?: string | null, title: string, amount: number, payerName?: string | null, payerPhone?: string | null, url: string, status: PaymentRequestStatus, createdAt: string, expiresAt: string, paidAt?: string | null, payments: Array<{ __typename?: 'PaymentInfo', id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, bankCode?: number | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }> }> } };

export type CreateAdminPaymentRequestMutationVariables = Exact<{
  input: AdminPaymentRequestInput;
}>;


export type CreateAdminPaymentRequestMutation = { __typename?: 'Mutation', createAdminPaymentRequest: { __typename?: 'AdminPaymentRequest', id: string, scope: PaymentRequestScope, customerId?: string | null, customerName?: string | null, title: string, amount: number, payerName?: string | null, payerPhone?: string | null, url: string, status: PaymentRequestStatus, createdAt: string, expiresAt: string, paidAt?: string | null, payments: Array<{ __typename?: 'PaymentInfo', id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, bankCode?: number | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }> } };

export type CancelAdminPaymentRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CancelAdminPaymentRequestMutation = { __typename?: 'Mutation', cancelAdminPaymentRequest: { __typename?: 'AdminPaymentRequest', id: string, scope: PaymentRequestScope, customerId?: string | null, customerName?: string | null, title: string, amount: number, payerName?: string | null, payerPhone?: string | null, url: string, status: PaymentRequestStatus, createdAt: string, expiresAt: string, paidAt?: string | null, payments: Array<{ __typename?: 'PaymentInfo', id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, bankCode?: number | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }> } };

export type ShippingSettingsFieldsFragment = { __typename?: 'ShippingSettings', freeShippingThreshold?: number | null, updatedAt: string, methods: Array<{ __typename?: 'ShippingRule', method: ShippingMethod, enabled: boolean, baseCost: number, additionalKgCost: number, freeShippingEligible: boolean }> };

export type AdminShippingSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminShippingSettingsQuery = { __typename?: 'Query', adminShippingSettings: { __typename?: 'ShippingSettings', freeShippingThreshold?: number | null, updatedAt: string, methods: Array<{ __typename?: 'ShippingRule', method: ShippingMethod, enabled: boolean, baseCost: number, additionalKgCost: number, freeShippingEligible: boolean }> } };

export type SaveAdminShippingSettingsMutationVariables = Exact<{
  input: ShippingSettingsInput;
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type SaveAdminShippingSettingsMutation = { __typename?: 'Mutation', saveAdminShippingSettings: { __typename?: 'ShippingSettings', freeShippingThreshold?: number | null, updatedAt: string, methods: Array<{ __typename?: 'ShippingRule', method: ShippingMethod, enabled: boolean, baseCost: number, additionalKgCost: number, freeShippingEligible: boolean }> } };

export type AdminPriceItemFieldsFragment = { __typename?: 'AdminPriceItem', id: string, title: string, weight: string, price: number, isActive: boolean, updatedAt: string, categoryTitle: string, imageUrl?: string | null };

export type AdminPriceListQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminPriceListQuery = { __typename?: 'Query', adminPriceList: Array<{ __typename?: 'AdminPriceItem', id: string, title: string, weight: string, price: number, isActive: boolean, updatedAt: string, categoryTitle: string, imageUrl?: string | null }> };

export type SetAdminPricesMutationVariables = Exact<{
  items: Array<AdminPriceChangeInput> | AdminPriceChangeInput;
}>;


export type SetAdminPricesMutation = { __typename?: 'Mutation', setAdminPrices: Array<{ __typename?: 'AdminPriceItem', id: string, title: string, weight: string, price: number, isActive: boolean, updatedAt: string, categoryTitle: string, imageUrl?: string | null }> };

export type StoreInformationFieldsFragment = { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null };

export type AdminStoreInformationQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminStoreInformationQuery = { __typename?: 'Query', adminStoreInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null } };

export type SaveAdminStoreInformationMutationVariables = Exact<{
  input: StoreInformationInput;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaveAdminStoreInformationMutation = { __typename?: 'Mutation', saveAdminStoreInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null } };

export type AdminOrdersMapQueryVariables = Exact<{
  input: AdminOrdersInput;
  province?: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminOrdersMapQuery = { __typename?: 'Query', adminOrdersMap: { __typename?: 'AdminOrdersMapResult', total: number, locatedCount: number, unknownCount: number, page: number, pageSize: number, pageTotal: number, totalPages: number, provinces: Array<{ __typename?: 'AdminOrderProvince', code: string, name: string, count: number, locatedCount: number, latitude?: number | null, longitude?: number | null }>, items: Array<{ __typename?: 'AdminOrderSummary', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, id: string, number: number, status: OrderStatus, total: number, createdAt: string, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null } }> } };

export type MessageTemplateSettingsFieldsFragment = { __typename?: 'MessageTemplateSettings', updatedAt?: string | null, storeName: string, items: Array<{ __typename?: 'MessageTemplate', id: string, kind: MessageKind, title: string, body: string }> };

export type AdminMessageTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminMessageTemplatesQuery = { __typename?: 'Query', adminMessageTemplates: { __typename?: 'MessageTemplateSettings', updatedAt?: string | null, storeName: string, items: Array<{ __typename?: 'MessageTemplate', id: string, kind: MessageKind, title: string, body: string }> } };

export type SaveAdminMessageTemplatesMutationVariables = Exact<{
  items: Array<MessageTemplateInput> | MessageTemplateInput;
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaveAdminMessageTemplatesMutation = { __typename?: 'Mutation', saveAdminMessageTemplates: { __typename?: 'MessageTemplateSettings', updatedAt?: string | null, storeName: string, items: Array<{ __typename?: 'MessageTemplate', id: string, kind: MessageKind, title: string, body: string }> } };

export type SaveAdminShipmentMutationVariables = Exact<{
  input: AdminShipmentInput;
}>;


export type SaveAdminShipmentMutation = { __typename?: 'Mutation', saveAdminShipment: { __typename?: 'AdminOrder', salesChannel: SalesChannel, shippingMethod?: ShippingMethod | null, shippingWeightGrams?: number | null, offlinePaidAmount: number, paidAt?: string | null, id: string, number: number, status: OrderStatus, createdAt: string, updatedAt: string, subtotal: number, discount: number, shipping: number, total: number, storeInformation: { __typename?: 'StoreInformation', name: string, phone: string, address: string, postalCode: string, isConfigured: boolean, updatedAt?: string | null }, offlinePayments: Array<{ __typename?: 'AdminOfflinePayment', id: string, amount: number, method: OfflinePaymentMethod, adminEmail: string, createdAt: string }>, payments: Array<{ __typename?: 'PaymentInfo', bankCode?: number | null, id: string, status: PaymentStatus, amount: number, reference?: string | null, traceNumber?: string | null, rrn?: string | null, reason?: string | null, createdAt: string, verifiedAt?: string | null, reversedAt?: string | null }>, shippingLabel?: { __typename?: 'AdminShippingLabel', senderName: string, senderPhone: string, senderAddress: string, senderPostalCode: string, recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode: string, carrier: string, trackingNumber: string, packageWeight: string, packageContent: string, note: string, paperSize: LabelPaperSize, updatedAt: string } | null, user: { __typename?: 'AuthUser', id: string, phone: string, firstName?: string | null, lastName?: string | null, email?: string | null }, address: { __typename?: 'OrderAddressSnapshot', title?: string | null, recipientName?: string | null, recipientPhone?: string | null, province?: string | null, city?: string | null, postalAddress?: string | null, postalCode?: string | null, latitude?: number | null, longitude?: number | null }, items: Array<{ __typename?: 'OrderItemSnapshot', id: string, productId: string, productTitle: string, productWeight: string, unitPrice: number, quantity: number, lineSubtotal?: number | null, discountAmount?: number | null, discountPercent?: number | null, lineTotal: number }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: string, fromStatus: OrderStatus, toStatus: OrderStatus, createdAt: string, admin: { __typename?: 'AdminIdentity', gatewayTestEnabled?: boolean | null, permissions: Array<AdminPermission>, role: AdminRole, isActive: boolean, id: string, email: string } }> } };

export type DeleteAdminCouponMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  expectedUpdatedAt: Scalars['String']['input'];
}>;


export type DeleteAdminCouponMutation = { __typename?: 'Mutation', deleteAdminCoupon: boolean };

export const AdminProductFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<AdminProductFieldsFragment, unknown>;
export const AdminCustomerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminCustomerFieldsFragment, unknown>;
export const AdminOrderAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]} as unknown as DocumentNode<AdminOrderAddressFieldsFragment, unknown>;
export const AdminOrderSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]} as unknown as DocumentNode<AdminOrderSummaryFieldsFragment, unknown>;
export const StoreInformationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<StoreInformationFieldsFragment, unknown>;
export const AdminPaymentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]} as unknown as DocumentNode<AdminPaymentFieldsFragment, unknown>;
export const AdminShippingLabelFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminShippingLabelFieldsFragment, unknown>;
export const AdminIdentityFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminIdentityFieldsFragment, unknown>;
export const AdminOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offlinePayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingLabel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineSubtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminOrderFieldsFragment, unknown>;
export const AdminReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentLinkRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"bankRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"offlineRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"daily"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminReportFieldsFragment, unknown>;
export const AdminCouponFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"minOrderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usageLimit"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminCouponFieldsFragment, unknown>;
export const AdminTicketFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminTicketFieldsFragment, unknown>;
export const HomepageContentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageContentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"HomepageContent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"slides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"src"}},{"kind":"Field","name":{"kind":"Name","value":"mobileSrc"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"eyebrow"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"mobileAction"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"src"}},{"kind":"Field","name":{"kind":"Name","value":"mobileSrc"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"mobileAction"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}}]}}]} as unknown as DocumentNode<HomepageContentFieldsFragment, unknown>;
export const CustomerAccountFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoiceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"invoicePage"}},{"kind":"Field","name":{"kind":"Name","value":"received"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"invoiced"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"chequeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"chequeBank"}},{"kind":"Field","name":{"kind":"Name","value":"chequeDueDate"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"invoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CustomerAccountFieldsFragment, unknown>;
export const AdminPaymentRequestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]}}]} as unknown as DocumentNode<AdminPaymentRequestFieldsFragment, unknown>;
export const ShippingSettingsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShippingSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"freeShippingThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"baseCost"}},{"kind":"Field","name":{"kind":"Name","value":"additionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"freeShippingEligible"}}]}}]}}]} as unknown as DocumentNode<ShippingSettingsFieldsFragment, unknown>;
export const AdminPriceItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPriceItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPriceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitle"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<AdminPriceItemFieldsFragment, unknown>;
export const MessageTemplateSettingsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageTemplateSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MessageTemplateSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"storeName"}}]}}]} as unknown as DocumentNode<MessageTemplateSettingsFieldsFragment, unknown>;
export const AdminLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminLoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminLoginMutation, AdminLoginMutationVariables>;
export const AdminRefreshDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminRefresh"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRefresh"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessExpiresAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminRefreshMutation, AdminRefreshMutationVariables>;
export const AdminLogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLogout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLogout"}}]}}]} as unknown as DocumentNode<AdminLogoutMutation, AdminLogoutMutationVariables>;
export const AdminMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminMeQuery, AdminMeQueryVariables>;
export const AdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<AdminProductQuery, AdminProductQueryVariables>;
export const AdminProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<AdminProductsQuery, AdminProductsQueryVariables>;
export const SaveAdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<SaveAdminProductMutation, SaveAdminProductMutationVariables>;
export const SetAdminProductActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminProductActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminProductActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<SetAdminProductActiveMutation, SetAdminProductActiveMutationVariables>;
export const DeleteAdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAdminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleted"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<DeleteAdminProductMutation, DeleteAdminProductMutationVariables>;
export const AdminOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrdersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderSummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}}]} as unknown as DocumentNode<AdminOrdersQuery, AdminOrdersQueryVariables>;
export const AdminOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offlinePayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingLabel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineSubtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<AdminOrderQuery, AdminOrderQueryVariables>;
export const UpdateAdminOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAdminOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAdminOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offlinePayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingLabel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineSubtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAdminOrderStatusMutation, UpdateAdminOrderStatusMutationVariables>;
export const AdminUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"acquisitionSource"}},{"kind":"Field","name":{"kind":"Name","value":"salesChannels"}},{"kind":"Field","name":{"kind":"Name","value":"accountBalance"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrdersValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const AdminDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"salesChannel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SalesChannel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDashboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"salesChannel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"salesChannel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channelMetrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"customersCount"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activeProductsCount"}},{"kind":"Field","name":{"kind":"Name","value":"customersCount"}},{"kind":"Field","name":{"kind":"Name","value":"recentUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"acquisitionSource"}},{"kind":"Field","name":{"kind":"Name","value":"salesChannels"}},{"kind":"Field","name":{"kind":"Name","value":"accountBalance"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrdersValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"ordersToday"}},{"kind":"Field","name":{"kind":"Name","value":"ordersThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"recentOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderSummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"report"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminReportFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentLinkRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"bankRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"offlineRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"daily"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminDashboardQuery, AdminDashboardQueryVariables>;
export const SaveAdminShippingLabelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminShippingLabel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabelInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminShippingLabel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SaveAdminShippingLabelMutation, SaveAdminShippingLabelMutationVariables>;
export const ChangeAdminPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeAdminPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPasswordChangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeAdminPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangeAdminPasswordMutation, ChangeAdminPasswordMutationVariables>;
export const AdminReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminReportFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentLinkRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"bankRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"offlineRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"daily"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"orderValue"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminReportQuery, AdminReportQueryVariables>;
export const AdminSelectedUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSelectedUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"acquisitionSource"}},{"kind":"Field","name":{"kind":"Name","value":"salesChannels"}},{"kind":"Field","name":{"kind":"Name","value":"accountBalance"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrdersValue"}}]}}]}}]} as unknown as DocumentNode<AdminSelectedUserQuery, AdminSelectedUserQueryVariables>;
export const SetAdminPromotionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminPromotion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPromotionInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"products"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPromotionTargetInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminPromotion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"products"},"value":{"kind":"Variable","name":{"kind":"Name","value":"products"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"shippingBaseCost"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAdditionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"discountTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discountStartsAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"badge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}}]}}]} as unknown as DocumentNode<SetAdminPromotionMutation, SetAdminPromotionMutationVariables>;
export const AdminAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<AdminAccountsQuery, AdminAccountsQueryVariables>;
export const CreateStaffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStaff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StaffInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<CreateStaffMutation, CreateStaffMutationVariables>;
export const SetStaffActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetStaffActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setStaffActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<SetStaffActiveMutation, SetStaffActiveMutationVariables>;
export const AdminCouponsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCoupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCoupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCouponFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"minOrderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usageLimit"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminCouponsQuery, AdminCouponsQueryVariables>;
export const SaveAdminCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCouponInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCouponFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"minOrderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usageLimit"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SaveAdminCouponMutation, SaveAdminCouponMutationVariables>;
export const AdminCustomerExportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCustomerExport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"salesChannel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SalesChannel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCustomerExport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"salesChannel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"salesChannel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"base64"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AdminCustomerExportQuery, AdminCustomerExportQueryVariables>;
export const AdminTicketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTickets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTickets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}}]}}]}}]} as unknown as DocumentNode<AdminTicketsQuery, AdminTicketsQueryVariables>;
export const AdminTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminTicketQuery, AdminTicketQueryVariables>;
export const ReplyAdminTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReplyAdminTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketReplyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replyAdminTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ReplyAdminTicketMutation, ReplyAdminTicketMutationVariables>;
export const SetAdminTicketStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminTicketStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminTicketStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupportTicket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fromSupport"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<SetAdminTicketStatusMutation, SetAdminTicketStatusMutationVariables>;
export const AdminReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}}]}}]}}]} as unknown as DocumentNode<AdminReviewsQuery, AdminReviewsQueryVariables>;
export const ModerateProductReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ModerateProductReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moderateProductReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ModerateProductReviewMutation, ModerateProductReviewMutationVariables>;
export const SetStaffPermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetStaffPermissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"permissions"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPermission"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setStaffPermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"permissions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"permissions"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<SetStaffPermissionsMutation, SetStaffPermissionsMutationVariables>;
export const AdminHomepageContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminHomepageContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminHomepageContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageContentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageContentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"HomepageContent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"slides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"src"}},{"kind":"Field","name":{"kind":"Name","value":"mobileSrc"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"eyebrow"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"mobileAction"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"src"}},{"kind":"Field","name":{"kind":"Name","value":"mobileSrc"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"mobileAction"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}}]}}]} as unknown as DocumentNode<AdminHomepageContentQuery, AdminHomepageContentQueryVariables>;
export const SaveHomepageContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveHomepageContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"HomepageContentInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveHomepageContent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageContentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageContentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"HomepageContent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"slides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"src"}},{"kind":"Field","name":{"kind":"Name","value":"mobileSrc"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"eyebrow"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"mobileAction"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"src"}},{"kind":"Field","name":{"kind":"Name","value":"mobileSrc"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"mobileAction"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}}]}}]} as unknown as DocumentNode<SaveHomepageContentMutation, SaveHomepageContentMutationVariables>;
export const RetryAdminPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetryAdminPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paymentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retryAdminPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paymentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paymentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]} as unknown as DocumentNode<RetryAdminPaymentMutation, RetryAdminPaymentMutationVariables>;
export const AdminGatewayTestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGatewayTest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGatewayTest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"terminalId"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"resultUrl"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]} as unknown as DocumentNode<AdminGatewayTestQuery, AdminGatewayTestQueryVariables>;
export const StartAdminGatewayTestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartAdminGatewayTest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startAdminGatewayTest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}}]}}]}}]} as unknown as DocumentNode<StartAdminGatewayTestMutation, StartAdminGatewayTestMutationVariables>;
export const AdminAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminAnnouncement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminHomepageContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"announcement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}}]} as unknown as DocumentNode<AdminAnnouncementQuery, AdminAnnouncementQueryVariables>;
export const SaveAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AnnouncementInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"announcement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}}]} as unknown as DocumentNode<SaveAnnouncementMutation, SaveAnnouncementMutationVariables>;
export const AdminOrderCustomersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrderCustomers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrderCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<AdminOrderCustomersQuery, AdminOrderCustomersQueryVariables>;
export const AdminOrderCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrderCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrderCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"accountBalance"}},{"kind":"Field","name":{"kind":"Name","value":"defaultAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]} as unknown as DocumentNode<AdminOrderCustomerQuery, AdminOrderCustomerQueryVariables>;
export const ManualCatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ManualCatalog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<ManualCatalogQuery, ManualCatalogQueryVariables>;
export const AdminManualQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminManualQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminManualQuoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminManualQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}}]}}]}}]} as unknown as DocumentNode<AdminManualQuoteQuery, AdminManualQuoteQueryVariables>;
export const CreateAdminCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAdminCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCustomerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAdminCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]} as unknown as DocumentNode<CreateAdminCustomerMutation, CreateAdminCustomerMutationVariables>;
export const CreateAdminManualOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAdminManualOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminManualOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAdminManualOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offlinePayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingLabel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineSubtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<CreateAdminManualOrderMutation, CreateAdminManualOrderMutationVariables>;
export const RecordAdminOfflinePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordAdminOfflinePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOfflinePaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordAdminOfflinePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offlinePayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingLabel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineSubtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<RecordAdminOfflinePaymentMutation, RecordAdminOfflinePaymentMutationVariables>;
export const AdminCustomerAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCustomerAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invoicePage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCustomerAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"invoicePage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invoicePage"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerAccountFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoiceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"invoicePage"}},{"kind":"Field","name":{"kind":"Name","value":"received"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"invoiced"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"chequeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"chequeBank"}},{"kind":"Field","name":{"kind":"Name","value":"chequeDueDate"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"invoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminCustomerAccountQuery, AdminCustomerAccountQueryVariables>;
export const RecordAdminAccountEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordAdminAccountEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminAccountEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordAdminAccountEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerAccountFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerAccountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoiceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"invoicePage"}},{"kind":"Field","name":{"kind":"Name","value":"received"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"invoiced"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"chequeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"chequeBank"}},{"kind":"Field","name":{"kind":"Name","value":"chequeDueDate"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"invoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<RecordAdminAccountEntryMutation, RecordAdminAccountEntryMutationVariables>;
export const AdminPaymentRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPaymentRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentRequestsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPaymentRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentRequestFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayAvailable"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]}}]} as unknown as DocumentNode<AdminPaymentRequestsQuery, AdminPaymentRequestsQueryVariables>;
export const CreateAdminPaymentRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAdminPaymentRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAdminPaymentRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]}}]} as unknown as DocumentNode<CreateAdminPaymentRequestMutation, CreateAdminPaymentRequestMutationVariables>;
export const CancelAdminPaymentRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelAdminPaymentRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelAdminPaymentRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}}]}}]} as unknown as DocumentNode<CancelAdminPaymentRequestMutation, CancelAdminPaymentRequestMutationVariables>;
export const AdminShippingSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminShippingSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminShippingSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShippingSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShippingSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"freeShippingThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"baseCost"}},{"kind":"Field","name":{"kind":"Name","value":"additionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"freeShippingEligible"}}]}}]}}]} as unknown as DocumentNode<AdminShippingSettingsQuery, AdminShippingSettingsQueryVariables>;
export const SaveAdminShippingSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminShippingSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingSettingsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminShippingSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShippingSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShippingSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"freeShippingThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"baseCost"}},{"kind":"Field","name":{"kind":"Name","value":"additionalKgCost"}},{"kind":"Field","name":{"kind":"Name","value":"freeShippingEligible"}}]}}]}}]} as unknown as DocumentNode<SaveAdminShippingSettingsMutation, SaveAdminShippingSettingsMutationVariables>;
export const AdminPriceListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPriceList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPriceList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPriceItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPriceItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPriceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitle"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<AdminPriceListQuery, AdminPriceListQueryVariables>;
export const SetAdminPricesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminPrices"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPriceChangeInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminPrices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPriceItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPriceItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPriceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitle"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<SetAdminPricesMutation, SetAdminPricesMutationVariables>;
export const AdminStoreInformationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminStoreInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminStoreInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminStoreInformationQuery, AdminStoreInformationQueryVariables>;
export const SaveAdminStoreInformationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminStoreInformation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminStoreInformation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SaveAdminStoreInformationMutation, SaveAdminStoreInformationMutationVariables>;
export const AdminOrdersMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrdersMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrdersInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"province"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrdersMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"province"},"value":{"kind":"Variable","name":{"kind":"Name","value":"province"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"locatedCount"}},{"kind":"Field","name":{"kind":"Name","value":"unknownCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageTotal"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"provinces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"locatedCount"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderSummaryFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrderSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}}]}}]} as unknown as DocumentNode<AdminOrdersMapQuery, AdminOrdersMapQueryVariables>;
export const AdminMessageTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminMessageTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMessageTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageTemplateSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageTemplateSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MessageTemplateSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"storeName"}}]}}]} as unknown as DocumentNode<AdminMessageTemplatesQuery, AdminMessageTemplatesQueryVariables>;
export const SaveAdminMessageTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminMessageTemplates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MessageTemplateInput"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminMessageTemplates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageTemplateSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageTemplateSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MessageTemplateSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"storeName"}}]}}]} as unknown as DocumentNode<SaveAdminMessageTemplatesMutation, SaveAdminMessageTemplatesMutationVariables>;
export const SaveAdminShipmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAdminShipment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShipmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAdminShipment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreInformationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bankCode"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"traceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"rrn"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reversedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminShippingLabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminShippingLabel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderPhone"}},{"kind":"Field","name":{"kind":"Name","value":"senderAddress"}},{"kind":"Field","name":{"kind":"Name","value":"senderPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"recipientAddress"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"packageWeight"}},{"kind":"Field","name":{"kind":"Name","value":"packageContent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"paperSize"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressSnapshot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalAddress"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminIdentityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminIdentity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gatewayTestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreInformationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offlinePayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salesChannel"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"}},{"kind":"Field","name":{"kind":"Name","value":"shippingWeightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"offlinePaidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingLabel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminShippingLabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCustomerFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productTitle"}},{"kind":"Field","name":{"kind":"Name","value":"productWeight"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"lineSubtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminIdentityFields"}}]}}]}}]}}]} as unknown as DocumentNode<SaveAdminShipmentMutation, SaveAdminShipmentMutationVariables>;
export const DeleteAdminCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAdminCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAdminCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedUpdatedAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedUpdatedAt"}}}]}]}}]} as unknown as DocumentNode<DeleteAdminCouponMutation, DeleteAdminCouponMutationVariables>;