import { GraphQLResolveInfo } from 'graphql';
import { ReceiptSource, AccountOrderSource, AdminOrderSource } from '../modules/payments/types.js';
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
  | 'ORDERS'
  | 'ORDER_MAP'
  | 'PRODUCTS'
  | 'REPORTS'
  | 'REVIEWS'
  | 'TICKETS';

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
  saveAdminProduct: Product;
  saveAdminShippingLabel: AdminShippingLabel;
  saveAnnouncement: HomepageContent;
  saveHomepageContent: HomepageContent;
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


export type MutationSaveAnnouncementArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: AnnouncementInput;
};


export type MutationSaveHomepageContentArgs = {
  expectedUpdatedAt?: InputMaybe<Scalars['String']['input']>;
  input: HomepageContentInput;
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
  adminOrder: AdminOrder;
  adminOrderCustomer: AdminUser;
  adminOrderCustomers: AdminUsersPage;
  adminOrders: AdminOrdersPage;
  adminPaymentRequests: AdminPaymentRequestPage;
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

export type StaffInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  permissions?: InputMaybe<Array<AdminPermission>>;
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
  AccountAllocation: ResolverTypeWrapper<AccountAllocation>;
  AccountEntryDirection: AccountEntryDirection;
  AccountInvoice: ResolverTypeWrapper<AccountInvoice>;
  AccountOrder: ResolverTypeWrapper<AccountOrderSource>;
  AccountOrderSummary: ResolverTypeWrapper<AccountOrderSummary>;
  Address: ResolverTypeWrapper<Address>;
  AddressInput: AddressInput;
  AdminAccountEntryInput: AdminAccountEntryInput;
  AdminChannelMetric: ResolverTypeWrapper<AdminChannelMetric>;
  AdminCoupon: ResolverTypeWrapper<AdminCoupon>;
  AdminCouponInput: AdminCouponInput;
  AdminCustomerInput: AdminCustomerInput;
  AdminDailyMetric: ResolverTypeWrapper<AdminDailyMetric>;
  AdminDashboard: ResolverTypeWrapper<AdminDashboard>;
  AdminGatewayTestPayment: ResolverTypeWrapper<AdminGatewayTestPayment>;
  AdminGatewayTestState: ResolverTypeWrapper<AdminGatewayTestState>;
  AdminIdentity: ResolverTypeWrapper<AdminIdentity>;
  AdminLoginInput: AdminLoginInput;
  AdminManualLineInput: AdminManualLineInput;
  AdminManualOrderInput: AdminManualOrderInput;
  AdminManualQuote: ResolverTypeWrapper<AdminManualQuote>;
  AdminManualQuoteInput: AdminManualQuoteInput;
  AdminOfflinePayment: ResolverTypeWrapper<AdminOfflinePayment>;
  AdminOfflinePaymentInput: AdminOfflinePaymentInput;
  AdminOrder: ResolverTypeWrapper<AdminOrderSource>;
  AdminOrderSort: AdminOrderSort;
  AdminOrderStatusInput: AdminOrderStatusInput;
  AdminOrderSummary: ResolverTypeWrapper<AdminOrderSummary>;
  AdminOrdersInput: AdminOrdersInput;
  AdminOrdersPage: ResolverTypeWrapper<AdminOrdersPage>;
  AdminPasswordChangeInput: AdminPasswordChangeInput;
  AdminPaymentRequest: ResolverTypeWrapper<AdminPaymentRequest>;
  AdminPaymentRequestInput: AdminPaymentRequestInput;
  AdminPaymentRequestPage: ResolverTypeWrapper<AdminPaymentRequestPage>;
  AdminPaymentRequestsInput: AdminPaymentRequestsInput;
  AdminPermission: AdminPermission;
  AdminProductDeletion: ResolverTypeWrapper<AdminProductDeletion>;
  AdminProductImageInput: AdminProductImageInput;
  AdminProductInput: AdminProductInput;
  AdminProductsInput: AdminProductsInput;
  AdminProductsPage: ResolverTypeWrapper<AdminProductsPage>;
  AdminPromotionInput: AdminPromotionInput;
  AdminPromotionTargetInput: AdminPromotionTargetInput;
  AdminReport: ResolverTypeWrapper<AdminReport>;
  AdminReportInput: AdminReportInput;
  AdminRole: AdminRole;
  AdminSessionPayload: ResolverTypeWrapper<AdminSessionPayload>;
  AdminShippingLabel: ResolverTypeWrapper<AdminShippingLabel>;
  AdminShippingLabelInput: AdminShippingLabelInput;
  AdminStatusMetric: ResolverTypeWrapper<AdminStatusMetric>;
  AdminTopProduct: ResolverTypeWrapper<AdminTopProduct>;
  AdminUser: ResolverTypeWrapper<AdminUser>;
  AdminUsersInput: AdminUsersInput;
  AdminUsersPage: ResolverTypeWrapper<AdminUsersPage>;
  Announcement: ResolverTypeWrapper<Announcement>;
  AnnouncementInput: AnnouncementInput;
  AuthSession: ResolverTypeWrapper<AuthSession>;
  AuthUser: ResolverTypeWrapper<AuthUser>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BrandStoryContent: ResolverTypeWrapper<BrandStoryContent>;
  BrandStoryContentInput: BrandStoryContentInput;
  CatalogInput: CatalogInput;
  CatalogPage: ResolverTypeWrapper<CatalogPage>;
  Category: ResolverTypeWrapper<Category>;
  CheckoutInput: CheckoutInput;
  CheckoutLine: ResolverTypeWrapper<CheckoutLine>;
  CheckoutLineInput: CheckoutLineInput;
  CheckoutQuote: ResolverTypeWrapper<CheckoutQuote>;
  CreateOrderInput: CreateOrderInput;
  CustomerAccount: ResolverTypeWrapper<CustomerAccount>;
  CustomerAccountEntry: ResolverTypeWrapper<CustomerAccountEntry>;
  CustomerExport: ResolverTypeWrapper<CustomerExport>;
  DiscountType: DiscountType;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  HeroSlide: ResolverTypeWrapper<HeroSlide>;
  HeroSlideInput: HeroSlideInput;
  HomepageContent: ResolverTypeWrapper<HomepageContent>;
  HomepageContentInput: HomepageContentInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LabelPaperSize: LabelPaperSize;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  MyOrdersInput: MyOrdersInput;
  MyOrdersPage: ResolverTypeWrapper<MyOrdersPage>;
  OfflinePaymentMethod: OfflinePaymentMethod;
  OrderAddressSnapshot: ResolverTypeWrapper<OrderAddressSnapshot>;
  OrderItemSnapshot: ResolverTypeWrapper<OrderItemSnapshot>;
  OrderReceipt: ResolverTypeWrapper<ReceiptSource>;
  OrderStatus: OrderStatus;
  OrderStatusEvent: ResolverTypeWrapper<OrderStatusEvent>;
  OtpChallenge: ResolverTypeWrapper<OtpChallenge>;
  PaymentInfo: ResolverTypeWrapper<PaymentInfo>;
  PaymentRedirect: ResolverTypeWrapper<PaymentRedirect>;
  PaymentRequestScope: PaymentRequestScope;
  PaymentRequestStatus: PaymentRequestStatus;
  PaymentStatus: PaymentStatus;
  Product: ResolverTypeWrapper<Product>;
  ProductImage: ResolverTypeWrapper<ProductImage>;
  ProductPromotion: ResolverTypeWrapper<ProductPromotion>;
  ProductReview: ResolverTypeWrapper<ProductReview>;
  ProductSort: ProductSort;
  ProfileInput: ProfileInput;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RequestOtpInput: RequestOtpInput;
  ReviewFilter: ReviewFilter;
  ReviewInput: ReviewInput;
  ReviewPage: ResolverTypeWrapper<ReviewPage>;
  ReviewStatus: ReviewStatus;
  SalesChannel: SalesChannel;
  ShippingMethod: ShippingMethod;
  StaffInput: StaffInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SupportTicket: ResolverTypeWrapper<SupportTicket>;
  TicketFilter: TicketFilter;
  TicketInput: TicketInput;
  TicketMessage: ResolverTypeWrapper<TicketMessage>;
  TicketPage: ResolverTypeWrapper<TicketPage>;
  TicketReplyInput: TicketReplyInput;
  TicketStatus: TicketStatus;
  VerifyOtpInput: VerifyOtpInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AccountAllocation: AccountAllocation;
  AccountInvoice: AccountInvoice;
  AccountOrder: AccountOrderSource;
  AccountOrderSummary: AccountOrderSummary;
  Address: Address;
  AddressInput: AddressInput;
  AdminAccountEntryInput: AdminAccountEntryInput;
  AdminChannelMetric: AdminChannelMetric;
  AdminCoupon: AdminCoupon;
  AdminCouponInput: AdminCouponInput;
  AdminCustomerInput: AdminCustomerInput;
  AdminDailyMetric: AdminDailyMetric;
  AdminDashboard: AdminDashboard;
  AdminGatewayTestPayment: AdminGatewayTestPayment;
  AdminGatewayTestState: AdminGatewayTestState;
  AdminIdentity: AdminIdentity;
  AdminLoginInput: AdminLoginInput;
  AdminManualLineInput: AdminManualLineInput;
  AdminManualOrderInput: AdminManualOrderInput;
  AdminManualQuote: AdminManualQuote;
  AdminManualQuoteInput: AdminManualQuoteInput;
  AdminOfflinePayment: AdminOfflinePayment;
  AdminOfflinePaymentInput: AdminOfflinePaymentInput;
  AdminOrder: AdminOrderSource;
  AdminOrderStatusInput: AdminOrderStatusInput;
  AdminOrderSummary: AdminOrderSummary;
  AdminOrdersInput: AdminOrdersInput;
  AdminOrdersPage: AdminOrdersPage;
  AdminPasswordChangeInput: AdminPasswordChangeInput;
  AdminPaymentRequest: AdminPaymentRequest;
  AdminPaymentRequestInput: AdminPaymentRequestInput;
  AdminPaymentRequestPage: AdminPaymentRequestPage;
  AdminPaymentRequestsInput: AdminPaymentRequestsInput;
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
  Announcement: Announcement;
  AnnouncementInput: AnnouncementInput;
  AuthSession: AuthSession;
  AuthUser: AuthUser;
  Boolean: Scalars['Boolean']['output'];
  BrandStoryContent: BrandStoryContent;
  BrandStoryContentInput: BrandStoryContentInput;
  CatalogInput: CatalogInput;
  CatalogPage: CatalogPage;
  Category: Category;
  CheckoutInput: CheckoutInput;
  CheckoutLine: CheckoutLine;
  CheckoutLineInput: CheckoutLineInput;
  CheckoutQuote: CheckoutQuote;
  CreateOrderInput: CreateOrderInput;
  CustomerAccount: CustomerAccount;
  CustomerAccountEntry: CustomerAccountEntry;
  CustomerExport: CustomerExport;
  Float: Scalars['Float']['output'];
  HeroSlide: HeroSlide;
  HeroSlideInput: HeroSlideInput;
  HomepageContent: HomepageContent;
  HomepageContentInput: HomepageContentInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  MyOrdersInput: MyOrdersInput;
  MyOrdersPage: MyOrdersPage;
  OrderAddressSnapshot: OrderAddressSnapshot;
  OrderItemSnapshot: OrderItemSnapshot;
  OrderReceipt: ReceiptSource;
  OrderStatusEvent: OrderStatusEvent;
  OtpChallenge: OtpChallenge;
  PaymentInfo: PaymentInfo;
  PaymentRedirect: PaymentRedirect;
  Product: Product;
  ProductImage: ProductImage;
  ProductPromotion: ProductPromotion;
  ProductReview: ProductReview;
  ProfileInput: ProfileInput;
  Query: Record<PropertyKey, never>;
  RequestOtpInput: RequestOtpInput;
  ReviewFilter: ReviewFilter;
  ReviewInput: ReviewInput;
  ReviewPage: ReviewPage;
  StaffInput: StaffInput;
  String: Scalars['String']['output'];
  SupportTicket: SupportTicket;
  TicketFilter: TicketFilter;
  TicketInput: TicketInput;
  TicketMessage: TicketMessage;
  TicketPage: TicketPage;
  TicketReplyInput: TicketReplyInput;
  VerifyOtpInput: VerifyOtpInput;
};

