import { useRef, useState } from 'react';
import { Alert, App, Button, Form, Input } from 'antd';
import {
  storeInformationSchema,
  type StoreInformationValues,
} from '@behjati/shared/store-information';
import {
  AdminStoreInformationDocument,
  SaveAdminStoreInformationDocument,
  type StoreInformationFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import PageHeading from '../components/PageHeading';
import AdminIcon from '../components/AdminIcon';
import DataState from '../components/DataState';
import { persianDigits } from '../lib/format';

function StoreForm({
  initial,
  refresh,
}: {
  initial: StoreInformationFieldsFragment;
  refresh: () => void;
}) {
  const [form] = Form.useForm<StoreInformationValues>();
  const [version, setVersion] = useState(initial.updatedAt);
  const [configured, setConfigured] = useState(initial.isConfigured);
  const [showPreview, setShowPreview] = useState(false);
  const [savedValues, setSavedValues] = useState({
    name: initial.name,
    phone: initial.phone,
    address: initial.address,
    postalCode: initial.postalCode,
  });
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const { message, modal } = App.useApp();
  const values = { ...initial, ...Form.useWatch([], form) };
  const dirty = (Object.keys(savedValues) as Array<keyof StoreInformationValues>).some(
    (key) => values[key] !== savedValues[key],
  );
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
      <Form
        form={form}
        layout="vertical"
        initialValues={initial}
        disabled={pending}
        onFinish={async (raw) => {
          if (lock.current) return;
          const parsed = storeInformationSchema.safeParse(raw);
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
            return;
          }
          lock.current = true;
          setPending(true);
          setError('');
          try {
            const result = await adminRequest(SaveAdminStoreInformationDocument, {
              input: parsed.data,
              expectedUpdatedAt: version,
            });
            setVersion(result.saveAdminStoreInformation.updatedAt);
            setConfigured(true);
            setSavedValues(parsed.data);
            form.setFieldsValue(parsed.data);
            void message.success('اطلاعات فروشگاه ذخیره شد و در فاکتور و لیبل استفاده می‌شود.');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
          } finally {
            lock.current = false;
            setPending(false);
          }
        }}
        className="min-w-0 rounded-[24px] border border-[#e8ded1] bg-white !p-5 shadow-sm sm:!p-6 [&_.ant-form-item]:!mb-4"
      >
        <header className="mb-5 flex items-center gap-3 border-b border-[#eee5d9] pb-4">
          <img
            src="/images/logo-brand.png"
            alt="سنتی بهجتی"
            className="size-14 shrink-0 rounded-2xl border border-[#e8ded1] bg-[#fffcf8] p-1.5 object-contain"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold">هویت و نشانی فروشگاه</h2>
            <p className="mt-1 text-xs leading-6 text-[#857467]">
              اطلاعات فروشنده در فاکتور و فرستنده در لیبل
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[13px] font-bold ${dirty ? 'bg-[#fff1d5] text-[#886113]' : configured ? 'bg-[#e8f1e9] text-[#38634a]' : 'bg-[#f4eee6] text-[#857467]'}`}
          >
            {dirty ? 'ذخیره‌نشده' : configured ? 'ثبت‌شده' : 'تکمیل شود'}
          </span>
        </header>
        <Form.Item
          label="نام فروشگاه"
          name="name"
          rules={[{ required: true, whitespace: true, message: 'نام فروشگاه را وارد کنید.' }]}
        >
          <Input
            maxLength={120}
            prefix={<AdminIcon name="home" width={18} />}
            autoComplete="organization"
          />
        </Form.Item>
        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item
            label="شماره تماس"
            name="phone"
            rules={[{ required: true, whitespace: true, message: 'شماره تماس را وارد کنید.' }]}
          >
            <Input
              maxLength={30}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              aria-label="شماره تماس فروشگاه"
            />
          </Form.Item>
          <Form.Item
            label="کد پستی"
            name="postalCode"
            rules={[{ required: true, message: 'کد پستی ده‌رقمی را وارد کنید.' }]}
          >
            <Input
              aria-label="کد پستی فروشگاه"
              maxLength={10}
              dir="ltr"
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </Form.Item>
        </div>
        <Form.Item
          label="نشانی کامل فروشگاه"
          name="address"
          rules={[
            { required: true, whitespace: true, message: 'نشانی کامل فروشگاه را وارد کنید.' },
          ]}
          extra="استان، شهر، خیابان و پلاک"
        >
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 5 }}
            maxLength={600}
            showCount
            autoComplete="street-address"
          />
        </Form.Item>
        {error && (
          <Alert
            role="alert"
            type="error"
            title={error}
            className="!my-5"
            action={
              <Button
                disabled={pending}
                onClick={() =>
                  modal.confirm({
                    title: 'اطلاعات ذخیره‌شده دوباره دریافت شود؟',
                    content: 'ویرایش‌های ذخیره‌نشدهٔ این فرم کنار گذاشته می‌شوند.',
                    okText: 'دریافت اطلاعات جدید',
                    cancelText: 'ادامه ویرایش',
                    onOk: refresh,
                  })
                }
              >
                دریافت اطلاعات جدید
              </Button>
            }
          />
        )}
        <Button
          type="text"
          htmlType="button"
          aria-expanded={showPreview}
          aria-controls="store-print-preview"
          onClick={() => setShowPreview((value) => !value)}
          icon={<AdminIcon name="eye" width={18} />}
          className="!mb-3 !w-full !text-[#701e2a] xl:!hidden"
        >
          {showPreview ? 'بستن پیش‌نمایش چاپ' : 'پیش‌نمایش اطلاعات روی چاپ'}
        </Button>
        <div className="sticky bottom-0 z-10 -mx-1 mt-2 border-t border-[#eee5d9] bg-white/95 px-1 pt-3 pb-1 backdrop-blur-sm">
          <Button
            type="primary"
            htmlType="submit"
            loading={pending}
            icon={<AdminIcon name="check" width={20} />}
            className="!h-12 !w-full !font-bold"
          >
            ذخیره اطلاعات فروشگاه
          </Button>
        </div>
      </Form>
      <aside
        data-store-preview
        id="store-print-preview"
        className={`${showPreview ? 'block' : 'hidden'} space-y-4 rounded-[24px] border border-[#e8ded1] bg-[#fcf8ef] p-5 xl:sticky xl:top-36 xl:block`}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#f4e8d3] text-[#701e2a]">
            <AdminIcon name="print" />
          </span>
          <h2 className="text-base font-extrabold">پیش‌نمایش اطلاعات چاپ</h2>
        </div>
        <section className="overflow-hidden rounded-2xl border-2 border-black bg-white text-black">
          <h3 className="flex items-center gap-2 bg-black px-4 py-2 font-extrabold text-white">
            <AdminIcon name="home" width={19} />
            فرستنده
          </h3>
          <dl className="space-y-2 p-3 text-sm leading-6 [overflow-wrap:anywhere] [&>div]:grid [&>div]:grid-cols-[auto_1fr] [&>div]:gap-3 [&_dd]:text-end">
            <div className="border-b border-dashed border-black/20 pb-2">
              <dt className="text-xs font-medium text-[#857467]">نام</dt>
              <dd className="font-bold">{values.name || 'نام فروشگاه'}</dd>
            </div>
            <div className="border-b border-dashed border-black/20 pb-2">
              <dt className="text-xs font-medium text-[#857467]">تلفن</dt>
              <dd className="font-bold">
                <bdi dir="ltr">{persianDigits(values.phone || '—')}</bdi>
              </dd>
            </div>
            <div className="border-b border-dashed border-black/20 pb-2">
              <dt className="text-xs font-medium text-[#857467]">نشانی</dt>
              <dd className="whitespace-pre-wrap font-bold">
                {values.address || 'نشانی کامل فروشگاه'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#857467]">کد پستی</dt>
              <dd className="font-bold">
                <bdi dir="ltr">{persianDigits(values.postalCode || '—')}</bdi>
              </dd>
            </div>
          </dl>
        </section>
        <p className="text-sm leading-8 text-[#857467]">
          {configured
            ? 'مشخصات فروشندهٔ فاکتور و فرستندهٔ لیبل از همین اطلاعات خوانده می‌شوند.'
            : 'اطلاعات فروشگاه هنوز تکمیل نشده است؛ مشخصات و کد پستی را بررسی و ذخیره کنید.'}
        </p>
        <p className="border-t border-dashed border-[#dbc390] pt-4 text-xs leading-7 text-[#857467]">
          مشخصات گیرنده و اقلام همچنان از خود سفارش خوانده می‌شوند. این تنظیم، مبلغ و نشانی سفارش‌ها
          را تغییر نمی‌دهد.
        </p>
      </aside>
    </div>
  );
}
export default function StoreInformation() {
  const query = useAdminQuery(AdminStoreInformationDocument, {});
  return (
    <>
      <PageHeading icon="home" description="مشخصات فروشندهٔ فاکتور و فرستندهٔ مرسوله، در یک جا.">
        اطلاعات فروشگاه
      </PageHeading>
      {query.data ? (
        <StoreForm
          key={query.data.adminStoreInformation.updatedAt ?? 'default'}
          initial={query.data.adminStoreInformation}
          refresh={query.refresh}
        />
      ) : (
        <DataState error={query.error} retry={query.refresh} />
      )}
    </>
  );
}
