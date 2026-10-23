import PageHeading from '../components/PageHeading';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import {
  AdminProductDocument,
  AdminProductsDocument,
  type AdminProductFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import ProductEditor from '../components/ProductEditor';
import ProductPreview from '../components/ProductPreview';
import DataState from '../components/DataState';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<AdminProductFieldsFragment | null>(null);
  const { message } = App.useApp();
  const existing = useAdminQuery(AdminProductDocument, { id: id ?? '' }, Boolean(id));
  const creating = useAdminQuery(AdminProductsDocument, { input: { page: 1, pageSize: 1 } }, !id);
  const data = id ? existing.data : creating.data;
  if (!data) {
    const query = id ? existing : creating;
    return <DataState error={query.error} retry={query.refresh} />;
  }
  const product = existing.data?.adminProduct ?? (saved?.id === id ? saved : null);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading icon="products" description="اطلاعات، تصاویر و تعرفه‌های این محصول.">
          {id ? 'ویرایش محصول' : 'محصول جدید'}
        </PageHeading>
        {product && <ProductPreview slug={product.slug} isActive={product.isActive} />}
      </div>
      <ProductEditor
        key={product?.updatedAt ?? 'new'}
        product={product}
        categories={data.categories}
        onCancel={() => navigate('/admin/products')}
        onSaved={(product) => {
          setSaved(product);
          void message.success('محصول ذخیره شد.');
          if (!id) navigate(`/admin/products/${product.id}/edit`, { replace: true });
          else existing.refresh();
        }}
      />
    </>
  );
}
