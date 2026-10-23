import { useState, type Key, type ReactNode } from 'react';
import { Checkbox, Empty, Pagination, type PaginationProps } from 'antd';
import { formatNumber } from '@behjati/shared';
import AdminIcon, { type AdminIconName } from './AdminIcon';

type Field<T> = {
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  icon?: AdminIconName;
  wide?: boolean;
};

function fieldIcon(title: string): AdminIconName {
  if (/موبایل|تلفن/.test(title)) return 'phone';
  if (/تاریخ|روز|تغییر|شروع|پایان/.test(title)) return 'calendar';
  if (/قیمت|مبلغ|ارزش|درآمد|خرید/.test(title)) return 'wallet';
  if (/تخفیف|استفاده/.test(title)) return 'discount';
  if (/دسترسی|فعال|وضعیت/.test(title)) return 'shield';
  if (/مشتری|کاربر|نام/.test(title)) return 'person';
  if (/نظر/.test(title)) return 'review';
  if (/وزن|دسته/.test(title)) return 'products';
  return 'receipt';
}

export default function RecordCards<T extends object>({
  dataSource,
  rowKey,
  columns,
  pagination = {},
  rowSelection,
  icon = 'receipt',
  label = 'فهرست اطلاعات',
  featuredField,
  avatar,
}: {
  dataSource: readonly T[];
  rowKey: keyof T;
  columns: Field<T>[];
  pagination?: false | PaginationProps;
  rowSelection?: { selectedRowKeys: Key[]; onChange: (keys: Key[], rows: T[]) => void };
  icon?: AdminIconName;
  label?: string;
  featuredField?: string;
  avatar?: (record: T) => ReactNode;
}) {
  const [localPage, setLocalPage] = useState(1);
  const pageSize = pagination ? (pagination.pageSize ?? 10) : dataSource.length;
  const total = pagination ? (pagination.total ?? dataSource.length) : dataSource.length;
  const page = pagination
    ? (pagination.current ?? Math.min(localPage, Math.max(1, Math.ceil(total / pageSize))))
    : 1;
  const serverPage = pagination && pagination.total !== undefined;
  const records =
    pagination && !serverPage
      ? dataSource.slice((page - 1) * pageSize, page * pageSize)
      : dataSource;
  const keyOf = (record: T) => String(record[rowKey]);
  const selectedKeys = new Set(rowSelection?.selectedRowKeys.map(String));
  const select = (keys: Set<string>) =>
    rowSelection?.onChange(
      [...keys],
      dataSource.filter((record) => keys.has(keyOf(record))),
    );
  const allSelected =
    records.length > 0 && records.every((record) => selectedKeys.has(keyOf(record)));
  const someSelected = records.some((record) => selectedKeys.has(keyOf(record)));
  const titleField = columns[0];
  const valueOf = (field: Field<T>, record: T, index: number): ReactNode => {
    const value = field.dataIndex ? record[field.dataIndex] : undefined;
    if (field.render) return field.render(value, record, index);
    return typeof value === 'string' || typeof value === 'number' ? value : '—';
  };
  const statusField = columns.find((field) => field.title === 'وضعیت' || field.title === 'دسترسی');
  const featured = columns.find((field) => field.title === featuredField);
  const actions = columns.filter((field) => ['عملیات', 'ویرایش دسترسی'].includes(field.title));
  const fields = columns.filter(
    (field) =>
      field !== titleField &&
      field !== statusField &&
      field !== featured &&
      !actions.includes(field),
  );
  const isWide = (field: Field<T>) => field.wide || /نظر|بخش‌های مجاز/.test(field.title);
  const narrowFields = fields.filter((field) => !isWide(field));
  const displayFields = [...narrowFields, ...fields.filter(isWide)];
  return (
    <div aria-label={label} className="min-w-0 space-y-4">
      {rowSelection && records.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8ded1] bg-[#fbf7ef] px-4 py-2.5 text-xs">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(event) => {
              const next = new Set(selectedKeys);
              for (const record of records) {
                if (event.target.checked) next.add(keyOf(record));
                else next.delete(keyOf(record));
              }
              select(next);
            }}
          >
            انتخاب همهٔ این صفحه
          </Checkbox>
          <span className="text-[#76685d]">{formatNumber(selectedKeys.size)} مورد انتخاب شده</span>
        </div>
      )}
      {!records.length ? (
        <div className="rounded-3xl border border-[#e8ded1] bg-[#fcf9f3] py-10">
          <Empty description="موردی برای نمایش پیدا نشد." />
        </div>
      ) : (
        <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
          {records.map((record, index) => {
            const title = titleField ? valueOf(titleField, record, index) : label;
            const actionValues = actions
              .map((field) => ({ field, value: valueOf(field, record, index) }))
              .filter(({ value }) => value !== null && value !== undefined && value !== false);
            return (
              <article
                key={keyOf(record)}
                data-admin-record
                className="relative min-w-0 overflow-hidden rounded-3xl border border-[#e8ded1] bg-white p-4 shadow-[0_6px_22px_#62452f08] transition-shadow duration-300 hover:shadow-[0_12px_30px_#62452f14] sm:p-5"
              >
                <div className="absolute inset-x-5 top-0 h-[3px] rounded-full bg-gradient-to-l from-[#d5ac55] via-[#b7825b] to-[#96140d]" />
                <header className="mb-3 flex items-start gap-3">
                  {avatar ? (
                    avatar(record)
                  ) : (
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8d6b1] bg-gradient-to-br from-[#f7e8c3] to-[#e1c88d] text-[#96140d]">
                      <AdminIcon name={icon} width={22} height={22} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[12px] text-[#76685d]">{titleField?.title ?? label}</p>
                    <h3 className="[overflow-wrap:anywhere] text-base leading-7 font-extrabold text-[#76100b]">
                      {title}
                    </h3>
                  </div>
                  {statusField && (
                    <div className="max-w-[45%] shrink-0 [&_.ant-tag]:!m-0 [&_.ant-tag]:!whitespace-normal">
                      {valueOf(statusField, record, index)}
                    </div>
                  )}
                  {rowSelection && (
                    <Checkbox
                      aria-label={`انتخاب مورد ${formatNumber(index + 1)}`}
                      checked={selectedKeys.has(keyOf(record))}
                      onChange={(event) => {
                        const next = new Set(selectedKeys);
                        if (event.target.checked) next.add(keyOf(record));
                        else next.delete(keyOf(record));
                        select(next);
                      }}
                    />
                  )}
                </header>
                {featured && (
                  <div className="mb-3 rounded-2xl border border-[#e5d1aa] bg-gradient-to-l from-[#f4e8d3] to-[#fcf9f3] px-3 py-2.5">
                    <p className="mb-1 flex items-center gap-1.5 text-[12px] text-[#76685d]">
                      <AdminIcon name={fieldIcon(featured.title)} width={14} height={14} />
                      {featured.title}
                    </p>
                    <div className="[overflow-wrap:anywhere] text-base font-bold text-[#96140d]">
                      {valueOf(featured, record, index)}
                    </div>
                  </div>
                )}
                <dl className="grid min-w-0 grid-cols-2 gap-2">
                  {displayFields.map((field) => (
                    <div
                      key={field.title}
                      className={`min-w-0 rounded-xl bg-[#f8f3ea] p-3 ${isWide(field) || (narrowFields.length % 2 === 1 && field === narrowFields.at(-1)) ? 'col-span-2' : ''}`}
                    >
                      <dt className="mb-1.5 flex items-center gap-1.5 text-[12px] text-[#76685d]">
                        <AdminIcon
                          name={field.icon ?? fieldIcon(field.title)}
                          width={14}
                          height={14}
                          className="shrink-0 text-[#b7825b]"
                        />
                        {field.title}
                      </dt>
                      <dd className="[overflow-wrap:anywhere] text-sm leading-6 font-semibold text-[#62452f] [&_.ant-tag]:!whitespace-normal [&_.ant-tag]:!max-w-full">
                        {valueOf(field, record, index)}
                      </dd>
                    </div>
                  ))}
                </dl>
                {actionValues.length > 0 && (
                  <footer className="mt-3 space-y-2 border-t border-dashed border-[#e5d7c2] pt-3">
                    {actionValues.map(({ field, value }) => (
                      <div
                        key={field.title}
                        className="flex flex-wrap items-center gap-2 [&_.ant-space]:!flex [&_.ant-space]:!flex-wrap [&_.ant-btn]:!h-auto [&_.ant-btn]:!min-h-11 [&_.ant-btn]:!max-w-full [&_.ant-btn]:!whitespace-normal [&_a]:max-w-full"
                      >
                        <span className="sr-only">{field.title}</span>
                        {value}
                      </div>
                    ))}
                  </footer>
                )}
              </article>
            );
          })}
        </div>
      )}
      {pagination !== false && total > 0 && (
        <Pagination
          {...pagination}
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          onChange={(next, size) => {
            setLocalPage(next);
            pagination.onChange?.(next, size);
          }}
          className="!flex !flex-wrap !justify-center !gap-y-2"
        />
      )}
    </div>
  );
}
