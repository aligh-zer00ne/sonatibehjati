import OrderFilters from '../components/OrderFilters';
import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { useRef, useState } from 'react';
import { Typography, Alert, Card, Pagination, Button, Empty, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import { AdminOrdersDocument, type AdminOrdersInput } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useOrderFilters } from '../hooks/useOrderFilters';
import { customerName, persianDigits } from '../lib/format';
import AdminIcon from '../components/AdminIcon';
import OrdersMapView from '../components/OrdersMapView';
import DataState from '../components/DataState';

export default function OrdersMap() {
  const { admin } = useAdmin();
  const filters = useOrderFilters(50);
  const query = useAdminQuery(AdminOrdersDocument, { input: filters.input }, !filters.error);
  const result = query.data?.adminOrders;
  const filterKey = JSON.stringify(filters.input);
  const [selection, setSelection] = useState<{ id: string; filterKey: string } | null>(null);
  const mapPanel = useRef<HTMLElement>(null);
  const points =
    result?.items.filter(
      (order) => order.address.latitude != null && order.address.longitude != null,
    ) ?? [];
  const selected =
    selection?.filterKey === filterKey
      ? points.find((order) => order.id === selection.id)
      : undefined;

  const selectOrder = (id: string) => {
    setSelection({ id, filterKey });
    if (matchMedia('(max-width: 767px)').matches) {
      mapPanel.current?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    }
  };
  const updateFilters = (patch: Partial<AdminOrdersInput>, reset = true) => {
    setSelection(null);
    filters.update(patch, reset);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Typography.Title level={2}>نقشه سفارش‌ها</Typography.Title>
          <p className="text-sm text-[#78665b]">
            یک سفارش را انتخاب کنید تا موقعیت ثبت‌شدهٔ آن روی نقشه نمایش داده شود.
          </p>
        </div>
        {hasPermission(admin, 'ORDERS') && (
          <Link to="/admin/orders">
            <Button>فهرست همهٔ سفارش‌ها</Button>
          </Link>
        )}
      </div>
      <OrderFilters
        key={String(filters.input.search) + String(filters.input.city)}
        input={filters.input}
        onChange={updateFilters}
        onReset={() => {
          setSelection(null);
          filters.reset();
        }}
      />
      {filters.error ? (
        <Alert title={filters.error} type="error" role="alert" />
      ) : !result ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          <div className="grid items-start gap-4 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.4fr)]">
            <Card
              title="انتخاب سفارش"
              extra={
                <span className="text-xs text-[#78665b]">
                  {formatNumber(points.length)} موقعیت در این صفحه
                </span>
              }
              className="min-w-0"
            >
              {points.length ? (
                <ul
                  aria-label="سفارش‌های دارای موقعیت"
                  className="m-0 max-h-72 list-none space-y-2 overflow-y-auto p-1 md:max-h-[540px]"
                >
                  {points.map((order) => {
                    const active = selected?.id === order.id;
                    return (
                      <li key={order.id}>
                        <button
                          type="button"
                          aria-label={`نمایش موقعیت سفارش ${formatNumber(order.number)}`}
                          aria-pressed={active}
                          onClick={() => selectOrder(order.id)}
                          className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-right transition-colors ${active ? 'border-[#a12637] bg-[#fff0ee]' : 'border-[#ede4da] bg-[#fffcf8] hover:border-[#c88e87] hover:bg-[#fff5ef]'}`}
                        >
                          <span
                            className={`mt-1 shrink-0 ${active ? 'text-[#96140d]' : 'text-[#a38b77]'}`}
                          >
                            <AdminIcon name="map" />
                          </span>
                          <span className="min-w-0 flex-1 space-y-1">
                            <span className="block font-bold text-[#631521]">
                              سفارش {formatNumber(order.number)}
                            </span>
                            <span className="block break-words text-sm">
                              {customerName(order.user)}
                            </span>
                            <span className="block break-words text-xs text-[#78665b]">
                              {order.address.province}، {order.address.city}
                            </span>
                            <span className="block text-xs text-[#78665b]">
                              {orderStatusLabels[order.status]}
                            </span>
                            {active && (
                              <span className="block text-xs font-bold text-[#96140d]">
                                در حال نمایش روی نقشه
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="در این صفحه سفارشی با موقعیت ثبت‌شده وجود ندارد."
                />
              )}
              <p className="mb-0 mt-4 text-xs leading-6 text-[#78665b]">
                فقط سفارش‌های دارای موقعیت قابل انتخاب‌اند.
                {result.items.length > points.length &&
                  ` ${formatNumber(result.items.length - points.length)} سفارش این صفحه موقعیت ثبت‌شده ندارند؛ آن‌ها را در فهرست همهٔ سفارش‌ها ببینید.`}
              </p>
            </Card>
            <section
              ref={mapPanel}
              className="min-w-0 scroll-mt-24"
              aria-label="موقعیت سفارش انتخاب‌شده"
            >
              <Card
                title={selected ? `موقعیت سفارش ${formatNumber(selected.number)}` : 'موقعیت سفارش'}
              >
                {selected ? (
                  <>
                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>{customerName(selected.user)}</strong>
                        <Tag>{orderStatusLabels[selected.status]}</Tag>
                      </div>
                      <p className="m-0 break-words leading-7 text-[#78665b]">
                        {[
                          selected.address.province,
                          selected.address.city,
                          selected.address.postalAddress,
                        ]
                          .filter(Boolean)
                          .join('، ')}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span dir="ltr">
                          {persianDigits(selected.address.recipientPhone ?? selected.user.phone)}
                        </span>
                        {hasPermission(admin, 'ORDERS') && (
                          <Link to={`/admin/orders/${selected.id}`}>
                            <Button>جزئیات سفارش</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                    <OrdersMapView key={selected.id} order={selected} />
                  </>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-3 text-center md:min-h-[440px]">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f8eee5] text-[#9c2835]">
                      <AdminIcon name="map" width={32} height={32} />
                    </span>
                    <p className="m-0 font-bold">ابتدا یک سفارش انتخاب کنید</p>
                    <p className="m-0 max-w-72 text-sm leading-7 text-[#78665b]">
                      با انتخاب سفارش از فهرست، نقشهٔ همان مقصد و نشانی آن در این بخش نمایش داده
                      می‌شود.
                    </p>
                  </div>
                )}
              </Card>
            </section>
          </div>
          {result.total > 50 && (
            <Pagination
              current={result.page}
              pageSize={50}
              total={result.total}
              showSizeChanger={false}
              onChange={(page) => updateFilters({ page }, false)}
            />
          )}
        </>
      )}
    </div>
  );
}
