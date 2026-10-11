import { lazy, Suspense } from 'react';
import { ConfigProvider, App as AntApp, Skeleton, Result, Button } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminProvider from './auth/AdminProvider';
import ProtectedAdmin from './auth/ProtectedAdmin';
import AdminFrame from './components/AdminFrame';
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const OrdersMap = lazy(() => import('./pages/OrdersMap'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const Settings = lazy(() => import('./pages/Settings'));
export default function App() {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        token: {
          fontFamily: 'Vazirmatn Variable, sans-serif',
          colorPrimary: '#930d25',
          colorText: '#34251e',
          colorTextSecondary: '#7d746a',
          colorBgLayout: '#f6f1e9',
          colorBgContainer: '#fffdf9',
          colorBorder: '#e8ded1',
          colorBorderSecondary: '#eee5d9',
          borderRadius: 10,
          controlHeight: 44,
        },
        components: {
          Typography: { titleMarginTop: 0, titleMarginBottom: 0 },
          Card: { headerFontSize: 14, headerHeight: 52, bodyPadding: 18 },
          Table: { headerBg: '#f7f1e8', rowHoverBg: '#fff4e6', cellPaddingBlock: 14 },
          Button: { primaryShadow: '0 4px 10px rgba(147,13,37,0.12)' },
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
                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<ProductEdit />} />
                    <Route path="products/:id/edit" element={<ProductEdit />} />
                    <Route path="promotions" element={<Navigate to="/admin/products" replace />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/map" element={<OrdersMap />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="users" element={<Users />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
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
