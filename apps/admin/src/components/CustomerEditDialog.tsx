import { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Checkbox, Form, Input } from 'antd';
import { adminCustomerEditSchema } from '@behjati/shared/admin';
import {
  AdminEditableCustomerDocument,
  EditAdminCustomerDocument,
  type AdminEditableCustomerFieldsFragment,
  type AdminCustomerEditInput,
} from '../generated/graphql';
import { adminRequest, AdminRequestError } from '../lib/client';
import { useAdminQuery } from '../hooks/useAdminQuery';
import RecordDialog from './RecordDialog';
import DataState from './DataState';
import AdminIcon from './AdminIcon';

function Editor({
  initial,
  onClose,
  onSaved,
  refresh,
}: {
  initial: AdminEditableCustomerFieldsFragment;
  onClose: () => void;
  onSaved: () => void;
  refresh: () => void;
}) {
  const [form] = Form.useForm();
  const [hasAddress, setHasAddress] = useState(!!initial.defaultAddress);
  const [pending, setPending] = useState(false),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState('');
  const [submission, setSubmission] = useState<AdminCustomerEditInput | null>(null);
  const requestId = useRef(crypto.randomUUID()),
    lock = useRef(false);
  const { modal, message } = App.useApp();
  const requestClose = () => {
    if (pending) return;
    if (dirty || submission)
      modal.confirm({
        title: 'تغییرات مشتری ذخیره نشده است',
        content: 'پنجره بدون ذخیره بسته شود؟',
        okText: 'بستن بدون ذخیره',
        cancelText: 'ادامه ویرایش',
        onOk: onClose,
      });
    else onClose();
  };
  const save = async (raw: Record<string, unknown>) => {
    if (lock.current) return;
    let input = submission;
    if (!input) {
      const parsed = adminCustomerEditSchema.safeParse({
        id: initial.id,
        expectedRevision: initial.editRevision,
        requestId: requestId.current,
        firstName: raw.firstName,
        lastName: raw.lastName ?? '',
        phone: raw.phone,
        email: raw.email ?? '',
        address: hasAddress
          ? {
              ...Object.fromEntries(
                [
                  'recipientName',
                  'recipientPhone',
                  'province',
                  'city',
                  'postalCode',
                  'postalAddress',
                ].map((key) => [key, (raw.address as Record<string, unknown>)?.[key]]),
              ),
              title: initial.defaultAddress?.title || 'نشانی مشتری',
              isDefault: true,
              latitude: initial.defaultAddress?.latitude ?? null,
              longitude: initial.defaultAddress?.longitude ?? null,
            }
          : null,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
        return;
      }
      input = parsed.data;
      setSubmission(input);
    }
    lock.current = true;
    setPending(true);
    setError('');
    try {
      await adminRequest(EditAdminCustomerDocument, { input });
      void message.success('اطلاعات مشتری اصلاح شد.');
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
      if (
        e instanceof AdminRequestError &&
        ['BAD_USER_INPUT', 'REQUEST_CONFLICT', 'NOT_FOUND', 'FORBIDDEN'].includes(e.code)
      )
        setSubmission(null);
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  return (
    <RecordDialog
      title="ویرایش مشتری"
      subtitle={[initial.firstName, initial.lastName].filter(Boolean).join(' ') || initial.phone}
      icon="person"
      busy={pending}
      onClose={requestClose}
      width={760}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          firstName: initial.firstName ?? '',
          lastName: initial.lastName ?? '',
          phone: initial.phone,
          email: initial.email ?? '',
          address: initial.defaultAddress ?? {
            recipientName: [initial.firstName, initial.lastName].filter(Boolean).join(' '),
            recipientPhone: initial.phone,
          },
        }}
        disabled={pending || !!submission}
        onValuesChange={() => setDirty(true)}
        onFinish={save}
      >
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="firstName"
            label="نام"
            rules={[{ required: true, message: 'نام مشتری لازم است.' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="lastName" label="نام خانوادگی">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="موبایل مشتری"
            rules={[{ required: true, message: 'موبایل مشتری لازم است.' }]}
          >
            <Input inputMode="tel" dir="ltr" maxLength={20} />
          </Form.Item>
          <Form.Item name="email" label="ایمیل (اختیاری)">
            <Input type="email" dir="ltr" maxLength={254} />
          </Form.Item>
        </div>
        {!initial.defaultAddress && (
          <Checkbox
            checked={hasAddress}
            disabled={pending || !!submission}
            onChange={(e) => {
              setHasAddress(e.target.checked);
              setDirty(true);
            }}
          >
            افزودن نشانی مشتری
          </Checkbox>
        )}
        {hasAddress && (
          <section className="mt-2 rounded-2xl border border-[#e8ded1] bg-[#faf6ee] p-3">
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <AdminIcon name="pin" />
              نشانی مشتری
            </h3>
            <div className="grid gap-x-3 sm:grid-cols-2">
              {[
                ['recipientName', 'نام گیرنده'],
                ['recipientPhone', 'موبایل گیرنده'],
                ['province', 'استان'],
                ['city', 'شهر'],
                ['postalCode', 'کد پستی'],
                ['postalAddress', 'نشانی کامل'],
              ].map(([key, label]) => (
                <Form.Item
                  key={key}
                  name={['address', key!]}
                  label={label}
                  rules={[{ required: true, message: `${label} لازم است.` }]}
                >
                  <Input maxLength={key === 'postalAddress' ? 1000 : 100} />
                </Form.Item>
              ))}
            </div>
          </section>
        )}
        <p className="my-3 text-[13px] leading-6 text-[#796653]">
          نشانی سفارش‌های قبلی جداگانه ثبت شده است؛ برای اصلاح آن‌ها، خود سفارش را ویرایش کنید.
        </p>
        {error && (
          <Alert
            type="error"
            role="alert"
            title={error}
            className="!mb-3"
            action={
              <Button
                disabled={pending}
                onClick={() =>
                  modal.confirm({
                    title: 'ویرایش‌های فعلی کنار گذاشته شوند؟',
                    okText: 'دریافت نسخه جدید',
                    cancelText: 'ادامه ویرایش',
                    onOk: refresh,
                  })
                }
              >
                نسخه جدید
              </Button>
            }
          />
        )}
        <div className="sticky -bottom-3 flex flex-wrap gap-2 border-t border-[#e8ded1] bg-white/95 pt-3 pb-2 backdrop-blur-sm">
          <Button
            type="primary"
            htmlType="submit"
            disabled={!initial.editRevision || !!submission}
            loading={pending}
          >
            ذخیره اصلاحات مشتری
          </Button>
          {submission && (
            <Button disabled={pending} onClick={() => void save({})}>
              بررسی و تلاش دوباره
            </Button>
          )}
          <Button disabled={pending} onClick={requestClose}>
            انصراف
          </Button>
        </div>
      </Form>
    </RecordDialog>
  );
}
export default function CustomerEditDialog({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [trigger] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  useEffect(
    () => () => {
      requestAnimationFrame(() => {
        if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      });
    },
    [trigger],
  );
  const query = useAdminQuery(AdminEditableCustomerDocument, { id });
  return query.data ? (
    <Editor
      key={query.data.adminUser.editRevision}
      initial={query.data.adminUser}
      onClose={onClose}
      onSaved={onSaved}
      refresh={query.refresh}
    />
  ) : (
    <RecordDialog title="ویرایش مشتری" icon="person" onClose={onClose}>
      <DataState error={query.error} retry={query.refresh} />
    </RecordDialog>
  );
}
