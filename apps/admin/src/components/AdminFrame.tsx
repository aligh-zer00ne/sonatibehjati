import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Alert, Typography } from 'antd';
import { BRAND_NAME } from '@behjati/shared';
import { useAdmin } from '../auth/AdminProvider';
const links = [
  ['/admin', 'داشبورد'],
  ['/admin/products', 'محصولات'],
  ['/admin/orders', 'سفارش‌ها'],
  ['/admin/orders/map', 'نقشه سفارش‌ها'],
  ['/admin/users', 'کاربران'],
  ['/admin/reports', 'گزارش‌ها'],
] as const;
export default function AdminFrame() {
  const { admin, logout } = useAdmin();
  const { pathname } = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const selected = pathname.startsWith('/admin/orders/map')
    ? '/admin/orders/map'
    : (links.slice(1).find(([href]) => pathname.startsWith(href))?.[0] ?? '/admin');
  return (
    <Layout className="min-h-dvh">
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth={0}
        width={224}
        className="print:!hidden"
        theme="dark"
      >
        <Link to="/admin" className="block px-5 py-6 text-center font-bold !text-white">
          مدیریت سنتی بهجتی
        </Link>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selected]}
          items={links.map(([href, label]) => ({
            key: href,
            label: <Link to={href}>{label}</Link>,
          }))}
        />
      </Layout.Sider>
      <Layout className="min-w-0">
        <Layout.Header className="flex h-auto min-h-20 flex-wrap items-center justify-between gap-3 !bg-white !px-5 !py-3 print:!hidden">
          <Typography.Text strong>{BRAND_NAME}</Typography.Text>
          <div className="flex flex-wrap items-center gap-4">
            <bdi className="text-xs text-slate-500">{admin?.email}</bdi>
            <Button
              loading={pending}
              onClick={async () => {
                setPending(true);
                setError('');
                try {
                  await logout();
                } catch (error) {
                  setError(error instanceof Error ? error.message : 'خروج انجام نشد.');
                } finally {
                  setPending(false);
                }
              }}
            >
              خروج از مدیریت
            </Button>
          </div>
        </Layout.Header>
        <Layout.Content className="p-4 sm:p-6 lg:p-8 print:p-0">
          <div className="mx-auto max-w-[1400px] space-y-6 print:max-w-none print:space-y-0">
            {error && <Alert title={error} type="error" role="alert" className="print:!hidden" />}
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
