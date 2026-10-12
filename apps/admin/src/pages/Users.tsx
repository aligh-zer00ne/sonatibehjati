import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Money } from '../components/Money';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Typography, Card, Input, Table, Button, Alert } from 'antd';
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
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const search = (params.get('search') ?? '').slice(0, 100);
  const query = useAdminQuery(AdminUsersDocument, { input: { page, pageSize: 20, search } });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>کاربران</Typography.Title>
        <Button
          loading={exporting}
          onClick={async () => {
            setExporting(true);
            setExportError('');
            try {
              const { adminCustomerExport: result } = await adminRequest(
                AdminCustomerExportDocument,
                { search },
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
      <p className="text-sm text-[#7d746a]">
        خروجی شامل نام و موبایل تمام مشتریان مطابق جستجوی فعلی است؛ فقط صفحهٔ نمایش‌داده‌شده را
        محدود نمی‌کند.
      </p>
      {exportError && <Alert type="error" title={exportError} role="alert" />}
      <Card>
        <Input.Search
          aria-label="جستجوی کاربران"
          placeholder="نام یا موبایل"
          maxLength={100}
          allowClear
          onSearch={(value) => {
            setParams(value ? { search: value } : {});
            setPage(1);
          }}
        />
      </Card>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <Card>
          <Table<AdminUsersQuery['adminUsers']['items'][number]>
            rowKey="id"
            dataSource={query.data.adminUsers.items}
            scroll={{ x: 900 }}
            pagination={{
              current: page,
              pageSize: 20,
              total: query.data.adminUsers.total,
              showSizeChanger: false,
              onChange: setPage,
            }}
            columns={[
              { title: 'نام', render: (_, user) => customerName(user) },
              { title: 'موبایل', render: (_, user) => <bdi>{persianDigits(user.phone)}</bdi> },
              { title: 'تاریخ عضویت', render: (_, user) => formatDate(user.createdAt) },
              { title: 'تعداد سفارش', render: (_, user) => formatNumber(user.ordersCount) },
              {
                title: 'ارزش سفارش‌های غیرلغوشده',
                render: (_, user) => <Money amount={user.totalOrdersValue} />,
              },
              {
                title: 'عملیات',
                render: (_, user) =>
                  hasPermission(admin, 'ORDERS') && (
                    <Link to={`/admin/orders?userId=${user.id}`}>
                      <Button>سفارش‌های کاربر</Button>
                    </Link>
                  ),
              },
            ]}
          />
        </Card>
      )}
    </>
  );
}
