import AccountStatus from '../components/AccountStatus';
import RetailCustomerModal from '../components/RetailCustomerModal';
import { FilterButton, FilterChips, FilterBar } from '../components/FilterButtons';
import { salesChannels, salesChannelLabels } from '@behjati/shared/sales';
import type { SalesChannel } from '../generated/graphql';
import AdminIcon from '../components/AdminIcon';
import RecordCards from '../components/RecordCards';
import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Typography, Input, Button, Alert } from 'antd';
import { formatNumber, formatDate } from '@behjati/shared';
import {
  AdminUsersDocument,
  AdminCustomerExportDocument,
  type AdminUsersQuery,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { customerName, persianDigits } from '../lib/format';
import { adminRequest } from '../lib/client';
import DataState from '../components/DataState';
export default function Users() {
  const { admin } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const source = params.get('source');
  const salesChannel = salesChannels.find((v) => v === source);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const search = (params.get('search') ?? '').slice(0, 100);
  const query = useAdminQuery(AdminUsersDocument, {
    input: { page, pageSize: 20, search, salesChannel },
  });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>کاربران</Typography.Title>
        <div className="flex flex-wrap gap-2">
          <Button type="primary" onClick={() => setCreating(true)}>
            افزودن مشتری
          </Button>
          <Button
            loading={exporting}
            onClick={async () => {
              setExporting(true);
              setExportError('');
              try {
                const { adminCustomerExport: result } = await adminRequest(
                  AdminCustomerExportDocument,
                  { search, salesChannel },
                );
                const bytes = Uint8Array.from(atob(result.base64), (char) => char.charCodeAt(0));
                const url = URL.createObjectURL(
                  new Blob([bytes], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  }),
                );
                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 10000);
              } catch (e) {
                setExportError(e instanceof Error ? e.message : 'خروجی ساخته نشد.');
              } finally {
                setExporting(false);
              }
            }}
          >
            خروجی اکسل مشتریان
          </Button>
        </div>
      </div>
      {creating && (
        <RetailCustomerModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            setPage(1);
            query.refresh();
          }}
        />
      )}
      <p className="text-sm text-[#7d746a]">
        خروجی شامل نام و موبایل تمام مشتریان مطابق جستجوی فعلی است؛ فقط صفحهٔ نمایش‌داده‌شده را
        محدود نمی‌کند.
      </p>
      {exportError && <Alert type="error" title={exportError} role="alert" />}
      <FilterBar label="فیلترهای مشتریان">
        <FilterButton label="جستجوی مشتری" active={!!search}>
          <Input.Search
            aria-label="جستجوی کاربران"
            placeholder="نام یا موبایل"
            defaultValue={search}
            maxLength={100}
            allowClear
            onSearch={(value) => {
              const next = new URLSearchParams(params);
              if (value) next.set('search', value);
              else next.delete('search');
              setParams(next);
              setPage(1);
            }}
          />
        </FilterButton>
        <FilterButton label="محل خرید مشتری" active={!!salesChannel}>
          <FilterChips<SalesChannel | ''>
            label="محل خرید مشتری"
            value={salesChannel ?? ''}
            options={[
              { value: '', label: 'همه مشتریان' },
              ...salesChannels.map((value) => ({ value, label: salesChannelLabels[value] })),
            ]}
            onChange={(value) => {
              const next = new URLSearchParams(params);
              if (value) next.set('source', value);
              else next.delete('source');
              setParams(next);
              setPage(1);
            }}
          />
        </FilterButton>
      </FilterBar>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <RecordCards<AdminUsersQuery['adminUsers']['items'][number]>
          rowKey="id"
          icon="users"
          label="فهرست مشتریان"
          featuredField="وضعیت حساب"
          dataSource={query.data.adminUsers.items}
          pagination={{
            current: page,
            pageSize: 20,
            total: query.data.adminUsers.total,
            showSizeChanger: false,
            onChange: setPage,
          }}
          columns={[
            { title: 'نام', render: (_, user) => customerName(user) },
            {
              title: 'محل خرید',
              render: (_, user) => user.salesChannels.map((v) => salesChannelLabels[v]).join('، '),
            },
            { title: 'موبایل', render: (_, user) => <bdi>{persianDigits(user.phone)}</bdi> },
            { title: 'تاریخ عضویت', render: (_, user) => formatDate(user.createdAt) },
            { title: 'تعداد سفارش', render: (_, user) => formatNumber(user.ordersCount) },
            {
              title: 'وضعیت حساب',
              render: (_, user) => <AccountStatus balance={user.accountBalance} />,
            },
            {
              title: 'عملیات',
              render: (_, user) =>
                hasPermission(admin, 'ORDERS') && (
                  <Link to={`/admin/settlements?customerId=${user.id}`}>
                    <Button icon={<AdminIcon name="orders" width={17} height={17} />}>
                      حساب و فاکتورهای دستی
                    </Button>
                  </Link>
                ),
            },
          ]}
        />
      )}
    </>
  );
}
