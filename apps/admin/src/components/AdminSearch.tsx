import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input, Spin } from 'antd';
import { hasPermission, type AdminPermission } from '@behjati/shared/permissions';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import { useAdmin } from '../auth/AdminProvider';
import { useAdminQuery } from '../hooks/useAdminQuery';
import {
  AdminSearchCustomersDocument,
  AdminSearchOrdersDocument,
  AdminSearchProductsDocument,
} from '../generated/graphql';
import { customerName, persianDigits } from '../lib/format';
import { formatAdminPrice } from '../lib/money';
import AdminIcon, { type AdminIconName } from './AdminIcon';

type Scope = 'orders' | 'users' | 'products';
const scopes: Array<{
  id: Scope;
  label: string;
  icon: AdminIconName;
  permission: AdminPermission;
  placeholder: string;
  paths: string[];
}> = [
  {
    id: 'orders',
    label: 'سفارش‌ها',
    icon: 'orders',
    permission: 'ORDERS',
    placeholder: 'شماره سفارش، نام یا موبایل مشتری…',
    paths: ['/admin/orders', '/admin/settlements', '/admin/reports'],
  },
  {
    id: 'users',
    label: 'مشتریان',
    icon: 'users',
    permission: 'CUSTOMERS',
    placeholder: 'نام یا موبایل مشتری…',
    paths: ['/admin/users'],
  },
  {
    id: 'products',
    label: 'محصولات',
    icon: 'products',
    permission: 'PRODUCTS',
    placeholder: 'نام محصول…',
    paths: ['/admin/products', '/admin/coupons', '/admin/promotions'],
  },
];
const listPath: Record<Scope, (term: string) => string> = {
  orders: (term) => `/admin/orders?status=ALL&search=${encodeURIComponent(term)}`,
  users: (term) => `/admin/users?search=${encodeURIComponent(term)}`,
  products: (term) => `/admin/products?search=${encodeURIComponent(term)}`,
};
type Result = { key: string; href: string; title: string; detail: string; badge?: string };

