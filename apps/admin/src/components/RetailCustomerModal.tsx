import { useState } from 'react';
import { Alert, Button, Form, Input, Modal, Radio } from 'antd';
import { adminCustomerInputSchema } from '@behjati/shared/admin';
import { CreateAdminCustomerDocument } from '../generated/graphql';
import { adminRequest } from '../lib/client';
export default function RetailCustomerModal({
  onClose,
  onSaved,
  defaultChannel = 'IN_PERSON',
}: {
  onClose: () => void;
  onSaved: (id: string) => void;
  defaultChannel?: 'IN_PERSON' | 'INSTAGRAM';
}) {
  const [form] = Form.useForm();
  const source = Form.useWatch('salesChannel', form) ?? defaultChannel;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal
      open
      title="افزودن مشتری"
      footer={null}
      onCancel={() => {
        if (!pending) onClose();
      }}
      destroyOnHidden
    >
      <Form<{
        firstName: string;
        lastName: string;
        phone: string;
        salesChannel: 'IN_PERSON' | 'INSTAGRAM';
        address: Record<string, string>;
      }>
        form={form}
        layout="vertical"
        initialValues={{ salesChannel: defaultChannel, lastName: '' }}
        onFinish={async (values) => {
          const parsed = adminCustomerInputSchema.safeParse({
            ...values,
            address:
              values.salesChannel === 'INSTAGRAM'
                ? {
                    ...values.address,
                    title: 'نشانی مشتری',
                    recipientName: [values.firstName, values.lastName].filter(Boolean).join(' '),
                    recipientPhone: values.phone,
                    isDefault: true,
                  }
                : undefined,
          });
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'اطلاعات مشتری معتبر نیست.');
            return;
          }
          setPending(true);
          setError('');
          try {
            const d = await adminRequest(CreateAdminCustomerDocument, { input: parsed.data });
            onSaved(d.createAdminCustomer.id);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ثبت انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <Form.Item label="نام" name="firstName" rules={[{ required: true }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item label="نام خانوادگی" name="lastName">
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item label="موبایل" name="phone" rules={[{ required: true }]}>
          <Input inputMode="tel" dir="ltr" maxLength={20} />
        </Form.Item>
        <Form.Item label="منبع آشنایی / خرید" name="salesChannel">
          <Radio.Group
            options={[
              { value: 'IN_PERSON', label: 'حضوری' },
              { value: 'INSTAGRAM', label: 'اینستاگرام' },
            ]}
          />
        </Form.Item>
        {source === 'INSTAGRAM' && (
          <div className="grid gap-x-3 sm:grid-cols-2">
            {[
              ['province', 'استان'],
              ['city', 'شهر'],
              ['postalAddress', 'آدرس کامل'],
              ['postalCode', 'کد پستی'],
            ].map(([name, label]) => (
              <Form.Item<{ address: Record<string, string> }>
                key={name}
                label={label}
                name={['address', name!]}
                rules={[{ required: true }]}
              >
                <Input
                  maxLength={name === 'postalAddress' ? 1000 : 100}
                  inputMode={name === 'postalCode' ? 'numeric' : undefined}
                />
              </Form.Item>
            ))}
          </div>
        )}
        {error && <Alert type="error" title={error} role="alert" />}
        <Button htmlType="submit" type="primary" loading={pending}>
          ثبت مشتری
        </Button>
      </Form>
    </Modal>
  );
}
