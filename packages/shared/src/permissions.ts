import { z } from 'zod';
export const adminSections = [
  { permission: 'DASHBOARD', label: 'داشبورد', href: '/admin' },
  { permission: 'ORDERS', label: 'سفارش‌ها و چاپ', href: '/admin/orders' },
  { permission: 'PRODUCTS', label: 'محصولات و تخفیف محصول', href: '/admin/products' },
  { permission: 'CUSTOMERS', label: 'مشتریان و خروجی اکسل', href: '/admin/users' },
  { permission: 'ORDER_MAP', label: 'نقشه سفارش‌ها', href: '/admin/orders/map' },
  { permission: 'REPORTS', label: 'گزارش‌ها', href: '/admin/reports' },
  { permission: 'COUPONS', label: 'کدهای تخفیف', href: '/admin/coupons' },
  { permission: 'TICKETS', label: 'پشتیبانی و تیکت‌ها', href: '/admin/tickets' },
  { permission: 'REVIEWS', label: 'نظرات محصولات', href: '/admin/reviews' },
  { permission: 'MESSAGES', label: 'قالب پیام‌ها', href: '/admin/message-templates' },
  { permission: 'STORE_INFO', label: 'اطلاعات فروشگاه', href: '/admin/store-information' },
  { permission: 'SHIPPING', label: 'مدیریت ارسال', href: '/admin/shipping' },
  { permission: 'HOMEPAGE', label: 'نوار اطلاع‌رسانی سایت', href: '/admin/announcement' },
] as const;
export type AdminPermission = (typeof adminSections)[number]['permission'];
export const permissionsSchema = z
  .array(z.enum(adminSections.map((s) => s.permission)))
  .max(adminSections.length)
  .transform((values) => [...new Set(values)]);
export function hasPermission(
  admin: { role: string; permissions: readonly string[] } | null | undefined,
  permission: AdminPermission,
) {
  return !!admin && (admin.role === 'OWNER' || admin.permissions.includes(permission));
}
export function readPermissions(raw: unknown): AdminPermission[] {
  const result = permissionsSchema.safeParse(raw);
  return result.success ? result.data : [];
}
export function adminLanding(admin: { role: string; permissions: readonly string[] }) {
  return adminSections.find((s) => hasPermission(admin, s.permission))?.href ?? '/admin/settings';
}
export function canOpenAdminPath(
  admin: { role: string; permissions: readonly string[] },
  path: string,
) {
  if (path === '/admin/settings' || path.startsWith('/admin/settings/')) return true;
  if (path === '/admin/settlements' || path.startsWith('/admin/settlements/'))
    return hasPermission(admin, 'ORDERS');
  if (path === '/admin/payment-test' || path.startsWith('/admin/payment-test/'))
    return admin.role === 'OWNER';
  if (path === '/admin/accounts' || path.startsWith('/admin/accounts/'))
    return admin.role === 'OWNER';
  if (path.startsWith('/admin/promotions')) return hasPermission(admin, 'PRODUCTS');
  const section = [...adminSections]
    .sort((a, b) => b.href.length - a.href.length)
    .find((s) => path === s.href || (s.href !== '/admin' && path.startsWith(s.href + '/')));
  return !section || hasPermission(admin, section.permission);
}
