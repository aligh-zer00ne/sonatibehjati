import AmbientBackdrop from './AmbientBackdrop';
import DesignCredit from './DesignCredit';
import { hasPermission, adminLanding } from '@behjati/shared/permissions';
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Drawer, Input, Select } from 'antd';
import { useAdmin } from '../auth/AdminProvider';
import AdminIcon from './AdminIcon';
import AdminSkyline from './AdminSkyline';
import {
  AdminNavigationTabs,
  availableNavigation,
  navigationLinks,
  orderLinks,
} from './AdminNavigation';

export default function AdminFrame() {
  const { logout, admin } = useAdmin();
  const owner = admin?.role === 'OWNER';
  const navigation = availableNavigation(admin);
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
  const [searchScope, setSearchScope] = useState('products');
  const activeSearch = searchOptions.some((option) => option.value === searchScope)
    ? searchScope
    : searchOptions[0]?.value;
  const selected =
    [...navigationLinks.slice(1), ...orderLinks]
      .sort((a, b) => b.href.length - a.href.length)
      .find(({ href }) => pathname === href || pathname.startsWith(href + '/'))?.href ??
    (pathname.startsWith('/admin/sections/') ? pathname : '/admin');
  const closeNavigation = () => setMenuOpen(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 1100px)');
    const change = () => {
      setMenuOpen(false);
    };
    desktop.addEventListener('change', change);
    return () => desktop.removeEventListener('change', change);
  }, []);
  return (
    <div dir="rtl" className="flex min-h-dvh min-w-0 flex-col bg-[#f6f1e9] text-[#34251e]">
      <header
        data-admin-topbar
        className="sticky top-0 z-30 isolate border-b border-[#b78343]/30 bg-[radial-gradient(ellipse_at_top_right,#762b49,transparent_65%),linear-gradient(120deg,#58132b,#250916)] px-4 py-4 text-[#fff5e1] shadow-[0_8px_24px_#42000920] sm:px-6 print:!hidden"
      >
        <AmbientBackdrop />
        <div className="relative z-10 mx-auto flex max-w-[1560px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 min-[1100px]:w-[210px] min-[1100px]:shrink-0">
            <Button
              type="text"
              className="!size-11 !shrink-0 !rounded-xl !border !border-white/20 !bg-white/5 !text-[#fff5e1] min-[1100px]:!hidden"
              aria-label="باز کردن منوی مدیریت"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-navigation"
              onClick={() => {
                setMenuOpen(true);
              }}
              icon={<AdminIcon name="menu" />}
            />
            <Link
              to={admin ? adminLanding(admin) : '/login'}
              aria-label="مدیریت سنتی بهجتی"
              className="flex min-w-0 items-center gap-3 !text-[#fff5e1]"
            >
              <span className="hidden size-14 shrink-0 place-items-center rounded-2xl border border-[#edc57d]/50 bg-white shadow-[0_4px_16px_#28050230] min-[380px]:grid">
                <img
                  src="/images/logo-brand.png"
                  alt="سنتی بهجتی"
                  className="h-12 w-auto object-contain"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-sm leading-7 font-extrabold sm:text-base">
                  سنتی بهجتی اردکان
                </span>
                <span className="block text-[11px] leading-6 text-[#f2d6a2]">
                  پنل مدیریت فروشگاه
                </span>
              </span>
            </Link>
          </div>
          <div className="hidden min-w-0 min-[1100px]:block">
            <AdminNavigationTabs
              navigation={navigation}
              selected={selected}
              onNavigate={closeNavigation}
            />
          </div>
          <Button
            aria-label="خروج از مدیریت"
            title="خروج از مدیریت"
            loading={pending}
            className="!size-11 !shrink-0 !rounded-xl !border-white/20 !bg-white/5 !text-[#fff5e1] hover:!bg-white/15"
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
          />
        </div>
      </header>
      <Drawer
        title="منوی مدیریت"
        placement="right"
        size={360}
        open={menuOpen}
        onClose={closeNavigation}
        classNames={{
          root: 'print:!hidden',
          wrapper: '!max-w-[calc(100vw-16px)]',
          body: '!flex !flex-col !gap-4 !bg-[#fffdf9] !p-4',
        }}
      >
        <AdminNavigationTabs
          navigation={navigation}
          selected={selected}
          onNavigate={closeNavigation}
          mobile
        />
        <div
          data-admin-mobile-brand
          className="pointer-events-none relative mt-auto min-h-36 shrink-0"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-9 h-24 opacity-60 [&_svg]:h-full [&_svg]:text-[#b78343]"
          >
            <AdminSkyline />
          </div>
          <p className="absolute inset-x-0 bottom-0 py-2 text-center text-[13px] font-semibold text-[#966b29]">
            طعم اصالت، از دل کویر
          </p>
        </div>
      </Drawer>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
        <div
          data-admin-page
          className="mx-auto flex min-w-0 max-w-[1560px] flex-col gap-5 sm:gap-6 [&>*]:min-w-0 [&_.ant-card]:!rounded-[24px] [&_.ant-card]:!bg-white [&_.ant-card]:!shadow-[0_6px_22px_#62452f08] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!font-medium [&_.ant-btn-primary]:!font-bold print:max-w-none print:gap-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 print:!hidden">
            <p className="flex items-center gap-2 text-xs font-semibold text-[#796653]">
              <AdminIcon name="home" width={16} />
              مدیریت فروشگاه<span className="text-[#b7a48e]">/</span>
              <span className="text-[#58132b]">
                {[...navigationLinks, ...orderLinks].find((item) => item.href === selected)
                  ?.label ??
                  navigation.groups.find((item) => selected === `/admin/sections/${item.id}`)
                    ?.label}
              </span>
            </p>
            {activeSearch && (
              <div className="flex w-full gap-2 min-[640px]:max-w-md">
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
          </div>
          {error && <Alert title={error} type="error" role="alert" className="print:!hidden" />}
          <div
            key={pathname}
            className="flex min-w-0 flex-col gap-5 motion-safe:animate-surface-enter sm:gap-6"
          >
            <Outlet />
          </div>
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
  );
}
