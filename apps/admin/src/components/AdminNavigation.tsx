import { Link } from 'react-router-dom';
import { canOpenAdminPath } from '@behjati/shared/permissions';
import type { AdminIdentityFieldsFragment } from '../generated/graphql';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import ActionCardLink from './ActionCardLink';
import { cardIconInteraction } from '../lib/card-interaction';

type Item = { href: string; label: string; icon: AdminIconName; description: string };
export const orderLinks: Item[] = [
  {
    href: '/admin/orders/website',
    label: 'سفارش‌های وبسایت',
    icon: 'orders',
    description: 'پیگیری خریدهای آنلاین، وضعیت ارسال و چاپ سفارش',
  },
  {
    href: '/admin/orders/manual',
    label: 'سایر سفارش‌ها',
    icon: 'receipt',
    description: 'ثبت فروش حضوری و اینستاگرام و فاکتورهای مستقل',
  },
];
export const navigationLinks: Item[] = [
  {
    href: '/admin/message-templates',
    label: 'قالب پیام‌ها',
    icon: 'message',
    description: 'متن آمادهٔ پرداخت و ارسال سفارش، با مشخصات واقعی مشتری',
  },
  { href: '/admin', label: 'داشبورد', icon: 'home', description: 'نمای کلی عملکرد فروشگاه' },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: 'orders', description: '' },
  {
    href: '/admin/settlements',
    label: 'دریافت و پرداخت',
    icon: 'wallet',
    description: 'ثبت وجه نقد، چک و کارت‌خوان و بررسی مانده حساب',
  },
  {
    href: '/admin/store-information',
    label: 'اطلاعات فروشگاه',
    icon: 'home',
    description: 'نام، تلفن، نشانی و کد پستی فرستنده روی لیبل‌ها',
  },
  {
    href: '/admin/shipping',
    label: 'مدیریت ارسال',
    icon: 'truck',
    description: 'تعرفهٔ کل بسته، روش‌های ارسال و شرط ارسال رایگان',
  },
  {
    href: '/admin/products',
    label: 'محصولات',
    icon: 'products',
    description: 'مدیریت کالا، قیمت، موجودی و وزن بسته',
  },
  {
    href: '/admin/products/prices',
    label: 'اعلامیه قیمت',
    icon: 'discount',
    description: 'تغییر سریع قیمت همهٔ محصولات در یک صفحه',
  },
  {
    href: '/admin/users',
    label: 'مشتریان',
    icon: 'users',
    description: 'پرونده مشتریان، اطلاعات تماس و وضعیت حساب',
  },
  {
    href: '/admin/orders/map',
    label: 'نقشه سفارش‌ها',
    icon: 'map',
    description: 'مشاهده موقعیت مقصد سفارش‌ها روی نقشه',
  },
  {
    href: '/admin/reports',
    label: 'گزارش‌ها',
    icon: 'reports',
    description: 'تحلیل فروش و دریافت‌ها و خروجی گزارش',
  },
  {
    href: '/admin/coupons',
    label: 'کدهای تخفیف',
    icon: 'discount',
    description: 'تعریف کد تخفیف و مدیریت شرایط استفاده',
  },
  {
    href: '/admin/tickets',
    label: 'پشتیبانی و تیکت‌ها',
    icon: 'support',
    description: 'بررسی درخواست‌ها و پاسخ به مشتریان',
  },
  {
    href: '/admin/reviews',
    label: 'نظرات محصولات',
    icon: 'review',
    description: 'بررسی و مدیریت دیدگاه‌های ثبت‌شده',
  },
  {
    href: '/admin/announcement',
    label: 'نوار اطلاع‌رسانی سایت',
    icon: 'review',
    description: 'ویرایش پیام مناسبت‌ها و جشنواره‌های فروشگاه',
  },
  {
    href: '/admin/payment-test',
    label: 'تست درگاه پرداخت',
    icon: 'shield',
    description: 'ابزار بررسی اتصال درگاه برای مدیر مجاز',
  },
  {
    href: '/admin/accounts',
    label: 'کاربران پنل',
    icon: 'shield',
    description: 'تعریف همکار و تعیین دسترسی به بخش‌های مدیریت',
  },
  {
    href: '/admin/settings',
    label: 'تنظیمات حساب',
    icon: 'settings',
    description: 'اطلاعات حساب مدیریتی و تغییر رمز ورود',
  },
];
const definitions: Array<{
  id: string;
  label: string;
  shortLabel: string;
  icon: AdminIconName;
  paths: string[];
}> = [
  {
    id: 'sales',
    label: 'فروش و مشتریان',
    shortLabel: 'فروش و مشتریان',
    icon: 'orders',
    paths: [
      '/admin/orders',
      '/admin/settlements',
      '/admin/users',
      '/admin/reports',
      '/admin/orders/map',
    ],
  },
  {
    id: 'catalog',
    label: 'محصولات و تخفیف‌ها',
    shortLabel: 'محصولات',
    icon: 'products',
    paths: ['/admin/products', '/admin/products/prices', '/admin/coupons'],
  },
  {
    id: 'communication',
    label: 'ارتباط با مشتری',
    shortLabel: 'ارتباط با مشتری',
    icon: 'support',
    paths: ['/admin/tickets', '/admin/reviews'],
  },
  {
    id: 'settings',
    label: 'تنظیمات مدیریت',
    shortLabel: 'مدیریت',
    icon: 'settings',
    paths: [
      '/admin/message-templates',
      '/admin/store-information',
      '/admin/shipping',
      '/admin/announcement',
      '/admin/accounts',
      '/admin/settings',
      '/admin/payment-test',
    ],
  },
];
export function availableNavigation(admin: AdminIdentityFieldsFragment | null) {
  const visible = navigationLinks.filter(
    (link) =>
      admin &&
      canOpenAdminPath(admin, link.href) &&
      (link.href !== '/admin/payment-test' || admin.gatewayTestEnabled === true),
  );
  return {
    dashboard: visible.find((item) => item.href === '/admin'),
    groups: definitions
      .map((group) => ({
        ...group,
        items: group.paths.flatMap((path) => visible.filter((item) => item.href === path)),
      }))
      .filter((group) => group.items.length),
  };
}
type Navigation = ReturnType<typeof availableNavigation>;
type Group = Navigation['groups'][number];
/** Group containing the current page (section page, item page or an order sub-page). */
export function currentGroupId(navigation: Navigation, selected: string) {
  return navigation.groups.find(
    (group) =>
      selected === `/admin/sections/${group.id}` ||
      group.items.some(
        (item) =>
          item.href === selected ||
          (item.href === '/admin/orders' && orderLinks.some((child) => child.href === selected)),
      ),
  )?.id;
}
const bottomLabels: Record<string, string> = {
  sales: 'فروش',
  catalog: 'محصولات',
  communication: 'ارتباط',
  settings: 'مدیریت',
};
/** Desktop sidebar: dashboard, then each permitted group with its pages. */
export function AdminSidebarNav({
  navigation,
  selected,
}: {
  navigation: Navigation;
  selected: string;
}) {
  const active = currentGroupId(navigation, selected);
  const linkClass = (current: boolean) =>
    `group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-[14px] leading-6 transition-colors motion-reduce:transition-none ${
      current
        ? 'bg-[#1d3557] font-bold !text-white before:absolute before:inset-y-2 before:start-0 before:w-[3px] before:rounded-full before:bg-[#7cc4cf]'
        : 'font-medium !text-[#b8c4d4] '
    }`;
  return (
    <nav id="admin-sidebar-navigation" aria-label="منوی مدیریت" className="flex flex-col gap-5">
      {navigation.dashboard && (
        <Link
          to="/admin"
          aria-current={selected === '/admin' ? 'page' : undefined}
          className={linkClass(selected === '/admin')}
        >
          <AdminIcon name="home" width={19} className="shrink-0 opacity-90" />
          داشبورد
        </Link>
      )}
      {navigation.groups.map((group) => (
        <div key={group.id} role="group" aria-labelledby={`nav-group-${group.id}`}>
          <Link
            id={`nav-group-${group.id}`}
            to={`/admin/sections/${group.id}`}
            aria-current={selected === `/admin/sections/${group.id}` ? 'page' : undefined}
            title={`نمای کلی ${group.label}`}
            className={`mb-1.5 flex items-center justify-between gap-2 rounded-md px-3 py-1 text-[12.5px] font-bold tracking-tight transition-colors ${
              active === group.id ? '!text-[#7cc4cf]' : '!text-[#7d8ca3] '
            }`}
          >
            {group.label}
            <AdminIcon name={group.icon} width={15} className="shrink-0 opacity-70" />
          </Link>
          <ul className="flex flex-col gap-0.5">
            {group.items.flatMap((item) =>
              (item.href === '/admin/orders' ? orderLinks : [item]).map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    aria-current={selected === link.href ? 'page' : undefined}
                    className={linkClass(selected === link.href)}
                  >
                    <AdminIcon name={link.icon} width={18} className="shrink-0 opacity-90" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}
/** Mobile/tablet bottom bar: the same top-level destinations as the desktop groups. */
export function AdminBottomNav({
  navigation,
  selected,
}: {
  navigation: Navigation;
  selected: string;
}) {
  const active = currentGroupId(navigation, selected);
  const items = [
    ...(navigation.dashboard
      ? [{ id: 'dashboard', href: '/admin', label: 'داشبورد', icon: 'home' as AdminIconName }]
      : []),
    ...navigation.groups.map((group) => ({
      id: group.id,
      href: `/admin/sections/${group.id}`,
      label: bottomLabels[group.id] ?? group.shortLabel,
      icon: group.icon,
    })),
  ];
  return (
    <nav
      id="admin-bottom-navigation"
      aria-label="منوی اصلی مدیریت"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe5ec] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_#1e3a5f0f] backdrop-blur min-[1100px]:hidden print:!hidden"
    >
      <ul
        className="mx-auto grid h-16 max-w-2xl"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const current = item.id === 'dashboard' ? selected === '/admin' : active === item.id;
          return (
            <li key={item.id} className="min-w-0">
              <Link
                to={item.href}
                aria-current={current ? 'page' : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[12px] leading-4 font-semibold transition-colors ${
                  current ? '!text-[#2c5282]' : '!text-[#6b7685] '
                }`}
              >
                <span
                  className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
                    current ? 'bg-[#e3ecf6]' : ''
                  }`}
                >
                  <AdminIcon name={item.icon} width={20} />
                </span>
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
function NavigationCard({ item, onNavigate }: { item: Item; onNavigate: () => void }) {
  return (
    <ActionCardLink
      to={item.href}
      aria-label={item.label}
      onClick={onNavigate}
      data-admin-navigation-card
      className="flex min-h-[188px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#d7dce2] !bg-white p-5 !text-[#202832] shadow-[0_5px_18px_#35465c0c] sm:p-5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-l from-[#2c5282] to-[#6faeb7]"
      />
      <span
        data-card-icon
        className={`${cardIconInteraction} mb-2.5 grid size-12 shrink-0 place-items-center rounded-[18px] border border-[#9dc5cc] bg-[linear-gradient(135deg,#a7d4db,#528b93)] text-[#1e3a5f] shadow-[0_6px_14px_#58868d40]`}
      >
        <AdminIcon name={item.icon} width={27} height={27} />
      </span>
      <h2 className="text-lg leading-8 font-extrabold">{item.label}</h2>
      <p className="mt-1 mb-3 text-[15px] leading-7 text-[#586474]">{item.description}</p>
      <span className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-[#d7dce2] pt-3 text-[13px] font-semibold text-[#566d8a]">
        <span>ورود به بخش</span>
        <AdminIcon name="arrow" width={18} className="motion-safe:transition-transform " />
      </span>
    </ActionCardLink>
  );
}
export function AdminNavigationCards({
  group,
  onNavigate,
}: {
  group: Group;
  onNavigate: () => void;
}) {
  return (
    <nav
      aria-label={`بخش‌های ${group.label}`}
      data-admin-submenu
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {group.items.map((item) =>
        item.href === '/admin/orders' ? (
          <div role="group" aria-label="سفارش‌ها" key={item.href} className="contents">
            {orderLinks.map((child) => (
              <NavigationCard key={child.href} item={child} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <NavigationCard key={item.href} item={item} onNavigate={onNavigate} />
        ),
      )}
    </nav>
  );
}
