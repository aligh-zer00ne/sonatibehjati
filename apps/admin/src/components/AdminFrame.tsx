import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Drawer, Input, Select, Tooltip } from 'antd';
import { useAdmin } from '../auth/AdminProvider';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import AdminSkyline from './AdminSkyline';
const links: Array<{ href: string; label: string; icon: AdminIconName }> = [
  { href: '/admin', label: 'داشبورد', icon: 'home' },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: 'orders' },
  { href: '/admin/products', label: 'محصولات', icon: 'products' },
  { href: '/admin/users', label: 'مشتریان', icon: 'users' },
  { href: '/admin/promotions', label: 'تخفیف‌ها و جشنواره‌ها', icon: 'discount' },
  { href: '/admin/orders/map', label: 'نقشه سفارش‌ها', icon: 'map' },
  { href: '/admin/reports', label: 'گزارش‌ها', icon: 'reports' },
  { href: '/admin/settings', label: 'تنظیمات حساب', icon: 'settings' },
];
export default function AdminFrame() {
  const { admin, logout } = useAdmin();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchScope, setSearchScope] = useState('products');
  const selected = pathname.startsWith('/admin/orders/map')
    ? '/admin/orders/map'
    : (links.slice(1).find(({ href }) => pathname.startsWith(href))?.href ?? '/admin');
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  const navigation = (compact = false) => (
    <nav aria-label="منوی مدیریت" className="relative z-10 space-y-1.5 px-3">
      {links.map(({ href, label, icon }) => (
        <Tooltip key={href} title={compact ? label : undefined} placement="left">
          <Link
            to={href}
            aria-label={label}
            aria-current={selected === href ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
            className={`flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-[13px] !text-[#fff7eb] transition-colors hover:bg-white/10 ${compact ? 'justify-center' : ''} ${selected === href ? 'bg-white/20 font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : ''}`}
          >
            <AdminIcon name={icon} className="shrink-0" />
            {!compact && <span>{label}</span>}
          </Link>
        </Tooltip>
      ))}
    </nav>
  );
  return (
    <div dir="rtl" className="flex min-h-dvh bg-[#f6f1e9] text-[#34251e]">
      <aside
        data-admin-sidebar
        className={`sticky top-0 hidden h-dvh shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,#8f1425_0%,#660311_55%,#420009_100%)] shadow-[-6px_0_24px_rgba(74,8,15,0.08)] transition-[width] duration-300 motion-reduce:transition-none min-[992px]:flex min-[992px]:flex-col print:!hidden ${collapsed ? 'w-20' : 'w-[204px] xl:w-[220px]'}`}
      >
        <div className="relative z-10 flex min-h-[110px] items-center justify-center gap-4 px-3">
          <Link to="/admin" aria-label="مدیریت سنتی بهجتی">
            <img
              src="/images/logo-footer.svg"
              alt="سنتی بهجتی"
              className={collapsed ? 'h-16 w-12 object-contain' : 'h-[92px] w-20 object-contain'}
            />
          </Link>
          {!collapsed && (
            <Button
              type="text"
              aria-label="جمع کردن منوی مدیریت"
              onClick={() => setCollapsed(true)}
              className="!text-[#fff7eb]"
              icon={<AdminIcon name="menu" />}
            />
          )}
        </div>
        {collapsed && (
          <Button
            type="text"
            className="mx-auto mb-3 !text-white"
            aria-label="باز کردن منوی کناری"
            onClick={() => setCollapsed(false)}
            icon={<AdminIcon name="menu" />}
          />
        )}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-4">
          {navigation(collapsed)}
        </div>
        <div className="relative h-48 shrink-0 opacity-65">
          <AdminSkyline />
        </div>
        {!collapsed && (
          <p className="relative z-10 px-3 pb-5 text-center text-xs text-[#e5bb71]">
            طعم اصالت، از دل کویر
          </p>
        )}
      </aside>
      <Drawer
        title="منوی مدیریت"
        placement="right"
        size={280}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        classNames={{ root: 'print:!hidden', body: '!bg-[#660311] !px-0 !py-4' }}
      >
        <div id="admin-mobile-navigation">{navigation()}</div>
      </Drawer>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[82px] flex-wrap items-center justify-between gap-3 border-b border-[#e8ded1] bg-[#fffdf9]/85 px-4 py-3 sm:px-6 print:!hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="text"
              className="shrink-0 min-[992px]:!hidden"
              aria-label="باز کردن منوی مدیریت"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-navigation"
              onClick={() => setMenuOpen(true)}
              icon={<AdminIcon name="menu" />}
            />
            <div>
              <p className="text-sm font-bold text-[#810c20] sm:text-lg">
                فروشگاه اینترنتی سنتی بهجتی
              </p>
              <p className="mt-0.5 text-[11px] text-[#7d746a]">مدیریت فرآورده‌های کنجدی اردکان</p>
            </div>
          </div>
          <div className="order-3 flex w-full gap-2 min-[1200px]:order-none min-[1200px]:max-w-md">
            <Select
              aria-label="محدوده جستجوی مدیریت"
              value={searchScope}
              onChange={setSearchScope}
              className="w-28 shrink-0"
              options={[
                { value: 'products', label: 'محصولات' },
                { value: 'orders', label: 'سفارش‌ها' },
                { value: 'users', label: 'مشتریان' },
              ]}
            />
            <Input.Search
              aria-label="جستجوی پنل مدیریت"
              placeholder="نام، شماره سفارش یا موبایل…"
              maxLength={100}
              allowClear
              onSearch={(value) =>
                navigate(
                  `/admin/${searchScope}${value.trim() ? '?search=' + encodeURIComponent(value.trim()) : ''}`,
                )
              }
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold">مدیر فروشگاه</p>
              <bdi className="block max-w-40 truncate text-[10px] text-[#7d746a]">
                {admin?.email}
              </bdi>
            </div>
            <Button
              aria-label="خروج از مدیریت"
              loading={pending}
              icon={<AdminIcon name="logout" />}
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
              <span className="hidden sm:inline">خروج از مدیریت</span>
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 print:p-0">
          <div className="mx-auto max-w-[1560px] space-y-5 print:max-w-none print:space-y-0">
            {error && <Alert title={error} type="error" role="alert" className="print:!hidden" />}
            <Outlet />
          </div>
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8ded1] bg-[#fffdf9]/70 px-6 py-3 text-[10px] text-[#7d746a] print:!hidden">
          <span>پنل مدیریت سنتی بهجتی اردکان</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#17977e]" />
            دسترسی مدیر احراز هویت شده
          </span>
        </footer>
      </div>
    </div>
  );
}
