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
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const { message, modal } = App.useApp();
  const values = { ...initial, ...Form.useWatch([], form) };
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
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
            form.setFieldsValue(parsed.data);
            void message.success('اطلاعات فروشگاه ذخیره شد و روی لیبل‌ها استفاده می‌شود.');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
          } finally {
            lock.current = false;
            setPending(false);
          }
        }}
        className="rounded-[24px] border border-[#e8ded1] bg-white !p-5 shadow-sm sm:!p-7"
      >
        <h2 className="mb-2 text-lg font-extrabold">مشخصات فروشگاه و فرستنده</h2>
        <p className="mb-6 text-sm leading-8 text-[#857467]">
          این اطلاعات یک‌بار ثبت می‌شود و در بخش فرستندهٔ لیبل سفارش‌ها قرار می‌گیرد.
        </p>
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
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            label="شماره تماس فروشگاه"
            name="phone"
            rules={[{ required: true, whitespace: true, message: 'شماره تماس را وارد کنید.' }]}
          >
            <Input
              maxLength={30}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              prefix={<AdminIcon name="phone" width={18} />}
            />
          </Form.Item>
          <Form.Item
            label="کد پستی فروشگاه"
            name="postalCode"
            rules={[{ required: true, message: 'کد پستی ده‌رقمی را وارد کنید.' }]}
          >
            <Input maxLength={10} dir="ltr" inputMode="numeric" autoComplete="postal-code" />
          </Form.Item>
        </div>
        <Form.Item
          label="نشانی کامل فروشگاه"
          name="address"
          rules={[
            { required: true, whitespace: true, message: 'نشانی کامل فروشگاه را وارد کنید.' },
          ]}
          extra="استان، شهر، خیابان و پلاک را کامل بنویسید."
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
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
          type="primary"
          htmlType="submit"
          loading={pending}
          icon={<AdminIcon name="check" />}
          className="!mt-3 !h-[52px] !w-full !font-bold"
        >
          ذخیره اطلاعات فروشگاه
        </Button>
      </Form>
      <aside
        data-store-preview
        className="space-y-5 rounded-[24px] border border-[#dbc390] bg-[#fcf8ef] p-5 sm:p-6 xl:sticky xl:top-36"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#f4e8d3] text-[#701e2a]">
            <AdminIcon name="print" />
          </span>
          <h2 className="text-lg font-extrabold">پیش‌نمایش فرستنده روی لیبل</h2>
        </div>
        <section className="overflow-hidden rounded-2xl border-2 border-black bg-white text-black">
          <h3 className="flex items-center gap-2 bg-black px-4 py-2 font-extrabold text-white">
            <AdminIcon name="home" width={19} />
            فرستنده
          </h3>
          <dl className="space-y-3 p-4 text-sm leading-7 [overflow-wrap:anywhere]">
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
            ? 'اطلاعات ثبت‌شده، منبع فرستنده برای چاپ لیبل‌هاست. تغییرات این فرم پس از ذخیره اعمال می‌شود.'
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
      <PageHeading
        icon="home"
        description="اطلاعات فرستندهٔ فروشگاه برای استفادهٔ خودکار در لیبل سفارش‌ها."
      >
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
