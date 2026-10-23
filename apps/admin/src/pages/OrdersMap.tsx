import { useRef, useState } from 'react';
import { Alert, Button, Empty, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { AdminOrdersMapDocument, type AdminOrdersInput } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useOrderFilters } from '../hooks/useOrderFilters';
import { customerName, persianDigits } from '../lib/format';
import OrderFilters from '../components/OrderFilters';
import AdminIcon from '../components/AdminIcon';
import PageHeading from '../components/PageHeading';
import ProvinceOrderMap from '../components/ProvinceOrderMap';
import DataState from '../components/DataState';
import { cardInteraction, cardIconInteraction } from '../lib/card-interaction';
export default function OrdersMap() {
  const { admin } = useAdmin(),
    filters = useOrderFilters(25);
  const [province, setProvince] = useState('');
  const [selection, setSelection] = useState<{ id: string; key: string } | null>(null);
  const mapPanel = useRef<HTMLElement>(null);
  const query = useAdminQuery(
    AdminOrdersMapDocument,
    { input: filters.input, province: province || null },
    !filters.error,
    { pollInterval: 30000 },
  );
  const data = query.data?.adminOrdersMap;
  const filterKey = JSON.stringify([filters.input, province]);
  const selected =
    selection?.key === filterKey ? data?.items.find((o) => o.id === selection.id) : undefined;
  const current = data?.provinces.find((p) => p.code === province);
  const ranked =
    data?.provinces
      .filter((p) => p.count)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fa')) ?? [];
  const update = (patch: Partial<AdminOrdersInput>, reset = true) => {
    setSelection(null);
    filters.update(patch, reset);
  };
  const selectProvince = (code: string) => {
    setProvince(code === province ? '' : code);
    setSelection(null);
    filters.update({ page: 1 });
  };
  const selectOrder = (id: string, fromList = false) => {
    setSelection({ id, key: filterKey });
    if (fromList && window.innerWidth < 1280)
      mapPanel.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading icon="map" description="پراکندگی کل سفارش‌ها، آمار استان‌ها و مقصد هر مرسوله.">
          نقشه سفارش‌ها
        </PageHeading>
        <Button
          icon={<AdminIcon name="refresh" width={18} />}
          loading={query.refreshing}
          onClick={query.refresh}
        >
          به‌روزرسانی
        </Button>
      </div>
      <OrderFilters
        key={String(filters.input.search) + String(filters.input.city)}
        input={filters.input}
        onChange={update}
        onReset={() => {
          setProvince('');
          setSelection(null);
          filters.reset();
        }}
      />
      {filters.error ? (
        <Alert type="error" title={filters.error} role="alert" />
      ) : !data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          {query.error && <Alert type="warning" title={query.error} role="alert" />}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {(
              [
                ['orders', 'کل سفارش‌ها', data.total],
                [
                  'map',
                  'استان‌های دارای سفارش',
                  data.provinces.filter((p) => p.code !== 'unknown' && p.count).length,
                ],
                ['pin', 'بدون موقعیت دقیق', data.total - data.locatedCount],
              ] as const
            ).map(([icon, label, value]) => (
              <div
                key={label}
                className={`${cardInteraction} min-w-0 overflow-hidden rounded-2xl border border-[#e8ded1] bg-white p-3 sm:p-4`}
              >
                <div className="mb-2 flex items-center gap-2 text-[#9e7544]">
                  <AdminIcon name={icon} width={18} className={cardIconInteraction} />
                  <span className="text-[13px] leading-5 sm:text-xs">{label}</span>
                </div>
                <strong
                  data-map-metric={icon}
                  className="text-xl font-extrabold text-[#701e2a] sm:text-2xl"
                >
                  {formatNumber(value)}
                </strong>
              </div>
            ))}
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(270px,1fr)]">
            <section
              ref={mapPanel}
              className="min-w-0 scroll-mt-36 rounded-[24px] border border-[#e8ded1] bg-white p-3 sm:p-5"
            >
              <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-extrabold">
                    {current ? `سفارش‌های ${current.name}` : 'پراکندگی سفارش‌ها در ایران'}
                  </h2>
                  <p className="mt-1 text-xs leading-6 text-[#857467]">
                    آمار از تمام نتایج فیلتر محاسبه می‌شود.
                  </p>
                </div>
              </header>
              <ProvinceOrderMap
                provinces={data.provinces}
                selected={province}
                onSelect={selectProvince}
              />
              {current && (
                <Button
                  className="!mt-3"
                  icon={<AdminIcon name="close" width={15} />}
                  onClick={() => selectProvince(province)}
                >
                  حذف انتخاب استان {current.name}
                </Button>
              )}
              <p className="mt-3 text-[13px] leading-6 text-[#857467]">
                رنگ پررنگ‌تر یعنی سفارش بیشتر؛ آمار هر استان سفارش‌های بدون مختصات را هم شامل
                می‌شود.
              </p>
              {selected && (
                <section
                  data-selected-order
                  className="mt-4 rounded-2xl border border-[#dbc390] bg-[#fcf8ef] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>
                      سفارش {formatNumber(selected.number)} · {customerName(selected.user)}
                    </strong>
                    <span className="text-xs text-[#857467]">
                      {orderStatusLabels[selected.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7">
                    {[
                      selected.address.province,
                      selected.address.city,
                      selected.address.postalAddress,
                    ]
                      .filter(Boolean)
                      .join('، ')}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <bdi className="text-sm">
                      {persianDigits(selected.address.recipientPhone || selected.user.phone)}
                    </bdi>
                    {hasPermission(admin, 'ORDERS') && (
                      <Link to={`/admin/orders/${selected.id}`}>
                        <Button>جزئیات سفارش</Button>
                      </Link>
                    )}
                  </div>
                  {selected.address.latitude == null || selected.address.longitude == null ? (
                    <p className="mt-2 text-xs text-[#857467]">
                      این سفارش موقعیت دقیق ثبت‌شده ندارد.
                    </p>
                  ) : null}
                </section>
              )}
            </section>
            <aside className="min-w-0 space-y-4">
              <section className="rounded-[24px] border border-[#e8ded1] bg-white p-4">
                <h2 className="mb-3 font-extrabold">سهم استان‌ها</h2>
                {ranked.length ? (
                  <ul className="max-h-[330px] space-y-1 overflow-y-auto">
                    {ranked.map((p) => (
                      <li key={p.code}>
                        <button
                          type="button"
                          aria-label={`فیلتر استان ${p.name}`}
                          aria-pressed={province === p.code}
                          onClick={() => selectProvince(p.code)}
                          className="w-full cursor-pointer rounded-xl px-2 py-2 text-right hover:bg-[#fcf8ef] aria-pressed:bg-[#f4e8d3]"
                        >
                          <span className="flex justify-between gap-3 text-xs font-bold">
                            <span>{p.name}</span>
                            <span>{formatNumber(p.count)} سفارش</span>
                          </span>
                          <span className="mt-2 block h-1 rounded-full bg-[#f0e7db]">
                            <span
                              className="block h-full rounded-full bg-[#701e2a]"
                              style={{
                                width: `${Math.max(2, (p.count / Math.max(1, data.total)) * 100)}%`,
                              }}
                            />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="سفارشی در این فیلتر وجود ندارد."
                  />
                )}
              </section>
              <section className="rounded-[24px] border border-[#e8ded1] bg-white p-4">
                <header className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-extrabold">{current?.name || 'فهرست سفارش‌ها'}</h2>
                  <span className="text-xs text-[#857467]">
                    {formatNumber(data.pageTotal)} سفارش
                  </span>
                </header>
                {data.items.length ? (
                  <ul
                    aria-label="سفارش‌های نقشه"
                    className="max-h-[400px] space-y-2 overflow-y-auto"
                  >
                    {data.items.map((order) => (
                      <li key={order.id}>
                        <button
                          type="button"
                          aria-label={`نمایش موقعیت سفارش ${formatNumber(order.number)}`}
                          aria-pressed={selected?.id === order.id}
                          onClick={() => selectOrder(order.id, true)}
                          className="flex w-full cursor-pointer items-start gap-2 rounded-2xl border border-[#eee5d9] p-3 text-right hover:bg-[#fcf8ef] aria-pressed:border-[#bc8b42] aria-pressed:bg-[#fcf4e6]"
                        >
                          <AdminIcon
                            name="pin"
                            width={17}
                            className="mt-1 shrink-0 text-[#a47a42]"
                          />
                          <span className="min-w-0 flex-1">
                            <strong className="block text-xs">
                              {customerName(order.user)} · {formatNumber(order.number)}
                            </strong>
                            <span className="mt-1 block text-[13px] leading-6 text-[#857467]">
                              {order.address.city || order.address.province || 'مقصد ثبت نشده'} ·{' '}
                              {orderStatusLabels[order.status]}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="سفارشی وجود ندارد." />
                )}
                {data.pageTotal > 25 && (
                  <Pagination
                    className="!mt-4"
                    simple
                    current={data.page}
                    pageSize={25}
                    total={data.pageTotal}
                    showSizeChanger={false}
                    onChange={(page) => update({ page }, false)}
                  />
                )}
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
