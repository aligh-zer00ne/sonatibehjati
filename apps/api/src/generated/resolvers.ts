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

export enum ProductSort {
  Featured = 'FEATURED',
  NameAsc = 'NAME_ASC',
  Newest = 'NEWEST',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC'
}

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
  Address: ResolverTypeWrapper<Address>;
  AddressInput: AddressInput;
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
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OrderReceipt: ResolverTypeWrapper<OrderReceipt>;
  OtpChallenge: ResolverTypeWrapper<OtpChallenge>;
  Product: ResolverTypeWrapper<Product>;
  ProductImage: ResolverTypeWrapper<ProductImage>;
  ProductSort: ProductSort;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RequestOtpInput: RequestOtpInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  VerifyOtpInput: VerifyOtpInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Address: Address;
  AddressInput: AddressInput;
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
  OrderReceipt: OrderReceipt;
  OtpChallenge: OtpChallenge;
  Product: Product;
  ProductImage: ProductImage;
  Query: Record<PropertyKey, never>;
  RequestOtpInput: RequestOtpInput;
  String: Scalars['String']['output'];
  VerifyOtpInput: VerifyOtpInput;
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
  createOrder?: Resolver<ResolversTypes['OrderReceipt'], ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'input'>>;
  deleteAddress?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAddressArgs, 'id'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['AuthSession'], ParentType, ContextType>;
  requestOtp?: Resolver<ResolversTypes['OtpChallenge'], ParentType, ContextType, RequireFields<MutationRequestOtpArgs, 'input'>>;
  saveAddress?: Resolver<ResolversTypes['Address'], ParentType, ContextType, RequireFields<MutationSaveAddressArgs, 'input'>>;
  verifyOtp?: Resolver<ResolversTypes['AuthSession'], ParentType, ContextType, RequireFields<MutationVerifyOtpArgs, 'input'>>;
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Array<ResolversTypes['ProductImage']>, ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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

export type QueryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  catalog?: Resolver<ResolversTypes['CatalogPage'], ParentType, ContextType, RequireFields<QueryCatalogArgs, 'input'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  checkoutQuote?: Resolver<ResolversTypes['CheckoutQuote'], ParentType, ContextType, RequireFields<QueryCheckoutQuoteArgs, 'input'>>;
  health?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType>;
  myAddresses?: Resolver<Array<ResolversTypes['Address']>, ParentType, ContextType>;
  orderByRequestId?: Resolver<Maybe<ResolversTypes['OrderReceipt']>, ParentType, ContextType, RequireFields<QueryOrderByRequestIdArgs, 'requestId'>>;
  orderReceipt?: Resolver<ResolversTypes['OrderReceipt'], ParentType, ContextType, RequireFields<QueryOrderReceiptArgs, 'id'>>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<QueryProductArgs, 'slug'>>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, Partial<QueryProductsArgs>>;
  productsByIds?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<QueryProductsByIdsArgs, 'ids'>>;
  reverseLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryReverseLocationArgs, 'latitude' | 'longitude'>>;
};

export type Resolvers<ContextType = AuthContext> = {
  Address?: AddressResolvers<ContextType>;
  AuthSession?: AuthSessionResolvers<ContextType>;
  AuthUser?: AuthUserResolvers<ContextType>;
  CatalogPage?: CatalogPageResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CheckoutLine?: CheckoutLineResolvers<ContextType>;
  CheckoutQuote?: CheckoutQuoteResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OrderReceipt?: OrderReceiptResolvers<ContextType>;
  OtpChallenge?: OtpChallengeResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  ProductImage?: ProductImageResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

