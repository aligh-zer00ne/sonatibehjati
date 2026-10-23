import { lazy, Suspense } from 'react';
import { ConfigProvider, App as AntApp, Skeleton, Result, Button } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminProvider from './auth/AdminProvider';
import ProtectedAdmin from './auth/ProtectedAdmin';
import OwnerOnly from './auth/OwnerOnly';
import AdminFrame from './components/AdminFrame';
const Announcement = lazy(() => import('./pages/Announcement'));
const StoreInformation = lazy(() => import('./pages/StoreInformation'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const PriceAnnouncement = lazy(() => import('./pages/PriceAnnouncement'));
const Orders = lazy(() => import('./pages/Orders'));
const FinancialHub = lazy(() => import('./pages/FinancialHub'));
const AccountEntryPage = lazy(() => import('./pages/AccountEntryPage'));
const PaymentLinks = lazy(() => import('./pages/PaymentLinks'));
const Settlements = lazy(() => import('./pages/Settlements'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const OrdersMap = lazy(() => import('./pages/OrdersMap'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const PaymentTest = lazy(() => import('./pages/PaymentTest'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminSection = lazy(() => import('./pages/AdminSection'));
const MessageTemplates = lazy(() => import('./pages/MessageTemplates'));
export default function App() {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      modal={{
        mask: { blur: true },
        classNames: { mask: '!bg-[#201015]/45 !backdrop-blur-[8px]' },
      }}
      drawer={{
        mask: { blur: true },
        classNames: { mask: '!bg-[#201015]/45 !backdrop-blur-[8px]' },
      }}
      theme={{
        token: {
          fontFamily: 'Vazirmatn Variable, sans-serif',
          fontSize: 15,
          fontSizeSM: 14,
          fontWeightStrong: 700,
          colorPrimary: '#701e2a',
          colorText: '#34251e',
          colorTextSecondary: '#6c5a4c',
          colorBgLayout: '#f6f1e9',
          colorBgContainer: '#fffdf9',
          colorBorder: '#e8ded1',
          colorBorderSecondary: '#eee5d9',
          borderRadius: 14,
          controlHeight: 48,
        },
        components: {
          Input: {
            colorBgContainer: '#f9f6f0',
            activeBg: '#fffdf9',
            hoverBg: '#fcfaf6',
            activeShadow: '0 0 0 3px #701e2a12',
          },
          InputNumber: { colorBgContainer: '#f9f6f0', activeShadow: '0 0 0 3px #701e2a12' },
          Select: {
            optionSelectedBg: '#f3ead7',
            optionActiveBg: '#faf6ee',
            optionSelectedColor: '#4e141c',
            optionFontSize: 15,
          },
          Typography: { titleMarginTop: 0, titleMarginBottom: 0 },
          Card: { headerFontSize: 17, headerHeight: 54, bodyPadding: 18 },
          Table: { headerBg: '#f7f1e8', rowHoverBg: '#fff4e6', cellPaddingBlock: 14 },
          Button: { fontWeight: 600, primaryShadow: '0 4px 10px rgba(147,13,37,0.12)' },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <AdminProvider>
            <Suspense
              fallback={
                <div className="p-8">
                  <Skeleton active />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedAdmin />}>
                  <Route path="/admin" element={<AdminFrame />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="coupons" element={<Coupons />} />
                    <Route
                      path="homepage"
                      element={<Navigate to="/admin/announcement" replace />}
                    />
                    <Route path="announcement" element={<Announcement />} />
                    <Route element={<OwnerOnly />}>
                      <Route path="accounts" element={<Accounts />} />
                      <Route path="payment-test" element={<PaymentTest />} />
                    </Route>
                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<ProductEdit />} />
                    <Route path="products/prices" element={<PriceAnnouncement />} />
                    <Route path="products/:id/edit" element={<ProductEdit />} />
                    <Route path="promotions" element={<Navigate to="/admin/products" replace />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="settlements" element={<FinancialHub />} />
                    <Route path="settlements/account" element={<Settlements />} />
                    <Route
                      path="settlements/receipt"
                      element={<AccountEntryPage key="receipt" direction="RECEIPT" />}
                    />
                    <Route
                      path="settlements/payment"
                      element={<AccountEntryPage key="payment" direction="PAYMENT" />}
                    />
                    <Route path="settlements/links" element={<PaymentLinks key="list" />} />
                    <Route path="settlements/links/new" element={<PaymentLinks key="new" />} />
                    <Route
                      path="orders/website"
                      element={<Orders key="website" scope="website" />}
                    />
                    <Route path="orders/manual" element={<Orders key="manual" scope="manual" />} />
                    <Route path="orders/map" element={<OrdersMap />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="message-templates" element={<MessageTemplates />} />
                    <Route path="store-information" element={<StoreInformation />} />
                    <Route path="shipping" element={<Shipping />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="sections/:section" element={<AdminSection />} />
                    <Route path="tickets" element={<Tickets />} />
                    <Route path="reviews" element={<Reviews />} />
                  </Route>
                </Route>
                <Route
                  path="*"
                  element={
                    <Result
                      status="404"
                      title="صفحه پیدا نشد"
                      extra={
                        <Link to="/admin">
                          <Button type="primary">داشبورد</Button>
                        </Link>
                      }
                    />
                  }
                />
              </Routes>
            </Suspense>
          </AdminProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
