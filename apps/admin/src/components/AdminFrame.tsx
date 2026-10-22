import DesignCredit from './DesignCredit';
import { canOpenAdminPath, hasPermission, adminLanding } from '@behjati/shared/permissions';
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Drawer, Input, Select, Tooltip, Dropdown } from 'antd';
import { useAdmin } from '../auth/AdminProvider';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import AdminSkyline from './AdminSkyline';
const links: Array<{ href: string; label: string; icon: AdminIconName }> = [
  { href: '/admin', label: 'داشبورد', icon: 'home' },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: 'orders' },
  { href: '/admin/settlements', label: 'دریافت و پرداخت', icon: 'wallet' },
  { href: '/admin/products', label: 'محصولات', icon: 'products' },
  { href: '/admin/users', label: 'مشتریان', icon: 'users' },
  { href: '/admin/orders/map', label: 'نقشه سفارش‌ها', icon: 'map' },
  { href: '/admin/reports', label: 'گزارش‌ها', icon: 'reports' },
  { href: '/admin/coupons', label: 'کدهای تخفیف', icon: 'discount' },
  { href: '/admin/tickets', label: 'پشتیبانی و تیکت‌ها', icon: 'support' },
  { href: '/admin/reviews', label: 'نظرات محصولات', icon: 'review' },
  { href: '/admin/announcement', label: 'نوار اطلاع‌رسانی سایت', icon: 'review' },
  { href: '/admin/payment-test', label: 'تست درگاه پرداخت', icon: 'shield' },
  { href: '/admin/accounts', label: 'کاربران پنل', icon: 'shield' },
  { href: '/admin/settings', label: 'تنظیمات حساب', icon: 'settings' },
];
const orderLinks: typeof links = [
  { href: '/admin/orders/website', label: 'سفارش‌های وبسایت', icon: 'orders' },
  { href: '/admin/orders/manual', label: 'سایر سفارش‌ها', icon: 'orders' },
];
export default function AdminFrame() {
  const { logout, admin } = useAdmin();
  const owner = admin?.role === 'OWNER';
  const visibleLinks = links.filter(
    (link) =>
      admin &&
      canOpenAdminPath(admin, link.href) &&
      (link.href !== '/admin/payment-test' || admin.gatewayTestEnabled === true),
  );
  const searchOptions = [
    { value: 'products', label: 'محصولات', permission: 'PRODUCTS' },
    { value: 'orders', label: 'سفارش‌ها', permission: 'ORDERS' },
    { value: 'users', label: 'مشتریان', permission: 'CUSTOMERS' },
  ].filter((option) =>
    hasPermission(admin, option.permission as 'PRODUCTS' | 'ORDERS' | 'CUSTOMERS'),
  );
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchScope, setSearchScope] = useState('products');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const activeSearch = searchOptions.some((option) => option.value === searchScope)
    ? searchScope
    : searchOptions[0]?.value;
  const selected =
    [...links.slice(1), ...orderLinks]
      .sort((a, b) => b.href.length - a.href.length)
      .find(({ href }) => pathname === href || pathname.startsWith(href + '/'))?.href ?? '/admin';
  const ordersActive =
    selected === '/admin/orders' || orderLinks.some((link) => link.href === selected);
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroups({});
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 992px)');
    const closeDrawer = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeDrawer);
    return () => desktop.removeEventListener('change', closeDrawer);
  }, []);
  const groups: Array<{ id: string; label: string; icon: AdminIconName; paths: string[] }> = [
    {
      id: 'sales',
      label: 'فروش و مشتریان',
      icon: 'orders',
      paths: [
        '/admin/orders',
        '/admin/settlements',
        '/admin/orders/map',
        '/admin/users',
        '/admin/reports',
      ],
    },
    {
      id: 'catalog',
      label: 'محصولات و تخفیف‌ها',
      icon: 'products',
      paths: ['/admin/products', '/admin/coupons'],
    },
    {
      id: 'communication',
      label: 'ارتباط با مشتری',
      icon: 'support',
      paths: ['/admin/tickets', '/admin/reviews'],
    },
    {
      id: 'settings',
      label: 'تنظیمات مدیریت',
      icon: 'settings',
      paths: ['/admin/announcement', '/admin/accounts', '/admin/settings', '/admin/payment-test'],
    },
  ];
  const navLink = ({ href, label, icon }: (typeof links)[number], nested = false) => (
    <Link
      key={href}
      to={href}
      aria-label={label}
      aria-current={selected === href ? 'page' : undefined}
      onClick={() => setMenuOpen(false)}
      className={`flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium !text-[#fff7eb] transition-colors hover:!bg-[#ad5360] focus-visible:!bg-[#ad5360] ${nested ? 'ms-3 border-s border-[#d8b97b]/30' : ''} ${selected === href ? '!bg-[#b16b66] font-bold' : ''}`}
    >
      <AdminIcon
        name={icon}
        width={nested ? 18 : 22}
        height={nested ? 18 : 22}
        className="shrink-0"
      />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
  const navigation = (compact = false, desktop = false) => (
    <nav
      id={desktop ? 'admin-desktop-navigation' : undefined}
      aria-label="منوی مدیریت"
      className="relative z-10 space-y-1.5 px-3"
    >
      {visibleLinks
        .filter((link) => link.href === '/admin')
        .map((link) =>
          compact ? (
            <Tooltip key={link.href} title={link.label} placement="left">
              <Link
                to={link.href}
                aria-label={link.label}
                className="flex min-h-11 items-center justify-center rounded-lg !text-[#fff7eb] hover:!bg-[#ad5360]"
              >
                <AdminIcon name={link.icon} />
              </Link>
            </Tooltip>
          ) : (
            navLink(link)
          ),
        )}
      {groups.map((group) => {
        const children = group.paths.flatMap((path) =>
          visibleLinks.filter((link) => link.href === path),
        );
        if (!children.length) return null;
        const active = children.some(
          (link) => link.href === selected || (link.href === '/admin/orders' && ordersActive),
        );
        const open = openGroups[group.id] ?? active;
        const id = `admin-${desktop ? 'desktop' : 'mobile'}-${group.id}`;
        if (compact)
          return (
            <Dropdown
              key={group.id}
              trigger={['click']}
              placement="bottomLeft"
              menu={{
                items: children.map((link) => ({
                  key: link.href,
                  label:
                    link.href === '/admin/orders' ? (
                      link.label
                    ) : (
                      <Link to={link.href} onClick={() => setMenuOpen(false)}>
                        {link.label}
                      </Link>
                    ),
                  icon: <AdminIcon name={link.icon} width={18} height={18} />,
                  ...(link.href === '/admin/orders'
                    ? {
                        children: orderLinks.map((child) => ({
                          key: child.href,
                          label: <Link to={child.href}>{child.label}</Link>,
                          icon: <AdminIcon name={child.icon} width={18} height={18} />,
                        })),
                      }
                    : {}),
                })),
                selectedKeys: [selected],
              }}
            >
              <button
                type="button"
                aria-label={group.label}
                aria-haspopup="menu"
                className={`flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg text-[#fff7eb] hover:bg-[#ad5360] ${active ? 'bg-[#b16b66]' : ''}`}
              >
                <AdminIcon name={group.icon} />
              </button>
            </Dropdown>
          );
        return (
          <div key={group.id}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={id}
              onClick={() =>
                setOpenGroups(
                  Object.fromEntries(
                    groups.map((value) => [value.id, value.id === group.id && !open]),
                  ),
                )
              }
              className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-[#fff7eb] hover:bg-[#ad5360] ${active ? 'bg-[#a34a55]/40' : ''}`}
            >
              <AdminIcon name={group.icon} className="shrink-0" />
              <span className="min-w-0 flex-1 text-start whitespace-nowrap">{group.label}</span>
              <AdminIcon
                name="chevron"
                width={16}
                height={16}
                className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            <div id={id} hidden={!open} className="mt-1 space-y-0.5">
              {children.map((link) => {
                if (link.href !== '/admin/orders') return navLink(link, true);
                const ordersOpen = openGroups.orders ?? ordersActive;
                const ordersId = `${id}-orders`;
                return (
                  <div key={link.href}>
                    <button
                      type="button"
                      aria-label="سفارش‌ها"
                      aria-expanded={ordersOpen}
                      aria-controls={ordersId}
                      onClick={() => setOpenGroups((value) => ({ ...value, orders: !ordersOpen }))}
                      className={`ms-3 flex min-h-11 w-[calc(100%-12px)] cursor-pointer items-center gap-2.5 rounded-lg border-s border-[#d8b97b]/30 px-3 py-2 text-[13px] font-semibold text-[#fff7eb] hover:bg-[#ad5360] ${ordersActive ? 'bg-[#a34a55]/40' : ''}`}
                    >
                      <AdminIcon name="orders" width={18} height={18} className="shrink-0" />
                      <span className="min-w-0 flex-1 text-start">سفارش‌ها</span>
                      <AdminIcon
                        name="chevron"
                        width={16}
                        height={16}
                        className={`shrink-0 transition-transform ${ordersOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div id={ordersId} hidden={!ordersOpen} className="ms-3 mt-1 space-y-0.5">
                      {orderLinks.map((child) => navLink(child, true))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div dir="rtl" className="flex min-h-dvh bg-[#f6f1e9] text-[#34251e]">
      <aside
        data-admin-sidebar
        className={`relative isolate hidden min-h-dvh shrink-0 self-start bg-[radial-gradient(ellipse_at_bottom_left,#8f1425_0%,#660311_55%,#420009_100%)] shadow-[-6px_0_24px_rgba(74,8,15,0.08)] transition-[width] duration-300 motion-reduce:transition-none min-[992px]:flex min-[992px]:flex-col [@media(min-height:700px)]:sticky [@media(min-height:700px)]:top-0 print:!hidden ${collapsed ? 'w-20' : 'w-[248px] xl:w-[264px]'}`}
      >
        <div className="relative z-10 flex h-20 shrink-0 items-center justify-center px-3 [@media(max-height:799px)]:h-[72px]">
          <Link to={admin ? adminLanding(admin) : '/login'} aria-label="مدیریت سنتی بهجتی">
            <img
              src="/images/logo-footer.svg"
              alt="سنتی بهجتی"
              className="h-16 w-12 object-contain"
            />
          </Link>
        </div>
        <div className="relative z-10 flex-1 py-2">{navigation(collapsed, true)}</div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 overflow-hidden opacity-40"
          aria-hidden="true"
        >
          <AdminSkyline />
        </div>
        {!collapsed && (
          <p className="relative z-10 shrink-0 px-3 py-3 text-center text-xs text-[#e5bb71]">
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
        classNames={{
          root: 'print:!hidden',
          body: '!flex !flex-col !bg-[#660311] !px-0 !py-4 [--admin-scrollbar-track:#4f0915] [--admin-scrollbar-thumb:#d8b97b] [--admin-scrollbar-hover:#f2d4a0]',
        }}
      >
        <div id="admin-mobile-navigation" className="flex min-h-full flex-1 flex-col">
          {navigation()}
          <div
            data-admin-mobile-brand
            className="pointer-events-none relative mt-auto h-36 shrink-0"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-4 bottom-9 h-24 opacity-75 [&_svg]:h-full"
            >
              <AdminSkyline />
            </div>
            <p className="absolute inset-x-0 bottom-0 px-3 py-2 text-center text-[13px] font-medium text-[#e5bb71]">
              طعم اصالت، از دل کویر
            </p>
          </div>
        </div>
      </Drawer>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[82px] flex-wrap items-center justify-between gap-3 border-b border-[#e8ded1] bg-[#fffdf9]/85 px-4 py-3 sm:px-6 lg:px-8 print:!hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Tooltip
              title={collapsed ? 'باز کردن منوی کناری' : 'جمع کردن منوی مدیریت'}
              placement="bottom"
            >
              <Button
                data-admin-menu-toggle
                type="text"
                className="!hidden !size-11 shrink-0 !rounded-xl !border !border-[#e8ded1] !bg-[#fffaf2] !text-[#810c20] min-[992px]:!inline-flex"
                aria-label={collapsed ? 'باز کردن منوی کناری' : 'جمع کردن منوی مدیریت'}
                aria-expanded={!collapsed}
                aria-controls="admin-desktop-navigation"
                onClick={() => setCollapsed((value) => !value)}
                icon={<AdminIcon name="menu" />}
              />
            </Tooltip>
            <Button
              type="text"
              className="!size-11 shrink-0 min-[992px]:!hidden"
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
              <p className="mt-0.5 text-[12px] text-[#7d746a]">مدیریت فرآورده‌های کنجدی اردکان</p>
            </div>
          </div>
          {activeSearch && (
            <div className="order-3 flex w-full gap-2 min-[1200px]:order-none min-[1200px]:max-w-md">
              <Select
                aria-label="محدوده جستجوی مدیریت"
                value={activeSearch}
                onChange={setSearchScope}
                className="w-28 shrink-0"
                options={searchOptions}
              />
              <Input.Search
                aria-label="جستجوی پنل مدیریت"
                placeholder="نام، شماره سفارش یا موبایل…"
                maxLength={100}
                allowClear
                onSearch={(value) =>
                  navigate(
                    `/admin/${activeSearch}${value.trim() ? '?search=' + encodeURIComponent(value.trim()) : ''}`,
                  )
                }
              />
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
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
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
          <div
            data-admin-page
            className="mx-auto flex min-w-0 max-w-[1560px] flex-col gap-5 sm:gap-6 [&>*]:min-w-0 print:max-w-none print:gap-0"
          >
            {error && <Alert title={error} type="error" role="alert" className="print:!hidden" />}
            <Outlet />
          </div>
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8ded1] bg-[#fffdf9]/70 px-4 py-3 text-[12px] text-[#7d746a] sm:px-6 lg:px-8 print:!hidden">
          <div>
            <span>پنل مدیریت سنتی بهجتی اردکان</span>
            <DesignCredit className="mt-1 text-[12px] text-[#76685d]" />
          </div>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#17977e]" />
            {owner ? 'دسترسی مدیر' : 'دسترسی همکار'}
          </span>
        </footer>
      </div>
    </div>
  );
}
