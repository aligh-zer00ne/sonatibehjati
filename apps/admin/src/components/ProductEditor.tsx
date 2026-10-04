import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, Button, Alert } from 'antd';
import { adminProductInputSchema } from '@behjati/shared/admin';
import {
  SaveAdminProductDocument,
  type AdminProductFieldsFragment,
  type AdminProductsQuery,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import ProductImagesFields from './ProductImagesFields';
export default function ProductEditor({
  product,
  categories,
  onSaved,
  onCancel,
}: {
  product: AdminProductFieldsFragment | null;
  categories: AdminProductsQuery['categories'];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const initial = product
    ? {
        ...product,
        categoryId: product.category.id,
        images: product.images.map(({ url, alt }) => ({ url, alt })),
      }
    : {
        isActive: true,
        price: 0,
        badge: '',
        shortDescription: '',
        description: '',
        images: [{ url: '', alt: '' }],
      };
  return (
    <Modal
      open
      title={product ? 'ویرایش محصول' : 'محصول جدید'}
      footer={null}
      width={720}
      onCancel={() => {
        if (!pending) onCancel();
      }}
      closable={!pending}
      maskClosable={!pending}
      destroyOnHidden
    >
      <Form
        layout="vertical"
        initialValues={initial}
        onFinish={async (raw) => {
          if (pending) return;
          setError('');
          const {
            title,
            slug,
            price,
            weight,
            shortDescription,
            description,
            categoryId,
            isActive,
            badge,
            images,
          } = raw;
          const parsed = adminProductInputSchema.safeParse({
            title,
            slug,
            price,
            weight,
            shortDescription,
            description,
            categoryId,
            isActive,
            badge,
            images,
          });
          if (!parsed.success) {
            setError(
              'اطلاعات محصول را کامل کنید؛ تصاویر باید مسیر محلی یا HTTPS و مبلغ صحیح تومان باشند.',
            );
            return;
          }
          setPending(true);
          try {
            await adminRequest(SaveAdminProductDocument, {
              id: product?.id,
              expectedUpdatedAt: product?.updatedAt,
              input: parsed.data,
            });
            onSaved();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'محصول ذخیره نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="grid gap-x-5 sm:grid-cols-2">
          <Form.Item
            name="title"
            label="عنوان محصول"
            rules={[{ required: true, message: 'عنوان لازم است.' }]}
          >
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="نامک انگلیسی"
            rules={[{ required: true, message: 'نامک لازم است.' }]}
          >
            <Input dir="ltr" maxLength={150} />
          </Form.Item>
          <Form.Item
            name="price"
            label="قیمت (تومان)"
            rules={[{ required: true, message: 'قیمت لازم است.' }]}
          >
            <InputNumber className="!w-full" min={0} max={2147483647} precision={0} />
          </Form.Item>
          <Form.Item
            name="weight"
            label="وزن یا حجم"
            rules={[{ required: true, message: 'وزن لازم است.' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="دسته‌بندی"
            rules={[{ required: true, message: 'دسته‌بندی لازم است.' }]}
          >
            <Select
              options={categories.map((category) => ({
                value: category.id,
                label: category.title,
              }))}
            />
          </Form.Item>
          <Form.Item name="badge" label="برچسب محصول">
            <Input maxLength={80} />
          </Form.Item>
        </div>
        <Form.Item name="shortDescription" label="معرفی کوتاه">
          <Input.TextArea maxLength={500} rows={2} />
        </Form.Item>
        <Form.Item name="description" label="توضیحات">
          <Input.TextArea maxLength={10000} rows={4} />
        </Form.Item>
        <Form.Item name="isActive" label="فعال بودن محصول" valuePropName="checked">
          <Switch />
        </Form.Item>
        <ProductImagesFields />
        {error && <Alert className="mt-4" title={error} type="error" role="alert" showIcon />}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="primary" htmlType="submit" loading={pending}>
            ذخیره محصول
          </Button>
          <Button disabled={pending} onClick={onCancel}>
            انصراف
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
