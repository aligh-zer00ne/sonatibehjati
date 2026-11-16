import { useRef, useState } from 'react';
import { Alert, App, Button, Form, Input, InputNumber, Switch } from 'antd';
import {
  shippingSettingsSchema,
  calculateStoreShipping,
  maxShippingMethods,
  newShippingMethodCode,
} from '@behjati/shared/shipping';
import { isBuiltInShippingMethod } from '@behjati/shared/sales';
import { invalidateShippingMethods } from '../hooks/useShippingMethods';
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
type Rule = ShippingSettingsFieldsFragment['methods'][number];
function ShippingForm({
  settings,
  onSaved,
}: {
  settings: ShippingSettingsFieldsFragment;
  onSaved: () => void;
}) {
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const [free, setFree] = useState(settings.freeShippingThreshold !== null);
  const [testWeight, setTestWeight] = useState<number | null>(2500),
    [testAmount, setTestAmount] = useState<number | null>(0);
  const methods = Form.useWatch('methods', { form, preserve: true }) ?? settings.methods;
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
            invalidateShippingMethods();
            onSaved();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
          } finally {
            lock.current = false;
            setPending(false);
          }
        }}
      >
        <section className="mb-5 rounded-[24px] border border-[#d7dce2] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">ارسال رایگان</h2>
              <p className="mt-2 text-sm leading-7 text-[#6b7481]">
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
          <p className="text-xs leading-7 text-[#6b7481]">
            هزینهٔ ارسال در حداقل خرید حساب نمی‌شود. فاکتورهای قبلی و سفارش‌های دستی تغییر نمی‌کنند.
          </p>
        </section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">روش‌های ارسال</h2>
            <p className="mt-1 text-sm leading-7 text-[#6b7481]">
              پست، چاپار، تیپاکس و پیک پیش‌فرض‌اند؛ روش دلخواه فروشگاه را هم اضافه کنید.
            </p>
          </div>
          <Button
            data-add-shipping-method
            icon={<AdminIcon name="plus" />}
            disabled={pending || methods.length >= maxShippingMethods}
            onClick={() => {
              const current: Rule[] = form.getFieldValue('methods') ?? [];
              form.setFieldValue('methods', [
                ...current,
                {
                  method: newShippingMethodCode(current.map((item) => item.method)),
                  label: '',
                  enabled: true,
                  baseCost: 0,
                  additionalKgCost: 0,
                  freeShippingEligible: true,
                },
              ]);
            }}
          >
            افزودن روش ارسال
          </Button>
        </div>
        <div className="space-y-4">
          {methods.map((rule: Rule, index: number) => {
            const builtIn = isBuiltInShippingMethod(rule.method);
            const name = rule.label?.trim() || 'روش جدید';
            return (
              <section
                key={rule.method}
                data-shipping-rule={rule.method}
                className="rounded-[24px] border border-[#d7dce2] bg-white p-5 shadow-sm sm:p-6"
              >
                <header className="mb-5 flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-lg font-extrabold">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#dce3eb] text-[#2c5282]">
                      <AdminIcon name="truck" />
                    </span>
                    <span className="min-w-0">
                      <span className="block">{name}</span>
                      <span className="block text-xs font-semibold text-[#6b7481]">
                        {builtIn ? 'روش پیش‌فرض' : 'روش اختصاصی فروشگاه'}
                      </span>
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {!builtIn && (
                      <Button
                        danger
                        type="text"
                        aria-label={`حذف ${name}`}
                        icon={<AdminIcon name="trash" />}
                        onClick={() =>
                          modal.confirm({
                            title: `حذف «${name}»؟`,
                            content:
                              'پس از ذخیره، این روش از انتخاب‌ها حذف می‌شود. اگر در سفارشی استفاده شده باشد، به‌جای حذف غیرفعالش کنید.',
                            okText: 'حذف روش',
                            okButtonProps: { danger: true },
                            cancelText: 'انصراف',
                            onOk: () => {
                              const current: Rule[] = form.getFieldValue('methods') ?? [];
                              form.setFieldValue(
                                'methods',
                                current.filter((item) => item.method !== rule.method),
                              );
                            },
                          })
                        }
                      />
                    )}
                    <Form.Item
                      name={['methods', index, 'enabled']}
                      valuePropName="checked"
                      className="!mb-0"
                    >
                      <Switch aria-label={`فعال‌سازی ${name}`} />
                    </Form.Item>
                  </div>
                </header>
                <Form.Item name={['methods', index, 'method']} hidden>
                  <input />
                </Form.Item>
                <Form.Item
                  name={['methods', index, 'label']}
                  hidden={builtIn}
                  label="نام روش ارسال"
                  rules={[
                    { required: true, min: 2, max: 40, message: 'نام ۲ تا ۴۰ نویسه‌ای وارد کنید.' },
                  ]}
                >
                  <Input maxLength={40} placeholder="مثلاً باربری یا اسنپ‌باکس" />
                </Form.Item>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Form.Item
                    name={['methods', index, 'baseCost']}
                    label={`هزینهٔ پایهٔ ${name} (ریال)`}
                    rules={[{ required: true }]}
                    extra="برای یک کیلوگرم اول کل بسته"
                  >
                    <MoneyInput disabled={pending || !rule.enabled} />
                  </Form.Item>
                  <Form.Item
                    name={['methods', index, 'additionalKgCost']}
                    label={`هر کیلو اضافهٔ ${name} (ریال)`}
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
            );
          })}
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
        className="space-y-5 rounded-[24px] border border-[#96bbc1] bg-[#f3f5f8] p-5 xl:sticky xl:top-36"
      >
        <h2 className="text-lg font-extrabold">محاسبهٔ آزمایشی سبد</h2>
        <p className="text-sm leading-8 text-[#6b7481]">
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
            .filter((r: Rule) => r.enabled)
            .map((r: Rule) => {
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d7dce2] bg-white p-4"
                >
                  <span className="text-sm font-bold">{r.label || 'روش جدید'}</span>
                  <span className="font-extrabold text-[#2c5282]">
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
        <p className="border-t border-dashed border-[#96bbc1] pt-4 text-xs leading-8 text-[#6b7481]">
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
