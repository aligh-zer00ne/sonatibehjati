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
export function AdminNavigationTabs({
  navigation,
  selected,
  onNavigate,
  mobile = false,
}: {
  navigation: Navigation;
  selected: string;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  const current = navigation.groups.find(
    (group) =>
      selected === `/admin/sections/${group.id}` ||
      group.items.some(
        (item) =>
          item.href === selected ||
          (item.href === '/admin/orders' && orderLinks.some((child) => child.href === selected)),
      ),
  );
  const tabClass =
    'group flex min-h-[56px] shrink-0 items-center justify-center gap-2 rounded-full border border-transparent px-3 text-[14px] xl:min-h-[60px] xl:px-5 xl:text-[15px] font-bold transition-colors hover:border-[#edc57d]/40 motion-safe:transition-[translate,background-color,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transition-none';
  const activeClass =
    '!bg-[linear-gradient(135deg,#f6dfa0,#d3a23f)] !text-[#39270c] shadow-[0_4px_18px_#edc57d38,inset_0_1px_0_#fff8d7]';
  const inactiveClass = mobile
    ? '!bg-[#f4ebdd] !text-[#4e141c]'
    : '!bg-white/[0.05] !text-[#fff5e1] hover:!bg-white/15';
  return (
    <nav
      id={mobile ? 'admin-mobile-navigation' : 'admin-desktop-navigation'}
      aria-label="منوی مدیریت"
      className={
        mobile
          ? 'grid grid-cols-1 gap-2'
          : 'flex min-w-0 items-center justify-center gap-1 rounded-full border border-white/20 bg-white/[0.07] p-2 shadow-[inset_0_2px_0_#ffffff10,0_8px_24px_#28050226]'
      }
    >
      {navigation.dashboard && (
        <Link
          to="/admin"
          aria-label="داشبورد"
          aria-current={selected === '/admin' ? 'page' : undefined}
          onClick={onNavigate}
          className={`${tabClass} ${selected === '/admin' ? activeClass : inactiveClass}`}
        >
          <AdminIcon
            name="home"
            width={20}
            className="motion-safe:transition-transform motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110"
          />
          داشبورد
        </Link>
      )}
      {navigation.groups.map((group) => (
        <Link
          key={group.id}
          to={`/admin/sections/${group.id}`}
          aria-label={group.label}
          aria-current={current?.id === group.id ? 'location' : undefined}
          onClick={onNavigate}
          className={`${tabClass} ${current?.id === group.id ? activeClass : inactiveClass}`}
        >
          <AdminIcon
            name={group.icon}
            width={20}
            className="shrink-0 motion-safe:transition-transform motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110"
          />
          <span className="whitespace-nowrap">{group.shortLabel}</span>
        </Link>
      ))}
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
      className="flex min-h-[220px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#e8ded1] !bg-white p-5 !text-[#34251e] shadow-[0_5px_18px_#62452f0c] sm:min-h-[248px] sm:p-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-l from-[#701e2a] to-[#dfb65c]"
      />
      <span
        data-card-icon
        className={`${cardIconInteraction} mb-4 grid size-14 shrink-0 place-items-center rounded-[18px] border border-[#e7ce96] bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c] shadow-[0_6px_14px_#b7834340]`}
      >
        <AdminIcon name={item.icon} width={27} height={27} />
      </span>
      <h2 className="text-lg leading-8 font-extrabold">{item.label}</h2>
      <p className="mt-2 mb-4 text-[14px] leading-7 text-[#796653]">{item.description}</p>
      <span className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-[#e8ded1] pt-3 text-[13px] font-semibold text-[#92764e]">
        <span>ورود به بخش</span>
        <AdminIcon
          name="arrow"
          width={18}
          className="motion-safe:transition-transform motion-safe:group-hover:-translate-x-1"
        />
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
