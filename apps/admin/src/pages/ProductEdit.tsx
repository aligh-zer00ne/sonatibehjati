import { useNavigate, useParams } from 'react-router-dom';
import { Typography, App } from 'antd';
import { AdminProductDocument, AdminProductsDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import ProductEditor from '../components/ProductEditor';
import DataState from '../components/DataState';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const existing = useAdminQuery(AdminProductDocument, { id: id ?? '' }, Boolean(id));
  const creating = useAdminQuery(AdminProductsDocument, { input: { page: 1, pageSize: 1 } }, !id);
  const data = id ? existing.data : creating.data;
  if (!data) {
    const query = id ? existing : creating;
    return <DataState error={query.error} retry={query.refresh} />;
  }
  return (
    <>
      <Typography.Title level={2}>{id ? 'ویرایش محصول' : 'محصول جدید'}</Typography.Title>
      <ProductEditor
        key={id ?? 'new'}
        product={existing.data?.adminProduct ?? null}
        categories={data.categories}
        onCancel={() => navigate('/admin/products')}
        onSaved={() => {
          void message.success('محصول ذخیره شد.');
          navigate('/admin/products');
        }}
      />
    </>
  );
}
