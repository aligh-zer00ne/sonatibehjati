import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Card, Input, Table, Button } from 'antd';
import { formatNumber, formatPrice, formatDate } from '@behjati/shared';
import { AdminUsersDocument, type AdminUsersQuery } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { customerName, persianDigits } from '../lib/format';
import DataState from '../components/DataState';
export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const query = useAdminQuery(AdminUsersDocument, { input: { page, pageSize: 20, search } });
  return (
    <>
      <Typography.Title level={2}>کاربران</Typography.Title>
      <Card>
        <Input.Search
          aria-label="جستجوی کاربران"
          placeholder="نام یا موبایل"
          maxLength={100}
          allowClear
          onSearch={(value) => {
            setSearch(value);
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
                render: (_, user) => formatPrice(user.totalOrdersValue),
              },
              {
                title: 'عملیات',
                render: (_, user) => (
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
