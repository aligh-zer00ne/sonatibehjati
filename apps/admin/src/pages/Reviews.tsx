import PageHeading from '../components/PageHeading';
import { FilterChips, FilterButton, FilterBar } from '../components/FilterButtons';
import AdminIcon from '../components/AdminIcon';
import RecordCards from '../components/RecordCards';
import { useState } from 'react';
import { Alert, Button, Rate, Tag } from 'antd';
import { formatDate } from '@behjati/shared';
import {
  AdminReviewsDocument,
  ModerateProductReviewDocument,
  type ReviewStatus,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import DataState from '../components/DataState';
const statuses = [
  { value: 'PENDING', label: 'منتظر تأیید' },
  { value: 'APPROVED', label: 'تأییدشده' },
  { value: 'REJECTED', label: 'ردشده' },
];
export default function Reviews() {
  const [status, setStatus] = useState<ReviewStatus | undefined>('PENDING');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const query = useAdminQuery(AdminReviewsDocument, { input: { status, page, pageSize: 20 } });
  async function moderate(id: string, next: ReviewStatus, expectedUpdatedAt: string) {
    setPending(id);
    setError('');
    try {
      await adminRequest(ModerateProductReviewDocument, { id, status: next, expectedUpdatedAt });
      query.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تأیید انجام نشد.');
      query.refresh();
    } finally {
      setPending('');
    }
  }
  return (
    <>
      <PageHeading icon="review" description="بررسی و مدیریت تجربهٔ خریداران محصولات.">
        مدیریت نظرات محصول
      </PageHeading>
      <FilterBar>
        <FilterButton label="وضعیت نظر" active={!!status}>
          <FilterChips<ReviewStatus | ''>
            label="وضعیت نظر"
            value={status ?? ''}
            options={[
              { value: '', label: 'همه نظرات' },
              ...statuses.map((o) => ({ ...o, value: o.value as ReviewStatus })),
            ]}
            onChange={(v) => {
              setStatus(v || undefined);
              setPage(1);
            }}
          />
        </FilterButton>
      </FilterBar>
      {error && <Alert type="error" title={error} role="alert" />}
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <RecordCards
          rowKey="id"
          icon="review"
          label="فهرست نظرات"
          dataSource={query.data.adminReviews.items}
          pagination={{
            current: page,
            pageSize: 20,
            total: query.data.adminReviews.total,
            showSizeChanger: false,
            onChange: setPage,
          }}
          columns={[
            { title: 'محصول', dataIndex: 'productTitle' },
            { title: 'کاربر', dataIndex: 'authorName' },
            {
              title: 'نظر',
              render: (_, row) => (
                <div className="max-w-sm">
                  <Rate disabled value={row.rating} className="!text-sm" />
                  <p className="mt-2 break-words whitespace-pre-wrap">{row.body}</p>
                </div>
              ),
            },
            { title: 'تاریخ', render: (_, row) => formatDate(row.createdAt) },
            {
              title: 'وضعیت',
              render: (_, row) => (
                <Tag
                  color={
                    row.status === 'APPROVED'
                      ? 'green'
                      : row.status === 'REJECTED'
                        ? 'red'
                        : 'orange'
                  }
                >
                  {statuses.find((s) => s.value === row.status)?.label}
                </Tag>
              ),
            },
            {
              title: 'عملیات',
              render: (_, row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    disabled={Boolean(pending) || row.status === 'APPROVED'}
                    loading={pending === row.id}
                    icon={<AdminIcon name="shield" width={17} height={17} />}
                    onClick={() => void moderate(row.id, 'APPROVED', row.updatedAt)}
                  >
                    تأیید
                  </Button>
                  <Button
                    danger
                    disabled={Boolean(pending) || row.status === 'REJECTED'}
                    icon={<AdminIcon name="close" width={17} height={17} />}
                    onClick={() => void moderate(row.id, 'REJECTED', row.updatedAt)}
                  >
                    رد
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
