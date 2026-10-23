import { useRef, useState } from 'react';
import { Alert, Button, Form, InputNumber, Switch } from 'antd';
import { shippingSettingsSchema, calculateStoreShipping } from '@behjati/shared/shipping';
import { shippingMethodLabels } from '@behjati/shared/sales';
import {
  AdminShippingSettingsDocument,
  SaveAdminShippingSettingsDocument,
  type ShippingSettingsFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import AdminIcon from '../components/AdminIcon';
import { Money, MoneyInput } from '../components/Money';
import DataState from '../components/DataState';
import PageHeading from '../components/PageHeading';
function ShippingForm({
  settings,
  onSaved,
}: {
  settings: ShippingSettingsFieldsFragment;
  onSaved: () => void;
}) {
  const [form] = Form.useForm();
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const [free, setFree] = useState(settings.freeShippingThreshold !== null);
  const [testWeight, setTestWeight] = useState<number | null>(2500),
    [testAmount, setTestAmount] = useState<number | null>(0);
  const methods = Form.useWatch('methods', form) ?? settings.methods;
  const threshold = Form.useWatch('freeShippingThreshold', form) ?? settings.freeShippingThreshold;
  const values = { methods, freeShippingThreshold: free ? threshold : null };
  const parsed = shippingSettingsSchema.safeParse(values);
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
      <Form
        form={form}
        layout="vertical"
        initialValues={{ ...settings, freeShippingThreshold: settings.freeShippingThreshold ?? 0 }}
        disabled={pending}
        onFinish={async () => {
          if (lock.current) return;
          setError('');
          const p = shippingSettingsSchema.safeParse(values);
          if (!p.success) {
            setError(p.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
            return;
          }
          lock.current = true;
          setPending(true);
          try {
            await adminRequest(SaveAdminShippingSettingsDocument, {
              input: p.data,
              expectedUpdatedAt: settings.updatedAt,
            });
            onSaved();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
          } finally {
            lock.current = false;
            setPending(false);
          }
        }}
      >
        <section className="mb-5 rounded-[24px] border border-[#e8ded1] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">ارسال رایگان</h2>
              <p className="mt-2 text-sm leading-7 text-[#857467]">
                با رسیدن مبلغ محصولات پس از تخفیف به این حد، هزینهٔ روش‌های مشمول صفر می‌شود.
              </p>
            </div>
            <Switch aria-label="فعال‌سازی ارسال رایگان" checked={free} onChange={setFree} />
          </div>
          {free && (
            <Form.Item
              label="حداقل خرید برای ارسال رایگان (ریال)"
              name="freeShippingThreshold"
              rules={[{ type: 'number', min: 1, required: true, message: 'مبلغ مثبت وارد کنید.' }]}
            >
              <MoneyInput />
            </Form.Item>
          )}
          <p className="text-xs leading-7 text-[#857467]">
            هزینهٔ ارسال در حداقل خرید حساب نمی‌شود. فاکتورهای قبلی و سفارش‌های دستی تغییر نمی‌کنند.
          </p>
        </section>
        <div className="space-y-4">
          {methods.map((rule: ShippingSettingsFieldsFragment['methods'][number], index: number) => (
            <section
              key={rule.method}
              data-shipping-rule={rule.method}
              className="rounded-[24px] border border-[#e8ded1] bg-white p-5 shadow-sm sm:p-6"
            >
              <header className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-lg font-extrabold">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#f4e8d3] text-[#701e2a]">
                    <AdminIcon name="truck" />
                  </span>
                  {shippingMethodLabels[rule.method]}
                </h2>
                <Form.Item
                  name={['methods', index, 'enabled']}
                  valuePropName="checked"
                  className="!mb-0"
                >
                  <Switch aria-label={`فعال‌سازی ${shippingMethodLabels[rule.method]}`} />
                </Form.Item>
              </header>
              <Form.Item name={['methods', index, 'method']} hidden>
                <input />
              </Form.Item>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Form.Item
                  name={['methods', index, 'baseCost']}
                  label={`هزینهٔ پایهٔ ${shippingMethodLabels[rule.method]} (ریال)`}
                  rules={[{ required: true }]}
                  extra="برای یک کیلوگرم اول کل بسته"
                >
                  <MoneyInput disabled={pending || !rule.enabled} />
                </Form.Item>
                <Form.Item
                  name={['methods', index, 'additionalKgCost']}
                  label={`هر کیلو اضافهٔ ${shippingMethodLabels[rule.method]} (ریال)`}
                  rules={[{ required: true }]}
                  extra="هر کیلو اضافهٔ شروع‌شده، یک کیلو حساب می‌شود"
                >
                  <MoneyInput disabled={pending || !rule.enabled} />
                </Form.Item>
              </div>
              <Form.Item
                name={['methods', index, 'freeShippingEligible']}
                label="مشمول شرط ارسال رایگان"
                valuePropName="checked"
                className="!mb-0"
              >
                <Switch disabled={pending || !rule.enabled || !free} />
              </Form.Item>
            </section>
          ))}
        </div>
        {error && (
          <Alert
            role="alert"
            className="!mt-5"
            type="error"
            title={error}
            action={
              <Button disabled={pending} onClick={onSaved}>
                دریافت تنظیمات جدید
              </Button>
            }
          />
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={pending}
          className="!mt-5 !h-[52px] !w-full !font-bold"
          icon={<AdminIcon name="shield" />}
        >
          ذخیرهٔ تنظیمات ارسال
        </Button>
      </Form>
      <aside
        data-shipping-preview
        className="space-y-5 rounded-[24px] border border-[#dbc390] bg-[#fcf8ef] p-5 xl:sticky xl:top-36"
      >
        <h2 className="text-lg font-extrabold">محاسبهٔ آزمایشی سبد</h2>
        <p className="text-sm leading-8 text-[#857467]">
          برای کل سفارش فقط یک هزینه محاسبه می‌شود؛ تعداد محصولات، هزینهٔ پایه را تکرار نمی‌کند.
        </p>
        <label className="block text-sm font-semibold">
          وزن کل بسته (گرم)
          <InputNumber
            aria-label="وزن پیش‌نمایش ارسال"
            value={testWeight}
            onChange={setTestWeight}
            min={1}
            max={1000000}
            precision={0}
            className="!mt-2 !w-full"
          />
        </label>
        <label className="block text-sm font-semibold">
          جمع محصولات پس از تخفیف (ریال)
          <div className="mt-2">
            <MoneyInput id="shipping-preview-amount" value={testAmount} onChange={setTestAmount} />
          </div>
        </label>
        <div className="space-y-3">
          {methods
            .filter((r: ShippingSettingsFieldsFragment['methods'][number]) => r.enabled)
            .map((r: ShippingSettingsFieldsFragment['methods'][number]) => {
              let result;
              try {
                if (parsed.success && testWeight && testAmount !== null)
                  result = calculateStoreShipping(
                    [{ weight: 'بسته', shippingWeightGrams: testWeight, quantity: 1 }],
                    parsed.data,
                    r.method,
                    testAmount,
                  );
              } catch {
                /* Invalid draft has no misleading price. */
              }
              return (
                <div
                  key={r.method}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8ded1] bg-white p-4"
                >
                  <span className="text-sm font-bold">{shippingMethodLabels[r.method]}</span>
                  <span className="font-extrabold text-[#701e2a]">
                    {result ? (
                      result.cost === 0 ? (
                        'رایگان'
                      ) : (
                        <Money compact amount={result.cost} />
                      )
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              );
            })}
        </div>
        <p className="border-t border-dashed border-[#dbc390] pt-4 text-xs leading-8 text-[#857467]">
          فرمول: هزینهٔ پایه + تعداد کیلوهای اضافه × نرخ هر کیلو. این مبالغ تعرفهٔ فروشگاه‌اند و
          استعلام زنده از شرکت حمل نیستند.
        </p>
      </aside>
    </div>
  );
}
export default function Shipping() {
  const query = useAdminQuery(AdminShippingSettingsDocument, {});
  return (
    <>
      <PageHeading icon="truck" description="تعرفهٔ کل سبد، روش‌های ارسال و حداقل خرید رایگان.">
        مدیریت ارسال
      </PageHeading>
      {query.data ? (
        <ShippingForm settings={query.data.adminShippingSettings} onSaved={query.refresh} />
      ) : (
        <DataState error={query.error} retry={query.refresh} />
      )}
    </>
  );
}
