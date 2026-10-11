import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Switch, Select, Button, Alert, App } from 'antd';
import { adminProductInputSchema } from '@behjati/shared/admin';
import {
  SaveAdminProductDocument,
  type AdminProductFieldsFragment,
  type AdminProductsQuery,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import { useAdmin } from '../auth/AdminProvider';
import PromotionFields, { promotionFormInput, promotionFormValues } from './PromotionFields';
import ProductImagesFields from './ProductImagesFields';
import { MoneyInput, Money } from './Money';

type Draft = { values: Record<string, unknown>; version: string | null };
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
  const { admin } = useAdmin();
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('general');
  const draftKey = `behjati-product-draft:${admin?.id}:${product?.id ?? 'new'}`;
  const [draft] = useState<Draft | null>(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null');
      return value && typeof value.values === 'object' && value.values !== null ? value : null;
    } catch {
      return null;
    }
  });
  const [dirty, setDirty] = useState(Boolean(draft));
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  const initial = draft?.values ?? {
    ...(product
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
        }),
    ...promotionFormValues(product),
  };
  const price = Form.useWatch('price', form);
  const percent = Form.useWatch('discountPercent', form);
  const forgetDraft = () => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch {
      /* Storage may be unavailable. */
    }
  };
  const remember = () => {
    setDirty(true);
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          values: form.getFieldsValue(true),
          version: draft?.version ?? product?.updatedAt ?? null,
        }),
      );
    } catch {
      /* The form stays editable even when browser storage is unavailable. */
    }
  };
  const general = (
    <>
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
          <MoneyInput disabled={pending} />
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
            options={categories.map((category) => ({ value: category.id, label: category.title }))}
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
        <Input.TextArea maxLength={10000} rows={5} />
      </Form.Item>
      <Form.Item name="isActive" label="فعال بودن محصول" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );
  return (
    <Card>
      {dirty && (
        <Alert
          type="info"
          className="mb-4"
          title={
            draft
              ? 'پیش‌نویس قبلی بازیابی شد. تغییرات را بررسی و ذخیره کنید.'
              : 'تغییرات ذخیره نشده؛ پیش‌نویس در همین مرورگر نگهداری می‌شود.'
          }
        />
      )}
      <Form
        form={form}
        layout="vertical"
        initialValues={initial}
        disabled={pending}
        onValuesChange={remember}
        onFinishFailed={({ errorFields }) => {
          const name = String(errorFields[0]?.name[0] ?? '');
          setTab(
            name === 'images' ? 'images' : name.startsWith('discount') ? 'discount' : 'general',
          );
        }}
        onFinish={async (raw) => {
          if (pending || uploading) return;
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
            ...promotionFormInput(raw),
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
            const issue = parsed.error.issues[0];
            setTab(
              issue?.path[0] === 'images'
                ? 'images'
                : String(issue?.path[0]).startsWith('discount')
                  ? 'discount'
                  : 'general',
            );
            setError(issue?.message ?? 'اطلاعات محصول را کامل کنید.');
            return;
          }
          setPending(true);
          try {
            await adminRequest(SaveAdminProductDocument, {
              id: product?.id,
              expectedUpdatedAt: draft?.version ?? product?.updatedAt,
              input: parsed.data,
            });
            forgetDraft();
            setDirty(false);
            onSaved();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'محصول ذخیره نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: 'general', label: 'اطلاعات کلی', forceRender: true, children: general },
            {
              key: 'images',
              label: 'آپلود تصویر',
              forceRender: true,
              children: (
                <ProductImagesFields
                  disabled={pending}
                  onUploadingChange={setUploading}
                  onImagesChange={remember}
                />
              ),
            },
            {
              key: 'discount',
              label: 'تخفیف',
              forceRender: true,
              children: (
                <>
                  <PromotionFields />
                  {typeof price === 'number' && percent > 0 && (
                    <div className="mt-3 rounded-lg bg-[#faf0dc] p-4">
                      <p className="mb-1 text-sm font-bold">قیمت پس از تخفیف</p>
                      <Money amount={Math.max(1, Math.floor((price * (100 - percent)) / 100))} />
                    </div>
                  )}
                </>
              ),
            },
          ]}
        />
        {error && <Alert className="mt-4" title={error} type="error" role="alert" showIcon />}
        <div className="mt-5 flex flex-wrap gap-3 border-t border-[#e8ded1] bg-[#fffdf9] py-4">
          <Button type="primary" htmlType="submit" loading={pending} disabled={uploading}>
            ذخیره محصول
          </Button>
          <Button
            disabled={pending || uploading}
            onClick={() => {
              if (!dirty) return onCancel();
              modal.confirm({
                title: 'تغییرات محصول ذخیره نشده است',
                content: 'برای برگشت به فهرست، پیش‌نویس را نگه دارید یا آن را حذف کنید.',
                okText: 'نگه‌داشتن پیش‌نویس و برگشت',
                cancelText: 'ادامه ویرایش',
                onOk: onCancel,
              });
            }}
          >
            بازگشت به محصولات
          </Button>
          {dirty && (
            <Button
              danger
              disabled={pending || uploading}
              onClick={() =>
                modal.confirm({
                  title: 'پیش‌نویس حذف شود؟',
                  okText: 'حذف پیش‌نویس',
                  cancelText: 'ادامه ویرایش',
                  onOk: () => {
                    forgetDraft();
                    setDirty(false);
                    onCancel();
                  },
                })
              }
            >
              حذف پیش‌نویس
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
}
