import { hasPermission } from '@behjati/shared/permissions';
import { Input, InputNumber, Button } from 'antd';
import CalendarPicker from './CalendarPicker';
import { orderStatuses, orderStatusLabels } from '@behjati/shared';
import {
  salesChannels,
  salesChannelLabels,
  shippingMethods,
  shippingMethodLabels,
} from '@behjati/shared/sales';
import type { AdminOrdersInput } from '../generated/graphql';
import { useAdmin } from '../auth/AdminProvider';
import UserFilter from './UserFilter';
import { FilterButton, FilterChips, FilterBar } from './FilterButtons';
import type { OrderScope } from '../hooks/useOrderFilters';
export default function OrderFilters({
  input,
  onChange,
  onReset,
  scope = 'all',
}: {
  input: AdminOrdersInput;
  onChange: (v: Partial<AdminOrdersInput>) => void;
  onReset: () => void;
  scope?: OrderScope;
}) {
  const { admin } = useAdmin();
  return (
    <FilterBar label="فیلترهای سفارش">
      <FilterButton label="جستجوی سفارش" active={!!input.search || !!input.number}>
        <Input.Search
          id="order-search"
          aria-label="جستجوی سفارش"
          placeholder="شماره، نام یا موبایل"
          defaultValue={input.search ?? ''}
          allowClear
          maxLength={100}
          onSearch={(search) => onChange({ search })}
        />
        <label htmlFor="order-number">شماره سفارش</label>
        <InputNumber
          id="order-number"
          min={1}
          max={2147483647}
          precision={0}
          value={input.number}
          onChange={(number) => onChange({ number })}
        />
      </FilterButton>
      {scope !== 'manual' && (
        <FilterButton label="وضعیت سفارش" active={!!input.status}>
          <FilterChips
            label="وضعیت سفارش"
            value={input.status ?? ''}
            options={[
              { value: '', label: 'همه وضعیت‌ها' },
              ...orderStatuses.map((value) => ({ value, label: orderStatusLabels[value] })),
            ]}
            onChange={(status) => onChange({ status: status || null })}
          />
        </FilterButton>
      )}
      {scope !== 'website' && (
        <FilterButton label="محل خرید" active={!!input.salesChannel}>
          <FilterChips
            label="محل خرید"
            value={input.salesChannel ?? ''}
            options={[
              { value: '', label: scope === 'manual' ? 'همه سفارش‌های دستی' : 'همه خریدها' },
              ...salesChannels
                .filter((value) => scope !== 'manual' || value !== 'WEBSITE')
                .map((value) => ({ value, label: salesChannelLabels[value] })),
            ]}
            onChange={(salesChannel) => onChange({ salesChannel: salesChannel || null })}
          />
        </FilterButton>
      )}
      <FilterButton label="شیوه ارسال" active={!!input.shippingMethod}>
        <FilterChips
          label="شیوه ارسال"
          value={input.shippingMethod ?? ''}
          options={[
            { value: '', label: 'همه روش‌ها' },
            ...shippingMethods.map((value) => ({ value, label: shippingMethodLabels[value] })),
          ]}
          onChange={(shippingMethod) => onChange({ shippingMethod: shippingMethod || null })}
        />
      </FilterButton>
      {hasPermission(admin, 'CUSTOMERS') && (
        <FilterButton label="مشتری" active={!!input.userId}>
          <UserFilter value={input.userId} onChange={(userId) => onChange({ userId })} />
        </FilterButton>
      )}
      <FilterButton label="شهر مقصد" active={!!input.city}>
        <Input.Search
          aria-label="شهر نشانی سفارش"
          defaultValue={input.city ?? ''}
          maxLength={80}
          allowClear
          onSearch={(city) => onChange({ city })}
        />
      </FilterButton>
      <FilterButton label="بازه تاریخ" active={!!input.from || !!input.to}>
        <label htmlFor="order-from">از تاریخ</label>
        <CalendarPicker
          id="order-from"
          value={input.from}
          onChange={(from) => onChange({ from })}
        />
        <label htmlFor="order-to">تا تاریخ</label>
        <CalendarPicker id="order-to" value={input.to} onChange={(to) => onChange({ to })} />
      </FilterButton>
      <FilterButton label="مرتب‌سازی سفارش‌ها" active={!!input.sort && input.sort !== 'NEWEST'}>
        <FilterChips
          label="مرتب‌سازی سفارش‌ها"
          value={input.sort ?? 'NEWEST'}
          options={[
            { value: 'NEWEST', label: 'جدیدترین' },
            { value: 'OLDEST', label: 'قدیمی‌ترین' },
            { value: 'TOTAL_DESC', label: 'مبلغ بیشتر' },
            { value: 'TOTAL_ASC', label: 'مبلغ کمتر' },
          ]}
          onChange={(sort) => onChange({ sort })}
        />
      </FilterButton>
      <Button
        type="text"
        size="small"
        className="!ms-auto !text-[12px] !text-[#96140d]"
        onClick={onReset}
      >
        پاک کردن فیلترها
      </Button>
    </FilterBar>
  );
}
