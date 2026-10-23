import PageHeading from '../components/PageHeading';
import { FilterButton, FilterBar, FilterChips } from '../components/FilterButtons';
import AdminIcon from '../components/AdminIcon';
import DashboardProductImage from '../components/DashboardProductImage';
import RecordCards from '../components/RecordCards';
import ProductPreview from '../components/ProductPreview';
import { Money } from '../components/Money';
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Button, Tag, Space, Popconfirm, App } from 'antd';
import { formatNumber } from '@behjati/shared';
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
export default function Products() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const search = (params.get('search') ?? '').slice(0, 100);
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState<ProductSort>('NEWEST');
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
        <PageHeading icon="products" description="محصولات، قیمت‌گذاری و موجودی فروشگاه.">
          محصولات
        </PageHeading>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!selected.length || pending} onClick={() => setPromotionOpen(true)}>
            تخفیف / جشنواره ({formatNumber(selected.length)} محصول)
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/admin/products/new')}
            disabled={!query.data || pending}
          >
            محصول جدید
          </Button>
        </div>
      </div>
      <FilterBar label="فیلترهای محصولات">
        <FilterButton label="جستجوی محصول" active={!!search}>
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
        </FilterButton>
        <FilterButton label="دسته‌بندی" active={!!categoryId}>
          <FilterChips
            label="فیلتر دسته‌بندی"
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
        </FilterButton>
        <FilterButton label="وضعیت محصول" active={active !== 'all'}>
          <FilterChips<'all' | 'active' | 'inactive'>
            label="فیلتر فعال بودن"
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
        </FilterButton>
        <FilterButton label="مرتب‌سازی محصولات" active={sort !== 'NEWEST'}>
          <FilterChips<ProductSort>
            label="مرتب‌سازی محصولات"
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
        </FilterButton>
      </FilterBar>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <RecordCards<AdminProductFieldsFragment>
          rowKey="id"
          icon="products"
          label="فهرست محصولات"
          avatar={(product) => (
            <DashboardProductImage src={product.images[0]?.url} title={product.title} />
          )}
          featuredField="قیمت اصلی"
          rowSelection={{
            selectedRowKeys: selected.map((product) => product.id),
            onChange: (_, rows) => setSelected(rows),
          }}
          dataSource={query.data.adminProducts.items}
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
            { title: 'قیمت اصلی', render: (_, product) => <Money amount={product.price} /> },
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
                  <ProductPreview slug={product.slug} isActive={product.isActive} />
                  <Button
                    disabled={pending}
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    aria-label={`ویرایش ${product.title}`}
                    icon={<AdminIcon name="edit" width={17} height={17} />}
                  >
                    ویرایش
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => void change(product, false)}
                    aria-label={`${product.isActive ? 'غیرفعال' : 'فعال'} کردن ${product.title}`}
                    icon={<AdminIcon name="shield" width={17} height={17} />}
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
                    <Button
                      danger
                      disabled={pending}
                      aria-label={`حذف ${product.title}`}
                      icon={<AdminIcon name="trash" width={17} height={17} />}
                    >
                      حذف
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
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
    </>
  );
}
