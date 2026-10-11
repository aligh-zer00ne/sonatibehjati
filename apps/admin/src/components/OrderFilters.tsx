import { Input, InputNumber, Select, Button, Card } from 'antd';
import CalendarPicker from './CalendarPicker';
import { orderStatuses, orderStatusLabels } from '@behjati/shared';
import type { AdminOrdersInput, OrderStatus } from '../generated/graphql';
import UserFilter from './UserFilter';
export default function OrderFilters({
  input,
  onChange,
  onReset,
}: {
  input: AdminOrdersInput;
  onChange: (value: Partial<AdminOrdersInput>) => void;
  onReset: () => void;
}) {
  return (
    <Card>
      <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs" htmlFor="order-search">
            جستجو
          </label>
          <Input.Search
            id="order-search"
            placeholder="شماره، نام یا موبایل"
            defaultValue={input.search ?? ''}
            maxLength={100}
            allowClear
            onSearch={(search) => onChange({ search })}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor="order-status">
            وضعیت
          </label>
          <Select<OrderStatus | ''>
            id="order-status"
            className="w-full"
            value={input.status ?? ''}
            onChange={(status) => onChange({ status: status || null })}
            options={[
              { value: '', label: 'همه وضعیت‌ها' },
              ...orderStatuses.map((status) => ({
                value: status,
                label: orderStatusLabels[status],
              })),
            ]}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor="order-number">
            شماره سفارش
          </label>
          <InputNumber
            id="order-number"
            className="!w-full"
            min={1}
            max={2147483647}
            precision={0}
            value={input.number}
            onChange={(number) => onChange({ number })}
          />
        </div>
        <div>
          <span className="mb-2 block text-xs">مشتری</span>
          <UserFilter value={input.userId} onChange={(userId) => onChange({ userId })} />
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor="order-city">
            شهر نشانی سفارش
          </label>
          <Input.Search
            id="order-city"
            defaultValue={input.city ?? ''}
            maxLength={80}
            onSearch={(city) => onChange({ city })}
            allowClear
          />
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor="order-from">
            از تاریخ
          </label>
          <CalendarPicker
            id="order-from"
            value={input.from}
            onChange={(from) => onChange({ from })}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor="order-to">
            تا تاریخ
          </label>
          <CalendarPicker id="order-to" value={input.to} onChange={(to) => onChange({ to })} />
        </div>
        <Select
          aria-label="مرتب‌سازی سفارش‌ها"
          className="w-full"
          value={input.sort ?? 'NEWEST'}
          onChange={(sort) => onChange({ sort })}
          options={[
            { value: 'NEWEST', label: 'جدیدترین' },
            { value: 'OLDEST', label: 'قدیمی‌ترین' },
            { value: 'TOTAL_DESC', label: 'مبلغ بیشتر' },
            { value: 'TOTAL_ASC', label: 'مبلغ کمتر' },
          ]}
        />
        <Button onClick={onReset}>پاک کردن فیلترها</Button>
      </div>
    </Card>
  );
}