export type AccountAllocationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AccountAllocation'] = ResolversParentTypes['AccountAllocation']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type AccountInvoiceResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AccountInvoice'] = ResolversParentTypes['AccountInvoice']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offlinePaidAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AccountOrderResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AccountOrder'] = ResolversParentTypes['AccountOrder']> = {
  address?: Resolver<ResolversTypes['OrderAddressSnapshot'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['OrderItemSnapshot']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offlinePaidAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  paidAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['PaymentInfo']>, ParentType, ContextType>;
  salesChannel?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AccountOrderSummaryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AccountOrderSummary'] = ResolversParentTypes['AccountOrderSummary']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offlinePaidAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  salesChannel?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type AdminChannelMetricResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminChannelMetric'] = ResolversParentTypes['AdminChannelMetric']> = {
  customersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  orderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  revenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  salesChannel?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
};

export type AdminCouponResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminCoupon'] = ResolversParentTypes['AdminCoupon']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  maxDiscountAmount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  minOrderAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startsAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['DiscountType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  usageLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  channelMetrics?: Resolver<Array<ResolversTypes['AdminChannelMetric']>, ParentType, ContextType>;
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

export type AdminGatewayTestPaymentResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminGatewayTestPayment'] = ResolversParentTypes['AdminGatewayTestPayment']> = {
  payment?: Resolver<ResolversTypes['PaymentInfo'], ParentType, ContextType>;
  redirectUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resultUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AdminGatewayTestStateResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminGatewayTestState'] = ResolversParentTypes['AdminGatewayTestState']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['AdminGatewayTestPayment']>, ParentType, ContextType>;
  terminalId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AdminIdentityResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminIdentity'] = ResolversParentTypes['AdminIdentity']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gatewayTestEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['AdminPermission']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['AdminRole'], ParentType, ContextType>;
};

