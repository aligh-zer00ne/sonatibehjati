import CompactTabs from './CompactTabs';
import AdminIcon from './AdminIcon';
import { useState, useEffect, useImperativeHandle, useId, type Ref } from 'react';
import { Form, Input, InputNumber, Switch, Select, Button, Alert, App } from 'antd';
import { parseShippingWeight } from '@behjati/shared/sales';
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
export type ProductEditorHandle = { requestClose: () => void };
export default function ProductEditor({
  product,
  categories,
  onSaved,
  onCancel,
  inDialog = false,
  closeRef,
}: {
  product: AdminProductFieldsFragment | null;
  categories: AdminProductsQuery['categories'];
  onSaved: (product: AdminProductFieldsFragment) => void;
  onCancel: () => void;
  inDialog?: boolean;
  closeRef?: Ref<ProductEditorHandle>;
}) {
  const activeId = useId();
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
  const requestClose = () => {
    if (pending || uploading) return;
    if (!dirty) return onCancel();
    modal.confirm({
      title: 'تغییرات محصول ذخیره نشده است',
      content: 'با بستن ویرایش، پیش‌نویس در همین مرورگر باقی می‌ماند.',
      okText: 'نگه‌داشتن پیش‌نویس و برگشت',
      cancelText: 'ادامه ویرایش',
      onOk: onCancel,
    });
  };
  useImperativeHandle(closeRef, () => ({ requestClose }));
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  const initial = {
    shippingWeightGrams:
      product?.shippingWeightGrams ?? (product ? parseShippingWeight(product.weight) : undefined),
    shippingBaseCost: product?.shippingBaseCost ?? undefined,
    shippingAdditionalKgCost: product?.shippingAdditionalKgCost ?? undefined,
    ...(draft?.values ?? {
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
    }),
  };
  const title = Form.useWatch('title', form);
  const images = Form.useWatch('images', form) as Array<{ url: string; alt: string }> | undefined;
  const active = Form.useWatch('isActive', form);
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
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-[#701e2a]">
        <AdminIcon name="products" width={18} /> مشخصات و قیمت
      </h3>
      <div className={`grid gap-x-4 sm:grid-cols-2 ${inDialog ? 'lg:grid-cols-3' : ''}`}>
        <Form.Item
          name="title"
          label="عنوان محصول"
          rules={[{ required: true, message: 'عنوان لازم است.' }]}
        >
          <Input
            maxLength={150}
            placeholder="مثلاً ارده سنتی ۵۰۰ گرمی"
            prefix={<AdminIcon name="products" width={16} />}
          />
        </Form.Item>
        <Form.Item
          name="slug"
          label="نامک انگلیسی"
          rules={[{ required: true, message: 'نامک لازم است.' }]}
        >
          <Input
            dir="ltr"
            maxLength={150}
            placeholder="traditional-tahini"
            prefix={<AdminIcon name="link" width={16} />}
          />
        </Form.Item>
        <Form.Item
          name="price"
          label="قیمت (ریال)"
          rules={[{ required: true, message: 'قیمت لازم است.' }]}
        >
          <MoneyInput disabled={pending} />
        </Form.Item>
        <Form.Item
          name="weight"
          label="وزن یا حجم"
          rules={[{ required: true, message: 'وزن لازم است.' }]}
        >
          <Input
            maxLength={100}
            placeholder="مثلاً ۵۰۰ گرم"
            prefix={<AdminIcon name="products" width={16} />}
          />
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
      <details className="group/details mb-4 rounded-2xl border border-[#e8ded1] bg-[#fcfaf5] p-3">
        <summary className="cursor-pointer text-sm font-bold text-[#701e2a] group-open/details:mb-3">
          معرفی و توضیحات محصول (اختیاری)
        </summary>
        <Form.Item name="shortDescription" label="معرفی کوتاه">
          <Input.TextArea maxLength={500} rows={2} />
        </Form.Item>
        <Form.Item name="description" label="توضیحات">
          <Input.TextArea maxLength={10000} rows={5} />
        </Form.Item>
      </details>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#e8ded1] bg-[#fcfaf5] px-3 py-2.5">
        <label htmlFor={activeId} className="text-sm font-semibold">
          فعال بودن محصول
        </label>
        <Form.Item name="isActive" valuePropName="checked" noStyle>
          <Switch id={activeId} />
        </Form.Item>
      </div>
    </>
  );
  return (
    <div data-product-editor>
      {!inDialog && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e5d5ba] bg-[#faf5e9] p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#701e2a] text-[#f5d88f]">
            <AdminIcon name="products" width={25} />
          </span>
          <div>
            <h2 className="font-extrabold text-[#4e141c]">
              {product ? 'ویرایش مشخصات کالا' : 'آماده‌سازی محصول برای فروش'}
            </h2>
            <p className="mt-1 text-xs leading-6 text-[#796653]">
              مشخصات، تصویر و وزن بسته را کامل کنید؛ تخفیف در بخش جداگانه در دسترس است.
            </p>
          </div>
        </div>
      )}
      {dirty && (
        <Alert
          type="info"
          className="!mb-4"
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
        className="[&_.ant-form-item]:!mb-4 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!font-medium"
        initialValues={initial}
        disabled={pending}
        onValuesChange={remember}
        onFinishFailed={({ errorFields }) => {
          const name = String(errorFields[0]?.name[0] ?? '');
          setTab(
            name === 'images'
              ? 'images'
              : name.startsWith('shipping')
                ? 'shipping'
                : name.startsWith('discount')
                  ? 'discount'
                  : 'general',
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
            shippingWeightGrams,
            shortDescription,
            description,
            categoryId,
            isActive,
            badge,
            images,
          } = raw;
          const parsed = adminProductInputSchema.safeParse({
            ...promotionFormInput(raw),
            shippingWeightGrams,
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
                : String(issue?.path[0]).startsWith('shipping')
                  ? 'shipping'
                  : String(issue?.path[0]).startsWith('discount')
                    ? 'discount'
                    : 'general',
            );
            setError(issue?.message ?? 'اطلاعات محصول را کامل کنید.');
            return;
          }
          setPending(true);
          try {
            const result = await adminRequest(SaveAdminProductDocument, {
              id: product?.id,
              expectedUpdatedAt: draft?.version ?? product?.updatedAt,
              input: parsed.data,
            });
            forgetDraft();
            setDirty(false);
            onSaved(result.saveAdminProduct);
          } catch (error) {
            setError(error instanceof Error ? error.message : 'محصول ذخیره نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <div
          className={`grid items-start gap-5 ${inDialog ? '' : 'xl:grid-cols-[minmax(0,1fr)_260px]'}`}
        >
          <section
            className={
              inDialog
                ? 'min-w-0'
                : 'min-w-0 rounded-[24px] border border-[#e8ded1] bg-white p-4 sm:p-6'
            }
          >
            <CompactTabs
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
                          <Money
                            amount={Math.max(1, Math.floor((price * (100 - percent)) / 100))}
                          />
                        </div>
                      )}
                    </>
                  ),
                },
                {
                  key: 'shipping',
                  label: 'وزن ارسال',
                  forceRender: true,
                  children: (
                    <>
                      <Alert
                        type="info"
                        showIcon
                        className="!mb-5"
                        title="تعرفه و ارسال رایگان از بخش «مدیریت ارسال» برای کل سبد تعیین می‌شود. اینجا فقط وزن واقعی هر بستهٔ محصول را وارد کنید."
                      />
                      <div className="grid gap-x-5 sm:grid-cols-2">
                        <Form.Item
                          name="shippingWeightGrams"
                          label="وزن بسته برای ارسال (گرم)"
                          rules={[{ required: true, type: 'number', min: 1, max: 1000000 }]}
                          extra="وزن واقعی محصول همراه بسته‌بندی؛ برای یک کیلو، ۱۰۰۰ وارد کنید."
                        >
                          <InputNumber min={1} max={1000000} precision={0} className="!w-full" />
                        </Form.Item>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </section>
          {!inDialog && (
            <aside
              aria-label="خلاصه محصول"
              className="hidden rounded-[24px] border border-[#e5d5ba] bg-[#faf5e9] p-4 xl:sticky xl:top-40 xl:block"
            >
              <p className="mb-3 text-xs font-bold text-[#796653]">خلاصهٔ محصول</p>
              <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-[#e8ded1] bg-white">
                {images?.[0]?.url ? (
                  <img
                    src={images[0].url}
                    alt={images[0].alt || 'تصویر محصول'}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <AdminIcon name="products" width={48} className="text-[#b49b76]" />
                )}
              </div>
              <h3 className="mt-4 break-words font-extrabold text-[#4e141c]">
                {title || 'نام محصول'}
              </h3>
              <p className="mt-2 text-lg font-extrabold">
                {typeof price === 'number' ? <Money amount={price} /> : 'قیمت را وارد کنید'}
              </p>
              <p className="mt-3 rounded-xl border border-[#e5d5ba] bg-white px-3 py-2 text-xs text-[#796653]">
                {active
                  ? 'پس از ذخیره در فروشگاه نمایش داده می‌شود'
                  : 'این محصول در فروشگاه نمایش داده نمی‌شود'}
              </p>
            </aside>
          )}
        </div>
        {error && <Alert className="!mt-4" title={error} type="error" role="alert" showIcon />}
        <div
          className={`sticky z-20 mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e5d5ba] bg-white/95 p-3 shadow-[0_8px_30px_#62452f18] backdrop-blur-sm ${inDialog ? '-bottom-4 sm:-bottom-5' : 'bottom-3'}`}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={pending}
            disabled={uploading}
            icon={<AdminIcon name="checkCircle" width={18} />}
          >
            ذخیره محصول
          </Button>
          <Button disabled={pending || uploading} onClick={requestClose}>
            {inDialog ? 'انصراف' : 'بازگشت به محصولات'}
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
    </div>
  );
}