/** Panel search: the tabbed dropdown picks the scope; the current page decides the default. */
export default function AdminSearch() {
  const { admin } = useAdmin();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const available = scopes.filter((scope) => hasPermission(admin, scope.permission));
  const pageScope =
    available.find((scope) =>
      scope.paths.some((path) => pathname === path || pathname.startsWith(path + '/')),
    )?.id ?? available[0]?.id;
  const [chosen, setChosen] = useState<{ scope: Scope; path: string } | null>(null);
  // A choice applies to the page it was made on; navigating restores the page's default tab.
  const scope =
    chosen && chosen.path === pathname && available.some((s) => s.id === chosen.scope)
      ? chosen.scope
      : pageScope;
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => {
    setOpen(false);
    setActive(-1);
  }, [pathname]);
  const ready = open && debounced.length >= 2;
  const orders = useAdminQuery(
    AdminSearchOrdersDocument,
    { input: { search: debounced, page: 1, pageSize: 5 } },
    ready && scope === 'orders',
  );
  const users = useAdminQuery(
    AdminSearchCustomersDocument,
    { input: { search: debounced, page: 1, pageSize: 5 } },
    ready && scope === 'users',
  );
  const products = useAdminQuery(
    AdminSearchProductsDocument,
    { input: { search: debounced, page: 1, pageSize: 5 } },
    ready && scope === 'products',
  );
  const query = scope === 'orders' ? orders : scope === 'users' ? users : products;
  const results: Result[] =
    scope === 'orders'
      ? (orders.data?.adminOrders.items ?? []).map((order) => ({
          key: order.id,
          href: `/admin/orders/${order.id}`,
          title: `سفارش ${formatNumber(order.number)} · ${customerName(order.user, {
            recipient: order.address.recipientName,
          })}`,
          detail: [formatAdminPrice(order.total), order.address.city].filter(Boolean).join(' · '),
          badge: orderStatusLabels[order.status],
        }))
      : scope === 'users'
        ? (users.data?.adminUsers.items ?? []).map((user) => ({
            key: user.id,
            href: `/admin/users?search=${encodeURIComponent(user.phone)}`,
            title: customerName(user, { unnamed: true }),
            detail: `${persianDigits(user.phone)} · ${formatNumber(user.ordersCount)} سفارش`,
          }))
        : (products.data?.adminProducts.items ?? []).map((product) => ({
            key: product.id,
            href: `/admin/products/${product.id}/edit`,
            title: product.title,
            detail: `${product.weight} · ${formatAdminPrice(product.price)}`,
            badge: product.isActive ? undefined : 'غیرفعال',
          }));
  const total =
    scope === 'orders'
      ? orders.data?.adminOrders.total
      : scope === 'users'
        ? users.data?.adminUsers.total
        : products.data?.adminProducts.total;
  if (!scope) return null;
  const current = scopes.find((item) => item.id === scope)!;
  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    navigate(href);
  };
  const submit = () => {
    const value = term.trim();
    if (active >= 0 && results[active]) go(results[active].href);
    else if (value) go(listPath[scope](value));
  };
  const choose = (next: Scope) => {
    setChosen({ scope: next, path: pathname });
    setActive(-1);
    setOpen(true);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!results.length) return;
      setActive((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % results.length
          : (index - 1 + results.length) % results.length,
      );
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };
  const tabKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowLeft' ? 1 : event.key === 'ArrowRight' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = available[(index + step + available.length) % available.length]!;
    choose(next.id);
    document.getElementById(`${id}-tab-${next.id}`)?.focus();
  };
  return (
    <div ref={root} className="relative w-full" data-admin-search>
      <Input
        role="combobox"
        aria-label={`جستجو در ${current.label}`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-activedescendant={active >= 0 ? `${id}-result-${active}` : undefined}
        value={term}
        maxLength={100}
        allowClear
        placeholder={current.placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setTerm(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="!h-11 !rounded-xl !border-[#dde3eb] !bg-[#f3f5f8] !ps-1.5"
        prefix={
          <button
            type="button"
            data-search-scope={scope}
            aria-label={`محدودهٔ جستجو: ${current.label}`}
            aria-haspopup="true"
            onClick={() => setOpen((value) => !value)}
            className="me-1 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#d6dee8] bg-white px-2.5 text-[13px] font-bold text-[#1e3a5f] "
          >
            <AdminIcon name={current.icon} width={16} />
            {current.label}
            <AdminIcon name="chevron" width={14} className="text-[#7a8696]" />
          </button>
        }
        suffix={<AdminIcon name="search" width={18} className="text-[#7a8696]" />}
      />
      {open && (
        <div
          id={`${id}-panel`}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#dde3eb] bg-white shadow-[0_18px_40px_-12px_#1e3a5f40]"
        >
          <div
            role="tablist"
            aria-label="محدودهٔ جستجو"
            className="flex gap-1 border-b border-[#e6ebf1] bg-[#f6f8fb] p-1.5"
          >
            {available.map((item, index) => (
              <button
                key={item.id}
                id={`${id}-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={item.id === scope}
                tabIndex={item.id === scope ? 0 : -1}
                onClick={() => choose(item.id)}
                onKeyDown={(event) => tabKeys(event, index)}
                className={`flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-bold transition-colors ${
                  item.id === scope
                    ? 'bg-white text-[#2c5282] shadow-[0_1px_4px_#1e3a5f1f]'
                    : 'text-[#5f6b7b] '
                }`}
              >
                <AdminIcon name={item.icon} width={16} />
                {item.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" aria-label={`نتایج ${current.label}`} className="p-1.5">
            {debounced.length < 2 || term.trim().length < 2 ? (
              <p className="px-3 py-4 text-[13px] leading-6 text-[#6b7685]">
                دست‌کم دو کاراکتر بنویسید تا در «{current.label}» جستجو شود؛ Enter همهٔ نتایج را باز
                می‌کند.
              </p>
            ) : query.error && !query.data ? (
              <p role="alert" className="px-3 py-4 text-[13px] text-[#b42318]">
                {query.error}
              </p>
            ) : !query.data ? (
              <div className="grid place-items-center py-6">
                <Spin size="small" />
              </div>
            ) : results.length ? (
              <ul role="listbox" aria-label={`نتایج ${current.label}`}>
                {results.map((result, index) => (
                  <li
                    key={result.key}
                    id={`${id}-result-${index}`}
                    role="option"
                    aria-selected={index === active}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(result.href)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start ${
                        index === active ? 'bg-[#edf2f8]' : ''
                      }`}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e8eef6] text-[#2c5282]">
                        <AdminIcon name={current.icon} width={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-[#1f2833]">
                          {result.title}
                        </span>
                        <span className="block truncate text-[12.5px] text-[#6b7685]">
                          {result.detail}
                        </span>
                      </span>
                      {result.badge && (
                        <span className="shrink-0 rounded-md bg-[#eef1f5] px-2 py-0.5 text-[12px] font-semibold text-[#4b5767]">
                          {result.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-4 text-[13px] text-[#6b7685]">
                نتیجه‌ای در «{current.label}» پیدا نشد؛ تب دیگری را امتحان کنید.
              </p>
            )}
            {term.trim() && (
              <button
                type="button"
                onClick={() => go(listPath[scope](term.trim()))}
                className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-xl border-t border-[#eef1f5] px-3 py-2.5 text-[13px] font-bold text-[#2c5282] "
              >
                <span>
                  همهٔ نتایج در {current.label}
                  {total ? ` (${formatNumber(total)})` : ''}
                </span>
                <AdminIcon name="arrow" width={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