export type AdminManualQuoteResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminManualQuote'] = ResolversParentTypes['AdminManualQuote']> = {
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['CheckoutLine']>, ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AdminOfflinePaymentResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminOfflinePayment'] = ResolversParentTypes['AdminOfflinePayment']> = {
  adminEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['OfflinePaymentMethod'], ParentType, ContextType>;
};

export type AdminOrderResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminOrder'] = ResolversParentTypes['AdminOrder']> = {
  address?: Resolver<ResolversTypes['OrderAddressSnapshot'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['OrderItemSnapshot']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offlinePaidAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offlinePayments?: Resolver<Array<ResolversTypes['AdminOfflinePayment']>, ParentType, ContextType>;
  paidAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['PaymentInfo']>, ParentType, ContextType>;
  salesChannel?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingLabel?: Resolver<Maybe<ResolversTypes['AdminShippingLabel']>, ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  offlinePaidAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  salesChannel?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type AdminPaymentRequestResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminPaymentRequest'] = ResolversParentTypes['AdminPaymentRequest']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  customerId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  customerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  paidAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payerPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['PaymentInfo']>, ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['PaymentRequestScope'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PaymentRequestStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AdminPaymentRequestPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminPaymentRequestPage'] = ResolversParentTypes['AdminPaymentRequestPage']> = {
  gatewayAvailable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['AdminPaymentRequest']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  bankRevenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  daily?: Resolver<Array<ResolversTypes['AdminDailyMetric']>, ParentType, ContextType>;
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  offlineRevenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  orderValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  paymentLinkRevenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
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
  accountBalance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  acquisitionSource?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultAddress?: Resolver<Maybe<ResolversTypes['Address']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ordersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  salesChannels?: Resolver<Array<ResolversTypes['SalesChannel']>, ParentType, ContextType>;
  totalOrdersValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type AdminUsersPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AdminUsersPage'] = ResolversParentTypes['AdminUsersPage']> = {
  items?: Resolver<Array<ResolversTypes['AdminUser']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type AnnouncementResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Announcement'] = ResolversParentTypes['Announcement']> = {
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type BrandStoryContentResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['BrandStoryContent'] = ResolversParentTypes['BrandStoryContent']> = {
  action?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  alt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  href?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mobileAction?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mobileSrc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subtitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  discountAmount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  discountPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lineSubtotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lineTotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unitPrice?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weight?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CheckoutQuoteResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CheckoutQuote'] = ResolversParentTypes['CheckoutQuote']> = {
  addressId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['CheckoutLine']>, ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type CustomerAccountResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CustomerAccount'] = ResolversParentTypes['CustomerAccount']> = {
  balance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  entries?: Resolver<Array<ResolversTypes['CustomerAccountEntry']>, ParentType, ContextType>;
  invoicePage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  invoiceTotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  invoiced?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  invoices?: Resolver<Array<ResolversTypes['AccountInvoice']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  paid?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  received?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
};

export type CustomerAccountEntryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CustomerAccountEntry'] = ResolversParentTypes['CustomerAccountEntry']> = {
  adminEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  allocations?: Resolver<Array<ResolversTypes['AccountAllocation']>, ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  chequeBank?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chequeDueDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chequeNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  direction?: Resolver<ResolversTypes['AccountEntryDirection'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['OfflinePaymentMethod'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type CustomerExportResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['CustomerExport'] = ResolversParentTypes['CustomerExport']> = {
  base64?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  filename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type HeroSlideResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['HeroSlide'] = ResolversParentTypes['HeroSlide']> = {
  action?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  alt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eyebrow?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  href?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mobileAction?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mobileSrc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subtitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type HomepageContentResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['HomepageContent'] = ResolversParentTypes['HomepageContent']> = {
  announcement?: Resolver<ResolversTypes['Announcement'], ParentType, ContextType>;
  slides?: Resolver<Array<ResolversTypes['HeroSlide']>, ParentType, ContextType>;
  story?: Resolver<ResolversTypes['BrandStoryContent'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type MutationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  adminLogin?: Resolver<ResolversTypes['AdminSessionPayload'], ParentType, ContextType, RequireFields<MutationAdminLoginArgs, 'input'>>;
  adminLogout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  adminRefresh?: Resolver<ResolversTypes['AdminSessionPayload'], ParentType, ContextType>;
  cancelAdminPaymentRequest?: Resolver<ResolversTypes['AdminPaymentRequest'], ParentType, ContextType, RequireFields<MutationCancelAdminPaymentRequestArgs, 'id'>>;
  changeAdminPassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationChangeAdminPasswordArgs, 'input'>>;
  createAdminCustomer?: Resolver<ResolversTypes['AdminUser'], ParentType, ContextType, RequireFields<MutationCreateAdminCustomerArgs, 'input'>>;
  createAdminManualOrder?: Resolver<ResolversTypes['AdminOrder'], ParentType, ContextType, RequireFields<MutationCreateAdminManualOrderArgs, 'input'>>;
  createAdminPaymentRequest?: Resolver<ResolversTypes['AdminPaymentRequest'], ParentType, ContextType, RequireFields<MutationCreateAdminPaymentRequestArgs, 'input'>>;
  createOrder?: Resolver<ResolversTypes['OrderReceipt'], ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'input'>>;
  createStaff?: Resolver<ResolversTypes['AdminIdentity'], ParentType, ContextType, RequireFields<MutationCreateStaffArgs, 'input'>>;
  createTicket?: Resolver<ResolversTypes['SupportTicket'], ParentType, ContextType, RequireFields<MutationCreateTicketArgs, 'input'>>;
  deleteAddress?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAddressArgs, 'id'>>;
  deleteAdminProduct?: Resolver<ResolversTypes['AdminProductDeletion'], ParentType, ContextType, RequireFields<MutationDeleteAdminProductArgs, 'expectedUpdatedAt' | 'id'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  moderateProductReview?: Resolver<ResolversTypes['ProductReview'], ParentType, ContextType, RequireFields<MutationModerateProductReviewArgs, 'expectedUpdatedAt' | 'id' | 'status'>>;
  recordAdminAccountEntry?: Resolver<ResolversTypes['CustomerAccount'], ParentType, ContextType, RequireFields<MutationRecordAdminAccountEntryArgs, 'input'>>;
  recordAdminOfflinePayment?: Resolver<ResolversTypes['AdminOrder'], ParentType, ContextType, RequireFields<MutationRecordAdminOfflinePaymentArgs, 'input'>>;
  refreshToken?: Resolver<ResolversTypes['AuthSession'], ParentType, ContextType>;
  replyAdminTicket?: Resolver<ResolversTypes['SupportTicket'], ParentType, ContextType, RequireFields<MutationReplyAdminTicketArgs, 'input'>>;
  replyTicket?: Resolver<ResolversTypes['SupportTicket'], ParentType, ContextType, RequireFields<MutationReplyTicketArgs, 'input'>>;
  requestOtp?: Resolver<ResolversTypes['OtpChallenge'], ParentType, ContextType, RequireFields<MutationRequestOtpArgs, 'input'>>;
  retryAdminPayment?: Resolver<ResolversTypes['PaymentInfo'], ParentType, ContextType, RequireFields<MutationRetryAdminPaymentArgs, 'paymentId'>>;
  saveAddress?: Resolver<ResolversTypes['Address'], ParentType, ContextType, RequireFields<MutationSaveAddressArgs, 'input'>>;
  saveAdminCoupon?: Resolver<ResolversTypes['AdminCoupon'], ParentType, ContextType, RequireFields<MutationSaveAdminCouponArgs, 'input'>>;
  saveAdminProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationSaveAdminProductArgs, 'input'>>;
  saveAdminShippingLabel?: Resolver<ResolversTypes['AdminShippingLabel'], ParentType, ContextType, RequireFields<MutationSaveAdminShippingLabelArgs, 'input' | 'orderId'>>;
  saveAnnouncement?: Resolver<ResolversTypes['HomepageContent'], ParentType, ContextType, RequireFields<MutationSaveAnnouncementArgs, 'input'>>;
  saveHomepageContent?: Resolver<ResolversTypes['HomepageContent'], ParentType, ContextType, RequireFields<MutationSaveHomepageContentArgs, 'input'>>;
  setAdminProductActive?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationSetAdminProductActiveArgs, 'expectedUpdatedAt' | 'id' | 'isActive'>>;
  setAdminPromotion?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<MutationSetAdminPromotionArgs, 'input' | 'products'>>;
  setAdminTicketStatus?: Resolver<ResolversTypes['SupportTicket'], ParentType, ContextType, RequireFields<MutationSetAdminTicketStatusArgs, 'expectedUpdatedAt' | 'id' | 'status'>>;
  setStaffActive?: Resolver<ResolversTypes['AdminIdentity'], ParentType, ContextType, RequireFields<MutationSetStaffActiveArgs, 'id' | 'isActive'>>;
  setStaffPermissions?: Resolver<ResolversTypes['AdminIdentity'], ParentType, ContextType, RequireFields<MutationSetStaffPermissionsArgs, 'id' | 'permissions'>>;
  startAdminGatewayTest?: Resolver<ResolversTypes['PaymentRedirect'], ParentType, ContextType>;
  startOrderPayment?: Resolver<ResolversTypes['PaymentRedirect'], ParentType, ContextType, RequireFields<MutationStartOrderPaymentArgs, 'orderId'>>;
  submitProductReview?: Resolver<ResolversTypes['ProductReview'], ParentType, ContextType, RequireFields<MutationSubmitProductReviewArgs, 'input'>>;
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
  discountAmount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  discountPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lineSubtotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  offlinePaidAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  paidAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['PaymentInfo']>, ParentType, ContextType>;
  salesChannel?: Resolver<ResolversTypes['SalesChannel'], ParentType, ContextType>;
  shipping?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingMethod?: Resolver<Maybe<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  codeLength?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resendAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  testMode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type PaymentInfoResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['PaymentInfo'] = ResolversParentTypes['PaymentInfo']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bankCode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reversedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rrn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PaymentStatus'], ParentType, ContextType>;
  traceNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  verifiedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type PaymentRedirectResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['PaymentRedirect'] = ResolversParentTypes['PaymentRedirect']> = {
  redirectUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  shippingAdditionalKgCost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingBaseCost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  shippingWeightGrams?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type ProductReviewResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['ProductReview'] = ResolversParentTypes['ProductReview']> = {
  authorName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  productTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rating?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ReviewStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  adminAccounts?: Resolver<Array<ResolversTypes['AdminIdentity']>, ParentType, ContextType>;
  adminCoupons?: Resolver<Array<ResolversTypes['AdminCoupon']>, ParentType, ContextType>;
  adminCustomerAccount?: Resolver<ResolversTypes['CustomerAccount'], ParentType, ContextType, RequireFields<QueryAdminCustomerAccountArgs, 'customerId' | 'invoicePage' | 'page'>>;
  adminCustomerExport?: Resolver<ResolversTypes['CustomerExport'], ParentType, ContextType, Partial<QueryAdminCustomerExportArgs>>;
  adminDashboard?: Resolver<ResolversTypes['AdminDashboard'], ParentType, ContextType, Partial<QueryAdminDashboardArgs>>;
  adminGatewayTest?: Resolver<ResolversTypes['AdminGatewayTestState'], ParentType, ContextType>;
  adminHomepageContent?: Resolver<ResolversTypes['HomepageContent'], ParentType, ContextType>;
  adminManualQuote?: Resolver<ResolversTypes['AdminManualQuote'], ParentType, ContextType, RequireFields<QueryAdminManualQuoteArgs, 'input'>>;
  adminMe?: Resolver<Maybe<ResolversTypes['AdminIdentity']>, ParentType, ContextType>;
  adminOrder?: Resolver<ResolversTypes['AdminOrder'], ParentType, ContextType, RequireFields<QueryAdminOrderArgs, 'id'>>;
  adminOrderCustomer?: Resolver<ResolversTypes['AdminUser'], ParentType, ContextType, RequireFields<QueryAdminOrderCustomerArgs, 'id'>>;
  adminOrderCustomers?: Resolver<ResolversTypes['AdminUsersPage'], ParentType, ContextType, RequireFields<QueryAdminOrderCustomersArgs, 'input'>>;
  adminOrders?: Resolver<ResolversTypes['AdminOrdersPage'], ParentType, ContextType, RequireFields<QueryAdminOrdersArgs, 'input'>>;
  adminPaymentRequests?: Resolver<ResolversTypes['AdminPaymentRequestPage'], ParentType, ContextType, RequireFields<QueryAdminPaymentRequestsArgs, 'input'>>;
  adminProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<QueryAdminProductArgs, 'id'>>;
  adminProducts?: Resolver<ResolversTypes['AdminProductsPage'], ParentType, ContextType, RequireFields<QueryAdminProductsArgs, 'input'>>;
  adminReport?: Resolver<ResolversTypes['AdminReport'], ParentType, ContextType, RequireFields<QueryAdminReportArgs, 'input'>>;
  adminReviews?: Resolver<ResolversTypes['ReviewPage'], ParentType, ContextType, RequireFields<QueryAdminReviewsArgs, 'input'>>;
  adminTicket?: Resolver<ResolversTypes['SupportTicket'], ParentType, ContextType, RequireFields<QueryAdminTicketArgs, 'id'>>;
  adminTickets?: Resolver<ResolversTypes['TicketPage'], ParentType, ContextType, RequireFields<QueryAdminTicketsArgs, 'input'>>;
  adminUser?: Resolver<ResolversTypes['AdminUser'], ParentType, ContextType, RequireFields<QueryAdminUserArgs, 'id'>>;
  adminUsers?: Resolver<ResolversTypes['AdminUsersPage'], ParentType, ContextType, RequireFields<QueryAdminUsersArgs, 'input'>>;
  catalog?: Resolver<ResolversTypes['CatalogPage'], ParentType, ContextType, RequireFields<QueryCatalogArgs, 'input'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  checkoutQuote?: Resolver<ResolversTypes['CheckoutQuote'], ParentType, ContextType, RequireFields<QueryCheckoutQuoteArgs, 'input'>>;
  health?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  homepageContent?: Resolver<ResolversTypes['HomepageContent'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType>;
  myAddresses?: Resolver<Array<ResolversTypes['Address']>, ParentType, ContextType>;
  myOrder?: Resolver<ResolversTypes['AccountOrder'], ParentType, ContextType, RequireFields<QueryMyOrderArgs, 'id'>>;
  myOrders?: Resolver<ResolversTypes['MyOrdersPage'], ParentType, ContextType, RequireFields<QueryMyOrdersArgs, 'input'>>;
  myProductReview?: Resolver<Maybe<ResolversTypes['ProductReview']>, ParentType, ContextType, RequireFields<QueryMyProductReviewArgs, 'productId'>>;
  myTicket?: Resolver<ResolversTypes['SupportTicket'], ParentType, ContextType, RequireFields<QueryMyTicketArgs, 'id'>>;
  myTickets?: Resolver<ResolversTypes['TicketPage'], ParentType, ContextType, RequireFields<QueryMyTicketsArgs, 'input'>>;
  orderByRequestId?: Resolver<Maybe<ResolversTypes['OrderReceipt']>, ParentType, ContextType, RequireFields<QueryOrderByRequestIdArgs, 'requestId'>>;
  orderReceipt?: Resolver<ResolversTypes['OrderReceipt'], ParentType, ContextType, RequireFields<QueryOrderReceiptArgs, 'id'>>;
  paymentAvailable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<QueryProductArgs, 'slug'>>;
  productReviews?: Resolver<ResolversTypes['ReviewPage'], ParentType, ContextType, RequireFields<QueryProductReviewsArgs, 'productId'>>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, Partial<QueryProductsArgs>>;
  productsByIds?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<QueryProductsByIdsArgs, 'ids'>>;
  promotionalProducts?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  reverseLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryReverseLocationArgs, 'latitude' | 'longitude'>>;
};

export type ReviewPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['ReviewPage'] = ResolversParentTypes['ReviewPage']> = {
  items?: Resolver<Array<ResolversTypes['ProductReview']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type SupportTicketResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['SupportTicket'] = ResolversParentTypes['SupportTicket']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  customerName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['TicketMessage']>, ParentType, ContextType>;
  orderNumber?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type TicketMessageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['TicketMessage'] = ResolversParentTypes['TicketMessage']> = {
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fromSupport?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type TicketPageResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['TicketPage'] = ResolversParentTypes['TicketPage']> = {
  items?: Resolver<Array<ResolversTypes['SupportTicket']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type Resolvers<ContextType = AuthContext> = {
  AccountAllocation?: AccountAllocationResolvers<ContextType>;
  AccountInvoice?: AccountInvoiceResolvers<ContextType>;
  AccountOrder?: AccountOrderResolvers<ContextType>;
  AccountOrderSummary?: AccountOrderSummaryResolvers<ContextType>;
  Address?: AddressResolvers<ContextType>;
  AdminChannelMetric?: AdminChannelMetricResolvers<ContextType>;
  AdminCoupon?: AdminCouponResolvers<ContextType>;
  AdminDailyMetric?: AdminDailyMetricResolvers<ContextType>;
  AdminDashboard?: AdminDashboardResolvers<ContextType>;
  AdminGatewayTestPayment?: AdminGatewayTestPaymentResolvers<ContextType>;
  AdminGatewayTestState?: AdminGatewayTestStateResolvers<ContextType>;
  AdminIdentity?: AdminIdentityResolvers<ContextType>;
  AdminManualQuote?: AdminManualQuoteResolvers<ContextType>;
  AdminOfflinePayment?: AdminOfflinePaymentResolvers<ContextType>;
  AdminOrder?: AdminOrderResolvers<ContextType>;
  AdminOrderSummary?: AdminOrderSummaryResolvers<ContextType>;
  AdminOrdersPage?: AdminOrdersPageResolvers<ContextType>;
  AdminPaymentRequest?: AdminPaymentRequestResolvers<ContextType>;
  AdminPaymentRequestPage?: AdminPaymentRequestPageResolvers<ContextType>;
  AdminProductDeletion?: AdminProductDeletionResolvers<ContextType>;
  AdminProductsPage?: AdminProductsPageResolvers<ContextType>;
  AdminReport?: AdminReportResolvers<ContextType>;
  AdminSessionPayload?: AdminSessionPayloadResolvers<ContextType>;
  AdminShippingLabel?: AdminShippingLabelResolvers<ContextType>;
  AdminStatusMetric?: AdminStatusMetricResolvers<ContextType>;
  AdminTopProduct?: AdminTopProductResolvers<ContextType>;
  AdminUser?: AdminUserResolvers<ContextType>;
  AdminUsersPage?: AdminUsersPageResolvers<ContextType>;
  Announcement?: AnnouncementResolvers<ContextType>;
  AuthSession?: AuthSessionResolvers<ContextType>;
  AuthUser?: AuthUserResolvers<ContextType>;
  BrandStoryContent?: BrandStoryContentResolvers<ContextType>;
  CatalogPage?: CatalogPageResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CheckoutLine?: CheckoutLineResolvers<ContextType>;
  CheckoutQuote?: CheckoutQuoteResolvers<ContextType>;
  CustomerAccount?: CustomerAccountResolvers<ContextType>;
  CustomerAccountEntry?: CustomerAccountEntryResolvers<ContextType>;
  CustomerExport?: CustomerExportResolvers<ContextType>;
  HeroSlide?: HeroSlideResolvers<ContextType>;
  HomepageContent?: HomepageContentResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyOrdersPage?: MyOrdersPageResolvers<ContextType>;
  OrderAddressSnapshot?: OrderAddressSnapshotResolvers<ContextType>;
  OrderItemSnapshot?: OrderItemSnapshotResolvers<ContextType>;
  OrderReceipt?: OrderReceiptResolvers<ContextType>;
  OrderStatusEvent?: OrderStatusEventResolvers<ContextType>;
  OtpChallenge?: OtpChallengeResolvers<ContextType>;
  PaymentInfo?: PaymentInfoResolvers<ContextType>;
  PaymentRedirect?: PaymentRedirectResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  ProductImage?: ProductImageResolvers<ContextType>;
  ProductPromotion?: ProductPromotionResolvers<ContextType>;
  ProductReview?: ProductReviewResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReviewPage?: ReviewPageResolvers<ContextType>;
  SupportTicket?: SupportTicketResolvers<ContextType>;
  TicketMessage?: TicketMessageResolvers<ContextType>;
  TicketPage?: TicketPageResolvers<ContextType>;
};

