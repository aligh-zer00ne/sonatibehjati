import DesignCredit from './DesignCredit';
import { adminLanding } from '@behjati/shared/permissions';
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button, Alert } from 'antd';
import { useAdmin } from '../auth/AdminProvider';
import AdminIcon from './AdminIcon';
import AdminSearch from './AdminSearch';
import {
  AdminBottomNav,
  AdminSidebarNav,
  availableNavigation,
  navigationLinks,
  orderLinks,
} from './AdminNavigation';

export default function AdminFrame() {
  const { logout, admin } = useAdmin();
  const owner = admin?.role === 'OWNER';
  const navigation = availableNavigation(admin);
  const { pathname } = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const selected =
    [...navigationLinks.filter((item) => item.href !== '/admin'), ...orderLinks]
      .sort((a, b) => b.href.length - a.href.length)
      .find(({ href }) => pathname === href || pathname.startsWith(href + '/'))?.href ??
    (pathname.startsWith('/admin/sections/') ? pathname : '/admin');
  const pageLabel =
    [...navigationLinks, ...orderLinks].find((item) => item.href === selected)?.label ??
    navigation.groups.find((item) => selected === `/admin/sections/${item.id}`)?.label;
  const signOut = async () => {
    setPending(true);
    setError('');
    try {
      await logout();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خروج انجام نشد.');
    } finally {
      setPending(false);
    }
  };
  const brand = (
    <Link
      to={admin ? adminLanding(admin) : '/login'}
      aria-label="مدیریت سنتی بهجتی"
      className="flex min-w-0 items-center gap-3 !text-inherit"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white shadow-[0_2px_8px_#0f1b2d26]">
        <img src="/images/logo-brand.png" alt="سنتی بهجتی" className="h-9 w-auto object-contain" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[15px] font-extrabold">سنتی بهجتی اردکان</span>
        <span className="mt-0.5 block truncate text-[12.5px] font-medium opacity-70">
          پنل مدیریت فروشگاه
        </span>
      </span>
    </Link>
  );
  return (
    <div
      dir="rtl"
      className="min-h-dvh min-w-0 bg-[#f3f5f8] text-[#1f2833] min-[1100px]:grid min-[1100px]:grid-cols-[272px_minmax(0,1fr)]"
    >
      <aside
        data-admin-sidebar
        className="sticky top-0 hidden h-dvh flex-col bg-[#0f1b2d] text-white min-[1100px]:flex print:!hidden"
      >
        <div className="border-b border-white/10 px-5 py-5 text-white">{brand}</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 [scrollbar-color:#2a3b55_transparent] [scrollbar-width:thin]">
          <AdminSidebarNav navigation={navigation} selected={selected} />
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1d3557] text-[#7cc4cf]">
            <AdminIcon name="person" width={18} />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-[#dbe3ee]" dir="ltr">
              {admin?.email}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#7d8ca3]">
              {owner ? 'مدیر فروشگاه' : 'همکار'}
            </span>
          </span>
          <Button
            type="text"
            aria-label="خروج از مدیریت"
            title="خروج از مدیریت"
            loading={pending}
            onClick={signOut}
            icon={<AdminIcon name="logout" width={18} />}
            className="!size-9 !min-w-9 !rounded-lg !text-[#b8c4d4] hover:!bg-white/10 hover:!text-white"
          />
        </div>
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col">
        <header
          data-admin-topbar
          className="sticky top-0 z-30 border-b border-[#e1e6ed] bg-white/95 backdrop-blur print:!hidden"
        >
          <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 min-[1100px]:flex-nowrap min-[1100px]:py-3 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 text-[#1e3a5f] min-[1100px]:hidden">
              {brand}
            </div>
            <Button
              type="text"
              aria-label="خروج از مدیریت"
              title="خروج از مدیریت"
              loading={pending}
              onClick={signOut}
              icon={<AdminIcon name="logout" width={19} />}
              className="!size-10 !min-w-10 !rounded-xl !border !border-[#e1e6ed] !text-[#4b5767] min-[1100px]:!hidden"
            />
            <p className="hidden min-w-0 items-center gap-2 text-[13px] font-semibold text-[#6b7685] min-[1100px]:flex">
              <AdminIcon name="home" width={16} />
              مدیریت فروشگاه
              {pageLabel && (
                <>
                  <span className="text-[#a3adbb]">/</span>
                  <span className="truncate text-[#1e3a5f]">{pageLabel}</span>
                </>
              )}
            </p>
            <div className="w-full min-[1100px]:ms-auto min-[1100px]:max-w-xl">
              <AdminSearch />
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0 [&_.ant-btn]:motion-safe:transition-[translate,scale,box-shadow] [&_.ant-btn:active:not(:disabled)]:motion-safe:scale-[0.98] [&_.ant-input-affix-wrapper]:!bg-[#f3f5f8] [&_.ant-form-item-control-input_.ant-input]:!bg-[#f3f5f8] [&_.ant-checkbox-wrapper]:!leading-7">
          <div
            data-admin-page
            className="mx-auto flex min-w-0 max-w-[1560px] flex-col gap-5 sm:gap-6 [&>*]:min-w-0 [&_.ant-card]:!rounded-[20px] [&_.ant-card]:!bg-white [&_.ant-card]:!shadow-[0_1px_3px_#1e3a5f0d] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!font-medium [&_.ant-btn-primary]:!font-bold print:max-w-none print:gap-0"
          >
            {pageLabel && (
              <p className="-mb-1 flex items-center gap-2 text-[13px] font-semibold text-[#6b7685] min-[1100px]:hidden print:!hidden">
                <AdminIcon name="home" width={15} />
                مدیریت فروشگاه<span className="text-[#a3adbb]">/</span>
                <span className="truncate text-[#1e3a5f]">{pageLabel}</span>
              </p>
            )}
            {error && <Alert title={error} type="error" role="alert" className="print:!hidden" />}
            <div
              key={pathname}
              className="flex min-w-0 flex-col gap-5 motion-safe:animate-surface-enter sm:gap-6"
            >
              <Outlet />
            </div>
          </div>
        </main>
        <footer className="flex flex-col items-center justify-center gap-2 border-t border-[#e1e6ed] bg-white px-4 py-5 pb-24 text-xs text-[#6b7685] sm:px-6 min-[1100px]:pb-5 print:!hidden">
          <DesignCredit className="flex flex-wrap items-center justify-center gap-x-1.5 text-[13px] font-semibold text-[#4b5767] [&_a]:!font-extrabold [&_a]:!text-[#2c5282] [&_a]:underline-offset-4 hover:[&_a]:underline" />
          <span className="flex flex-wrap items-center justify-center gap-2 text-[12.5px]">
            پنل مدیریت سنتی بهجتی اردکان
            <span aria-hidden="true" className="size-1 rounded-full bg-[#9fb4cc]" />
            {owner ? 'دسترسی مدیر' : 'دسترسی همکار'}
          </span>
        </footer>
      </div>
      <AdminBottomNav navigation={navigation} selected={selected} />
    </div>
  );
}
