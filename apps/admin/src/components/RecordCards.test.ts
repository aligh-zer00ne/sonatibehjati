import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RecordCards from './RecordCards';

const records = Array.from({ length: 21 }, (_, index) => ({
  id: `record-${index}`,
  name: `customer-${index}`,
  value: index * 1000,
}));
const columns = [
  { title: 'نام', dataIndex: 'name' as const },
  { title: 'مبلغ', dataIndex: 'value' as const },
  {
    title: 'عملیات',
    render: (_: unknown, record: (typeof records)[number]) =>
      createElement('a', { href: `/admin/orders?userId=${record.id}` }, 'سفارش‌ها'),
  },
];
const render = (extra: Partial<Parameters<typeof RecordCards<(typeof records)[number]>>[0]> = {}) =>
  renderToStaticMarkup(
    createElement(RecordCards<(typeof records)[number]>, {
      dataSource: records,
      rowKey: 'id',
      columns,
      ...extra,
    }),
  );

describe('record card data presentation', () => {
  it('keeps every field and action while paginating a local report', () => {
    const html = render({ pagination: { current: 2, pageSize: 10 } });
    expect(html.match(/data-admin-record/g)).toHaveLength(10);
    expect(html).toContain('customer-10');
    expect(html).toContain('customer-19');
    expect(html).not.toContain('customer-9<');
    expect(html).not.toContain('customer-20');
    expect(html).toContain('10000');
    expect(html).toContain('/admin/orders?userId=record-10');
    expect(html).not.toContain('<table');
  });
  it('does not slice already paginated server results a second time', () => {
    const html = render({
      dataSource: records.slice(20),
      pagination: { current: 3, pageSize: 10, total: 21 },
    });
    expect(html.match(/data-admin-record/g)).toHaveLength(1);
    expect(html).toContain('customer-20');
    expect(html).toContain('/admin/orders?userId=record-20');
  });
  it('shows all coupon/account records when pagination is disabled and escapes content', () => {
    const html = render({
      pagination: false,
      dataSource: [...records, { id: 'escaped', name: '<script>alert(1)</script>', value: 1 }],
    });
    expect(html.match(/data-admin-record/g)).toHaveLength(22);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)');
  });
  it('preserves the selected-product checkbox state', () => {
    const html = render({
      dataSource: records.slice(0, 2),
      rowSelection: { selectedRowKeys: ['record-0'], onChange: () => {} },
    });
    expect(html.match(/type="checkbox"/g)).toHaveLength(3);
    expect(html.match(/ checked=""/g)).toHaveLength(1);
    expect(html).toContain('انتخاب همهٔ این صفحه');
  });
  it('handles empty filtered results without empty cards or actions', () => {
    const html = render({ dataSource: [] });
    expect(html).toContain('موردی برای نمایش پیدا نشد.');
    expect(html).not.toContain('data-admin-record');
    expect(html).not.toContain('/admin/orders?');
  });
});
