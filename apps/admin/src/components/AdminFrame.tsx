import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Alert, Typography, Drawer } from 'antd';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = pathname.startsWith('/admin/orders/map')
    ? '/admin/orders/map'
    : (links.slice(1).find(([href]) => pathname.startsWith(href))?.[0] ?? '/admin');
  return (
    <Layout className="min-h-dvh">
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        onBreakpoint={() => setMenuOpen(false)}
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
      <Drawer
        title="منوی مدیریت"
        placement="right"
        size={280}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        classNames={{ root: 'print:!hidden', body: '!p-0' }}
      >
        <Menu
          id="admin-mobile-navigation"
          mode="inline"
          selectedKeys={[selected]}
          onClick={() => setMenuOpen(false)}
          items={links.map(([href, label]) => ({
            key: href,
            label: <Link to={href}>{label}</Link>,
          }))}
        />
      </Drawer>
      <Layout className="min-w-0">
        <Layout.Header className="flex !h-auto min-h-20 flex-wrap items-center justify-between gap-3 !bg-white !px-5 !py-3 !leading-normal print:!hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="text"
              className="shrink-0 min-[992px]:!hidden"
              aria-label="باز کردن منوی مدیریت"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-navigation"
              onClick={() => setMenuOpen(true)}
              icon={
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <Typography.Text strong>{BRAND_NAME}</Typography.Text>
          </div>
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
