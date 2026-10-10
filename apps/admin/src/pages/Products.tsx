import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Input, Select, Button, Table, Tag, Space, Popconfirm, App, Typography } from 'antd';
import { formatPrice, formatNumber } from '@behjati/shared';
import {
  AdminProductsDocument,
  SetAdminProductActiveDocument,
  DeleteAdminProductDocument,
  type AdminProductFieldsFragment,
  type ProductSort,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import DataState from '../components/DataState';
import PromotionEditor from '../components/PromotionEditor';
import ProductEditor from '../components/ProductEditor';
export default function Products({ promotionsOnly = false }: { promotionsOnly?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const search = (params.get('search') ?? '').slice(0, 100);
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState<ProductSort>('NEWEST');
  const [editing, setEditing] = useState<AdminProductFieldsFragment | 'new' | null>(
    params.get('new') === '1' ? 'new' : null,
  );
  const [selected, setSelected] = useState<AdminProductFieldsFragment[]>([]);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { message } = App.useApp();
  const query = useAdminQuery(AdminProductsDocument, {
    input: {
      page,
      pageSize: 20,
      search,
      active: active === 'all' ? null : active === 'active',
      categoryId: categoryId || null,
      sort,
    },
  });
  async function change(product: AdminProductFieldsFragment, remove: boolean) {
    setPending(true);
    try {
      if (remove) {
        const result = await adminRequest(DeleteAdminProductDocument, {
          id: product.id,
          expectedUpdatedAt: product.updatedAt,
        });
        void message.success(
          result.deleteAdminProduct.deleted
            ? 'محصول حذف شد.'
            : 'محصول در سفارش استفاده شده؛ غیرفعال شد.',
        );
      } else {
        await adminRequest(SetAdminProductActiveDocument, {
          id: product.id,
          isActive: !product.isActive,
          expectedUpdatedAt: product.updatedAt,
        });
        void message.success('وضعیت محصول تغییر کرد.');
      }
      query.refresh();
    } catch (error) {
      void message.error(error instanceof Error ? error.message : 'تغییر انجام نشد.');
      query.refresh();
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>
          {promotionsOnly ? 'تخفیف‌ها و جشنواره‌ها' : 'محصولات'}
        </Typography.Title>
        <Button type="primary" onClick={() => setEditing('new')} disabled={!query.data || pending}>
          محصول جدید
        </Button>
      </div>
      {promotionsOnly && (
        <p className="text-sm text-[#7d746a]">
          محصولات را انتخاب کنید و «تخفیف / جشنواره» را بزنید. برای تخفیف یک محصول نیز می‌توانید از
          ویرایش آن استفاده کنید.
        </p>
      )}
      <Card>
        <Button
          className="mb-3"
          disabled={!selected.length || pending}
          onClick={() => setPromotionOpen(true)}
        >
          تخفیف / جشنواره ({formatNumber(selected.length)} محصول)
        </Button>
        <Space wrap>
          <Input.Search
            aria-label="جستجوی محصول"
            placeholder="عنوان یا نامک"
            maxLength={100}
            allowClear
            onSearch={(value) => {
              setParams(value ? { search: value } : {});
              setPage(1);
              setSelected([]);
            }}
          />
          <Select
            aria-label="فیلتر دسته‌بندی"
            className="min-w-44"
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              setPage(1);
              setSelected([]);
            }}
            options={[
              { value: '', label: 'همه دسته‌ها' },
              ...(query.data?.categories ?? []).map((category) => ({
                value: category.id,
                label: category.title,
              })),
            ]}
          />
          <Select
            aria-label="فیلتر فعال بودن"
            className="min-w-36"
            value={active}
            onChange={(value) => {
              setActive(value);
              setPage(1);
              setSelected([]);
            }}
            options={[
              { value: 'all', label: 'همه محصولات' },
              { value: 'active', label: 'فعال' },
              { value: 'inactive', label: 'غیرفعال' },
            ]}
          />
          <Select
            aria-label="مرتب‌سازی محصولات"
            className="min-w-40"
            value={sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
              setSelected([]);
            }}
            options={[
              { value: 'NEWEST', label: 'جدیدترین' },
              { value: 'PRICE_ASC', label: 'قیمت کمتر' },
              { value: 'PRICE_DESC', label: 'قیمت بیشتر' },
              { value: 'NAME_ASC', label: 'نام محصول' },
            ]}
          />
        </Space>
      </Card>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <Card>
          <Table<AdminProductFieldsFragment>
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selected.map((product) => product.id),
              onChange: (_, rows) => setSelected(rows),
            }}
            dataSource={query.data.adminProducts.items}
            scroll={{ x: 800 }}
            pagination={{
              current: page,
              pageSize: 20,
              total: query.data.adminProducts.total,
              showSizeChanger: false,
              onChange: (value) => {
                setPage(value);
                setSelected([]);
              },
            }}
            columns={[
              { title: 'محصول', dataIndex: 'title' },
              { title: 'دسته', render: (_, product) => product.category.title },
              { title: 'وزن', dataIndex: 'weight' },
              { title: 'قیمت اصلی', render: (_, product) => formatPrice(product.price) },
              {
                title: 'تخفیف',
                render: (_, product) =>
                  product.discountPercent ? (
                    <Tag color="gold">
                      {product.discountTitle || 'تخفیف'}؛ {formatNumber(product.discountPercent)}٪
                    </Tag>
                  ) : (
                    '—'
                  ),
              },
              {
                title: 'وضعیت',
                render: (_, product) => (
                  <Tag color={product.isActive ? 'green' : 'default'}>
                    {product.isActive ? 'فعال' : 'غیرفعال'}
                  </Tag>
                ),
              },
              {
                title: 'عملیات',
                render: (_, product) => (
                  <Space wrap>
                    <Button
                      disabled={pending}
                      onClick={() => setEditing(product)}
                      aria-label={`ویرایش ${product.title}`}
                    >
                      ویرایش
                    </Button>
                    <Button
                      disabled={pending}
                      onClick={() => void change(product, false)}
                      aria-label={`${product.isActive ? 'غیرفعال' : 'فعال'} کردن ${product.title}`}
                    >
                      {product.isActive ? 'غیرفعال' : 'فعال'}
                    </Button>
                    <Popconfirm
                      title="حذف محصول"
                      description="محصول استفاده‌شده در سفارش غیرفعال می‌شود."
                      onConfirm={() => change(product, true)}
                      okText="تأیید"
                      cancelText="انصراف"
                    >
                      <Button danger disabled={pending} aria-label={`حذف ${product.title}`}>
                        حذف
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}
      {promotionOpen && selected.length > 0 && (
        <PromotionEditor
          products={selected}
          onCancel={() => setPromotionOpen(false)}
          onSaved={() => {
            setPromotionOpen(false);
            setSelected([]);
            query.refresh();
            void message.success('تخفیف محصولات ذخیره شد.');
          }}
        />
      )}
      {editing && query.data && (
        <ProductEditor
          key={editing === 'new' ? 'new' : editing.id}
          product={editing === 'new' ? null : editing}
          categories={query.data.categories}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            query.refresh();
            void message.success('محصول ذخیره شد.');
          }}
        />
      )}
    </>
  );
}
