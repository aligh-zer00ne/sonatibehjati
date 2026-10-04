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
const Invoice = lazy(() => import('./pages/Invoice'));
export default function App() {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        token: {
          fontFamily: 'Vazirmatn Variable, sans-serif',
          colorPrimary: '#96140d',
          borderRadius: 8,
          controlHeight: 44,
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
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/map" element={<OrdersMap />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="orders/:id/invoice" element={<Invoice />} />
                    <Route path="users" element={<Users />} />
                    <Route path="reports" element={<Reports />} />
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
